import type { MetadataRoute } from "next";
import { getSuperchargersSoon } from "@/lib/api";

const BASE_URL = process.env.SITE_URL ?? "https://soonercharger.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/list`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/status-updates`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.75,
    },
  ];

  try {
    const { items } = await getSuperchargersSoon(10000);
    const chargerRoutes: MetadataRoute.Sitemap = items.map((charger) => ({
      url: `${BASE_URL}/charger/${charger.id}`,
      lastModified: new Date(charger.last_scraped_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    return [...staticRoutes, ...chargerRoutes];
  } catch {
    return staticRoutes;
  }
}
