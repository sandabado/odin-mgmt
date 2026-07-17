import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=confirmation_failed", request.url));
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    console.error("Odin auth callback failed", error);
    return NextResponse.redirect(new URL("/login?error=configuration", request.url));
  }
}
