import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Proteksi route via edge-safe config (tanpa DB). Belum login -> redirect /login.
export const { auth: middleware } = NextAuth(authConfig);

// Hanya route aplikasi (post-login) yang diproteksi.
// Publik: `/` (landing), `/login`, `/api/auth/*`, asset statis.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/shortlist/:path*",
    "/onboarding/:path*",
    "/bandingkan/:path*",
    "/peta/:path*",
    "/pengaturan/:path*",
    "/kolaborasi/:path*",
    "/input/:path*",
    "/review/:path*",
  ],
};
