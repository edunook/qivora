import { Request, Response } from "express";
import { Exam } from "../models/Exam.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { combineDateTime } from "../utils/date.js";

export const createExam = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const schedule = {
    examDate: req.body.schedule.examDate ? new Date(req.body.schedule.examDate) : undefined,
    startTime: req.body.schedule.startTime || "",
    endTime: req.body.schedule.endTime || "",
    startAt: combineDateTime(req.body.schedule.examDate, req.body.schedule.startTime),
    endAt: combineDateTime(req.body.schedule.examDate, req.body.schedule.endTime),
    resultReleaseDate: req.body.schedule.resultReleaseDate
      ? new Date(req.body.schedule.resultReleaseDate)
      : undefined,
    resultReleaseTime: req.body.schedule.resultReleaseTime || "",
    resultReleaseAt: combineDateTime(
      req.body.schedule.resultReleaseDate,
      req.body.schedule.resultReleaseTime
    ),
    releaseMode: req.body.schedule.releaseMode,
    resultsPublished: req.body.schedule.releaseMode === "instant"
  };

  const exam = await Exam.create({
    ...req.body,
    schedule,
    creator: req.user?.id
  });

  res.status(201).json({ success: true, exam });
});

export const listExams = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    subject,
    duration,
    popularity,
    rating,
    sort = "newest",
    creatorId
  } = req.query;

  const filter: Record<string, unknown> = {
    isArchived: false,
    visibility: "public"
  };

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } }
    ];
  }

  if (subject) {
    filter["subjects.title"] = { $regex: subject, $options: "i" };
  }

  if (duration) {
    filter["subjects.durationMinutes"] = { $lte: Number(duration) };
  }

  if (popularity) {
    filter.attemptsCount = { $gte: Number(popularity) };
  }

  if (rating) {
    filter.averageRating = { $gte: Number(rating) };
  }

  if (creatorId) {
    filter.creator = creatorId;
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    trending: { attemptsCount: -1, averageRating: -1 },
    rating: { averageRating: -1 },
    popular: { enrollmentsCount: -1 }
  };

  const exams = await Exam.find(filter)
    .populate("creator", "name username avatar role organizationName followers")
    .sort(sortMap[String(sort)] || sortMap.newest)
    .lean();

  res.json({ success: true, exams });
});

export const getExamById = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.findById(req.params.examId).populate(
    "creator",
    "name username avatar bio role organizationName followers following"
  );

  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  const reviews = await Review.find({
    exam: exam._id,
    status: "visible"
  })
    .populate("author", "name username avatar")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ success: true, exam, reviews });
});

export const getCreatorProfile = asyncHandler(async (req: Request, res: Response) => {
  const creator = await User.findById(req.params.creatorId).select(
    "name username avatar bio role organizationName followers following createdAt"
  );

  if (!creator) {
    throw new AppError("Creator not found", 404);
  }

  const exams = await Exam.find({ creator: creator._id, visibility: "public", isArchived: false })
    .sort({ createdAt: -1 })
    .limit(12);

  res.json({ success: true, creator, exams });
});

export const followCreator = asyncHandler(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const creator = await User.findById(req.params.creatorId);
    const user = await User.findById(req.user?.id);

    if (!creator || !user) {
      throw new AppError("User not found", 404);
    }

    const alreadyFollowing = user.following.some((id) => String(id) === creator.id);

    if (alreadyFollowing) {
      user.following = user.following.filter((id) => String(id) !== creator.id);
      creator.followers = creator.followers.filter((id) => String(id) !== user.id);
    } else {
      user.following.push(creator._id);
      creator.followers.push(user._id);
    }

    await Promise.all([user.save(), creator.save()]);

    res.json({
      success: true,
      following: !alreadyFollowing,
      followersCount: creator.followers.length
    });
  }
);
