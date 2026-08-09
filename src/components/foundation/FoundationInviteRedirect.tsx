"use client";

import { useEffect } from "react";

/**
 * Supabase invitation confirmation links can return an implicit-flow session
 * in the URL fragment. Fragments never reach the server, so move the intact
 * fragment to the dedicated client-only completion route before creating a
 * Supabase browser client.
 */
export function FoundationInviteRedirect() {
  useEffect(() => {
    if (
      window.location.pathname === "/auth/complete-invite" ||
      !window.location.hash
    ) {
      return;
    }

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    if (
      fragment.get("type") !== "invite" ||
      !fragment.has("access_token") ||
      !fragment.has("refresh_token")
    ) {
      return;
    }

    window.location.replace(`/auth/complete-invite${window.location.hash}`);
  }, []);

  return null;
}
