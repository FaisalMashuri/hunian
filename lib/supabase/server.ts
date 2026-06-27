import "server-only";
import { createClient } from "@supabase/supabase-js";

// Klien Supabase SERVER-ONLY dengan service role.
// Service role BYPASS RLS (lihat db/schema.sql SECTION 6, LAYER 1):
// SETIAP query WAJIB memfilter user_id dari sesi NextAuth. RLS bukan pengganti filter ini.
//
// `import "server-only"` memastikan modul ini tidak pernah ter-bundle ke client (NFR-3).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Supabase env belum lengkap: butuh NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY",
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
