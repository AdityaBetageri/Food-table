import { getCookie } from '../utils/cookies';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Base fetch wrapper with auth token support
 */
async function request(endpoint, options = {}) {
  const token = getCookie('tryscan_token') || localStorage.getItem('tryscan_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

// ==================== Auth API ====================
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  verifyEmail: (token) => request(`/auth/verify-email?token=${token}`),
  updateHotel: (body) => request('/auth/hotel', { method: 'PUT', body: JSON.stringify(body) }),
};

// ==================== Menu API ====================
export const menuAPI = {
  getByHotel: (hotelId) => request(`/menu/${hotelId}`),
  create: (body) => request('/menu', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/menu/${id}`, { method: 'DELETE' }),
  toggle: (id) => request(`/menu/${id}/toggle`, { method: 'PATCH' }),
};

// ==================== Order API ====================
export const orderAPI = {
  create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getAll: (params = '') => request(`/orders${params ? `?${params}` : ''}`),
  getById: (id) => request(`/orders/${id}`),
  getPublic: (id) => request(`/orders/${id}/public`),
  updateStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updatePayment: (id, paymentStatus) =>
    request(`/orders/${id}/payment`, { method: 'PUT', body: JSON.stringify({ paymentStatus }) }),
};

// ==================== Table API ====================
export const tableAPI = {
  getAll: () => request('/tables'),
  create: (body) => request('/tables', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/tables/${id}`, { method: 'DELETE' }),
  getQR: (id) => request(`/tables/${id}/qr`),
};

// ==================== Staff API ====================
export const staffAPI = {
  getAll: () => request('/staff'),
  create: (body) => request('/staff', { method: 'POST', body: JSON.stringify(body) }),
  toggleStatus: (id) => request(`/staff/${id}/toggle`, { method: 'PATCH' }),
  delete: (id) => request(`/staff/${id}`, { method: 'DELETE' }),
};

// ==================== Analytics API ====================
export const analyticsAPI = {
  getSummary: () => request('/analytics/summary'),
  getHeatmap: () => request('/analytics/heatmap'),
};

// ==================== Feedback API ====================
export const feedbackAPI = {
  submit: (body) => request('/feedback', { method: 'POST', body: JSON.stringify(body) }),
};

// ==================== Management API ====================
/**
 * Separate request wrapper for management endpoints
 * Uses mgmt_token instead of tryscan_token
 */
async function mgmtRequest(endpoint, options = {}) {
  const token = localStorage.getItem('mgmt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

export const managementAuthAPI = {
  login: (body) => mgmtRequest('/management/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => mgmtRequest('/management/auth/me'),
  register: (body) => mgmtRequest('/management/auth/register', { method: 'POST', body: JSON.stringify(body) }),
};

export const managementAPI = {
  getData: () => mgmtRequest('/management/data'),
  updateStatus: (id, status) => mgmtRequest(`/management/hotel/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updatePlan: (id, months) => mgmtRequest(`/management/hotel/${id}/plan`, { method: 'PATCH', body: JSON.stringify({ months }) }),
  getAccessRequests: () => mgmtRequest('/management/access-requests'),
  approveRequest: (id) => mgmtRequest(`/management/access-requests/${id}/approve`, { method: 'PATCH' }),
  denyRequest: (id) => mgmtRequest(`/management/access-requests/${id}/deny`, { method: 'PATCH' }),
};

export const api = {
  auth: authAPI,
  menu: menuAPI,
  order: orderAPI,
  table: tableAPI,
  staff: staffAPI,
  analytics: analyticsAPI,
  feedback: feedbackAPI,
  management: managementAPI,
  managementAuth: managementAuthAPI,
};

export default api;