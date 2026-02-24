// Seed data for MRCS Platform MVP
const { db, init, migrate } = require('./migrate');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  await init();
  migrate();

  const now = new Date().toISOString();
  const salt = bcrypt.genSaltSync(10);

  // --- Institutions ---
  const institutions = [
    {
      institution_id: uuidv4(),
      name_en: 'HSBC Hong Kong',
      name_zh: '香港上海滙豐銀行',
      institution_type: 'AI',
      ubi: 'UBI-HSBC-001',
      sectors: JSON.stringify(['banking', 'securities']),
      regulators: JSON.stringify(['HKMA', 'SFC']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-001', SFC: 'AAA001' }),
      status: 'active',
      contact_email: 'mrc@hsbc.com.hk',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Bank of China (Hong Kong)',
      name_zh: '中國銀行(香港)',
      institution_type: 'AI',
      ubi: 'UBI-BOCHK-002',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-002' }),
      status: 'active',
      contact_email: 'mrc@bochk.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'AIA International Limited',
      name_zh: '友邦保險(國際)',
      institution_type: 'Licensed_Agency_IA',
      ubi: 'UBI-AIA-003',
      sectors: JSON.stringify(['insurance']),
      regulators: JSON.stringify(['IA']),
      licence_numbers: JSON.stringify({ IA: 'FA0001' }),
      status: 'active',
      contact_email: 'compliance@aia.com.hk',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Manulife (International) Limited',
      name_zh: '宏利人壽保險(國際)',
      institution_type: 'Licensed_Agency_IA',
      ubi: 'UBI-MANULIFE-004',
      sectors: JSON.stringify(['insurance', 'mpf']),
      regulators: JSON.stringify(['IA', 'MPFA']),
      licence_numbers: JSON.stringify({ IA: 'FA0002', MPFA: 'PI0001' }),
      status: 'active',
      contact_email: 'compliance@manulife.com.hk',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Goldman Sachs (Asia) LLC',
      name_zh: '高盛(亞洲)',
      institution_type: 'Licensed_Corp_SFC',
      ubi: 'UBI-GS-005',
      sectors: JSON.stringify(['securities']),
      regulators: JSON.stringify(['SFC']),
      licence_numbers: JSON.stringify({ SFC: 'AAA005' }),
      status: 'active',
      contact_email: 'compliance@gs.com.hk',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Industrial and Commercial Bank of China (Asia) Limited',
      name_zh: '中國工商銀行(亞洲)有限公司',
      institution_type: 'AI',
      ubi: 'UBI-ICBC-006',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-006' }),
      status: 'active',
      contact_email: 'compliance@icbcasia.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Standard Chartered Bank (Hong Kong) Limited',
      name_zh: '渣打銀行(香港)有限公司',
      institution_type: 'AI',
      ubi: 'UBI-SCBHK-007',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-007' }),
      status: 'active',
      contact_email: 'mrc@sc.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Citibank (Hong Kong) Limited',
      name_zh: '花旗銀行(香港)有限公司',
      institution_type: 'AI',
      ubi: 'UBI-CITIHK-008',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-008' }),
      status: 'active',
      contact_email: 'mrc@citi.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'JPMorgan Chase Bank, N.A. Hong Kong Branch',
      name_zh: '摩根大通銀行香港分行',
      institution_type: 'AI',
      ubi: 'UBI-JPMC-009',
      sectors: JSON.stringify(['banking', 'securities']),
      regulators: JSON.stringify(['HKMA', 'SFC']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-009', SFC: 'AAA009' }),
      status: 'active',
      contact_email: 'compliance.hk@jpmorgan.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Morgan Stanley Asia Limited',
      name_zh: '摩根士丹利亞洲有限公司',
      institution_type: 'Licensed_Corp_SFC',
      ubi: 'UBI-MS-010',
      sectors: JSON.stringify(['securities']),
      regulators: JSON.stringify(['SFC']),
      licence_numbers: JSON.stringify({ SFC: 'AAA010' }),
      status: 'active',
      contact_email: 'compliance.hk@morganstanley.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'UBS AG Hong Kong Branch',
      name_zh: '瑞銀集團香港分行',
      institution_type: 'Licensed_Corp_SFC',
      ubi: 'UBI-UBS-011',
      sectors: JSON.stringify(['securities', 'banking']),
      regulators: JSON.stringify(['SFC', 'HKMA']),
      licence_numbers: JSON.stringify({ SFC: 'AAA011', HKMA: 'AI-011' }),
      status: 'active',
      contact_email: 'compliance.hk@ubs.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'JP Morgan Securities (Asia Pacific) Limited',
      name_zh: '摩根大通證券(亞太)有限公司',
      institution_type: 'Licensed_Corp_SFC',
      ubi: 'UBI-JPMS-012',
      sectors: JSON.stringify(['securities']),
      regulators: JSON.stringify(['SFC']),
      licence_numbers: JSON.stringify({ SFC: 'AAA012' }),
      status: 'active',
      contact_email: 'securities.hk@jpmorgan.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Prudential Hong Kong Limited',
      name_zh: '保誠保險有限公司',
      institution_type: 'Licensed_Agency_IA',
      ubi: 'UBI-PRUHK-013',
      sectors: JSON.stringify(['insurance', 'mpf']),
      regulators: JSON.stringify(['IA', 'MPFA']),
      licence_numbers: JSON.stringify({ IA: 'FA0013', MPFA: 'PI0013' }),
      status: 'active',
      contact_email: 'compliance@prudential.com.hk',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Sun Life Hong Kong Limited',
      name_zh: '永明金融有限公司',
      institution_type: 'Licensed_Agency_IA',
      ubi: 'UBI-SUNLIFE-014',
      sectors: JSON.stringify(['insurance', 'mpf']),
      regulators: JSON.stringify(['IA', 'MPFA']),
      licence_numbers: JSON.stringify({ IA: 'FA0014', MPFA: 'PI0014' }),
      status: 'active',
      contact_email: 'compliance@sunlife.com.hk',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'FWD Life Insurance Company (Bermuda) Limited',
      name_zh: '富衛人壽保險(百慕達)有限公司',
      institution_type: 'Licensed_Agency_IA',
      ubi: 'UBI-FWD-015',
      sectors: JSON.stringify(['insurance']),
      regulators: JSON.stringify(['IA']),
      licence_numbers: JSON.stringify({ IA: 'FA0015' }),
      status: 'active',
      contact_email: 'compliance@fwd.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'BOC Group Life Assurance Company Limited',
      name_zh: '中銀集團人壽保險有限公司',
      institution_type: 'Licensed_Agency_IA',
      ubi: 'UBI-BOCLIFE-016',
      sectors: JSON.stringify(['insurance', 'mpf']),
      regulators: JSON.stringify(['IA', 'MPFA']),
      licence_numbers: JSON.stringify({ IA: 'FA0016', MPFA: 'PI0016' }),
      status: 'active',
      contact_email: 'compliance@boclife.com.hk',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Manulife Provident Funds Trust Company Limited',
      name_zh: '宏利公積金信託有限公司',
      institution_type: 'Principal_Intermediary_MPFA',
      ubi: 'UBI-MPF-MANULIFE-017',
      sectors: JSON.stringify(['mpf']),
      regulators: JSON.stringify(['MPFA']),
      licence_numbers: JSON.stringify({ MPFA: 'PI0017' }),
      status: 'active',
      contact_email: 'mpf.compliance@manulife.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'HSBC Provident Fund Trustee (Hong Kong) Limited',
      name_zh: '匯豐退休金信託(香港)有限公司',
      institution_type: 'Principal_Intermediary_MPFA',
      ubi: 'UBI-MPF-HSBC-018',
      sectors: JSON.stringify(['mpf']),
      regulators: JSON.stringify(['MPFA']),
      licence_numbers: JSON.stringify({ MPFA: 'PI0018' }),
      status: 'active',
      contact_email: 'mpf@hsbc.com.hk',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'DBS Bank Ltd., Hong Kong Branch',
      name_zh: '星展銀行香港分行',
      institution_type: 'AI',
      ubi: 'UBI-DBS-019',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA', 'MAS']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-019', MAS: 'MAS-BANK-019' }),
      status: 'active',
      contact_email: 'compliance.hk@dbs.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'OCBC Securities Pte. Ltd.',
      name_zh: '華僑證券有限公司',
      institution_type: 'Licensed_Corp_SFC',
      ubi: 'UBI-OCBCSEC-020',
      sectors: JSON.stringify(['securities']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'MAS-CMS-020' }),
      status: 'active',
      contact_email: 'compliance@ocbcsecurities.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'United Overseas Bank Limited',
      name_zh: '大華銀行有限公司',
      institution_type: 'AI',
      ubi: 'UBI-UOB-021',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'MAS-BANK-021' }),
      status: 'active',
      contact_email: 'compliance@uobgroup.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'HSBC UK Bank plc',
      name_zh: '匯豐英國銀行',
      institution_type: 'AI',
      ubi: 'UBI-HSBCUK-022',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['FCA', 'PRA']),
      licence_numbers: JSON.stringify({ FCA: 'FCA-114191', PRA: 'PRA-114191' }),
      status: 'active',
      contact_email: 'compliance.uk@hsbc.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Barclays Bank PLC',
      name_zh: '巴克萊銀行',
      institution_type: 'AI',
      ubi: 'UBI-BARCLAYS-023',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['FCA', 'PRA']),
      licence_numbers: JSON.stringify({ FCA: 'FCA-186171', PRA: 'PRA-186171' }),
      status: 'active',
      contact_email: 'compliance@barclays.com',
      onboarded_date: now,
    },
  ];

  // Additional institutions sourced from public regulator directories:
  // - HKMA Register of Authorised Institutions (HK)
  // - MAS Financial Institutions Directory (SG)
  // - Major PRC licensed banking / securities institutions (CN)
  const hkChinaSingaporeInstitutions = [
    // Hong Kong (HKMA)
    {
      institution_id: uuidv4(),
      name_en: 'Hang Seng Bank Limited',
      name_zh: '恒生銀行有限公司',
      institution_type: 'AI',
      ubi: 'UBI-HASE-024',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-024' }),
      status: 'active',
      contact_email: 'compliance@hangseng.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Bank of East Asia, Limited (The)',
      name_zh: '東亞銀行有限公司',
      institution_type: 'AI',
      ubi: 'UBI-BEA-025',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-025' }),
      status: 'active',
      contact_email: 'compliance@hkbea.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'DBS Bank (Hong Kong) Limited',
      name_zh: '星展銀行（香港）有限公司',
      institution_type: 'AI',
      ubi: 'UBI-DBSHK-026',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-026' }),
      status: 'active',
      contact_email: 'compliance.hk@dbs.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'OCBC Wing Hang Bank Limited',
      name_zh: '華僑永亨銀行有限公司',
      institution_type: 'AI',
      ubi: 'UBI-OCBCWH-027',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-027' }),
      status: 'active',
      contact_email: 'compliance@ocbcwh.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Nanyang Commercial Bank, Limited',
      name_zh: '南洋商業銀行有限公司',
      institution_type: 'AI',
      ubi: 'UBI-NCB-028',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-028' }),
      status: 'active',
      contact_email: 'compliance@ncb.com.hk',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'ZA Bank Limited',
      name_zh: '眾安銀行有限公司',
      institution_type: 'AI',
      ubi: 'UBI-ZA-029',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-029' }),
      status: 'active',
      contact_email: 'compliance@za.group',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Mox Bank Limited',
      name_zh: 'Mox 銀行有限公司',
      institution_type: 'AI',
      ubi: 'UBI-MOX-030',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['HKMA']),
      licence_numbers: JSON.stringify({ HKMA: 'AI-030' }),
      status: 'active',
      contact_email: 'compliance@mox.com',
      onboarded_date: now,
    },
    // China (major licensed institutions)
    {
      institution_id: uuidv4(),
      name_en: 'Industrial and Commercial Bank of China Limited',
      name_zh: '中國工商銀行股份有限公司',
      institution_type: 'AI',
      ubi: 'UBI-ICBC-CN-031',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['PBOC']),
      licence_numbers: JSON.stringify({ PBOC: 'CN-BANK-031' }),
      status: 'active',
      contact_email: 'compliance@icbc.com.cn',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Agricultural Bank of China Limited',
      name_zh: '中國農業銀行股份有限公司',
      institution_type: 'AI',
      ubi: 'UBI-ABC-CN-032',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['PBOC']),
      licence_numbers: JSON.stringify({ PBOC: 'CN-BANK-032' }),
      status: 'active',
      contact_email: 'compliance@abchina.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'China Construction Bank Corporation',
      name_zh: '中國建設銀行股份有限公司',
      institution_type: 'AI',
      ubi: 'UBI-CCB-CN-033',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['PBOC']),
      licence_numbers: JSON.stringify({ PBOC: 'CN-BANK-033' }),
      status: 'active',
      contact_email: 'compliance@ccb.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Bank of Communications Co., Ltd.',
      name_zh: '交通銀行股份有限公司',
      institution_type: 'AI',
      ubi: 'UBI-BOCOM-CN-034',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['PBOC']),
      licence_numbers: JSON.stringify({ PBOC: 'CN-BANK-034' }),
      status: 'active',
      contact_email: 'compliance@bankcomm.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'China Merchants Bank Co., Ltd.',
      name_zh: '招商銀行股份有限公司',
      institution_type: 'AI',
      ubi: 'UBI-CMB-CN-035',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['PBOC']),
      licence_numbers: JSON.stringify({ PBOC: 'CN-BANK-035' }),
      status: 'active',
      contact_email: 'compliance@cmbchina.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'China CITIC Bank Corporation Limited',
      name_zh: '中信銀行股份有限公司',
      institution_type: 'AI',
      ubi: 'UBI-CITIC-CN-036',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['PBOC']),
      licence_numbers: JSON.stringify({ PBOC: 'CN-BANK-036' }),
      status: 'active',
      contact_email: 'compliance@citicbank.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'China Minsheng Banking Corp., Ltd.',
      name_zh: '中國民生銀行股份有限公司',
      institution_type: 'AI',
      ubi: 'UBI-CMSB-CN-037',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['PBOC']),
      licence_numbers: JSON.stringify({ PBOC: 'CN-BANK-037' }),
      status: 'active',
      contact_email: 'compliance@cmbc.com.cn',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'CITIC Securities Company Limited',
      name_zh: '中信證券股份有限公司',
      institution_type: 'Licensed_Corp_SFC',
      ubi: 'UBI-CITICS-CSRC-038',
      sectors: JSON.stringify(['securities']),
      regulators: JSON.stringify(['CSRC']),
      licence_numbers: JSON.stringify({ CSRC: 'CN-SEC-038' }),
      status: 'active',
      contact_email: 'compliance@citics.com',
      onboarded_date: now,
    },
    // Singapore (MAS FID)
    {
      institution_id: uuidv4(),
      name_en: 'DBS Bank Ltd.',
      name_zh: '星展銀行',
      institution_type: 'AI',
      ubi: 'UBI-DBS-SG-039',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'SG-BANK-039' }),
      status: 'active',
      contact_email: 'compliance@dbs.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Oversea-Chinese Banking Corporation Limited',
      name_zh: '華僑銀行',
      institution_type: 'AI',
      ubi: 'UBI-OCBC-SG-040',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'SG-BANK-040' }),
      status: 'active',
      contact_email: 'compliance@ocbc.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'United Overseas Bank Limited',
      name_zh: '大華銀行',
      institution_type: 'AI',
      ubi: 'UBI-UOB-SG-041',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'SG-BANK-041' }),
      status: 'active',
      contact_email: 'compliance@uobgroup.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Standard Chartered Bank (Singapore) Limited',
      name_zh: '渣打銀行（新加坡）',
      institution_type: 'AI',
      ubi: 'UBI-SCB-SG-042',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'SG-BANK-042' }),
      status: 'active',
      contact_email: 'compliance@sc.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Citibank Singapore Limited',
      name_zh: '花旗銀行（新加坡）',
      institution_type: 'AI',
      ubi: 'UBI-CITI-SG-043',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'SG-BANK-043' }),
      status: 'active',
      contact_email: 'compliance@citi.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Maybank Singapore Limited',
      name_zh: '馬來亞銀行（新加坡）',
      institution_type: 'AI',
      ubi: 'UBI-MAYBANK-SG-044',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'SG-BANK-044' }),
      status: 'active',
      contact_email: 'compliance@maybank.com.sg',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'Bank of Singapore Limited',
      name_zh: '新加坡銀行',
      institution_type: 'AI',
      ubi: 'UBI-BOS-SG-045',
      sectors: JSON.stringify(['banking']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'SG-BANK-045' }),
      status: 'active',
      contact_email: 'compliance@bankofsingapore.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'OCBC Securities Pte. Ltd.',
      name_zh: '華僑證券',
      institution_type: 'Licensed_Corp_SFC',
      ubi: 'UBI-OCBCSEC-SG-046',
      sectors: JSON.stringify(['securities']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'SG-CMS-046' }),
      status: 'active',
      contact_email: 'compliance@ocbcsecurities.com',
      onboarded_date: now,
    },
    {
      institution_id: uuidv4(),
      name_en: 'DBS Vickers Securities (Singapore) Pte Ltd',
      name_zh: '星展唯高達證券',
      institution_type: 'Licensed_Corp_SFC',
      ubi: 'UBI-DBSV-SG-047',
      sectors: JSON.stringify(['securities']),
      regulators: JSON.stringify(['MAS']),
      licence_numbers: JSON.stringify({ MAS: 'SG-CMS-047' }),
      status: 'active',
      contact_email: 'compliance@dbsvickers.com',
      onboarded_date: now,
    },
  ];

  const normalizeInstitutionName = (value = '') => String(value)
    .toLowerCase()
    .replace(/\(the\)/g, '')
    .replace(/[^a-z0-9]/g, '');

  const mergedInstitutions = [...institutions, ...hkChinaSingaporeInstitutions];
  const existingRows = db.prepare('SELECT name_en FROM institutions').all();
  const existingNameKeys = new Set(existingRows.map((row) => normalizeInstitutionName(row.name_en)));
  const batchNameKeys = new Set();
  const uniqueInstitutions = mergedInstitutions.filter((inst) => {
    const key = normalizeInstitutionName(inst.name_en);
    if (!key) return false;
    if (existingNameKeys.has(key) || batchNameKeys.has(key)) return false;
    batchNameKeys.add(key);
    return true;
  });

  const insertInst = db.prepare(`
    INSERT OR IGNORE INTO institutions (institution_id, name_en, name_zh, institution_type, ubi, sectors, regulators, licence_numbers, status, contact_email, onboarded_date)
    VALUES (@institution_id, @name_en, @name_zh, @institution_type, @ubi, @sectors, @regulators, @licence_numbers, @status, @contact_email, @onboarded_date)
  `);

  for (const inst of uniqueInstitutions) insertInst.run(inst);

  // --- Users ---
  const users = [
    // Platform admin
    {
      user_id: uuidv4(),
      institution_id: null,
      email: 'admin@mrcs-platform.hk',
      password_hash: bcrypt.hashSync('Admin123!', salt),
      name_en: 'Platform Admin',
      role: 'platform_admin',
      regulator: null,
      status: 'active',
    },
    // HKMA regulator
    {
      user_id: uuidv4(),
      institution_id: null,
      email: 'regulator@hkma.gov.hk',
      password_hash: bcrypt.hashSync('Hkma123!', salt),
      name_en: 'HKMA Examiner',
      role: 'regulator_admin',
      regulator: 'HKMA',
      status: 'active',
    },
    // SFC regulator
    {
      user_id: uuidv4(),
      institution_id: null,
      email: 'regulator@sfc.hk',
      password_hash: bcrypt.hashSync('Sfc123!', salt),
      name_en: 'SFC Examiner',
      role: 'regulator_admin',
      regulator: 'SFC',
      status: 'active',
    },
    // HSBC users
    {
      user_id: uuidv4(),
      institution_id: institutions[0].institution_id,
      email: 'hr@hsbc.com.hk',
      password_hash: bcrypt.hashSync('Hsbc123!', salt),
      name_en: 'Sarah Wong',
      role: 'hr_initiator',
      regulator: null,
      status: 'active',
    },
    {
      user_id: uuidv4(),
      institution_id: institutions[0].institution_id,
      email: 'compliance@hsbc.com.hk',
      password_hash: bcrypt.hashSync('Hsbc123!', salt),
      name_en: 'James Lee',
      role: 'compliance_reviewer',
      regulator: null,
      status: 'active',
      is_demo_account: 1,
    },
    // BOCHK user
    {
      user_id: uuidv4(),
      institution_id: institutions[1].institution_id,
      email: 'hr@bochk.com',
      password_hash: bcrypt.hashSync('Bochk123!', salt),
      name_en: 'Michael Chan',
      role: 'hr_initiator',
      regulator: null,
      status: 'active',
    },
    // AIA user
    {
      user_id: uuidv4(),
      institution_id: institutions[2].institution_id,
      email: 'hr@aia.com.hk',
      password_hash: bcrypt.hashSync('Aia123!', salt),
      name_en: 'Emily Lau',
      role: 'hr_initiator',
      regulator: null,
      status: 'active',
    },
    // Goldman user
    {
      user_id: uuidv4(),
      institution_id: institutions[4].institution_id,
      email: 'compliance@gs.com.hk',
      password_hash: bcrypt.hashSync('Gs123!', salt),
      name_en: 'David Chen',
      role: 'compliance_reviewer',
      regulator: null,
      status: 'active',
    },
  ];

  users.forEach((user) => {
    if (typeof user.is_demo_account !== 'number') {
      user.is_demo_account = 0;
    }
  });

  const insertUser = db.prepare(`
    INSERT INTO users (user_id, institution_id, email, password_hash, name_en, role, regulator, status, is_demo_account)
    VALUES (@user_id, @institution_id, @email, @password_hash, @name_en, @role, @regulator, @status, @is_demo_account)
    ON CONFLICT(email) DO UPDATE SET
      institution_id = excluded.institution_id,
      password_hash = excluded.password_hash,
      name_en = excluded.name_en,
      role = excluded.role,
      regulator = excluded.regulator,
      status = excluded.status,
      is_demo_account = excluded.is_demo_account,
      updated_at = datetime('now')
  `);

  for (const user of users) insertUser.run(user);

  // --- Individuals ---
  const individuals = [
    {
      individual_id: 'ind-cheung-wing-yan',
      hkid_hash: 'HKID$e7f8a0c4f58b5e31',
      name_en_surname: 'Cheung',
      name_en_given: 'Wing Yan',
      name_zh: '張穎欣',
      email: 'wy.cheung@email.com',
      phone: '+852 9123 4567',
    },
    {
      individual_id: 'ind-li-ka-ming',
      hkid_hash: 'HKID$06ac2ed291b9cc12',
      name_en_surname: 'Li',
      name_en_given: 'Ka Ming',
      name_zh: '李嘉明',
      email: 'km.li@email.com',
      phone: '+852 9345 6789',
    },
    {
      individual_id: 'ind-wong-siu-fung',
      hkid_hash: 'HKID$9e31b22d0ca5f1a7',
      name_en_surname: 'Wong',
      name_en_given: 'Siu Fung',
      name_zh: '黃兆鋒',
      email: 'sf.wong@email.com',
      phone: '+852 9654 3210',
    },
    {
      individual_id: 'ind-chan-mei-ling',
      hkid_hash: 'HKID$420ff19a8210cb77',
      name_en_surname: 'Chan',
      name_en_given: 'Mei Ling',
      name_zh: '陳美玲',
      email: 'ml.chan@email.com',
      phone: '+852 9765 4321',
    },
    {
      individual_id: 'ind-ng-hoi-yee',
      hkid_hash: 'HKID$5b2af2fb75de10e8',
      name_en_surname: 'Ng',
      name_en_given: 'Hoi Yee',
      name_zh: '吳凱儀',
      email: 'hy.ng@email.com',
      phone: '+852 9888 1200',
    },
    {
      individual_id: 'ind-lee-james',
      hkid_hash: 'HKID$8f7c3177ea6d09ca',
      name_en_surname: 'Lee',
      name_en_given: 'James',
      name_zh: '李志明',
      email: 'james.lee.candidate@email.com',
      phone: '+852 9555 4412',
      is_demo_profile: 1,
    },
    {
      individual_id: 'ind-lau-tsz-kiu',
      hkid_hash: 'HKID$115c9ed6be4170b2',
      name_en_surname: 'Lau',
      name_en_given: 'Tsz Kiu',
      name_zh: '劉子翹',
      email: 'tk.lau@email.com',
      phone: '+852 9022 6311',
    },
    {
      individual_id: 'ind-ho-man-ching',
      hkid_hash: 'HKID$ca084a2adf6d4971',
      name_en_surname: 'Ho',
      name_en_given: 'Man Ching',
      name_zh: '何文晴',
      email: 'mc.ho@email.com',
      phone: '+852 9770 5520',
    },
    {
      individual_id: 'ind-chow-yat-ming',
      hkid_hash: 'HKID$41d57cba8bc261f4',
      name_en_surname: 'Chow',
      name_en_given: 'Yat Ming',
      name_zh: '周逸明',
      email: 'ym.chow@email.com',
      phone: '+852 9234 9876',
    },
  ];

  individuals.forEach((individual) => {
    if (typeof individual.is_demo_profile !== 'number') {
      individual.is_demo_profile = 0;
    }
  });

  const insertIndividual = db.prepare(`
    INSERT INTO individuals (individual_id, hkid_hash, name_en_surname, name_en_given, name_zh, email, phone, is_demo_profile)
    VALUES (@individual_id, @hkid_hash, @name_en_surname, @name_en_given, @name_zh, @email, @phone, @is_demo_profile)
    ON CONFLICT(individual_id) DO UPDATE SET
      hkid_hash = excluded.hkid_hash,
      name_en_surname = excluded.name_en_surname,
      name_en_given = excluded.name_en_given,
      name_zh = excluded.name_zh,
      email = excluded.email,
      phone = excluded.phone,
      is_demo_profile = excluded.is_demo_profile,
      updated_at = datetime('now')
  `);

  for (const ind of individuals) insertIndividual.run(ind);

  const jamesLeeIndividualId = 'ind-lee-james';

  db.prepare('UPDATE users SET is_demo_account = CASE WHEN lower(email) = ? THEN 1 ELSE COALESCE(is_demo_account, 0) END').run('compliance@hsbc.com.hk');
  db.prepare('UPDATE individuals SET is_demo_profile = CASE WHEN individual_id = ? THEN 1 ELSE COALESCE(is_demo_profile, 0) END').run(jamesLeeIndividualId);

  const jamesDuplicates = db.prepare(`
    SELECT individual_id
    FROM individuals
    WHERE lower(name_en_surname) = lower(?)
      AND lower(name_en_given) = lower(?)
      AND individual_id <> ?
  `).all('Lee', 'James', jamesLeeIndividualId);

  for (const duplicate of jamesDuplicates) {
    const duplicateId = duplicate.individual_id;
    db.prepare('UPDATE reference_requests SET individual_id = ? WHERE individual_id = ?').run(jamesLeeIndividualId, duplicateId);
    db.prepare('UPDATE consents SET individual_id = ? WHERE individual_id = ?').run(jamesLeeIndividualId, duplicateId);
    db.prepare('UPDATE employment_records SET individual_id = ? WHERE individual_id = ?').run(jamesLeeIndividualId, duplicateId);
    db.prepare('UPDATE regulatory_registrations SET individual_id = ? WHERE individual_id = ?').run(jamesLeeIndividualId, duplicateId);
    db.prepare('DELETE FROM individuals WHERE individual_id = ?').run(duplicateId);
  }

  db.prepare(`
    DELETE FROM ongoing_monitoring
    WHERE request_id IN (
      SELECT request_id
      FROM reference_requests
      WHERE individual_id = ?
        AND notes LIKE ?
    )
  `).run(jamesLeeIndividualId, 'James Lee profile review -%');

  db.prepare(`
    DELETE FROM conduct_information
    WHERE request_id IN (
      SELECT request_id
      FROM reference_requests
      WHERE individual_id = ?
        AND notes LIKE ?
    )
  `).run(jamesLeeIndividualId, 'James Lee profile review -%');

  db.prepare(`
    DELETE FROM reference_requests
    WHERE individual_id = ?
      AND notes LIKE ?
  `).run(jamesLeeIndividualId, 'James Lee profile review -%');

  // --- Employment Records ---
  const employments = [
    { record_id: uuidv4(), individual_id: individuals[0].individual_id, institution_id: institutions[1].institution_id, position_title: 'Relationship Manager', start_date: '2019-03-01', end_date: '2024-12-31', is_current: 0 },
    { record_id: uuidv4(), individual_id: individuals[1].individual_id, institution_id: institutions[4].institution_id, position_title: 'Senior Dealer', start_date: '2020-06-01', end_date: null, is_current: 1 },
    { record_id: uuidv4(), individual_id: individuals[2].individual_id, institution_id: institutions[2].institution_id, position_title: 'Insurance Agent', start_date: '2018-01-15', end_date: '2025-01-31', is_current: 0 },
    { record_id: uuidv4(), individual_id: individuals[3].individual_id, institution_id: institutions[0].institution_id, position_title: 'Assistant VP', start_date: '2017-09-01', end_date: '2023-06-30', is_current: 0 },
    { record_id: uuidv4(), individual_id: individuals[3].individual_id, institution_id: institutions[3].institution_id, position_title: 'Compliance Officer', start_date: '2023-07-01', end_date: null, is_current: 1 },
    { record_id: uuidv4(), individual_id: individuals[4].individual_id, institution_id: institutions[0].institution_id, position_title: 'Senior Analyst', start_date: '2021-04-01', end_date: null, is_current: 1 },
    { record_id: uuidv4(), individual_id: individuals[5].individual_id, institution_id: institutions[0].institution_id, position_title: 'Relationship Manager', start_date: '2022-01-10', end_date: null, is_current: 1 },
    { record_id: uuidv4(), individual_id: individuals[6].individual_id, institution_id: institutions[0].institution_id, position_title: 'Assistant Relationship Manager', start_date: '2023-02-01', end_date: null, is_current: 1 },
    { record_id: uuidv4(), individual_id: individuals[7].individual_id, institution_id: institutions[1].institution_id, position_title: 'Compliance Analyst', start_date: '2020-05-15', end_date: '2024-11-30', is_current: 0 },
    { record_id: uuidv4(), individual_id: individuals[8].individual_id, institution_id: institutions[4].institution_id, position_title: 'Equities Associate', start_date: '2019-09-01', end_date: '2025-01-31', is_current: 0 },
  ];

  const insertEmployment = db.prepare(`
    INSERT OR IGNORE INTO employment_records (record_id, individual_id, institution_id, position_title, start_date, end_date, is_current)
    VALUES (@record_id, @individual_id, @institution_id, @position_title, @start_date, @end_date, @is_current)
  `);

  for (const emp of employments) insertEmployment.run(emp);

  // --- Regulatory Registrations ---
  const registrations = [
    { registration_id: uuidv4(), individual_id: individuals[0].individual_id, regulator: 'HKMA', registration_number: 'HKMA-RS-10001', registration_type: 'Relevant Individual', status: 'former', effective_from: '2019-03-01', effective_to: '2024-12-31', principal_institution_id: institutions[1].institution_id },
    { registration_id: uuidv4(), individual_id: individuals[1].individual_id, regulator: 'SFC', registration_number: 'SFC-LR-20001', registration_type: 'Licensed Representative', status: 'current', effective_from: '2020-06-01', effective_to: null, principal_institution_id: institutions[4].institution_id },
    { registration_id: uuidv4(), individual_id: individuals[2].individual_id, regulator: 'IA', registration_number: 'IA-TR-30001', registration_type: 'Technical Representative', status: 'former', effective_from: '2018-01-15', effective_to: '2025-01-31', principal_institution_id: institutions[2].institution_id },
    { registration_id: uuidv4(), individual_id: individuals[3].individual_id, regulator: 'HKMA', registration_number: 'HKMA-RS-10002', registration_type: 'Relevant Individual', status: 'former', effective_from: '2017-09-01', effective_to: '2023-06-30', principal_institution_id: institutions[0].institution_id },
    { registration_id: uuidv4(), individual_id: individuals[3].individual_id, regulator: 'IA', registration_number: 'IA-TR-30002', registration_type: 'Technical Representative', status: 'current', effective_from: '2023-07-01', effective_to: null, principal_institution_id: institutions[3].institution_id },
  ];

  const insertReg = db.prepare(`
    INSERT OR IGNORE INTO regulatory_registrations (registration_id, individual_id, regulator, registration_number, registration_type, status, effective_from, effective_to, principal_institution_id)
    VALUES (@registration_id, @individual_id, @regulator, @registration_number, @registration_type, @status, @effective_from, @effective_to, @principal_institution_id)
  `);

  for (const reg of registrations) insertReg.run(reg);

  // --- Sample Reference Requests ---
  const sevenYearsAgo = new Date();
  sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

  const requests = [
    {
      request_id: uuidv4(),
      individual_id: individuals[0].individual_id,
      recruiting_institution_id: institutions[0].institution_id,
      reference_providing_institution_id: institutions[1].institution_id,
      consent_id: null,
      request_sector: 'banking',
      lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
      status: 'in_progress',
      request_date: '2025-12-01',
      sla_deadline: '2025-12-31',
      sla_breached: 0,
      notes: 'RM hiring for Wealth Management team',
      integration_snapshot: JSON.stringify({
        generated_at: '2025-12-01T09:00:00.000Z',
        summary: { watchlist_hits: 1, license_matches: 1, issue_hits: 1, litigation_hits: 0 },
      }),
      integration_last_checked_at: '2025-12-01T09:00:00.000Z',
      initiated_by_user_id: users[3].user_id,
    },
    {
      request_id: uuidv4(),
      individual_id: individuals[2].individual_id,
      recruiting_institution_id: institutions[0].institution_id,
      reference_providing_institution_id: institutions[2].institution_id,
      consent_id: null,
      request_sector: 'cross_sector',
      lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
      status: 'sent',
      request_date: '2025-11-15',
      sla_deadline: '2025-12-15',
      sla_breached: 0,
      notes: 'Cross-sector hire from insurance to banking',
      integration_snapshot: JSON.stringify({
        generated_at: '2025-11-15T08:00:00.000Z',
        summary: { watchlist_hits: 0, license_matches: 1, issue_hits: 0, litigation_hits: 0 },
      }),
      integration_last_checked_at: '2025-11-15T08:00:00.000Z',
      initiated_by_user_id: users[3].user_id,
    },
    {
      request_id: uuidv4(),
      individual_id: individuals[3].individual_id,
      recruiting_institution_id: institutions[3].institution_id,
      reference_providing_institution_id: institutions[0].institution_id,
      consent_id: null,
      request_sector: 'cross_sector',
      lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
      status: 'response_provided',
      request_date: '2025-10-01',
      response_date: '2025-10-20',
      sla_deadline: '2025-10-31',
      sla_breached: 0,
      notes: 'Compliance officer hire',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-10-01T08:45:00.000Z',
            summary: { watchlist_hits: 0, license_matches: 0, issue_hits: 1, litigation_hits: 1 }
        }),
        integration_last_checked_at: '2025-10-01T08:45:00.000Z',
      initiated_by_user_id: users[6].user_id,
    },
    {
      request_id: uuidv4(),
      individual_id: individuals[4].individual_id,
      recruiting_institution_id: institutions[4].institution_id,
      reference_providing_institution_id: institutions[0].institution_id,
      consent_id: null,
      request_sector: 'securities',
      lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
      status: 'draft',
      request_date: null,
      sla_deadline: null,
      sla_breached: 0,
      notes: 'Analyst transfer from banking to securities',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-12-01T14:20:00.000Z',
            summary: { watchlist_hits: 0, license_matches: 0, issue_hits: 1, litigation_hits: 0 }
        }),
        integration_last_checked_at: '2025-12-01T14:20:00.000Z',
      initiated_by_user_id: users[7].user_id,
    },
      {
        request_id: uuidv4(),
        individual_id: individuals[1].individual_id,
        recruiting_institution_id: institutions[1].institution_id,
        reference_providing_institution_id: institutions[4].institution_id,
        consent_id: null,
        request_sector: 'securities',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'reviewed',
        request_date: '2025-08-12',
        response_date: '2025-08-26',
        review_date: '2025-08-29',
        sla_deadline: '2025-09-11',
        sla_breached: 0,
        notes: 'Front office transfer with completed MRC review',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-08-12T09:15:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 2, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-08-12T09:15:00.000Z',
        initiated_by_user_id: users[5].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[0].individual_id,
        recruiting_institution_id: institutions[2].institution_id,
        reference_providing_institution_id: institutions[1].institution_id,
        consent_id: null,
        request_sector: 'insurance',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'closed',
        request_date: '2025-07-03',
        response_date: '2025-07-22',
        review_date: '2025-07-24',
        close_date: '2025-07-25',
        sla_deadline: '2025-08-02',
        sla_breached: 0,
        notes: 'Completed insurance role onboarding check',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-07-03T07:50:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 1, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-07-03T07:50:00.000Z',
        initiated_by_user_id: users[7].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[2].individual_id,
        recruiting_institution_id: institutions[3].institution_id,
        reference_providing_institution_id: institutions[0].institution_id,
        consent_id: null,
        request_sector: 'cross_sector',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'cancelled',
        request_date: '2025-09-05',
        sla_deadline: '2025-10-05',
        sla_breached: 0,
        notes: 'Cancelled after candidate withdrew acceptance',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-09-05T11:30:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 0, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-09-05T11:30:00.000Z',
        initiated_by_user_id: users[6].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[1].institution_id,
        consent_id: null,
        request_sector: 'banking',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'draft',
        request_date: null,
        response_date: null,
        sla_deadline: null,
        sla_breached: 0,
        notes: 'James Lee profile review - draft request',
        integration_snapshot: JSON.stringify({
          generated_at: '2026-01-03T09:30:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 0, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2026-01-03T09:30:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[2].institution_id,
        consent_id: null,
        request_sector: 'cross_sector',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'consent_obtained',
        request_date: null,
        response_date: null,
        sla_deadline: null,
        sla_breached: 0,
        notes: 'James Lee profile review - consent completed',
        integration_snapshot: JSON.stringify({
          generated_at: '2026-01-05T11:00:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 1, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2026-01-05T11:00:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[3].institution_id,
        consent_id: null,
        request_sector: 'insurance',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'sent',
        request_date: '2026-01-08',
        response_date: null,
        sla_deadline: '2026-02-07',
        sla_breached: 0,
        notes: 'James Lee profile review - sent to insurer',
        integration_snapshot: JSON.stringify({
          generated_at: '2026-01-08T08:25:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 1, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2026-01-08T08:25:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[4].institution_id,
        consent_id: null,
        request_sector: 'securities',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'acknowledged',
        request_date: '2025-12-15',
        response_date: null,
        sla_deadline: '2026-01-14',
        sla_breached: 0,
        notes: 'James Lee profile review - acknowledged by provider',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-12-15T13:10:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 2, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-12-15T13:10:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[1].institution_id,
        consent_id: null,
        request_sector: 'banking',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'in_progress',
        request_date: '2025-12-01',
        response_date: null,
        sla_deadline: '2025-12-31',
        sla_breached: 0,
        notes: 'James Lee profile review - in progress',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-12-01T10:45:00.000Z',
          summary: { watchlist_hits: 1, license_matches: 1, issue_hits: 1, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-12-01T10:45:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[2].institution_id,
        consent_id: null,
        request_sector: 'cross_sector',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'response_provided',
        request_date: '2025-11-10',
        response_date: '2025-11-28',
        sla_deadline: '2025-12-10',
        sla_breached: 0,
        notes: 'James Lee profile review - response provided',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-11-10T09:05:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 1, issue_hits: 2, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-11-10T09:05:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[3].institution_id,
        consent_id: null,
        request_sector: 'insurance',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'reviewed',
        request_date: '2025-10-06',
        response_date: '2025-10-24',
        sla_deadline: '2025-11-05',
        sla_breached: 0,
        notes: 'James Lee profile review - reviewed by compliance',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-10-06T14:00:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 1, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-10-06T14:00:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[4].institution_id,
        consent_id: null,
        request_sector: 'securities',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'closed',
        request_date: '2025-09-01',
        response_date: '2025-09-18',
        sla_deadline: '2025-10-01',
        sla_breached: 0,
        notes: 'James Lee profile review - case closed',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-09-01T08:40:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 2, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-09-01T08:40:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[1].institution_id,
        consent_id: null,
        request_sector: 'banking',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'cancelled',
        request_date: '2025-08-05',
        response_date: null,
        sla_deadline: '2025-09-04',
        sla_breached: 0,
        notes: 'James Lee profile review - cancelled by recruiting team',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-08-05T11:50:00.000Z',
          summary: { watchlist_hits: 0, license_matches: 1, issue_hits: 0, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-08-05T11:50:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
      {
        request_id: uuidv4(),
        individual_id: individuals[5].individual_id,
        recruiting_institution_id: institutions[0].institution_id,
        reference_providing_institution_id: institutions[2].institution_id,
        consent_id: null,
        request_sector: 'cross_sector',
        lookback_start_date: sevenYearsAgo.toISOString().split('T')[0],
        status: 'in_progress',
        request_date: '2025-07-10',
        response_date: null,
        sla_deadline: '2025-08-09',
        sla_breached: 1,
        notes: 'James Lee profile review - legacy case with SLA breach',
        integration_snapshot: JSON.stringify({
          generated_at: '2025-07-10T15:20:00.000Z',
          summary: { watchlist_hits: 1, license_matches: 1, issue_hits: 3, litigation_hits: 0 },
        }),
        integration_last_checked_at: '2025-07-10T15:20:00.000Z',
        initiated_by_user_id: users[4].user_id,
      },
  ];

  const buildMockLicenseRecords = (count, req, snapshot) => {
    const records = [];
    const individualName = `${(individuals.find((i) => i.individual_id === req.individual_id)?.name_en_surname || '')} ${(individuals.find((i) => i.individual_id === req.individual_id)?.name_en_given || '')}`.trim();
    const provider = institutions.find((inst) => inst.institution_id === req.reference_providing_institution_id);
    for (let index = 0; index < count; index += 1) {
      records.push({
        record_id: `lic-${req.request_id.slice(0, 8)}-${index + 1}`,
        entity_name: individualName || 'Candidate',
        id_number: `ID-${req.request_id.slice(0, 4).toUpperCase()}${String(index + 1).padStart(2, '0')}`,
        regulator: (provider?.regulators && JSON.parse(provider.regulators || '[]')[0]) || 'SFC',
        jurisdiction: req.request_sector === 'cross_sector' ? 'HK/SG' : 'HK',
        license_number: `LIC-${req.request_id.slice(0, 6).toUpperCase()}-${100 + index}`,
        registration_type: req.request_sector === 'insurance' ? 'Insurance Technical Representative' : 'Licensed Representative',
        status: index % 2 === 0 ? 'active' : 'current',
        effective_from: `202${Math.max(0, 5 - index)}-01-01`,
        effective_to: null,
        principal_institution: provider?.name_en || 'Reference-Providing Institution',
        source: 'Seeded Regulatory Registry',
      });
    }
    return records;
  };

  const buildMockIssueRecords = (count, req) => {
    const records = [];
    const individualName = `${(individuals.find((i) => i.individual_id === req.individual_id)?.name_en_surname || '')} ${(individuals.find((i) => i.individual_id === req.individual_id)?.name_en_given || '')}`.trim();
    const issueTemplates = [
      {
        category: 'Code of Conduct Breach',
        description: 'Failure to follow internal dealing policy and delayed declaration of outside account activity.',
        action_taken: 'Written warning issued; annual compliance retraining mandated.',
      },
      {
        category: 'Client Communication Breach',
        description: 'Misleading wording identified in product risk communication during suitability review.',
        action_taken: 'Client remediation completed; supervisory review period extended.',
      },
      {
        category: 'Record Keeping Deficiency',
        description: 'Incomplete trade rationale records discovered in periodic compliance sampling.',
        action_taken: 'Case escalated to compliance committee; control enhancements implemented.',
      },
    ];

    for (let index = 0; index < count; index += 1) {
      const template = issueTemplates[index % issueTemplates.length];
      records.push({
        issue_id: `DISC-${req.request_id.slice(0, 6).toUpperCase()}-${index + 1}`,
        entity_name: individualName || 'Candidate',
        id_number: `ID-${req.request_id.slice(0, 4).toUpperCase()}${String(index + 1).padStart(2, '0')}`,
        regulator: req.request_sector === 'insurance' ? 'IA' : req.request_sector === 'securities' ? 'SFC' : 'HKMA',
        jurisdiction: 'HK',
        case_id: `CASE-${req.request_id.slice(0, 5).toUpperCase()}-${200 + index}`,
        category: template.category,
        status: index === 0 ? 'substantiated' : 'closed',
        date: `2025-${String((index % 9) + 1).padStart(2, '0')}-15`,
        description: template.description,
        action_taken: template.action_taken,
        source: 'Seeded Disciplinary Register',
      });
    }
    return records;
  };

  requests.forEach((req) => {
    let snapshot = {};
    try {
      snapshot = JSON.parse(req.integration_snapshot || '{}');
    } catch (_err) {
      snapshot = {};
    }

    const summary = snapshot.summary || {};
    const licenseCount = Number(summary.license_matches || 0);
    const issueCount = Number(summary.issue_hits || 0);

    snapshot.inputs = {
      individual_id: req.individual_id,
      institution_id: req.reference_providing_institution_id,
      ...(snapshot.inputs || {}),
    };

    snapshot.records = {
      watchlist: Array.isArray(snapshot.records?.watchlist) ? snapshot.records.watchlist : [],
      litigation: Array.isArray(snapshot.records?.litigation) ? snapshot.records.litigation : [],
      licenses: Array.isArray(snapshot.records?.licenses) && snapshot.records.licenses.length > 0
        ? snapshot.records.licenses
        : buildMockLicenseRecords(licenseCount, req, snapshot),
      issues: Array.isArray(snapshot.records?.issues) && snapshot.records.issues.length > 0
        ? snapshot.records.issues
        : buildMockIssueRecords(issueCount, req),
    };

    req.integration_snapshot = JSON.stringify(snapshot);
  });

  const insertRequest = db.prepare(`
      INSERT OR IGNORE INTO reference_requests (request_id, individual_id, recruiting_institution_id, reference_providing_institution_id, consent_id, request_sector, lookback_start_date, status, request_date, response_date, sla_deadline, sla_breached, notes, initiated_by_user_id, integration_snapshot, integration_last_checked_at)
      VALUES (@request_id, @individual_id, @recruiting_institution_id, @reference_providing_institution_id, @consent_id, @request_sector, @lookback_start_date, @status, @request_date, @response_date, @sla_deadline, @sla_breached, @notes, @initiated_by_user_id, @integration_snapshot, @integration_last_checked_at)
  `);

  for (const req of requests) insertRequest.run(req);

    const jamesLeeMonitoringRequest =
      requests.find((req) => req.individual_id === jamesLeeIndividualId && req.status === 'in_progress')
      || requests.find((req) => req.individual_id === jamesLeeIndividualId);

    const monitoringSchedules = [
      {
        monitoring_id: uuidv4(),
        request_id: requests[0].request_id,
        review_frequency: 'quarterly',
        next_review_date: '2026-03-01',
        last_review_date: '2025-12-01',
        status: 'active',
        scope: JSON.stringify({ regulators: ['HKMA', 'SFC'], checks: ['watchlist', 'disciplinary_actions'] }),
        notes: 'Quarterly review for relationship manager role',
        created_by_user_id: users[4].user_id,
      },
      {
        monitoring_id: uuidv4(),
        request_id: requests[2].request_id,
        review_frequency: 'monthly',
        next_review_date: '2026-02-25',
        last_review_date: '2026-01-25',
        status: 'active',
        scope: JSON.stringify({ regulators: ['IA'], checks: ['litigation', 'watchlist'] }),
        notes: 'Monthly review while probation is active',
        created_by_user_id: users[6].user_id,
      },
    ];

    if (jamesLeeMonitoringRequest) {
      monitoringSchedules.push({
        monitoring_id: uuidv4(),
        request_id: jamesLeeMonitoringRequest.request_id,
        review_frequency: 'monthly',
        next_review_date: '2026-03-05',
        last_review_date: '2026-02-05',
        status: 'active',
        scope: JSON.stringify({
          regulators: ['HKMA', 'SFC', 'IA'],
          checks: ['watchlist', 'disciplinary_actions', 'litigation'],
          jurisdictions: ['HK', 'CN', 'SG'],
        }),
        notes: 'James Lee ongoing monitoring for profile review and cross-sector fit checks',
        created_by_user_id: users[4].user_id,
      });
    }

    const insertMonitoring = db.prepare(`
      INSERT OR IGNORE INTO ongoing_monitoring (monitoring_id, request_id, review_frequency, next_review_date, last_review_date, status, scope, notes, created_by_user_id)
      VALUES (@monitoring_id, @request_id, @review_frequency, @next_review_date, @last_review_date, @status, @scope, @notes, @created_by_user_id)
    `);

    for (const schedule of monitoringSchedules) insertMonitoring.run(schedule);

  // --- Sample Conduct Information ---
  const conductItems = [
    {
      conduct_id: uuidv4(),
      request_id: requests[0].request_id,
      category: 'misconduct_report',
      description: 'Client complaint substantiated for delayed suspicious transaction escalation in Q4 2024.',
      incident_start_date: '2024-10-10',
      incident_end_date: '2024-10-28',
      severity: 'under_review',
      regulator_reported: 1,
      status: 'current',
      submitted_by_user_id: users[4].user_id,
    },
    {
      conduct_id: uuidv4(),
      request_id: requests[2].request_id,
      category: 'disciplinary_action',
      description: 'Internal warning issued for failure to follow KYC procedures in Q2 2022.',
      incident_start_date: '2022-04-01',
      incident_end_date: '2022-06-30',
      severity: 'non_material',
      regulator_reported: 0,
      status: 'resolved',
      submitted_by_user_id: users[4].user_id,
    },
    {
      conduct_id: uuidv4(),
      request_id: requests[11].request_id,
      category: 'integrity_concern',
      description: 'Unreconciled expense reimbursement anomaly identified during internal audit follow-up.',
      incident_start_date: '2025-11-20',
      incident_end_date: '2025-12-02',
      severity: 'material',
      regulator_reported: 0,
      status: 'current',
      submitted_by_user_id: users[4].user_id,
    },
    {
      conduct_id: uuidv4(),
      request_id: requests[12].request_id,
      category: 'ongoing_investigation',
      description: 'Active internal investigation into control override approvals in legacy onboarding queue.',
      incident_start_date: '2025-10-18',
      incident_end_date: null,
      severity: 'under_review',
      regulator_reported: 1,
      status: 'current',
      submitted_by_user_id: users[4].user_id,
    },
    {
      conduct_id: uuidv4(),
      request_id: requests[16].request_id,
      category: 'legal_regulatory_breach',
      description: 'Late filing breach recorded for transaction reporting obligations during 2025 mid-year cycle.',
      incident_start_date: '2025-06-01',
      incident_end_date: '2025-06-30',
      severity: 'material',
      regulator_reported: 1,
      status: 'current',
      submitted_by_user_id: users[4].user_id,
    },
  ];

  const insertConduct = db.prepare(`
    INSERT OR IGNORE INTO conduct_information (conduct_id, request_id, category, description, incident_start_date, incident_end_date, severity, regulator_reported, status, submitted_by_user_id)
    VALUES (@conduct_id, @request_id, @category, @description, @incident_start_date, @incident_end_date, @severity, @regulator_reported, @status, @submitted_by_user_id)
  `);

  for (const c of conductItems) insertConduct.run(c);

  // --- Audit Logs ---
  const auditLogs = [
    { log_id: uuidv4(), entity_type: 'reference_request', entity_id: requests[0].request_id, action: 'create', performed_by_user_id: users[3].user_id, performed_by_institution_id: institutions[0].institution_id, details: JSON.stringify({ note: 'Reference request created' }) },
    { log_id: uuidv4(), entity_type: 'reference_request', entity_id: requests[0].request_id, action: 'status_change', performed_by_user_id: users[3].user_id, performed_by_institution_id: institutions[0].institution_id, details: JSON.stringify({ from: 'draft', to: 'in_progress' }) },
    { log_id: uuidv4(), entity_type: 'user', entity_id: users[3].user_id, action: 'login', performed_by_user_id: users[3].user_id, performed_by_institution_id: institutions[0].institution_id, details: JSON.stringify({ ip: '192.168.1.1' }) },
  ];

  const insertAudit = db.prepare(`
    INSERT OR IGNORE INTO audit_logs (log_id, entity_type, entity_id, action, performed_by_user_id, performed_by_institution_id, details)
    VALUES (@log_id, @entity_type, @entity_id, @action, @performed_by_user_id, @performed_by_institution_id, @details)
  `);

  for (const log of auditLogs) insertAudit.run(log);

  console.log('✓ Seed data inserted successfully');
  console.log('\n--- Demo Credentials ---');
  console.log('Platform Admin:    admin@mrcs-platform.hk / Admin123!');
  console.log('HKMA Regulator:    regulator@hkma.gov.hk / Hkma123!');
  console.log('SFC Regulator:     regulator@sfc.hk / Sfc123!');
  console.log('HSBC HR:           hr@hsbc.com.hk / Hsbc123!');
  console.log('HSBC Compliance:   compliance@hsbc.com.hk / Hsbc123!');
  console.log('BOCHK HR:          hr@bochk.com / Bochk123!');
  console.log('AIA HR:            hr@aia.com.hk / Aia123!');
  console.log('Goldman Compliance: compliance@gs.com.hk / Gs123!');
}

module.exports = { seed };

// Allow running directly via `node seed.js` or `npm run seed`
if (require.main === module) {
  seed().then(() => {
    db.close();
  }).catch(err => { console.error(err); process.exit(1); });
}
