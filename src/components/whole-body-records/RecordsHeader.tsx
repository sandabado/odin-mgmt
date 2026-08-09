import Link from "next/link";
import {
  RECORDS_PRIMARY_NAV_ITEMS,
  RECORDS_PUBLIC_ROUTES,
  type RecordsActiveNavId,
} from "@/lib/records-public-routes";
import { RecordsWordmark } from "./brand/RecordsWordmark";
import { RecordsCartLink } from "./RecordsCartLink";
import { RecordsSessionControl } from "./RecordsSessionControl";

export interface RecordsHeaderProps {
  activeNav?: RecordsActiveNavId;
  overlay?: boolean;
}

export function RecordsHeader({
  activeNav,
  overlay = false,
}: RecordsHeaderProps) {
  const navigation = RECORDS_PRIMARY_NAV_ITEMS.map((link) => (
    <Link
      aria-current={activeNav === link.id ? "page" : undefined}
      href={link.href}
      key={link.id}
    >
      {link.label}
    </Link>
  ));

  return (
    <header
      className={`records-header ${overlay ? "records-header--overlay" : "records-header--solid"}`}
    >
      <Link
        aria-label="Whole Body Records home"
        className="records-wordmark"
        href={RECORDS_PUBLIC_ROUTES.home.href}
      >
        <RecordsWordmark size="compact" tone="on-void" />
      </Link>
      <nav
        aria-label="Primary navigation"
        className="records-header__primary-nav"
      >
        {navigation}
      </nav>
      <div className="records-header__utilities">
        <Link
          aria-current={activeNav === "store" ? "page" : undefined}
          className="records-store-link"
          href={RECORDS_PUBLIC_ROUTES.store.href}
        >
          {RECORDS_PUBLIC_ROUTES.store.label}
        </Link>
        <RecordsCartLink active={activeNav === "cart"} />
        <RecordsSessionControl
          active={activeNav === "account" || activeNav === "login"}
        />
        <details className="records-mobile-nav">
          <summary aria-label="Open site navigation">
            <span className="records-mobile-nav__label">Menu</span>
            <span aria-hidden="true" className="records-mobile-nav__glyph">
              <i />
              <i />
            </span>
          </summary>
          <nav aria-label="Mobile primary navigation">{navigation}</nav>
        </details>
      </div>
    </header>
  );
}
