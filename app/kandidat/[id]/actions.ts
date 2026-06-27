"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { explainCandidate } from "@/lib/explain/explain";
import { rescoreCandidate } from "@/lib/scoring/rescore";
import { insertCandidateEvent } from "@/lib/events";
import { CANDIDATE_STATUSES, type CandidateStatus } from "@/lib/types/db";
import { listUnknowns } from "@/lib/extraction/unknowns";
import type { ExtractedDraft } from "@/lib/extraction/types";

export type ExplainResult = { ok: true; text: string } | { ok: false; error: string };

export async function explainAction(candidateId: string): Promise<ExplainResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };

  const { data: c } = await supabaseAdmin
    .from("candidates")
    .select(
      "title, score_total, score_harga, score_lokasi, score_fasilitas, harga_efektif_bulanan, deposit, kamar_tidur, kamar_mandi, luas_bangunan_m2, furnished, carport, dapur",
    )
    .eq("id", candidateId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!c) return { ok: false, error: "Kandidat tidak ditemukan." };

  const { data: prefs } = await supabaseAdmin
    .from("user_preferences")
    .select("budget_ideal, budget_max")
    .eq("user_id", userId)
    .maybeSingle();
  const { data: commute } = await supabaseAdmin
    .from("candidate_commute")
    .select("distance_km")
    .eq("candidate_id", candidateId)
    .limit(1)
    .maybeSingle();

  const unknowns = listUnknowns(
    {
      kamar_tidur: c.kamar_tidur as number | null,
      kamar_mandi: c.kamar_mandi as number | null,
      furnished: c.furnished as string | null,
      carport: c.carport as boolean | null,
      dapur: c.dapur as boolean | null,
      luas_bangunan_m2: c.luas_bangunan_m2 as number | null,
      deposit: c.deposit as number | null,
    },
    (commute?.distance_km as number) ?? null,
  );

  try {
    const text = await explainCandidate({
      title: c.title as string,
      scoreTotal: c.score_total as number | null,
      scoreHarga: c.score_harga as number | null,
      scoreLokasi: c.score_lokasi as number | null,
      scoreFasilitas: c.score_fasilitas as number | null,
      harga: c.harga_efektif_bulanan as number | null,
      budgetIdeal: (prefs?.budget_ideal as number) ?? null,
      budgetMax: (prefs?.budget_max as number) ?? null,
      distanceKm: (commute?.distance_km as number) ?? null,
      furnished: c.furnished as string | null,
      carport: c.carport as boolean | null,
      dapur: c.dapur as boolean | null,
      unknowns,
    });
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Penjelasan AI gagal." };
  }
}

export type ActionResult =
  | { ok: true; locationWarning?: string | null }
  | { ok: false; error: string };

export async function updateStatusAction(
  candidateId: string,
  status: CandidateStatus,
): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };
  if (!CANDIDATE_STATUSES.includes(status)) return { ok: false, error: "Status tidak valid." };

  const { error } = await supabaseAdmin
    .from("candidates")
    .update({ status })
    .eq("id", candidateId)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  await insertCandidateEvent(userId, candidateId, "status_changed", { to: status }, "manual");
  return { ok: true };
}

// S2-3: catatan manual di timeline.
export async function recordNoteAction(candidateId: string, text: string): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };
  if (!text.trim()) return { ok: false, error: "Catatan kosong." };

  const { data: owned } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("id", candidateId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!owned) return { ok: false, error: "Kandidat tidak ditemukan." };

  await insertCandidateEvent(userId, candidateId, "user_note", { text: text.trim() }, "manual");
  return { ok: true };
}

export async function deleteCandidateAction(candidateId: string): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };

  const { error } = await supabaseAdmin
    .from("candidates")
    .delete()
    .eq("id", candidateId)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Edit kandidat → update field + re-score (re-fetch jarak hanya bila alamat berubah).
export async function updateCandidateAction(
  candidateId: string,
  draft: ExtractedDraft,
  opts?: { typeData?: Record<string, unknown> },
): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };
  if (!draft.title?.trim()) return { ok: false, error: "Judul wajib diisi." };
  if (!draft.harga_sewa_bulanan || draft.harga_sewa_bulanan <= 0) {
    return { ok: false, error: "Harga sewa wajib diisi (lebih dari 0)." };
  }

  const { data: cur } = await supabaseAdmin
    .from("candidates")
    .select("alamat")
    .eq("id", candidateId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!cur) return { ok: false, error: "Kandidat tidak ditemukan." };
  const alamatChanged = (cur.alamat ?? null) !== (draft.alamat ?? null);

  const { error } = await supabaseAdmin
    .from("candidates")
    .update({
      title: draft.title.trim(),
      harga_sewa_bulanan: draft.harga_sewa_bulanan,
      periode_asli: draft.periode_asli,
      deposit: draft.deposit,
      kamar_tidur: draft.kamar_tidur,
      kamar_mandi: draft.kamar_mandi,
      luas_bangunan_m2: draft.luas_bangunan_m2,
      furnished: draft.furnished,
      carport: draft.carport,
      dapur: draft.dapur,
      alamat: draft.alamat,
      kontak_owner: draft.kontak_owner,
      deskripsi: draft.deskripsi,
      ...(opts?.typeData ? { type_specific_data: opts.typeData } : {}),
    })
    .eq("id", candidateId)
    .eq("user_id", userId);
  if (error) return { ok: false, error: `Gagal menyimpan: ${error.message}` };

  await insertCandidateEvent(userId, candidateId, "data_updated", { via: "edit" }, "manual");
  const r = await rescoreCandidate(userId, candidateId, { recomputeDistance: alamatChanged });
  return { ok: true, locationWarning: r.locationWarning };
}

// S2-4: catat harga akhir pasca-negosiasi → harga_akhir_bulanan (GENERATED harga_efektif COALESCE).
// Picu event price_changed + re-score (skor harga ikut harga efektif baru). Tanpa refetch jarak.
export async function recordNegotiationAction(
  candidateId: string,
  hargaAkhirBulanan: number | null,
): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };
  if (hargaAkhirBulanan != null && hargaAkhirBulanan <= 0) return { ok: false, error: "Harga akhir tidak valid." };

  const { data: cur } = await supabaseAdmin
    .from("candidates")
    .select("harga_sewa_bulanan, harga_akhir_bulanan")
    .eq("id", candidateId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!cur) return { ok: false, error: "Kandidat tidak ditemukan." };

  const { error } = await supabaseAdmin
    .from("candidates")
    .update({ harga_akhir_bulanan: hargaAkhirBulanan })
    .eq("id", candidateId)
    .eq("user_id", userId);
  if (error) return { ok: false, error: `Gagal menyimpan: ${error.message}` };

  await supabaseAdmin.from("candidate_events").insert({
    candidate_id: candidateId,
    user_id: userId,
    event_type: "price_changed",
    source: "manual",
    event_data: { from: cur.harga_sewa_bulanan, to: hargaAkhirBulanan },
  });

  const r = await rescoreCandidate(userId, candidateId);
  return { ok: true, locationWarning: r.locationWarning };
}

// Hitung ulang skor 1 kandidat (mis. kandidat lama tanpa jarak) — refetch jarak.
export async function rescoreCandidateAction(candidateId: string): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };
  const r = await rescoreCandidate(userId, candidateId, { recomputeDistance: true });
  return { ok: true, locationWarning: r.locationWarning };
}
