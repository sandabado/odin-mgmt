import { NextResponse, type NextRequest } from "next/server";
import { memberHomeForRole } from "@/lib/auth/member-destination";
import type { OdinRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return NextResponse.redirect(new URL("/login?error=confirmation_failed", request.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle<{ role: OdinRole }>();
    if (profile?.role === "foundation_partner") {
      const { error: auditError } = await supabase.rpc(
        "log_foundation_event",
        { target_event_type: "login" },
      );
      if (auditError) {
        console.error("Foundation login audit failed", auditError);
      }
    }
    const destination = memberHomeForRole(profile?.role) ?? "/account";
    return NextResponse.redirect(new URL(destination, request.url));
  } catch (error) {
    console.error("Odin auth callback failed", error);
    return NextResponse.redirect(new URL("/login?error=configuration", request.url));
  }
}
