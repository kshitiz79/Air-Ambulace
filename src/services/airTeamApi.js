import axios from 'axios';

// Base URL for API calls
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Flight Assignments API
export const flightAssignmentApi = {
  // Get all assignments
  getAll: () => api.get('/flight-assignments'),

  // Get assignment by ID
  getById: (id) => api.get(`/flight-assignments/${id}`),

  // Create new assignment
  create: (data) => api.post('/flight-assignments', data),

  // Update assignment
  update: (id, data) => api.put(`/flight-assignments/${id}`, data),

  // Update assignment status
  updateStatus: (id, status) => api.patch(`/flight-assignments/${id}/status`, { status }),

  // Delete assignment
  delete: (id) => api.delete(`/flight-assignments/${id}`),

  // Get assignments by status
  getByStatus: (status) => api.get(`/flight-assignments/status/${status}`),

  // Get assignment statistics
  getStats: () => api.get('/flight-assignments/stats'),
};

// Post Operation Reports API
export const postOperationApi = {
  // Get all reports
  getAll: () => api.get('/post-operation-reports'),

  // Get report by ID
  getById: (id) => api.get(`/post-operation-reports/${id}`),

  // Create new report
  create: (data) => api.post('/post-operation-reports', data),

  // Update report
  update: (id, data) => api.put(`/post-operation-reports/${id}`, data),

  // Delete report
  delete: (id) => api.delete(`/post-operation-reports/${id}`),

  // Get reports by enquiry ID
  getByEnquiry: (enquiryId) => api.get(`/post-operation-reports/enquiry/${enquiryId}`),

  // Get reports by status
  getByStatus: (status) => api.get(`/post-operation-reports/status/${status}`),

  // Get report statistics
  getStats: () => api.get('/post-operation-reports/stats'),
};

// Invoices API
export const invoiceApi = {
  // Get all invoices
  getAll: () => api.get('/invoices'),

  // Get invoice by ID
  getById: (id) => api.get(`/invoices/${id}`),

  // Create new invoice
  create: (data) => api.post('/invoices', data),

  // Update invoice
  update: (id, data) => api.put(`/invoices/${id}`, data),

  // Update invoice status
  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),

  // Get invoices by status
  getByStatus: (status) => api.get(`/invoices/status/${status}`),

  // Get invoice statistics
  getStats: () => api.get('/invoices/stats'),
};

// Enquiries API
export const enquiryApi = {
  // Get all enquiries
  getAll: () => api.get('/enquiries'),

  // Get enquiry by ID
  getById: (id) => api.get(`/enquiries/${id}`),

  // Update enquiry
  update: (id, data) => api.put(`/enquiries/${id}`, data),

  // Get enquiries by status
  getByStatus: (status) => api.get(`/enquiries/status/${status}`),

  // Get enquiry statistics
  getStats: () => api.get('/enquiries/stats'),
};

// Dashboard API
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const [assignments, reports, invoices, enquiries] = await Promise.all([
        flightAssignmentApi.getStats(),
        postOperationApi.getStats(),
        invoiceApi.getStats(),
        enquiryApi.getStats(),
      ]);

      return {
        assignments: assignments.data,
        reports: reports.data,
        invoices: invoices.data,
        cases: enquiries.data,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: () => api.get('/dashboard/activities'),

  // Get active flights
  getActiveFlights: () => flightAssignmentApi.getByStatus('IN_PROGRESS'),
};

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;