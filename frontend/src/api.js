const API_BASE = '/api';

let token = localStorage.getItem('mrcs_token');

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem('mrcs_token', t);
  else localStorage.removeItem('mrcs_token');
}

export function getToken() {
  return token || localStorage.getItem('mrcs_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const t = getToken();
  // Every request uses the latest token snapshot; this avoids stale closure issues
  // after login/logout across tabs.
  if (t) headers['Authorization'] = `Bearer ${t}`;

  const method = (options.method || 'GET').toUpperCase();
  const requestOptions = {
    ...options,
    headers: { ...headers, ...options.headers },
  };
  if (method === 'GET') {
    // Disable browser caching for GETs so users see current workflow/status data.
    requestOptions.cache = 'no-store';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...requestOptions,
  });

  if (res.status === 401) {
    // Centralized 401 handling keeps auth-expiry behavior consistent across pages.
    setToken(null);
    localStorage.removeItem('mrcs_user');
    localStorage.removeItem('mrcs_institution');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json();
  // Backend returns `{ error: string }` on failures; preserve that for UI messages.
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),

  // Dashboard
  dashboard: () => request('/dashboard'),
  compliance: () => request('/dashboard/compliance'),
  auditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/dashboard/audit?${qs}`);
  },

  // Institutions
  getInstitutions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/institutions?${qs}`);
  },
  getInstitution: (id) => request(`/institutions/${id}`),
  createInstitution: (data) => request('/institutions', { method: 'POST', body: JSON.stringify(data) }),
  updateInstitution: (id, data) => request(`/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Individuals
  getIndividuals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/individuals?${qs}`);
  },
  getIndividual: (id) => request(`/individuals/${id}`),
  createIndividual: (data) => request('/individuals', { method: 'POST', body: JSON.stringify(data) }),

  // Reference Requests
  getRequests: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/requests?${qs}`);
  },
  getRequest: (id) => request(`/requests/${id}`),
  createRequest: (data) => request('/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateRequestStatus: (id, status) => request(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  addConduct: (requestId, data) => request(`/requests/${requestId}/conduct`, { method: 'POST', body: JSON.stringify(data) }),
  uploadSignedConsent: (requestId, data) => request(`/requests/${requestId}/consent/upload`, { method: 'POST', body: JSON.stringify(data) }),
  sendConsentSigningEmail: (requestId, data) => request(`/requests/${requestId}/consent/send-email`, { method: 'POST', body: JSON.stringify(data) }),
  uploadReferenceResults: (requestId, data) => request(`/requests/${requestId}/reference-results/upload`, { method: 'POST', body: JSON.stringify(data) }),
  getMonitoringSchedules: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/requests/monitoring?${qs}`);
  },
  configureMonitoring: (data) => request('/requests/monitoring/configure', { method: 'POST', body: JSON.stringify(data) }),
  reviewMonitoringSchedule: (id) => request(`/requests/monitoring/${id}/review`, { method: 'PATCH' }),

  // Consents
  getConsents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/consents?${qs}`);
  },
  createConsent: (data) => request('/consents', { method: 'POST', body: JSON.stringify(data) }),
  grantConsent: (id) => request(`/consents/${id}/grant`, { method: 'PATCH' }),
  withdrawConsent: (id) => request(`/consents/${id}/withdraw`, { method: 'PATCH' }),

  // HKMA
  hkmaAIs: () => request('/hkma/ais'),
  hkmaSecStaff: (surname) => request(`/hkma/securities-staff?surname=${encodeURIComponent(surname)}`),

  // Integrations - Corporate Registry
  corporateSearchHK: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/integrations/corporate/hk/company-search?${qs}`);
  },
  corporateSearchSG: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/integrations/corporate/sg/company-search?${qs}`);
  },
  corporateSearchUK: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/integrations/corporate/uk/company-search?${qs}`);
  },
  corporateDirectorShareholderSearch: (country, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/integrations/corporate/${country.toLowerCase()}/director-shareholder-search?${qs}`);
  },

  // Integrations - Regulator Register
  licenseSearch: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/integrations/regulator/license-search?${qs}`);
  },
  licenseIssues: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/integrations/regulator/license-issues?${qs}`);
  },
  civilLitigation: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/integrations/regulator/civil-litigation?${qs}`);
  },
  securitiesStaffSearch: (params = {}) => {
    const query = new URLSearchParams();
    if (params.surname) query.set('surname', params.surname);
    if (params.given_name) query.set('given_name', params.given_name);
    if (params.first_name) query.set('first_name', params.first_name);
    if (params.regulators && Array.isArray(params.regulators)) {
      params.regulators.forEach((reg) => query.append('regulators', reg));
    }
    if (params.country) query.set('country', params.country);
    return request(`/integrations/regulator/securities-staff-search?${query.toString()}`);
  },
  financialWatchlistSearch: (params = {}) => {
    const query = new URLSearchParams();
    if (params.surname) query.set('surname', params.surname);
    if (params.given_name) query.set('given_name', params.given_name);
    if (params.first_name) query.set('first_name', params.first_name);
    if (params.regulators && Array.isArray(params.regulators)) {
      params.regulators.forEach((reg) => query.append('regulators', reg));
    }
    if (params.country) query.set('country', params.country);
    return request(`/integrations/regulator/securities-staff-search?${query.toString()}`);
  },
  financialMisconductSearch: (params = {}) => {
    const query = new URLSearchParams();
    if (params.surname) query.set('surname', params.surname);
    if (params.given_name) query.set('given_name', params.given_name);
    if (params.first_name) query.set('first_name', params.first_name);
    if (params.regulators && Array.isArray(params.regulators)) {
      params.regulators.forEach((reg) => query.append('regulators', reg));
    }
    if (params.country) query.set('country', params.country);
    return request(`/integrations/regulator/financial-misconduct-search?${query.toString()}`);
  },
  legalSearch: (params = {}) => {
    const query = new URLSearchParams();
    if (params.query) query.set('query', params.query);
    if (params.regulators && Array.isArray(params.regulators)) {
      params.regulators.forEach((reg) => query.append('regulators', reg));
    }
    if (params.country) query.set('country', params.country);
    return request(`/integrations/regulator/legal-search?${query.toString()}`);
  },
  licenseeAssociationSearch: (params = {}) => {
    const query = new URLSearchParams();
    if (params.surname) query.set('surname', params.surname);
    if (params.first_name) query.set('first_name', params.first_name);
    if (params.given_name) query.set('given_name', params.given_name);
    if (params.license_number) query.set('license_number', params.license_number);
    if (params.country) query.set('country', params.country);
    if (params.regulator) query.set('regulator', params.regulator);
    return request(`/integrations/regulator/licensee-association-search?${query.toString()}`);
  },
};
