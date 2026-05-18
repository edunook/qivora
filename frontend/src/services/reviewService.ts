import { api } from "./api";

export const reviewService = {
  list: (examId: string) => api.get(`/reviews/${examId}`).then((res) => res.data),
  create: (examId: string, payload: Record<string, unknown>) =>
    api.post(`/reviews/${examId}`, payload).then((res) => res.data)
};
