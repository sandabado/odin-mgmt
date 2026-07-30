import Link from "next/link";
import { OdinOrbitMark } from "@/components/OdinOrbitMark";
import { getPublicSiteData } from "@/lib/public-mirror";
import {
  RECORDS_FOOTER_NAV_ITEMS,
  RECORDS_FOOTER_UTILITY_NAV_ITEMS,
  RECORDS_PUBLIC_ROUTES,
  RECORDS_SECONDARY_NAV_ITEMS,
} from "@/lib/records-public-routes";
import { RecordsWordmark } from "./brand/RecordsWordmark";
import { PoolingWaterClosing } from "./PoolingWaterClosing";
import styles from "./RecordsFooter.module.css";

export async function RecordsFooter() {
  const { artists } = await getPublicSiteData();

  return (
    <footer className={`records-footer ${styles.footer}`}>
      <PoolingWaterClosing className={styles.ritual} showMeta={false} />

      <div className={styles.information}>
        <Link
          aria-label="Manage the work in the ØDIN member portal"
          className={styles.memberPortal}
          href={RECORDS_PUBLIC_ROUTES.login.href}
        >
          <OdinOrbitMark className={styles.odinMark} decorative />
          <span className={styles.memberPortalCopy}>
            <small>ØDIN Management</small>
            <strong>Manage the work in ØDIN</strong>
            <span>
              Records, campaigns, bookings, and revenue—one protected operating
              system.
            </span>
          </span>
          <span aria-hidden="true" className={styles.memberPortalArrow}>
            Member login →
          </span>
        </Link>

        <div className={styles.linkGrid}>
          <div className={styles.identity}>
            <Link
              aria-label="Whole Body Records home"
              className={styles.wordmarkLink}
              href={RECORDS_PUBLIC_ROUTES.home.href}
            >
              <RecordsWordmark size="compact" tone="on-void" />
            </Link>
            <p className={`records-footer__closing ${styles.closing}`}>
              Water flows for all.
            </p>
            <p className={styles.statement}>
              An artist-owned current for music, stories, live work, and the
              people who carry them forward.
            </p>
            <a className={styles.contact} href="mailto:records@wholebody.earth">
              records@wholebody.earth
            </a>
          </div>
          <nav
            aria-label="Explore Whole Body Records"
            className={`records-footer__nav ${styles.navigation}`}
          >
            <p className={styles.navigationTitle}>Explore</p>
            <div className={styles.linkList}>
              {RECORDS_FOOTER_NAV_ITEMS.map((link) => (
                <Link href={link.href} key={link.id}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav
            aria-label="Work with Whole Body Records"
            className={styles.navigation}
          >
            <p className={styles.navigationTitle}>Work with us</p>
            <div className={styles.linkList}>
              {RECORDS_SECONDARY_NAV_ITEMS.map((link) => (
                <Link href={link.href} key={link.id}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav
            aria-label="Whole Body Records account and policy links"
            className={`records-footer__utility ${styles.navigation}`}
          >
            <p className={styles.navigationTitle}>System</p>
            <div className={styles.linkList}>
              {RECORDS_FOOTER_UTILITY_NAV_ITEMS.filter(
                (link) => link.id !== "login",
              ).map((link) => (
                <Link href={link.href} key={link.id}>
                  {link.label}
                </Link>
              ))}
              <a
                href="https://sandabado-music.vercel.app"
                rel="noreferrer"
                target="_blank"
              >
                Visit artist studio ↗
              </a>
            </div>
          </nav>
        </div>

        <div className={styles.mobileNavigation}>
          <details>
            <summary>Explore</summary>
            <nav aria-label="Explore Whole Body Records on mobile">
              {RECORDS_FOOTER_NAV_ITEMS.map((link) => (
                <Link href={link.href} key={link.id}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
          <details>
            <summary>Work with us</summary>
            <nav aria-label="Work with Whole Body Records on mobile">
              {RECORDS_SECONDARY_NAV_ITEMS.map((link) => (
                <Link href={link.href} key={link.id}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
          <details>
            <summary>System</summary>
            <nav aria-label="Whole Body Records system links on mobile">
              {RECORDS_FOOTER_UTILITY_NAV_ITEMS.filter(
                (link) => link.id !== "login",
              ).map((link) => (
                <Link href={link.href} key={link.id}>
                  {link.label}
                </Link>
              ))}
              <a
                href="https://sandabado-music.vercel.app"
                rel="noreferrer"
                target="_blank"
              >
                Visit artist studio ↗
              </a>
            </nav>
          </details>
        </div>

        {artists.length ? (
          <div className={`records-footer__artists ${styles.artists}`}>
            <p>Current artists</p>
            <div>
              {artists.map((artist) => (
                <Link href={`/artists/${artist.slug}`} key={artist.slug}>
                  {artist.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className={styles.finalLine}>
          <small className={styles.copyright}>
            © 2026 Whole Body Records · A Whole Body Studios practice
          </small>
          <a
            href="https://instagram.com/sandabadomusic"
            rel="noreferrer"
            target="_blank"
          >
            Instagram ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
