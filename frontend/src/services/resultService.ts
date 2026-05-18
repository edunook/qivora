import { api } from "./api";

export const resultService = {
  mine: () => api.get("/results").then((res) => res.data),
  getById: (resultId: string) => api.get(`/results/${resultId}`).then((res) => res.data),
  publish: (examId: string) => api.post(`/results/publish/${examId}`).then((res) => res.data)
};
