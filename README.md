# MRCS Platform - Cross-Industry Mandatory Reference Checking System

A centralised digital platform that automates the end-to-end MRC process across Hong Kong's banking, securities, insurance, and MPF sectors.

## Quick Start

### Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- npm 9+

### 1. Install & Seed Backend
```bash
cd backend
npm install
npm run seed      # Creates database with demo data
npm start         # Starts API on http://localhost:3001
```

### 2. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev       # Starts dev server on http://localhost:5173
```

### 3. Open in Browser
Navigate to **http://localhost:5173**

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Platform Admin | admin@mrcs-platform.hk | Admin123! |
| HKMA Regulator | regulator@hkma.gov.hk | Hkma123! |
| SFC Regulator | regulator@sfc.hk | Sfc123! |
| HSBC HR | hr@hsbc.com.hk | Hsbc123! |
| HSBC Compliance | compliance@hsbc.com.hk | Hsbc123! |
| BOCHK HR | hr@bochk.com | Bochk123! |
| AIA HR | hr@aia.com.hk | Aia123! |
| Goldman Compliance | compliance@gs.com.hk | Gs123! |

## Architecture

```
mrcs-platform/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── server.js         # Express server entry
│   │   ├── migrate.js        # SQLite schema & migrations
│   │   ├── seed.js           # Demo data seeder
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT auth, RBAC, audit middleware
│   │   └── routes/
│   │       ├── auth.js       # Login, session
│   │       ├── institutions.js
│   │       ├── individuals.js
│   │       ├── requests.js   # Reference request CRUD + status workflow
│   │       ├── consents.js   # Consent management
│   │       ├── dashboard.js  # Analytics & compliance stats
│   │       └── hkma.js       # Live HKMA Open API integration
│   └── data/                 # SQLite database (auto-created)
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx           # Layout, routing, auth state
│   │   ├── api.js            # API client
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── RequestsPage.jsx
│   │       ├── RequestDetailPage.jsx
│   │       ├── NewRequestPage.jsx
│   │       ├── InstitutionsPage.jsx
│   │       ├── IndividualsPage.jsx
│   │       ├── CompliancePage.jsx
│   │       ├── AuditPage.jsx
│   │       └── HKMAPage.jsx
│   └── dist/                 # Production build (auto-generated)
└── README.md
```

## Key Features (MVP)

### Institution Portal
- **Reference Request Management** — Create, track, and respond to MRC reference requests
- **Status Workflow** — Draft → Consent → Sent → Acknowledged → In Progress → Response → Review → Closed
- **30-Day SLA Tracking** — Automatic deadline calculation, breach flagging
- **Conduct Information** — Structured capture across all 6 MRC conduct categories
- **Cross-Sector Support** — Banking, Securities, Insurance, MPF, Cross-Sector requests

### Compliance & Audit
- **Compliance Dashboard** — SLA rates, average response times, per-institution metrics
- **Immutable Audit Log** — Every action logged (who, what, when)
- **Role-Based Access** — HR Initiator, Compliance Reviewer, Senior Approver, Auditor

### Regulator Portal
- **Sector-Filtered Views** — Each regulator sees relevant requests
- **Compliance Monitoring** — SLA breach alerts, institutional compliance rates
- **Audit Trail Access** — Full request lifecycle audit

### HKMA Integration
- **Live Register of AIs** — Fetches from HKMA Open API with 24h caching
- **Securities Staff Search** — Real-time lookup by surname
- **Integration Status Dashboard** — Shows status of all regulatory data sources

### Identity & Data Model
- **Cross-Sector Identity** — Links individuals across HKMA, SFC, IA, MPFA registrations
- **Employment History** — 7-year lookback with institutional provenance
- **Regulatory Registration Tracking** — All licence types and statuses

## Hosting / Deployment

### NPM Production Build (No Docker)
```bash
cd frontend && npm run build   # Builds to frontend/dist/
cd ../backend && npm start     # Serves API + frontend static files
```

### Railway (Recommended)

This repository is configured for Railway npm deployment via `railway.toml`.

1. Push this repository to GitHub
2. Create a new Railway project from the repo
3. Set environment variables in Railway:
	- `JWT_SECRET` (required, strong secret)
	- `NODE_ENV=production`
	- `PORT` (optional, Railway also injects this)
	- `DB_PATH=./data/mrcs.db`
4. (Recommended) Attach a persistent volume and mount it to `/app/backend/data`
5. Deploy

Railway will run:
- Build: `npm run build`
- Start: `npm start`

The backend serves the compiled frontend from `frontend/dist`.

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | API server port |
| JWT_SECRET | (dev key) | JWT signing secret — CHANGE IN PRODUCTION |
| DB_PATH | ./data/mrcs.db | SQLite database file path |
| NODE_ENV | development | Environment mode |
| HKMA_API_BASE | https://api.hkma.gov.hk/public | HKMA API base URL |

## Debugging & Troubleshooting

### Quick Health Check

Run these from separate terminals:

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

Expected:
- Backend log shows `MRCS Platform API running on http://localhost:3001`
- Frontend is available at `http://localhost:5173`

### If Backend Fails to Start

1. **Check Node version**
	```bash
	node -v
	```
	Use Node 18+ (Node 20 LTS recommended).

2. **Check `backend/.env` values**
	- `JWT_SECRET` must be set
	- `PORT` should normally be `3001`
	- `DB_PATH` should point to a writable path (default `./data/mrcs.db`)

3. **Verify port conflicts**
	```powershell
	Get-NetTCPConnection -LocalPort 3001 -State Listen
	```

4. **Recreate seeded data if needed**
	```bash
	cd backend
	npm run seed
	```

### If Frontend Loads But API Calls Fail

- Open browser devtools and inspect failing `/api/*` request status.
- `401` means token/session is invalid; log in again.
- Ensure backend is running on the same host and port expected by the frontend (`/api` proxy during dev).

### Useful Debug Files

- `backend/src/server.js` — startup flow, route mounting, and global error handler
- `backend/src/middleware/auth.js` — JWT auth and RBAC checks
- `frontend/src/api.js` — token injection, request defaults, and response error handling

## Regulatory Framework

This platform implements the HKMA Mandatory Reference Checking (MRC) Scheme Phase 2 requirements, with cross-sector extension to SFC, IA, and MPFA regulated entities:

- **HKMA** — Banking Ordinance (Cap. 155), ~190 Authorised Institutions
- **SFC** — Securities and Futures Ordinance (Cap. 571), ~3,000 Licensed Corporations
- **IA** — Insurance Ordinance (Cap. 41), ~1,500 Licensed Agencies & Brokers
- **MPFA** — MPFSO (Cap. 485), ~430 Principal Intermediaries

## License

Internal use only. Confidential.
