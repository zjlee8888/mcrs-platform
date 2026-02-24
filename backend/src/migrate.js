// Database schema and migration for MRCS Platform
// Uses sql.js (WASM SQLite) with a better-sqlite3-compatible wrapper
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const backendDir = path.join(__dirname, '..');
const DB_PATH = path.resolve(backendDir, process.env.DB_PATH || './data/mrcs.db');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// ── sql.js Wrapper (better-sqlite3 compatible API) ──────────────────────────
let _wrapper = null;

class SqlJsWrapper {
  constructor(sqlJsDb, dbPath) {
    this._db = sqlJsDb;
    this._dbPath = dbPath;
    this._inTransaction = false;
  }

  _save() {
    if (this._inTransaction) return;
    const data = this._db.export();
    fs.writeFileSync(this._dbPath, Buffer.from(data));
  }

  exec(sql) {
    this._db.exec(sql);
    this._save();
  }

  pragma(str) {
    try { this._db.exec('PRAGMA ' + str); } catch (e) { /* some pragmas unsupported in WASM */ }
  }

  _bindParams(stmt, params) {
    if (params.length === 1 && params[0] !== null && typeof params[0] === 'object' && !Array.isArray(params[0])) {
      // Named parameters — prefix keys with @ for sql.js
      const named = {};
      for (const [k, v] of Object.entries(params[0])) {
        named['@' + k] = v === undefined ? null : v;
      }
      stmt.bind(named);
    } else if (params.length > 0) {
      stmt.bind(params.map(p => (p === undefined ? null : p)));
    }
  }

  prepare(sql) {
    const self = this;
    return {
      all(...params) {
        const stmt = self._db.prepare(sql);
        try {
          self._bindParams(stmt, params);
          const results = [];
          while (stmt.step()) results.push(stmt.getAsObject());
          return results;
        } finally { stmt.free(); }
      },
      get(...params) {
        const stmt = self._db.prepare(sql);
        try {
          self._bindParams(stmt, params);
          return stmt.step() ? stmt.getAsObject() : undefined;
        } finally { stmt.free(); }
      },
      run(...params) {
        const stmt = self._db.prepare(sql);
        try {
          self._bindParams(stmt, params);
          stmt.step();
        } finally { stmt.free(); }
        const changes = self._db.getRowsModified();
        self._save();
        return { changes };
      }
    };
  }

  transaction(fn) {
    const self = this;
    return function (...args) {
      self._inTransaction = true;
      self._db.exec('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        self._db.exec('COMMIT');
        self._inTransaction = false;
        self._save();
        return result;
      } catch (e) {
        self._db.exec('ROLLBACK');
        self._inTransaction = false;
        throw e;
      }
    };
  }

  close() {
    this._save();
    this._db.close();
  }
}

// Proxy so routes can destructure { db } at load time; actual calls deferred until init()
const db = new Proxy({}, {
  get(_target, prop) {
    if (!_wrapper) throw new Error('Database not initialized — call init() first');
    const val = _wrapper[prop];
    return typeof val === 'function' ? val.bind(_wrapper) : val;
  }
});

async function init() {
  const SQL = await initSqlJs();
  let sqlJsDb;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqlJsDb = new SQL.Database(buffer);
  } else {
    sqlJsDb = new SQL.Database();
  }
  _wrapper = new SqlJsWrapper(sqlJsDb, DB_PATH);
  _wrapper.pragma('journal_mode = WAL');
  _wrapper.pragma('foreign_keys = ON');
}

function migrate() {
  db.exec(`
    -- Institutions table
    CREATE TABLE IF NOT EXISTS institutions (
      institution_id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_zh TEXT,
      institution_type TEXT NOT NULL CHECK(institution_type IN (
        'AI','DTC','Licensed_Corp_SFC','Licensed_Agency_IA',
        'Licensed_Broker_IA','Principal_Intermediary_MPFA'
      )),
      region TEXT CHECK(region IN (
        'asia','europe','north_america','latin_america','middle_east','africa','oceania'
      )),
      ubi TEXT,
      sectors TEXT NOT NULL DEFAULT '[]',
      regulators TEXT NOT NULL DEFAULT '[]',
      licence_numbers TEXT DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','revoked','wound_up')),
      address TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      onboarded_date TEXT,
      last_verified_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      institution_id TEXT REFERENCES institutions(institution_id),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_zh TEXT,
      is_demo_account INTEGER NOT NULL DEFAULT 0,
      role TEXT NOT NULL CHECK(role IN (
        'platform_admin','institution_admin','hr_initiator',
        'compliance_reviewer','senior_approver','auditor',
        'regulator_admin','regulator_viewer','individual'
      )),
      regulator TEXT CHECK(regulator IN ('HKMA','SFC','IA','MPFA', NULL)),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','suspended')),
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Individuals (prospective/current employees subject to MRC)
    CREATE TABLE IF NOT EXISTS individuals (
      individual_id TEXT PRIMARY KEY,
      hkid_hash TEXT,
      name_en_surname TEXT NOT NULL,
      name_en_given TEXT NOT NULL,
      name_zh TEXT,
      email TEXT,
      phone TEXT,
      is_demo_profile INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Regulatory registrations linking individuals to regulators
    CREATE TABLE IF NOT EXISTS regulatory_registrations (
      registration_id TEXT PRIMARY KEY,
      individual_id TEXT NOT NULL REFERENCES individuals(individual_id),
      regulator TEXT NOT NULL CHECK(regulator IN ('HKMA','SFC','IA','MPFA')),
      registration_number TEXT,
      registration_type TEXT,
      regulated_activities TEXT DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'current' CHECK(status IN ('current','former','suspended')),
      effective_from TEXT,
      effective_to TEXT,
      principal_institution_id TEXT REFERENCES institutions(institution_id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Employment records
    CREATE TABLE IF NOT EXISTS employment_records (
      record_id TEXT PRIMARY KEY,
      individual_id TEXT NOT NULL REFERENCES individuals(individual_id),
      institution_id TEXT NOT NULL REFERENCES institutions(institution_id),
      position_title TEXT,
      department TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      is_current INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Consents
    CREATE TABLE IF NOT EXISTS consents (
      consent_id TEXT PRIMARY KEY,
      individual_id TEXT NOT NULL REFERENCES individuals(individual_id),
      recruiting_institution_id TEXT NOT NULL REFERENCES institutions(institution_id),
      reference_providing_institution_id TEXT NOT NULL REFERENCES institutions(institution_id),
      consent_type TEXT NOT NULL DEFAULT 'mrc_standard' CHECK(consent_type IN ('mrc_standard','cross_sector','intra_group')),
      consent_scope TEXT DEFAULT '{}',
      signature_method TEXT CHECK(signature_method IN ('iam_smart','wet_ink_upload','electronic')),
      granted_date TEXT,
      expiry_date TEXT,
      withdrawn_date TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','expired','withdrawn')),
      document_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Reference requests
    CREATE TABLE IF NOT EXISTS reference_requests (
      request_id TEXT PRIMARY KEY,
      individual_id TEXT NOT NULL REFERENCES individuals(individual_id),
      recruiting_institution_id TEXT NOT NULL REFERENCES institutions(institution_id),
      reference_providing_institution_id TEXT NOT NULL REFERENCES institutions(institution_id),
      consent_id TEXT REFERENCES consents(consent_id),
      request_sector TEXT NOT NULL DEFAULT 'banking' CHECK(request_sector IN ('banking','securities','insurance','mpf','cross_sector')),
      lookback_start_date TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN (
        'draft','consent_obtained','sent','acknowledged',
        'in_progress','response_provided','reviewed','closed','cancelled'
      )),
      request_date TEXT,
      acknowledgement_date TEXT,
      response_date TEXT,
      review_date TEXT,
      close_date TEXT,
      sla_deadline TEXT,
      sla_breached INTEGER DEFAULT 0,
      notes TEXT,
      initiated_by_user_id TEXT REFERENCES users(user_id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Conduct information
    CREATE TABLE IF NOT EXISTS conduct_information (
      conduct_id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES reference_requests(request_id),
      category TEXT NOT NULL CHECK(category IN (
        'legal_regulatory_breach','integrity_concern','misconduct_report',
        'disciplinary_action','ongoing_investigation','additional_information'
      )),
      description TEXT,
      incident_start_date TEXT,
      incident_end_date TEXT,
      severity TEXT DEFAULT 'under_review' CHECK(severity IN ('material','non_material','under_review')),
      regulator_reported INTEGER DEFAULT 0,
      regulator_reference TEXT,
      status TEXT NOT NULL DEFAULT 'current' CHECK(status IN ('current','resolved','withdrawn')),
      submitted_by_user_id TEXT REFERENCES users(user_id),
      submitted_date TEXT DEFAULT (datetime('now')),
      last_updated_by TEXT,
      last_updated_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Audit log
    CREATE TABLE IF NOT EXISTS audit_logs (
      log_id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN (
        'create','read','update','delete','export',
        'consent_granted','consent_withdrawn','sla_breach',
        'escalation','login','logout','status_change'
      )),
      performed_by_user_id TEXT,
      performed_by_institution_id TEXT,
      timestamp TEXT DEFAULT (datetime('now')),
      ip_address TEXT,
      details TEXT DEFAULT '{}'
    );

    -- HKMA register cache
    CREATE TABLE IF NOT EXISTS hkma_register_cache (
      cache_id TEXT PRIMARY KEY,
      register_type TEXT NOT NULL,
      data TEXT NOT NULL,
      fetched_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_reg_registrations_individual ON regulatory_registrations(individual_id);
    CREATE INDEX IF NOT EXISTS idx_employment_individual ON employment_records(individual_id);
    CREATE INDEX IF NOT EXISTS idx_employment_institution ON employment_records(institution_id);
    CREATE INDEX IF NOT EXISTS idx_reference_requests_recruiting ON reference_requests(recruiting_institution_id);
    CREATE INDEX IF NOT EXISTS idx_reference_requests_providing ON reference_requests(reference_providing_institution_id);
    CREATE INDEX IF NOT EXISTS idx_reference_requests_individual ON reference_requests(individual_id);
    CREATE INDEX IF NOT EXISTS idx_reference_requests_status ON reference_requests(status);
    CREATE INDEX IF NOT EXISTS idx_conduct_request ON conduct_information(request_id);
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(performed_by_user_id);
    CREATE INDEX IF NOT EXISTS idx_consents_individual ON consents(individual_id);
  `);

  const requestColumns = db.prepare(`PRAGMA table_info(reference_requests)`).all();
  const requestColumnNames = new Set(requestColumns.map((c) => c.name));
  if (!requestColumnNames.has('integration_snapshot')) {
    db.exec(`ALTER TABLE reference_requests ADD COLUMN integration_snapshot TEXT DEFAULT '{}'`);
  }
  if (!requestColumnNames.has('integration_last_checked_at')) {
    db.exec(`ALTER TABLE reference_requests ADD COLUMN integration_last_checked_at TEXT`);
  }

  const institutionColumns = db.prepare(`PRAGMA table_info(institutions)`).all();
  const institutionColumnNames = new Set(institutionColumns.map((c) => c.name));
  if (!institutionColumnNames.has('region')) {
    db.exec(`ALTER TABLE institutions ADD COLUMN region TEXT`);
  }

  const userColumns = db.prepare(`PRAGMA table_info(users)`).all();
  const userColumnNames = new Set(userColumns.map((c) => c.name));
  if (!userColumnNames.has('is_demo_account')) {
    db.exec(`ALTER TABLE users ADD COLUMN is_demo_account INTEGER NOT NULL DEFAULT 0`);
  }

  const individualColumns = db.prepare(`PRAGMA table_info(individuals)`).all();
  const individualColumnNames = new Set(individualColumns.map((c) => c.name));
  if (!individualColumnNames.has('is_demo_profile')) {
    db.exec(`ALTER TABLE individuals ADD COLUMN is_demo_profile INTEGER NOT NULL DEFAULT 0`);
  }

  db.exec(`
    UPDATE institutions
    SET region = COALESCE(region,
      CASE
        WHEN regulators LIKE '%HKMA%' OR regulators LIKE '%SFC%' OR regulators LIKE '%IA%' OR regulators LIKE '%MPFA%' OR regulators LIKE '%MAS%' OR regulators LIKE '%PBOC%' OR regulators LIKE '%CSRC%' OR regulators LIKE '%FSA_JP%' OR regulators LIKE '%FSS_KR%' OR regulators LIKE '%FSC_TW%' OR regulators LIKE '%RBI%'
          THEN 'asia'
        WHEN regulators LIKE '%FCA%' OR regulators LIKE '%PRA%' OR regulators LIKE '%BAFIN%' OR regulators LIKE '%AMF_FR%' OR regulators LIKE '%CONSOB%' OR regulators LIKE '%CNMV%' OR regulators LIKE '%AFM_NL%' OR regulators LIKE '%FINMA%'
          THEN 'europe'
        WHEN regulators LIKE '%SEC%' OR regulators LIKE '%FINRA%' OR regulators LIKE '%IIROC%'
          THEN 'north_america'
        WHEN regulators LIKE '%CVM_BR%' OR regulators LIKE '%CNBV_MX%'
          THEN 'latin_america'
        WHEN regulators LIKE '%DFSA%' OR regulators LIKE '%SAMA%' OR regulators LIKE '%FSRA_ADGM%'
          THEN 'middle_east'
        WHEN regulators LIKE '%FSCA_ZA%' OR regulators LIKE '%CBN_NG%'
          THEN 'africa'
        WHEN regulators LIKE '%ASIC%' OR regulators LIKE '%APRA%'
          THEN 'oceania'
        ELSE 'asia'
      END
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS ongoing_monitoring (
      monitoring_id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES reference_requests(request_id),
      review_frequency TEXT NOT NULL CHECK(review_frequency IN ('weekly','monthly','quarterly','semi_annual')),
      next_review_date TEXT NOT NULL,
      last_review_date TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','completed')),
      scope TEXT DEFAULT '{}',
      notes TEXT,
      created_by_user_id TEXT REFERENCES users(user_id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_monitoring_request ON ongoing_monitoring(request_id);
    CREATE INDEX IF NOT EXISTS idx_monitoring_next_review ON ongoing_monitoring(next_review_date);

    CREATE TABLE IF NOT EXISTS request_case_files (
      case_file_id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES reference_requests(request_id),
      entry_type TEXT NOT NULL CHECK(entry_type IN (
        'consent_upload','consent_email','reference_results_upload','reference_results_ai_parse'
      )),
      title TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      created_by_user_id TEXT REFERENCES users(user_id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_case_files_request ON request_case_files(request_id);
    CREATE INDEX IF NOT EXISTS idx_case_files_created_at ON request_case_files(created_at);
  `);

  const monitoringTableSql = db.prepare(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table' AND name = 'ongoing_monitoring'
  `).get();

  const monitoringSql = String(monitoringTableSql?.sql || '').toLowerCase();
  if (monitoringSql && !monitoringSql.includes("'weekly'")) {
    db.exec(`
      DROP TABLE IF EXISTS ongoing_monitoring_new;

      CREATE TABLE ongoing_monitoring_new (
        monitoring_id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL REFERENCES reference_requests(request_id),
        review_frequency TEXT NOT NULL CHECK(review_frequency IN ('weekly','monthly','quarterly','semi_annual')),
        next_review_date TEXT NOT NULL,
        last_review_date TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','completed')),
        scope TEXT DEFAULT '{}',
        notes TEXT,
        created_by_user_id TEXT REFERENCES users(user_id),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      INSERT INTO ongoing_monitoring_new (
        monitoring_id, request_id, review_frequency, next_review_date, last_review_date,
        status, scope, notes, created_by_user_id, created_at, updated_at
      )
      SELECT
        monitoring_id, request_id, review_frequency, next_review_date, last_review_date,
        status, scope, notes, created_by_user_id, created_at, updated_at
      FROM ongoing_monitoring;

      DROP TABLE ongoing_monitoring;
      ALTER TABLE ongoing_monitoring_new RENAME TO ongoing_monitoring;

      CREATE INDEX IF NOT EXISTS idx_monitoring_request ON ongoing_monitoring(request_id);
      CREATE INDEX IF NOT EXISTS idx_monitoring_next_review ON ongoing_monitoring(next_review_date);
    `);
  }

  console.log('✓ Database migration completed successfully');
}

module.exports = { db, init, migrate };

if (require.main === module) {
  init().then(() => {
    migrate();
    db.close();
  }).catch(err => { console.error(err); process.exit(1); });
}
