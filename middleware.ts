import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Proteksi route via edge-safe config (tanpa DB). Belum login -> redirect /login.
export const { auth: middleware } = NextAuth(authConfig);

// Hanya route aplikasi (post-login) yang diproteksi.
// Publik: `/` (landing), `/login`, `/api/auth/*`, asset statis.
export const config = {
  matcher: [
    "/kandidat/:path*",
    "/onboarding/:path*",
    "/bandingkan/:path*",
    "/pengaturan/:path*",
    "/input/:path*",
    "/review/:path*",
  ],
};
