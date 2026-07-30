import type { Metadata } from "next";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsGeometryDivider } from "@/components/whole-body-records/RecordsGeometryDivider";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { getPublicSiteData } from "@/lib/public-mirror";

export const metadata: Metadata = {
  title: "Tour — Whole Body Records",
  description: "Artist-confirmed public dates from the Whole Body Records collection.",
  alternates: { canonical: "/tour" },
};

export const revalidate = 30;

export default async function TourPage() {
  const { tourDates } = await getPublicSiteData();

  return (
    <RecordsPageShell activeNav="tour" route="tour">
      <MuseumPageHero
        description="Only artist-confirmed public dates cross this threshold."
        eyebrow="The road"
        title={<>Every room<br /><em>has to be real.</em></>}
      />

      <RecordsGeometryDivider tone="deep" />

      {tourDates.length ? (
        tourDates.map((show, index) => (
          <section
            className="museum-tour-signage"
            data-records-reveal=""
            id={show.slug}
            key={show.slug}
          >
            <p className="records-index">
              Date {String(index + 1).padStart(2, "0")} · {show.artistName}
            </p>
            <div>
              <span aria-hidden="true">○</span>
              <h2>{show.venueName}</h2>
              <p>
                {new Intl.DateTimeFormat("en-US", {
                  day: "numeric",
                  month: "long",
                  timeZone: "UTC",
                  year: "numeric",
                }).format(new Date(`${show.date}T12:00:00Z`))}
                {show.cityState ? ` · ${show.cityState}` : ""}
              </p>
              {show.note ? <p>{show.note}</p> : null}
              {show.ticketUrl ? (
                <a
                  className="records-catalog-link"
                  href={show.ticketUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Tickets <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </section>
        ))
      ) : (
        <section className="museum-tour-signage" data-records-reveal="">
          <p className="records-index">Current exhibition schedule</p>
          <div>
            <span aria-hidden="true">○</span>
            <h2>No public dates are on display.</h2>
            <p>Holds, negotiations, and internal planning remain inside ØDIN. Dates appear here after the artist confirms them for the public.</p>
          </div>
        </section>
      )}

      <RecordsGeometryDivider />
    </RecordsPageShell>
  );
}
