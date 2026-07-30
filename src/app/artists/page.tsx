import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsGeometryDivider } from "@/components/whole-body-records/RecordsGeometryDivider";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { getPublicSiteData } from "@/lib/public-mirror";

export const metadata: Metadata = {
  title: "Artists — Whole Body Records",
  description: "The artists held in the Whole Body Records collection.",
  alternates: { canonical: "/artists" },
};

export const revalidate = 30;

export default async function ArtistsPage() {
  const { artists } = await getPublicSiteData();
  const collectionDescription = artists.length
    ? `${artists.length} ${artists.length === 1 ? "artist" : "artists"}. Distinct currents. Each work is held on its own terms.`
    : "The collection opens only through artist-approved publication.";

  return (
    <RecordsPageShell activeNav="artists" route="artists">
      <MuseumPageHero
        description={collectionDescription}
        eyebrow="The collection"
        title={<>The artist is<br /><em>the hero.</em></>}
      />

      <RecordsGeometryDivider tone="deep" />

      {artists.length ? (
        artists.map((artist, index) => (
          <div key={artist.slug}>
            <section
              className={`museum-artist-profile ${index % 2 ? "museum-artist-profile--palo" : ""}`}
              data-records-reveal=""
              id={artist.slug}
            >
              {artist.image ? (
                <div className="museum-artist-profile__image">
                  <Image
                    alt={artist.imageAlt ?? artist.name}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 820px) 100vw, 52vw"
                    src={artist.image}
                  />
                  <span>Artist {String(index + 1).padStart(3, "0")}</span>
                </div>
              ) : (
                <div className="museum-palo__art" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <i />
                </div>
              )}
              <div className="museum-artist-profile__copy">
                <p className="records-kicker">
                  {index === 0
                    ? "Featured exhibition"
                    : `Also on display · Artist ${String(index + 1).padStart(3, "0")}`}
                </p>
                <h2>{artist.name}</h2>
                {artist.location ? (
                  <p className="museum-artist-location">{artist.location}</p>
                ) : null}
                <p>{artist.description}</p>
                {artist.catalogStatus === "held" ? (
                  <p className="museum-honesty-note">
                    The public collection is intentionally minimal. Tracks and
                    releases enter only with the artist&apos;s approval.
                  </p>
                ) : null}
                <div className="museum-link-row">
                  <Link href={`/artists/${artist.slug}`}>
                    Enter profile <span aria-hidden="true">→</span>
                  </Link>
                  {artist.links.map((link) => (
                    <a href={link.href} key={link.label} rel="noreferrer" target="_blank">
                      {link.label} <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
            <RecordsGeometryDivider />
          </div>
        ))
      ) : (
        <section className="museum-tour-signage" data-records-reveal="">
          <p className="records-index">Current collection</p>
          <div>
            <span aria-hidden="true">○</span>
            <h2>No artist profiles are currently on display.</h2>
            <p>The collection opens only after an artist-approved publication.</p>
          </div>
        </section>
      )}
    </RecordsPageShell>
  );
}
