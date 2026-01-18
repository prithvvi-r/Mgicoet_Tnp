import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';

        // Check for 401 (Unauthorized) - logout optionally
        if (error.response?.status === 401) {
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    getCurrentUser: () => api.get('/auth/me'),
};

export const companyAPI = {
    getAll: (params) => api.get('/companies', { params }),
    getById: (id) => api.get(`/companies/${id}`),
    create: (data) => api.post('/companies', data),
    update: (id, data) => api.put(`/companies/${id}`, data),
    updateStatus: (id, data) => api.patch(`/companies/${id}/status`, data),
    addRemark: (id, data) => api.post(`/companies/${id}/remarks`, data),
    delete: (id) => api.delete(`/companies/${id}`),
};

export const studentAPI = {
    getAll: (params) => api.get('/students', { params }),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    checkEligibility: (data) => api.post('/students/check-eligibility', data),
    delete: (id) => api.delete(`/students/${id}`),
};

export const applicationAPI = {
    getAll: (params) => api.get('/applications', { params }),
    create: (data) => api.post('/applications', data),
    updateStatus: (id, data) => api.put(`/applications/${id}`, data),
    delete: (id) => api.delete(`/applications/${id}`),
};

export default api;
