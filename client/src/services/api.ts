import axios, { AxiosInstance, AxiosError } from "axios";
import { auth } from "./firebase";

const API_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3001/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("idToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    // If token expired and we haven't already retried, get a fresh token and retry
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;

      try {
        // Get fresh token from Firebase
        const currentUser = auth.currentUser;
        if (currentUser) {
          const freshToken = await currentUser.getIdToken(true); // force refresh
          localStorage.setItem("idToken", freshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("idToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // For other 401 errors or if retry failed, clear auth and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem("idToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
