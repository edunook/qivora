import { Request, Response } from "express";
import { Review } from "../models/Review.js";
import { Exam } from "../models/Exam.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

async function refreshRating(examId: string) {
  const reviews = await Review.find({ exam: examId, status: "visible" });
  const average =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  await Exam.findByIdAndUpdate(examId, {
    averageRating: Number(average.toFixed(2)),
    ratingsCount: reviews.length
  });
}

export const createReview = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const review = await Review.findOneAndUpdate(
    { exam: req.params.examId, author: req.user?.id },
    {
      exam: req.params.examId,
      author: req.user?.id,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      status: "visible"
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await refreshRating(String(req.params.examId));
  res.status(201).json({ success: true, review });
});

export const listExamReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({
    exam: req.params.examId,
    status: "visible"
  })
    .populate("author", "name username avatar")
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

export const moderateReview = asyncHandler(async (req: Request & { user?: { role: string } }, res: Response) => {
  if (req.user?.role !== "admin") {
    throw new AppError("Admin access required", 403);
  }

  const review = await Review.findByIdAndUpdate(
    req.params.reviewId,
    { status: req.body.status },
    { new: true }
  );

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  await refreshRating(String(review.exam));
  res.json({ success: true, review });
});
