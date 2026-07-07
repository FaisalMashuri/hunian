"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { computeWeights } from "@/app/onboarding/options";
import { rescoreAllForUser } from "@/lib/scoring/rescore";
import type { TransportMode } from "@/lib/types/db";

export type PrefsInput = {
  budgetIdeal: number;
  budgetMax: number;
  tujuan: string;
  transportModes: TransportMode[];
  priorities: string[];
  dealBreakers: string[];
  customDealBreakers: string[];
  deadline: string | null; // YYYY-MM-DD atau null
};

export type PrefsResult = { ok: true } | { ok: false; error: string };

export async function updatePreferencesAction(input: PrefsInput): Promise<PrefsResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };
  if (input.priorities.length === 0) return { ok: false, error: "Prioritas wajib minimal satu." };

  // Deteksi perubahan tujuan -> hanya itu yang memicu panggilan Maps saat re-score.
  const { data: cur } = await supabaseAdmin
    .from("user_preferences")
    .select("dest_address")
    .eq("user_id", userId)
    .maybeSingle();
  const newDest = input.tujuan.trim() || null;
  const destChanged = (cur?.dest_address ?? null) !== newDest;

  const w = computeWeights(input.priorities);
  const { error: prefErr } = await supabaseAdmin.from("user_preferences").upsert(
    {
      user_id: userId,
      budget_ideal: input.budgetIdeal,
      budget_max: input.budgetMax,
      dest_address: newDest,
      // Tujuan berubah → koordinat lama tak valid. Kosongkan agar map-section geocode ulang ke alamat baru
      // (kalau tidak dikosongkan, peta & rute tetap memakai koordinat kantor LAMA).
      ...(destChanged ? { dest_lat: null, dest_lng: null } : {}),
      transport_modes: input.transportModes,
      priority_selection: input.priorities,
      weight_harga: w.harga,
      weight_lokasi: w.lokasi,
      weight_fasilitas: w.fasilitas,
      weight_keamanan: w.kondisi, // kolom legacy ← dimensi "Kondisi"
      weight_owner: w.owner,
      bobot_source: "user-defined",
      deadline_pindah: input.deadline || null,
      onboarding_completed: true,
    },
    { onConflict: "user_id" },
  );
  if (prefErr) return { ok: false, error: `Gagal menyimpan: ${prefErr.message}` };

  // Ganti seluruh deal breaker: preset (deal_breaker_key) + kustom (custom_text).
  await supabaseAdmin.from("user_deal_breakers").delete().eq("user_id", userId);
  const dbRows = [
    ...input.dealBreakers.map((key) => ({ user_id: userId, deal_breaker_key: key, is_active: true })),
    ...input.customDealBreakers
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((text) => ({ user_id: userId, custom_text: text, is_active: true })),
  ];
  if (dbRows.length > 0) {
    await supabaseAdmin.from("user_deal_breakers").insert(dbRows);
  }

  // Tujuan berubah → rute & durasi tempuh tersimpan (candidate_commute.route_summary) mengarah ke
  // kantor LAMA. Kosongkan untuk SEMUA kandidat user agar di-generate ulang ke kantor baru saat
  // peta detail/POI atau /peta dibuka. (Jarak & skor dihitung ulang oleh rescore di bawah.)
  if (destChanged) {
    const { data: cs } = await supabaseAdmin.from("candidates").select("id").eq("user_id", userId);
    const cids = (cs ?? []).map((c) => c.id as string);
    if (cids.length > 0) {
      await supabaseAdmin.from("candidate_commute").update({ route_summary: null, duration_min: null }).in("candidate_id", cids);
    }
  }

  // Auto re-score semua kandidat (jarak hanya dipanggil ulang bila tujuan berubah).
  await rescoreAllForUser(userId, { destChanged });
  return { ok: true };
}
