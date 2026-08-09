export const PUBLIC_EDITORIAL_KINDS = [
  "label",
  "article",
  "campaign",
  "livestream",
  "management",
  "news",
  "partner",
  "pitch",
  "promo",
  "release",
  "sync",
  "tour",
  "video",
] as const;

export type PublicEditorialKind = (typeof PUBLIC_EDITORIAL_KINDS)[number];
export type PublicEditorialLiveStatus = "scheduled" | "live" | "ended";

export interface PublicEditorialItem {
  actionLabel: string;
  artistSlug?: string;
  external: boolean;
  href: string;
  image?: string;
  imageAlt?: string;
  kind: PublicEditorialKind;
  liveStatus?: PublicEditorialLiveStatus;
  meta?: string;
  slug: string;
  sortOrder: number;
  startsAt?: string;
  summary: string;
  title: string;
}

export interface PublicEditorialRow {
  payload: unknown;
  slug: string;
  sort_order: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const boundedString = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return undefined;
  const candidate = value.trim();
  return candidate && candidate.length <= maxLength ? candidate : undefined;
};

const safePublicUrl = (value: unknown) => {
  const candidate = boundedString(value, 2048);
  if (!candidate) return undefined;
  if (candidate.startsWith("/")) {
    if (candidate.startsWith("//") || candidate.includes("\\")) {
      return undefined;
    }
    return candidate;
  }
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
};

const safeImageUrl = (value: unknown) => {
  const candidate = safePublicUrl(value);
  if (!candidate || candidate.startsWith("/")) return candidate;
  const hostname = new URL(candidate).hostname;
  return hostname === "sandabado-music.vercel.app" ||
    hostname === "umoapqrkcabmdvkmdnqv.supabase.co" ||
    hostname === "wholebodyrecords.com" ||
    hostname === "www.wholebodyrecords.com"
    ? candidate
    : undefined;
};

const isEditorialKind = (value: string): value is PublicEditorialKind =>
  (PUBLIC_EDITORIAL_KINDS as readonly string[]).includes(value);

function safeStartsAt(value: unknown) {
  const candidate = boundedString(value, 40);
  if (
    !candidate ||
    !/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(
      candidate,
    )
  ) {
    return undefined;
  }
  return Number.isNaN(Date.parse(candidate)) ? undefined : candidate;
}

export function parsePublicEditorialItem(
  row: PublicEditorialRow,
): PublicEditorialItem | null {
  if (!isRecord(row.payload)) return null;

  const actionLabel = boundedString(row.payload.action_label, 80);
  const artistSlug = boundedString(row.payload.artist_slug, 120);
  const href = safePublicUrl(row.payload.href);
  const kind = boundedString(row.payload.kind, 40);
  const slug = boundedString(row.slug, 120);
  const summary = boundedString(row.payload.summary, 600);
  const title = boundedString(row.payload.title, 160);
  if (
    !actionLabel ||
    !href ||
    !kind ||
    !isEditorialKind(kind) ||
    !slug ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !summary ||
    !title
  ) {
    return null;
  }

  const image = safeImageUrl(row.payload.image_url);
  const liveStatus = boundedString(row.payload.live_status, 20);

  return {
    actionLabel,
    artistSlug:
      artistSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(artistSlug)
        ? artistSlug
        : undefined,
    external: href.startsWith("https://"),
    href,
    image,
    imageAlt: image ? boundedString(row.payload.image_alt, 240) : undefined,
    kind,
    liveStatus:
      kind === "livestream" &&
      (liveStatus === "scheduled" || liveStatus === "live" || liveStatus === "ended")
        ? liveStatus
        : undefined,
    meta: boundedString(row.payload.meta, 180),
    slug,
    sortOrder:
      Number.isInteger(row.sort_order) && row.sort_order >= 0
        ? row.sort_order
        : 0,
    startsAt: safeStartsAt(row.payload.starts_at),
    summary,
    title,
  };
}
