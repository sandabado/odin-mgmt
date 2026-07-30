import "server-only";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import {
  playablePublicReleases,
  publicArtists,
  publicReleases,
  publicTourDates,
  type PlayablePublicRelease,
  type PublicArtist,
  type PublicRelease,
  type PublicReleaseCredit,
  type PublicShow,
  type PublicTrack,
} from "@/lib/public-catalog";
import type { PublicStoreProduct } from "@/lib/commerce/catalog";
import {
  parsePublicEditorialItem,
  type PublicEditorialItem,
} from "@/lib/public-editorial";
import { getSupabaseEnvironment } from "@/lib/supabase/env";

type MirrorEntityType =
  | "artist_profile"
  | "release"
  | "show_date"
  | "studio_update"
  | "manifesto"
  | "service"
  | "store_product";

interface PublishedEntityRow {
  entity_type: MirrorEntityType;
  payload: unknown;
  slug: string;
  sort_order: number;
}

interface PublishedEntityQuery {
  available: boolean;
  rows: PublishedEntityRow[];
}

export interface PublicSiteData {
  artists: PublicArtist[];
  editorial: PublicEditorialItem[];
  releases: PublicRelease[];
  playableReleases: PlayablePublicRelease[];
  products: PublicStoreProduct[];
  services: PublicService[];
  tourDates: PublicShow[];
  source: "mirror" | "curated-fallback";
}

export interface PublicService {
  capabilities: string[];
  introduction?: string;
  slug: string;
  sortOrder: number;
  statement?: string;
  title: string;
}

export interface PublicArtistImage {
  altText?: string;
  imageType: "portrait" | "live" | "studio" | "landscape" | "press";
  sortOrder: number;
  url: string;
}

export interface PublicStagePlot {
  inputListPdfUrl?: string;
  name: string;
  plotDiagramUrl?: string;
  powerRequirements?: string;
  specialNeeds?: string;
  stageLayout?: string;
}

export interface PublicGearItem {
  brand?: string;
  category: string;
  model?: string;
  name: string;
}

export interface PublicArtistDetail {
  artist: PublicArtist;
  bookingEmail?: string;
  gear: PublicGearItem[];
  hasPublicPressMaterials: boolean;
  images: PublicArtistImage[];
  longBiography?: string;
  releases: PublicRelease[];
  stagePlots: PublicStagePlot[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const stringValue = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const boundedString = (value: unknown, maxLength: number) => {
  const candidate = stringValue(value);
  return candidate && candidate.length <= maxLength ? candidate : undefined;
};

const numberValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const approvedLocalArtistImages: Record<string, { alt: string; src: string }> =
  {
    "palo-xanto": {
      alt: "Palo Xanto performing live on guitar, photographed by Mandy Sanchez",
      src: "/images/artists/palo-xanto/palo-xanto-live-portrait-mandy-sanchez.jpg",
    },
  };

const stringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];

const boundedStringArray = (
  value: unknown,
  maxItems: number,
  maxLength: number,
) =>
  Array.isArray(value)
    ? value
        .flatMap((entry) => {
          const candidate = boundedString(entry, maxLength);
          return candidate ? [candidate] : [];
        })
        .slice(0, maxItems)
    : [];

const safePublicUrl = (value: unknown) => {
  const candidate = stringValue(value);
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
    hostname === "umoapqrkcabmdvkmdnqv.supabase.co"
    ? candidate
    : undefined;
};

function durationLabel(seconds: unknown) {
  const duration = numberValue(seconds);
  if (duration === undefined || duration < 0) return "";
  const minutes = Math.floor(duration / 60);
  return `${minutes}:${String(Math.round(duration % 60)).padStart(2, "0")}`;
}

function labelForSocial(key: string) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function artistFromEntity(row: PublishedEntityRow): PublicArtist | null {
  if (!isRecord(row.payload)) return null;
  const name = stringValue(row.payload.name);
  if (!name) return null;
  const curatedArtist = publicArtists.find(
    (artist) => artist.slug === row.slug,
  );

  const links = new Map<string, string>();
  const website = safePublicUrl(row.payload.website);
  const instagram = safePublicUrl(row.payload.instagram);
  const discoLink = safePublicUrl(row.payload.disco_link);
  if (website) links.set("Website", website);
  if (instagram) links.set("Instagram", instagram);
  if (discoLink) links.set("Catalog", discoLink);

  if (isRecord(row.payload.social_links)) {
    Object.entries(row.payload.social_links).forEach(([key, value]) => {
      const href = safePublicUrl(value);
      if (href) links.set(labelForSocial(key), href);
    });
  }

  stringArray(row.payload.music_links).forEach((value, index) => {
    const href = safePublicUrl(value);
    if (href && !Array.from(links.values()).includes(href)) {
      links.set(`Listen ${index + 1}`, href);
    }
  });

  const localImage = approvedLocalArtistImages[row.slug];

  return {
    slug: row.slug,
    name,
    location: stringValue(row.payload.location),
    description:
      stringValue(row.payload.description) ??
      stringValue(row.payload.bio_short) ??
      "Artist-approved work in the Whole Body Records field.",
    image:
      safeImageUrl(row.payload.hero_image_url) ??
      localImage?.src ??
      curatedArtist?.image,
    imageAlt:
      localImage?.alt ?? curatedArtist?.imageAlt ?? `${name} artist portrait`,
    featureImages: curatedArtist?.featureImages,
    catalogStatus: row.payload.catalog_status === "held" ? "held" : "published",
    links: Array.from(links, ([label, href]) => ({ label, href })),
  };
}

function spotifyIdentity(payload: Record<string, unknown>) {
  const explicitUri = stringValue(payload.spotify_uri);
  const url = safePublicUrl(payload.spotify_url);
  if (explicitUri?.startsWith("spotify:")) {
    const [, type, id] = explicitUri.split(":");
    return {
      uri: explicitUri,
      embedUrl:
        type && id ? `https://open.spotify.com/embed/${type}/${id}` : undefined,
      listenUrl:
        url ??
        (type && id ? `https://open.spotify.com/${type}/${id}` : undefined),
    };
  }

  if (url) {
    const match = url.match(
      /open\.spotify\.com\/(album|track)\/([A-Za-z0-9]+)/,
    );
    if (match) {
      return {
        uri: `spotify:${match[1]}:${match[2]}`,
        embedUrl: `https://open.spotify.com/embed/${match[1]}/${match[2]}`,
        listenUrl: url,
      };
    }
  }

  return { uri: undefined, embedUrl: undefined, listenUrl: url };
}

function releaseFromEntity(row: PublishedEntityRow): PublicRelease | null {
  if (!isRecord(row.payload)) return null;
  const title = stringValue(row.payload.title);
  const artistName = stringValue(row.payload.artist_name);
  const artistSlug = stringValue(row.payload.artist_slug);
  const releaseDate = stringValue(row.payload.release_date);
  if (!title || !artistName || !artistSlug) return null;

  const tracks: PublicTrack[] = Array.isArray(row.payload.tracks)
    ? row.payload.tracks.flatMap((value, index) => {
        if (!isRecord(value)) return [];
        const trackTitle = stringValue(value.title);
        if (!trackTitle) return [];
        return [
          {
            number: numberValue(value.number) ?? index + 1,
            title: trackTitle,
            duration: durationLabel(value.duration_seconds),
            spotifyUri: stringValue(value.spotify_uri),
          },
        ];
      })
    : [];
  const credits: PublicReleaseCredit[] = Array.isArray(row.payload.credits)
    ? row.payload.credits.flatMap((value) => {
        if (!isRecord(value)) return [];
        const name = stringValue(value.name);
        const role = stringValue(value.role);
        return name && role ? [{ name, role }] : [];
      })
    : [];

  const spotify = spotifyIdentity(row.payload);
  const releaseType = stringValue(row.payload.release_type);
  const format =
    stringValue(row.payload.format_label) ??
    (releaseType === "ep"
      ? "EP"
      : releaseType === "album"
        ? "Album"
        : releaseType === "single"
          ? "Single"
          : "Release");
  const displayDate =
    stringValue(row.payload.display_date) ??
    (releaseDate
      ? new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "long",
          timeZone: "UTC",
          year: "numeric",
        }).format(new Date(`${releaseDate}T12:00:00Z`))
      : undefined);
  const listenUrl =
    spotify.listenUrl ??
    safePublicUrl(row.payload.presave_link) ??
    safePublicUrl(row.payload.disco_link) ??
    safePublicUrl(row.payload.apple_url) ??
    safePublicUrl(row.payload.bandcamp_url) ??
    "#";

  return {
    slug: row.slug,
    artistSlug,
    artistName,
    title,
    year: releaseDate
      ? Number(releaseDate.slice(0, 4))
      : new Date().getUTCFullYear(),
    format,
    tracks,
    listenUrl,
    spotifyUri: spotify.uri,
    embedUrl: spotify.embedUrl,
    coverImage: safeImageUrl(row.payload.cover_image),
    coverImageAlt:
      stringValue(row.payload.cover_image_alt) ??
      `${title} artwork by ${artistName}`,
    credits,
    displayDate,
    description: stringValue(row.payload.description),
    releaseType,
    status: row.payload.status === "released" ? "released" : "forthcoming",
    videoUrl: safePublicUrl(row.payload.youtube_url),
  };
}

function showFromEntity(row: PublishedEntityRow): PublicShow | null {
  if (!isRecord(row.payload)) return null;
  const date = stringValue(row.payload.date);
  const artistName = stringValue(row.payload.artist_name);
  const artistSlug = stringValue(row.payload.artist_slug);
  if (!date || !artistName || !artistSlug) return null;

  return {
    slug: row.slug,
    artistSlug,
    artistName,
    date,
    venueName: stringValue(row.payload.venue_name) ?? "Venue to be announced",
    cityState: stringValue(row.payload.city_state) ?? "",
    doorsTime: stringValue(row.payload.doors_time),
    showTime: stringValue(row.payload.show_time),
    ticketUrl: safePublicUrl(row.payload.ticket_url),
    ticketPriceCents: numberValue(row.payload.ticket_price_cents),
    note: stringValue(row.payload.note),
  };
}

function serviceFromEntity(row: PublishedEntityRow): PublicService | null {
  if (!isRecord(row.payload)) return null;
  const title = boundedString(row.payload.title, 160);
  if (!title) return null;

  const content = isRecord(row.payload.content) ? row.payload.content : {};
  return {
    capabilities: boundedStringArray(content.capabilities, 3, 180),
    introduction: boundedString(row.payload.body, 600),
    slug: row.slug,
    sortOrder: row.sort_order,
    statement: boundedString(content.statement, 320),
    title,
  };
}

function storeProductFromEntity(
  row: PublishedEntityRow,
): PublicStoreProduct | null {
  if (!isRecord(row.payload)) return null;
  const artistName = boundedString(row.payload.artist_name, 160);
  const artistSlug = boundedString(row.payload.artist_slug, 120);
  const category = boundedString(row.payload.category, 40);
  const currency = boundedString(row.payload.currency, 3)?.toLowerCase();
  const description = boundedString(row.payload.description, 320);
  const image = safeImageUrl(row.payload.image_url);
  const name = boundedString(row.payload.name, 160);
  const priceCents = numberValue(row.payload.price_cents);
  if (
    !artistName ||
    !artistSlug ||
    !description ||
    !image ||
    !name ||
    priceCents === undefined ||
    !Number.isInteger(priceCents) ||
    priceCents <= 0 ||
    !currency ||
    !["records", "wear", "objects"].includes(category ?? "") ||
    row.payload.status !== "active"
  ) {
    return null;
  }

  return {
    artistName,
    artistSlug,
    badge: boundedString(row.payload.badge, 80),
    category: category as PublicStoreProduct["category"],
    currency,
    description,
    image,
    name,
    priceCents,
    releaseSlug: boundedString(row.payload.release_slug, 120),
    slug: row.slug,
  };
}

const queryPublishedEntities = unstable_cache(
  async (): Promise<PublishedEntityQuery> => {
    try {
      const { url, publishableKey } = getSupabaseEnvironment();
      const supabase = createClient(url, publishableKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error } = await supabase
        .from("published_entities")
        .select("entity_type, payload, slug, sort_order")
        .eq("visibility", "published")
        .order("sort_order", { ascending: true });

      if (error) return { available: false, rows: [] };
      return {
        available: true,
        rows: (data ?? []) as PublishedEntityRow[],
      };
    } catch {
      return { available: false, rows: [] };
    }
  },
  ["wbr-public-mirror-v1"],
  { revalidate: 30, tags: ["public-mirror"] },
);

function curatedFallback(): PublicSiteData {
  return {
    artists: [...publicArtists],
    editorial: [],
    releases: [...publicReleases],
    playableReleases: [...playablePublicReleases],
    products: [],
    services: [],
    tourDates: [...publicTourDates],
    source: "curated-fallback",
  };
}

export async function getPublicSiteData(): Promise<PublicSiteData> {
  const query = await queryPublishedEntities();
  if (!query.available) return curatedFallback();

  const artists = query.rows
    .filter((row) => row.entity_type === "artist_profile")
    .map(artistFromEntity)
    .filter((artist): artist is PublicArtist => artist !== null);
  const editorial = query.rows
    .filter((row) => row.entity_type === "studio_update")
    .map(parsePublicEditorialItem)
    .filter((item): item is PublicEditorialItem => item !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const releases = query.rows
    .filter((row) => row.entity_type === "release")
    .map(releaseFromEntity)
    .filter((release): release is PublicRelease => release !== null);
  const tourDates = query.rows
    .filter((row) => row.entity_type === "show_date")
    .map(showFromEntity)
    .filter((show): show is PublicShow => show !== null);
  const services = query.rows
    .filter((row) => row.entity_type === "service")
    .map(serviceFromEntity)
    .filter((service): service is PublicService => service !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const products = query.rows
    .filter((row) => row.entity_type === "store_product")
    .map(storeProductFromEntity)
    .filter((product): product is PublicStoreProduct => product !== null);
  const playableReleases = releases.filter(
    (release): release is PlayablePublicRelease =>
      Boolean(
        release.coverImage &&
        release.embedUrl &&
        release.spotifyUri &&
        release.tracks.length &&
        release.tracks.every((track) => track.spotifyUri),
      ),
  );

  return {
    artists,
    editorial,
    releases,
    playableReleases,
    products,
    services,
    tourDates,
    source: "mirror",
  };
}

export async function getPublicArtistDetail(
  slug: string,
): Promise<PublicArtistDetail | null> {
  const site = await getPublicSiteData();
  const artist = site.artists.find((entry) => entry.slug === slug);
  if (!artist) return null;

  const query = await queryPublishedEntities();
  if (!query.available) {
    const releases = site.releases.filter(
      (release) => release.artistSlug === slug,
    );
    const images = artist.image
      ? [
          {
            altText: artist.imageAlt,
            imageType: "portrait" as const,
            sortOrder: 0,
            url: artist.image,
          },
        ]
      : [];
    return {
      artist,
      gear: [],
      hasPublicPressMaterials: Boolean(images.length || releases.length),
      images,
      longBiography: undefined,
      releases,
      stagePlots: [],
    };
  }

  const entity = query.rows.find(
    (row) => row.entity_type === "artist_profile" && row.slug === slug,
  );
  const payload = entity && isRecord(entity.payload) ? entity.payload : {};
  const images: PublicArtistImage[] = Array.isArray(payload.images)
    ? payload.images.flatMap((value) => {
        if (!isRecord(value)) return [];
        const url = safeImageUrl(value.url);
        const imageType = stringValue(value.image_type);
        if (
          !url ||
          !imageType ||
          !["portrait", "live", "studio", "landscape", "press"].includes(
            imageType,
          )
        ) {
          return [];
        }
        return [
          {
            altText: stringValue(value.alt_text),
            imageType: imageType as PublicArtistImage["imageType"],
            sortOrder: numberValue(value.sort_order) ?? 0,
            url,
          },
        ];
      })
    : [];
  if (!images.length && artist.image) {
    images.push({
      altText: artist.imageAlt,
      imageType: "portrait",
      sortOrder: 0,
      url: artist.image,
    });
  }

  const stagePlots: PublicStagePlot[] = Array.isArray(payload.stage_plots)
    ? payload.stage_plots.flatMap((value) => {
        if (!isRecord(value)) return [];
        return [
          {
            name: stringValue(value.name) ?? "Stage plot",
            stageLayout: stringValue(value.stage_layout),
            powerRequirements: stringValue(value.power_requirements),
            specialNeeds: stringValue(value.special_needs),
            plotDiagramUrl: safePublicUrl(value.plot_diagram_url),
            inputListPdfUrl: safePublicUrl(value.input_list_pdf_url),
          },
        ];
      })
    : [];

  const gear: PublicGearItem[] = Array.isArray(payload.gear)
    ? payload.gear.flatMap((value) => {
        if (!isRecord(value)) return [];
        const name = stringValue(value.name);
        if (!name) return [];
        return [
          {
            name,
            category: stringValue(value.category) ?? "gear",
            brand: stringValue(value.brand),
            model: stringValue(value.model),
          },
        ];
      })
    : [];

  const releases = site.releases.filter(
    (release) => release.artistSlug === slug,
  );
  const longBiography = stringValue(payload.bio_long);

  return {
    artist,
    bookingEmail: stringValue(payload.booking_email),
    gear,
    hasPublicPressMaterials: Boolean(
      stringValue(payload.booking_email) ||
      gear.length ||
      images.length ||
      releases.length ||
      stagePlots.length,
    ),
    images,
    longBiography,
    releases,
    stagePlots,
  };
}
