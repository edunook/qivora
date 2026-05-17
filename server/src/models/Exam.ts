import mongoose from 'mongoose'

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please provide question text'],
  },
  options: {
    type: [String],
    required: true,
    validate: [
      (val: string[]) => val.length === 4,
      'A question must have exactly 4 options',
    ],
  },
  correctOption: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  subject: {
    type: String,
    default: '',
  },
  explanation: {
    type: String,
    default: '',
  },
  marks: {
    type: Number,
    default: 1,
  },
  negativeMarks: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  questionImage: {
    type: String,
    default: '',
  },
  randomization: {
    type: Boolean,
    default: false,
  },
})

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  questions: [QuestionSchema],
})

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: Number, default: 15 }, // duration in minutes
  totalMarks: { type: Number, default: 0 },
  passingMarks: { type: Number, default: 0 },
  instructions: { type: String, default: '' },
  questions: [QuestionSchema],
  quizzes: [QuizSchema],
})

const ExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an exam title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    instructions: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Please select a main subject'],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingsList: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        review: String,
        createdAt: { type: Date, default: Date.now },
      }
    ],
    // Scheduling Configuration
    startDate: {
      type: Date,
    },
    startTime: {
      type: String,
    },
    endDate: {
      type: Date,
    },
    endTime: {
      type: String,
    },
    resultsReleaseDate: {
      type: Date,
    },
    resultsReleaseTime: {
      type: String,
    },
    resultsReleased: {
      type: Boolean,
      default: true,
    },
    // Security Configuration
    fullscreenMode: {
      type: Boolean,
      default: false,
    },
    detectTabSwitching: {
      type: Boolean,
      default: false,
    },
    detectMinimizeEvents: {
      type: Boolean,
      default: false,
    },
    disableCopy: {
      type: Boolean,
      default: false,
    },
    disablePaste: {
      type: Boolean,
      default: false,
    },
    disableRightClick: {
      type: Boolean,
      default: false,
    },
    autoSubmitOnViolations: {
      type: Boolean,
      default: false,
    },
    violationLimit: {
      type: Number,
      default: 3,
    },
    webcamMonitoring: {
      type: Boolean,
      default: false,
    },
    suspiciousActivityLogging: {
      type: Boolean,
      default: false,
    },
    // Result Theme Configuration
    resultType: {
      type: String,
      enum: ['percentage', 'grade', 'gpa', 'pass_fail', 'ranking'],
      default: 'percentage',
    },
    resultTheme: {
      type: String,
      enum: ['Modern', 'Futuristic', 'Cyberpunk', 'Classic'],
      default: 'Modern',
    },
    resultColors: {
      type: [String],
      default: [],
    },
    resultLayoutStyle: {
      type: String,
      enum: ['Grid', 'List', 'SingleCard'],
      default: 'Grid',
    },
    resultCardStyle: {
      type: String,
      default: '',
    },
    resultTypography: {
      type: String,
      default: '',
    },
    showRank: {
      type: Boolean,
      default: true,
    },
    showPercentage: {
      type: Boolean,
      default: true,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },
    showWrongAnswers: {
      type: Boolean,
      default: true,
    },
    showExplanations: {
      type: Boolean,
      default: true,
    },
    downloadableResult: {
      type: Boolean,
      default: true,
    },
    printableResult: {
      type: Boolean,
      default: true,
    },
    leaderboardVisibility: {
      type: Boolean,
      default: true,
    },
    // Subjects Hierarchy Array
    subjects: {
      type: [SubjectSchema],
      default: [],
    },
    // Keep legacy support or fallback
    questions: {
      type: [QuestionSchema],
      default: [],
    },
    duration: {
      type: Number,
      default: 30, // overall total time (calculated or fallback)
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    negativeMarkValue: {
      type: Number,
      default: 0.25,
    },
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
    resultsReleaseType: {
      type: String,
      enum: ['immediate', 'scheduled', 'manual'],
      default: 'immediate',
    },
  },
  {
    timestamps: true,
  }
)

export const Exam = mongoose.model('Exam', ExamSchema)
