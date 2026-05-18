import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "teacher", "admin", "organization"]).default("student"),
  organizationName: z.string().optional().default("")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8)
});
