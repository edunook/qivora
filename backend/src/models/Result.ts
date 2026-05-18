import mongoose from "mongoose";

const answerBreakdownSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOption: { type: Number, default: -1 },
    correctOption: { type: Number, required: true },
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 },
    explanation: { type: String, default: "" }
  },
  { _id: false }
);

const subjectStatsSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    scoredMarks: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
    passed: { type: Boolean, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    unattemptedAnswers: { type: Number, required: true }
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    attempt: { type: mongoose.Schema.Types.ObjectId, ref: "Attempt", required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectStats: { type: [subjectStatsSchema], default: [] },
    answersBreakdown: { type: [answerBreakdownSchema], default: [] },
    totalMarks: { type: Number, required: true },
    scoredMarks: { type: Number, required: true },
    overallPercentage: { type: Number, required: true },
    overallGrade: { type: String, required: true },
    gpa: { type: Number, required: true },
    rank: { type: Number, default: 0 },
    passed: { type: Boolean, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    unattemptedAnswers: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeSpentSeconds: { type: Number, required: true },
    weakSubjects: [{ type: String }],
    strongSubjects: [{ type: String }],
    resultStatus: {
      type: String,
      enum: ["pending", "published"],
      default: "pending"
    },
    publishedAt: { type: Date },
    isCheated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

resultSchema.index({ exam: 1, student: 1 });

export const Result = mongoose.model("Result", resultSchema);
