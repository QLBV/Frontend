import React, { createContext, useContext, useEffect, useState } from "react";

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
  login: (userData: User, token: string) => void;
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
  const login = (userData: User, token: string) => {
    // Lưu vào Storage (để F5 không mất)
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    
    // Cập nhật State (để giao diện đổi ngay lập tức)
    setUser(userData);
  };

  // 4. Hàm Logout: Xóa Storage và State
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
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