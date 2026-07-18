import { ArtistPortalNavigation } from "@/components/artist/ArtistPortalNavigation";

export function ArtistPortalShell({ artistName, children, isOperations }: { artistName?: string; children: React.ReactNode; isOperations: boolean }) {
  return <div className="min-h-screen bg-void text-bone selection:bg-plasma selection:text-void lg:pl-60"><ArtistPortalNavigation artistName={artistName} isOperations={isOperations} /><div className="min-h-screen pb-24 lg:pb-10">{children}</div></div>;
}
