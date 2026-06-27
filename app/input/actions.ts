"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { extractListing } from "@/lib/extraction/extract";
import type { ExtractedDraft } from "@/lib/extraction/types";
import { computeScore, evalDealBreakers, type Weights } from "@/lib/scoring/score";
import { getDistanceKm } from "@/lib/maps/distance";
import { insertCandidateEvent } from "@/lib/events";
import { coerceTypeData, type TypeData } from "./type-specific";
import type { TransportMode, PropertyType } from "@/lib/types/db";

export type ExtractResult =
  | { ok: true; draft: ExtractedDraft; propertyType: PropertyType; typeData: TypeData }
  | { ok: false; error: string };

export async function extractAction(text: string): Promise<ExtractResult> {
  if (!text.trim()) return { ok: false, error: "Teks listing masih kosong." };
  try {
    const { draft, propertyType, raw } = await extractListing(text);
    return { ok: true, draft, propertyType, typeData: coerceTypeData(propertyType, raw) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ekstraksi AI gagal. Coba lagi." };
  }
}

export type SaveResult =
  | { ok: true; id: string; locationWarning?: string | null }
  | { ok: false; error: string };

export async function saveCandidate(
  draft: ExtractedDraft,
  sourceText: string | null,
  opts?: { manualDistanceKm?: number | null; propertyType?: PropertyType; typeData?: Record<string, unknown> },
): Promise<SaveResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir. Masuk lagi." };

  if (!draft.title?.trim()) return { ok: false, error: "Judul wajib diisi." };
  if (!draft.harga_sewa_bulanan || draft.harga_sewa_bulanan <= 0) {
    return { ok: false, error: "Harga sewa wajib diisi (lebih dari 0)." };
  }

  // Preferensi user untuk scoring + tujuan (jarak).
  const { data: prefs } = await supabaseAdmin
    .from("user_preferences")
    .select(
      "weight_harga, weight_lokasi, weight_fasilitas, weight_keamanan, weight_owner, budget_ideal, budget_max, dest_address, transport_modes",
    )
    .eq("user_id", userId)
    .maybeSingle();

  // Kandidat baru belum disurvey → dimensi Kondisi/Owner null (skor 3D); bobot tetap disertakan.
  const weights: Weights = {
    harga: (prefs?.weight_harga as number) ?? 0.34,
    lokasi: (prefs?.weight_lokasi as number) ?? 0.33,
    fasilitas: (prefs?.weight_fasilitas as number) ?? 0.33,
    kondisi: (prefs?.weight_keamanan as number) ?? 0.2,
    owner: (prefs?.weight_owner as number) ?? 0.2,
  };

  // Jarak ke tujuan via Google Maps (skor lokasi). Error dimunculkan ke user (locationWarning).
  const modes = (prefs?.transport_modes as TransportMode[] | null) ?? [];
  const primaryMode: TransportMode = modes[0] ?? "motor";
  let distanceKm: number | null = null;
  let locationWarning: string | null = null;
  let usedManualDistance = false;
  if (draft.alamat) {
    const dist = await getDistanceKm((prefs?.dest_address as string) ?? "", draft.alamat, primaryMode);
    distanceKm = dist.km;
    locationWarning = dist.error;
  } else {
    locationWarning = "Alamat kosong — skor lokasi dilewati.";
  }
  // Fallback manual: bila auto gagal/alamat kosong & user mengisi km sendiri (input Review).
  const manualKm = opts?.manualDistanceKm ?? null;
  if (distanceKm == null && manualKm != null && manualKm > 0) {
    distanceKm = manualKm;
    usedManualDistance = true;
    locationWarning = null;
  }

  const score = computeScore(
    draft,
    weights,
    { ideal: (prefs?.budget_ideal as number) ?? null, max: (prefs?.budget_max as number) ?? null },
    distanceKm,
  );

  const { data, error } = await supabaseAdmin
    .from("candidates")
    .insert({
      user_id: userId,
      property_type: opts?.propertyType ?? "kontrakan",
      type_specific_data: opts?.typeData ?? {},
      status: "tersedia",
      title: draft.title.trim(),
      source_text: sourceText,
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
      scoring_version: score.scoring_version,
      score_total: score.score_total,
      score_harga: score.score_harga,
      score_lokasi: score.score_lokasi,
      score_fasilitas: score.score_fasilitas,
      score_breakdown: score.breakdown,
      score_computed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: `Gagal menyimpan kandidat: ${error.message}` };
  const candidateId = data.id as string;

  // Timeline (S2-3): event "kandidat ditambahkan".
  await insertCandidateEvent(userId, candidateId, "added", { via: sourceText ? "paste" : "manual" }, "auto");

  // Jarak (Google Maps) -> candidate_commute.
  if (distanceKm != null) {
    await supabaseAdmin.from("candidate_commute").insert({
      candidate_id: candidateId,
      transport_mode: primaryMode,
      distance_km: distanceKm,
      api_provider: usedManualDistance ? "manual" : "google_maps",
    });
  }

  // Deal breaker: evaluasi yang terdeteksi → flag (tidak menghapus kandidat).
  const { data: userDbs } = await supabaseAdmin
    .from("user_deal_breakers")
    .select("id, deal_breaker_key, is_active")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (userDbs && userDbs.length > 0) {
    const activeKeys = userDbs
      .map((d) => d.deal_breaker_key as string | null)
      .filter((k): k is string => !!k);
    const violatedKeys = new Set(evalDealBreakers(activeKeys, draft));
    const flags = userDbs
      .filter((d) => d.deal_breaker_key && violatedKeys.has(d.deal_breaker_key as string))
      .map((d) => ({ candidate_id: candidateId, deal_breaker_id: d.id as string }));
    if (flags.length > 0) {
      await supabaseAdmin.from("candidate_deal_breaker_flags").insert(flags);
    }
  }

  return { ok: true, id: candidateId, locationWarning };
}
