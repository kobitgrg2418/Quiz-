/**
 * In-memory sliding-window rate limiter.
 *
 * For a single-server deployment this is sufficient.
 * For multi-server, swap to Redis (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const resetInMs = windowMs - (now - oldest);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil(resetInMs / 1000),
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    resetInSeconds: config.windowSeconds,
  };
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const AI_RATE_LIMIT = { maxRequests: 20, windowSeconds: 60 };       // 20 AI calls/min
export const UPLOAD_RATE_LIMIT = { maxRequests: 5, windowSeconds: 60 };    // 5 uploads/min
export const AUTH_RATE_LIMIT = { maxRequests: 10, windowSeconds: 60 };     // 10 auth attempts/min
export const SEARCH_RATE_LIMIT = { maxRequests: 30, windowSeconds: 60 };   // 30 searches/min
