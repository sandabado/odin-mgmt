type RateLimitOptions = { limit: number; windowMs: number };
type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Development-safe in-memory limiter. It intentionally has no cross-instance
 * guarantees; replace this adapter with Vercel KV before high-volume release.
 */
export function checkRateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;

  bucket.count += 1;
  buckets.set(key, bucket);

  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000)),
  };
}
