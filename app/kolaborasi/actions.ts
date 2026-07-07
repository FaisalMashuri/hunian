"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Collaboration C-1 — kelola share shortlist ke partner (berbasis email).
// Tanpa gating premium (alat personal). Identitas dari NextAuth; service role BYPASS RLS,
// jadi setiap query memfilter owner_id = sesi.

export type CollabResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Undang / aktifkan-kembali partner. role 'viewer' = hanya lihat; 'editor' = boleh ikut
// edit & isi survei. Partner melihat SELURUH shortlist kita saat login dengan email tsb.
export async function invitePartnerAction(emailRaw: string, roleRaw: string): Promise<CollabResult> {
  const session = await auth();
  const userId = session?.user?.id;
  const myEmail = session?.user?.email?.toLowerCase() ?? null;
  if (!userId) return { ok: false, error: "Sesi berakhir. Masuk lagi." };

  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Format email tidak valid." };
  if (email === myEmail) return { ok: false, error: "Tidak bisa berbagi ke email sendiri." };
  const role = roleRaw === "editor" ? "editor" : "viewer";

  const { error } = await supabaseAdmin
    .from("collab_shares")
    .upsert(
      { owner_id: userId, grantee_email: email, role, status: "active" },
      { onConflict: "owner_id,grantee_email" },
    );
  if (error) return { ok: false, error: `Gagal menyimpan: ${error.message}` };

  revalidatePath("/kolaborasi");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Cabut akses partner (soft: status='revoked'). Akses langsung hilang di query berikutnya.
export async function revokePartnerAction(emailRaw: string): Promise<CollabResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir. Masuk lagi." };

  const email = emailRaw.trim().toLowerCase();
  const { error } = await supabaseAdmin
    .from("collab_shares")
    .update({ status: "revoked" })
    .eq("owner_id", userId)
    .eq("grantee_email", email);
  if (error) return { ok: false, error: `Gagal mencabut: ${error.message}` };

  revalidatePath("/kolaborasi");
  revalidatePath("/dashboard");
  return { ok: true };
}
