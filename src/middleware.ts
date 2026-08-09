import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  memberDestinationForRole,
  memberHomeForRole,
} from "@/lib/auth/member-destination";
import type { OdinRole } from "@/lib/auth/roles";
import {
  isStaleAuthSession,
  isSupabaseSessionCookie,
} from "@/lib/auth/stale-session";

const protectedRoutes = [
  "/admin",
  "/artist",
  "/dashboard",
  "/foundation",
  "/venues",
  "/leads",
  "/contracts",
  "/promo-studio",
  "/analytics",
  "/settings",
  "/partner-artists",
  "/swap-board",
  "/contacts",
  "/outreach",
  "/deals",
] as const;

const superAdminRoutes = [
  "/settings",
  "/admin/settings",
  "/admin/foundation",
  "/admin/guardian",
  "/admin/expenses",
  "/admin/playbook",
] as const;
const bookingRoutes = [
  "/venues",
  "/leads",
  "/contracts",
  "/partner-artists",
  "/swap-board",
  "/contacts",
  "/outreach",
  "/deals",
  "/admin/contacts",
] as const;

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function clearStaleSession(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter(({ name }) => isSupabaseSessionCookie(name))
    .forEach(({ name }) =>
      response.cookies.set(name, "", { maxAge: 0, path: "/" }),
    );
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = matchesRoute(pathname, protectedRoutes);
  const isLogin = pathname === "/login";
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    if (isProtected) {
      return NextResponse.redirect(
        new URL("/login?configuration=required", request.url),
      );
    }
    return response;
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (isStaleAuthSession(authError)) {
    if (isProtected) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", pathname);
      return clearStaleSession(request, NextResponse.redirect(redirectUrl));
    }
    return clearStaleSession(request, response);
  }

  if (!user && isProtected) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  let role: OdinRole | null = null;
  if (user && (isLogin || isProtected)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: OdinRole }>();
    role = profile?.role ?? null;
  }

  if (user && isLogin) {
    const next = request.nextUrl.searchParams.get("next");
    const destination = memberDestinationForRole(role, next) ?? "/account";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (user && isProtected) {
    if (!role) return NextResponse.redirect(new URL("/account", request.url));

    const isFoundationPath = matchesRoute(pathname, ["/foundation"]);

    if (role === "foundation_partner" && !isFoundationPath) {
      return NextResponse.redirect(new URL("/foundation", request.url));
    }

    if (
      isFoundationPath &&
      role !== "foundation_partner" &&
      role !== "super_admin"
    ) {
      return NextResponse.redirect(
        new URL(memberHomeForRole(role) ?? "/account", request.url),
      );
    }

    if (role === "artist" && pathname.startsWith("/admin"))
      return NextResponse.redirect(new URL("/artist/dashboard", request.url));
    if (matchesRoute(pathname, superAdminRoutes) && role !== "super_admin")
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (matchesRoute(pathname, bookingRoutes) && role === "artist")
      return NextResponse.redirect(new URL("/artist/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/artist/:path*",
    "/dashboard/:path*",
    "/foundation/:path*",
    "/venues/:path*",
    "/leads/:path*",
    "/contracts/:path*",
    "/promo-studio/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/partner-artists/:path*",
    "/swap-board/:path*",
    "/contacts/:path*",
    "/outreach/:path*",
    "/deals/:path*",
    "/login",
  ],
};
