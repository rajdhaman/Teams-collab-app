import api from "./api";

export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  teamId: string | { _id: string; name: string; [key: string]: any };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    idToken: string;
  };
}

export interface RegisterRequest {
  email: string;
  idToken: string;
  name: string;
  teamName?: string;
}

export interface LoginRequest {
  idToken: string;
}

export const authService = {
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/register", data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    const response = await api.get("/auth/me");
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem("idToken");
    localStorage.removeItem("user");
  },

  getStoredToken(): string | null {
    return localStorage.getItem("idToken");
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  setStoredToken(token: string): void {
    localStorage.setItem("idToken", token);
  },

  setStoredUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  },
};
