import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows requests up to the configured limit and blocks the next request", () => {
    const key = `test:${crypto.randomUUID()}`;
    const options = { limit: 2, windowMs: 60_000 };

    expect(checkRateLimit(key, options)).toMatchObject({ allowed: true, remaining: 1 });
    expect(checkRateLimit(key, options)).toMatchObject({ allowed: true, remaining: 0 });
    expect(checkRateLimit(key, options)).toMatchObject({ allowed: false, remaining: 0 });
  });
});
