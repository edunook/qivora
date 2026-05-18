import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().default(""),
  comment: z.string().min(5)
});
