import axios from 'axios';
import useStore from '../store';

const authAxiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - inject access token
authAxiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken, isAuthenticated } = useStore.getState();

    // For JWT authenticated requests, use Bearer token
    if (isAuthenticated && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      // Fallback to old Token auth for backwards compatibility
      const token = localStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh on 401
authAxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authAxiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setAccessToken, logout } = useStore.getState();

      if (!refreshToken) {
        // No refresh token available, logout
        logout();
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;

        // Update the access token in store
        setAccessToken(access);

        // Update the failed requests with new token
        processQueue(null, access);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return authAxiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        logout();
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default authAxiosInstance;