import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Essential for cookie-based auth
});

// Request interceptor for CSRF protection
api.interceptors.request.use(
  async config => {
    // For CSRF protection on mutation requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      try {
        // Get CSRF token for protected routes
        const { data } = await axios.get(`${API_BASE_URL}/csrf-token`, { withCredentials: true });
        if (data.csrfToken) {
          config.headers['X-CSRF-Token'] = data.csrfToken;
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
        // Don't fail the request if CSRF token fetch fails
      }
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Handle token expiration specifically
    if (error.response?.status === 401 && 
        (error.response?.data?.code === 'TOKEN_EXPIRED' || 
         error.response?.data?.message === 'Token expired') && 
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token using cookies
        await axios.post(
          `${API_BASE_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.log("Token refresh failed, user needs to login again");
        // Redirect to login or trigger logout in your app
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;