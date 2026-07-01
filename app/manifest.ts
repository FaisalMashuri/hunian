import type { MetadataRoute } from "next";

// PWA manifest (Next.js metadata route → di-serve di /manifest.webmanifest,
// dan otomatis ditautkan via <link rel="manifest"> di setiap halaman).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hunian — Bandingkan hunian sewa tanpa spreadsheet",
    short_name: "Hunian",
    description:
      "Copy deskripsi dari WhatsApp, Hunian ekstrak otomatis & bantu kamu pilih hunian sewa yang paling masuk akal.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "id",
    dir: "ltr",
    background_color: "#F4F3F0",
    theme_color: "#0F766E",
    categories: ["lifestyle", "productivity", "utilities"],
    icons: [
      { src: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
