export type User = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  roleId: number;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  register: (email: string, password: string, fullName: string) => Promise<User>;
  logout: () => Promise<void>;
};
