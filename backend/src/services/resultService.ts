import { Types } from "mongoose";
import { Attempt } from "../models/Attempt.js";
import { Exam } from "../models/Exam.js";
import { Result } from "../models/Result.js";
import { AppError } from "../utils/AppError.js";
import { getGpa, getGrade } from "../utils/scoring.js";

type AnswerMap = Map<string, { selectedOption?: number | null }>;

export async function computeAndStoreResult(attemptId: string) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  const exam = await Exam.findById(attempt.exam);
  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  const answerMap: AnswerMap = new Map(
    (attempt.answers as unknown as any[]).map((answer: any) => [String(answer.questionId), { selectedOption: answer.selectedOption }])
  );

  const subjectStats = (exam.subjects as unknown as any[]).map((subject: any) => {
    let scoredMarks = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unattemptedAnswers = 0;

    (subject.questions as unknown as any[]).forEach((question: any) => {
      const answer = answerMap.get(String(question._id));
      if (answer?.selectedOption === undefined || answer.selectedOption === null) {
        unattemptedAnswers += 1;
        return;
      }

      if (answer.selectedOption === question.correctAnswer) {
        correctAnswers += 1;
        scoredMarks += question.marks;
      } else {
        wrongAnswers += 1;
        scoredMarks -= question.negativeMarks;
      }
    });

    const percentage = subject.totalMarks > 0 ? (scoredMarks / subject.totalMarks) * 100 : 0;
    return {
      subjectId: subject._id as Types.ObjectId,
      title: subject.title,
      scoredMarks: Number(scoredMarks.toFixed(2)),
      totalMarks: subject.totalMarks,
      percentage: Number(Math.max(0, percentage).toFixed(2)),
      grade: getGrade(Math.max(0, percentage)),
      passed: scoredMarks >= subject.passingMarks,
      correctAnswers,
      wrongAnswers,
      unattemptedAnswers
    };
  });

  const totalMarks = (exam.subjects as unknown as any[]).reduce((sum: number, subject: any) => sum + subject.totalMarks, 0);
  const scoredMarks = subjectStats.reduce((sum: number, subject: any) => sum + subject.scoredMarks, 0);
  const correctAnswers = subjectStats.reduce((sum: number, subject: any) => sum + subject.correctAnswers, 0);
  const wrongAnswers = subjectStats.reduce((sum: number, subject: any) => sum + subject.wrongAnswers, 0);
  const unattemptedAnswers = subjectStats.reduce((sum: number, subject: any) => sum + subject.unattemptedAnswers, 0);
  const overallPercentage = totalMarks > 0 ? (Math.max(0, scoredMarks) / totalMarks) * 100 : 0;
  const passed = subjectStats.every((subject: any) => subject.passed);

  const answersBreakdown = (exam.subjects as unknown as any[]).flatMap((subject: any) =>
    (subject.questions as unknown as any[]).map((question: any) => {
      const answer = answerMap.get(String(question._id));
      const isCorrect = answer?.selectedOption === question.correctAnswer;
      return {
        subjectId: subject._id as Types.ObjectId,
        questionId: question._id as Types.ObjectId,
        selectedOption: answer?.selectedOption ?? -1,
        correctOption: question.correctAnswer,
        isCorrect,
        marksAwarded:
          answer?.selectedOption === undefined
            ? 0
            : isCorrect
              ? question.marks
              : -question.negativeMarks,
        explanation: question.explanation
      };
    })
  );

  const weakSubjects = [...subjectStats]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 2)
    .map((subject) => subject.title);
  const strongSubjects = [...subjectStats]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2)
    .map((subject) => subject.title);

  const shouldPublish = exam.schedule?.releaseMode === "instant" || exam.schedule?.resultsPublished;

  const result = await Result.findOneAndUpdate(
    { attempt: attempt._id },
    {
      exam: exam._id,
      attempt: attempt._id,
      student: attempt.student,
      subjectStats,
      answersBreakdown,
      totalMarks,
      scoredMarks: Number(scoredMarks.toFixed(2)),
      overallPercentage: Number(Math.max(0, overallPercentage).toFixed(2)),
      overallGrade: getGrade(Math.max(0, overallPercentage)),
      gpa: getGpa(Math.max(0, overallPercentage)),
      passed,
      correctAnswers,
      wrongAnswers,
      unattemptedAnswers,
      accuracy:
        correctAnswers + wrongAnswers > 0
          ? Number(((correctAnswers / (correctAnswers + wrongAnswers)) * 100).toFixed(2))
          : 0,
      timeSpentSeconds: attempt.timeSpentSeconds,
      weakSubjects,
      strongSubjects,
      resultStatus: shouldPublish ? "published" : "pending",
      publishedAt: shouldPublish ? new Date() : undefined,
      isCheated: attempt.isCheated
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  await recomputeRanks(String(exam._id));

  return Result.findById(result._id);
}

export async function recomputeRanks(examId: string) {
  const results = await Result.find({ exam: examId }).sort({
    overallPercentage: -1,
    timeSpentSeconds: 1
  });

  await Promise.all(
    results.map((result, index) =>
      Result.findByIdAndUpdate(result._id, {
        rank: index + 1
      })
    )
  );
}
