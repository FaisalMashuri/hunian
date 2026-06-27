import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { supabaseAdmin } from "@/lib/supabase/server";

// Konfigurasi penuh (Node runtime) — termasuk upsert user ke Supabase.
// session & authorized callback ada di auth.config.ts (edge-safe) agar dipakai middleware juga.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    // Saat pertama login: upsert user by google_sub (FR-AU-2, db/schema.sql users),
    // simpan internal uuid + google_sub ke token agar tidak query DB tiap request.
    async jwt({ token, account, profile }) {
      if (account && profile?.sub) {
        // Guard: kolom users.email NOT NULL UNIQUE. Bila Google tak mengirim email,
        // upsert PASTI gagal — skip agar tidak menelan error; token tanpa uid -> middleware blokir.
        if (!token.email) {
          console.error("[auth] login ditolak: akun Google tidak mengirim email");
          return token;
        }

        const { data, error } = await supabaseAdmin
          .from("users")
          .upsert(
            {
              google_sub: profile.sub,
              email: token.email,
              name: token.name,
              avatar_url: (token.picture as string | undefined) ?? null,
            },
            { onConflict: "google_sub" },
          )
          .select("id")
          .single();

        if (!error && data) {
          token.uid = data.id as string;
          token.googleSub = profile.sub;
        } else if (error) {
          console.error("[auth] upsert users gagal:", error.message);
        }
      }
      return token;
    },
  },
});
