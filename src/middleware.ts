import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = [
  "/admin",
  "/artist",
  "/dashboard",
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

const superAdminRoutes = ["/settings", "/admin/settings"] as const;
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
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function safeDestination(next: string | null) {
  if (!next) return "/admin";
  if (next === "/admin" || next.startsWith("/admin/")) return next;
  if (next === "/artist" || next.startsWith("/artist/")) return next;
  return "/admin";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = matchesRoute(pathname, protectedRoutes);
  const isLogin = pathname === "/login";
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login?configuration=required", request.url));
    }
    return response;
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isLogin) {
    const next = request.nextUrl.searchParams.get("next");
    const destination = safeDestination(next);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (user && isProtected) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const role = profile?.role;

    if (role === "artist" && pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/artist/dashboard", request.url));
    if (matchesRoute(pathname, superAdminRoutes) && role !== "super_admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (role === "booking_director" && matchesRoute(pathname, ["/admin/expenses"])) return NextResponse.redirect(new URL("/admin/money", request.url));
    if (matchesRoute(pathname, bookingRoutes) && role === "artist") return NextResponse.redirect(new URL("/artist/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/artist/:path*",
    "/dashboard/:path*",
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
