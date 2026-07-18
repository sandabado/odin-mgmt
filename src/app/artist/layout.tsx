import { ArtistPortalShell } from "@/components/artist/ArtistPortalShell";
import type { BandMember, EventThreadRecord } from "@/components/artist/band-types";
import { getArtistPortalContext } from "@/lib/artist-portal";

export const dynamic = "force-dynamic";

export default async function ArtistPortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { artist, isOperations, supabase } = await getArtistPortalContext();
  const [{ data: memberData }, { data: generalThreadData }] = artist ? await Promise.all([
    supabase.from("band_members").select("id, artist_id, name, role, display_name, avatar_url, avatar_color, is_active, sort_order").eq("artist_id", artist.id).eq("is_active", true).order("sort_order").order("name").returns<BandMember[]>(),
    supabase.from("event_threads").select("id, artist_id, event_type, practice_id, deal_id, meeting_id, session_id, title, is_locked").eq("artist_id", artist.id).eq("event_type", "general").maybeSingle<EventThreadRecord>(),
  ]) : [{ data: [] as BandMember[] }, { data: null as EventThreadRecord | null }];
  return <ArtistPortalShell artistId={artist?.id ?? null} artistName={artist?.artist_name} bandMembers={memberData ?? []} generalThread={generalThreadData ?? null} isOperations={isOperations}>{children}</ArtistPortalShell>;
}
