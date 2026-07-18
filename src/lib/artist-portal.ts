import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PortalArtist = {
  id: string;
  profile_id: string | null;
  artist_name: string;
  home_market: string;
  photo_url: string | null;
  status: string;
  disco_link: string | null;
};

export type PortalProfile = { full_name: string | null; role: "super_admin" | "booking_director" | "artist" };

/**
 * Resolves the one artist an artist account is allowed to operate on. Operations
 * users can preview the portal against a selected artist (or the first active
 * artist) without weakening the artist-side RLS boundary.
 */
export async function getArtistPortalContext(preferredArtistId?: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/artist/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle<PortalProfile>();

  const isOperations = profile?.role === "super_admin" || profile?.role === "booking_director";
  let artistQuery = supabase
    .from("artists")
    .select("id, profile_id, artist_name, home_market, photo_url, status, disco_link")
    .order("status")
    .order("artist_name");

  if (!isOperations) {
    artistQuery = artistQuery.eq("profile_id", user.id);
  } else if (preferredArtistId) {
    artistQuery = artistQuery.eq("id", preferredArtistId);
  }

  const { data } = await artistQuery.returns<PortalArtist[]>();

  return {
    artist: data?.[0] ?? null,
    isOperations,
    profile,
    supabase,
    user,
  };
}

export function artistPortalHref(path: string, artistId?: string) {
  if (!artistId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}artist=${encodeURIComponent(artistId)}`;
}
