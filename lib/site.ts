// Base URL situs untuk metadata absolut (OG image, canonical, sitemap, robots).
// Set NEXT_PUBLIC_SITE_URL di produksi (mis. https://hunian.app).
// Fallback: VERCEL_URL saat preview, localhost saat dev.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
