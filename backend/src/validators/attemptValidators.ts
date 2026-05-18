import { z } from "zod";

export const saveAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        subjectId: z.string(),
        questionId: z.string(),
        selectedOption: z.number().min(0).max(3).optional(),
        markedForReview: z.boolean().default(false),
        timeSpentSeconds: z.number().min(0).default(0)
      })
    )
    .default([]),
  snapshot: z.object({
    currentSubjectIndex: z.number().min(0).default(0),
    currentQuestionIndex: z.number().min(0).default(0),
    remainingSeconds: z.number().min(0).default(0),
    subjectRemainingSeconds: z.record(z.string(), z.number().min(0)).default({})
  }),
  timeSpentSeconds: z.number().min(0).default(0)
});

export const submitAttemptSchema = saveAttemptSchema.extend({
  violationsCount: z.number().min(0).default(0),
  isCheated: z.boolean().default(false),
  autoSubmitted: z.boolean().default(false)
});

export const violationSchema = z.object({
  type: z.enum(["tab_switch", "window_blur", "fullscreen_exit", "copy", "paste", "right_click"]),
  meta: z.record(z.string(), z.any()).default({})
});
