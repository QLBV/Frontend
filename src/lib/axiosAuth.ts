// src/lib/axiosAuth.ts
import axios from "axios";
import api from "./api";

// ===== Access token (memory) =====
let accessToken: string | null = null;

// ===== Refresh token (localStorage) =====
const REFRESH_TOKEN_KEY = 'refreshToken';

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// ===== Request interceptor =====
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ===== Refresh token logic =====
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) =>
    error ? p.reject(error) : p.resolve(token!)
  );
  failedQueue = [];
};

// ===== Response interceptor =====
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post(
          "http://localhost:3000/api/auth/refresh-token",
          { refreshToken }
        );

        if (res.data.success) {
          const newToken = res.data.accessToken;
          setAccessToken(newToken);
          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          throw new Error(res.data.message || "Token refresh failed");
        }
      } catch (err) {
        processQueue(err, null);
        clearAccessToken();
        clearRefreshToken();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
