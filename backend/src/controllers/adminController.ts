import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Exam } from "../models/Exam.js";
import { Review } from "../models/Review.js";
import { Result } from "../models/Result.js";
import { Violation } from "../models/Violation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const getAdminDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [users, exams, reviews, results, violations] = await Promise.all([
    User.countDocuments(),
    Exam.countDocuments(),
    Review.countDocuments(),
    Result.countDocuments(),
    Violation.countDocuments()
  ]);

  const recentViolations = await Violation.find()
    .populate("student", "name username")
    .populate("exam", "title")
    .sort({ occurredAt: -1 })
    .limit(10);

  res.json({
    success: true,
    stats: { users, exams, reviews, results, violations },
    recentViolations
  });
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isSuspended: req.body.isSuspended },
    { new: true }
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, user });
});

export const listExamsAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const exams = await Exam.find()
    .populate("creator", "name username role")
    .sort({ createdAt: -1 });

  res.json({ success: true, exams });
});

export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.findByIdAndDelete(req.params.examId);
  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  res.json({ success: true, message: "Exam deleted successfully" });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, message: "User deleted successfully" });
});
