export const STORE_CATEGORIES = ["records", "wear", "objects"] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number];

export interface PublicStoreProduct {
  artistName: string;
  artistSlug: string;
  badge?: string;
  category: StoreCategory;
  currency: string;
  description: string;
  image: string;
  name: string;
  priceCents: number;
  releaseSlug?: string;
  slug: string;
}

/**
 * Artist-approved source catalog migrated from the live Sandābādo store.
 * ØDIN's commerce projection supersedes this bootstrap catalog as soon as
 * published commerce products are available from the public mirror.
 */
export const sandabadoStoreCatalog: readonly PublicStoreProduct[] = [
  {
    artistName: "Sandābādo",
    artistSlug: "sandabado",
    badge: "Limited to 100",
    category: "records",
    currency: "usd",
    description: "180g black vinyl · Ships October 2026",
    image: "/images/store/sandabado/infinity-love-vinyl-v1.png",
    name: "∞ LOVE Vinyl",
    priceCents: 5_000,
    releaseSlug: "infinity-love",
    slug: "infinity-vinyl",
  },
  {
    artistName: "Sandābādo",
    artistSlug: "sandabado",
    badge: "Collector's edition",
    category: "records",
    currency: "usd",
    description: "Hand-signed 180g black vinyl · Numbered edition",
    image: "/images/store/sandabado/infinity-love-vinyl-v1.png",
    name: "Signed ∞ LOVE Vinyl",
    priceCents: 7_500,
    releaseSlug: "infinity-love",
    slug: "signed-infinity-vinyl",
  },
  {
    artistName: "Sandābādo",
    artistSlug: "sandabado",
    category: "records",
    currency: "usd",
    description: "Six-panel art wallet · Full album",
    image: "/images/store/sandabado/sandabado-objects-v1.png",
    name: "∞ LOVE Compact Disc",
    priceCents: 2_000,
    releaseSlug: "infinity-love",
    slug: "infinity-cd",
  },
  {
    artistName: "Sandābādo",
    artistSlug: "sandabado",
    category: "records",
    currency: "usd",
    description: "MP3 + FLAC · ∞ LOVE",
    image: "/images/store/sandabado/infinity-love-album-art-v1.png",
    name: "Digital Album",
    priceCents: 1_500,
    releaseSlug: "infinity-love",
    slug: "digital-album",
  },
  {
    artistName: "Sandābādo",
    artistSlug: "sandabado",
    badge: "New",
    category: "wear",
    currency: "usd",
    description: "Washed black heavyweight cotton · Gold front print",
    image: "/images/store/sandabado/sandabado-eclipse-tee-v1.png",
    name: "Eclipse T-Shirt",
    priceCents: 3_500,
    releaseSlug: "infinity-love",
    slug: "sandabado-eclipse-tee",
  },
  {
    artistName: "Sandābādo",
    artistSlug: "sandabado",
    category: "objects",
    currency: "usd",
    description: "Six archival vinyl stickers · Weatherproof",
    image: "/images/store/sandabado/sandabado-objects-v1.png",
    name: "Desert Signal Sticker Sheet",
    priceCents: 800,
    releaseSlug: "infinity-love",
    slug: "sandabado-sticker-sheet",
  },
  {
    artistName: "Sandābādo",
    artistSlug: "sandabado",
    category: "objects",
    currency: "usd",
    description: "18 × 24 in. art print · Heavy uncoated stock",
    image: "/images/store/sandabado/sandabado-objects-v1.png",
    name: "∞ LOVE Art Poster",
    priceCents: 3_000,
    releaseSlug: "infinity-love",
    slug: "infinity-love-poster",
  },
  {
    artistName: "Sandābādo",
    artistSlug: "sandabado",
    badge: "Best value",
    category: "objects",
    currency: "usd",
    description: "Vinyl, CD, tee, poster, and sticker sheet",
    image: "/images/store/sandabado/sandabado-merch-collection-v1.png",
    name: "The First Chapter Set",
    priceCents: 12_500,
    releaseSlug: "infinity-love",
    slug: "infinity-bundle",
  },
] as const;

export function formatStoreCurrency(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(cents / 100);
}
