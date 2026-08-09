export const RECORDS_PUBLIC_ROUTES = {
  home: {
    href: "/",
    label: "Home",
    route: "home",
  },
  artists: {
    href: "/artists",
    label: "Artists",
    route: "artists",
  },
  catalog: {
    href: "/catalog",
    label: "Catalog",
    route: "catalog",
  },
  services: {
    href: "/services",
    label: "Services",
    route: "services",
  },
  management: {
    href: "/management",
    label: "ØDIN Management",
    route: "management",
  },
  partners: {
    href: "/partners",
    label: "Partners",
    route: "partners",
  },
  sync: {
    href: "/sync",
    label: "Sync licensing",
    route: "sync",
  },
  artOfTheSong: {
    href: "/art-of-the-song",
    label: "Art of the Song",
    route: "art-of-the-song",
  },
  tour: {
    href: "/tour",
    label: "Tour",
    route: "tour",
  },
  submit: {
    href: "/submit",
    label: "Submit",
    route: "submit",
  },
  store: {
    href: "/store",
    label: "Store",
    route: "store",
  },
  cart: {
    href: "/cart",
    label: "Cart",
    route: "cart",
  },
  account: {
    href: "/account",
    label: "Account",
    route: "account",
  },
  login: {
    href: "/login",
    label: "ØDIN login",
    route: "login",
  },
  privacy: {
    href: "/privacy",
    label: "Privacy",
    route: "legal",
  },
  terms: {
    href: "/terms",
    label: "Terms",
    route: "legal",
  },
} as const;

export type RecordsPublicRouteKey = keyof typeof RECORDS_PUBLIC_ROUTES;
export type RecordsRouteId =
  (typeof RECORDS_PUBLIC_ROUTES)[RecordsPublicRouteKey]["route"];

export const RECORDS_PRIMARY_NAV_KEYS = [
  "artists",
  "catalog",
  "services",
  "tour",
  "submit",
] as const satisfies ReadonlyArray<RecordsPublicRouteKey>;

export type RecordsPrimaryNavId = (typeof RECORDS_PRIMARY_NAV_KEYS)[number];
export const RECORDS_SECONDARY_NAV_KEYS = [
  "management",
  "partners",
  "sync",
  "artOfTheSong",
] as const satisfies ReadonlyArray<RecordsPublicRouteKey>;

export type RecordsSecondaryNavId =
  (typeof RECORDS_SECONDARY_NAV_KEYS)[number];
export type RecordsActiveNavId =
  RecordsPrimaryNavId | "store" | "cart" | "account" | "login";

function routesFor<const Keys extends ReadonlyArray<RecordsPublicRouteKey>>(
  keys: Keys,
) {
  return keys.map((key) => ({
    href: RECORDS_PUBLIC_ROUTES[key].href,
    id: key,
    label: RECORDS_PUBLIC_ROUTES[key].label,
  }));
}

export const RECORDS_PRIMARY_NAV_ITEMS = routesFor(RECORDS_PRIMARY_NAV_KEYS);
export const RECORDS_SECONDARY_NAV_ITEMS = routesFor(
  RECORDS_SECONDARY_NAV_KEYS,
);

export const RECORDS_FOOTER_NAV_ITEMS = routesFor([
  "home",
  ...RECORDS_PRIMARY_NAV_KEYS,
  "store",
] as const);

export const RECORDS_FOOTER_UTILITY_NAV_ITEMS = routesFor([
  "privacy",
  "terms",
  "account",
  "login",
] as const);
