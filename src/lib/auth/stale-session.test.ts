import { describe, expect, it } from "vitest";
import { isStaleAuthSession, isSupabaseSessionCookie } from "./stale-session";

describe("stale Supabase sessions", () => {
  it("recognizes terminal refresh-token failures", () => {
    expect(isStaleAuthSession({ code: "refresh_token_not_found" })).toBe(true);
    expect(isStaleAuthSession({ message: "Invalid Refresh Token: Refresh Token Not Found" })).toBe(true);
    expect(isStaleAuthSession({ code: "bad_jwt", message: "Temporary auth failure" })).toBe(false);
  });

  it("targets only Supabase session cookies", () => {
    expect(isSupabaseSessionCookie("sb-project-auth-token.0")).toBe(true);
    expect(isSupabaseSessionCookie("sb-project-auth-token-code-verifier")).toBe(true);
    expect(isSupabaseSessionCookie("odin-dashboard-welcomed:user")).toBe(false);
    expect(isSupabaseSessionCookie("session-preference")).toBe(false);
  });
});
