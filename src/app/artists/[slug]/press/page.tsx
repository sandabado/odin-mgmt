import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsGeometryDivider } from "@/components/whole-body-records/RecordsGeometryDivider";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { getPublicArtistDetail } from "@/lib/public-mirror";

export const revalidate = 30;

interface ArtistPressPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArtistPressPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPublicArtistDetail(slug);
  return detail?.hasPublicPressMaterials
    ? {
        title: `${detail.artist.name} Press Kit — Whole Body Records`,
        description: `Artist-approved public press materials for ${detail.artist.name}.`,
        alternates: { canonical: `/artists/${slug}/press` },
      }
    : {
        title: "Press kit not found — Whole Body Records",
        robots: { follow: false, index: false },
      };
}

export default async function ArtistPressPage({
  params,
}: ArtistPressPageProps) {
  const { slug } = await params;
  const detail = await getPublicArtistDetail(slug);
  if (!detail?.hasPublicPressMaterials) notFound();
  const {
    artist,
    bookingEmail,
    gear,
    images,
    longBiography,
    releases,
    stagePlots,
  } = detail;

  return (
    <RecordsPageShell activeNav="artists" route="artists">
      <MuseumPageHero
        description="A public press room assembled only from artist-approved ØDIN records."
        eyebrow="Electronic press kit"
        title={
          <>
            {artist.name}
            <br />
            <em>for the room.</em>
          </>
        }
      />

      <RecordsGeometryDivider tone="deep" />

      <section className="museum-studio" data-records-reveal="">
        <div>
          <p className="records-index">Biography</p>
          <p className="records-kicker">{artist.location ?? "Whole Body Records"}</p>
          <h2>{artist.name}</h2>
        </div>
        <div className="museum-empty-plaque">
          <span>Artist-approved biography</span>
          <p>{longBiography ?? artist.description}</p>
          {bookingEmail ? (
            <a className="records-catalog-link" href={`mailto:${bookingEmail}`}>
              Booking contact <span aria-hidden="true">→</span>
            </a>
          ) : (
            <small>Private contact details remain inside ØDIN.</small>
          )}
        </div>
      </section>

      <RecordsGeometryDivider />

      {images.length ? (
        <section className="museum-collection" data-records-reveal="">
          <div className="museum-room-heading">
            <div>
              <p className="records-index">Approved imagery</p>
              <p className="records-kicker">Press room</p>
            </div>
            <h2>Images cleared for use.</h2>
          </div>
          <div className="museum-track-wall">
            {images.map((image, index) => (
              <article className="museum-track-frame" key={`${image.url}-${index}`}>
                <div className="museum-track-frame__canvas">
                  <Image
                    alt={image.altText ?? `${artist.name} ${image.imageType} image`}
                    fill
                    sizes="(max-width: 820px) 88vw, 24vw"
                    src={image.url}
                  />
                </div>
                <div className="museum-track-frame__plaque">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{image.imageType}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <RecordsGeometryDivider tone="deep" />

      <section className="museum-collection" data-records-reveal="">
        <div className="museum-room-heading">
          <div>
            <p className="records-index">Released work</p>
            <p className="records-kicker">Streaming and catalog</p>
          </div>
          <h2>Public records.</h2>
          <p>No internal project, distribution, or financial data crosses this boundary.</p>
        </div>
        {releases.length ? (
          <ol className="museum-release-tracklist">
            {releases.map((release) => (
              <li key={release.slug ?? release.title}>
                <span>{release.year}</span>
                <strong>
                  {release.title}
                  {release.credits?.length ? (
                    <small>
                      {release.credits
                        .map((credit) => `${credit.role}: ${credit.name}`)
                        .join(" · ")}
                    </small>
                  ) : null}
                </strong>
                <a href={release.listenUrl} rel="noreferrer" target="_blank">
                  Listen <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <div className="museum-empty-plaque">
            <span>Catalog held</span>
            <p>No release is currently approved for this press kit.</p>
          </div>
        )}
      </section>

      {(stagePlots.length || gear.length) ? (
        <>
          <RecordsGeometryDivider />
          <section className="museum-studio" data-records-reveal="">
            <div>
              <p className="records-index">Production</p>
              <p className="records-kicker">Artist-approved technical materials</p>
              <h2>Ready for the room.</h2>
            </div>
            <div className="museum-empty-plaque">
              {stagePlots.map((plot) => (
                <div key={plot.name}>
                  <span>{plot.name}</span>
                  {plot.stageLayout ? <p>{plot.stageLayout}</p> : null}
                  {plot.plotDiagramUrl ? (
                    <a href={plot.plotDiagramUrl} rel="noreferrer" target="_blank">
                      Stage plot <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                  {plot.inputListPdfUrl ? (
                    <a href={plot.inputListPdfUrl} rel="noreferrer" target="_blank">
                      Input list <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
              ))}
              {gear.length ? (
                <p>
                  Public backline:{" "}
                  {gear
                    .map((item) => [item.brand, item.model, item.name].filter(Boolean).join(" "))
                    .join(" · ")}
                </p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      <RecordsGeometryDivider tone="deep" />
    </RecordsPageShell>
  );
}
