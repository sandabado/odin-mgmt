import type { OdinRole } from "./roles";

const ADMIN_DESTINATION = "/admin/dashboard";
const ARTIST_DESTINATION = "/artist/dashboard";
const FOUNDATION_DESTINATION = "/foundation";

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isArtistPath(pathname: string) {
  return pathname === "/artist" || pathname.startsWith("/artist/");
}

function isFoundationPath(pathname: string) {
  return pathname === "/foundation" || pathname.startsWith("/foundation/");
}

export function memberHomeForRole(
  role: OdinRole | null | undefined,
): string | null {
  if (role === "super_admin" || role === "booking_director") {
    return ADMIN_DESTINATION;
  }
  if (role === "artist") return ARTIST_DESTINATION;
  if (role === "foundation_partner") return FOUNDATION_DESTINATION;
  return null;
}

export function memberDestinationForRole(
  role: OdinRole | null | undefined,
  requestedPath?: string | null,
): string | null {
  const home = memberHomeForRole(role);
  if (!home || !requestedPath?.startsWith("/")) return home;
  if (requestedPath.startsWith("//")) return home;

  if (
    (role === "artist" && isArtistPath(requestedPath)) ||
    (role === "foundation_partner" && isFoundationPath(requestedPath)) ||
    ((role === "super_admin" || role === "booking_director") &&
      isAdminPath(requestedPath)) ||
    (role === "super_admin" && isFoundationPath(requestedPath))
  ) {
    return requestedPath;
  }

  return home;
}
