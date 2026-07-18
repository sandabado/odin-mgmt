"use client";

import { useState } from "react";
import { ArtistPortalNavigation } from "@/components/artist/ArtistPortalNavigation";
import { BandMemberProvider } from "@/components/artist/BandMemberContext";
import { GeneralChatPanel } from "@/components/artist/GeneralChatPanel";
import type { BandMember, EventThreadRecord } from "@/components/artist/band-types";

export function ArtistPortalShell({ artistId, artistName, bandMembers, generalThread, children, isOperations }: { artistId: string | null; artistName?: string; bandMembers: BandMember[]; generalThread: EventThreadRecord | null; children: React.ReactNode; isOperations: boolean }) {
  const [generalChatOpen, setGeneralChatOpen] = useState(false);
  return <BandMemberProvider artistId={artistId} members={bandMembers}><div className="min-h-screen bg-void text-bone selection:bg-plasma selection:text-void lg:pl-60"><ArtistPortalNavigation artistName={artistName} isOperations={isOperations} onOpenBandChat={() => setGeneralChatOpen(true)} /><div className="min-h-screen pb-24 lg:pb-10">{children}</div><GeneralChatPanel members={bandMembers} onClose={() => setGeneralChatOpen(false)} open={generalChatOpen} thread={generalThread} /></div></BandMemberProvider>;
}
