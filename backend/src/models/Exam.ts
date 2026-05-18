import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["mcq"], default: "mcq" },
    prompt: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    options: {
      type: [String],
      validate: {
        validator: (options: string[]) => options.length === 4,
        message: "Each question must have exactly 4 options"
      }
    },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },
    marks: { type: Number, required: true, min: 1 },
    negativeMarks: { type: Number, default: 0, min: 0 }
  },
  { _id: true }
);

const subjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    instructions: { type: String, default: "" },
    durationMinutes: { type: Number, required: true, min: 1 },
    passingMarks: { type: Number, required: true, min: 0 },
    totalMarks: { type: Number, required: true, min: 1 },
    quizSections: [{ type: String }],
    startDate: { type: String, default: "" },
    startTime: { type: String, default: "" },
    endDate: { type: String, default: "" },
    endTime: { type: String, default: "" },
    questions: { type: [questionSchema], default: [] }
  },
  { _id: true }
);

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructions: { type: String, default: "" },
    banner: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    category: { type: String, required: true },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: String, default: "" },
    tags: [{ type: String }],
    schedule: {
      examDate: { type: Date },
      startTime: { type: String, default: "" },
      endTime: { type: String, default: "" },
      startAt: { type: Date },
      endAt: { type: Date },
      resultReleaseDate: { type: Date },
      resultReleaseTime: { type: String, default: "" },
      resultReleaseAt: { type: Date },
      releaseMode: {
        type: String,
        enum: ["instant", "scheduled", "manual"],
        default: "instant"
      },
      resultsPublished: { type: Boolean, default: false }
    },
    security: {
      fullscreenEnforced: { type: Boolean, default: true },
      detectTabSwitching: { type: Boolean, default: true },
      detectMinimize: { type: Boolean, default: true },
      disableCopy: { type: Boolean, default: true },
      disablePaste: { type: Boolean, default: true },
      disableRightClick: { type: Boolean, default: true },
      autoSubmitAfterViolations: { type: Boolean, default: true },
      violationLimit: { type: Number, default: 3, min: 1 }
    },
    resultConfig: {
      resultType: {
        type: String,
        enum: ["percentage", "grade", "gpa", "ranking", "pass_fail"],
        default: "percentage"
      },
      themeName: { type: String, default: "Aurora" },
      showRanks: { type: Boolean, default: true },
      showPercentage: { type: Boolean, default: true },
      showAnswers: { type: Boolean, default: true },
      showExplanations: { type: Boolean, default: true },
      downloadPdf: { type: Boolean, default: true },
      printable: { type: Boolean, default: true },
      theme: {
        primary: { type: String, default: "#7c3aed" },
        secondary: { type: String, default: "#06b6d4" },
        surface: { type: String, default: "#0f172a" },
        text: { type: String, default: "#e2e8f0" },
        typography: { type: String, default: "Space Grotesk" },
        layout: { type: String, default: "cards" }
      }
    },
    subjects: { type: [subjectSchema], default: [] },
    attemptsCount: { type: Number, default: 0 },
    enrollmentsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Exam = mongoose.model("Exam", examSchema);
