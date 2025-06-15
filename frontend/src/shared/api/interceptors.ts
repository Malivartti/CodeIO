import { createAuthHeader, tokenStorage } from '@shared/lib/auth';
import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

export const setupInterceptors = (apiInstance: AxiosInstance, authApiInstance: AxiosInstance) => {
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken();

      if (token) {
        config.headers.Authorization = createAuthHeader(token);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const original = error.config;

      if (error.response?.status === 401 && original && !original._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            const token = tokenStorage.getAccessToken();
            if (token && original.headers) {
              original.headers.Authorization = createAuthHeader(token);
            }
            return apiInstance(original);
          }).catch(err => Promise.reject(err));
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = tokenStorage.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await authApiInstance.post('/login/refresh-token', { token: refreshToken });
          const tokens = response.data;

          tokenStorage.setTokens(tokens);
          processQueue(null, tokens.access_token);

          if (original.headers) {
            original.headers.Authorization = createAuthHeader(tokens.access_token);
          }
          return apiInstance(original);
        } catch (refreshError) {
          processQueue(refreshError, null);
          tokenStorage.clearTokens();

          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
