import type { NextRequest } from "next/server";

type FailureBucket = { count: number; resetAt: number };

const failureBuckets = new Map<string, FailureBucket>();

export function clientAddress(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function hashAddress(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  if (!forwardedHost) return false;
  return origin === `${forwardedProtocol}://${forwardedHost}`;
}

export function tokensMatch(left: string | undefined, right: string | null) {
  if (!left || !right || left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export function recordIntakeFailure(key: string, windowMs = 5 * 60_000) {
  const now = Date.now();
  const existing = failureBuckets.get(key);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : existing;
  bucket.count += 1;
  failureBuckets.set(key, bucket);
  return { count: bucket.count, challengeRequired: bucket.count >= 3 };
}

export function clearIntakeFailures(key: string) {
  failureBuckets.delete(key);
}

export function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
