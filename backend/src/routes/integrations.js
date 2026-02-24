const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../migrate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

async function fetchHkmaLiveAis() {
  const cacheKey = 'hkma_ais_live';
  const cached = db.prepare(`
    SELECT * FROM hkma_register_cache
    WHERE register_type = ?
    AND datetime(fetched_at, '+24 hours') > datetime('now')
    ORDER BY fetched_at DESC LIMIT 1
  `).get(cacheKey);

  if (cached) {
    return { records: JSON.parse(cached.data), live: true, cached: true };
  }

  const fetch = require('node-fetch');
  const baseUrl = process.env.HKMA_API_BASE || 'https://api.hkma.gov.hk/public';
  const url = `${baseUrl}/bank-svf-info/register-ais-lros?lang=en&segment=bank`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    timeout: 12000,
  });

  if (!response.ok) {
    throw new Error(`HKMA API returned ${response.status}`);
  }

  const payload = await response.json();
  const records = Array.isArray(payload?.result?.records) ? payload.result.records : [];

  db.prepare(`
    INSERT INTO hkma_register_cache (cache_id, register_type, data, fetched_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(uuidv4(), cacheKey, JSON.stringify(records));

  return { records, live: true, cached: false };
}

// ============================================================
// CORPORATE REGISTRY APIs (Dummy + Real where available)
// ============================================================

// --- Hong Kong Companies Registry (CR) ---
router.get('/corporate/hk/company-search', authenticate, async (req, res) => {
  const { name, cr_number } = req.query;
  if (!name && !cr_number) return res.status(400).json({ error: 'Provide name or cr_number parameter' });

  // Dummy data simulating HK Companies Registry (ICRIS)
  const results = [
    { cr_number: 'CR-0012345', company_name: 'HSBC Holdings plc', status: 'Active', incorporation_date: '1991-01-01', company_type: 'Public Limited Company', country: 'HK' },
    { cr_number: 'CR-0054321', company_name: 'AIA Group Limited', status: 'Active', incorporation_date: '2009-03-05', company_type: 'Public Limited Company', country: 'HK' },
    { cr_number: 'CR-0098765', company_name: 'Bank of China (Hong Kong) Limited', status: 'Active', incorporation_date: '2001-09-12', company_type: 'Limited Company', country: 'HK' },
    { cr_number: 'CR-0067890', company_name: 'Goldman Sachs Asia LLC', status: 'Active', incorporation_date: '1999-06-15', company_type: 'Limited Liability Company', country: 'HK' },
    { cr_number: 'CR-0011111', company_name: 'Sun Life Hong Kong Limited', status: 'Active', incorporation_date: '2005-11-20', company_type: 'Limited Company', country: 'HK' },
    { cr_number: 'CR-0072201', company_name: 'Harbour Peak Advisory Limited', status: 'Active', incorporation_date: '2014-05-20', company_type: 'Private Company Limited', country: 'HK' },
  ].filter(c => {
    if (cr_number) return c.cr_number.toLowerCase().includes(cr_number.toLowerCase());
    return c.company_name.toLowerCase().includes((name || '').toLowerCase());
  });

  res.json({
    source: 'HK Companies Registry (ICRIS)',
    country: 'HK',
    api_endpoint: 'https://www.icris.cr.gov.hk/csci/api/company-search',
    _dummy: true,
    result: { total: results.length, records: results }
  });
});

// --- Singapore ACRA (Accounting and Corporate Regulatory Authority) ---
router.get('/corporate/sg/company-search', authenticate, async (req, res) => {
  const { name, uen } = req.query;
  if (!name && !uen) return res.status(400).json({ error: 'Provide name or uen parameter' });

  const results = [
    { uen: '199901234A', company_name: 'DBS Group Holdings Ltd', status: 'Live', registration_date: '1999-01-15', entity_type: 'Public Company Limited by Shares', country: 'SG' },
    { uen: '200501234B', company_name: 'OCBC Securities Pte Ltd', status: 'Live', registration_date: '2005-04-10', entity_type: 'Exempt Private Company Limited by Shares', country: 'SG' },
    { uen: '198801234C', company_name: 'United Overseas Bank Limited', status: 'Live', registration_date: '1988-07-22', entity_type: 'Public Company Limited by Shares', country: 'SG' },
    { uen: '201233445N', company_name: 'Lion Rock Capital Pte. Ltd.', status: 'Live', registration_date: '2012-09-18', entity_type: 'Private Company Limited by Shares', country: 'SG' },
  ].filter(c => {
    if (uen) return c.uen.toLowerCase().includes(uen.toLowerCase());
    return c.company_name.toLowerCase().includes((name || '').toLowerCase());
  });

  res.json({
    source: 'Singapore ACRA (BizFile+)',
    country: 'SG',
    api_endpoint: 'https://data.gov.sg/api/action/datastore_search?resource_id=acra-entities',
    _dummy: true,
    result: { total: results.length, records: results }
  });
});

// --- UK Companies House ---
router.get('/corporate/uk/company-search', authenticate, async (req, res) => {
  const { name, company_number } = req.query;
  if (!name && !company_number) return res.status(400).json({ error: 'Provide name or company_number parameter' });

  const results = [
    { company_number: 'FC023631', company_name: 'HSBC Holdings plc', status: 'Active', incorporation_date: '1991-01-01', company_type: 'PLC', country: 'UK' },
    { company_number: 'OC301011', company_name: 'Standard Chartered PLC', status: 'Active', incorporation_date: '1969-12-01', company_type: 'PLC', country: 'UK' },
    { company_number: 'SC090312', company_name: 'Royal Bank of Scotland Group plc', status: 'Active', incorporation_date: '1968-03-25', company_type: 'PLC', country: 'UK' },
    { company_number: '10662210', company_name: 'Crown Delta Financial Services Ltd', status: 'Active', incorporation_date: '2017-03-13', company_type: 'Private Limited Company', country: 'UK' },
  ].filter(c => {
    if (company_number) return c.company_number.toLowerCase().includes(company_number.toLowerCase());
    return c.company_name.toLowerCase().includes((name || '').toLowerCase());
  });

  res.json({
    source: 'UK Companies House',
    country: 'UK',
    api_endpoint: 'https://api.company-information.service.gov.uk/search/companies',
    _dummy: true,
    result: { total: results.length, records: results }
  });
});

// --- Corporate Registry: Director / Shareholder Search ---
router.get('/corporate/:country/director-shareholder-search', authenticate, async (req, res) => {
  const { country } = req.params;
  const { name, company_name, role = 'both' } = req.query;
  if (!name && !company_name) {
    return res.status(400).json({ error: 'Provide name or company_name parameter' });
  }

  const dataset = [
    { country: 'HK', company_name: 'HSBC Hong Kong', person_name: 'Peter Wong', role: 'Director', identifier: 'CR-0012345', status: 'Active' },
    { country: 'HK', company_name: 'AIA International Limited', person_name: 'Lee Yuan Siong', role: 'Director', identifier: 'CR-0054321', status: 'Active' },
    { country: 'HK', company_name: 'Goldman Sachs Asia LLC', person_name: 'GS Nominees Limited', role: 'Shareholder', identifier: 'CR-0067890', status: 'Active' },
    { country: 'SG', company_name: 'DBS Group Holdings Ltd', person_name: 'Piyush Gupta', role: 'Director', identifier: '199901234A', status: 'Live' },
    { country: 'SG', company_name: 'OCBC Securities Pte Ltd', person_name: 'Great Eastern Holdings', role: 'Shareholder', identifier: '200501234B', status: 'Live' },
    { country: 'CN', company_name: 'CITIC Securities Co., Ltd.', person_name: 'Li Jian', role: 'Director', identifier: 'CSRC-CN-1001', status: 'Active' },
    { country: 'JP', company_name: 'Nomura Securities Co., Ltd.', person_name: 'Sato Haruto', role: 'Director', identifier: 'FSA-JP-2101', status: 'Active' },
    { country: 'KR', company_name: 'Mirae Asset Securities Co., Ltd.', person_name: 'Kim Ji Hoon', role: 'Director', identifier: 'FSS-KR-3101', status: 'Active' },
    { country: 'TW', company_name: 'Cathay Securities Corp.', person_name: 'Lin Wei Ting', role: 'Director', identifier: 'FSC-TW-4101', status: 'Active' },
    { country: 'IN', company_name: 'HDFC Securities Limited', person_name: 'Arjun Mehta', role: 'Director', identifier: 'RBI-IN-5101', status: 'Active' },
    { country: 'UK', company_name: 'HSBC Holdings plc', person_name: 'Mark Tucker', role: 'Director', identifier: 'FC023631', status: 'Active' },
    { country: 'UK', company_name: 'Standard Chartered PLC', person_name: 'Temasek Holdings', role: 'Shareholder', identifier: 'OC301011', status: 'Active' },
    { country: 'DE', company_name: 'Deutsche Bank AG', person_name: 'Lukas Meyer', role: 'Director', identifier: 'BAFIN-DE-6101', status: 'Active' },
    { country: 'FR', company_name: 'BNP Paribas S.A.', person_name: 'Marie Laurent', role: 'Director', identifier: 'AMF-FR-7101', status: 'Active' },
    { country: 'IT', company_name: 'UniCredit S.p.A.', person_name: 'Giulia Rossi', role: 'Director', identifier: 'CONSOB-IT-8101', status: 'Active' },
    { country: 'ES', company_name: 'Banco Santander, S.A.', person_name: 'Sofia García', role: 'Director', identifier: 'CNMV-ES-9101', status: 'Active' },
    { country: 'NL', company_name: 'ING Bank N.V.', person_name: 'Eva van Dijk', role: 'Director', identifier: 'AFM-NL-1011', status: 'Active' },
    { country: 'CH', company_name: 'UBS Group AG', person_name: 'Emma Keller', role: 'Director', identifier: 'FINMA-CH-1111', status: 'Active' },
    { country: 'US', company_name: 'JPMorgan Chase & Co.', person_name: 'Olivia Chen', role: 'Director', identifier: 'SEC-US-1211', status: 'Active' },
    { country: 'CA', company_name: 'Scotiabank', person_name: 'Liam Brown', role: 'Director', identifier: 'IIROC-CA-1311', status: 'Active' },
    { country: 'BR', company_name: 'Itaú Unibanco Holding S.A.', person_name: 'Mateo Silva', role: 'Director', identifier: 'CVM-BR-1411', status: 'Active' },
    { country: 'MX', company_name: 'BBVA México S.A.', person_name: 'Diego Hernández', role: 'Director', identifier: 'CNBV-MX-1511', status: 'Active' },
    { country: 'HK', company_name: 'Harbour Peak Advisory Limited', person_name: 'James Lee', role: 'Director', identifier: 'CR-0072201', status: 'Active' },
    { country: 'SG', company_name: 'Lion Rock Capital Pte. Ltd.', person_name: 'James Lee', role: 'Director', identifier: '201233445N', status: 'Live' },
    { country: 'UK', company_name: 'Crown Delta Financial Services Ltd', person_name: 'James Lee', role: 'Shareholder', identifier: '10662210', status: 'Active' },
    { country: 'CN', company_name: 'CITIC Securities Co., Ltd.', person_name: 'James Lee', role: 'Shareholder', identifier: 'CSRC-CN-1001', status: 'Active' },
    { country: 'JP', company_name: 'Nomura Securities Co., Ltd.', person_name: 'James Lee', role: 'Shareholder', identifier: 'FSA-JP-2101', status: 'Active' },
    { country: 'KR', company_name: 'Mirae Asset Securities Co., Ltd.', person_name: 'James Lee', role: 'Shareholder', identifier: 'FSS-KR-3101', status: 'Active' },
    { country: 'TW', company_name: 'Cathay Securities Corp.', person_name: 'James Lee', role: 'Shareholder', identifier: 'FSC-TW-4101', status: 'Active' },
    { country: 'IN', company_name: 'HDFC Securities Limited', person_name: 'James Lee', role: 'Shareholder', identifier: 'RBI-IN-5101', status: 'Active' },
    { country: 'DE', company_name: 'Deutsche Bank AG', person_name: 'James Lee', role: 'Shareholder', identifier: 'BAFIN-DE-6101', status: 'Active' },
    { country: 'FR', company_name: 'BNP Paribas S.A.', person_name: 'James Lee', role: 'Shareholder', identifier: 'AMF-FR-7101', status: 'Active' },
    { country: 'IT', company_name: 'UniCredit S.p.A.', person_name: 'James Lee', role: 'Shareholder', identifier: 'CONSOB-IT-8101', status: 'Active' },
    { country: 'ES', company_name: 'Banco Santander, S.A.', person_name: 'James Lee', role: 'Shareholder', identifier: 'CNMV-ES-9101', status: 'Active' },
    { country: 'NL', company_name: 'ING Bank N.V.', person_name: 'James Lee', role: 'Shareholder', identifier: 'AFM-NL-1011', status: 'Active' },
    { country: 'CH', company_name: 'UBS Group AG', person_name: 'James Lee', role: 'Shareholder', identifier: 'FINMA-CH-1111', status: 'Active' },
    { country: 'US', company_name: 'JPMorgan Chase & Co.', person_name: 'James Lee', role: 'Shareholder', identifier: 'SEC-US-1211', status: 'Active' },
    { country: 'CA', company_name: 'Scotiabank', person_name: 'James Lee', role: 'Shareholder', identifier: 'IIROC-CA-1311', status: 'Active' },
    { country: 'BR', company_name: 'Itaú Unibanco Holding S.A.', person_name: 'James Lee', role: 'Shareholder', identifier: 'CVM-BR-1411', status: 'Active' },
    { country: 'MX', company_name: 'BBVA México S.A.', person_name: 'James Lee', role: 'Shareholder', identifier: 'CNBV-MX-1511', status: 'Active' },
  ];

  const normalizedCountry = String(country || '').toUpperCase();
  const roleFilter = String(role || 'both').toLowerCase();
  const allowedRoles = ['director', 'shareholder', 'both'];
  const finalRole = allowedRoles.includes(roleFilter) ? roleFilter : 'both';

  const records = dataset.filter((item) => {
    let match = item.country === normalizedCountry;
    if (name) {
      const needle = name.toLowerCase();
      match = match && item.person_name.toLowerCase().includes(needle);
    }
    if (company_name) {
      const needle = company_name.toLowerCase();
      match = match && item.company_name.toLowerCase().includes(needle);
    }
    if (finalRole !== 'both') {
      match = match && item.role.toLowerCase() === finalRole;
    }
    return match;
  });

  res.json({
    source: `${normalizedCountry} Corporate Registry`,
    country: normalizedCountry,
    api_endpoint: `/api/integrations/corporate/${normalizedCountry.toLowerCase()}/director-shareholder-search`,
    _dummy: true,
    result: { total: records.length, records }
  });
});

// ============================================================
// REGULATOR REGISTER APIs
// ============================================================

// --- License Search ---
router.get('/regulator/license-search', authenticate, async (req, res) => {
  const { name, license_number, country, regulator } = req.query;
  if (!name && !license_number) return res.status(400).json({ error: 'Provide name or license_number parameter' });

  const allLicenses = [
    // HK - HKMA
    { license_number: 'AI-001', entity_name: 'HSBC Hong Kong', regulator: 'HKMA', license_type: 'Authorized Institution (Licensed Bank)', status: 'Active', issue_date: '1990-01-01', expiry_date: null, country: 'HK' },
    { license_number: 'AI-002', entity_name: 'Bank of China (Hong Kong) Limited', regulator: 'HKMA', license_type: 'Authorized Institution (Licensed Bank)', status: 'Active', issue_date: '2001-10-01', expiry_date: null, country: 'HK' },
    // HK - SFC
    { license_number: 'SFC-CE-001234', entity_name: 'Goldman Sachs (Asia) L.L.C.', regulator: 'SFC', license_type: 'Licensed Corporation (Type 1, 4, 6, 7, 9)', status: 'Active', issue_date: '2003-04-01', expiry_date: null, country: 'HK' },
    { license_number: 'SFC-CE-005678', entity_name: 'JP Morgan Securities (Asia Pacific) Limited', regulator: 'SFC', license_type: 'Licensed Corporation (Type 1, 2, 4, 5)', status: 'Active', issue_date: '2005-07-15', expiry_date: null, country: 'HK' },
    // HK - IA
    { license_number: 'IA-FA-0001', entity_name: 'AIA International Limited', regulator: 'IA', license_type: 'Authorized Insurer', status: 'Active', issue_date: '2015-09-01', expiry_date: null, country: 'HK' },
    { license_number: 'IA-FA-0002', entity_name: 'Prudential Hong Kong Limited', regulator: 'IA', license_type: 'Authorized Insurer', status: 'Active', issue_date: '2016-01-15', expiry_date: null, country: 'HK' },
    // SG - MAS
    { license_number: 'MAS-CMS-100001', entity_name: 'DBS Vickers Securities (Singapore) Pte Ltd', regulator: 'MAS', license_type: 'Capital Markets Services License', status: 'Active', issue_date: '2002-03-01', expiry_date: null, country: 'SG' },
    { license_number: 'MAS-FA-200001', entity_name: 'Prudential Assurance Company Singapore', regulator: 'MAS', license_type: 'Financial Adviser License', status: 'Active', issue_date: '2004-08-12', expiry_date: null, country: 'SG' },
    // UK - FCA
    { license_number: 'FCA-114191', entity_name: 'HSBC UK Bank plc', regulator: 'FCA', license_type: 'Authorized Firm', status: 'Active', issue_date: '2001-12-01', expiry_date: null, country: 'UK' },
    { license_number: 'FCA-186171', entity_name: 'Barclays Bank PLC', regulator: 'FCA', license_type: 'Authorized Firm', status: 'Active', issue_date: '2001-12-01', expiry_date: null, country: 'UK' },
    { license_number: 'SFC-LEE-7788', entity_name: 'Harbour Peak Advisory Limited', regulator: 'SFC', license_type: 'Licensed Representative (Type 1, 4)', status: 'Active', issue_date: '2020-03-15', expiry_date: null, country: 'HK' },
    { license_number: 'HKMA-RI-88231', entity_name: 'HSBC Hong Kong', regulator: 'HKMA', license_type: 'Relevant Individual', status: 'Active', issue_date: '2022-01-10', expiry_date: null, country: 'HK' },
    { license_number: 'MAS-CMS-LEE-311', entity_name: 'Lion Rock Capital Pte. Ltd.', regulator: 'MAS', license_type: 'Capital Markets Services Representative', status: 'Active', issue_date: '2021-06-20', expiry_date: null, country: 'SG' },
    { license_number: 'FCA-SM-77221', entity_name: 'Crown Delta Financial Services Ltd', regulator: 'FCA', license_type: 'Senior Manager Function', status: 'Active', issue_date: '2023-02-01', expiry_date: null, country: 'UK' },
    // Revoked example
    { license_number: 'SFC-CE-009999', entity_name: 'XYZ Securities Ltd', regulator: 'SFC', license_type: 'Licensed Corporation (Type 1)', status: 'Revoked', issue_date: '2010-01-01', expiry_date: '2022-06-30', country: 'HK', revocation_reason: 'Failure to comply with AML requirements' },
  ];

  let licenseDataset = [...allLicenses];
  let hkmaLiveEnabled = false;
  let hkmaLiveCached = false;

  const normalizedCountry = String(country || '').toUpperCase();
  const normalizedRegulator = String(regulator || '').toUpperCase();
  const shouldUseHkmaLive = (
    (!country || normalizedCountry === 'HK')
    && (!regulator || normalizedRegulator === 'ALL' || normalizedRegulator === 'HKMA')
  );

  if (shouldUseHkmaLive) {
    try {
      const hkma = await fetchHkmaLiveAis();
      hkmaLiveEnabled = true;
      hkmaLiveCached = hkma.cached;

      const mappedLiveLicenses = (hkma.records || []).map((item, index) => {
        const secstaffUrl = item?.secstaff_reg_url || '';
        const riMatch = String(secstaffUrl).match(/(?:\?|&)ri=(\d+)/i);
        const derivedLicense = riMatch ? `HKMA-RI-${riMatch[1]}` : `HKMA-AI-${index + 1}`;
        return {
          license_number: derivedLicense,
          entity_name: item?.name || 'Unknown HKMA Institution',
          regulator: 'HKMA',
          license_type: item?.type || 'Authorized Institution',
          status: 'Active',
          issue_date: null,
          expiry_date: null,
          country: 'HK',
          local_address: item?.local_address || null,
        };
      });

      licenseDataset = [
        ...allLicenses.filter((item) => !(String(item.country).toUpperCase() === 'HK' && String(item.regulator).toUpperCase() === 'HKMA')),
        ...mappedLiveLicenses,
      ];
    } catch (_err) {
      hkmaLiveEnabled = false;
      hkmaLiveCached = false;
    }
  }

  const filtered = licenseDataset.filter(l => {
    let match = true;
    if (name) match = match && l.entity_name.toLowerCase().includes(name.toLowerCase());
    if (license_number) match = match && l.license_number.toLowerCase().includes(license_number.toLowerCase());
    if (country) match = match && l.country.toLowerCase() === country.toLowerCase();
    if (regulator && String(regulator).toLowerCase() !== 'all') {
      match = match && l.regulator.toLowerCase() === String(regulator).toLowerCase();
    }
    return match;
  });

  res.json({
    source: shouldUseHkmaLive ? 'Multi-Regulator License Register (HKMA live for Hong Kong)' : 'Multi-Regulator License Register',
    api_endpoint: '/api/integrations/regulator/license-search',
    _dummy: !hkmaLiveEnabled,
    _hkma_live: hkmaLiveEnabled,
    _hkma_cached: hkmaLiveCached,
    result: { total: filtered.length, records: filtered }
  });
});

// --- Licensee-to-Company Association Search ---
router.get('/regulator/licensee-association-search', authenticate, async (req, res) => {
  const { surname = '', first_name = '', given_name = '', license_number = '', country, regulator } = req.query;

  const normalizedSurname = String(surname).trim();
  const normalizedFirstName = String(first_name || given_name).trim();
  const normalizedLicense = String(license_number || '').trim();
  if (!normalizedSurname || !normalizedFirstName) {
    return res.status(400).json({ error: 'Provide surname and first_name parameters' });
  }

  const data = [
    { full_name: 'CHAN Wai Ling', surname: 'CHAN', first_name: 'Wai Ling', associated_company: 'Goldman Sachs (Asia) L.L.C.', regulator: 'SFC', country: 'HK', license_number: 'SFC-CE-001234', role: 'Licensed Representative', status: 'Active' },
    { full_name: 'CHAN Yi Xuan', surname: 'CHAN', first_name: 'Yi Xuan', associated_company: 'DBS Vickers Securities (Singapore) Pte Ltd', regulator: 'MAS', country: 'SG', license_number: 'MAS-CMS-100001', role: 'Capital Markets Rep', status: 'Active' },
    { full_name: 'CHAN William', surname: 'CHAN', first_name: 'William', associated_company: 'HSBC UK Bank plc', regulator: 'FCA', country: 'UK', license_number: 'FCA-114191', role: 'Approved Person', status: 'Active' },
    { full_name: 'CHAN Rebecca', surname: 'CHAN', first_name: 'Rebecca', associated_company: 'Barclays Bank PLC', regulator: 'PRA', country: 'UK', license_number: 'PRA-SM-88221', role: 'Senior Manager', status: 'Former' },
    { full_name: 'CHAN Li Wei', surname: 'CHAN', first_name: 'Li Wei', associated_company: 'Industrial and Commercial Bank of China (Asia) Limited', regulator: 'HKMA', country: 'HK', license_number: 'HKMA-RI-100087', role: 'Relationship Manager', status: 'Active' },
    { full_name: 'CHAN Olivia', surname: 'CHAN', first_name: 'Olivia', associated_company: 'JPMorgan Chase Bank, N.A.', regulator: 'SEC', country: 'US', license_number: 'SEC-IAR-778312', role: 'Investment Adviser Representative', status: 'Active' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Harbour Peak Advisory Limited', regulator: 'SFC', country: 'HK', license_number: 'SFC-LEE-7788', role: 'Licensed Representative', status: 'Active' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'HSBC Hong Kong', regulator: 'HKMA', country: 'HK', license_number: 'HKMA-RI-88231', role: 'Relationship Manager', status: 'Active' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Lion Rock Capital Pte. Ltd.', regulator: 'MAS', country: 'SG', license_number: 'MAS-CMS-LEE-311', role: 'Capital Markets Rep', status: 'Active' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Crown Delta Financial Services Ltd', regulator: 'FCA', country: 'UK', license_number: 'FCA-SM-77221', role: 'Senior Manager', status: 'Active' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'CITIC Securities Co., Ltd.', regulator: 'CSRC', country: 'CN', license_number: 'CSRC-LR-22001', role: 'Registered Representative', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Nomura Securities Co., Ltd.', regulator: 'FSA_JP', country: 'JP', license_number: 'FSA-JP-LR-32001', role: 'Sales Trader', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Mirae Asset Securities Co., Ltd.', regulator: 'FSS_KR', country: 'KR', license_number: 'FSS-KR-LR-42001', role: 'Investment Advisor', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Cathay Securities Corp.', regulator: 'FSC_TW', country: 'TW', license_number: 'FSC-TW-LR-52001', role: 'Broker', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'HDFC Securities Limited', regulator: 'RBI', country: 'IN', license_number: 'RBI-LR-62001', role: 'Relationship Manager', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Deutsche Bank AG', regulator: 'BAFIN', country: 'DE', license_number: 'BAFIN-LR-72001', role: 'Senior Banker', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'BNP Paribas S.A.', regulator: 'AMF_FR', country: 'FR', license_number: 'AMF-FR-LR-82001', role: 'Portfolio Manager', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'UniCredit S.p.A.', regulator: 'CONSOB', country: 'IT', license_number: 'CONSOB-LR-92001', role: 'Advisor', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Banco Santander, S.A.', regulator: 'CNMV', country: 'ES', license_number: 'CNMV-LR-10201', role: 'Licensed Representative', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'ING Bank N.V.', regulator: 'AFM_NL', country: 'NL', license_number: 'AFM-NL-LR-11201', role: 'Compliance Associate', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'UBS Group AG', regulator: 'FINMA', country: 'CH', license_number: 'FINMA-LR-12201', role: 'Relationship Manager', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'JPMorgan Chase & Co.', regulator: 'SEC', country: 'US', license_number: 'SEC-IAR-13201', role: 'Investment Adviser Representative', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Scotiabank', regulator: 'IIROC', country: 'CA', license_number: 'IIROC-LR-14201', role: 'Advising Representative', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'Itaú Unibanco Holding S.A.', regulator: 'CVM_BR', country: 'BR', license_number: 'CVM-BR-LR-15201', role: 'Investment Advisor', status: 'Former' },
    { full_name: 'LEE James', surname: 'LEE', first_name: 'James', associated_company: 'BBVA México S.A.', regulator: 'CNBV_MX', country: 'MX', license_number: 'CNBV-MX-LR-16201', role: 'Branch Manager', status: 'Former' },
  ];

  const records = data.filter((item) => {
    let match = item.surname.toLowerCase().includes(normalizedSurname.toLowerCase())
      && item.first_name.toLowerCase().includes(normalizedFirstName.toLowerCase());

    if (normalizedLicense) {
      match = match && item.license_number.toLowerCase().includes(normalizedLicense.toLowerCase());
    }
    if (country) {
      match = match && item.country.toLowerCase() === String(country).toLowerCase();
    }
    if (regulator && String(regulator).toLowerCase() !== 'all') {
      match = match && item.regulator.toLowerCase() === String(regulator).toLowerCase();
    }
    return match;
  });

  res.json({
    source: 'Licensee-to-Company Association Search',
    api_endpoint: '/api/integrations/regulator/licensee-association-search',
    _dummy: true,
    result: { total: records.length, records },
  });
});

// --- License Issues / Disciplinary Actions ---
router.get('/regulator/license-issues', authenticate, async (req, res) => {
  const { name, license_number, country, regulator } = req.query;
  if (!name && !license_number) return res.status(400).json({ error: 'Provide name or license_number parameter' });

  const allIssues = [
    {
      issue_id: 'DA-2024-001',
      entity_name: 'XYZ Securities Ltd',
      license_number: 'SFC-CE-009999',
      regulator: 'SFC',
      country: 'HK',
      issue_type: 'Disciplinary Action',
      description: 'Failure to implement adequate AML/CFT systems and controls. Multiple breaches of Code of Conduct detected during routine inspection.',
      action_taken: 'License Revoked, Fine of HKD 5,000,000',
      date: '2022-06-30',
      status: 'Concluded',
    },
    {
      issue_id: 'DA-2023-045',
      entity_name: 'ABC Insurance Brokers Ltd',
      license_number: 'IA-IB-0050',
      regulator: 'IA',
      country: 'HK',
      issue_type: 'Public Reprimand',
      description: 'Failure to exercise due care in handling client claims. Misleading product representations to policyholders.',
      action_taken: 'Public Reprimand, Fine of HKD 1,500,000',
      date: '2023-09-15',
      status: 'Concluded',
    },
    {
      issue_id: 'DA-2024-012',
      entity_name: 'Global Trading Pte Ltd',
      license_number: 'MAS-CMS-300123',
      regulator: 'MAS',
      country: 'SG',
      issue_type: 'Prohibition Order',
      description: 'Unauthorized trading activities and unauthorized use of client funds.',
      action_taken: 'Prohibition Order (5 years), Referral to Police',
      date: '2024-03-20',
      status: 'Active',
    },
    {
      issue_id: 'DA-2023-FCA-001',
      entity_name: 'Quick Loans UK Ltd',
      license_number: 'FCA-999888',
      regulator: 'FCA',
      country: 'UK',
      issue_type: 'Final Notice',
      description: 'Failure to treat customers fairly. Excessive charges on consumer credit products.',
      action_taken: 'Fine of GBP 2,300,000, Requirement to provide customer remediation',
      date: '2023-11-08',
      status: 'Concluded',
    },
    {
      issue_id: 'DA-2025-002',
      entity_name: 'Smith & Associates Advisory',
      license_number: 'SFC-CE-007777',
      regulator: 'SFC',
      country: 'HK',
      issue_type: 'Suspension',
      description: 'Suspected insider dealing. Investigation ongoing by SFC enforcement division.',
      action_taken: 'License Suspended pending investigation',
      date: '2025-01-10',
      status: 'Under Investigation',
    },
    {
      issue_id: 'DA-2025-LEE-011',
      entity_name: 'Harbour Peak Advisory Limited',
      license_number: 'SFC-LEE-7788',
      regulator: 'SFC',
      country: 'HK',
      issue_type: 'Remediation Notice',
      description: 'Control weakness identified in suitability documentation process for a subset of structured product recommendations linked to James Lee client files.',
      action_taken: 'Independent review required and remediation plan submitted to SFC.',
      date: '2025-10-11',
      status: 'Remediation Ongoing',
    },
  ];

  const filtered = allIssues.filter(i => {
    let match = true;
    if (name) match = match && i.entity_name.toLowerCase().includes(name.toLowerCase());
    if (license_number) match = match && i.license_number.toLowerCase().includes(license_number.toLowerCase());
    if (country) match = match && i.country.toLowerCase() === country.toLowerCase();
    if (regulator && String(regulator).toLowerCase() !== 'all') {
      match = match && i.regulator.toLowerCase() === String(regulator).toLowerCase();
    }
    return match;
  });

  res.json({
    source: 'Multi-Regulator Disciplinary Actions Register',
    api_endpoint: '/api/integrations/regulator/license-issues',
    _dummy: true,
    result: { total: filtered.length, records: filtered }
  });
});

// --- Civil Litigation Search ---
router.get('/regulator/civil-litigation', authenticate, async (req, res) => {
  const { name, entity_name, country } = req.query;
  const searchName = name || entity_name;
  if (!searchName) return res.status(400).json({ error: 'Provide name or entity_name parameter' });

  const allCases = [
    {
      case_id: 'HCAL-2023-001234',
      case_name: 'SFC v. XYZ Securities Ltd',
      court: 'High Court of Hong Kong',
      country: 'HK',
      plaintiff: 'Securities and Futures Commission',
      defendant: 'XYZ Securities Ltd',
      case_type: 'Market Misconduct - Insider Dealing',
      filing_date: '2023-02-15',
      status: 'Judgment Entered',
      outcome: 'Defendant found liable. Ordered to pay disgorgement of HKD 12,000,000 and costs.',
    },
    {
      case_id: 'HCAL-2024-005678',
      case_name: 'Re: ABC Insurance Brokers Ltd (winding up)',
      court: 'High Court of Hong Kong',
      country: 'HK',
      plaintiff: 'Official Receiver',
      defendant: 'ABC Insurance Brokers Ltd',
      case_type: 'Insolvency - Compulsory Winding Up',
      filing_date: '2024-06-01',
      status: 'Ongoing',
      outcome: null,
    },
    {
      case_id: 'OS-2024-SG-00123',
      case_name: 'MAS v. Global Trading Pte Ltd',
      court: 'High Court of Singapore',
      country: 'SG',
      plaintiff: 'Monetary Authority of Singapore',
      defendant: 'Global Trading Pte Ltd',
      case_type: 'Securities Fraud',
      filing_date: '2024-05-10',
      status: 'Ongoing',
      outcome: null,
    },
    {
      case_id: 'HC-2022-UK-045678',
      case_name: 'FCA v. Quick Loans UK Ltd',
      court: 'High Court of England and Wales',
      country: 'UK',
      plaintiff: 'Financial Conduct Authority',
      defendant: 'Quick Loans UK Ltd',
      case_type: 'Consumer Protection Breach',
      filing_date: '2022-08-20',
      status: 'Judgment Entered',
      outcome: 'Injunction granted. Defendant ordered to cease operations and pay restitution.',
    },
    {
      case_id: 'HCAL-2025-009876',
      case_name: 'Chan v. HSBC Hong Kong',
      court: 'District Court of Hong Kong',
      country: 'HK',
      plaintiff: 'Chan Tai Man',
      defendant: 'HSBC Hong Kong',
      case_type: 'Negligence - Investment Advisory',
      filing_date: '2025-01-05',
      status: 'Pre-trial',
      outcome: null,
    },
    {
      case_id: 'HCAL-2025-LEE-022',
      case_name: 'Lee v. Harbour Peak Advisory Limited',
      court: 'District Court of Hong Kong',
      country: 'HK',
      plaintiff: 'James Lee',
      defendant: 'Harbour Peak Advisory Limited',
      case_type: 'Employment and bonus dispute',
      filing_date: '2025-09-18',
      status: 'Mediation',
      outcome: null,
    },
  ];

  const filtered = allCases.filter(c => {
    let match = c.case_name.toLowerCase().includes(searchName.toLowerCase()) ||
                c.plaintiff.toLowerCase().includes(searchName.toLowerCase()) ||
                c.defendant.toLowerCase().includes(searchName.toLowerCase());
    if (country) match = match && c.country.toLowerCase() === country.toLowerCase();
    return match;
  });

  res.json({
    source: 'Multi-Jurisdiction Civil Litigation Register',
    api_endpoint: '/api/integrations/regulator/civil-litigation',
    _dummy: true,
    result: { total: filtered.length, records: filtered }
  });
});

// --- Securities Staff Search by Regulator Checklist ---
router.get('/regulator/securities-staff-search', authenticate, async (req, res) => {
  const { surname = '', given_name = '', first_name = '', country } = req.query;
  const regulators = [];
  if (Array.isArray(req.query.regulators)) {
    regulators.push(...req.query.regulators);
  } else if (req.query.regulators) {
    regulators.push(req.query.regulators);
  }

  const normalizedSurname = surname.trim();
  const normalizedGivenName = String(given_name || first_name || '').trim();

  if (!normalizedSurname || !normalizedGivenName) {
    return res.status(400).json({ error: 'Provide surname and given_name parameters' });
  }

  const looksLikePersonName = /^[A-Za-z\s'\-\.]{2,80}$/;
  const companyKeywordPattern = /\b(ltd|limited|llc|plc|inc|bank|holdings|group|company|corp|corporation)\b/i;
  if (
    !looksLikePersonName.test(normalizedSurname)
    || !looksLikePersonName.test(normalizedGivenName)
    || /\d/.test(normalizedSurname)
    || /\d/.test(normalizedGivenName)
    || companyKeywordPattern.test(normalizedSurname)
    || companyKeywordPattern.test(normalizedGivenName)
  ) {
    return res.status(400).json({ error: 'surname and given_name must be person names only' });
  }

  const normalizedRegulators = regulators.map((r) => String(r).toUpperCase());
  const data = [
    { full_name: 'CHAN Tai Man', institution: 'HSBC Hong Kong', regulator: 'HKMA', country: 'HK', status: 'Current', role: 'Relationship Manager', risk_level: 'Medium', watch_reason: 'Heightened AML monitoring from regulator notice' },
    { full_name: 'CHAN Wai Ling', institution: 'Goldman Sachs Asia', regulator: 'SFC', country: 'HK', status: 'Current', role: 'Licensed Representative', risk_level: 'High', watch_reason: 'Named in ongoing market misconduct investigation' },
    { full_name: 'CHAN Ka Ming', institution: 'AIA International', regulator: 'IA', country: 'HK', status: 'Former', role: 'Insurance Intermediary', risk_level: 'Low', watch_reason: 'Past customer complaint history under review' },
    { full_name: 'CHAN Daniel', institution: 'Sun Life', regulator: 'MPFA', country: 'HK', status: 'Current', role: 'MPF Intermediary', risk_level: 'Medium', watch_reason: 'Compliance remediation follow-up pending' },
    { full_name: 'CHAN Yi Xuan', institution: 'DBS Vickers', regulator: 'MAS', country: 'SG', status: 'Current', role: 'Capital Markets Rep', risk_level: 'High', watch_reason: 'Cross-border suitability controls escalation' },
    { full_name: 'CHAN William', institution: 'HSBC UK', regulator: 'FCA', country: 'UK', status: 'Current', role: 'Approved Person', risk_level: 'Low', watch_reason: 'Periodic enhanced due diligence review' },
    { full_name: 'CHAN Rebecca', institution: 'Barclays', regulator: 'PRA', country: 'UK', status: 'Former', role: 'Senior Manager', risk_level: 'Medium', watch_reason: 'Senior manager accountability inquiry reference' },
    { full_name: 'CHAN Li Wei', institution: 'ICBC', regulator: 'PBOC', country: 'CN', status: 'Current', role: 'Compliance Officer', risk_level: 'Medium', watch_reason: 'Cross-border transaction monitoring alert' },
    { full_name: 'CHAN Ming Yu', institution: 'CITIC Securities', regulator: 'CSRC', country: 'CN', status: 'Current', role: 'Registered Representative', risk_level: 'High', watch_reason: 'Market manipulation inquiry watchlist' },
    { full_name: 'CHAN Haruto', institution: 'Nomura Securities', regulator: 'FSA_JP', country: 'JP', status: 'Current', role: 'Sales Trader', risk_level: 'Low', watch_reason: 'Routine suitability controls review' },
    { full_name: 'CHAN Ji Hoon', institution: 'Mirae Asset Securities', regulator: 'FSS_KR', country: 'KR', status: 'Current', role: 'Investment Advisor', risk_level: 'Medium', watch_reason: 'Product governance remediation tracking' },
    { full_name: 'CHAN Wei Ting', institution: 'Cathay Securities', regulator: 'FSC_TW', country: 'TW', status: 'Current', role: 'Broker', risk_level: 'Low', watch_reason: 'Periodic customer protection review' },
    { full_name: 'CHAN Arjun', institution: 'HDFC Bank', regulator: 'RBI', country: 'IN', status: 'Current', role: 'Relationship Manager', risk_level: 'Medium', watch_reason: 'Enhanced PEP screening follow-up' },
    { full_name: 'CHAN Marie', institution: 'BNP Paribas', regulator: 'AMF_FR', country: 'FR', status: 'Current', role: 'Portfolio Manager', risk_level: 'High', watch_reason: 'Conduct risk thematic review' },
    { full_name: 'CHAN Lukas', institution: 'Deutsche Bank', regulator: 'BAFIN', country: 'DE', status: 'Current', role: 'Senior Banker', risk_level: 'Medium', watch_reason: 'AML control effectiveness review' },
    { full_name: 'CHAN Isabella', institution: 'UniCredit', regulator: 'CONSOB', country: 'IT', status: 'Former', role: 'Advisor', risk_level: 'Low', watch_reason: 'Historical complaint trend monitoring' },
    { full_name: 'CHAN Sofia', institution: 'Banco Santander', regulator: 'CNMV', country: 'ES', status: 'Current', role: 'Licensed Representative', risk_level: 'Medium', watch_reason: 'Investor protection inquiry follow-up' },
    { full_name: 'CHAN Eva', institution: 'ING', regulator: 'AFM_NL', country: 'NL', status: 'Current', role: 'Compliance Associate', risk_level: 'Low', watch_reason: 'Routine controls testing exception' },
    { full_name: 'CHAN Emma', institution: 'UBS', regulator: 'FINMA', country: 'CH', status: 'Current', role: 'Relationship Manager', risk_level: 'Medium', watch_reason: 'Cross-border onboarding remediation' },
    { full_name: 'CHAN Olivia', institution: 'JPMorgan Chase', regulator: 'SEC', country: 'US', status: 'Current', role: 'Investment Advisor', risk_level: 'High', watch_reason: 'Enforcement cooperation notice review' },
    { full_name: 'CHAN Noah', institution: 'Morgan Stanley', regulator: 'FINRA', country: 'US', status: 'Current', role: 'Broker-Dealer Rep', risk_level: 'Medium', watch_reason: 'Trade surveillance escalation' },
    { full_name: 'CHAN Liam', institution: 'Scotiabank', regulator: 'IIROC', country: 'CA', status: 'Current', role: 'Advising Representative', risk_level: 'Low', watch_reason: 'Suitability file enhancement' },
    { full_name: 'CHAN Mateo', institution: 'Itaú Unibanco', regulator: 'CVM_BR', country: 'BR', status: 'Current', role: 'Investment Advisor', risk_level: 'Medium', watch_reason: 'Retail conduct supervision alert' },
    { full_name: 'CHAN Diego', institution: 'BBVA México', regulator: 'CNBV_MX', country: 'MX', status: 'Current', role: 'Branch Manager', risk_level: 'Medium', watch_reason: 'Internal fraud control watch' },
    { full_name: 'LEE James', institution: 'HSBC Hong Kong', regulator: 'HKMA', country: 'HK', status: 'Current', role: 'Relationship Manager', risk_level: 'Medium', watch_reason: 'Demo profile: periodic enhanced suitability and AML sampling review.' },
    { full_name: 'LEE James', institution: 'Harbour Peak Advisory Limited', regulator: 'SFC', country: 'HK', status: 'Former', role: 'Licensed Representative', risk_level: 'High', watch_reason: 'Linked to remediation notice DA-2025-LEE-011 for documentation control gaps.' },
    { full_name: 'LEE James', institution: 'Lion Rock Capital Pte. Ltd.', regulator: 'MAS', country: 'SG', status: 'Former', role: 'Capital Markets Rep', risk_level: 'Medium', watch_reason: 'Cross-border advisory controls review after role transition.' },
    { full_name: 'LEE James', institution: 'Crown Delta Financial Services Ltd', regulator: 'FCA', country: 'UK', status: 'Former', role: 'Senior Manager', risk_level: 'Low', watch_reason: 'No active sanctions; retained for historical role mapping.' },
  ];

  const matchedRecords = data.filter((item) => {
    let match = item.full_name.toLowerCase().includes(normalizedSurname.toLowerCase())
      && item.full_name.toLowerCase().includes(normalizedGivenName.toLowerCase());
    if (country) {
      match = match && item.country.toLowerCase() === String(country).toLowerCase();
    }
    if (normalizedRegulators.length > 0) {
      match = match && normalizedRegulators.includes(item.regulator.toUpperCase());
    }
    return match;
  });

  const uniqueByRegulator = new Map();
  matchedRecords.forEach((item) => {
    const key = String(item.regulator).toUpperCase();
    if (!uniqueByRegulator.has(key)) {
      uniqueByRegulator.set(key, {
        full_name: item.full_name,
        license_number: item.license_number,
        regulator: item.regulator,
        country: item.country,
      });
    }
  });

  const records = Array.from(uniqueByRegulator.values());

  res.json({
    source: 'Register of Licensees Search',
    api_endpoint: '/api/integrations/regulator/securities-staff-search',
    _dummy: true,
    selected_regulators: normalizedRegulators,
    person: {
      surname: normalizedSurname,
      given_name: normalizedGivenName,
    },
    result: { total: records.length, records }
  });
});

// --- Financial Misconduct Search ---
router.get('/regulator/financial-misconduct-search', authenticate, async (req, res) => {
  const { surname = '', given_name = '', first_name = '', country } = req.query;
  const regulators = [];
  if (Array.isArray(req.query.regulators)) {
    regulators.push(...req.query.regulators);
  } else if (req.query.regulators) {
    regulators.push(req.query.regulators);
  }

  const normalizedSurname = surname.trim();
  const normalizedGivenName = String(given_name || first_name || '').trim();
  if (!normalizedSurname || !normalizedGivenName) {
    return res.status(400).json({ error: 'Provide surname and given_name parameters' });
  }

  const looksLikePersonName = /^[A-Za-z\s'\-\.]{2,80}$/;
  const companyKeywordPattern = /\b(ltd|limited|llc|plc|inc|bank|holdings|group|company|corp|corporation)\b/i;
  if (
    !looksLikePersonName.test(normalizedSurname)
    || !looksLikePersonName.test(normalizedGivenName)
    || /\d/.test(normalizedSurname)
    || /\d/.test(normalizedGivenName)
    || companyKeywordPattern.test(normalizedSurname)
    || companyKeywordPattern.test(normalizedGivenName)
  ) {
    return res.status(400).json({ error: 'surname and given_name must be person names only' });
  }

  const normalizedRegulators = regulators.map((r) => String(r).toUpperCase());
  const data = [
    { full_name: 'CHAN Wai Ling', regulator: 'SFC', country: 'HK', case_ref: 'FM-HK-2025-001', misconduct_type: 'Market Misconduct', status: 'Under Investigation', summary: 'Potential false trading pattern identified in equity derivatives desk.' },
    { full_name: 'CHAN Yi Xuan', regulator: 'MAS', country: 'SG', case_ref: 'FM-SG-2024-118', misconduct_type: 'Suitability Breach', status: 'Concluded', summary: 'Inadequate suitability assessment for high-risk leveraged products.' },
    { full_name: 'CHAN Li Wei', regulator: 'CSRC', country: 'CN', case_ref: 'FM-CN-2025-063', misconduct_type: 'Insider Dealing', status: 'Active', summary: 'Named subject in insider dealing probe related to earnings announcements.' },
    { full_name: 'CHAN Arjun', regulator: 'RBI', country: 'IN', case_ref: 'FM-IN-2024-042', misconduct_type: 'AML Control Failure', status: 'Remediation Ongoing', summary: 'Enhanced monitoring ordered after control failures in onboarding review.' },
    { full_name: 'CHAN Olivia', regulator: 'SEC', country: 'US', case_ref: 'FM-US-2025-019', misconduct_type: 'Disclosure Violation', status: 'Filed', summary: 'Complaint filed for inadequate disclosure of conflicts of interest.' },
    { full_name: 'CHAN Noah', regulator: 'FINRA', country: 'US', case_ref: 'FM-US-2024-203', misconduct_type: 'Supervision Failure', status: 'Concluded', summary: 'Failure to supervise retail communications and recommendations.' },
    { full_name: 'CHAN Lukas', regulator: 'BAFIN', country: 'DE', case_ref: 'FM-DE-2025-007', misconduct_type: 'Product Governance', status: 'Under Review', summary: 'Product governance exception flagged in periodic control review.' },
    { full_name: 'LEE James', regulator: 'SFC', country: 'HK', case_ref: 'FM-HK-2025-LEE-01', misconduct_type: 'Suitability Documentation Gaps', status: 'Remediation Ongoing', summary: 'Supervisory review identified incomplete client rationale records; no fraud finding, remediation tracked under DA-2025-LEE-011.' },
    { full_name: 'LEE James', regulator: 'MAS', country: 'SG', case_ref: 'FM-SG-2024-LEE-09', misconduct_type: 'Advisory Control Weakness', status: 'Concluded', summary: 'Historical advisory workflow exception closed after control uplift before transfer to Hong Kong role.' },
    { full_name: 'LEE James', regulator: 'CSRC', country: 'CN', case_ref: 'FM-CN-2025-LEE-12', misconduct_type: 'Trade Surveillance Alert', status: 'Closed', summary: 'Exception review completed with no further enforcement action.' },
    { full_name: 'LEE James', regulator: 'FSA_JP', country: 'JP', case_ref: 'FM-JP-2024-LEE-03', misconduct_type: 'Suitability Process Exception', status: 'Concluded', summary: 'Periodic review highlighted documentation improvements; remediation closed.' },
    { full_name: 'LEE James', regulator: 'FSS_KR', country: 'KR', case_ref: 'FM-KR-2024-LEE-05', misconduct_type: 'Control Attestation Delay', status: 'Concluded', summary: 'Delayed attestation remediated with no client harm identified.' },
    { full_name: 'LEE James', regulator: 'FSC_TW', country: 'TW', case_ref: 'FM-TW-2024-LEE-02', misconduct_type: 'Advisory Recordkeeping Gap', status: 'Concluded', summary: 'Records gap remediated during routine branch review.' },
    { full_name: 'LEE James', regulator: 'RBI', country: 'IN', case_ref: 'FM-IN-2024-LEE-07', misconduct_type: 'Enhanced Monitoring Trigger', status: 'Remediation Ongoing', summary: 'Enhanced monitoring triggered after internal control exception trend.' },
    { full_name: 'LEE James', regulator: 'FCA', country: 'UK', case_ref: 'FM-UK-2024-LEE-08', misconduct_type: 'Conduct Rule Review', status: 'Concluded', summary: 'No breach established; thematic review closed.' },
    { full_name: 'LEE James', regulator: 'AMF_FR', country: 'FR', case_ref: 'FM-FR-2024-LEE-04', misconduct_type: 'Product Governance Exception', status: 'Under Review', summary: 'Product governance exception under periodic supervisory review.' },
    { full_name: 'LEE James', regulator: 'CONSOB', country: 'IT', case_ref: 'FM-IT-2024-LEE-06', misconduct_type: 'Advisory Disclosure Gap', status: 'Concluded', summary: 'Disclosure template updated and case closed.' },
    { full_name: 'LEE James', regulator: 'CNMV', country: 'ES', case_ref: 'FM-ES-2024-LEE-02', misconduct_type: 'Suitability Checklist Defect', status: 'Concluded', summary: 'Checklist defect corrected and validated by second-line review.' },
    { full_name: 'LEE James', regulator: 'AFM_NL', country: 'NL', case_ref: 'FM-NL-2024-LEE-01', misconduct_type: 'Client File Completeness', status: 'Concluded', summary: 'Client file completeness threshold restored after remediation.' },
    { full_name: 'LEE James', regulator: 'FINMA', country: 'CH', case_ref: 'FM-CH-2024-LEE-03', misconduct_type: 'Onboarding Exception', status: 'Concluded', summary: 'Onboarding control exception remediated with governance sign-off.' },
    { full_name: 'LEE James', regulator: 'IIROC', country: 'CA', case_ref: 'FM-CA-2024-LEE-02', misconduct_type: 'Supervision Alert', status: 'Concluded', summary: 'Supervision alert resolved with policy refresh and training.' },
    { full_name: 'LEE James', regulator: 'CVM_BR', country: 'BR', case_ref: 'FM-BR-2024-LEE-01', misconduct_type: 'Retail Conduct Review', status: 'Concluded', summary: 'Retail conduct review closed after sampling controls enhancement.' },
    { full_name: 'LEE James', regulator: 'CNBV_MX', country: 'MX', case_ref: 'FM-MX-2024-LEE-02', misconduct_type: 'Branch Control Exception', status: 'Concluded', summary: 'Branch control exception remediated and independently validated.' },
  ];

  const records = data.filter((item) => {
    let match = item.full_name.toLowerCase().includes(normalizedSurname.toLowerCase())
      && item.full_name.toLowerCase().includes(normalizedGivenName.toLowerCase());
    if (country) {
      match = match && item.country.toLowerCase() === String(country).toLowerCase();
    }
    if (normalizedRegulators.length > 0) {
      match = match && normalizedRegulators.includes(item.regulator.toUpperCase());
    }
    return match;
  });

  res.json({
    source: 'Financial Misconduct Search',
    api_endpoint: '/api/integrations/regulator/financial-misconduct-search',
    _dummy: true,
    selected_regulators: normalizedRegulators,
    result: { total: records.length, records }
  });
});

// --- Legal Search ---
router.get('/regulator/legal-search', authenticate, async (req, res) => {
  const { query = '', country } = req.query;
  const regulators = [];
  if (Array.isArray(req.query.regulators)) {
    regulators.push(...req.query.regulators);
  } else if (req.query.regulators) {
    regulators.push(req.query.regulators);
  }

  const needle = String(query).trim();
  if (!needle) {
    return res.status(400).json({ error: 'Provide query parameter' });
  }

  const normalizedRegulators = regulators.map((r) => String(r).toUpperCase());
  const legalCases = [
    { case_id: 'LEG-HK-2024-081', case_name: 'SFC v. Chan Wai Ling', regulator: 'SFC', country: 'HK', court: 'High Court of Hong Kong', status: 'Ongoing' },
    { case_id: 'LEG-SG-2025-014', case_name: 'MAS v. Chan Yi Xuan', regulator: 'MAS', country: 'SG', court: 'High Court of Singapore', status: 'Pre-trial' },
    { case_id: 'LEG-CN-2025-117', case_name: 'CSRC v. Chan Li Wei', regulator: 'CSRC', country: 'CN', court: 'Shanghai Financial Court', status: 'Filed' },
    { case_id: 'LEG-UK-2024-055', case_name: 'FCA v. Chan William', regulator: 'FCA', country: 'UK', court: 'High Court of England and Wales', status: 'Judgment Entered' },
    { case_id: 'LEG-US-2025-034', case_name: 'SEC v. Chan Olivia', regulator: 'SEC', country: 'US', court: 'US District Court (SDNY)', status: 'Ongoing' },
    { case_id: 'LEG-DE-2024-009', case_name: 'BaFin v. Chan Lukas', regulator: 'BAFIN', country: 'DE', court: 'Frankfurt Regional Court', status: 'Concluded' },
    { case_id: 'LEG-HK-2025-LEE-022', case_name: 'Lee v. Harbour Peak Advisory Limited', regulator: 'SFC', country: 'HK', court: 'District Court of Hong Kong', status: 'Mediation' },
    { case_id: 'LEG-SG-2024-LEE-009', case_name: 'MAS v. Lee James', regulator: 'MAS', country: 'SG', court: 'State Courts of Singapore', status: 'Concluded' },
    { case_id: 'LEG-CN-2024-LEE-018', case_name: 'CSRC v. Lee James', regulator: 'CSRC', country: 'CN', court: 'Shanghai Financial Court', status: 'Concluded' },
    { case_id: 'LEG-JP-2024-LEE-011', case_name: 'FSA Review: Lee James', regulator: 'FSA_JP', country: 'JP', court: 'Tokyo District Court', status: 'Concluded' },
    { case_id: 'LEG-KR-2024-LEE-015', case_name: 'FSS v. Lee James', regulator: 'FSS_KR', country: 'KR', court: 'Seoul Central District Court', status: 'Concluded' },
    { case_id: 'LEG-TW-2024-LEE-010', case_name: 'FSC Inquiry: Lee James', regulator: 'FSC_TW', country: 'TW', court: 'Taipei District Court', status: 'Concluded' },
    { case_id: 'LEG-IN-2024-LEE-013', case_name: 'RBI Supervisory Matter: Lee James', regulator: 'RBI', country: 'IN', court: 'Mumbai High Court', status: 'Under Review' },
    { case_id: 'LEG-FR-2024-LEE-006', case_name: 'AMF v. Lee James', regulator: 'AMF_FR', country: 'FR', court: 'Paris Judicial Court', status: 'Concluded' },
    { case_id: 'LEG-IT-2024-LEE-007', case_name: 'CONSOB Review: Lee James', regulator: 'CONSOB', country: 'IT', court: 'Court of Milan', status: 'Concluded' },
    { case_id: 'LEG-ES-2024-LEE-005', case_name: 'CNMV Supervisory Proceeding: Lee James', regulator: 'CNMV', country: 'ES', court: 'Madrid Provincial Court', status: 'Concluded' },
    { case_id: 'LEG-NL-2024-LEE-004', case_name: 'AFM v. Lee James', regulator: 'AFM_NL', country: 'NL', court: 'District Court of Amsterdam', status: 'Concluded' },
    { case_id: 'LEG-CH-2024-LEE-003', case_name: 'FINMA Supervisory Matter: Lee James', regulator: 'FINMA', country: 'CH', court: 'Federal Administrative Court (Switzerland)', status: 'Concluded' },
    { case_id: 'LEG-CA-2024-LEE-002', case_name: 'IIROC Proceeding: Lee James', regulator: 'IIROC', country: 'CA', court: 'Ontario Superior Court of Justice', status: 'Concluded' },
    { case_id: 'LEG-BR-2024-LEE-002', case_name: 'CVM v. Lee James', regulator: 'CVM_BR', country: 'BR', court: 'São Paulo State Court', status: 'Concluded' },
    { case_id: 'LEG-MX-2024-LEE-003', case_name: 'CNBV Administrative Matter: Lee James', regulator: 'CNBV_MX', country: 'MX', court: 'Federal Administrative Court (Mexico)', status: 'Concluded' },
  ];

  const records = legalCases.filter((item) => {
    let match = item.case_name.toLowerCase().includes(needle.toLowerCase())
      || item.case_id.toLowerCase().includes(needle.toLowerCase())
      || item.court.toLowerCase().includes(needle.toLowerCase());
    if (country) {
      match = match && item.country.toLowerCase() === String(country).toLowerCase();
    }
    if (normalizedRegulators.length > 0) {
      match = match && normalizedRegulators.includes(item.regulator.toUpperCase());
    }
    return match;
  });

  res.json({
    source: 'Legal Search',
    api_endpoint: '/api/integrations/regulator/legal-search',
    _dummy: true,
    selected_regulators: normalizedRegulators,
    result: { total: records.length, records }
  });
});

module.exports = router;
