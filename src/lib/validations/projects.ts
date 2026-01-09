import { z } from "zod";

// Create project request schema
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name too long")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(1000, "Description too long")
    .optional()
    .transform((val) => val?.trim() || null),
  websiteUrl: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// Update project request schema
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name too long")
    .transform((val) => val.trim())
    .optional(),
  description: z
    .string()
    .max(1000, "Description too long")
    .optional()
    .transform((val) => val?.trim() || null),
  websiteUrl: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Brand asset upload schema
export const uploadBrandAssetSchema = z.object({
  type: z.enum(["LOGO", "FOUNDER", "MASCOT", "PRODUCT", "OTHER"]),
  description: z.string().max(500, "Description too long").optional(),
  tags: z.array(z.string().max(50)).max(10, "Maximum 10 tags").optional(),
});

export type UploadBrandAssetInput = z.infer<typeof uploadBrandAssetSchema>;
