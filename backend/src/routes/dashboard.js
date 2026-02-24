const express = require('express');
const { db } = require('../migrate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const REQUEST_STATUS_STAGE_MAP = {
  draft: 'preparation',
  consent_obtained: 'consent',
  sent: 'exchange',
  acknowledged: 'exchange',
  in_progress: 'assessment',
  response_provided: 'assessment',
  reviewed: 'review',
  closed: 'closure',
  cancelled: 'closure',
};

const REQUEST_STAGE_ORDER = ['preparation', 'consent', 'exchange', 'assessment', 'review', 'closure'];

function buildStageStatusBreakdown(statusCounts = []) {
  const stages = REQUEST_STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = {
      total: 0,
      statuses: {},
    };
    return acc;
  }, {});

  statusCounts.forEach((row) => {
    const status = row.status;
    const count = Number(row.count || 0);
    const stage = REQUEST_STATUS_STAGE_MAP[status] || 'other';

    if (!stages[stage]) {
      stages[stage] = { total: 0, statuses: {} };
    }

    stages[stage].statuses[status] = count;
    stages[stage].total += count;
  });

  return stages;
}

// GET /api/dashboard - aggregated stats for homepage
router.get('/', authenticate, (req, res) => {
  try {
    const isRegulator = ['regulator_admin', 'regulator_viewer'].includes(req.user.role);
    const isPlatformAdmin = req.user.role === 'platform_admin';
    const instId = req.user.institution_id;

    let requestFilter = '';
    let filterParams = [];

    if (!isRegulator && !isPlatformAdmin && instId) {
      requestFilter = 'WHERE (rr.recruiting_institution_id = ? OR rr.reference_providing_institution_id = ?)';
      filterParams = [instId, instId];
    } else if (isRegulator && req.user.regulator) {
      requestFilter = `WHERE (ri.regulators LIKE ? OR rpi.regulators LIKE ?)`;
      filterParams = [`%${req.user.regulator}%`, `%${req.user.regulator}%`];
    }

    // Total requests by status
    const statusCounts = db.prepare(`
      SELECT rr.status, COUNT(*) as count
      FROM reference_requests rr
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      ${requestFilter}
      GROUP BY rr.status
    `).all(...filterParams);

    const stageStatusBreakdown = buildStageStatusBreakdown(statusCounts);

    const totalRequests = statusCounts.reduce((sum, row) => sum + Number(row.count || 0), 0);
    const activeRequests = statusCounts.reduce((sum, row) => {
      if (['closed', 'cancelled'].includes(row.status)) return sum;
      return sum + Number(row.count || 0);
    }, 0);

    // SLA stats
    const slaStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN rr.sla_breached = 1 THEN 1 ELSE 0 END) as breached,
        SUM(CASE WHEN rr.sla_deadline IS NOT NULL AND date(rr.sla_deadline) < date('now') AND rr.status NOT IN ('closed','cancelled','response_provided','reviewed') THEN 1 ELSE 0 END) as overdue
      FROM reference_requests rr
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      ${requestFilter}
    `).get(...filterParams);

    // Sector breakdown
    const sectorBreakdown = db.prepare(`
      SELECT rr.request_sector, COUNT(*) as count
      FROM reference_requests rr
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      ${requestFilter}
      GROUP BY rr.request_sector
    `).all(...filterParams);

    // Recent activity
    const recentRequests = db.prepare(`
      SELECT rr.request_id, rr.status, rr.request_sector, rr.sla_deadline, rr.created_at,
        i.name_en_surname || ' ' || i.name_en_given as individual_name,
        i.name_zh as individual_name_zh,
        ri.name_en as recruiting_institution_name,
        ri.name_zh as recruiting_institution_name_zh,
        rpi.name_en as providing_institution_name,
        rpi.name_zh as providing_institution_name_zh
      FROM reference_requests rr
      LEFT JOIN individuals i ON rr.individual_id = i.individual_id
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      ${requestFilter}
      ORDER BY rr.created_at DESC LIMIT 10
    `).all(...filterParams);

    // Flagged cases requiring review
    const flaggedCases = db.prepare(`
      SELECT *
      FROM (
        SELECT
          rr.request_id,
          rr.status,
          rr.sla_deadline,
          rr.sla_breached,
          rr.created_at,
          i.name_en_surname || ' ' || i.name_en_given as individual_name,
          i.name_zh as individual_name_zh,
          ri.name_en as recruiting_institution_name,
          ri.name_zh as recruiting_institution_name_zh,
          rpi.name_en as providing_institution_name,
          rpi.name_zh as providing_institution_name_zh,
          CASE
            WHEN rr.sla_deadline IS NOT NULL
              AND date(rr.sla_deadline) < date('now')
              AND rr.status NOT IN ('closed','cancelled','response_provided','reviewed')
            THEN 1
            ELSE 0
          END as is_overdue,
          COALESCE(request_issue_rollup.request_issue_count, 0) as request_issue_count,
          COALESCE(individual_issue_rollup.reference_issue_count, 0) as reference_issue_count,
          COALESCE(individual_issue_rollup.material_conduct_count, 0) as material_conduct_count,
          COALESCE(individual_issue_rollup.under_review_conduct_count, 0) as under_review_conduct_count,
          COALESCE(monitoring_rollup.active_monitoring_count, 0) as active_monitoring_count
        FROM reference_requests rr
        LEFT JOIN individuals i ON rr.individual_id = i.individual_id
        LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
        LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
        LEFT JOIN (
          SELECT
            ci.request_id,
            COUNT(*) as request_issue_count
          FROM conduct_information ci
          WHERE ci.status = 'current'
          GROUP BY ci.request_id
        ) request_issue_rollup ON request_issue_rollup.request_id = rr.request_id
        LEFT JOIN (
          SELECT
            rr_issue.individual_id,
            COUNT(ci.conduct_id) as reference_issue_count,
            SUM(CASE WHEN ci.status = 'current' AND ci.severity = 'material' THEN 1 ELSE 0 END) as material_conduct_count,
            SUM(CASE WHEN ci.status = 'current' AND ci.severity = 'under_review' THEN 1 ELSE 0 END) as under_review_conduct_count
          FROM reference_requests rr_issue
          JOIN conduct_information ci ON ci.request_id = rr_issue.request_id
          GROUP BY rr_issue.individual_id
        ) individual_issue_rollup ON individual_issue_rollup.individual_id = rr.individual_id
        LEFT JOIN (
          SELECT
            rr_monitor.individual_id,
            COUNT(*) as active_monitoring_count
          FROM ongoing_monitoring om
          JOIN reference_requests rr_monitor ON rr_monitor.request_id = om.request_id
          WHERE om.status = 'active'
          GROUP BY rr_monitor.individual_id
        ) monitoring_rollup ON monitoring_rollup.individual_id = rr.individual_id
        ${requestFilter}
      ) flagged
      WHERE (
        flagged.sla_breached = 1
        OR flagged.is_overdue = 1
        OR (
          flagged.reference_issue_count > 0
          AND (flagged.active_monitoring_count > 0 OR flagged.request_issue_count > 0)
        )
      )
      ORDER BY flagged.sla_breached DESC, flagged.is_overdue DESC, flagged.material_conduct_count DESC, flagged.under_review_conduct_count DESC, flagged.created_at DESC
      LIMIT 8
    `).all(...filterParams).map((row) => {
      const reasons = [];
      if (Number(row.sla_breached || 0) > 0) reasons.push('sla_breached');
      if (Number(row.is_overdue || 0) > 0) reasons.push('overdue');
      if (Number(row.material_conduct_count || 0) > 0) reasons.push('material_conduct');
      if (Number(row.under_review_conduct_count || 0) > 0) reasons.push('under_review_conduct');

      return {
        request_id: row.request_id,
        status: row.status,
        sla_deadline: row.sla_deadline,
        created_at: row.created_at,
        individual_name: row.individual_name,
        individual_name_zh: row.individual_name_zh,
        recruiting_institution_name: row.recruiting_institution_name,
        recruiting_institution_name_zh: row.recruiting_institution_name_zh,
        providing_institution_name: row.providing_institution_name,
        providing_institution_name_zh: row.providing_institution_name_zh,
        reasons,
      };
    });

    // Institution count (platform-wide)
    const institutionCount = db.prepare('SELECT COUNT(*) as count FROM institutions WHERE status = ?').get('active');

    // Individual count
    const individualCount = db.prepare('SELECT COUNT(*) as count FROM individuals').get();

    // Conduct information summary
    const conductSummary = db.prepare(`
      SELECT ci.category, COUNT(*) as count
      FROM conduct_information ci
      JOIN reference_requests rr ON ci.request_id = rr.request_id
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      ${requestFilter}
      GROUP BY ci.category
    `).all(...filterParams);

    // Monthly request volume (last 12 months)
    const monthlyVolume = db.prepare(`
      SELECT strftime('%Y-%m', rr.created_at) as month, COUNT(*) as count
      FROM reference_requests rr
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      ${requestFilter}
      GROUP BY strftime('%Y-%m', rr.created_at)
      ORDER BY month DESC LIMIT 12
    `).all(...filterParams);

    res.json({
      totalRequests,
      activeRequests,
      statusCounts: Object.fromEntries(statusCounts.map(r => [r.status, r.count])),
      stageStatusBreakdown,
      slaStats,
      sectorBreakdown: Object.fromEntries(sectorBreakdown.map(r => [r.request_sector, r.count])),
      recentRequests,
      flaggedCases,
      institutionCount: institutionCount.count,
      individualCount: individualCount.count,
      conductSummary: Object.fromEntries(conductSummary.map(r => [r.category, r.count])),
      monthlyVolume,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/compliance - compliance overview
router.get('/compliance', authenticate, (req, res) => {
  try {
    // Average response time (days) for completed requests
    const avgResponseTime = db.prepare(`
      SELECT AVG(julianday(response_date) - julianday(request_date)) as avg_days
      FROM reference_requests
      WHERE response_date IS NOT NULL AND request_date IS NOT NULL
    `).get();

    // SLA compliance rate
    const slaCompliance = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN sla_breached = 0 THEN 1 ELSE 0 END) as compliant
      FROM reference_requests
      WHERE status NOT IN ('draft', 'cancelled')
    `).get();

    // By institution  
    const byInstitution = db.prepare(`
      SELECT i.name_en, i.institution_id,
        COUNT(rr.request_id) as total_requests,
        SUM(CASE WHEN rr.sla_breached = 1 THEN 1 ELSE 0 END) as sla_breached,
        AVG(CASE WHEN rr.response_date IS NOT NULL THEN julianday(rr.response_date) - julianday(rr.request_date) END) as avg_response_days
      FROM institutions i
      LEFT JOIN reference_requests rr ON (i.institution_id = rr.recruiting_institution_id OR i.institution_id = rr.reference_providing_institution_id)
      WHERE i.status = 'active'
      GROUP BY i.institution_id
      ORDER BY total_requests DESC
    `).all();

    res.json({
      avgResponseDays: avgResponseTime.avg_days ? Math.round(avgResponseTime.avg_days * 10) / 10 : null,
      slaComplianceRate: slaCompliance.total > 0 ? Math.round((slaCompliance.compliant / slaCompliance.total) * 100) : 100,
      byInstitution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/audit - audit log viewer
router.get('/audit', authenticate, (req, res) => {
  try {
    const { entity_type, action, user_id, page = 1, limit = 50 } = req.query;
    let sql = `
      SELECT al.*, u.name_en as user_name, i.name_en as institution_name
      FROM audit_logs al
      LEFT JOIN users u ON al.performed_by_user_id = u.user_id
      LEFT JOIN institutions i ON al.performed_by_institution_id = i.institution_id
      WHERE 1=1
    `;
    const params = [];

    if (entity_type) { sql += ' AND al.entity_type = ?'; params.push(entity_type); }
    if (action) { sql += ' AND al.action = ?'; params.push(action); }
    if (user_id) { sql += ' AND al.performed_by_user_id = ?'; params.push(user_id); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const rows = db.prepare(sql).all(...params);
    res.json({ logs: rows, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
