import type { ExtractedDraft } from "@/lib/extraction/types";

// Scoring RULE-BASED (bukan AI) — konsisten, bisa diaudit, dapat dijelaskan (FR-SC-1).
// Slice 1: 3 dimensi (Harga, Lokasi, Fasilitas). Slice 2: + Kondisi & Owner (dari survei).
// NULL satu dimensi → renormalisasi sisa bobot (bukan 0/50 — hindari sinyal palsu).
// scoring_version: v1-{n}D (belum disurvey) / v2-{n}D (sudah disurvey, dimensi Kondisi/Owner aktif).

export type Weights = { harga: number; lokasi: number; fasilitas: number; kondisi: number; owner: number };
export type Budget = { ideal: number | null; max: number | null };
// Skor 2 dimensi survei (0–100) yang sudah diturunkan dari rating & disimpan di candidates.
export type SurveyScores = { kondisi: number | null; owner: number | null };

export type ScoreResult = {
  scoring_version: string;
  score_total: number | null;
  score_harga: number | null;
  score_lokasi: number | null;
  score_fasilitas: number | null;
  score_kondisi: number | null;
  score_owner: number | null;
  breakdown: Record<string, unknown>;
};

// Rating 1–5 per aspek survei → dipakai menurunkan score_kondisi & score_owner.
export type SurveyRatings = {
  kebersihan: number | null;
  kebisingan: number | null;
  parkir: number | null;
  owner: number | null;
  keamanan: number | null;
  kondisi_bangunan: number | null;
};

// Owner = rating owner langsung (×20 → 0–100).
export function scoreOwnerFromSurvey(s: SurveyRatings): number | null {
  return s.owner == null ? null : clamp(s.owner * 20);
}
// Kondisi = rata-rata aspek fisik/lingkungan (kebersihan, kebisingan, parkir, keamanan, bangunan) ×20.
export function scoreKondisiFromSurvey(s: SurveyRatings): number | null {
  const parts = [s.kebersihan, s.kebisingan, s.parkir, s.keamanan, s.kondisi_bangunan].filter(
    (x): x is number => x != null,
  );
  if (parts.length === 0) return null;
  return clamp(Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 20));
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const r = (n: number | null) => (n == null ? null : Math.round(n));

export function scoreHarga(harga: number | null, ideal: number | null, max: number | null): number | null {
  if (harga == null || ideal == null) return null;
  if (harga <= ideal) return 100;
  const ceil = max ?? ideal * 1.25;
  if (harga <= ceil) {
    // Dalam zona ideal..max: turun 100 → 65.
    return clamp(100 - ((harga - ideal) / Math.max(1, ceil - ideal)) * 35);
  }
  // Di atas max: turun cepat 65 → 0 sepanjang +50% di atas max.
  return clamp(65 - ((harga - ceil) / Math.max(1, ceil * 0.5)) * 65);
}

export function scoreLokasi(distanceKm: number | null): number | null {
  if (distanceKm == null) return null;
  // Decay eksponensial: dekat tinggi, jauh turun halus tapi tetap > 0 (bisa bedakan 13km vs 62km).
  // 5km≈85, 10km≈72, 13km≈65, 20km≈51, 30km≈37, 50km≈19, 62km≈13.
  return clamp(Math.round(100 * Math.exp(-distanceKm / 30)));
}

export function scoreFasilitas(
  d: Pick<ExtractedDraft, "furnished" | "carport" | "dapur" | "luas_bangunan_m2">,
): number | null {
  const parts: number[] = [];
  if (d.furnished != null)
    parts.push(d.furnished === "furnished" ? 100 : d.furnished === "semi" ? 60 : 25);
  if (d.carport != null) parts.push(d.carport ? 100 : 35);
  if (d.dapur != null) parts.push(d.dapur ? 100 : 35);
  if (d.luas_bangunan_m2 != null) parts.push(clamp((d.luas_bangunan_m2 / 60) * 100));
  if (parts.length === 0) return null;
  return clamp(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export function computeScore(
  draft: ExtractedDraft,
  weights: Weights,
  budget: Budget,
  distanceKm: number | null,
  survey?: SurveyScores,
): ScoreResult {
  const sHarga = scoreHarga(draft.harga_sewa_bulanan, budget.ideal, budget.max);
  const sLokasi = scoreLokasi(distanceKm);
  const sFasil = scoreFasilitas(draft);
  const sKondisi = survey?.kondisi ?? null;
  const sOwner = survey?.owner ?? null;

  const dims = [
    { key: "harga", s: sHarga, w: weights.harga },
    { key: "lokasi", s: sLokasi, w: weights.lokasi },
    { key: "fasilitas", s: sFasil, w: weights.fasilitas },
    { key: "kondisi", s: sKondisi, w: weights.kondisi },
    { key: "owner", s: sOwner, w: weights.owner },
  ];
  const avail = dims.filter((d) => d.s != null);
  const wsum = avail.reduce((a, d) => a + (d.w || 0), 0) || 1;
  const total = avail.length
    ? Math.round(avail.reduce((a, d) => a + (d.s as number) * ((d.w || 0) / wsum), 0))
    : null;

  // v2 = sudah disurvey (dimensi Kondisi/Owner aktif). Konvensi CLAUDE.md #3: versi naik saat formula berubah.
  const surveyed = sKondisi != null || sOwner != null;

  return {
    scoring_version: `v${surveyed ? 2 : 1}-${avail.length}D`,
    score_total: total,
    score_harga: r(sHarga),
    score_lokasi: r(sLokasi),
    score_fasilitas: r(sFasil),
    score_kondisi: r(sKondisi),
    score_owner: r(sOwner),
    breakdown: {
      weights,
      budget,
      distanceKm,
      surveyed,
      dimensiTersedia: avail.map((d) => d.key),
      bobotRenormalisasi: Object.fromEntries(
        avail.map((d) => [d.key, Math.round(((d.w || 0) / wsum) * 100) / 100]),
      ),
    },
  };
}

// ── Kelengkapan data dimensi (coverage) — transparansi skor TANPA mengubah formula.
// Skor total tetap = rata-rata berbobot dimensi yang diketahui (renormalisasi). Coverage hanya
// MENANDAI berapa dimensi yang benar-benar punya data, agar "data bolong" tak menang diam-diam.
// Penting: dimensi survei (kondisi/owner) hanya dihitung "diharapkan" SETELAH hunian disurvey —
// "belum disurvey" ≠ data hilang. Jadi pra-survey total coverage = 3 (harga/lokasi/fasilitas).
export type DimScores = {
  score_harga: number | null;
  score_lokasi: number | null;
  score_fasilitas: number | null;
  score_kondisi: number | null;
  score_owner: number | null;
};

export const DIM_LABEL: Record<string, string> = {
  harga: "harga",
  lokasi: "jarak",
  fasilitas: "fasilitas",
  kondisi: "kondisi",
  owner: "owner",
};

export function dataCoverage(s: DimScores): { known: number; total: number; missing: string[] } {
  const surveyed = s.score_kondisi != null || s.score_owner != null;
  const dims: { key: string; v: number | null }[] = [
    { key: "harga", v: s.score_harga },
    { key: "lokasi", v: s.score_lokasi },
    { key: "fasilitas", v: s.score_fasilitas },
  ];
  if (surveyed) dims.push({ key: "kondisi", v: s.score_kondisi }, { key: "owner", v: s.score_owner });
  const missing = dims.filter((d) => d.v == null).map((d) => d.key);
  return { known: dims.length - missing.length, total: dims.length, missing };
}

// Deal breaker yang DAPAT dideteksi dari field Kontrakan Slice 1 (konservatif — hindari false flag).
// Sisanya (km_di_luar, lantai_3_tanpa_lift, bayar_setahun_dimuka) butuh survey/field lain → tidak auto-flag.
export function evalDealBreakers(activeKeys: string[], draft: ExtractedDraft): string[] {
  const violated = new Set<string>();
  for (const k of activeKeys) {
    if ((k === "no_dapur" || k === "no_memasak") && draft.dapur === false) violated.add(k);
  }
  return [...violated];
}
