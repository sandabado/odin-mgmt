import type { PublicRelease, PublicShow } from "@/lib/public-catalog";
import type {
  PublicEditorialItem,
  PublicEditorialKind,
} from "@/lib/public-editorial";

export type RecordsLabelSlideKind = PublicEditorialKind;

export interface RecordsLabelSlide {
  action: string;
  external?: boolean;
  href: string;
  id: string;
  image: string;
  kind: RecordsLabelSlideKind;
  meta: string;
  summary: string;
  title: string;
  visual: "image" | "watershed";
}

interface RecordsLabelCurrentInput {
  editorial?: PublicEditorialItem[];
  releases: PublicRelease[];
  tourDates: PublicShow[];
}

const heroArt = {
  confluence: "/images/backgrounds/hero-options/wbr-hero-01-confluence.png",
  record: "/images/backgrounds/hero-options/wbr-hero-02-record-watershed.png",
  signal: "/images/backgrounds/hero-options/wbr-hero-03-voices-wave.png",
  worlds: "/images/backgrounds/hero-options/wbr-hero-04-artist-archipelago.png",
  return: "/images/backgrounds/hero-options/wbr-hero-05-source-return.png",
} as const;

function publicDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function buildRecordsLabelCurrent({
  editorial = [],
  releases,
  tourDates,
}: RecordsLabelCurrentInput): RecordsLabelSlide[] {
  const featuredRelease =
    releases.find((release) => release.slug === "infinity-love") ??
    releases.find((release) => release.status === "forthcoming") ??
    releases[0];
  const latestVideo = releases.find((release) => release.videoUrl);
  const today = new Date().toISOString().slice(0, 10);
  const nextShow = [...tourDates]
    .filter((show) => show.date >= today)
    .sort((left, right) => left.date.localeCompare(right.date))[0];

  const slides: RecordsLabelSlide[] = [];

  if (featuredRelease) {
    const releaseId =
      featuredRelease.slug ??
      `${featuredRelease.artistSlug}-${featuredRelease.year}`;
    slides.push({
      action:
        featuredRelease.status === "released"
          ? "Listen to the record"
          : "Enter the release",
      href: `/catalog#${releaseId}`,
      id: `release-${releaseId}`,
      image: heroArt.record,
      kind: "release",
      meta: [
        featuredRelease.artistName,
        featuredRelease.displayDate ?? String(featuredRelease.year),
      ].join(" · "),
      summary:
        featuredRelease.description ??
        "The newest artist-approved release in the Whole Body Records current.",
      title: featuredRelease.title,
      visual: "watershed",
    });
  } else {
    slides.push({
      action: "Explore the catalog",
      href: "/catalog",
      id: "record-watershed",
      image: heroArt.record,
      kind: "label",
      meta: "Many voices · one whole body",
      summary:
        "Artists hold the source. Records gather the current. Listeners carry it forward.",
      title: "Record Watershed",
      visual: "watershed",
    });
  }

  if (latestVideo?.videoUrl) {
    slides.push({
      action: "Watch the latest film",
      external: true,
      href: latestVideo.videoUrl,
      id: `video-${latestVideo.slug ?? latestVideo.title}`,
      image: heroArt.signal,
      kind: "video",
      meta: `${latestVideo.artistName} · moving image`,
      summary:
        latestVideo.description ??
        "The latest artist-approved film in the public label current.",
      title: latestVideo.title,
      visual: "image",
    });
  }

  const editorialArt: Partial<Record<PublicEditorialKind, string>> = {
    article: heroArt.confluence,
    campaign: heroArt.return,
    livestream: heroArt.signal,
    news: heroArt.confluence,
    promo: heroArt.return,
    video: heroArt.signal,
  };
  const editorialCurrent = editorial
    .filter(
      (entry) =>
        ["article", "campaign", "livestream", "news", "promo", "video"].includes(
          entry.kind,
        ) &&
        !(entry.kind === "livestream" && entry.liveStatus === "ended") &&
        entry.href !== latestVideo?.videoUrl,
    )
    .slice(0, 5);

  editorialCurrent.forEach((entry) => {
    slides.push({
      action: entry.actionLabel,
      external: entry.external,
      href: entry.href,
      id: `current-${entry.slug}`,
      image: entry.image ?? editorialArt[entry.kind] ?? heroArt.confluence,
      kind: entry.kind,
      meta:
        entry.meta ??
        (entry.kind === "livestream" && entry.liveStatus
          ? entry.liveStatus
          : "Artist-approved current"),
      summary: entry.summary,
      title: entry.title,
      visual: "image",
    });
  });

  if (nextShow) {
    slides.push({
      action: "Open the confirmed date",
      href: `/tour#${nextShow.slug}`,
      id: `tour-${nextShow.slug}`,
      image: heroArt.worlds,
      kind: "tour",
      meta: [publicDate(nextShow.date), nextShow.cityState]
        .filter(Boolean)
        .join(" · "),
      summary:
        nextShow.note ??
        "A public date enters the current only after the artist confirms the room.",
      title: `${nextShow.artistName} · ${nextShow.venueName}`,
      visual: "image",
    });
  }

  slides.push(
    {
      action: "See how the label works",
      href: "/management",
      id: "odin-management",
      image: heroArt.confluence,
      kind: "management",
      meta: "Private engine · human decisions",
      summary:
        "The label's artists, records, campaigns, bookings, rights, and revenue stay connected inside one protected operating system.",
      title: "ØDIN Management",
      visual: "image",
    },
    {
      action: "Open the licensing current",
      href: "/sync",
      id: "sync-licensing",
      image: heroArt.signal,
      kind: "sync",
      meta: "Music for picture · artist approval",
      summary:
        "Film, television, games, and aligned collaborations can meet the catalog without separating the work from its makers.",
      title: "Sync licensing",
      visual: "image",
    },
    {
      action: "Begin a partner conversation",
      href: "/partners",
      id: "label-partners",
      image: heroArt.worlds,
      kind: "partner",
      meta: "Supervisors · venues · makers · media",
      summary:
        "Bring the opportunity, the room, or the missing piece. A person on the label side will review what you send.",
      title: "Build with the label",
      visual: "image",
    },
    {
      action: "Pitch one song",
      href: "/art-of-the-song",
      id: "art-of-the-song",
      image: heroArt.return,
      kind: "pitch",
      meta: "One song · full context · human review",
      summary:
        "Send one extraordinary song and tell us where it belongs. No automated acceptance. No surrender of the work.",
      title: "Art of the Song",
      visual: "image",
    },
  );

  return slides;
}
