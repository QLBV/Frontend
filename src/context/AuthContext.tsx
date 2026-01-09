import React, { createContext, useContext, useEffect, useState } from "react";
import { setAccessToken as setAxiosAccessToken, setRefreshToken as setAxiosRefreshToken, clearAccessToken as clearAxiosAccessToken, clearRefreshToken as clearAxiosRefreshToken } from "@/lib/axiosAuth";

// 1. Định nghĩa kiểu dữ liệu User (tùy chỉnh theo API trả về)
export interface User {
  id?: string | number;
  email: string;
  role: string;      // Quan trọng để phân quyền
  displayName?: string;
  [key: string]: any; // Cho phép các trường khác
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  // Hàm login để cập nhật state ngay lập tức sau khi gọi API thành công
  login: (userData: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Khi Load trang (F5): Kiểm tra LocalStorage để khôi phục phiên đăng nhập
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("userData");

        if (storedToken && storedUser) {
          // Nếu có token và data user, set lại vào State
          setUser(JSON.parse(storedUser));
          // Restore axios in-memory token so subsequent requests include Authorization header
          setAxiosAccessToken(storedToken);
          const storedRefresh = localStorage.getItem("refreshToken");
          if (storedRefresh) setAxiosRefreshToken(storedRefresh);
        }
      } catch (error) {
        console.error("Lỗi khôi phục thông tin đăng nhập:", error);
        // Nếu dữ liệu lỗi, xóa sạch để tránh lỗi lặp lại
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 3. Hàm Login: Gọi từ Login.tsx sau khi API trả về success
  const login = (user: User, accessToken: string, refreshToken?: string) => {
    // Lưu token vào localStorage + cập nhật axios in-memory token
    localStorage.setItem("accessToken", accessToken);
    setAxiosAccessToken(accessToken);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      setAxiosRefreshToken(refreshToken);
    }

    // Lưu user data để khôi phục khi reload
    try {
      localStorage.setItem("userData", JSON.stringify(user));
    } catch (e) {
      console.warn("Could not persist userData", e);
    }

    // Cập nhật State để App biết đã đăng nhập
    setUser(user);
  };

  // 4. Hàm Logout: Xóa Storage và State
  const logout = () => {
    // Clear storage and axios in-memory tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    clearAxiosAccessToken();
    clearAxiosRefreshToken();
    setUser(null);
    
    // Tùy chọn: Reload trang hoặc chuyển hướng về login
    // window.location.href = "/login"; 
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};