const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../migrate');
const { authenticate, authorize, auditLog } = require('../middleware/auth');

const router = express.Router();

const REGULATOR_REGION_MAP = {
  HKMA: 'asia',
  SFC: 'asia',
  IA: 'asia',
  MPFA: 'asia',
  MAS: 'asia',
  PBOC: 'asia',
  CSRC: 'asia',
  FSA_JP: 'asia',
  FSS_KR: 'asia',
  FSC_TW: 'asia',
  RBI: 'asia',
  FCA: 'europe',
  PRA: 'europe',
  BAFIN: 'europe',
  AMF_FR: 'europe',
  CONSOB: 'europe',
  CNMV: 'europe',
  AFM_NL: 'europe',
  FINMA: 'europe',
  SEC: 'north_america',
  FINRA: 'north_america',
  IIROC: 'north_america',
  CVM_BR: 'latin_america',
  CNBV_MX: 'latin_america',
  DFSA: 'middle_east',
  SAMA: 'middle_east',
  FSRA_ADGM: 'middle_east',
  ASIC: 'oceania',
  APRA: 'oceania',
  FSCA_ZA: 'africa',
  CBN_NG: 'africa',
};

function deriveRegions(regulators = []) {
  const regions = new Set();
  regulators.forEach((regulator) => {
    const key = String(regulator || '').toUpperCase();
    const mapped = REGULATOR_REGION_MAP[key];
    if (mapped) regions.add(mapped);
  });
  return Array.from(regions);
}

function derivePrimaryRegion(regulators = []) {
  return deriveRegions(regulators)[0] || 'asia';
}

// GET /api/institutions - list all institutions
router.get('/', authenticate, (req, res) => {
  try {
    const { sector, status, search, region } = req.query;
    const normalizedRegion = String(region || '').trim().toLowerCase();
    const effectiveSector = String(sector || '').trim();
    let sql = 'SELECT * FROM institutions WHERE 1=1';
    const params = [];

    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (search) { sql += ' AND (name_en LIKE ? OR name_zh LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (normalizedRegion) { sql += ' AND region = ?'; params.push(normalizedRegion); }

    let rows = db.prepare(sql + ' ORDER BY region, name_en').all(...params);
    rows = rows.map(r => ({
      ...r,
      sectors: JSON.parse(r.sectors),
      regulators: JSON.parse(r.regulators),
      licence_numbers: JSON.parse(r.licence_numbers || '{}'),
      region: r.region || derivePrimaryRegion(JSON.parse(r.regulators || '[]')),
    }));

    rows = rows.map((row) => {
      if (row.region) return row;
      return {
        ...row,
        region: 'asia',
      };
    });

    if (effectiveSector) {
      rows = rows.filter(r => r.sectors.includes(effectiveSector));
    }

    const groupedByRegion = rows.reduce((acc, row) => {
      const key = row.region || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

    res.json({ institutions: rows, groupedByRegion, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/institutions/:id
router.get('/:id', authenticate, (req, res) => {
  try {
    const inst = db.prepare('SELECT * FROM institutions WHERE institution_id = ?').get(req.params.id);
    if (!inst) return res.status(404).json({ error: 'Institution not found' });

    inst.sectors = JSON.parse(inst.sectors);
    inst.regulators = JSON.parse(inst.regulators);
    inst.licence_numbers = JSON.parse(inst.licence_numbers || '{}');
    inst.region = inst.region || derivePrimaryRegion(inst.regulators || []);

    // Get user count
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE institution_id = ?').get(req.params.id);
    inst.user_count = userCount.count;

    res.json(inst);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/institutions - create institution
router.post('/', authenticate, authorize('platform_admin', 'regulator_admin'), auditLog('institution', 'create'), (req, res) => {
  try {
    const id = uuidv4();
    const { name_en, name_zh, institution_type, region, ubi, sectors, regulators, licence_numbers, contact_email, contact_phone, address } = req.body;

    if (!name_en || !institution_type) return res.status(400).json({ error: 'name_en and institution_type required' });

    const parsedRegulators = Array.isArray(regulators) ? regulators : [];
    const normalizedRegion = String(region || derivePrimaryRegion(parsedRegulators)).toLowerCase();

    db.prepare(`
      INSERT INTO institutions (institution_id, name_en, name_zh, institution_type, region, ubi, sectors, regulators, licence_numbers, contact_email, contact_phone, address, onboarded_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, name_en, name_zh, institution_type, normalizedRegion, ubi,
      JSON.stringify(sectors || []), JSON.stringify(parsedRegulators),
      JSON.stringify(licence_numbers || {}), contact_email, contact_phone, address);

    const inst = db.prepare('SELECT * FROM institutions WHERE institution_id = ?').get(id);
    inst.sectors = JSON.parse(inst.sectors);
    inst.regulators = JSON.parse(inst.regulators);
    inst.region = inst.region || derivePrimaryRegion(inst.regulators || []);
    res.status(201).json(inst);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/institutions/:id
router.put('/:id', authenticate, authorize('platform_admin', 'institution_admin', 'regulator_admin'), auditLog('institution', 'update'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM institutions WHERE institution_id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Institution not found' });

    const { name_en, name_zh, institution_type, region, ubi, sectors, regulators, licence_numbers, status, contact_email, contact_phone, address } = req.body;

    const parsedRegulators = Array.isArray(regulators)
      ? regulators
      : JSON.parse(existing.regulators || '[]');
    const normalizedRegion = region
      ? String(region).toLowerCase()
      : (existing.region || derivePrimaryRegion(parsedRegulators));

    db.prepare(`
      UPDATE institutions SET name_en=COALESCE(?,name_en), name_zh=COALESCE(?,name_zh), institution_type=COALESCE(?,institution_type),
      region=COALESCE(?,region), ubi=COALESCE(?,ubi), sectors=COALESCE(?,sectors), regulators=COALESCE(?,regulators), licence_numbers=COALESCE(?,licence_numbers),
      status=COALESCE(?,status), contact_email=COALESCE(?,contact_email), contact_phone=COALESCE(?,contact_phone),
      address=COALESCE(?,address), updated_at=datetime('now') WHERE institution_id=?
    `).run(name_en, name_zh, institution_type, normalizedRegion, ubi,
      sectors ? JSON.stringify(sectors) : null, regulators ? JSON.stringify(regulators) : null,
      licence_numbers ? JSON.stringify(licence_numbers) : null,
      status, contact_email, contact_phone, address, req.params.id);

    const inst = db.prepare('SELECT * FROM institutions WHERE institution_id = ?').get(req.params.id);
    inst.sectors = JSON.parse(inst.sectors);
    inst.regulators = JSON.parse(inst.regulators);
    inst.region = inst.region || derivePrimaryRegion(inst.regulators || []);
    res.json(inst);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
