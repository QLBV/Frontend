"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {type AuthContextType, type User } from "./types";
import { loginApi, logoutApi, refreshApi, registerApi } from "./auth.service";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== restore login khi F5 =====
  useEffect(() => {
    const restore = async () => {
      try {
        // Check if we have access token first
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          // Try to validate current access token by making a test API call
          try {
            // You can replace this with a simple user info endpoint
            const user = await refreshApi();
            setUser(user);
            return;
          } catch (error) {
            // Access token might be expired, try refresh
            console.log('Access token expired, trying refresh...');
          }
        }
        
        if (refreshToken) {
          const user = await refreshApi();
          setUser(user);
        }
      } catch (error) {
        console.log('Token restore failed:', error);
        setUser(null);
        // Clear invalid tokens
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const user = await loginApi(email, password);
    setUser(user);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const user = await registerApi(email, password, fullName);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===== custom hook =====
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
