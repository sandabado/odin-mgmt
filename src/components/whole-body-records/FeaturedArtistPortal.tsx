import Image from "next/image";
import Link from "next/link";
import type { PublicStoreProduct } from "@/lib/commerce/catalog";
import type {
  PublicArtist,
  PublicRelease,
  PublicShow,
} from "@/lib/public-catalog";
import styles from "./FeaturedArtistPortal.module.css";

export interface FeaturedArtistEditorial {
  actionLabel: string;
  artistSlug?: string;
  external: boolean;
  href: string;
  image?: string;
  imageAlt?: string;
  kind: string;
  meta?: string;
  slug: string;
  summary: string;
  title: string;
}

interface FeaturedArtistPortalProps {
  artist?: PublicArtist;
  editorial?: FeaturedArtistEditorial[];
  featuredRelease?: PublicRelease;
  products?: PublicStoreProduct[];
  releases?: PublicRelease[];
  shows?: PublicShow[];
}

interface PortalCardProps {
  action: string;
  alt: string;
  description: string;
  href: string;
  image?: string;
  meta: string;
  title: string;
}

interface CurrentCardProps {
  action: string;
  description: string;
  external?: boolean;
  href: string;
  meta: string;
  title: string;
}

function CurrentCard({
  action,
  description,
  external = false,
  href,
  meta,
  title,
}: CurrentCardProps) {
  const content = (
    <>
      <span>
        <small>{meta}</small>
        <strong>{title}</strong>
      </span>
      <span className={styles.currentDetail}>{description}</span>
      <b>
        {action} <i aria-hidden="true">→</i>
      </b>
    </>
  );

  return external ? (
    <a
      className={styles.currentCard}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {content}
    </a>
  ) : (
    <Link className={styles.currentCard} href={href}>
      {content}
    </Link>
  );
}

function publicDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
}

function PortalCard({
  action,
  alt,
  description,
  href,
  image,
  meta,
  title,
}: PortalCardProps) {
  return (
    <Link className={styles.card} href={href}>
      <span className={styles.media}>
        {image ? (
          <Image
            alt={alt}
            fill
            sizes="(max-width: 860px) 82vw, 25vw"
            src={image}
          />
        ) : (
          <span className={styles.heldMedia}>Image held by consent</span>
        )}
        <span aria-hidden="true" className={styles.imageVeil} />
      </span>
      <span className={styles.copy}>
        <small>{meta}</small>
        <strong>{title}</strong>
        <span>{description}</span>
        <b>
          {action} <i aria-hidden="true">→</i>
        </b>
      </span>
    </Link>
  );
}

function StoryCard({
  artist,
  entry,
}: {
  artist?: PublicArtist;
  entry?: FeaturedArtistEditorial;
}) {
  const image =
    entry?.image ?? artist?.featureImages?.story?.src ?? artist?.image;
  const content = (
    <>
      <span className={styles.media}>
        {image ? (
          <Image
            alt={
              entry?.imageAlt ??
              artist?.featureImages?.story?.alt ??
              artist?.imageAlt ??
              `${artist?.name ?? "Featured artist"} story image`
            }
            fill
            sizes="(max-width: 860px) 82vw, 25vw"
            src={image}
          />
        ) : (
          <span className={styles.heldMedia}>Story image held</span>
        )}
        <span aria-hidden="true" className={styles.imageVeil} />
      </span>
      <span className={styles.copy}>
        <small>Story · {entry?.meta ?? "Public press room"}</small>
        <strong>{entry?.title ?? "The artist, in full."}</strong>
        <span>
          {entry?.summary ??
            "Biography, approved imagery, releases, and the story behind the work."}
        </span>
        <b>
          {entry?.actionLabel ?? "Read the artist story"}{" "}
          <i aria-hidden="true">→</i>
        </b>
      </span>
    </>
  );

  if (entry?.external) {
    return (
      <a
        className={styles.card}
        href={entry.href}
        rel="noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      className={styles.card}
      href={
        entry?.href ?? (artist ? `/artists/${artist.slug}/press` : "/artists")
      }
    >
      {content}
    </Link>
  );
}

export function FeaturedArtistPortal({
  artist,
  editorial = [],
  featuredRelease,
  products = [],
  releases = [],
  shows = [],
}: FeaturedArtistPortalProps) {
  const artistHref = artist ? `/artists/${artist.slug}` : "/submit";
  const artistReleases = artist
    ? releases.filter((entry) => entry.artistSlug === artist.slug)
    : releases;
  const release =
    featuredRelease ??
    artistReleases.find((entry) => entry.status === "forthcoming") ??
    artistReleases[0];
  const releaseHref = release?.slug ? `/catalog#${release.slug}` : "/catalog";
  const story = editorial.find(
    (entry) =>
      entry.artistSlug === artist?.slug &&
      ["article", "news"].includes(entry.kind),
  );
  const product = artist
    ? products.find((entry) => entry.artistSlug === artist.slug)
    : products[0];
  const campaign = editorial.find(
    (entry) =>
      entry.artistSlug === artist?.slug &&
      ["campaign", "promo"].includes(entry.kind),
  );
  const nextShow = shows
    .filter((entry) => entry.artistSlug === artist?.slug)
    .sort((left, right) => left.date.localeCompare(right.date))[0];

  return (
    <article className={styles.portal}>
      <p className={styles.cue}>
        <span>Four ways into the artist world</span>
        <span>
          Swipe <b aria-hidden="true">→</b>
        </span>
      </p>

      <div
        aria-label="Artist world: Artist, Album, Story, Merch"
        className={styles.grid}
        tabIndex={0}
      >
        <PortalCard
          action="Enter artist room"
          alt={
            artist?.imageAlt ?? `${artist?.name ?? "Featured artist"} portrait`
          }
          description={
            artist?.location
              ? `${artist.location} · Portrait, records, and public activity.`
              : "Portrait, records, and public activity."
          }
          href={artistHref}
          image={artist?.image}
          meta="Artist · Full world"
          title={artist?.name ?? "The next artist"}
        />

        <PortalCard
          action="Open record"
          alt={
            release?.coverImageAlt ??
            `${release?.title ?? "Featured album"} artwork`
          }
          description={String(
            release?.displayDate ?? release?.year ?? "Artist-approved release",
          )}
          href={releaseHref}
          image={release?.coverImage}
          meta={`Album · ${release?.format ?? "Artist-approved work"}`}
          title={release?.title ?? "Work held by consent"}
        />

        <StoryCard artist={artist} entry={story} />

        <PortalCard
          action="Enter the collection"
          alt={`${product?.name ?? "Artist edition"} by ${product?.artistName ?? artist?.name ?? "the featured artist"}`}
          description={
            product?.description ??
            "Artist-approved editions from the current release world."
          }
          href="/store#collection"
          image={product?.image}
          meta="Merch · Artist edition"
          title={product?.name ?? "Artist editions"}
        />
      </div>

      <div
        aria-label="Artist campaign and tour current"
        className={styles.currentStrip}
      >
        <CurrentCard
          action={campaign?.actionLabel ?? "Enter the release"}
          description={
            campaign?.summary ??
            `Follow the artist-approved public release current${release?.displayDate ? ` through ${release.displayDate}` : ""}.`
          }
          external={campaign?.external}
          href={campaign?.href ?? releaseHref}
          meta={`Campaign · ${campaign?.meta ?? "Release world"}`}
          title={
            campaign?.title ??
            `${release?.title ?? "The next record"} is approaching.`
          }
        />

        <CurrentCard
          action={nextShow?.ticketUrl ? "Open tickets" : "All dates"}
          description={
            nextShow
              ? `${nextShow.venueName} · ${nextShow.cityState}`
              : "No date crosses the public boundary until it is confirmed."
          }
          external={Boolean(nextShow?.ticketUrl)}
          href={nextShow?.ticketUrl ?? "/tour"}
          meta={
            nextShow
              ? `Tour · ${publicDate(nextShow.date)}`
              : "Tour · Confirmed public dates"
          }
          title={
            nextShow
              ? "Meet the work in the room."
              : "The road opens by consent."
          }
        />
      </div>
    </article>
  );
}
