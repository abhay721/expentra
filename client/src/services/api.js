import axios from 'axios';

// Ensure API_URL is a clean string and handle potential array-like behavior from environment variables
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = (Array.isArray(rawApiUrl) ? rawApiUrl[0] : rawApiUrl).toString().trim().replace(/,$/, '');

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor for API calls
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

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Auto logout if 401 response returned from api
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
