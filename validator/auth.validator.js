import z from "zod";

export const signupSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .min(14, "Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  type: z.string(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .min(14, "Invalid email address"),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
});
