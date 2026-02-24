const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../migrate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/hkma/ais - Fetch authorised institutions from HKMA Open API
router.get('/ais', authenticate, async (req, res) => {
  try {
    // Check cache first (valid for 24 hours)
    const cached = db.prepare(`
      SELECT * FROM hkma_register_cache
      WHERE register_type = 'ais'
      AND datetime(fetched_at, '+24 hours') > datetime('now')
      ORDER BY fetched_at DESC LIMIT 1
    `).get();

    if (cached) {
      return res.json(JSON.parse(cached.data));
    }

    // Fetch from HKMA API
    const fetch = require('node-fetch');
    const url = `${process.env.HKMA_API_BASE}/bank-svf-info/register-ais-lros?lang=en&segment=bank`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`HKMA API returned ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    db.prepare(`
      INSERT INTO hkma_register_cache (cache_id, register_type, data, fetched_at)
      VALUES (?, 'ais', ?, datetime('now'))
    `).run(uuidv4(), JSON.stringify(data));

    res.json(data);
  } catch (err) {
    // Return cached data even if expired, or error
    const fallback = db.prepare(`
      SELECT * FROM hkma_register_cache WHERE register_type = 'ais' ORDER BY fetched_at DESC LIMIT 1
    `).get();

    if (fallback) {
      return res.json({ ...JSON.parse(fallback.data), _cached: true, _cache_date: fallback.fetched_at });
    }
    res.status(502).json({ error: 'HKMA API unavailable', details: err.message });
  }
});

// GET /api/hkma/securities-staff - Search securities staff register
router.get('/securities-staff', authenticate, async (req, res) => {
  try {
    const { surname, searchtype = 'engName' } = req.query;
    if (!surname) return res.status(400).json({ error: 'surname parameter required' });

    const cacheKey = `secstaff_${searchtype}_${surname}`;
    const cached = db.prepare(`
      SELECT * FROM hkma_register_cache
      WHERE register_type = ?
      AND datetime(fetched_at, '+24 hours') > datetime('now')
      ORDER BY fetched_at DESC LIMIT 1
    `).get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached.data));
    }

    const fetch = require('node-fetch');
    const url = `${process.env.HKMA_API_BASE}/bank-svf-info/register-ais-secstaff?lang=en&searchtype=${searchtype}&surname=${encodeURIComponent(surname)}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`HKMA API returned ${response.status}`);
    }

    const data = await response.json();

    db.prepare(`
      INSERT INTO hkma_register_cache (cache_id, register_type, data, fetched_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(uuidv4(), cacheKey, JSON.stringify(data));

    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'HKMA API unavailable', details: err.message });
  }
});

module.exports = router;
