import { api } from "./api";

export const notificationService = {
  list: () => api.get("/notifications").then((res) => res.data),
  read: (notificationId: string) =>
    api.patch(`/notifications/${notificationId}/read`).then((res) => res.data),
  readAll: () =>
    api.patch("/notifications/read-all").then((res) => res.data)
};
