const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../migrate');
const { authenticate, authorize, auditLog } = require('../middleware/auth');

const router = express.Router();

function generateUniqueIndividualId(maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = `ind-${uuidv4()}`;
    const exists = db.prepare('SELECT 1 FROM individuals WHERE individual_id = ?').get(candidate);
    if (!exists) return candidate;
  }
  throw new Error('Unable to generate unique individual_id');
}

// GET /api/individuals
router.get('/', authenticate, (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const safeLimit = Math.min(parseInt(limit, 10) || 20, 1000);
    let sql = `
      SELECT i.*, COUNT(rr.request_id) AS request_count, MAX(rr.created_at) AS last_request_at
      FROM individuals i
      LEFT JOIN reference_requests rr ON rr.individual_id = i.individual_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (i.name_en_surname LIKE ? OR i.name_en_given LIKE ? OR i.name_zh LIKE ? OR i.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY i.individual_id';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) _i`;
    const total = db.prepare(countSql).get(...params).total;

    sql += `
      ORDER BY
        CASE WHEN request_count > 0 THEN 0 ELSE 1 END,
        last_request_at DESC,
        i.name_en_surname,
        i.name_en_given
      LIMIT ? OFFSET ?
    `;
    params.push(safeLimit, offset);

    const rows = db.prepare(sql).all(...params);
    res.json({ individuals: rows, total, page: parseInt(page), limit: safeLimit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/individuals/:id
router.get('/:id', authenticate, (req, res) => {
  try {
    const individual = db.prepare('SELECT * FROM individuals WHERE individual_id = ?').get(req.params.id);
    if (!individual) return res.status(404).json({ error: 'Individual not found' });

    // Get regulatory registrations
    individual.registrations = db.prepare(`
      SELECT rr.*, i.name_en as institution_name
      FROM regulatory_registrations rr
      LEFT JOIN institutions i ON rr.principal_institution_id = i.institution_id
      WHERE rr.individual_id = ?
    `).all(req.params.id);

    // Get employment records
    individual.employment_records = db.prepare(`
      SELECT er.*, i.name_en as institution_name
      FROM employment_records er
      LEFT JOIN institutions i ON er.institution_id = i.institution_id
      WHERE er.individual_id = ?
      ORDER BY er.start_date DESC
    `).all(req.params.id);

    // Get reference requests
    individual.reference_requests = db.prepare(`
      SELECT rr.*, ri.name_en as recruiting_institution_name, rpi.name_en as providing_institution_name
      FROM reference_requests rr
      LEFT JOIN institutions ri ON rr.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON rr.reference_providing_institution_id = rpi.institution_id
      WHERE rr.individual_id = ?
      ORDER BY rr.created_at DESC
    `).all(req.params.id);

    res.json(individual);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/individuals
router.post('/', authenticate, authorize('platform_admin', 'hr_initiator', 'compliance_reviewer', 'institution_admin'), auditLog('individual', 'create'), (req, res) => {
  try {
    const id = generateUniqueIndividualId();
    const { name_en_surname, name_en_given, name_zh, email, phone } = req.body;
    if (!name_en_surname || !name_en_given) return res.status(400).json({ error: 'Name fields required' });

    db.prepare(`
      INSERT INTO individuals (individual_id, name_en_surname, name_en_given, name_zh, email, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name_en_surname, name_en_given, name_zh, email, phone);

    const individual = db.prepare('SELECT * FROM individuals WHERE individual_id = ?').get(id);
    res.status(201).json(individual);
  } catch (err) {
    if (String(err.message || '').includes('UNIQUE constraint failed: individuals.individual_id')) {
      return res.status(409).json({ error: 'Generated individual_id conflicted, please retry' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/individuals/:id
router.put('/:id', authenticate, authorize('platform_admin', 'hr_initiator', 'compliance_reviewer', 'institution_admin'), auditLog('individual', 'update'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM individuals WHERE individual_id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Individual not found' });

    const { name_en_surname, name_en_given, name_zh, email, phone } = req.body;
    db.prepare(`
      UPDATE individuals SET name_en_surname=COALESCE(?,name_en_surname), name_en_given=COALESCE(?,name_en_given),
      name_zh=COALESCE(?,name_zh), email=COALESCE(?,email), phone=COALESCE(?,phone), updated_at=datetime('now')
      WHERE individual_id=?
    `).run(name_en_surname, name_en_given, name_zh, email, phone, req.params.id);

    const individual = db.prepare('SELECT * FROM individuals WHERE individual_id = ?').get(req.params.id);
    res.json(individual);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
