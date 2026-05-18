import { api } from "./api";

export const attemptService = {
  start: (examId: string) => api.post(`/attempts/${examId}/start`).then((res) => res.data),
  get: (examId: string) => api.get(`/attempts/${examId}`).then((res) => res.data),
  save: (examId: string, payload: Record<string, unknown>) =>
    api.put(`/attempts/${examId}/save`, payload).then((res) => res.data),
  submit: (examId: string, payload: Record<string, unknown>) =>
    api.post(`/attempts/${examId}/submit`, payload).then((res) => res.data),
  violation: (examId: string, payload: Record<string, unknown>) =>
    api.post(`/attempts/${examId}/violations`, payload).then((res) => res.data)
};
