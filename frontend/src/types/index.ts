export type UserRole = "student" | "teacher" | "admin" | "organization";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  organizationName?: string;
}

export interface Question {
  _id?: string;
  prompt: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  negativeMarks: number;
}

export interface Subject {
  _id?: string;
  title: string;
  instructions: string;
  durationMinutes: number;
  passingMarks: number;
  totalMarks: number;
  quizSections: string[];
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  questions: Question[];
}

export interface Exam {
  _id: string;
  title: string;
  description: string;
  instructions: string;
  banner: string;
  thumbnail: string;
  category: string;
  visibility: "public" | "private";
  organization: string;
  tags: string[];
  creator: User & { followers?: string[] };
  schedule: {
    examDate?: string;
    startTime?: string;
    endTime?: string;
    startAt?: string;
    endAt?: string;
    resultReleaseDate?: string;
    resultReleaseTime?: string;
    resultReleaseAt?: string;
    releaseMode: "instant" | "scheduled" | "manual";
    resultsPublished: boolean;
  };
  security: {
    fullscreenEnforced: boolean;
    detectTabSwitching: boolean;
    detectMinimize: boolean;
    disableCopy: boolean;
    disablePaste: boolean;
    disableRightClick: boolean;
    autoSubmitAfterViolations: boolean;
    violationLimit: number;
  };
  resultConfig: {
    resultType: "percentage" | "grade" | "gpa" | "ranking" | "pass_fail";
    themeName: string;
    showRanks: boolean;
    showPercentage: boolean;
    showAnswers: boolean;
    showExplanations: boolean;
    downloadPdf: boolean;
    printable: boolean;
    theme: {
      primary: string;
      secondary: string;
      surface: string;
      text: string;
      typography: string;
      layout: string;
    };
  };
  subjects: Subject[];
  attemptsCount: number;
  averageRating: number;
  ratingsCount: number;
  createdAt: string;
}

export interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  author: Pick<User, "name" | "username" | "avatar">;
  createdAt: string;
}

export interface AttemptAnswer {
  subjectId: string;
  questionId: string;
  selectedOption?: number;
  markedForReview: boolean;
  timeSpentSeconds: number;
}

export interface Attempt {
  _id: string;
  exam: string;
  student: string;
  answers: AttemptAnswer[];
  status: "in_progress" | "submitted" | "auto_submitted";
  startedAt: string;
  submittedAt?: string;
  snapshot: {
    currentSubjectIndex: number;
    currentQuestionIndex: number;
    remainingSeconds: number;
    subjectRemainingSeconds: Record<string, number>;
  };
  timeSpentSeconds: number;
  violationsCount: number;
  isCheated: boolean;
}

export interface ResultSubjectStat {
  subjectId: string;
  title: string;
  scoredMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  passed: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  unattemptedAnswers: number;
}

export interface Result {
  _id: string;
  exam: Exam;
  student: Pick<User, "name" | "username" | "avatar">;
  subjectStats: ResultSubjectStat[];
  totalMarks: number;
  scoredMarks: number;
  overallPercentage: number;
  overallGrade: string;
  gpa: number;
  rank: number;
  passed: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  unattemptedAnswers: number;
  accuracy: number;
  timeSpentSeconds: number;
  weakSubjects: string[];
  strongSubjects: string[];
  resultStatus: "pending" | "published";
  publishedAt?: string;
  isCheated: boolean;
  answersBreakdown: Array<{
    subjectId: string;
    questionId: string;
    selectedOption: number;
    correctOption: number;
    isCorrect: boolean;
    marksAwarded: number;
    explanation: string;
  }>;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  createdAt: string;
  readAt?: string;
}
