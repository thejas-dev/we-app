import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { host, refreshTokenRoute } from './ApiRoutes';
import StorageConstants from './storageConstants';
import { getAuthTokens, setAuthTokens } from './helpers/authHelpers';

const API_BASE_URL = host; // Replace with your backend URL

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const {accessToken} = await getAuthTokens();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    console.log("error" + error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response, // If response is successful, return it
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loops

      try {
        const {refreshToken} = await getAuthTokens();
        if (!refreshToken) {
          console.error('No refresh token available');
          return Promise.reject(error);
        }

        const { data } = await axiosInstance.post(refreshTokenRoute, { refreshToken });

        await setAuthTokens(data.accessToken,data.refreshToken);

        axiosInstance.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
