import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? `http://${window.location.hostname}:5000/api`
    : "http://localhost:5000/api");

export const api = axios.create({
  baseURL,
  withCredentials: true
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message ||
      "Request failed"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await api.post("/auth/refresh");
        useAuthStore.getState().setSession(response.data.user, response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
