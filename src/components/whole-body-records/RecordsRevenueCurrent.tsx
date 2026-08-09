import Link from "next/link";
import { RecordsRailCue } from "./brand";
import {
  recordsFeedFirstDestinations,
  recordsRevenueCurrents,
} from "./RecordsRevenueCurrent.data";
import styles from "./RecordsRevenueCurrent.module.css";

/**
 * Public, aggregate view of the same source → ledger → allocation relationship
 * used by ØDIN. This surface intentionally contains no account-level data.
 */
export function RecordsRevenueCurrent() {
  return (
    <section
      aria-labelledby="records-revenue-current-title"
      className={styles.section}
      data-records-revenue-current=""
    >
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>The ØDIN value current</p>
          <h2 id="records-revenue-current-title">
            Four opportunities.
            <em>One accountable flow.</em>
          </h2>
        </div>
        <p className={styles.introduction}>
          Each practice creates a distinct source of value. ØDIN keeps the
          source connected to the work, then carries approved distributable net
          through the deployed Feed First allocation.
        </p>
      </header>

      <div className={styles.system}>
        <div className={styles.sources}>
          <p className={styles.systemLabel}>Opportunity currents</p>
          <ol aria-label="Opportunity currents" tabIndex={0}>
            {recordsRevenueCurrents.map((current) => (
              <li key={current.label}>
                <span aria-hidden="true">{current.index}</span>
                <div>
                  <h3>{current.label}</h3>
                  <p>{current.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <RecordsRailCue breakpoint="compact">
            Swipe the opportunity currents
          </RecordsRailCue>
        </div>

        <div className={styles.confluence}>
          <svg
            aria-labelledby="records-revenue-map-title records-revenue-map-description"
            className={styles.map}
            role="img"
            viewBox="0 0 360 520"
          >
            <title id="records-revenue-map-title">
              Four revenue currents entering the ØDIN ledger
            </title>
            <desc id="records-revenue-map-description">
              Public relations, records and rights, management, and booking
              converge in the protected ØDIN operating system before Feed First
              allocation.
            </desc>
            <g className={styles.guides}>
              <path d="M0 64 C104 64 103 221 180 260" />
              <path d="M0 192 C105 192 116 240 180 260" />
              <path d="M0 328 C105 328 116 280 180 260" />
              <path d="M0 456 C104 456 103 299 180 260" />
              <path d="M180 260 C239 260 278 260 360 260" />
            </g>
            <g className={styles.signals} aria-hidden="true">
              <path d="M0 64 C104 64 103 221 180 260" />
              <path d="M0 192 C105 192 116 240 180 260" />
              <path d="M0 328 C105 328 116 280 180 260" />
              <path d="M0 456 C104 456 103 299 180 260" />
              <path d="M180 260 C239 260 278 260 360 260" />
            </g>
            <circle className={styles.basinRing} cx="180" cy="260" r="46" />
            <circle className={styles.basinCore} cx="180" cy="260" r="4" />
          </svg>

          <div className={styles.ledger}>
            <span className={styles.odinMark} aria-hidden="true">
              Ø
            </span>
            <p>Protected operating layer</p>
            <h3>ØDIN keeps the source attached.</h3>
            <small>Recorded → reconciled → allocated</small>
          </div>
        </div>

        <div className={styles.destinations}>
          <div className={styles.destinationHeading}>
            <p className={styles.systemLabel}>Feed First</p>
            <p>Approved allocation of distributable net</p>
          </div>
          <dl>
            {recordsFeedFirstDestinations.map((destination) => (
              <div key={destination.label}>
                <dt>{destination.label}</dt>
                <dd>{destination.percentage}%</dd>
                <span aria-hidden="true">
                  <i style={{ width: `${destination.percentage}%` }} />
                </span>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>
          These are public opportunity groupings, not new ØDIN ledger arms.
          Booking enters the existing Studios system as a linked source. ØDIN
          generates the Feed First allocation; settlement remains
          human-controlled. This is not a live balance—individual agreements,
          approvals, and account activity remain protected.
        </p>
        <div>
          <Link href="/management">
            See how ØDIN manages the work <span aria-hidden="true">→</span>
          </Link>
          <Link href="/services">
            Explore artist services <span aria-hidden="true">→</span>
          </Link>
        </div>
      </footer>
    </section>
  );
}
