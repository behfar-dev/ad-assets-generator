import { z } from "zod";

// Update profile request schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .transform((val) => val.trim())
    .optional(),
  bio: z
    .string()
    .max(500, "Bio too long")
    .optional()
    .transform((val) => val?.trim() || null),
  company: z
    .string()
    .max(100, "Company name too long")
    .optional()
    .transform((val) => val?.trim() || null),
  image: z.string().url("Invalid image URL").optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Change password request schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Delete account request schema
export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required for account deletion"),
  confirmation: z
    .string()
    .refine((val) => val === "DELETE", {
      message: 'Please type "DELETE" to confirm',
    }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

// Credit purchase request schema
export const purchaseCreditsSchema = z.object({
  packageId: z.string().min(1, "Package ID is required"),
});

export type PurchaseCreditsInput = z.infer<typeof purchaseCreditsSchema>;

// Admin credit adjustment schema
export const adminCreditAdjustmentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.coerce.number().refine((val) => val !== 0, "Amount cannot be zero"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason too long")
    .transform((val) => val.trim()),
});

export type AdminCreditAdjustmentInput = z.infer<
  typeof adminCreditAdjustmentSchema
>;
