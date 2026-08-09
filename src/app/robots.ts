import type { MetadataRoute } from "next";
import { getPublicSiteOrigin } from "@/lib/public-site-url";

export default function robots(): MetadataRoute.Robots {
  const origin = getPublicSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/admin",
        "/artist",
        "/api",
        "/auth",
        "/cart",
        "/foundation",
        "/login",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
