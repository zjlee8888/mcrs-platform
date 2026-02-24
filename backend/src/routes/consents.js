const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../migrate');
const { authenticate, authorize, auditLog } = require('../middleware/auth');

const router = express.Router();

// GET /api/consents
router.get('/', authenticate, (req, res) => {
  try {
    const { individual_id, status } = req.query;
    let sql = `
      SELECT c.*, i.name_en_surname || ' ' || i.name_en_given as individual_name,
        ri.name_en as recruiting_institution_name,
        rpi.name_en as providing_institution_name
      FROM consents c
      LEFT JOIN individuals i ON c.individual_id = i.individual_id
      LEFT JOIN institutions ri ON c.recruiting_institution_id = ri.institution_id
      LEFT JOIN institutions rpi ON c.reference_providing_institution_id = rpi.institution_id
      WHERE 1=1
    `;
    const params = [];

    if (individual_id) { sql += ' AND c.individual_id = ?'; params.push(individual_id); }
    if (status) { sql += ' AND c.status = ?'; params.push(status); }

    if (req.user.institution_id) {
      sql += ' AND (c.recruiting_institution_id = ? OR c.reference_providing_institution_id = ?)';
      params.push(req.user.institution_id, req.user.institution_id);
    }

    sql += ' ORDER BY c.created_at DESC';
    const rows = db.prepare(sql).all(...params);
    res.json({ consents: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/consents - create consent
router.post('/', authenticate, authorize('hr_initiator', 'compliance_reviewer', 'institution_admin', 'platform_admin'), auditLog('consent', 'create'), (req, res) => {
  try {
    const id = uuidv4();
    const { individual_id, reference_providing_institution_id, consent_type, consent_scope, signature_method } = req.body;

    if (!individual_id || !reference_providing_institution_id) {
      return res.status(400).json({ error: 'individual_id and reference_providing_institution_id required' });
    }

    db.prepare(`
      INSERT INTO consents (consent_id, individual_id, recruiting_institution_id, reference_providing_institution_id,
        consent_type, consent_scope, signature_method, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(id, individual_id, req.user.institution_id, reference_providing_institution_id,
      consent_type || 'mrc_standard', JSON.stringify(consent_scope || {}), signature_method || 'electronic');

    const consent = db.prepare('SELECT * FROM consents WHERE consent_id = ?').get(id);
    res.status(201).json(consent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/consents/:id/grant - grant consent
router.patch('/:id/grant', authenticate, auditLog('consent', 'consent_granted'), (req, res) => {
  try {
    const consent = db.prepare('SELECT * FROM consents WHERE consent_id = ?').get(req.params.id);
    if (!consent) return res.status(404).json({ error: 'Consent not found' });

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    db.prepare(`
      UPDATE consents SET status = 'active', granted_date = datetime('now'), expiry_date = ?, updated_at = datetime('now')
      WHERE consent_id = ?
    `).run(expiryDate.toISOString(), req.params.id);

    const updated = db.prepare('SELECT * FROM consents WHERE consent_id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/consents/:id/withdraw - withdraw consent
router.patch('/:id/withdraw', authenticate, auditLog('consent', 'consent_withdrawn'), (req, res) => {
  try {
    db.prepare(`
      UPDATE consents SET status = 'withdrawn', withdrawn_date = datetime('now'), updated_at = datetime('now')
      WHERE consent_id = ?
    `).run(req.params.id);

    const updated = db.prepare('SELECT * FROM consents WHERE consent_id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
