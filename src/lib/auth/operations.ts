import { fail } from "@/lib/api-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";

/** Use this at the top of every operations API route before accessing data. */
export async function getOperationsSupabase() {
  if (!hasSupabaseEnvironment()) {
    return { response: fail("SERVER_ERROR", "Ødin operations is not configured yet.") } as const;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response: fail("UNAUTHORIZED", "Sign in to access Ødin operations.") } as const;

  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (error || !profile || (profile.role !== "super_admin" && profile.role !== "booking_director")) {
    return { response: fail("FORBIDDEN", "You do not have access to this operations module.") } as const;
  }

  return { supabase, userId: user.id } as const;
}
