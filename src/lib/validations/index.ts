// Re-export all validation schemas
export * from "./generate";
export * from "./projects";
export * from "./auth";
export * from "./user";

import { z } from "zod";
import { NextResponse } from "next/server";

// Common validation helper
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue: z.ZodIssue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return {
      success: false,
      error: NextResponse.json(
        {
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

// Common field schemas for reuse
export const idSchema = z.string().min(1, "ID is required");

export const urlSchema = z.string().url("Invalid URL format");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export const aspectRatioSchema = z.enum(["9:16", "3:4", "1:1", "4:3", "16:9"]);
