import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Crawl boundary: hanya landing & login yang publik. Sisanya di balik auth → jangan diindeks.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: ["/dashboard", "/shortlist", "/bandingkan", "/input", "/pengaturan", "/onboarding"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
