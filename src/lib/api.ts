import axios from 'axios';

console.log("🚨 FILE AXIOS ĐANG CHẠY! URL LÀ: http://127.0.0.1:3000");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // Nếu bạn lưu token trong localStorage thay vì Cookie
    const token = localStorage.getItem('accessToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
