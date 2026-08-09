"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { WaterPalette } from "./WaterCanvas";
import { WholeBodyRecordsAtmosphere } from "./WholeBodyRecordsAtmosphere";

export interface PersistentRecordsAtmosphereProps {
  audioEnabled?: boolean;
  waterEnabled?: boolean;
}

type PublicCurrent =
  | "museum"
  | "home"
  | "artists"
  | "catalog"
  | "services"
  | "management"
  | "partners"
  | "sync"
  | "art-of-the-song"
  | "tour"
  | "submit"
  | "store"
  | "cart"
  | "account"
  | "login"
  | "legal";

const INK_ON_WATER_PALETTE: WaterPalette = {
  base: "#10100f",
  primary: "#2d9cdb",
  secondary: "#181816",
  surface: "#f5f2eb",
};

const WATER_PALETTES: Record<PublicCurrent, WaterPalette> = {
  museum: INK_ON_WATER_PALETTE,
  home: INK_ON_WATER_PALETTE,
  artists: INK_ON_WATER_PALETTE,
  catalog: INK_ON_WATER_PALETTE,
  services: INK_ON_WATER_PALETTE,
  management: INK_ON_WATER_PALETTE,
  partners: INK_ON_WATER_PALETTE,
  sync: INK_ON_WATER_PALETTE,
  "art-of-the-song": INK_ON_WATER_PALETTE,
  tour: INK_ON_WATER_PALETTE,
  submit: INK_ON_WATER_PALETTE,
  store: INK_ON_WATER_PALETTE,
  cart: INK_ON_WATER_PALETTE,
  account: INK_ON_WATER_PALETTE,
  login: INK_ON_WATER_PALETTE,
  legal: INK_ON_WATER_PALETTE,
};

function publicCurrent(pathname: string): PublicCurrent | null {
  if (pathname === "/museum") return "museum";
  if (pathname === "/") return "home";
  if (pathname === "/artists" || pathname.startsWith("/artists/")) {
    return "artists";
  }
  if (pathname === "/catalog" || pathname === "/releases") return "catalog";
  if (pathname === "/services") return "services";
  if (pathname === "/management") return "management";
  if (pathname === "/partners") return "partners";
  if (pathname === "/sync") return "sync";
  if (pathname === "/art-of-the-song") return "art-of-the-song";
  if (pathname === "/tour") return "tour";
  if (pathname === "/submit") return "submit";
  if (pathname === "/store") return "store";
  if (pathname === "/cart") return "cart";
  if (pathname === "/account") return "account";
  if (pathname === "/login") return "login";
  if (pathname === "/privacy" || pathname === "/terms") return "legal";
  return null;
}

export function PersistentRecordsAtmosphere({
  audioEnabled = true,
  waterEnabled = true,
}: PersistentRecordsAtmosphereProps) {
  const pathname = usePathname();
  const current = publicCurrent(pathname);
  const palette = useMemo(
    () => (current ? WATER_PALETTES[current] : undefined),
    [current],
  );

  if (!current || !palette) return null;

  return (
    <WholeBodyRecordsAtmosphere
      audioEnabled={audioEnabled}
      className={`records-persistent-atmosphere records-persistent-atmosphere--${current}`}
      palette={palette}
      waterEnabled={waterEnabled}
    />
  );
}
