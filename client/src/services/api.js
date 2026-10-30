import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Automatically attach the login token to API requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('svms_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login')
    ) {
      window.dispatchEvent(new CustomEvent('svms:unauthorized'));
    }

    return Promise.reject({ ...error, message });
  }
);

export default api;