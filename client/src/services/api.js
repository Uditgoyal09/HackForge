import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hackforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let browser set the correct Content-Type (with boundary) for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (401, 403, 500)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'An unexpected error occurred.';

    if (status === 401) {
      // Clear invalid session
      localStorage.removeItem('hackforge_token');
      localStorage.removeItem('hackforge_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    } else if (status === 403 && message.toLowerCase().includes('blocked')) {
      localStorage.removeItem('hackforge_token');
      localStorage.removeItem('hackforge_user');
      window.location.href = '/login?blocked=true';
    }

    return Promise.reject(error);
  }
);

export default api;
