import api from "@/lib/api";
import { setAccessToken, clearAccessToken, getRefreshToken, setRefreshToken, clearRefreshToken } from "@/lib/axiosAuth";
import type { User } from "./types";

export const loginApi = async (
  email: string,
  password: string
): Promise<User> => {
  const res = await api.post("/api/auth/login", { email, password });

  if (res.data.success) {
    setAccessToken(res.data.tokens.accessToken);
    setRefreshToken(res.data.tokens.refreshToken);
    return res.data.user;
  } else {
    throw new Error(res.data.message || "Login failed");
  }
};

export const registerApi = async (
  email: string,
  password: string,
  fullName: string
): Promise<User> => {
  const res = await api.post("/api/auth/register", { 
    email, 
    password, 
    fullName 
  });

  if (res.data.success) {
    return res.data.user;
  } else {
    throw new Error(res.data.message || "Registration failed");
  }
};

export const refreshApi = async (): Promise<User> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const res = await api.post("/api/auth/refresh-token", { refreshToken });
  
  if (res.data.success) {
    setAccessToken(res.data.accessToken);
    
    // Since refresh endpoint doesn't return user info, we need to get it from token or make another call
    // For now, let's decode the JWT to get user info (this is not secure but works for demo)
    try {
      const payload = JSON.parse(atob(res.data.accessToken.split('.')[1]));
      return {
        id: payload.id,
        email: payload.email || '',
        fullName: payload.fullName || '',
        role: payload.role || '',
        roleId: payload.roleId || 3 // Default to Patient if not found
      };
    } catch {
      throw new Error("Invalid token format");
    }
  } else {
    throw new Error(res.data.message || "Token refresh failed");
  }
};

export const logoutApi = async () => {
  clearAccessToken();
  clearRefreshToken();
};
