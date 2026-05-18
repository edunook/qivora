import { z } from "zod";

const questionSchema = z.object({
  prompt: z.string().min(3),
  imageUrl: z.string().optional().default(""),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().optional().default(""),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  marks: z.number().min(1),
  negativeMarks: z.number().min(0).default(0)
});

const subjectSchema = z.object({
  title: z.string().min(2),
  instructions: z.string().default(""),
  durationMinutes: z.number().min(1),
  passingMarks: z.number().min(0),
  totalMarks: z.number().min(1),
  quizSections: z.array(z.string()).default([]),
  questions: z.array(questionSchema).min(1)
});

export const examSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  instructions: z.string().default(""),
  banner: z.string().default(""),
  thumbnail: z.string().default(""),
  category: z.string().min(2),
  visibility: z.enum(["public", "private"]).default("public"),
  organization: z.string().default(""),
  tags: z.array(z.string()).default([]),
  schedule: z.object({
    examDate: z.string().optional().nullable(),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    resultReleaseDate: z.string().optional().nullable(),
    resultReleaseTime: z.string().optional().nullable(),
    releaseMode: z.enum(["instant", "scheduled", "manual"]).default("instant")
  }),
  security: z.object({
    fullscreenEnforced: z.boolean().default(true),
    detectTabSwitching: z.boolean().default(true),
    detectMinimize: z.boolean().default(true),
    disableCopy: z.boolean().default(true),
    disablePaste: z.boolean().default(true),
    disableRightClick: z.boolean().default(true),
    autoSubmitAfterViolations: z.boolean().default(true),
    violationLimit: z.number().min(1).max(10).default(3)
  }),
  resultConfig: z.object({
    resultType: z.enum(["percentage", "grade", "gpa", "ranking", "pass_fail"]).default("percentage"),
    themeName: z.string().default("Aurora"),
    showRanks: z.boolean().default(true),
    showPercentage: z.boolean().default(true),
    showAnswers: z.boolean().default(true),
    showExplanations: z.boolean().default(true),
    downloadPdf: z.boolean().default(true),
    printable: z.boolean().default(true),
    theme: z.object({
      primary: z.string().default("#7c3aed"),
      secondary: z.string().default("#06b6d4"),
      surface: z.string().default("#0f172a"),
      text: z.string().default("#e2e8f0"),
      typography: z.string().default("Space Grotesk"),
      layout: z.string().default("cards")
    })
  }),
  subjects: z.array(subjectSchema).min(1)
});
