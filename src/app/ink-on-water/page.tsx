import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InkOnWaterPreview } from "@/components/whole-body-records/InkOnWaterPreview";
import { RecordsFooter } from "@/components/whole-body-records/RecordsFooter";
import { sandabadoStoreCatalog } from "@/lib/commerce/catalog";
import { buildRecordsLabelCurrent } from "@/lib/records-label-current";
import { getPublicSiteData } from "@/lib/public-mirror";

export const metadata: Metadata = {
  title: "Ink on Water — Whole Body Records Preview",
  description:
    "A protected creative-direction preview for the Whole Body Records public experience.",
  robots: { index: false, follow: false },
};

export const revalidate = 30;

export default async function InkOnWaterPage() {
  if (process.env.NODE_ENV === "production") redirect("/");

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
