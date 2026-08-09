import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsGeometryDivider } from "@/components/whole-body-records/RecordsGeometryDivider";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { getPublicArtistDetail } from "@/lib/public-mirror";

export const revalidate = 30;

interface ArtistProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArtistProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPublicArtistDetail(slug);
  return detail
    ? {
        title: `${detail.artist.name} — Whole Body Records`,
        description: detail.artist.description,
        alternates: { canonical: `/artists/${slug}` },
      }
    : {
        title: "Artist not found — Whole Body Records",
        robots: { follow: false, index: false },
      };
}

export default async function ArtistProfilePage({
  params,
}: ArtistProfilePageProps) {
  const { slug } = await params;
  const detail = await getPublicArtistDetail(slug);
  if (!detail) notFound();
  const { artist, hasPublicPressMaterials, releases } = detail;

  return (
    <RecordsPageShell activeNav="artists" route="artists">
      <MuseumPageHero
        description={artist.description}
        eyebrow="Artist exhibition"
        title={
          <>
            {artist.name}
            <br />
            <em>{artist.location ?? "Whole Body Records"}</em>
          </>
        }
      />

      <RecordsGeometryDivider tone="deep" />

      <section className="museum-artist-profile" data-records-reveal="">
        {artist.image ? (
          <div className="museum-artist-profile__image">
            <Image
              alt={artist.imageAlt ?? artist.name}
              fill
              priority
              sizes="(max-width: 820px) 100vw, 52vw"
              src={artist.image}
            />
            <span>Artist profile</span>
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
          <p className="records-kicker">The artist is the hero</p>
          <h2>{artist.name}</h2>
          <p>{artist.description}</p>
          <div className="museum-link-row">
            {hasPublicPressMaterials ? (
              <Link href={`/artists/${artist.slug}/press`}>
                Open press kit <span aria-hidden="true">→</span>
              </Link>
            ) : null}
            {artist.links.map((link) => (
              <a href={link.href} key={link.label} rel="noreferrer" target="_blank">
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <RecordsGeometryDivider />

      <section className="museum-collection" data-records-reveal="">
        <div className="museum-room-heading">
          <div>
            <p className="records-index">Artist catalog</p>
            <p className="records-kicker">{artist.name}</p>
          </div>
          <h2>
            Published by consent.
            <br />
            <em>Held with care.</em>
          </h2>
          <p>Only releases approved for public display appear here.</p>
        </div>
        {releases.length ? (
          <ol className="museum-release-tracklist">
            {releases.map((release) => (
              <li key={release.slug ?? release.title}>
                <span>{release.year}</span>
                <strong>{release.title}</strong>
                <Link href={`/catalog#${release.slug ?? "catalog"}`}>
                  {release.format} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="museum-empty-plaque">
            <span>Catalog boundary</span>
            <p>No artist-approved release is currently published.</p>
          </div>
        )}
      </section>

      <RecordsGeometryDivider tone="deep" />
    </RecordsPageShell>
  );
}
