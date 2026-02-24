# Cross-Industry Mandatory Reference Checking (MRC) Platform
## Detailed Project Requirements & System Design

---

## 1. EXECUTIVE SUMMARY

### Problem Statement
The HKMA Mandatory Reference Checking (MRC) Scheme Phase 2 (effective 30 September 2025) expands conduct-based reference checking from ~3,500 senior banking staff (Phase 1) to ~50,000 regulated individuals across banking. The anticipated 2026-2027 cross-industry expansion to SFC, IA, and MPFA-regulated entities will encompass 100,000+ in-scope individuals across the entire financial services sector.

The current process is bilateral, template-based, and manual. There is no centralised platform, no standardised cross-sector mechanism, and no API infrastructure. This creates:
- 30-day response cycles per reference request
- No standardised cross-sector reference exchange mechanism
- Manual compliance tracking across 4 regulators (HKMA, SFC, IA, MPFA)
- Data fragmentation across different formats, retention periods, and consent frameworks
- No network effects or institutional coordination benefits

### Proposed Solution
A centralised, regulator-endorsed digital platform that automates the end-to-end MRC process across banking, securities, insurance, and MPF sectors. First-mover advantage captures network effects; each institution joined increases value for all participants.

### Target Market
| Sector | Regulator | Estimated In-Scope Individuals | In-Scope Institutions |
|--------|-----------|-------------------------------|----------------------|
| Banking | HKMA | ~50,000 | ~190 Authorised Institutions |
| Securities | SFC | ~45,000 | ~3,000 Licensed Corporations |
| Insurance | IA | ~100,000+ | ~800 Licensed Agencies, ~700 Licensed Brokers |
| MPF | MPFA | ~25,000 | ~430 Principal Intermediaries |

Note: Significant overlap exists (individuals licensed across multiple sectors).

---

## 2. REGULATORY FRAMEWORK MAPPING

### 2.1 MRC Scheme Core Requirements (All Sectors)

**Conduct Information Categories (per HKAB/HKMA MRC Information Template):**
1. Breach of legal or regulatory requirements (BO, SFO, IO, MPFSO)
2. Incidents casting doubt on honesty and integrity
3. Misconduct reports filed with regulators (HKMA, SFC, IA, MPFA)
4. Internal or external disciplinary actions arising from conduct matters
5. Ongoing internal investigations
6. Additional relevant information (other material misconduct)

**Operational Requirements:**
- Lookback period: 7 years
- Response deadline: 1 month (30 calendar days) from reference request
- Consent: Written consent from prospective employee (template prescribed)
- Data retention: Subject to PDPO requirements and sector-specific rules
- Materiality: No industry-wide quantitative threshold; institution-specific

### 2.2 Sector-Specific Regulatory Variations

| Dimension | HKMA (Banking) | SFC (Securities) | IA (Insurance) | MPFA (MPF) |
|-----------|----------------|-------------------|----------------|------------|
| Governing Ordinance | Banking Ordinance (BO) | Securities and Futures Ordinance (SFO) | Insurance Ordinance (IO) | Mandatory Provident Fund Schemes Ordinance (MPFSO) |
| In-Scope Roles | Directors, CEs, EOs, ROs, licensed/registered staff, client-facing advisory | Licensed Representatives, Responsible Officers, Relevant Individuals | Technical Representatives (s64Y, s64ZC), Responsible Officers | Subsidiary Intermediaries (s34U(4)), Responsible Officers |
| Fitness & Properness | BO s71C | SFO s129 | IO s64ZZA | MPFSO guidelines |
| Disciplinary Powers | HKMA supervisory action | SFC disciplinary tribunal | IA disciplinary powers (max HK$10M or 3x profit) | MPFA disciplinary orders (max HK$10M or 3x profit) |
| Public Register | Register of AIs, Register of Securities Staff | Public Register of Licensed Persons | Register of Licensed Insurance Intermediaries | Subsidiary & Principal Intermediary Registers |
| Enforcement Publication | HKMA press releases | SFC Enforcement News | IA Enforcement News, Register annotations | MPFA Enforcement News, Register (5-year disciplinary history) |

### 2.3 Cross-Border and Privacy Requirements

**PDPO (Cap. 486) Compliance:**
- Section 33 (cross-border transfer restrictions) NOT YET IN FORCE but platform should be designed for compliance
- Six Data Protection Principles (DPPs) apply:
  - DPP1: Purpose limitation (reference checking only)
  - DPP2: Accuracy of data
  - DPP3: Retention limitation
  - DPP4: Security safeguards
  - DPP5: Openness (privacy policy)
  - DPP6: Data access and correction rights
- PCPD Recommended Model Contractual Clauses (RMCs) for any cross-border data flows
- Greater Bay Area (GBA) Standard Contract for Mainland China data flows

**Consent Framework:**
- Separate consent required for each reference-providing institution
- Consent must cover: (a) authorisation for recruiting institution to conduct reference check, (b) authorisation for reference-providing institution to disclose records, (c) exemption from contractual confidentiality obligations
- Consent form template prescribed by HKAB (must be adapted for cross-sector use)

---

## 3. SYSTEM ARCHITECTURE

### 3.1 High-Level Architecture

```
+------------------------------------------------------------------+
|                    PLATFORM PRESENTATION LAYER                    |
|  +------------------+  +------------------+  +----------------+  |
|  | Institution Portal|  | Regulator Portal |  | Individual     |  |
|  | (HR/Compliance)   |  | (HKMA/SFC/IA/   |  | Self-Service   |  |
|  |                   |  |  MPFA Dashboard) |  | (Consent/View) |  |
|  +------------------+  +------------------+  +----------------+  |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                    API GATEWAY & ORCHESTRATION                    |
|  +------------------+  +------------------+  +----------------+  |
|  | Authentication   |  | Rate Limiting    |  | API Versioning |  |
|  | & Authorisation  |  | & Throttling     |  | & Routing      |  |
|  +------------------+  +------------------+  +----------------+  |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                    CORE SERVICES LAYER                            |
|  +-------------------+  +--------------------+                   |
|  | Reference Request  |  | Consent Management |                  |
|  | Engine             |  | Service            |                  |
|  +-------------------+  +--------------------+                   |
|  +-------------------+  +--------------------+                   |
|  | Conduct Information|  | Cross-Sector       |                  |
|  | Repository         |  | Identity Resolution|                  |
|  +-------------------+  +--------------------+                   |
|  +-------------------+  +--------------------+                   |
|  | Compliance &       |  | Workflow &         |                  |
|  | Audit Engine       |  | Notification Engine|                  |
|  +-------------------+  +--------------------+                   |
|  +-------------------+  +--------------------+                   |
|  | Document           |  | Analytics &        |                  |
|  | Generation         |  | Reporting          |                  |
|  +-------------------+  +--------------------+                   |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                    DATA & INTEGRATION LAYER                       |
|  +-------------------+  +--------------------+                   |
|  | Encrypted Data     |  | External Registry  |                  |
|  | Store (at-rest)    |  | Connectors         |                  |
|  +-------------------+  +--------------------+                   |
|  +-------------------+  +--------------------+                   |
|  | Message Queue      |  | Identity           |                  |
|  | (Async Processing) |  | Verification       |                  |
|  +-------------------+  +--------------------+                   |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                    EXTERNAL DATA SOURCES                          |
|  HKMA APIs | SFC Register | IA Register | MPFA Register |       |
|  iAM Smart | ICRIS | HKAB Templates | Regulator Portals |       |
+------------------------------------------------------------------+
```

### 3.2 Core Service Modules

#### 3.2.1 Reference Request Engine
- Initiate, route, track, and close MRC reference requests
- Support bilateral (institution-to-institution) and platform-mediated requests
- Enforce 30-day SLA with escalation workflows
- Handle cross-sector requests (e.g., bank recruiting from insurance employer)
- Track request status: Draft > Consent Obtained > Sent > Acknowledged > In Progress > Response Provided > Reviewed > Closed

#### 3.2.2 Consent Management Service
- Digital consent capture aligned with HKAB MRC consent form template
- Sector-specific consent variations (banking, securities, insurance, MPF)
- Consent versioning, expiry, and withdrawal tracking
- eSignature integration (iAM Smart digital signing or equivalent)
- Consent audit trail for PDPO compliance
- Multi-party consent: recruiting institution consent + reference-providing institution consent + individual consent

#### 3.2.3 Conduct Information Repository
- Structured storage for the 6 MRC conduct information categories
- Materiality tagging (institution-specific thresholds)
- 7-year lookback window with automatic ageing/purge
- Support for "ongoing investigation" status with periodic review triggers
- Encrypted at rest and in transit; field-level encryption for conduct data
- Immutable audit log for all access, modifications, and disclosures

#### 3.2.4 Cross-Sector Identity Resolution
- Resolve individual identity across multiple regulatory registers
- Handle individuals licensed/registered across multiple sectors simultaneously
- Master Person Index (MPI) linking:
  - HKID number (primary key, encrypted)
  - HKMA Securities Staff registration
  - SFC licence number
  - IA licence number
  - MPFA registration number
- Name matching with fuzzy logic (Chinese/English name variations)
- Employment history graph (which institutions, which roles, which periods)

#### 3.2.5 Compliance & Audit Engine
- Real-time compliance monitoring against regulator-specific requirements
- SLA tracking (30-day response window)
- Automatic flagging of overdue responses
- Audit trail generation for regulatory examination
- Regulator-specific report generation (HKMA, SFC, IA, MPFA formats)
- Statistics dashboard: requests sent, received, pending, overdue, negative results

#### 3.2.6 Workflow & Notification Engine
- Configurable approval workflows per institution
- Role-based notifications (HR initiator, compliance reviewer, senior approver)
- Multi-channel: email, in-platform, SMS, push notification
- Escalation chains for approaching/breaching SLA deadlines
- Calendar integration for review deadlines

#### 3.2.7 Document Generation Service
- Auto-generate MRC Information Templates populated with available data
- Consent form generation (sector-specific variants)
- Reference request letter generation
- Compliance summary reports
- PDF/digital document with tamper-evident signatures

#### 3.2.8 Analytics & Reporting
- Platform-wide statistics (anonymised/aggregated for regulator dashboards)
- Institution-level KPIs: average response time, completion rates, negative hit rates
- Cross-sector mobility trends (where talent moves between sectors)
- Regulatory examination support reports
- Anomaly detection (unusual patterns in reference responses)

---

## 4. DATA SOURCES & INTEGRATIONS

### 4.1 Regulatory Register APIs (Primary Data Sources)

#### HKMA Open APIs (LIVE - Free, No Registration Required)

| Endpoint | URL | Data Provided |
|----------|-----|---------------|
| Register of AIs & LROs | `https://api.hkma.gov.hk/public/bank-svf-info/register-ais-lros` | All authorised institutions, licence types, addresses |
| Register of Securities Staff of AIs | `https://api.hkma.gov.hk/public/bank-svf-info/register-ais-secstaff` | Current/former relevant individuals at AIs engaged in SFC-regulated activities |
| Register of SVF Licensees | `https://api.hkma.gov.hk/public/bank-svf-info/register-svf-licensees` | Stored value facility licensees |

**Documentation Portal:** https://apidocs.hkma.gov.hk/documentation/
**Swagger/Data Dictionaries:** Available per endpoint (e.g., `register-ais-secstaff-swagger.json`)
**Key Parameters (Securities Staff):** `lang`, `searchtype` (engName/chiName), `is_curr_rel_indiv`, `surname`

#### SFC Public Register (Web Scrape / Data Agreement Required)

| Source | URL | Data Provided |
|--------|-----|---------------|
| Public Register of Licensed Persons | https://www.sfc.hk/en/Regulatory-functions/Intermediaries/Licensing/Register-of-licensed-persons-and-registered-institutions | All SFC-licensed individuals and corporations, licence types (RA 1-10), accreditation to principals |
| Enforcement Actions | https://www.sfc.hk/en/Regulatory-functions/Enforcement/Enforcement-actions | Disciplinary proceedings, sanctions, enforcement statistics |
| Persons Subject to Enforcement | https://www.sfc.hk/en/Regulatory-functions/Enforcement/Enforcement-actions/Enforcement-statistics/Persons-and-corporations-subject-to-enforcement-action | Ongoing/concluded enforcement proceedings |

**API Status:** No public API. Web portal search only. Options:
1. Negotiate data-sharing agreement with SFC
2. Use Kaggle dataset (https://www.kaggle.com/datasets/gautiermarti/hk-sfc-register) as reference schema
3. Structured web data extraction (subject to SFC terms of use)
4. Request SFC to publish Open API (advocacy via HKAB/industry working group)

#### IA Register of Licensed Insurance Intermediaries (Web Scrape / Data Agreement Required)

| Source | URL | Data Provided |
|--------|-----|---------------|
| Register of Licensed Insurance Intermediaries | https://iir.ia.org.hk/ | All licensed agents, brokers, agencies; licence numbers, types, status |
| Register of Authorized Insurers | https://www.ia.org.hk/en/supervision/reg_insurers_lloyd/register_of_authorized_insurers.html | All authorised insurance companies |
| Enforcement News | https://www.ia.org.hk (Enforcement section) | Public disciplinary actions, sanctions |

**API Status:** No public API. Web portal search. Register includes downloadable full list of Licensed Insurance Agencies.
**Key Fields Available:** Licence number, intermediary type, name, status, principal, disciplinary annotations (5-year).

#### MPFA Public Registers (Web Scrape / Data Agreement Required)

| Source | URL | Data Provided |
|--------|-----|---------------|
| Subsidiary Intermediary Register | https://www.mpfa.org.hk/en/info-centre/public-registers/subsidiary-intermediary | Registered subsidiary intermediaries, 5-year disciplinary history |
| Principal Intermediary Register | https://www.mpfa.org.hk/en/info-centre/public-registers/principal-intermediary | Registered principal intermediaries |
| Enforcement News | https://www.mpfa.org.hk/en/enforcement/mpf-intermediary/enforcement-news | Public enforcement actions |

**API Status:** No public API. Web portal search only. Register updated daily but with processing lag.
**Key Fields Available:** Registration number, name, principal intermediary, frontline regulator, disciplinary history (5 years).

### 4.2 Identity Verification & Authentication

| Source | Integration Method | Purpose |
|--------|--------------------|---------|
| **iAM Smart** (OGCIO) | 3 API sets: Authentication, Digital Signing, e-ME Form Filling | Individual identity verification (HKID-based), digital consent signing, auto form filling |
| **iAM Smart+ (Enhanced)** | In-person verified account | Higher-assurance identity for sensitive conduct data access |
| **iAM Smart Sandbox** | Via Cyberport collaboration | Development/testing environment |

**Integration Requirements:** OGCIO API access agreement, strict privacy/security compliance, regular security audits.

### 4.3 Company & Institutional Data

| Source | URL/Method | Purpose |
|--------|------------|---------|
| **ICRIS (Companies Registry)** | https://www.icris.cr.gov.hk + DATA.GOV.HK datasets | Verify institutional identity, directors, company status, UBI (Unique Business Identifier) |
| **DATA.GOV.HK** | https://data.gov.hk (Companies Registry datasets, 20 datasets) | Open data on company registrations |
| **HKAB Member Directory** | Via HKAB | Verify HKAB membership for banking sector institutions |

**Note:** ICRIS revamped in December 2023 with Unique Business Identifier (UBI) system. Director personal data now restricted to "specified persons."

### 4.4 Existing MRC Templates & Forms

| Document | Source | Integration Approach |
|----------|--------|---------------------|
| MRC Information Template | HKAB/DTC Association Guidelines (Appendix) | Digitise into structured data schema; map all 6 conduct categories to database fields |
| MRC Consent Form | HKAB/DTC Association Guidelines (Appendix) | Digitise; integrate with iAM Smart digital signing |
| Personal Information Collection Statement (PICS) | Per-institution | Template library with institution-specific customisation |
| Intra-group transfer forms | Per banking group | Support alternative intra-group workflows |

### 4.5 Supplementary Data Sources

| Source | Purpose | Integration |
|--------|---------|-------------|
| Hong Kong Police (CAPO) | Criminal record checks (separate from MRC but complementary) | Out of scope for Phase 1; future integration |
| PCPD (Privacy Commissioner) | PDPO compliance guidance, enforcement actions | Reference only; no data integration |
| HKMA Supervisory Policy Manual | Regulatory guidance updates | Webhook/RSS for policy changes affecting MRC |
| Individual bank Open APIs (Phase III/IV) | Account verification, onboarding | Future integration for streamlined hiring workflows |

---

## 5. DETAILED FUNCTIONAL REQUIREMENTS

### 5.1 Institution Onboarding (FR-100 Series)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-101 | Platform shall support onboarding of institutions across all 4 sectors (HKMA AIs, SFC Licensed Corps, IA Licensed Intermediaries, MPFA Principal Intermediaries) | P0 |
| FR-102 | Institution identity verified against relevant regulatory register (HKMA/SFC/IA/MPFA) and ICRIS | P0 |
| FR-103 | Institution admin users authenticated via iAM Smart or institutional SSO (SAML 2.0/OIDC) | P0 |
| FR-104 | Role-based access: Institution Admin, HR Initiator, Compliance Reviewer, Senior Approver, Read-only Auditor | P0 |
| FR-105 | Institution profile includes: sector(s), regulator(s), licence numbers, contact details, SOP configuration | P1 |
| FR-106 | Support institutions licensed across multiple sectors (e.g., bank with SFC and IA licences) with unified profile | P0 |
| FR-107 | Onboarding wizard with regulatory obligation acknowledgement and platform terms acceptance | P1 |
| FR-108 | Bulk user provisioning via CSV upload or SCIM integration | P2 |

### 5.2 Reference Request Management (FR-200 Series)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-201 | Recruiting institution can initiate MRC reference request for a prospective employee | P0 |
| FR-202 | System identifies all in-scope previous/current employers from past 7 years using cross-register identity resolution | P0 |
| FR-203 | System generates sector-appropriate reference request forms (banking/securities/insurance/MPF variants) | P0 |
| FR-204 | System routes requests to reference-providing institutions on the platform automatically | P0 |
| FR-205 | For institutions NOT on the platform, system generates downloadable request package (PDF + consent) for manual dispatch | P1 |
| FR-206 | Reference-providing institution receives request with all required consent documentation attached | P0 |
| FR-207 | Reference-providing institution can respond using structured digital form (mapping to 6 MRC conduct categories) | P0 |
| FR-208 | Response options: No negative information / Negative information with structured details / Unable to provide (with reason) | P0 |
| FR-209 | System enforces 30-day SLA from request date with automated reminders at Day 7, 14, 21, 25, 28 | P0 |
| FR-210 | Escalation workflow: auto-escalate to compliance officer at Day 25; flag to regulator dashboard at Day 30+ | P0 |
| FR-211 | Cross-sector request routing: bank requesting reference from insurance employer routes correctly even if different regulatory frameworks apply | P0 |
| FR-212 | Support conditional offers: track requests in progress alongside onboarding timeline | P1 |
| FR-213 | Batch request initiation: HR can initiate multiple reference checks simultaneously for bulk hiring | P1 |
| FR-214 | Request cancellation and amendment workflow with audit trail | P1 |

### 5.3 Consent Management (FR-300 Series)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-301 | Digital consent capture using prescribed MRC consent form template | P0 |
| FR-302 | Support iAM Smart digital signing for legally binding consent | P0 |
| FR-303 | Fallback: wet ink consent form upload (scanned PDF) with attestation | P1 |
| FR-304 | Consent must explicitly cover: (a) recruiting institution reference check authorisation, (b) reference-providing institution disclosure authorisation, (c) contractual confidentiality exemption | P0 |
| FR-305 | Sector-specific consent variations auto-selected based on individual's regulatory status | P0 |
| FR-306 | Consent validity tracking: link consent to specific reference request; expire on completion or withdrawal | P0 |
| FR-307 | Individual can withdraw consent at any time; system halts in-progress requests and notifies all parties | P1 |
| FR-308 | Consent re-use: if individual has existing valid consent covering scope, avoid duplicate consent requests | P2 |
| FR-309 | Multi-language support: English and Traditional Chinese consent forms | P0 |

### 5.4 Conduct Information Management (FR-400 Series)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-401 | Structured data capture for all 6 MRC conduct information categories | P0 |
| FR-402 | Free-text fields with character limits for narrative descriptions of conduct issues | P0 |
| FR-403 | Date/period fields for when conduct occurred | P0 |
| FR-404 | Severity/materiality tagging (institution-defined thresholds) | P1 |
| FR-405 | "Ongoing investigation" status with periodic review reminders | P0 |
| FR-406 | Supplementary document attachment (investigation reports, disciplinary outcomes) with encryption | P1 |
| FR-407 | 7-year retention with automatic purge scheduling and pre-purge notification | P0 |
| FR-408 | Amendment process: reference-providing institution can update previously submitted information with full audit trail | P0 |
| FR-409 | Dispute resolution workflow: individual can challenge inaccurate conduct information | P1 |
| FR-410 | Cross-reference with public enforcement actions from regulator registers (SFC/IA/MPFA enforcement news) | P2 |

### 5.5 Cross-Sector Identity Resolution (FR-500 Series)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-501 | Master Person Index (MPI) using encrypted HKID as primary key | P0 |
| FR-502 | Link individual to all regulatory registrations: HKMA Securities Staff ID, SFC Licence Number, IA Licence Number, MPFA Registration Number | P0 |
| FR-503 | Automated lookup against HKMA API (Register of Securities Staff) for identity verification | P0 |
| FR-504 | Automated lookup against SFC Public Register for licence verification | P0 (depends on data access) |
| FR-505 | Automated lookup against IA Register for licence verification | P0 (depends on data access) |
| FR-506 | Automated lookup against MPFA Register for registration verification | P0 (depends on data access) |
| FR-507 | Fuzzy name matching for Chinese/English name variations, transliterations | P1 |
| FR-508 | Employment history graph: all known employers (in-scope institutions) over 7-year lookback | P0 |
| FR-509 | Dual-licensed individual handling: single reference request covers all relevant sectors | P1 |
| FR-510 | De-duplication: prevent duplicate records for same individual across sectors | P0 |

### 5.6 Compliance & Audit (FR-600 Series)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-601 | Immutable audit log for all system actions (who, what, when, from where) | P0 |
| FR-602 | SLA compliance dashboard per institution (requests sent, received, response times) | P0 |
| FR-603 | Regulator-facing dashboard showing sector-wide compliance statistics | P0 |
| FR-604 | Automated regulatory report generation (HKMA/SFC/IA/MPFA specific formats) | P1 |
| FR-605 | Examination support: export complete audit trail for specific reference checks on regulator request | P0 |
| FR-606 | PDPO compliance tracking: consent records, data retention schedules, access logs, data subject requests | P0 |
| FR-607 | Annual compliance attestation workflow for participating institutions | P2 |
| FR-608 | Regulatory change management: flag when MRC guidelines are updated; track institutional adoption | P2 |

### 5.7 Regulator Portal (FR-700 Series)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-701 | Separate authenticated portal for each regulator (HKMA, SFC, IA, MPFA) | P0 |
| FR-702 | Aggregated anonymised statistics: volume of requests, response times, negative hit rates, cross-sector flows | P0 |
| FR-703 | Ability to view individual institution compliance status | P0 |
| FR-704 | Alert system for institutions repeatedly breaching 30-day SLA | P0 |
| FR-705 | Cross-sector mobility reporting: talent flows between banking/securities/insurance/MPF | P1 |
| FR-706 | Examination mode: regulator can request full audit trail for specific institution or individual (with appropriate authority) | P0 |
| FR-707 | Policy update broadcast: regulators can publish guidance updates to all participating institutions | P2 |

### 5.8 Individual Self-Service (FR-800 Series)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-801 | Individuals can view their own MRC record (conduct information held about them) via iAM Smart authentication | P1 |
| FR-802 | Individuals can track consent status and reference requests involving them | P1 |
| FR-803 | Individuals can exercise PDPO data access rights through the platform | P1 |
| FR-804 | Individuals can initiate data correction requests for inaccurate information | P1 |
| FR-805 | Individuals can withdraw consent with clear consequences communicated | P1 |
| FR-806 | Individuals can download their MRC history for personal records | P2 |

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Security

| ID | Requirement |
|----|------------|
| NFR-S01 | AES-256 encryption at rest for all conduct information and PII |
| NFR-S02 | TLS 1.3 for all data in transit |
| NFR-S03 | Field-level encryption for HKID numbers (searchable encryption or tokenisation) |
| NFR-S04 | Hardware Security Module (HSM) for key management |
| NFR-S05 | Multi-factor authentication for all users (iAM Smart or institutional MFA) |
| NFR-S06 | Role-based access control (RBAC) with principle of least privilege |
| NFR-S07 | IP whitelisting for institutional API access |
| NFR-S08 | Annual penetration testing by independent assessor |
| NFR-S09 | SOC 2 Type II certification |
| NFR-S10 | HKMA Technology Risk Management guidelines (TM-E-1) compliance |
| NFR-S11 | Data residency: all data stored in Hong Kong (local data centres) |
| NFR-S12 | Database activity monitoring and anomaly detection |
| NFR-S13 | Automated session timeout (15 minutes inactivity) |
| NFR-S14 | Data masking in non-production environments |

### 6.2 Performance & Scalability

| ID | Requirement |
|----|------------|
| NFR-P01 | Support 100,000+ individual records with room to scale to 250,000 |
| NFR-P02 | Support 500+ participating institutions concurrently |
| NFR-P03 | Reference request submission: < 3 seconds response time |
| NFR-P04 | Identity resolution lookup: < 5 seconds across all 4 registers |
| NFR-P05 | Peak load: 5,000 concurrent users during hiring season (Q1, Q3) |
| NFR-P06 | 99.9% uptime SLA (excluding planned maintenance) |
| NFR-P07 | Horizontal scaling capability for compute and storage tiers |
| NFR-P08 | Database partitioning strategy for multi-year data retention |

### 6.3 Availability & Disaster Recovery

| ID | Requirement |
|----|------------|
| NFR-A01 | Active-passive DR configuration with Hong Kong secondary site |
| NFR-A02 | RPO (Recovery Point Objective): 1 hour |
| NFR-A03 | RTO (Recovery Time Objective): 4 hours |
| NFR-A04 | Daily encrypted backups with 90-day retention |
| NFR-A05 | Annual DR drill with documented results |

### 6.4 Integration

| ID | Requirement |
|----|------------|
| NFR-I01 | RESTful API with OpenAPI 3.0 specification for all platform functions |
| NFR-I02 | Webhook support for event-driven notifications (request received, response submitted, SLA breach) |
| NFR-I03 | SFTP channel for institutions unable to integrate via API (batch file exchange) |
| NFR-I04 | SAML 2.0 and OIDC support for institutional SSO |
| NFR-I05 | iAM Smart API integration (Authentication, Digital Signing, e-ME) |
| NFR-I06 | HKMA Open API integration (live register lookups) |
| NFR-I07 | Email integration (SMTP) for notifications |
| NFR-I08 | API rate limiting: 100 requests/minute per institution (configurable) |

### 6.5 Compliance & Legal

| ID | Requirement |
|----|------------|
| NFR-C01 | PDPO compliant data handling throughout platform lifecycle |
| NFR-C02 | Data retention policies configurable per sector (default: 7 years + current year) |
| NFR-C03 | Automated data purge with pre-purge notification and confirmation |
| NFR-C04 | Right of access (PDPO s18) and right of correction (PDPO s22) supported |
| NFR-C05 | Data Processing Impact Assessment (DPIA) conducted pre-launch |
| NFR-C06 | HKMA Supervisory Policy Manual compliance (TM-E-1, OR-1) |
| NFR-C07 | Legal privilege protection: flagging mechanism for legally privileged information |
| NFR-C08 | Cross-border transfer safeguards ready for PDPO Section 33 enactment |

---

## 7. DATA MODEL (CORE ENTITIES)

### 7.1 Entity Relationship Summary

```
Institution (1) ----< (M) InstitutionLicence
Institution (1) ----< (M) InstitutionUser
Individual   (1) ----< (M) RegulatoryRegistration
Individual   (1) ----< (M) EmploymentRecord
Individual   (1) ----< (M) Consent

ReferenceRequest (1) ---- (1) Consent
ReferenceRequest (1) ---- (1) RecruitingInstitution
ReferenceRequest (1) ---- (1) ReferenceProvidingInstitution
ReferenceRequest (1) ---- (1) Individual
ReferenceRequest (1) ----< (M) ConductInformation
ReferenceRequest (1) ----< (M) AuditLog

ConductInformation (1) ---- (1) ConductCategory (enum)
ConductInformation (1) ----< (M) SupportingDocument
```

### 7.2 Key Entities

**Institution**
- `institution_id` (UUID)
- `name_en`, `name_zh`
- `institution_type` (ENUM: AI, DTC, Licensed_Corp_SFC, Licensed_Agency_IA, Licensed_Broker_IA, Principal_Intermediary_MPFA)
- `ubi` (Unique Business Identifier from ICRIS)
- `sectors[]` (ARRAY: banking, securities, insurance, mpf)
- `regulators[]` (ARRAY: HKMA, SFC, IA, MPFA)
- `licence_numbers` (JSONB: sector-specific licence identifiers)
- `status` (ENUM: active, suspended, revoked, wound_up)
- `onboarded_date`, `last_verified_date`

**Individual**
- `individual_id` (UUID)
- `hkid_hash` (SHA-256 hash of HKID for matching; encrypted HKID stored separately)
- `hkid_encrypted` (AES-256 encrypted)
- `name_en_surname`, `name_en_given`
- `name_zh`
- `dob_encrypted`
- `iam_smart_id` (if linked)

**RegulatoryRegistration**
- `registration_id` (UUID)
- `individual_id` (FK)
- `regulator` (ENUM: HKMA, SFC, IA, MPFA)
- `registration_number` (sector-specific)
- `registration_type` (e.g., Relevant Individual, Technical Representative, Subsidiary Intermediary)
- `regulated_activities[]` (ARRAY)
- `status` (ENUM: current, former, suspended)
- `effective_from`, `effective_to`
- `principal_institution_id` (FK)

**ReferenceRequest**
- `request_id` (UUID)
- `individual_id` (FK)
- `recruiting_institution_id` (FK)
- `reference_providing_institution_id` (FK)
- `consent_id` (FK)
- `request_sector` (ENUM: banking, securities, insurance, mpf, cross_sector)
- `lookback_start_date` (calculated: 7 years from request date)
- `status` (ENUM: draft, consent_obtained, sent, acknowledged, in_progress, response_provided, reviewed, closed, cancelled)
- `request_date`, `acknowledgement_date`, `response_date`, `review_date`
- `sla_deadline` (request_date + 30 days)
- `sla_breached` (BOOLEAN)
- `initiated_by_user_id` (FK)

**ConductInformation**
- `conduct_id` (UUID)
- `request_id` (FK)
- `category` (ENUM: legal_regulatory_breach, integrity_concern, misconduct_report, disciplinary_action, ongoing_investigation, additional_information)
- `description_encrypted` (AES-256)
- `incident_start_date`, `incident_end_date`
- `severity` (ENUM: material, non_material, under_review)
- `regulator_reported` (BOOLEAN)
- `regulator_reference` (if reported)
- `status` (ENUM: current, resolved, withdrawn)
- `submitted_by_user_id`, `submitted_date`
- `last_updated_by`, `last_updated_date`

**Consent**
- `consent_id` (UUID)
- `individual_id` (FK)
- `recruiting_institution_id` (FK)
- `reference_providing_institution_id` (FK)
- `consent_type` (ENUM: mrc_standard, cross_sector, intra_group)
- `consent_scope` (JSONB: what information covered)
- `signature_method` (ENUM: iam_smart, wet_ink_upload, electronic)
- `iam_smart_signature_id` (if applicable)
- `granted_date`, `expiry_date`, `withdrawn_date`
- `status` (ENUM: active, expired, withdrawn)
- `document_url` (encrypted reference to stored consent document)

**AuditLog**
- `log_id` (UUID)
- `entity_type`, `entity_id`
- `action` (ENUM: create, read, update, delete, export, consent_granted, consent_withdrawn, sla_breach, escalation)
- `performed_by_user_id`
- `performed_by_institution_id`
- `timestamp`
- `ip_address`
- `details` (JSONB)

---

## 8. INTEGRATION ARCHITECTURE

### 8.1 Data Source Integration Matrix

| Data Source | Protocol | Auth | Frequency | Direction | Status |
|------------|----------|------|-----------|-----------|--------|
| HKMA Register of AIs & LROs | REST API | None (public) | Daily sync | Inbound | Available now |
| HKMA Register of Securities Staff | REST API | None (public) | Daily sync | Inbound | Available now |
| HKMA Register of SVF Licensees | REST API | None (public) | Daily sync | Inbound | Available now |
| SFC Public Register | Web scraping or data agreement | N/A | Daily sync | Inbound | Requires negotiation |
| IA Register of Licensed Intermediaries | Web scraping or data agreement | N/A | Daily sync | Inbound | Requires negotiation |
| MPFA Subsidiary Intermediary Register | Web scraping or data agreement | N/A | Daily sync | Inbound | Requires negotiation |
| MPFA Principal Intermediary Register | Web scraping or data agreement | N/A | Daily sync | Inbound | Requires negotiation |
| iAM Smart (Authentication) | REST API | OAuth 2.0 / OGCIO agreement | Real-time | Bidirectional | Requires OGCIO agreement |
| iAM Smart (Digital Signing) | REST API | OAuth 2.0 / OGCIO agreement | Real-time | Bidirectional | Requires OGCIO agreement |
| iAM Smart (e-ME Form Fill) | REST API | OAuth 2.0 / OGCIO agreement | Real-time | Inbound | Requires OGCIO agreement |
| ICRIS (Companies Registry) | DATA.GOV.HK datasets + web portal | N/A | Weekly sync | Inbound | Partially available (open data) |
| SFC Enforcement Actions | Web scraping | N/A | Daily sync | Inbound | Public data |
| IA Enforcement News | Web scraping | N/A | Daily sync | Inbound | Public data |
| MPFA Enforcement News | Web scraping | N/A | Daily sync | Inbound | Public data |
| Institutional HRIS (per institution) | REST API / SFTP | API Key / mTLS | Event-driven | Bidirectional | Per-institution integration |

### 8.2 Critical Integration Gaps & Mitigation

| Gap | Impact | Mitigation Strategy |
|-----|--------|---------------------|
| SFC has no public API | Cannot auto-verify SFC licence status | 1) Lobby SFC via HKAB/ASIFMA for API provision. 2) Interim: data-sharing MOU with SFC. 3) Fallback: manual verification with cached web data |
| IA has no public API | Cannot auto-verify IA licence status | 1) Lobby IA for API. 2) IA register provides downloadable agency list. 3) Structured data extraction from iir.ia.org.hk |
| MPFA has no public API | Cannot auto-verify MPFA registration | 1) Lobby MPFA for API. 2) Structured data extraction from MPFA register |
| No centralised cross-sector identity system | Cannot link individual across sectors without HKID | iAM Smart integration provides verified HKID. Fallback: institution submits HKID (encrypted) during reference request |
| Institutions not on platform | Bilateral manual process remains | Generate downloadable request packages; provide upload portal for responses; incentivise adoption via regulator endorsement |
| Cross-border employers (non-HK) | No MRC obligation for non-HK entities | Flag cross-border employment gaps; provide voluntary request mechanism; document inability to obtain reference |

---

## 9. PHASED DELIVERY ROADMAP

### Phase 1: Banking Foundation (Months 1-8)
- Core platform: Reference Request Engine, Consent Management, Conduct Information Repository
- HKMA API integration (Registers of AIs, Securities Staff)
- iAM Smart integration (Authentication, Digital Signing)
- Institution onboarding for HKMA Authorised Institutions
- MRC Information Template digitalisation (banking sector)
- Compliance & Audit Engine (HKMA requirements)
- Pilot with 10-20 major AIs

### Phase 2: Securities Sector Expansion (Months 6-12)
- SFC data integration (negotiate data-sharing agreement or implement structured extraction)
- Cross-sector identity resolution (link HKMA + SFC registrations)
- Securities-specific consent form variants
- SFC regulator portal
- Cross-sector reference routing (bank <> securities firm)
- Onboard SFC-licensed corporations

### Phase 3: Insurance & MPF Expansion (Months 10-16)
- IA data integration
- MPFA data integration
- Insurance and MPF-specific consent form variants
- IA and MPFA regulator portals
- Full cross-sector reference routing (all 4 sectors)
- Onboard insurance agencies/brokers and MPF intermediaries

### Phase 4: Scale & Network Effects (Months 14-20)
- Individual self-service portal
- Advanced analytics and cross-sector mobility reporting
- Institutional HRIS integrations (major banks, insurers)
- API marketplace for third-party compliance tools
- Mobile application
- International reference checking extension (GBA, Singapore MAS)

---

## 10. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SFC/IA/MPFA refuse API access or data sharing | Medium | High | Engage regulators early via HKAB industry working group; demonstrate mutual benefit; offer to build API for them |
| Low institutional adoption (network effect failure) | Medium | Critical | Secure HKMA endorsement/mandate; start with top-20 banks; demonstrate ROI (faster reference checks) |
| PDPO Section 33 enacted with restrictive requirements | Low | Medium | Design for compliance from day one; implement data residency; prepare contractual frameworks |
| Competitor platform launched by regtech vendor | Medium | Medium | First-mover advantage; deep regulatory integration; network effects create switching costs |
| Data breach of conduct information | Low | Critical | Defence in depth: encryption, HSM, SOC 2, pen testing, insurance; breach notification procedures |
| Cross-sector consent framework challenged legally | Low | High | Legal review by HK privacy law specialists; PCPD pre-consultation; conservative consent approach |
| Regulatory divergence (4 regulators disagree on standards) | Medium | High | Active participation in HKMA-led cross-regulator working group; flexible configuration per sector |

---

## 11. STAKEHOLDER ENGAGEMENT REQUIREMENTS

### Regulatory Engagement
| Stakeholder | Engagement Required |
|-------------|-------------------|
| HKMA (mrcscheme@hkma.iclnet.hk) | Platform endorsement, API access confirmation, supervisory expectations alignment |
| SFC | Data-sharing agreement for Public Register, enforcement data access |
| IA | Data-sharing agreement for Licensed Intermediaries Register |
| MPFA | Data-sharing agreement for Intermediary Registers |
| PCPD | Pre-consultation on cross-sector consent framework, DPIA review |
| OGCIO | iAM Smart API access agreement, sandbox access |

### Industry Engagement
| Stakeholder | Engagement Required |
|-------------|-------------------|
| HKAB (Hong Kong Association of Banks) | Industry working group sponsorship, template standardisation |
| DTC Association | Deposit-taking company participation |
| ASIFMA | Securities industry coordination |
| HKFI (Hong Kong Federation of Insurers) | Insurance industry coordination |
| Professional Insurance Brokers Association | Broker sector coordination |

---

## 12. KEY REFERENCE DOCUMENTS

| Document | Source | Relevance |
|----------|--------|-----------|
| HKMA MRC Scheme Circular (Phase 2) - 23 July 2025 | HKMA BRDR | Regulatory requirements |
| HKAB MRC Implementing Guidelines (Phase 2) | HKAB | Operational procedures, templates |
| MRC FAQs for In-Scope Individuals (24 July 2025) | HKAB | Individual-facing guidance |
| HKMA Consultation Conclusions on MRC Scheme (2021) | ASIFMA archive | Original design rationale |
| HKMA Proposed Term Sheet for MRC Scheme | ASIFMA archive | Original scope definition |
| PDPO (Cap. 486) | PCPD | Privacy framework |
| PCPD Recommended Model Contractual Clauses (2022) | PCPD | Cross-border transfer safeguards |
| GBA Standard Contract for Cross-boundary Flow of Personal Information (2023) | PCPD/Mainland authorities | GBA data transfer framework |
| Banking Ordinance (Cap. 155) | HK legislation | HKMA regulatory authority |
| Securities and Futures Ordinance (Cap. 571) | HK legislation | SFC regulatory authority |
| Insurance Ordinance (Cap. 41) | HK legislation | IA regulatory authority |
| MPFSO (Cap. 485) | HK legislation | MPFA regulatory authority |
| HKMA SPM TM-E-1 (Technology Risk Management) | HKMA | Technology security standards |
| HKMA Open API Framework | HKMA | API standards for banking sector |

---

*Document Version: 1.0*
*Classification: Confidential - Internal Use Only*
