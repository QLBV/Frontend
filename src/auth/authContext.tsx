"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {type AuthContextType, type User } from "./types";
import { loginApi, logoutApi, refreshApi } from "./auth.service";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== restore login khi F5 =====
  useEffect(() => {
    const restore = async () => {
      try {
        // Check if we have refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const user = await refreshApi();
          setUser(user);
        }
      } catch {
        setUser(null);
        // Clear invalid tokens
        localStorage.removeItem('refreshToken');
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
