import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvironment } from "./env";

/** Browser client: uses the public key and always respects RLS. */
export function createBrowserSupabaseClient() {
  const { url, publishableKey } = getSupabaseEnvironment();
  return createBrowserClient(url, publishableKey);
}

// Compatibility alias for the initial Phase 1 auth screen.
export const createSupabaseBrowserClient = createBrowserSupabaseClient;
