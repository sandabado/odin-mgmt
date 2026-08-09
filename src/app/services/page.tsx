import type { Metadata } from "next";
import Link from "next/link";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { WaterFlowTransition } from "@/components/whole-body-records/WaterFlowTransition";
import { getPublicSiteData } from "@/lib/public-mirror";

export const metadata: Metadata = {
  title: "Services — Whole Body Records",
  description:
    "Artist management, recording, releases, campaigns, live work, rights, and revenue held in one operating current.",
  alternates: { canonical: "/services" },
};

export const revalidate = 30;

const flowLabels = [
  "Direct",
  "Make",
  "Release",
  "Reach",
  "Perform",
  "Return",
] as const;

export default async function ServicesPage() {
  const { services } = await getPublicSiteData();

  return (
    <RecordsPageShell activeNav="services" route="services">
      <MuseumPageHero
        description="A connected operating practice for artists who need structure without surrendering the work."
        eyebrow="What we hold"
        title={
          <>
            Structure around
            <br />
            <em>the work.</em>
          </>
        }
      />

      <section className="records-services-intro" data-records-reveal="">
        <p className="records-index">One practice · Six connected currents</p>
        <h2>
          The artist remains
          <br />
          <em>the source.</em>
        </h2>
        <p>
          Direction, making, release, reach, performance, and return stay
          connected. Every consequential decision remains human-approved.
        </p>
        <div aria-label="Service flow" className="records-services-flow">
          {flowLabels.map((label, index) => (
            <span key={label}>
              <i>{String(index + 1).padStart(2, "0")}</i>
              {label}
            </span>
          ))}
        </div>
      </section>

      <WaterFlowTransition current="cyan" />

      {services.length ? (
        <div className="records-service-chapters">
          {services.map((service, index) => (
            <section
              className={`records-service-chapter records-service-chapter--${(index % 3) + 1}`}
              data-records-reveal=""
              id={service.slug}
              key={service.slug}
            >
              <div className="records-service-chapter__number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="records-service-chapter__copy">
                <p className="records-kicker">
                  {flowLabels[index] ?? "Whole Body"}
                </p>
                <h2>{service.title}</h2>
                {service.statement ? <h3>{service.statement}</h3> : null}
                {service.introduction ? <p>{service.introduction}</p> : null}
              </div>
              <ol aria-label={`${service.title} capabilities`}>
                {service.capabilities.map((capability, capabilityIndex) => (
                  <li key={capability}>
                    <span>{String(capabilityIndex + 1).padStart(2, "0")}</span>
                    {capability}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <section className="records-services-empty" data-records-reveal="">
          <p className="records-kicker">Publication boundary</p>
          <h2>No service offering is currently published.</h2>
          <p>
            Services appear here only after an operations steward moves the
            approved source record across the public mirror.
          </p>
        </section>
      )}

      <WaterFlowTransition current="violet" />

      <section className="records-services-closing" data-records-reveal="">
        <p className="records-index">The next current</p>
        <h2>
          Bring us the work.
          <br />
          <em>We&apos;ll build around it.</em>
        </h2>
        <p>
          Tell us where the work is, what is moving, and what kind of support
          would change the next chapter.
        </p>
        <Link className="records-button records-button--solid" href="/submit">
          Start a conversation <span aria-hidden="true">→</span>
        </Link>
      </section>
    </RecordsPageShell>
  );
}
