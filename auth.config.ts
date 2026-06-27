import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Config EDGE-SAFE (tanpa akses DB) — dipakai oleh middleware untuk proteksi route.
// Callback DB (upsert user) ada di auth.ts agar tidak jalan di edge runtime.
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Pemetaan token -> session (murni, edge-safe). Ada di sini agar middleware
    // (yang memakai config ini) dapat membaca session.user.id. token.uid sudah
    // ter-encode di JWT saat sign-in (lihat jwt callback di auth.ts).
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.googleSub = (token.googleSub as string) ?? "";
      }
      return session;
    },
    // Hanya user dengan id valid (upsert DB sukses) yang dianggap terautentikasi.
    // Mencegah "sesi rusak senyap" (id kosong) lolos proteksi route (HIGH-1).
    authorized({ auth }) {
      return !!auth?.user?.id;
    },
  },
} satisfies NextAuthConfig;
