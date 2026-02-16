import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let token: string | null = null;

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      token = null;
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const setToken = (newToken: string | null) => {
  token = newToken;
};

export const getToken = () => token;

// Auth endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh', {}),
};

// Patients endpoints
export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
};

// Doctors endpoints
export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id: string) => api.get(`/doctors/${id}`),
  getSchedule: (id: string) => api.get(`/doctors/${id}/schedule`),
  create: (data: any) => api.post('/doctors', data),
  updateAvailability: (id: string, data: any) => 
    api.patch(`/doctors/${id}/availability`, data),
};

// Appointments endpoints
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/appointments/${id}/status`, { status }),
  cancel: (id: string) => api.patch(`/appointments/${id}/cancel`, {}),
  getSlots: (doctorId: string, date: string) =>
    api.get(`/appointments/doctor/${doctorId}/slots`, { params: { date } }),
};

// Medical records endpoints
export const medicalRecordAPI = {
  getByPatient: (patientId: string) =>
    api.get(`/medical-records/patient/${patientId}`),
  getById: (id: string) => api.get(`/medical-records/${id}`),
  create: (data: any) => api.post('/medical-records', data),
  update: (id: string, data: any) => api.put(`/medical-records/${id}`, data),
};

// Prescriptions endpoints
export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
  getById: (id: string) => api.get(`/prescriptions/${id}`),
  create: (data: any) => api.post('/prescriptions', data),
};

// Billing endpoints
export const billingAPI = {
  getInvoices: () => api.get('/billing'),
  getInvoice: (id: string) => api.get(`/billing/${id}`),
  createInvoice: (data: any) => api.post('/billing', data),
  processPayment: (invoiceId: string, data: any) =>
    api.post(`/billing/${invoiceId}/payment`, data),
};

// Notifications endpoints
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.patch('/notifications/mark-all/read', {}),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export default api;
