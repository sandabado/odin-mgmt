import type { MetadataRoute } from "next";
import {
  getPublicArtistDetail,
  getPublicSiteData,
} from "@/lib/public-mirror";
import { getPublicSiteOrigin } from "@/lib/public-site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getPublicSiteOrigin();
  const { artists } = await getPublicSiteData();
  const artistDetails = await Promise.all(
    artists.map((artist) => getPublicArtistDetail(artist.slug)),
  );
  return [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    {
      url: `${origin}/artists`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${origin}/catalog`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${origin}/services`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${origin}/management`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${origin}/partners`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${origin}/sync`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${origin}/art-of-the-song`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${origin}/store`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${origin}/tour`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${origin}/submit`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${origin}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${origin}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...artists.flatMap((artist, index) => {
      const profile = {
        url: `${origin}/artists/${artist.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
      return artistDetails[index]?.hasPublicPressMaterials
        ? [
            profile,
            {
              url: `${origin}/artists/${artist.slug}/press`,
              changeFrequency: "weekly" as const,
              priority: 0.6,
            },
          ]
        : [profile];
    }),
  ];
}
