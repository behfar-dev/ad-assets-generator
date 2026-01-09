import { z } from "zod";

// Signup request schema
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long")
      .transform((val) => val.trim()),
    email: z
      .string()
      .email("Invalid email address")
      .max(255, "Email too long")
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

// Login request schema (for credential provider)
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Forgot password request schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.toLowerCase().trim()),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password request schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
