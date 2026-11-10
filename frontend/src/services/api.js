import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stayease_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        localStorage.removeItem('stayease_token');
        localStorage.removeItem('stayease_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const uploadApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const propertyApi = {
  getPublic: (params) => api.get('/properties/public', { params }),
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  getManagers: (id) => api.get(`/properties/${id}/managers`),
  assignManager: (id, managerId) => api.post(`/properties/${id}/assign-manager`, { propertyId: id, managerId }),
  removeManager: (id, managerId) => api.delete(`/properties/${id}/managers/${managerId}`),
};

export const publicStatsApi = {
  get: () => api.get('/public/stats'),
};

export const roomApi = {
  getPublic: (params) => api.get('/rooms/public', { params }),
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

export const bookingApi = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
};

export const tenantApi = {
  getAll: (params) => api.get('/tenants', { params }),
  getById: (id) => api.get(`/tenants/${id}`),
  getMyProfile: () => api.get('/tenants/me'),
  update: (id, data) => api.put(`/tenants/${id}`, data),
};

export const rentApi = {
  getAll: (params) => api.get('/rent', { params }),
  create: (data) => api.post('/rent', data),
};

export const paymentApi = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  getReceipt: (receiptNumber) => api.get(`/payments/receipt/${receiptNumber}`),
};

export const utilityApi = {
  getAll: (params) => api.get('/utility-bills', { params }),
  create: (data) => api.post('/utility-bills', data),
};

export const maintenanceApi = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  updateStatus: (id, data) => api.patch(`/maintenance/${id}/status`, data),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const announcementApi = {
  getPublic: (params) => api.get('/announcements/public', { params }),
  getAll: (params) => api.get('/announcements', { params }),
  create: (data) => api.post('/announcements', data),
};

export const dashboardApi = {
  getSuperAdmin: () => api.get('/dashboard/superadmin'),
  getOwner: () => api.get('/dashboard/owner'),
  getManager: () => api.get('/dashboard/manager'),
  getTenant: () => api.get('/dashboard/tenant'),
};

export const reportApi = {
  getIncome: (params) => api.get('/reports/income', { params }),
  getOccupancy: (params) => api.get('/reports/occupancy', { params }),
  getMaintenance: (params) => api.get('/reports/maintenance', { params }),
  exportPaymentsCsv: (params) => api.get('/reports/export/payments-csv', { params, responseType: 'blob' }),
};

export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

export default api;
