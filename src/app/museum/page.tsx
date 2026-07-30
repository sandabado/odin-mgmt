import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MuseumReleasePlayer } from "@/components/whole-body-records/MuseumReleasePlayer";
import { RecordsFlowMark } from "@/components/whole-body-records/RecordsFlowMark";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { WaterFlowTransition } from "@/components/whole-body-records/WaterFlowTransition";
import { type PlayablePublicRelease } from "@/lib/public-catalog";
import { getPublicSiteData } from "@/lib/public-mirror";

export const metadata: Metadata = {
  title: "Museum Archive — Whole Body Records",
  description:
    "A living collection of artists, records, and the work held around the work.",
  applicationName: "Whole Body Records",
  alternates: { canonical: "/museum" },
  robots: { follow: false, index: false },
};

export const revalidate = 30;

export default async function MuseumArchivePage() {
  const { artists, playableReleases, releases } = await getPublicSiteData();
  const featuredArtist =
    artists.find((artist) => artist.slug === "sandabado") ?? artists[0];
  const secondaryArtist = artists.find(
    (artist) => artist.slug !== featuredArtist?.slug,
  );
  const featuredRelease =
    releases.find((release) => release.slug === "infinity-love") ??
    releases.find((release) => release.status === "forthcoming") ??
    releases[0];
  const catalogRelease =
    releases.find((release) => release.slug === "333") ??
    releases.find((release) => release.status === "released");
  const playableCatalog = catalogRelease
    ? playableReleases.find(
        (release) =>
          release.slug === catalogRelease.slug &&
          release.artistSlug === catalogRelease.artistSlug,
      )
    : undefined;

  return (
    <>
      <RecordsPageShell continuousWater overlayHeader route="home">
      <div aria-hidden="true" className="records-home-depth">
        <span />
        <span />
        <span />
      </div>
      <section className="records-hero museum-entrance">
        <div className="records-hero__veil" aria-hidden="true" />
        <div className="records-hero__spectrum" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="records-hero__content">
          <RecordsFlowMark className="records-hero__flow-mark" decorative />
          <h1>
            Whole Body
            <br />
            <em>Records</em>
          </h1>
          <p className="records-hero__music-line">Music lives here.</p>
          <p className="records-hero__line">
            <strong>Water flows for all.</strong>
          </p>
          <div className="records-actions">
            <a
              className="records-button records-button--solid"
              href="#listen-333"
            >
              Hear the music <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      <WaterFlowTransition current="cyan" />

      {featuredArtist && featuredRelease ? (
        <section
          className="museum-featured"
          data-records-reveal=""
          id="featured"
        >
          <div className="museum-featured__copy">
            <p className="records-index">Room 02 / Featured exhibition</p>
            <p className="records-kicker">Whole Body Records presents</p>
            <h2>
              {featuredArtist.name}
              <br />
              <em>{featuredRelease.title}</em>
            </h2>
            <p className="museum-release-date">
              {featuredRelease.format}
              {featuredRelease.displayDate
                ? ` · ${featuredRelease.displayDate}`
                : ""}
            </p>
            {featuredRelease.description ? (
              <p>{featuredRelease.description}</p>
            ) : null}
            <div className="museum-featured__links">
              <Link
                className="records-catalog-link"
                href={`/catalog#${featuredRelease.slug ?? "featured-release"}`}
              >
                View the {featuredRelease.tracks.length}-track album{" "}
                <span aria-hidden="true">→</span>
              </Link>
              {featuredRelease.slug === "infinity-love" ? (
                <Link className="records-catalog-link" href="/store">
                  Carry the ∞ LOVE collection <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </div>
          <Link
            aria-label={`Explore ${featuredArtist.name}’s ${featuredRelease.title}`}
            className="museum-album-frame"
            href={`/catalog#${featuredRelease.slug ?? "featured-release"}`}
          >
            {(featuredRelease.coverImage ?? featuredArtist.image) ? (
              <Image
                alt={
                  featuredRelease.coverImageAlt ??
                  `${featuredRelease.title} album artwork`
                }
                fill
                priority
                sizes="(max-width: 820px) 88vw, 48vw"
                src={featuredRelease.coverImage ?? featuredArtist.image ?? ""}
              />
            ) : (
              <span className="museum-palo__art" aria-hidden="true" />
            )}
            <span>
              {featuredArtist.name} · {featuredRelease.title} ·{" "}
              {featuredRelease.year}
            </span>
          </Link>
        </section>
      ) : (
        <section className="museum-studio" data-records-reveal="">
          <div>
            <p className="records-index">Room 02 / Featured exhibition</p>
            <h2>The next work enters by consent.</h2>
          </div>
          <div className="museum-empty-plaque">
            <span>Publication boundary active</span>
            <p>No artist-approved featured release is currently on display.</p>
          </div>
        </section>
      )}

      <WaterFlowTransition current="gold" />

      <section
        className="museum-collection museum-collection--turntable"
        data-records-reveal=""
        id="collection"
      >
        <div className="museum-room-heading">
          <div>
            <p className="records-index">Room 03 / The collection</p>
            <p className="records-kicker">
              {catalogRelease
                ? `${catalogRelease.artistName} · ${catalogRelease.title} · ${catalogRelease.year}`
                : "Released catalog"}
            </p>
          </div>
          <h2>
            {catalogRelease
              ? `${catalogRelease.tracks.length} ${
                  catalogRelease.tracks.length === 1 ? "song" : "songs"
                }.`
              : "Released work."}
            <br />
            <em>One open current.</em>
          </h2>
          <p>Released work, displayed as it exists in the world.</p>
        </div>
        {!catalogRelease ? (
          <div className="museum-empty-plaque">
            <span>Catalog held</span>
            <p>No artist-approved released work is currently published.</p>
          </div>
        ) : null}
        {playableCatalog ? (
          <MuseumReleasePlayer
            headingId="home-333-player-title"
            presentation="immersive"
            release={playableCatalog as PlayablePublicRelease}
            sectionId="listen-333"
          />
        ) : null}
      </section>

      <WaterFlowTransition current="violet" />

      {secondaryArtist ? (
        <section className="museum-palo" data-records-reveal="">
          <div className="museum-palo__art" aria-hidden="true">
            <span />
            <span />
            <span />
            <i />
          </div>
          <div className="museum-palo__copy">
            <p className="records-index">Room 04 / Also on display</p>
            <p className="records-kicker">Artist 002</p>
            <h2>{secondaryArtist.name}</h2>
            <p>{secondaryArtist.description}</p>
            <p className="museum-honesty-note">
              The frame is held open. Public work enters this room only with the
              artist&apos;s approval.
            </p>
            <Link
              className="records-catalog-link"
              href={`/artists/${secondaryArtist.slug}`}
            >
              View the exhibition <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      ) : null}

      <WaterFlowTransition current="cyan" />

      <section className="museum-studio" data-records-reveal="">
        <div>
          <p className="records-index">Room 05 / From the studio</p>
          <p className="records-kicker">The work before the world</p>
          <h2>
            Held in confidence.
            <br />
            <em>Shared by consent.</em>
          </h2>
        </div>
        <div className="museum-empty-plaque">
          <span>Studio archive</span>
          <p>
            Session notes enter the museum only after the artist approves them
            for public display.
          </p>
          <small>No approved studio notes are published.</small>
        </div>
      </section>

      <WaterFlowTransition current="gold" />

      <section className="museum-tour-room" data-records-reveal="">
        <div>
          <p className="records-index">Room 06 / What&apos;s next</p>
          <p className="records-kicker">The road</p>
          <h2>
            The room opens
            <br />
            <em>when the date is real.</em>
          </h2>
        </div>
        <div>
          <p>
            Public dates appear only after the artist confirms them. Internal
            holds and negotiations stay inside ØDIN.
          </p>
          <Link className="records-catalog-link" href="/tour">
            Visit the tour room <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <WaterFlowTransition current="violet" />

      <section
        className="records-home-invitation"
        data-records-reveal=""
        id="submit"
      >
        <div className="records-submit__copy">
          <p className="records-index">Room 07 / Join the current</p>
          <p className="records-kicker">Management begins with listening</p>
          <h2>
            Bring the work.
            <br />
            <em>We&apos;ll meet it there.</em>
          </h2>
          <p>
            The full submission room now lives on its own page, with space to
            share the music and the support you&apos;re looking for.
          </p>
          <p className="records-submit__promise">
            No mass emails. No generic templates. Human review.
          </p>
          <Link className="records-button records-button--solid" href="/submit">
            Enter the submission room <span aria-hidden="true">→</span>
          </Link>
          <Link className="records-catalog-link" href="/services">
            See how we support the work <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="records-home-invitation__well" aria-hidden="true">
          <span />
          <span />
          <span />
          <RecordsFlowMark
            className="records-home-invitation__mark"
            decorative
          />
        </div>
      </section>

      <WaterFlowTransition current="cyan" />
      </RecordsPageShell>
    </>
  );
}
