"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { rescoreCandidate } from "@/lib/scoring/rescore";
import { scoreKondisiFromSurvey, scoreOwnerFromSurvey, type SurveyRatings } from "@/lib/scoring/score";
import type { FurnishedStatus } from "@/lib/types/db";

// Field objektif yang boleh dilengkapi saat survei (yang sebelumnya kosong di listing).
export type SurveyDataPatch = {
  kamar_tidur?: number | null;
  kamar_mandi?: number | null;
  furnished?: FurnishedStatus | null;
  carport?: boolean | null;
  dapur?: boolean | null;
  luas_bangunan_m2?: number | null;
  deposit?: number | null;
  alamat?: string | null;
  biaya_listrik?: string | null;
  biaya_air?: string | null;
  // S2-5: biaya numerik (display-only, untuk total all-in).
  biaya_listrik_nominal?: number | null;
  biaya_air_nominal?: number | null;
  biaya_ipl?: number | null;
  kontak_owner?: string | null;
};

export type SurveyTags = {
  kebersihan: string[];
  kebisingan: string[];
  parkir: string[];
  owner: string[];
  keamanan: string[];
  kondisi_bangunan: string[];
};

export type SurveyInput = {
  ratings: SurveyRatings;
  tags: SurveyTags;
  catatan: string | null;
  dataPatch: SurveyDataPatch;
};

export type SurveyResult = { ok: true; locationWarning: string | null } | { ok: false; error: string };

const filled = (v: unknown) => v !== null && v !== undefined && v !== "";

export async function saveSurveyAction(candidateId: string, input: SurveyInput): Promise<SurveyResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir. Masuk lagi." };

  // Verifikasi kepemilikan (RLS di-bypass service role → filter user_id WAJIB).
  const { data: owned } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("id", candidateId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!owned) return { ok: false, error: "Hunian tidak ditemukan." };

  // 1) Lengkapi data objektif (hanya field yang user isi).
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input.dataPatch)) if (filled(v)) patch[k] = v;
  const dataChanged = Object.keys(patch).length > 0;
  const alamatChanged = "alamat" in patch;

  // 2) Skor survei (Kondisi/Owner) dari rating.
  const sKondisi = scoreKondisiFromSurvey(input.ratings);
  const sOwner = scoreOwnerFromSurvey(input.ratings);

  // 3) Update candidates: patch data + skor survei + status sudah_disurvey.
  const { error: updErr } = await supabaseAdmin
    .from("candidates")
    .update({ ...patch, score_kondisi: sKondisi, score_owner: sOwner, status: "sudah_disurvey" })
    .eq("id", candidateId)
    .eq("user_id", userId);
  if (updErr) return { ok: false, error: `Gagal menyimpan: ${updErr.message}` };

  // 4) Upsert hasil survei (1 baris per kandidat).
  const { error: survErr } = await supabaseAdmin.from("candidate_surveys").upsert(
    {
      candidate_id: candidateId,
      kebersihan_rating: input.ratings.kebersihan,
      kebersihan_tags: input.tags.kebersihan,
      kebisingan_rating: input.ratings.kebisingan,
      kebisingan_tags: input.tags.kebisingan,
      parkir_rating: input.ratings.parkir,
      parkir_tags: input.tags.parkir,
      owner_rating: input.ratings.owner,
      owner_tags: input.tags.owner,
      keamanan_rating: input.ratings.keamanan,
      keamanan_tags: input.tags.keamanan,
      kondisi_bangunan_rating: input.ratings.kondisi_bangunan,
      kondisi_bangunan_tags: input.tags.kondisi_bangunan,
      catatan_survey: input.catatan,
      surveyed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "candidate_id" },
  );
  if (survErr) return { ok: false, error: `Gagal menyimpan survei: ${survErr.message}` };

  // 5) Catat event (timeline S2-3 mengonsumsi ini nanti).
  const events: Record<string, unknown>[] = [
    { candidate_id: candidateId, user_id: userId, event_type: "survey_completed", source: "manual", event_data: { ratings: input.ratings } },
  ];
  if (dataChanged) events.push({ candidate_id: candidateId, user_id: userId, event_type: "data_updated", source: "manual", event_data: { fields: Object.keys(patch) } });
  await supabaseAdmin.from("candidate_events").insert(events);

  // 6) Re-score kandidat ini → total 5D + scoring_version v2 (jarak di-refetch bila alamat berubah).
  const r = await rescoreCandidate(userId, candidateId, { recomputeDistance: alamatChanged });
  return { ok: true, locationWarning: r.locationWarning };
}
