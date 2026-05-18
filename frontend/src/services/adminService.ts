import { api } from "./api";

export const adminService = {
  dashboard: () => api.get("/admin/dashboard").then((res) => res.data),
  users: () => api.get("/admin/users").then((res) => res.data),
  exams: () => api.get("/admin/exams").then((res) => res.data),
  suspendUser: (userId: string, isSuspended: boolean) =>
    api.patch(`/admin/users/${userId}/suspend`, { isSuspended }).then((res) => res.data),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`).then((res) => res.data),
  deleteExam: (examId: string) => api.delete(`/admin/exams/${examId}`).then((res) => res.data)
};
