type AuthFailure = {
  code?: string;
  message?: string;
};

const staleSessionCodes = new Set(["refresh_token_not_found", "refresh_token_already_used"]);

/** True only for terminal refresh-token failures that require a fresh sign-in. */
export function isStaleAuthSession(error: AuthFailure | null | undefined) {
  if (!error) return false;
  if (error.code && staleSessionCodes.has(error.code)) return true;
  return /invalid refresh token|refresh token not found|refresh token.*already used/i.test(error.message ?? "");
}

/** Restricts cleanup to Supabase session cookies; application cookies are preserved. */
export function isSupabaseSessionCookie(name: string) {
  return name.startsWith("sb-") && (name.includes("-auth-token") || name.endsWith("-code-verifier"));
}
