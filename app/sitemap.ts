import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Hanya halaman publik (di luar auth) yang masuk sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/login`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
