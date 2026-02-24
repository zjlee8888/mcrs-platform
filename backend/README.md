# MRCS Platform Backend

Node.js + Express API for authentication, requests workflow, dashboard, and integrations.

## Run Locally

```bash
npm install
npm run seed
npm start
```

Backend runs at `http://localhost:3001` by default.

## Key Files for Debugging

- `src/server.js` — startup sequence, route mounting, static frontend serving
- `src/migrate.js` — sql.js initialization and schema migration
- `src/seed.js` — demo users/institutions/requests seed data
- `src/middleware/auth.js` — JWT validation and role authorization
- `src/routes/integrations.js` — regulator and corporate integration endpoints

## Common Startup Failures

### 1) Port already in use (`3001`)

```powershell
Get-NetTCPConnection -LocalPort 3001 -State Listen
```

Stop the conflicting process or set a different `PORT` in `.env`.

### 2) Invalid or missing `.env`

Check at least:
- `PORT`
- `JWT_SECRET`
- `DB_PATH`
- `HKMA_API_BASE` (optional; defaults to HKMA public API)

### 3) Database state issues

Re-run seed data:

```bash
npm run seed
```

## Runtime Debugging Checklist

- Validate process starts and prints base URL in console.
- Hit `GET /api/auth/me` with a valid bearer token to verify auth path.
- Check `morgan` logs in terminal to confirm route hits.
- For integration issues, inspect route-level `_dummy`, `_hkma_live`, and `_hkma_cached` flags in responses.
