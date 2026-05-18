import { api } from "./api";

export const authService = {
  register: (payload: Record<string, unknown>) => api.post("/auth/register", payload).then((res) => res.data),
  login: (payload: Record<string, unknown>) => api.post("/auth/login", payload).then((res) => res.data),
  me: () => api.get("/auth/me").then((res) => res.data),
  logout: () => api.post("/auth/logout").then((res) => res.data),
  forgotPassword: (payload: { email: string }) => api.post("/auth/forgot-password", payload).then((res) => res.data),
  resetPassword: (payload: { token: string; password: string }) =>
    api.post("/auth/reset-password", payload).then((res) => res.data)
};
