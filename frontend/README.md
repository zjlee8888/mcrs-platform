# MRCS Platform Frontend

React + Vite single-page app for the MRCS platform UI.

## Run Locally

```bash
npm install
npm run dev
```

Frontend dev server runs at `http://localhost:5173`.

## Build

```bash
npm run build
```

Build output is generated in `dist/`.

## Debugging Notes

### API Connectivity

The frontend calls the backend through relative `/api` paths (see `src/api.js`).

If pages load but data does not:
- Confirm backend is running on `http://localhost:3001`
- Check browser network tab for failing `/api/*` requests
- Inspect response code and error payload (`{ error: ... }`)

### Authentication Issues

`src/api.js` clears local auth state and redirects to `/login` on `401`.

If users are repeatedly redirected:
- Log in again to refresh token
- Confirm `JWT_SECRET` in backend `.env` is stable (changing it invalidates all issued tokens)
- Check backend auth middleware behavior in `backend/src/middleware/auth.js`

### IAM Page

`src/pages/IAMManagementPage.jsx` currently computes permission flags from role values in-memory.

If displayed permissions look wrong:
- Verify `user.role` from login response
- Confirm role names match backend role strings exactly
- Check per-flag role arrays in the IAM page
