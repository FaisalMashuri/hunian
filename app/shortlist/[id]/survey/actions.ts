"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { assertCandidateAccess } from "@/lib/authz/candidate";
import { rescoreCandidate } from "@/lib/scoring/rescore";
import { scoreKondisiFromSurvey, scoreOwnerFromSurvey, type SurveyRatings } from "@/lib/scoring/score";
import { listUnknowns } from "@/lib/extraction/unknowns";
import { suggestOwnerQuestions, type QuestionGroup } from "@/lib/advisor/owner-questions";
import type { FurnishedStatus } from "@/lib/types/db";

export type { QuestionGroup } from "@/lib/advisor/owner-questions";

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

  // Collaboration: editor (atau owner) boleh isi survei. Operasi memakai ownerId (data pemilik).
  const access = await assertCandidateAccess(userId, candidateId, "editor").catch(() => null);
  if (!access) return { ok: false, error: "Kamu tidak punya akses untuk mengisi survei hunian ini." };
  const ownerId = access.ownerId;

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
    .eq("user_id", ownerId);
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
    { candidate_id: candidateId, user_id: ownerId, event_type: "survey_completed", source: "manual", event_data: { ratings: input.ratings } },
  ];
  if (dataChanged) events.push({ candidate_id: candidateId, user_id: ownerId, event_type: "data_updated", source: "manual", event_data: { fields: Object.keys(patch) } });
  await supabaseAdmin.from("candidate_events").insert(events);

  // 6) Re-score kandidat ini → total 5D + scoring_version v2 (jarak di-refetch bila alamat berubah).
  const r = await rescoreCandidate(ownerId, candidateId, { recomputeDistance: alamatChanged });
  return { ok: true, locationWarning: r.locationWarning };
}

// ── AI advisor: pertanyaan untuk pemilik (dipakai di halaman survei) ─────────────
export type SuggestResult = { ok: true; groups: QuestionGroup[]; fromAI: boolean } | { ok: false; error: string };

const DB_LABELS: Record<string, string> = {
  no_parkir_motor: "Tidak ada parkir motor",
  km_di_luar: "Kamar mandi di luar",
  no_memasak: "Tidak boleh masak",
  bayar_setahun_dimuka: "Bayar tahunan di muka",
  no_dapur: "Tidak ada dapur",
  lantai_3_tanpa_lift: "Lantai >3 tanpa lift",
  no_pasutri: "Tidak boleh pasutri",
};

// Fallback statis (dipakai bila AI gagal / OPENAI_API_KEY belum diset) — tetap berguna.
const FALLBACK_QUESTIONS: QuestionGroup[] = [
  { category: "Biaya & pembayaran", questions: ["Listrik & air ditagih terpisah atau sudah termasuk? Kira-kira berapa/bulan?", "Ada IPL/iuran/biaya sampah/parkir?", "Cara & jadwal bayar (transfer/tunai, tiap tanggal berapa)?"] },
  { category: "Deposit & kontrak", questions: ["Deposit berapa dan syarat pengembaliannya apa?", "Minimal kontrak berapa lama? Ada denda kalau keluar lebih awal?", "Harga naik berapa saat perpanjang?"] },
  { category: "Aturan", questions: ["Boleh tamu menginap? Boleh pasutri/keluarga?", "Boleh pelihara hewan / renovasi kecil / pasang paku?"] },
  { category: "Kondisi & perawatan", questions: ["Kalau ada kerusakan (bocor, listrik, air), siapa yang tanggung?", "Kapan terakhir dicat/diperbaiki? Ada riwayat banjir?"] },
  { category: "Lingkungan & keamanan", questions: ["Ada satpam/portal? Bagaimana keamanan malam hari?", "Tetangga & suasana sekitar seperti apa (bising/ramai)?"] },
];

export async function suggestOwnerQuestionsAction(candidateId: string): Promise<SuggestResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir. Masuk lagi." };
  const access = await assertCandidateAccess(userId, candidateId, "viewer").catch(() => null);
  if (!access) return { ok: false, error: "Kamu tidak punya akses ke hunian ini." };
  const ownerId = access.ownerId;

  const { data: c } = await supabaseAdmin
    .from("candidates")
    .select("title, property_type, harga_efektif_bulanan, deposit, periode_asli, furnished, kamar_tidur, kamar_mandi, luas_bangunan_m2, carport, dapur")
    .eq("id", candidateId)
    .eq("user_id", ownerId)
    .maybeSingle();
  if (!c) return { ok: false, error: "Hunian tidak ditemukan." };

  const [{ data: commute }, { data: dbs }] = await Promise.all([
    supabaseAdmin.from("candidate_commute").select("distance_km").eq("candidate_id", candidateId).limit(1).maybeSingle(),
    supabaseAdmin.from("user_deal_breakers").select("deal_breaker_key, custom_text").eq("user_id", ownerId).eq("is_active", true),
  ]);

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
  const dealBreakers = (dbs ?? [])
    .map((d) => (d.custom_text as string) || DB_LABELS[d.deal_breaker_key as string] || (d.deal_breaker_key as string))
    .filter(Boolean);

  try {
    const groups = await suggestOwnerQuestions({
      title: c.title as string,
      propertyType: (c.property_type as string) ?? "kontrakan",
      hargaBulanan: (c.harga_efektif_bulanan as number) ?? null,
      deposit: (c.deposit as number) ?? null,
      periode: (c.periode_asli as string) ?? null,
      furnished: (c.furnished as string) ?? null,
      unknowns,
      dealBreakers,
    });
    if (groups.length > 0) return { ok: true, groups, fromAI: true };
  } catch {
    /* AI gagal → fallback statis */
  }
  return { ok: true, groups: FALLBACK_QUESTIONS, fromAI: false };
}
