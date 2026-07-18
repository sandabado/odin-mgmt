"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BandMemberPicker } from "@/components/artist/BandMemberPicker";
import type { BandMember } from "@/components/artist/band-types";

type BandMemberContextValue = {
  currentBandMember: BandMember | null;
  chooseMember: (member: BandMember) => void;
  openMemberPicker: () => void;
};

const BandMemberContext = createContext<BandMemberContextValue | null>(null);

export function BandMemberProvider({ artistId, members, children }: { artistId: string | null; members: BandMember[]; children: React.ReactNode }) {
  const storageKey = artistId ? `odin_current_member:${artistId}` : "odin_current_member";
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!members.length) {
      setCurrentMemberId(null);
      setPickerOpen(false);
      return;
    }
    const saved = window.localStorage.getItem(storageKey);
    if (saved && members.some((member) => member.id === saved)) setCurrentMemberId(saved);
    else setPickerOpen(true);
  }, [members, storageKey]);

  const currentBandMember = useMemo(() => members.find((member) => member.id === currentMemberId) ?? null, [currentMemberId, members]);
  const value = useMemo<BandMemberContextValue>(() => ({
    currentBandMember,
    chooseMember(member) {
      setCurrentMemberId(member.id);
      window.localStorage.setItem(storageKey, member.id);
      setPickerOpen(false);
    },
    openMemberPicker() {
      if (members.length) setPickerOpen(true);
    },
  }), [currentBandMember, members.length, storageKey]);

  return <BandMemberContext.Provider value={value}>{children}<BandMemberPicker currentMemberId={currentMemberId} members={members} onClose={() => setPickerOpen(false)} onSelect={value.chooseMember} open={pickerOpen} /></BandMemberContext.Provider>;
}

export function useBandMember() {
  const context = useContext(BandMemberContext);
  if (!context) throw new Error("useBandMember must be used inside BandMemberProvider");
  return context;
}
