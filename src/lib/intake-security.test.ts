import { describe, expect, it } from "vitest";
import {
  clearIntakeFailures,
  plainText,
  recordIntakeFailure,
  tokensMatch,
} from "./intake-security";
import { checkRateLimit } from "./rate-limit";

describe("public intake security", () => {
  it("accepts identical CSRF tokens and rejects mismatches", () => {
    expect(tokensMatch("signal-token", "signal-token")).toBe(true);
    expect(tokensMatch("signal-token", "signal-taken")).toBe(false);
    expect(tokensMatch(undefined, "signal-token")).toBe(false);
  });

  it("removes markup and control characters from public text", () => {
    expect(plainText("  Hello <script>alert(1)</script>\u0000 world  "))
      .toBe("Hello alert(1) world");
  });

  it("requires additional verification after three failed submissions", () => {
    const key = crypto.randomUUID();
    expect(recordIntakeFailure(key).challengeRequired).toBe(false);
    expect(recordIntakeFailure(key).challengeRequired).toBe(false);
    expect(recordIntakeFailure(key)).toMatchObject({ count: 3, challengeRequired: true });
    clearIntakeFailures(key);
  });

  it("throttles a 100-request burst after ten accepted requests", () => {
    const key = `intake-test:${crypto.randomUUID()}`;
    const results = Array.from({ length: 100 }, () => checkRateLimit(key, {
      limit: 10,
      windowMs: 60_000,
    }));
    expect(results.filter((result) => result.allowed)).toHaveLength(10);
    expect(results.filter((result) => !result.allowed)).toHaveLength(90);
    expect(results.at(-1)?.retryAfterSeconds).toBeGreaterThan(0);
  });
});
