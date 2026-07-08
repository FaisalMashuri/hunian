import type { MetadataRoute } from "next";

// PWA manifest (Next.js metadata route → di-serve di /manifest.webmanifest,
// dan otomatis ditautkan via <link rel="manifest"> di setiap halaman).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Optio — Pahami Pilihanmu, Putuskan dengan Yakin",
    short_name: "Optio",
    description:
      "Tempel deskripsi listing dari WhatsApp, Optio ekstrak otomatis & bantu kamu pilih hunian sewa dengan lebih yakin.",
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
    // Quick actions saat long-press ikon app (PWA installed).
    shortcuts: [
      {
        name: "Tambah Hunian",
        short_name: "Tambah",
        description: "Tempel listing & ekstrak otomatis",
        url: "/input",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Peta Hunian",
        short_name: "Peta",
        description: "Lihat semua hunian di peta",
        url: "/peta",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Bandingkan",
        short_name: "Bandingkan",
        description: "Bandingkan kandidat secara trade-off",
        url: "/bandingkan",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    icons: [
      { src: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
