import { NextResponse } from "next/server";

// Error codes for consistent error handling
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Resource errors
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  RESOURCE_LOCKED = "RESOURCE_LOCKED",

  // Credit errors
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
  CREDIT_DEDUCTION_FAILED = "CREDIT_DEDUCTION_FAILED",

  // Rate limiting
  RATE_LIMITED = "RATE_LIMITED",

  // Generation errors
  GENERATION_FAILED = "GENERATION_FAILED",
  GENERATION_TIMEOUT = "GENERATION_TIMEOUT",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  INVALID_IMAGE_URL = "INVALID_IMAGE_URL",
  UNSUPPORTED_FORMAT = "UNSUPPORTED_FORMAT",

  // Storage errors
  UPLOAD_FAILED = "UPLOAD_FAILED",
  DOWNLOAD_FAILED = "DOWNLOAD_FAILED",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",

  // Payment errors
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_CANCELLED = "PAYMENT_CANCELLED",

  // Server errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  DATABASE_ERROR = "DATABASE_ERROR",
}

// HTTP status codes for each error type
const errorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.SESSION_EXPIRED]: 401,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.RESOURCE_LOCKED]: 423,
  [ErrorCode.INSUFFICIENT_CREDITS]: 402,
  [ErrorCode.CREDIT_DEDUCTION_FAILED]: 500,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.GENERATION_FAILED]: 500,
  [ErrorCode.GENERATION_TIMEOUT]: 504,
  [ErrorCode.EXTERNAL_API_ERROR]: 502,
  [ErrorCode.INVALID_IMAGE_URL]: 400,
  [ErrorCode.UNSUPPORTED_FORMAT]: 400,
  [ErrorCode.UPLOAD_FAILED]: 500,
  [ErrorCode.DOWNLOAD_FAILED]: 500,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.PAYMENT_FAILED]: 402,
  [ErrorCode.PAYMENT_CANCELLED]: 400,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.DATABASE_ERROR]: 500,
};

// User-friendly error messages
const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: "Please log in to continue.",
  [ErrorCode.FORBIDDEN]: "You don't have permission to perform this action.",
  [ErrorCode.SESSION_EXPIRED]: "Your session has expired. Please log in again.",
  [ErrorCode.VALIDATION_ERROR]: "The provided data is invalid.",
  [ErrorCode.INVALID_INPUT]: "Invalid input provided.",
  [ErrorCode.MISSING_REQUIRED_FIELD]: "Required fields are missing.",
  [ErrorCode.NOT_FOUND]: "The requested resource was not found.",
  [ErrorCode.ALREADY_EXISTS]: "This resource already exists.",
  [ErrorCode.RESOURCE_LOCKED]: "This resource is currently locked.",
  [ErrorCode.INSUFFICIENT_CREDITS]:
    "Insufficient credits. Please purchase more credits to continue.",
  [ErrorCode.CREDIT_DEDUCTION_FAILED]:
    "Failed to process credits. Please try again.",
  [ErrorCode.RATE_LIMITED]:
    "Too many requests. Please wait a moment and try again.",
  [ErrorCode.GENERATION_FAILED]:
    "Generation failed. Your credits have been refunded.",
  [ErrorCode.GENERATION_TIMEOUT]:
    "Generation timed out. Please try again with a simpler prompt.",
  [ErrorCode.EXTERNAL_API_ERROR]:
    "External service is temporarily unavailable. Please try again later.",
  [ErrorCode.INVALID_IMAGE_URL]:
    "The provided image URL is invalid or inaccessible.",
  [ErrorCode.UNSUPPORTED_FORMAT]:
    "The file format is not supported.",
  [ErrorCode.UPLOAD_FAILED]: "Failed to upload file. Please try again.",
  [ErrorCode.DOWNLOAD_FAILED]: "Failed to download file. Please try again.",
  [ErrorCode.FILE_TOO_LARGE]: "File is too large. Maximum size is 10MB.",
  [ErrorCode.PAYMENT_FAILED]:
    "Payment failed. Please check your payment details and try again.",
  [ErrorCode.PAYMENT_CANCELLED]: "Payment was cancelled.",
  [ErrorCode.INTERNAL_ERROR]:
    "Something went wrong. Please try again later.",
  [ErrorCode.SERVICE_UNAVAILABLE]:
    "Service is temporarily unavailable. Please try again later.",
  [ErrorCode.DATABASE_ERROR]:
    "A database error occurred. Please try again later.",
};

// Standard API error response interface
export interface ApiErrorResponse {
  error: string;
  code: ErrorCode;
  message: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

// Application error class
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message?: string,
    details?: unknown,
    isOperational = true
  ) {
    super(message || errorMessages[code]);
    this.code = code;
    this.statusCode = errorStatusCodes[code];
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Create error response for API routes
export function createErrorResponse(
  code: ErrorCode,
  customMessage?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const statusCode = errorStatusCodes[code];
  const message = customMessage || errorMessages[code];

  const response: ApiErrorResponse = {
    error: code,
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  if (details !== undefined) {
    response.details = details;
  }

  return NextResponse.json(response, { status: statusCode });
}

// Handle unknown errors safely
export function handleError(error: unknown): NextResponse<ApiErrorResponse> {
  // If it's already an AppError, use its details
  if (error instanceof AppError) {
    return createErrorResponse(error.code, error.message, error.details);
  }

  // Log unexpected errors
  console.error("Unexpected error:", error);

  // Don't expose internal error details in production
  const isDev = process.env.NODE_ENV === "development";
  const details = isDev && error instanceof Error ? error.message : undefined;

  return createErrorResponse(ErrorCode.INTERNAL_ERROR, undefined, details);
}

// Specific error creators for common cases
export const Errors = {
  unauthorized: (message?: string) =>
    createErrorResponse(ErrorCode.UNAUTHORIZED, message),

  forbidden: (message?: string) =>
    createErrorResponse(ErrorCode.FORBIDDEN, message),

  notFound: (resource = "Resource") =>
    createErrorResponse(ErrorCode.NOT_FOUND, `${resource} not found.`),

  validationError: (details?: unknown) =>
    createErrorResponse(ErrorCode.VALIDATION_ERROR, undefined, details),

  insufficientCredits: (required: number, available: number) =>
    createErrorResponse(
      ErrorCode.INSUFFICIENT_CREDITS,
      `Insufficient credits. You need ${required} credits but only have ${available}.`,
      { required, available }
    ),

  generationFailed: (reason?: string) =>
    createErrorResponse(
      ErrorCode.GENERATION_FAILED,
      reason || errorMessages[ErrorCode.GENERATION_FAILED]
    ),

  generationTimeout: () =>
    createErrorResponse(ErrorCode.GENERATION_TIMEOUT),

  externalApiError: (service?: string) =>
    createErrorResponse(
      ErrorCode.EXTERNAL_API_ERROR,
      service
        ? `${service} is temporarily unavailable. Please try again later.`
        : undefined
    ),

  invalidImageUrl: (url?: string) =>
    createErrorResponse(
      ErrorCode.INVALID_IMAGE_URL,
      url
        ? `The image at ${url} could not be accessed.`
        : undefined
    ),

  rateLimited: (retryAfter?: number) =>
    createErrorResponse(
      ErrorCode.RATE_LIMITED,
      retryAfter
        ? `Too many requests. Please try again in ${retryAfter} seconds.`
        : undefined,
      retryAfter ? { retryAfter } : undefined
    ),

  internalError: (message?: string) =>
    createErrorResponse(ErrorCode.INTERNAL_ERROR, message),
};
