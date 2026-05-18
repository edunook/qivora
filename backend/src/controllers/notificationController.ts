import { Request, Response } from "express";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const getMyNotifications = asyncHandler(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const notifications = await Notification.find({ user: req.user?.id }).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, notifications });
  }
);

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.notificationId,
    { readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  res.json({ success: true, notification });
});

export const markAllNotificationsRead = asyncHandler(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    await Notification.updateMany(
      { user: req.user?.id, readAt: { $exists: false } },
      { readAt: new Date() }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  }
);
