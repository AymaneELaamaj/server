import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(50, "Name must contain at most 50 characters"),
    email: z.email("Email must be valid").trim().toLowerCase(),
    password: z
      .string()
      .min(6, "Password must contain at least 6 characters")
      .max(100, "Password must contain at most 100 characters"),
  }),
});
export const loginSchema = z.object({
  body: z.object({
    email: z.email("Email must be valid").trim().toLowerCase(),
    password: z
      .string()
      .min(6, "Password must contain at least 6 characters")
      .max(100, "Password must contain at most 100 characters"),
  }),
});