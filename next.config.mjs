/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Upload foto (S2-1) via Server Action — naikkan dari default 1MB agar muat gambar ponsel.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  // Redirect 301 dari URL lama /kandidat → struktur baru /dashboard (list) & /shortlist/[id] (detail).
  async redirects() {
    return [
      { source: "/kandidat", destination: "/dashboard", permanent: true },
      { source: "/kandidat/:path*", destination: "/shortlist/:path*", permanent: true },
    ];
  },
  images: {
    // Sumber gambar placeholder (dev/awal). Ganti dgn asset final saat siap.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // avatar Google
    ],
  },
};

export default nextConfig;
