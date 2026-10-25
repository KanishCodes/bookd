import axios from 'axios';

// Base API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bookd_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('bookd_token');
      localStorage.removeItem('bookd_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Returns true if mock mode is enabled.
 * Default is true unless explicitly set to 'false'.
 */
export const isMockMode = () => {
  return import.meta.env.VITE_USE_MOCK !== 'false';
};

/**
 * Helper to simulate realistic network latency in mock mode
 */
export const mockDelay = (data, ms = 250) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, ms);
  });
};
