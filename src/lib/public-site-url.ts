const FALLBACK_PUBLIC_ORIGIN = "https://www.odin.management";

/**
 * One origin for canonical metadata, robots, and the sitemap.
 * The verified deployment URL should be supplied through NEXT_PUBLIC_APP_URL.
 */
export function getPublicSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) return FALLBACK_PUBLIC_ORIGIN;

  try {
    const url = new URL(configured);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : FALLBACK_PUBLIC_ORIGIN;
  } catch {
    return FALLBACK_PUBLIC_ORIGIN;
  }
}
