import { z } from "zod";

// Image generation request schema
export const generateImageSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  prompt: z.string().max(2000, "Prompt too long").optional(),
  aspectRatio: z
    .enum(["9:16", "3:4", "1:1", "4:3", "16:9"])
    .optional()
    .default("1:1"),
  projectId: z.string().optional(),
  count: z.coerce
    .number()
    .int()
    .positive()
    .max(10, "Maximum 10 images per request")
    .optional()
    .default(1),
  creativeDirectionId: z.string().optional(),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;

// Video generation request schema
export const generateVideoSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  prompt: z.string().max(2000, "Prompt too long").optional(),
  aspectRatio: z
    .enum(["9:16", "3:4", "1:1", "4:3", "16:9"])
    .optional()
    .default("16:9"),
  duration: z.coerce
    .number()
    .int()
    .min(3, "Minimum duration is 3 seconds")
    .max(30, "Maximum duration is 30 seconds")
    .optional()
    .default(5),
  projectId: z.string().optional(),
  count: z.coerce
    .number()
    .int()
    .positive()
    .max(5, "Maximum 5 videos per request")
    .optional()
    .default(1),
  creativeDirectionId: z.string().optional(),
});

export type GenerateVideoInput = z.infer<typeof generateVideoSchema>;

// Copy generation request schema
export const generateCopySchema = z.object({
  productName: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name too long"),
  productDescription: z
    .string()
    .min(1, "Product description is required")
    .max(2000, "Product description too long"),
  targetAudience: z.string().max(500, "Target audience too long").optional(),
  tone: z
    .enum([
      "professional",
      "casual",
      "playful",
      "luxurious",
      "urgent",
      "friendly",
      "authoritative",
    ])
    .optional()
    .default("professional"),
  platform: z
    .enum([
      "general",
      "facebook",
      "instagram",
      "twitter",
      "linkedin",
      "tiktok",
      "youtube",
    ])
    .optional()
    .default("general"),
  count: z.coerce
    .number()
    .int()
    .positive()
    .max(10, "Maximum 10 copies per request")
    .optional()
    .default(3),
  projectId: z.string().optional(),
  creativeDirectionId: z.string().optional(),
});

export type GenerateCopyInput = z.infer<typeof generateCopySchema>;
