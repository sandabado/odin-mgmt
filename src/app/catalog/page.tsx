import type { Metadata } from "next";
import Image from "next/image";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { MuseumReleasePlayer } from "@/components/whole-body-records/MuseumReleasePlayer";
import { RecordsGeometryDivider } from "@/components/whole-body-records/RecordsGeometryDivider";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import type {
  PlayablePublicRelease,
  PublicRelease,
} from "@/lib/public-catalog";
import { getPublicSiteData } from "@/lib/public-mirror";

export const metadata: Metadata = {
  title: "Catalog — Whole Body Records",
  description:
    "The complete artist-approved release catalog from Whole Body Records.",
  alternates: { canonical: "/catalog" },
};

export const revalidate = 30;

interface CatalogReleaseProps {
  featured?: boolean;
  playable?: PlayablePublicRelease;
  release: PublicRelease;
}

function CatalogRelease({
  featured = false,
  playable,
  release,
}: CatalogReleaseProps) {
  const releaseId = release.slug ?? `${release.artistSlug}-${release.year}`;

  return (
    <>
      <section
        className="museum-release-detail"
        data-records-reveal=""
        id={releaseId}
      >
        <div className="museum-album-frame">
          {release.coverImage ? (
            <Image
              alt={
                release.coverImageAlt ??
                `${release.title} album artwork by ${release.artistName}`
              }
              fill
              priority={featured}
              sizes="(max-width: 820px) 88vw, 44vw"
              src={release.coverImage}
            />
          ) : (
            <span className="museum-palo__art" aria-hidden="true" />
          )}
          <span>
            {release.artistName} · {release.title} · {release.year}
          </span>
        </div>

        <div>
          <p className="records-index">
            {featured
              ? "Featured catalog exhibition"
              : release.status === "released"
                ? "Released catalog"
                : "Forthcoming release"}
          </p>
          <p className="records-kicker">{release.artistName}</p>
          <h2>{release.title}</h2>
          <p className="museum-release-date">
            {release.format}
            {release.displayDate ? ` · ${release.displayDate}` : ""}
          </p>
          {release.description ? <p>{release.description}</p> : null}

          {release.tracks.length ? (
            <ol
              aria-label={`${release.title} tracklist`}
              className="museum-release-tracklist"
            >
              {release.tracks.map((track) => (
                <li key={`${track.number}-${track.title}`}>
                  <span>{String(track.number).padStart(2, "0")}</span>
                  <strong>{track.title}</strong>
                  <time>{track.duration}</time>
                </li>
              ))}
            </ol>
          ) : (
            <div className="museum-empty-plaque">
              <span>Catalog record</span>
              <p>No artist-approved tracklist is currently published.</p>
            </div>
          )}

          {release.credits?.length ? (
            <dl className="museum-release-credits">
              {release.credits.map((credit) => (
                <div key={`${credit.role}-${credit.name}`}>
                  <dt>{credit.role}</dt>
                  <dd>{credit.name}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {release.listenUrl && release.listenUrl !== "#" && !playable ? (
            <a
              className="records-catalog-link"
              href={release.listenUrl}
              rel="noreferrer"
              target="_blank"
            >
              {release.status === "released" ? "Listen" : "Explore release"}{" "}
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </section>

      {release.status === "released" && playable ? (
        <section className="museum-collection" data-records-reveal="">
          <MuseumReleasePlayer
            headingId={`catalog-${releaseId}-player-title`}
            release={playable}
            sectionId={`listen-${releaseId}`}
          />
        </section>
      ) : null}

      <RecordsGeometryDivider tone={featured ? "paper" : "deep"} />
    </>
  );
}

export default async function CatalogPage() {
  const { playableReleases, releases } = await getPublicSiteData();
  const featured =
    releases.find((release) => release.slug === "infinity-love") ??
    releases.find((release) => release.status === "forthcoming") ??
    releases[0];
  const orderedReleases = featured
    ? [featured, ...releases.filter((release) => release !== featured)]
    : releases;
  const playableByRelease = new Map(
    playableReleases.map((release) => [
      `${release.artistSlug}:${release.slug ?? release.title}`,
      release,
    ]),
  );

  return (
    <RecordsPageShell activeNav="catalog" route="catalog">
      <MuseumPageHero
        description="Every artist-approved release in one living collection. Released records open for listening when their public identities are verified."
        eyebrow="The complete collection"
        title={
          <>
            The catalog,
            <br />
            <em>held in full.</em>
          </>
        }
      />

      <RecordsGeometryDivider tone="deep" />

      {orderedReleases.length ? (
        orderedReleases.map((release, index) => (
          <CatalogRelease
            featured={index === 0}
            key={`${release.artistSlug}-${release.slug ?? release.title}`}
            playable={playableByRelease.get(
              `${release.artistSlug}:${release.slug ?? release.title}`,
            )}
            release={release}
          />
        ))
      ) : (
        <>
          <section className="museum-catalog-boundary" data-records-reveal="">
            <p className="records-kicker">The catalog</p>
            <h2>No artist-approved releases are currently on display.</h2>
            <p>The collection opens only after publication approval.</p>
          </section>
          <RecordsGeometryDivider tone="deep" />
        </>
      )}
    </RecordsPageShell>
  );
}
