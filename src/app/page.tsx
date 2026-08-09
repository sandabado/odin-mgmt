import type { Metadata } from "next";
import { RecordsFooter } from "@/components/whole-body-records/RecordsFooter";
import { InkOnWaterPreview } from "@/components/whole-body-records/InkOnWaterPreview";
import { sandabadoStoreCatalog } from "@/lib/commerce/catalog";
import { buildRecordsLabelCurrent } from "@/lib/records-label-current";
import { getPublicSiteData } from "@/lib/public-mirror";

export const metadata: Metadata = {
  title: "Whole Body Records — Many voices. One whole body.",
  description:
    "A self-sustaining creative economy for artists who own their work and fans who seek the source.",
  applicationName: "Whole Body Records",
  alternates: { canonical: "/" },
};

export const revalidate = 30;

export default async function HomePage() {
  const {
    artists,
    editorial,
    playableReleases,
    products,
    releases,
    source,
    tourDates,
  } = await getPublicSiteData();
  const artist =
    artists.find((entry) => entry.slug === "sandabado") ?? artists[0];
  const secondaryArtist = artists.find((entry) => entry.slug !== artist?.slug);
  const release =
    releases.find((entry) => entry.slug === "infinity-love") ?? releases[0];
  const playableRelease =
    playableReleases.find((entry) => entry.slug === "333") ??
    playableReleases[0];
  const labelCurrent = buildRecordsLabelCurrent({
    editorial,
    releases,
    tourDates,
  });
  const artistProducts = products.length
    ? products
    : source === "curated-fallback"
      ? [...sandabadoStoreCatalog]
      : [];

  return (
    <>
      <InkOnWaterPreview
        artist={artist}
        artists={artists}
        editorial={editorial}
        heroSlides={labelCurrent}
        playableRelease={playableRelease}
        products={artistProducts}
        release={release}
        releases={releases}
        secondaryArtist={secondaryArtist}
        tourDates={tourDates}
      />
      <RecordsFooter />
    </>
  );
}
