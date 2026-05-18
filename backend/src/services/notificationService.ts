import { Notification } from "../models/Notification.js";

export async function createNotification(input: {
  user: string;
  type: "exam_reminder" | "result_alert" | "violation_alert" | "success" | "error" | "social";
  title: string;
  message: string;
  link?: string;
}) {
  return Notification.create(input);
}
