import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  RECORDS_FOOTER_NAV_ITEMS,
  RECORDS_FOOTER_UTILITY_NAV_ITEMS,
  RECORDS_PRIMARY_NAV_ITEMS,
  RECORDS_PUBLIC_ROUTES,
  RECORDS_SECONDARY_NAV_ITEMS,
} from "./records-public-routes";

const read = (path: string) => readFileSync(path, "utf8");

describe("Whole Body Records public route registry", () => {
  it("keeps exactly five primary destinations in the approved order", () => {
    expect(RECORDS_PRIMARY_NAV_ITEMS).toEqual([
      { href: "/artists", id: "artists", label: "Artists" },
      { href: "/catalog", id: "catalog", label: "Catalog" },
      { href: "/services", id: "services", label: "Services" },
      { href: "/tour", id: "tour", label: "Tour" },
      { href: "/submit", id: "submit", label: "Submit" },
    ]);
  });

  it("registers secondary label rooms without adding them to primary navigation", () => {
    expect(RECORDS_SECONDARY_NAV_ITEMS).toEqual([
      {
        href: "/management",
        id: "management",
        label: "ØDIN Management",
      },
      { href: "/partners", id: "partners", label: "Partners" },
      { href: "/sync", id: "sync", label: "Sync licensing" },
      {
        href: "/art-of-the-song",
        id: "artOfTheSong",
        label: "Art of the Song",
      },
    ]);
    expect(RECORDS_PRIMARY_NAV_ITEMS).toHaveLength(5);
    expect(
      RECORDS_PRIMARY_NAV_ITEMS.some(({ id }) =>
        ["management", "partners", "sync", "artOfTheSong"].includes(id),
      ),
    ).toBe(false);
  });

  it("shares commerce and utility destinations without exposing private workspaces", () => {
    expect(RECORDS_FOOTER_NAV_ITEMS.map(({ id }) => id)).toEqual([
      "home",
      "artists",
      "catalog",
      "services",
      "tour",
      "submit",
      "store",
    ]);
    expect(RECORDS_FOOTER_UTILITY_NAV_ITEMS.map(({ id }) => id)).toEqual([
      "privacy",
      "terms",
      "account",
      "login",
    ]);

    const publicNavigationHrefs = [
      ...RECORDS_PRIMARY_NAV_ITEMS,
      ...RECORDS_FOOTER_NAV_ITEMS,
      ...RECORDS_FOOTER_UTILITY_NAV_ITEMS,
      { href: RECORDS_PUBLIC_ROUTES.cart.href },
    ].map(({ href }) => href);

    expect(publicNavigationHrefs).not.toContain("/admin/dashboard");
    expect(publicNavigationHrefs).not.toContain("/artist/dashboard");
    expect(publicNavigationHrefs).not.toContain("/foundation");
  });

  it("separates route identity, active navigation, and shell variants", () => {
    const shell = read(
      "src/components/whole-body-records/RecordsPageShell.tsx",
    );
    const header = read("src/components/whole-body-records/RecordsHeader.tsx");

    expect(shell).toContain("route: RecordsRouteId");
    expect(shell).toContain("activeNav?: RecordsActiveNavId");
    expect(shell).toContain("variant?: RecordsPageShellVariant");
    expect(shell).toContain("data-records-route={route}");
    expect(shell).toContain("data-records-shell-variant={variant}");
    expect(shell).toContain(
      'href={isAuth ? "#member-access" : "#records-main"}',
    );
    expect(shell).toContain("<RecordsFooter");
    expect(header).toContain("RECORDS_PRIMARY_NAV_ITEMS");
    expect(header).toContain("RecordsWordmark");
    expect(header).toContain("aria-current={activeNav === link.id");
    expect(header).toContain("<RecordsCartLink");
    expect(header).toContain("<RecordsSessionControl");
  });

  it("adopts the shared shell without changing account security gates", () => {
    const login = read("src/app/login/page.tsx");
    const privacy = read("src/app/privacy/page.tsx");
    const terms = read("src/app/terms/page.tsx");
    const account = read("src/app/account/page.tsx");

    expect(login).toContain(
      '<RecordsPageShell activeNav="login" route="login" variant="auth">',
    );
    expect(privacy).toContain(
      '<RecordsPageShell route="legal" variant="legal">',
    );
    expect(terms).toContain('<RecordsPageShell route="legal" variant="legal">');
    expect(account).toContain('export const dynamic = "force-dynamic"');
    expect(account).toContain("robots: { follow: false, index: false }");
    expect(account).toContain('redirect("/artist/dashboard")');
    expect(account).toContain('redirect("/foundation")');
    expect(account).toContain('redirect("/admin/dashboard")');
  });
});
