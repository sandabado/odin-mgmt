import { ArtistPortalShell } from "@/components/artist/ArtistPortalShell";
import { getArtistPortalContext } from "@/lib/artist-portal";

export const dynamic = "force-dynamic";

export default async function ArtistPortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { artist, isOperations } = await getArtistPortalContext();
  return <ArtistPortalShell artistName={artist?.artist_name} isOperations={isOperations}>{children}</ArtistPortalShell>;
}
