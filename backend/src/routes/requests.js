const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../migrate');
const { authenticate, authorize, auditLog } = require('../middleware/auth');

const router = express.Router();

function parseJsonSafe(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (_err) {
    return fallback;
  }
}

function computeNextReviewDate(baseDate, frequency) {
  const date = new Date(baseDate);
  if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (frequency === 'quarterly') {
    date.setMonth(date.getMonth() + 3);
  } else {
    date.setMonth(date.getMonth() + 6);
  }
  return date.toISOString().split('T')[0];
}

function decodeBase64Payload(payload = '') {
  const raw = String(payload || '');
  const base64 = raw.includes(',') ? raw.split(',').pop() : raw;
  return Buffer.from(base64, 'base64');
}

function extractTextFromUpload(fileName = '', mimeType = '', payload = '') {
  if (!payload) return '';
  const lowerMime = String(mimeType || '').toLowerCase();
  const lowerFileName = String(fileName || '').toLowerCase();
  const textLike = ['text/plain', 'application/json', 'text/csv', 'text/markdown'];
  const textExtensions = ['.txt', '.csv', '.json', '.md', '.log'];

  const isTextLike = textLike.includes(lowerMime)
    || textExtensions.some((ext) => lowerFileName.endsWith(ext));

  if (!isTextLike) {
    return '';
  }

  try {
    const bytes = decodeBase64Payload(payload);
    return bytes.toString('utf8').replace(/\u0000/g, '').trim();
  } catch (_err) {
    return '';
  }
}

function parseReferenceResults(text = '') {
  const normalized = String(text || '').replace(/\r/g, '\n');
  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);

  const categoryRules = [
    { category: 'legal_regulatory_breach', label: 'Legal / Regulatory Breach', keywords: ['breach', 'regulatory', 'violation', 'non-compliance', 'sanction'] },
    { category: 'integrity_concern', label: 'Integrity Concern', keywords: ['integrity', 'dishonest', 'fraud', 'misrepresentation', 'ethics'] },
    { category: 'misconduct_report', label: 'Misconduct Report', keywords: ['misconduct', 'complaint', 'report filed', 'reportable'] },
    { category: 'disciplinary_action', label: 'Disciplinary Action', keywords: ['disciplinary', 'warning', 'suspension', 'terminated', 'dismissed'] },
    { category: 'ongoing_investigation', label: 'Ongoing Investigation', keywords: ['investigation', 'pending review', 'ongoing case', 'under investigation'] },
  ];

  const severityByText = (value = '') => {
    const v = value.toLowerCase();
    if (/(material|severe|high|critical)/.test(v)) return 'material';
    if (/(minor|low|limited|non-material)/.test(v)) return 'non_material';
    return 'under_review';
  };

  const findings = [];
  lines.forEach((line) => {
    const lower = line.toLowerCase();
    const matchedRule = categoryRules.find((rule) => rule.keywords.some((kw) => lower.includes(kw)));
    if (!matchedRule) return;

    findings.push({
      category: matchedRule.category,
      category_label: matchedRule.label,
      severity: severityByText(lower),
      description: line,
    });
  });

  const summary = {
    total_findings: findings.length,
    material_count: findings.filter((f) => f.severity === 'material').length,
    non_material_count: findings.filter((f) => f.severity === 'non_material').length,
    under_review_count: findings.filter((f) => f.severity === 'under_review').length,
  };

  return {
    extracted_text_length: normalized.length,
    findings,
    summary,
  };
}

function addCaseFileEntry({ requestId, entryType, title, metadata = {}, createdByUserId = null }) {
  const caseFileId = uuidv4();
  db.prepare(`
    INSERT INTO request_case_files (case_file_id, request_id, entry_type, title, metadata, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(caseFileId, requestId, entryType, title, JSON.stringify(metadata || {}), createdByUserId);
  return caseFileId;
}

const STATUS_FLOW = {
  draft: ['consent_obtained', 'cancelled'],
  consent_obtained: ['sent', 'cancelled'],
  sent: ['acknowledged', 'cancelled'],
  acknowledged: ['in_progress', 'cancelled'],
  in_progress: ['response_provided', 'cancelled'],
  response_provided: ['reviewed', 'cancelled'],
  reviewed: ['closed'],
  closed: [],
  cancelled: [],
};

// GET /api/requests
router.get('/', authenticate, (req, res) => {
  try {
    const { status, sector, institution_id, page = 1, limit = 20 } = req.query;
    let sql = `
      SELECT rr.*,
        ri.name_en as recruiting_institution_name,
        rpi.name_en as providing_institution_name,
        i.name_en_surname || ' ' || i.name_en_given as individual_name,
        i.name_zh as individual_name_zh
      FROM reference_requests rr
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      LEFT JOIN individuals i ON rr.individual_id = i.individual_id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (['hr_initiator', 'compliance_reviewer', 'senior_approver', 'institution_admin'].includes(req.user.role)) {
      sql += ' AND (rr.recruiting_institution_id = ? OR rr.reference_providing_institution_id = ?)';
      params.push(req.user.institution_id, req.user.institution_id);
    } else if (['regulator_admin', 'regulator_viewer'].includes(req.user.role) && req.user.regulator) {
      sql += ` AND (ri.regulators LIKE ? OR rpi.regulators LIKE ?)`;
      params.push(`%${req.user.regulator}%`, `%${req.user.regulator}%`);
    }

    if (status) { sql += ' AND rr.status = ?'; params.push(status); }
    if (sector) { sql += ' AND rr.request_sector = ?'; params.push(sector); }
    if (institution_id) {
      sql += ' AND (rr.recruiting_institution_id = ? OR rr.reference_providing_institution_id = ?)';
      params.push(institution_id, institution_id);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const countSql = sql.replace(/SELECT rr\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const total = db.prepare(countSql).get(...params).total;

    sql += ' ORDER BY rr.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const rows = db.prepare(sql).all(...params);
    const requests = rows.map((row) => ({
      ...row,
      integration_snapshot: parseJsonSafe(row.integration_snapshot, null),
    }));
    res.json({ requests, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/monitoring - monitoring schedules with role-based visibility
router.get('/monitoring', authenticate, (req, res) => {
  try {
    const { status = 'active' } = req.query;
    let sql = `
      SELECT om.*, rr.individual_id, rr.request_sector, rr.status as request_status, rr.integration_last_checked_at,
        i.name_en_surname || ' ' || i.name_en_given as individual_name,
        i.name_zh as individual_name_zh,
        ri.name_en as recruiting_institution_name,
        rpi.name_en as providing_institution_name
      FROM ongoing_monitoring om
      JOIN reference_requests rr ON om.request_id = rr.request_id
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      LEFT JOIN individuals i ON rr.individual_id = i.individual_id
      WHERE 1=1
    `;
    const params = [];

    if (['hr_initiator', 'compliance_reviewer', 'senior_approver', 'institution_admin'].includes(req.user.role)) {
      sql += ' AND (rr.recruiting_institution_id = ? OR rr.reference_providing_institution_id = ?)';
      params.push(req.user.institution_id, req.user.institution_id);
    } else if (['regulator_admin', 'regulator_viewer'].includes(req.user.role) && req.user.regulator) {
      sql += ` AND (ri.regulators LIKE ? OR rpi.regulators LIKE ?)`;
      params.push(`%${req.user.regulator}%`, `%${req.user.regulator}%`);
    }

    if (status && status !== 'all') {
      sql += ' AND om.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY om.next_review_date ASC';
    const schedules = db.prepare(sql).all(...params).map((row) => ({
      ...row,
      scope: parseJsonSafe(row.scope, {}),
    }));

    res.json({ schedules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests/monitoring/configure - configure monitoring for selected individuals
router.post('/monitoring/configure', authenticate, authorize('hr_initiator', 'compliance_reviewer', 'institution_admin', 'platform_admin'), auditLog('ongoing_monitoring', 'create'), (req, res) => {
  try {
    const {
      individual_ids,
      review_frequency = 'quarterly',
      next_review_date,
      scan_scope = {},
      notify = {},
      notes,
    } = req.body || {};

    const ids = Array.isArray(individual_ids)
      ? Array.from(new Set(individual_ids.filter(Boolean)))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ error: 'individual_ids is required' });
    }

    const allowedFrequencies = ['weekly', 'monthly', 'quarterly', 'semi_annual'];
    const frequency = allowedFrequencies.includes(review_frequency) ? review_frequency : 'quarterly';
    const reviewDate = next_review_date || computeNextReviewDate(new Date().toISOString().split('T')[0], frequency);

    const created = [];
    const skipped = [];

    for (const individualId of ids) {
      let sql = `
        SELECT rr.request_id
        FROM reference_requests rr
        LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
        LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
        WHERE rr.individual_id = ?
      `;
      const params = [individualId];

      if (['hr_initiator', 'compliance_reviewer', 'senior_approver', 'institution_admin'].includes(req.user.role)) {
        sql += ' AND (rr.recruiting_institution_id = ? OR rr.reference_providing_institution_id = ?)';
        params.push(req.user.institution_id, req.user.institution_id);
      } else if (['regulator_admin', 'regulator_viewer'].includes(req.user.role) && req.user.regulator) {
        sql += ` AND (ri.regulators LIKE ? OR rpi.regulators LIKE ?)`;
        params.push(`%${req.user.regulator}%`, `%${req.user.regulator}%`);
      }

      sql += ' ORDER BY rr.created_at DESC LIMIT 1';
      const latestRequest = db.prepare(sql).get(...params);

      if (!latestRequest) {
        skipped.push({ individual_id: individualId, reason: 'No accessible reference request found for individual' });
        continue;
      }

      const monitoringId = uuidv4();
      const scope = {
        integrations: Array.isArray(scan_scope.integrations) ? scan_scope.integrations : [],
        regulators: Array.isArray(scan_scope.regulators) ? scan_scope.regulators : [],
        jurisdictions: Array.isArray(scan_scope.jurisdictions) ? scan_scope.jurisdictions : [],
        keyword_rules: Array.isArray(scan_scope.keyword_rules) ? scan_scope.keyword_rules : [],
      };
      const notification = {
        channels: Array.isArray(notify.channels) ? notify.channels : ['in_app'],
        recipients: Array.isArray(notify.recipients) ? notify.recipients : [],
      };

      db.prepare(`
        INSERT INTO ongoing_monitoring (
          monitoring_id, request_id, review_frequency, next_review_date, status, scope, notes, created_by_user_id
        ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?)
      `).run(
        monitoringId,
        latestRequest.request_id,
        frequency,
        reviewDate,
        JSON.stringify({
          ...scope,
          notify: notification,
        }),
        notes || null,
        req.user.user_id,
      );

      created.push({ monitoring_id: monitoringId, request_id: latestRequest.request_id, individual_id: individualId });
    }

    if (created.length === 0) {
      return res.status(400).json({ error: 'No monitoring schedules created', skipped });
    }

    res.status(201).json({ created, skipped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/monitoring/:id/review - mark periodic review completed and roll next date
router.patch('/monitoring/:id/review', authenticate, authorize('hr_initiator', 'compliance_reviewer', 'institution_admin', 'platform_admin'), auditLog('ongoing_monitoring', 'update'), (req, res) => {
  try {
    const schedule = db.prepare(`
      SELECT om.*, rr.recruiting_institution_id, rr.reference_providing_institution_id
      FROM ongoing_monitoring om
      JOIN reference_requests rr ON rr.request_id = om.request_id
      WHERE om.monitoring_id = ?
    `).get(req.params.id);

    if (!schedule) return res.status(404).json({ error: 'Monitoring schedule not found' });

    const isPlatformAdmin = req.user.role === 'platform_admin';
    const ownsSchedule = schedule.recruiting_institution_id === req.user.institution_id || schedule.reference_providing_institution_id === req.user.institution_id;
    if (!isPlatformAdmin && !ownsSchedule) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const reviewDate = new Date().toISOString().split('T')[0];
    const nextReviewDate = computeNextReviewDate(reviewDate, schedule.review_frequency);

    db.prepare(`
      UPDATE ongoing_monitoring
      SET last_review_date = ?, next_review_date = ?, updated_at = datetime('now')
      WHERE monitoring_id = ?
    `).run(reviewDate, nextReviewDate, req.params.id);

    const updated = db.prepare('SELECT * FROM ongoing_monitoring WHERE monitoring_id = ?').get(req.params.id);
    res.json({ ...updated, scope: parseJsonSafe(updated.scope, {}) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/:id
router.get('/:id', authenticate, (req, res) => {
  try {
    const request = db.prepare(`
      SELECT rr.*,
        ri.name_en as recruiting_institution_name,
        ri.name_zh as recruiting_institution_name_zh,
        ri.regulators as recruiting_institution_regulators,
        ri.sectors as recruiting_institution_sectors,
        rpi.name_en as providing_institution_name,
        rpi.name_zh as providing_institution_name_zh,
        rpi.regulators as providing_institution_regulators,
        rpi.sectors as providing_institution_sectors,
        i.hkid_hash,
        i.phone as individual_phone,
        i.name_en_surname, i.name_en_given, i.name_zh as individual_name_zh, i.email as individual_email
      FROM reference_requests rr
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      LEFT JOIN individuals i ON rr.individual_id = i.individual_id
      WHERE rr.request_id = ?
    `).get(req.params.id);

    if (!request) return res.status(404).json({ error: 'Reference request not found' });

    request.integration_snapshot = parseJsonSafe(request.integration_snapshot, null);
    request.recruiting_institution_regulators = parseJsonSafe(request.recruiting_institution_regulators, []);
    request.recruiting_institution_sectors = parseJsonSafe(request.recruiting_institution_sectors, []);
    request.providing_institution_regulators = parseJsonSafe(request.providing_institution_regulators, []);
    request.providing_institution_sectors = parseJsonSafe(request.providing_institution_sectors, []);

    request.regulatory_registrations = db.prepare(`
      SELECT rr.*, i.name_en as institution_name
      FROM regulatory_registrations rr
      LEFT JOIN institutions i ON rr.principal_institution_id = i.institution_id
      WHERE rr.individual_id = ?
      ORDER BY rr.regulator ASC, rr.effective_from DESC
    `).all(request.individual_id);

    request.employment_records = db.prepare(`
      SELECT er.*, i.name_en as institution_name
      FROM employment_records er
      LEFT JOIN institutions i ON er.institution_id = i.institution_id
      WHERE er.individual_id = ?
      ORDER BY er.start_date DESC
    `).all(request.individual_id);

    const recruitingEmployment = request.employment_records.find((er) => er.institution_id === request.recruiting_institution_id && (er.is_current === 1 || er.is_current === true));
    const latestRecruitingEmployment = request.employment_records.find((er) => er.institution_id === request.recruiting_institution_id);
    const providingEmployment = request.employment_records.find((er) => er.institution_id === request.reference_providing_institution_id && (er.is_current === 1 || er.is_current === true));
    const latestProvidingEmployment = request.employment_records.find((er) => er.institution_id === request.reference_providing_institution_id);

    request.target_position_title = (recruitingEmployment || latestRecruitingEmployment || {}).position_title || null;
    request.previous_position_title = (providingEmployment || latestProvidingEmployment || {}).position_title || null;

    // Get conduct information
    request.conduct_information = db.prepare(`
      SELECT ci.*, u.name_en as submitted_by_name
      FROM conduct_information ci
      LEFT JOIN users u ON ci.submitted_by_user_id = u.user_id
      WHERE ci.request_id = ?
    `).all(req.params.id);

    // Get consent
    if (request.consent_id) {
      request.consent = db.prepare('SELECT * FROM consents WHERE consent_id = ?').get(request.consent_id);
    }

    // Get audit trail for this request
    request.audit_trail = db.prepare(`
      SELECT al.*, u.name_en as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.performed_by_user_id = u.user_id
      WHERE al.entity_type = 'reference_request' AND al.entity_id = ?
      ORDER BY al.timestamp DESC
    `).all(req.params.id);

    request.monitoring_schedules = db.prepare(`
      SELECT * FROM ongoing_monitoring
      WHERE request_id = ?
      ORDER BY next_review_date ASC
    `).all(req.params.id).map((row) => ({
      ...row,
      scope: parseJsonSafe(row.scope, {}),
    }));

    request.case_file_entries = db.prepare(`
      SELECT rcf.*, u.name_en as created_by_name
      FROM request_case_files rcf
      LEFT JOIN users u ON rcf.created_by_user_id = u.user_id
      WHERE rcf.request_id = ?
      ORDER BY rcf.created_at DESC
    `).all(req.params.id).map((row) => ({
      ...row,
      metadata: parseJsonSafe(row.metadata, {}),
    }));

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests - create new reference request
router.post('/', authenticate, authorize('hr_initiator', 'compliance_reviewer', 'institution_admin', 'platform_admin'), auditLog('reference_request', 'create'), (req, res) => {
  try {
    const id = uuidv4();
    const {
      individual_id,
      reference_providing_institution_id,
      recruiting_institution_id,
      request_sector,
      notes,
      integration_snapshot,
      monitoring,
    } = req.body;

    if (!individual_id || !reference_providing_institution_id) {
      return res.status(400).json({ error: 'individual_id and reference_providing_institution_id required' });
    }

    const recruitingInstitutionId = req.user.institution_id
      || (req.user.role === 'platform_admin' ? recruiting_institution_id : null);

    if (!recruitingInstitutionId) {
      return res.status(400).json({ error: 'Recruiting institution is required for this user' });
    }

    const recruitingInstitution = db.prepare('SELECT institution_id FROM institutions WHERE institution_id = ?').get(recruitingInstitutionId);
    if (!recruitingInstitution) {
      return res.status(400).json({ error: 'Invalid recruiting institution_id' });
    }

    const providingInstitution = db.prepare('SELECT institution_id FROM institutions WHERE institution_id = ?').get(reference_providing_institution_id);
    if (!providingInstitution) {
      return res.status(400).json({ error: 'Invalid reference_providing_institution_id' });
    }

    if (recruitingInstitutionId === reference_providing_institution_id) {
      return res.status(400).json({ error: 'Recruiting and providing institutions must be different' });
    }

    const sevenYearsAgo = new Date();
    sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

    db.prepare(`
      INSERT INTO reference_requests (request_id, individual_id, recruiting_institution_id, reference_providing_institution_id,
        request_sector, lookback_start_date, status, notes, initiated_by_user_id, integration_snapshot, integration_last_checked_at)
      VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)
    `).run(id, individual_id, recruitingInstitutionId, reference_providing_institution_id,
      request_sector || 'banking', sevenYearsAgo.toISOString().split('T')[0], notes, req.user.user_id,
      integration_snapshot ? JSON.stringify(integration_snapshot) : null,
      integration_snapshot ? new Date().toISOString() : null);

    if (monitoring && monitoring.enabled) {
      const allowedFrequencies = ['weekly', 'monthly', 'quarterly', 'semi_annual'];
      const frequency = allowedFrequencies.includes(monitoring.review_frequency) ? monitoring.review_frequency : 'quarterly';
      const nextReviewDate = monitoring.next_review_date || computeNextReviewDate(new Date().toISOString().split('T')[0], frequency);
      db.prepare(`
        INSERT INTO ongoing_monitoring (
          monitoring_id, request_id, review_frequency, next_review_date, status, scope, notes, created_by_user_id
        ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?)
      `).run(
        uuidv4(),
        id,
        frequency,
        nextReviewDate,
        JSON.stringify(monitoring.scope || {}),
        monitoring.notes || null,
        req.user.user_id,
      );
    }

    const request = db.prepare('SELECT * FROM reference_requests WHERE request_id = ?').get(id);
    request.integration_snapshot = parseJsonSafe(request.integration_snapshot, null);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/status - update request status
router.patch('/:id/status', authenticate, auditLog('reference_request', 'status_change'), (req, res) => {
  try {
    const { status } = req.body;
    const request = db.prepare('SELECT * FROM reference_requests WHERE request_id = ?').get(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const allowed = STATUS_FLOW[request.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({ error: `Cannot transition from '${request.status}' to '${status}'` });
    }

    const updates = { status };
    if (status === 'sent') {
      updates.request_date = new Date().toISOString().split('T')[0];
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);
      updates.sla_deadline = deadline.toISOString().split('T')[0];
    }
    if (status === 'acknowledged') updates.acknowledgement_date = new Date().toISOString().split('T')[0];
    if (status === 'response_provided') updates.response_date = new Date().toISOString().split('T')[0];
    if (status === 'reviewed') updates.review_date = new Date().toISOString().split('T')[0];
    if (status === 'closed') updates.close_date = new Date().toISOString().split('T')[0];

    const sets = Object.entries(updates).map(([k]) => `${k}=?`).join(', ');
    db.prepare(`UPDATE reference_requests SET ${sets}, updated_at=datetime('now') WHERE request_id=?`)
      .run(...Object.values(updates), req.params.id);

    // Check SLA breach
    if (request.sla_deadline && new Date() > new Date(request.sla_deadline) && !['closed', 'cancelled'].includes(status)) {
      db.prepare('UPDATE reference_requests SET sla_breached = 1 WHERE request_id = ?').run(req.params.id);
    }

    const updated = db.prepare('SELECT * FROM reference_requests WHERE request_id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests/:id/consent/upload - upload signed consent form
router.post('/:id/consent/upload', authenticate, authorize('hr_initiator', 'compliance_reviewer', 'institution_admin', 'platform_admin'), auditLog('reference_request', 'update'), (req, res) => {
  try {
    const request = db.prepare(`
      SELECT rr.*, i.email as individual_email
      FROM reference_requests rr
      LEFT JOIN individuals i ON rr.individual_id = i.individual_id
      WHERE rr.request_id = ?
    `).get(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const { file_name, mime_type, file_data_base64, notes } = req.body || {};
    if (!file_name || !file_data_base64) {
      return res.status(400).json({ error: 'file_name and file_data_base64 are required' });
    }

    const uploadedAt = new Date().toISOString();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    let consentId = request.consent_id;
    if (!consentId) {
      consentId = uuidv4();
      db.prepare(`
        INSERT INTO consents (
          consent_id, individual_id, recruiting_institution_id, reference_providing_institution_id,
          consent_type, consent_scope, signature_method, status, granted_date, expiry_date, document_url
        ) VALUES (?, ?, ?, ?, 'mrc_standard', '{}', 'wet_ink_upload', 'active', datetime('now'), ?, ?)
      `).run(
        consentId,
        request.individual_id,
        request.recruiting_institution_id,
        request.reference_providing_institution_id,
        expiryDate.toISOString(),
        `uploaded:${file_name}`,
      );

      db.prepare(`
        UPDATE reference_requests
        SET consent_id = ?, updated_at = datetime('now')
        WHERE request_id = ?
      `).run(consentId, req.params.id);
    } else {
      db.prepare(`
        UPDATE consents
        SET status = 'active', signature_method = 'wet_ink_upload', granted_date = datetime('now'),
            expiry_date = ?, document_url = ?, updated_at = datetime('now')
        WHERE consent_id = ?
      `).run(expiryDate.toISOString(), `uploaded:${file_name}`, consentId);
    }

    if (request.status === 'draft') {
      db.prepare(`
        UPDATE reference_requests
        SET status = 'consent_obtained', updated_at = datetime('now')
        WHERE request_id = ?
      `).run(req.params.id);
    }

    const caseFileId = addCaseFileEntry({
      requestId: req.params.id,
      entryType: 'consent_upload',
      title: `Signed consent form uploaded: ${file_name}`,
      metadata: {
        file_name,
        mime_type: mime_type || 'application/octet-stream',
        uploaded_at: uploadedAt,
        notes: notes || '',
      },
      createdByUserId: req.user.user_id,
    });

    const consent = db.prepare('SELECT * FROM consents WHERE consent_id = ?').get(consentId);
    res.status(201).json({ consent, case_file_id: caseFileId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests/:id/consent/send-email - record request to sign consent by email
router.post('/:id/consent/send-email', authenticate, authorize('hr_initiator', 'compliance_reviewer', 'institution_admin', 'platform_admin'), auditLog('reference_request', 'update'), (req, res) => {
  try {
    const request = db.prepare(`
      SELECT rr.*, i.email as individual_email
      FROM reference_requests rr
      LEFT JOIN individuals i ON rr.individual_id = i.individual_id
      WHERE rr.request_id = ?
    `).get(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const recipientEmail = req.body?.recipient_email || request.individual_email;
    if (!recipientEmail) {
      return res.status(400).json({ error: 'recipient_email is required (individual has no email on record)' });
    }

    const subject = req.body?.subject || `Please sign your MRC consent form (Request ${request.request_id})`;

    let consentId = request.consent_id;
    if (!consentId) {
      consentId = uuidv4();
      db.prepare(`
        INSERT INTO consents (
          consent_id, individual_id, recruiting_institution_id, reference_providing_institution_id,
          consent_type, consent_scope, signature_method, status
        ) VALUES (?, ?, ?, ?, 'mrc_standard', '{}', 'electronic', 'pending')
      `).run(
        consentId,
        request.individual_id,
        request.recruiting_institution_id,
        request.reference_providing_institution_id,
      );

      db.prepare(`
        UPDATE reference_requests
        SET consent_id = ?, updated_at = datetime('now')
        WHERE request_id = ?
      `).run(consentId, req.params.id);
    }

    const appBaseUrl = (process.env.FRONTEND_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const consentActionUrl = `${appBaseUrl}/requests/${request.request_id}`;
    const message = req.body?.message || [
      'Dear Candidate,',
      '',
      'Please review and sign the MRC consent form to continue your reference request workflow.',
      '',
      `Request ID: ${request.request_id}`,
      `Consent ID: ${consentId}`,
      `Open Request: ${consentActionUrl}`,
      '',
      'Thank you.',
    ].join('\n');
    const mailtoQuery = new URLSearchParams({ subject, body: message }).toString();
    const mailtoUrl = `mailto:${recipientEmail}?${mailtoQuery}`;

    const caseFileId = addCaseFileEntry({
      requestId: req.params.id,
      entryType: 'consent_email',
      title: `Consent signing email draft prepared for ${recipientEmail}`,
      metadata: {
        recipient_email: recipientEmail,
        subject,
        message,
        mailto_url: mailtoUrl,
        draft_prepared_at: new Date().toISOString(),
        delivery_status: 'draft_prepared',
      },
      createdByUserId: req.user.user_id,
    });

    res.status(201).json({
      draft_prepared: true,
      recipient_email: recipientEmail,
      subject,
      message,
      mailto_url: mailtoUrl,
      case_file_id: caseFileId,
      note: 'Email draft template prepared. Open mailto_url to launch the system mail client.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests/:id/reference-results/upload - upload and parse reference results
router.post('/:id/reference-results/upload', authenticate, authorize('compliance_reviewer', 'hr_initiator', 'institution_admin', 'platform_admin'), auditLog('reference_request', 'update'), (req, res) => {
  try {
    const request = db.prepare('SELECT request_id FROM reference_requests WHERE request_id = ?').get(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const { file_name, mime_type, file_data_base64, ocr_enabled = true, ai_enabled = true } = req.body || {};
    if (!file_name || !file_data_base64) {
      return res.status(400).json({ error: 'file_name and file_data_base64 are required' });
    }

    const extractedText = ocr_enabled ? extractTextFromUpload(file_name, mime_type, file_data_base64) : '';
    const parsed = ai_enabled ? parseReferenceResults(extractedText) : {
      extracted_text_length: extractedText.length,
      findings: [],
      summary: { total_findings: 0, material_count: 0, non_material_count: 0, under_review_count: 0 },
    };

    const uploadCaseFileId = addCaseFileEntry({
      requestId: req.params.id,
      entryType: 'reference_results_upload',
      title: `Reference results uploaded: ${file_name}`,
      metadata: {
        file_name,
        mime_type: mime_type || 'application/octet-stream',
        uploaded_at: new Date().toISOString(),
        ocr_enabled: Boolean(ocr_enabled),
        ai_enabled: Boolean(ai_enabled),
        extracted_text_preview: extractedText.slice(0, 1000),
      },
      createdByUserId: req.user.user_id,
    });

    const parseCaseFileId = addCaseFileEntry({
      requestId: req.params.id,
      entryType: 'reference_results_ai_parse',
      title: 'Reference results parsed with OCR + AI',
      metadata: parsed,
      createdByUserId: req.user.user_id,
    });

    res.status(201).json({
      upload_case_file_id: uploadCaseFileId,
      parse_case_file_id: parseCaseFileId,
      parsed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests/:id/conduct - add conduct information
router.post('/:id/conduct', authenticate, authorize('compliance_reviewer', 'hr_initiator', 'institution_admin', 'platform_admin'), auditLog('conduct_information', 'create'), (req, res) => {
  try {
    const request = db.prepare('SELECT * FROM reference_requests WHERE request_id = ?').get(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const conductId = uuidv4();
    const { category, description, incident_start_date, incident_end_date, severity, regulator_reported, regulator_reference } = req.body;

    if (!category) return res.status(400).json({ error: 'category is required' });

    db.prepare(`
      INSERT INTO conduct_information (conduct_id, request_id, category, description, incident_start_date, incident_end_date, severity, regulator_reported, regulator_reference, submitted_by_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(conductId, req.params.id, category, description, incident_start_date, incident_end_date,
      severity || 'under_review', regulator_reported ? 1 : 0, regulator_reference, req.user.user_id);

    const conduct = db.prepare('SELECT * FROM conduct_information WHERE conduct_id = ?').get(conductId);
    res.status(201).json(conduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
