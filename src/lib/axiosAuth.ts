// src/lib/axiosAuth.ts
import api from "./api";
import { retryWithBackoff } from "@/utils/retry";
import { deduplicateRequest, generateRequestKey } from "@/utils/requestDeduplication";

// ===== Access token (localStorage + memory) =====
let accessToken: string | null = null;
const ACCESS_TOKEN_KEY = 'accessToken';

// ===== Refresh token (localStorage) =====
const REFRESH_TOKEN_KEY = 'refreshToken';

export const setAccessToken = (token: string) => {
  accessToken = token;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  
  // Try to get from localStorage if not in memory
  const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (storedToken) {
    accessToken = storedToken;
    return storedToken;
  }
  
  return null;
};

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
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
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Refresh token logic =====
let isRefreshing = false;
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 5000; // 5 seconds minimum between refresh attempts (increased from 2s)
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

    // Skip token refresh for authentication endpoints
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout'];
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:79',message:'401_DETECTED',data:{url:originalRequest.url,method:originalRequest.method,isRefreshing,hasRefreshToken:!!getRefreshToken(),isAuthEndpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (isRefreshing) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:82',message:'ALREADY_REFRESHING',data:{url:originalRequest.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      // Rate limit refresh attempts
      const now = Date.now();
      if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:94',message:'REFRESH_TOO_SOON',data:{waitTime:MIN_REFRESH_INTERVAL-(now-lastRefreshTime)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Too soon, reject the request
        return Promise.reject(new Error("Vui lòng đợi một chút trước khi thử lại."));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      lastRefreshTime = now;

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:100',message:'STARTING_REFRESH',data:{url:originalRequest.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:105',message:'NO_REFRESH_TOKEN',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
          throw new Error("No refresh token available");
        }

        // Use retry with backoff and deduplication for token refresh
        const requestKey = generateRequestKey("POST", "/auth/refresh-token", { refreshToken });
        
        const res = await deduplicateRequest(requestKey, () =>
          retryWithBackoff(
            async () => {
              // Use api instance (already has baseURL configured) instead of axios directly
              const response = await api.post("/auth/refresh-token", { refreshToken });

              if (response.data.success) {
                return response.data;
              } else {
                throw new Error(response.data.message || "Token refresh failed");
              }
            },
            {
              maxRetries: 3,
              initialDelay: 2000, // 2 seconds
              retryableStatuses: [429, 500, 502, 503, 504],
            }
          )
        );

        const newToken = res.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:134',message:'REFRESH_SUCCESS',data:{url:originalRequest.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:140',message:'REFRESH_ERROR',data:{error:err.message,status:err.response?.status,url:originalRequest.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Handle 429 rate limit error
        if (err.response?.status === 429) {
          const retryAfter = err.response?.headers?.['retry-after'] || 
                            err.response?.headers?.['Retry-After'] ||
                            err.response?.data?.retryAfter ||
                            30;
          // Block refresh for retryAfter seconds on rate limit
          lastRefreshTime = Date.now() + (retryAfter * 1000);
          // Reject with 429 error so caller can handle it
          processQueue(err, null);
          return Promise.reject({
            ...err,
            message: `Too many token refresh attempts. Please wait ${retryAfter} seconds.`,
            retryAfter,
          });
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:157',message:'CLEARING_TOKENS_AND_LOGOUT',data:{error:err.message,status:err.response?.status,url:originalRequest.url,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Only redirect to login if not already on login page and not on auth endpoints
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || 
                           currentPath === '/register' || 
                           currentPath === '/forgot-password' || 
                           currentPath === '/reset-password';
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:192',message:'BEFORE_LOGOUT_REDIRECT',data:{currentPath,isAuthPage,willRedirect:!isAuthPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        processQueue(err, null);
        clearAccessToken();
        clearRefreshToken();
        
        // Only redirect if not already on auth page
        if (!isAuthPage) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'axiosAuth.ts:200',message:'REDIRECTING_TO_LOGIN',data:{from:currentPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
