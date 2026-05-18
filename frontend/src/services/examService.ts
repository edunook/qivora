import { api } from "./api";

export const examService = {
  list: (params?: Record<string, unknown>) => api.get("/exams", { params }).then((res) => res.data),
  getById: (examId: string) => api.get(`/exams/${examId}`).then((res) => res.data),
  create: (payload: Record<string, unknown>) => api.post("/exams", payload).then((res) => res.data),
  getCreator: (creatorId: string) => api.get(`/exams/creator/${creatorId}`).then((res) => res.data),
  followCreator: (creatorId: string) => api.post(`/exams/creator/${creatorId}/follow`).then((res) => res.data)
};
