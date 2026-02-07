import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000') + '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH ENDPOINTS
// ============================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ============================================
// EVENT ENDPOINTS
// ============================================

export const eventAPI = {
  getPublicEvents: () => api.get('/events/public'),
  getMyEvents: () => api.get('/events/my'),
  createEvent: (data) => api.post('/events', data),
  publishEvent: (eventId) => api.put(`/events/${eventId}/publish`),
  unpublishEvent: (eventId) => api.put(`/events/${eventId}/unpublish`),
  updateEvent: (eventId, data) => api.put(`/events/${eventId}`, data),
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),
};

// ============================================
// TICKET TYPE ENDPOINTS
// ============================================

export const ticketTypeAPI = {
  getByEvent: (eventId) => api.get(`/ticket-types/event/${eventId}`),
  create: (eventId, data) => api.post(`/ticket-types/${eventId}`, data),
  update: (ticketTypeId, data) => api.put(`/ticket-types/${ticketTypeId}`, data),
  delete: (ticketTypeId) => api.delete(`/ticket-types/${ticketTypeId}`),
};

// ============================================
// PURCHASE ENDPOINTS (Public - No Auth)
// ============================================

export const purchaseAPI = {
  purchaseTicket: (ticketTypeId, data) =>
    api.post(`/purchase/${ticketTypeId}`, data),
};

// ============================================
// SCAN ENDPOINTS (Organizer Only)
// ============================================

export const scanAPI = {
  scanTicket: (qrToken) => api.post('/scan', { qr_token: qrToken }),
};

// ============================================
// TICKET ENDPOINTS (Organizer Only)
// ============================================

export const ticketAPI = {
  getMyEventsTickets: () => api.get('/tickets/my-events'),
};

// ============================================
// ADMIN ENDPOINTS (Admin Only)
// ============================================

export const adminAPI = {
  // Organizers
  getAllOrganizers: () => api.get('/admin/organizers'),
  toggleOrganizer: (id) => api.put(`/admin/organizers/${id}/toggle`),
  deleteOrganizer: (id) => api.delete(`/admin/organizers/${id}`),

  // Events
  getAllEvents: () => api.get('/admin/events'),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  toggleEventPublish: (id) => api.put(`/admin/events/${id}/toggle-publish`),

  // Stats
  getSalesStats: () => api.get('/admin/stats/sales'),
  getOrganizerStats: (id) => api.get(`/admin/stats/organizers/${id}`),
};

export default api;
