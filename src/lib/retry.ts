/**
 * Retry utility with exponential backoff for API calls
 *
 * This module provides a robust retry mechanism for handling transient failures
 * in external API calls (fal.ai, OpenAI, etc.). It implements exponential backoff
 * with jitter to prevent thundering herd problems.
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay between retries in milliseconds (default: 10000) */
  maxDelayMs?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Add random jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
  /** Custom function to determine if error is retryable */
  isRetryable?: (error: unknown) => boolean;
  /** Callback called before each retry attempt */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
  totalTimeMs: number;
}

// Default errors that should trigger a retry
const DEFAULT_RETRYABLE_STATUS_CODES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
];

// Error messages that indicate transient failures
const RETRYABLE_ERROR_PATTERNS = [
  /timeout/i,
  /network/i,
  /ECONNRESET/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /socket hang up/i,
  /temporarily unavailable/i,
  /rate limit/i,
  /too many requests/i,
  /service unavailable/i,
  /internal server error/i,
];

/**
 * Default function to determine if an error should trigger a retry
 */
function defaultIsRetryable(error: unknown): boolean {
  // Don't retry null/undefined
  if (error == null) {
    return false;
  }

  // Check if error has a status code
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Check status code
    const status = errorObj.status || errorObj.statusCode;
    if (typeof status === "number" && DEFAULT_RETRYABLE_STATUS_CODES.includes(status)) {
      return true;
    }

    // Check for response with status
    if (errorObj.response && typeof errorObj.response === "object") {
      const response = errorObj.response as Record<string, unknown>;
      if (typeof response.status === "number" && DEFAULT_RETRYABLE_STATUS_CODES.includes(response.status)) {
        return true;
      }
    }
  }

  // Check error message patterns
  const errorMessage = error instanceof Error ? error.message : String(error);
  return RETRYABLE_ERROR_PATTERNS.some((pattern) => pattern.test(errorMessage));
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number,
  jitter: boolean
): number {
  // Calculate base delay: initialDelay * (multiplier ^ attempt)
  const baseDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);

  // Cap at max delay
  const cappedDelay = Math.min(baseDelay, maxDelayMs);

  // Add jitter (random value between 0 and 50% of the delay)
  if (jitter) {
    const jitterAmount = cappedDelay * 0.5 * Math.random();
    return Math.floor(cappedDelay + jitterAmount);
  }

  return Math.floor(cappedDelay);
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an async function with retry logic and exponential backoff
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns RetryResult containing success status, data or error, and metadata
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fal.subscribe("fal-ai/flux/dev", { input: { prompt } }),
 *   { maxRetries: 3, onRetry: (err, attempt) => console.log(`Retry ${attempt}`) }
 * );
 *
 * if (result.success) {
 *   console.log("Generated:", result.data);
 * } else {
 *   console.error("Failed after", result.attempts, "attempts:", result.error);
 * }
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    jitter = true,
    isRetryable = defaultIsRetryable,
    onRetry,
  } = options;

  const startTime = Date.now();
  let lastError: unknown;
  let attempts = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;

    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts,
        totalTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error;

      // Check if this is the last attempt or if error is not retryable
      if (attempt >= maxRetries || !isRetryable(error)) {
        break;
      }

      // Calculate delay before next retry
      const delayMs = calculateDelay(
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier,
        jitter
      );

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt + 1, delayMs);
      }

      // Log retry attempt
      console.log(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delayMs}ms:`,
        error instanceof Error ? error.message : String(error)
      );

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: lastError,
    attempts,
    totalTimeMs: Date.now() - startTime,
  };
}

/**
 * Simplified retry wrapper that throws on failure (for use in existing try/catch blocks)
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function if successful
 * @throws The last error if all retries fail
 *
 * @example
 * ```typescript
 * try {
 *   const result = await retryAsync(
 *     () => openai.chat.completions.create({ model: "gpt-4", messages }),
 *     { maxRetries: 3 }
 *   );
 * } catch (error) {
 *   // Handle error after all retries exhausted
 * }
 * ```
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const result = await withRetry(fn, options);

  if (result.success && result.data !== undefined) {
    return result.data;
  }

  // Throw the last error
  throw result.error;
}

/**
 * Create a reusable retry wrapper with preset options
 *
 * @param defaultOptions - Default options for all retries
 * @returns A retry function with preset options
 *
 * @example
 * ```typescript
 * const retryWithLogging = createRetryWrapper({
 *   maxRetries: 3,
 *   onRetry: (err, attempt) => logger.warn(`Retry ${attempt}:`, err)
 * });
 *
 * const result = await retryWithLogging(() => apiCall());
 * ```
 */
export function createRetryWrapper(defaultOptions: RetryOptions = {}) {
  return function <T>(fn: () => Promise<T>, overrideOptions: RetryOptions = {}): Promise<RetryResult<T>> {
    return withRetry(fn, { ...defaultOptions, ...overrideOptions });
  };
}

// Pre-configured retry wrappers for common use cases
export const retryGeneration = createRetryWrapper({
  maxRetries: 3,
  initialDelayMs: 2000, // Start with 2 seconds for AI APIs
  maxDelayMs: 30000, // Max 30 seconds between retries
  backoffMultiplier: 2,
  jitter: true,
  onRetry: (error, attempt, delayMs) => {
    console.log(
      `[Generation Retry] Attempt ${attempt} failed. Waiting ${delayMs}ms before retry.`,
      error instanceof Error ? error.message : error
    );
  },
});
