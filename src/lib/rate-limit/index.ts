import { NextResponse } from "next/server";

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  maxTokens: number; // Maximum tokens in bucket
  refillRate: number; // Tokens per second
  refillInterval: number; // How often to refill (ms)
}

// In-memory store for rate limit tracking
// In production, consider using Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const ENTRY_TTL = 10 * 60 * 1000; // Remove entries older than 10 minutes

let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const keys = Array.from(rateLimitStore.keys());
    for (const key of keys) {
      const entry = rateLimitStore.get(key);
      if (entry && now - entry.lastRefill > ENTRY_TTL) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

// Token bucket rate limiter
function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; reset: number } {
  startCleanup();

  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = {
      tokens: config.maxTokens,
      lastRefill: now,
    };
    rateLimitStore.set(key, entry);
  }

  // Refill tokens based on time elapsed
  const timeSinceRefill = now - entry.lastRefill;
  const tokensToAdd = Math.floor(
    (timeSinceRefill / 1000) * config.refillRate
  );

  if (tokensToAdd > 0) {
    entry.tokens = Math.min(config.maxTokens, entry.tokens + tokensToAdd);
    entry.lastRefill = now;
  }

  // Calculate reset time
  const tokensNeeded = entry.tokens < 1 ? 1 - entry.tokens : 0;
  const resetInSeconds = tokensNeeded > 0 ? Math.ceil(tokensNeeded / config.refillRate) : 0;
  const reset = Math.ceil(now / 1000) + resetInSeconds;

  // Check if request is allowed
  if (entry.tokens >= 1) {
    entry.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(entry.tokens),
      reset,
    };
  }

  return {
    allowed: false,
    remaining: 0,
    reset,
  };
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Strict limit for expensive operations (generation)
  GENERATION: {
    maxTokens: 10, // 10 requests
    refillRate: 10 / 60, // 10 per minute = 0.167 per second
    refillInterval: 1000,
  },
  // Standard limit for write operations
  WRITE: {
    maxTokens: 30, // 30 requests
    refillRate: 30 / 60, // 30 per minute = 0.5 per second
    refillInterval: 1000,
  },
  // Relaxed limit for read operations
  READ: {
    maxTokens: 100, // 100 requests
    refillRate: 100 / 60, // 100 per minute = 1.67 per second
    refillInterval: 1000,
  },
  // Very strict for auth operations (prevent brute force)
  AUTH: {
    maxTokens: 5, // 5 requests
    refillRate: 5 / 60, // 5 per minute
    refillInterval: 1000,
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

// Main rate limit check function
export function rateLimit(
  identifier: string,
  type: RateLimitType = "READ"
): { allowed: boolean; remaining: number; reset: number } {
  const config = RATE_LIMITS[type];
  const key = `${type}:${identifier}`;
  return checkRateLimit(key, config);
}

// Helper to create rate limit headers
export function rateLimitHeaders(
  remaining: number,
  reset: number,
  limit: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };
}

// Helper to return rate limit exceeded response
export function rateLimitExceeded(
  remaining: number,
  reset: number,
  limit: number
): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: reset - Math.floor(Date.now() / 1000),
    },
    {
      status: 429,
      headers: {
        ...rateLimitHeaders(remaining, reset, limit),
        "Retry-After": (reset - Math.floor(Date.now() / 1000)).toString(),
      },
    }
  );
}

// Utility to get client identifier from request
export function getClientIdentifier(
  request: Request,
  userId?: string
): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `ip:${ip}`;
}

// Combined helper for API routes
export function checkApiRateLimit(
  request: Request,
  type: RateLimitType,
  userId?: string
): {
  allowed: boolean;
  response?: NextResponse;
  headers: Record<string, string>;
} {
  const identifier = getClientIdentifier(request, userId);
  const config = RATE_LIMITS[type];
  const { allowed, remaining, reset } = rateLimit(identifier, type);

  const headers = rateLimitHeaders(remaining, reset, config.maxTokens);

  if (!allowed) {
    return {
      allowed: false,
      response: rateLimitExceeded(remaining, reset, config.maxTokens),
      headers,
    };
  }

  return {
    allowed: true,
    headers,
  };
}
