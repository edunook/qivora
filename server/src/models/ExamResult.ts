import mongoose from 'mongoose'

const ExamResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    answers: {
      type: Map,
      of: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    finalScore: {
      type: Number,
      required: true,
    },
    cheated: {
      type: Boolean,
      default: false,
    },
    violationsCount: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      default: 'F',
    },
    gpa: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    subjectWiseAnalysis: {
      type: Map,
      of: new mongoose.Schema({
        correct: Number,
        total: Number,
        score: Number,
        maxScore: Number,
        percentage: Number,
        grade: { type: String, default: 'F' },
        passed: { type: Boolean, default: false },
        timeSpent: { type: Number, default: 0 },
      }, { _id: false }),
    },
  },
  {
    timestamps: true,
  }
)

export const ExamResult = mongoose.model('ExamResult', ExamResultSchema)
