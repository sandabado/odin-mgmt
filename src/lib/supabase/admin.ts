import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnvironment } from "./env";

/**
 * Service-role client for trusted server work only (webhooks, cron, and
 * explicitly privileged operations). Never import this module from a client
 * component and never expose SUPABASE_SERVICE_ROLE_KEY through NEXT_PUBLIC_.
 */
export function createSupabaseAdminClient() {
  const { url } = getSupabaseEnvironment();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-only administrative operations.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
