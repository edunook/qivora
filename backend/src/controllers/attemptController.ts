import { Request, Response } from "express";
import { Attempt } from "../models/Attempt.js";
import { Exam } from "../models/Exam.js";
import { Violation } from "../models/Violation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { computeAndStoreResult } from "../services/resultService.js";
import { createNotification } from "../services/notificationService.js";
import { isDateReached } from "../utils/date.js";

export const startAttempt = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  if (exam.schedule?.startAt && !isDateReached(exam.schedule.startAt)) {
    throw new AppError("This exam is not open yet", 400);
  }

  if (exam.schedule?.endAt && isDateReached(exam.schedule.endAt)) {
    throw new AppError("This exam has already ended", 400);
  }

  let attempt = await Attempt.findOne({
    exam: exam._id,
    student: req.user?.id
  });

  if (attempt && attempt.status !== "in_progress") {
    throw new AppError("This exam allows only one attempt", 409);
  }

  if (!attempt) {
    attempt = await Attempt.create({
      exam: exam._id,
      student: req.user?.id,
      snapshot: {
        currentSubjectIndex: 0,
        currentQuestionIndex: 0,
        remainingSeconds: exam.subjects.reduce((sum, subject) => sum + subject.durationMinutes * 60, 0),
        subjectRemainingSeconds: exam.subjects.reduce<Record<string, number>>((acc, subject) => {
          acc[String(subject._id)] = subject.durationMinutes * 60;
          return acc;
        }, {})
      }
    });

    exam.attemptsCount += 1;
    await exam.save();
  }

  res.status(201).json({ success: true, attempt });
});

export const getAttempt = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const attempt = await Attempt.findOne({
    exam: req.params.examId,
    student: req.user?.id
  });

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  res.json({ success: true, attempt });
});

export const saveAttempt = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const attempt = await Attempt.findOne({
    exam: req.params.examId,
    student: req.user?.id
  });

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  if (attempt.status !== "in_progress") {
    throw new AppError("Attempt already submitted", 400);
  }

  const exam = await Exam.findById(attempt.exam);
  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  // Filter out any answers submitted for sections that are locked or closed on the server side
  const filteredAnswers = [];
  const now = new Date();

  for (const answer of req.body.answers || []) {
    const subject = exam.subjects.find((s) => String(s._id) === String(answer.subjectId));
    if (subject) {
      let isAvailable = true;
      if (subject.startDate && subject.startTime) {
        try {
          const startStr = `${subject.startDate.split("T")[0]}T${subject.startTime}`;
          const start = new Date(startStr);
          if (now < start) isAvailable = false;
        } catch {}
      }
      if (subject.endDate && subject.endTime) {
        try {
          const endStr = `${subject.endDate.split("T")[0]}T${subject.endTime}`;
          const end = new Date(endStr);
          if (now > end) isAvailable = false;
        } catch {}
      }
      if (isAvailable) {
        filteredAnswers.push(answer);
      }
    }
  }

  attempt.answers = filteredAnswers as any;
  attempt.snapshot = req.body.snapshot;
  attempt.timeSpentSeconds = req.body.timeSpentSeconds;
  await attempt.save();

  res.json({ success: true, attempt });
});

export const submitAttempt = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const attempt = await Attempt.findOne({
    exam: req.params.examId,
    student: req.user?.id
  });

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  if (attempt.status !== "in_progress") {
    throw new AppError("Attempt already submitted", 400);
  }

  const exam = await Exam.findById(attempt.exam);
  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  // Filter out any answers submitted for sections that are locked or closed on the server side
  const filteredAnswers = [];
  const now = new Date();

  for (const answer of req.body.answers || []) {
    const subject = exam.subjects.find((s) => String(s._id) === String(answer.subjectId));
    if (subject) {
      let isAvailable = true;
      if (subject.startDate && subject.startTime) {
        try {
          const startStr = `${subject.startDate.split("T")[0]}T${subject.startTime}`;
          const start = new Date(startStr);
          if (now < start) isAvailable = false;
        } catch {}
      }
      if (subject.endDate && subject.endTime) {
        try {
          const endStr = `${subject.endDate.split("T")[0]}T${subject.endTime}`;
          const end = new Date(endStr);
          if (now > end) isAvailable = false;
        } catch {}
      }
      if (isAvailable) {
        filteredAnswers.push(answer);
      }
    }
  }

  attempt.answers = filteredAnswers as any;
  attempt.snapshot = req.body.snapshot;
  attempt.timeSpentSeconds = req.body.timeSpentSeconds;
  attempt.violationsCount = req.body.violationsCount;
  attempt.isCheated = req.body.isCheated;
  attempt.status = req.body.autoSubmitted ? "auto_submitted" : "submitted";
  attempt.submittedAt = new Date();
  await attempt.save();

  const result = await computeAndStoreResult(attempt.id);

  await createNotification({
    user: req.user!.id,
    type: "success",
    title: "Exam submitted",
    message: "Your exam has been submitted and processed.",
    link: `/results/${result?.id || ""}`
  });

  res.json({ success: true, attempt, result });
});

export const logViolation = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const attempt = await Attempt.findOne({
    exam: req.params.examId,
    student: req.user?.id
  });

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  const violation = await Violation.create({
    attempt: attempt._id,
    exam: attempt.exam,
    student: attempt.student,
    type: req.body.type,
    meta: req.body.meta
  });

  attempt.violationsCount += 1;
  attempt.lastViolationAt = new Date();
  await attempt.save();

  await createNotification({
    user: req.user!.id,
    type: "violation_alert",
    title: "Security violation detected",
    message: `A ${req.body.type.replace("_", " ")} event was recorded during your exam.`,
    link: `/exam/${req.params.examId}`
  });

  res.status(201).json({ success: true, violation, violationsCount: attempt.violationsCount });
});
