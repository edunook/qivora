import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOption: { type: Number, min: 0, max: 3 },
    markedForReview: { type: Boolean, default: false },
    timeSpentSeconds: { type: Number, default: 0 }
  },
  { _id: false }
);

const snapshotSchema = new mongoose.Schema(
  {
    currentSubjectIndex: { type: Number, default: 0 },
    currentQuestionIndex: { type: Number, default: 0 },
    remainingSeconds: { type: Number, default: 0 },
    subjectRemainingSeconds: { type: Map, of: Number, default: {} }
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: [answerSchema], default: [] },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "auto_submitted"],
      default: "in_progress"
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    snapshot: { type: snapshotSchema, default: () => ({}) },
    timeSpentSeconds: { type: Number, default: 0 },
    violationsCount: { type: Number, default: 0 },
    lastViolationAt: { type: Date },
    isCheated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

attemptSchema.index({ exam: 1, student: 1 }, { unique: true });

export const Attempt = mongoose.model("Attempt", attemptSchema);
