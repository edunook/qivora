import { Request, Response } from "express";
import { Result } from "../models/Result.js";
import { Exam } from "../models/Exam.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { isDateReached } from "../utils/date.js";

function canPublish(exam: any) {
  if (!exam) return false;
  if (exam.schedule?.releaseMode === "instant") return true;
  if (exam.schedule?.resultsPublished) return true;
  if (exam.schedule?.releaseMode === "scheduled" && isDateReached(exam.schedule?.resultReleaseAt)) return true;
  return false;
}

export const getMyResults = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const results = await Result.find({ student: req.user?.id })
    .populate("exam", "title category resultConfig schedule")
    .sort({ createdAt: -1 });

  res.json({ success: true, results });
});

export const getResultById = asyncHandler(async (req: Request & { user?: { id: string; role: string } }, res: Response) => {
  const result = await Result.findById(req.params.resultId)
    .populate("exam")
    .populate("student", "name username avatar")
    .populate("attempt");

  if (!result) {
    throw new AppError("Result not found", 404);
  }

  const exam = result.exam as any;
  const allowed =
    req.user?.role === "admin" || String(result.student._id) === req.user?.id || String(exam.creator) === req.user?.id;

  if (!allowed) {
    throw new AppError("You cannot access this result", 403);
  }

  if (!canPublish(exam) && req.user?.role !== "admin" && String(exam.creator) !== req.user?.id) {
    res.json({
      success: true,
      status: "pending",
      message: "Results are not yet published."
    });
    return;
  }

  if (result.resultStatus !== "published") {
    result.resultStatus = "published";
    result.publishedAt = new Date();
    await result.save();
  }

  res.json({ success: true, status: "published", result });
});

export const publishResults = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  if (String(exam.creator) !== req.user?.id) {
    throw new AppError("Only the creator can publish these results", 403);
  }

  if (exam.schedule) {
    exam.schedule.resultsPublished = true;
  }
  await exam.save();

  await Result.updateMany(
    { exam: exam._id },
    { resultStatus: "published", publishedAt: new Date() }
  );

  res.json({ success: true, message: "Results published successfully" });
});
