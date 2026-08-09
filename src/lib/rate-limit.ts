type RateLimitOptions = { limit: number; windowMs: number };
type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

const buckets = new Map<string, number[]>();

/**
 * Development-safe in-memory limiter. It intentionally has no cross-instance
 * guarantees; replace this adapter with Vercel KV before high-volume release.
 */
export function checkRateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (buckets.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
  timestamps.push(now);
  buckets.set(key, timestamps);
  const allowed = timestamps.length <= limit;
  const oldestCounted = timestamps[0] ?? now;
  return {
    allowed,
    remaining: Math.max(0, limit - timestamps.length),
    retryAfterSeconds: Math.max(1, Math.ceil((oldestCounted + windowMs - now) / 1_000)),
  };
}
