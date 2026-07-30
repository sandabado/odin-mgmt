import Link from "next/link";
import { RecordsRailCue } from "./brand";
import styles from "./RecordsBookingCorridor.module.css";

const corridorNodes = [
  {
    index: "01",
    city: "Joshua Tree",
    role: "Home current",
    detail:
      "Artist context, patient development, and the reason for the route.",
  },
  {
    index: "02",
    city: "Los Angeles",
    role: "Opportunity current",
    detail: "A focused step toward press, industry, and cultural reach.",
  },
  {
    index: "03",
    city: "San Diego",
    role: "Regional current",
    detail:
      "A connected next audience, chosen for continuity rather than volume.",
  },
] as const;

const artistLoop = [
  {
    index: "01",
    title: "Listen & align",
    detail:
      "Goals, capacity, audience, ownership, and consent set the direction.",
  },
  {
    index: "02",
    title: "Shape the signal",
    detail:
      "Release strategy, campaigns, press, and content tell one true story.",
  },
  {
    index: "03",
    title: "Book with intent",
    detail:
      "Timing, room fit, routing, and partner coordination guide each ask.",
  },
  {
    index: "04",
    title: "Prepare & return",
    detail:
      "Show prep and follow-through carry every useful lesson into the next move.",
  },
] as const;

export function RecordsBookingCorridor() {
  return (
    <section
      aria-labelledby="records-booking-corridor-heading"
      className={styles.corridor}
      data-records-booking-corridor=""
    >
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Southern California operating corridor</p>
        <h2 id="records-booking-corridor-heading">
          Serve the whole artist.
          <em>Move only with purpose.</em>
        </h2>
        <div className={styles.introStatement}>
          <p>
            We begin with the artist—not a market map. Release timing, audience,
            story, capacity, and consent shape where the work should travel and
            when.
          </p>
          <span>Artist context → strategy → route → follow-through</span>
        </div>
      </div>

      <div className={styles.route}>
        <div className={styles.routeOrigin}>
          <span>Artist context enters</span>
          <strong>One connected run</strong>
        </div>

        <svg
          aria-hidden="true"
          className={styles.routeCurrent}
          preserveAspectRatio="none"
          viewBox="0 0 1200 260"
        >
          <path
            className={styles.routeGuide}
            d="M38 131C174 36 304 37 430 112C558 188 668 188 784 109C910 24 1035 40 1162 129"
          />
          <path
            className={styles.routeReturn}
            d="M1162 129C1048 224 903 225 784 153C658 76 550 76 430 151C302 230 167 220 38 131"
          />
          <path
            className={styles.routeSignal}
            d="M38 131C174 36 304 37 430 112C558 188 668 188 784 109C910 24 1035 40 1162 129"
          />
          <circle className={styles.routePulse} cx="38" cy="131" r="5" />
          <circle className={styles.routePulse} cx="1162" cy="129" r="5" />
        </svg>

        <ol
          aria-label="Targeted booking corridor from Joshua Tree through Los Angeles to San Diego"
          className={styles.routeNodes}
        >
          {corridorNodes.map((node) => (
            <li key={node.city}>
              <span className={styles.nodeIndex}>{node.index}</span>
              <i aria-hidden="true" />
              <small>{node.role}</small>
              <strong>{node.city}</strong>
              <p>{node.detail}</p>
            </li>
          ))}
        </ol>

        <div className={styles.routeReturnLabel}>
          <span>Learning returns</span>
          <strong>Show prep + follow-through</strong>
        </div>
      </div>

      <ol
        aria-label="How Whole Body Records serves artists"
        className={styles.loop}
        tabIndex={0}
      >
        {artistLoop.map((step) => (
          <li key={step.title}>
            <span>{step.index}</span>
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
          </li>
        ))}
      </ol>
      <RecordsRailCue>Swipe through the artist practice</RecordsRailCue>

      <nav
        aria-label="Artist management and booking"
        className={styles.actions}
      >
        <Link href="/management">
          Explore artist management <span aria-hidden="true">→</span>
        </Link>
        <Link href="/tour">See confirmed shows</Link>
        <Link href="/submit#submission-form">Submit your work</Link>
      </nav>
    </section>
  );
}
