// SINGLE SOURCE OF TRUTH untuk periode harga.
// Dipakai oleh: validasi Zod ekstraksi AI, DB CHECK constraint (db/schema.sql chk_periode_asli),
// dan benchmark/schema.mjs. Jika berubah, ubah di sini DAN di db/schema.sql + schema.mjs.
// (Risiko HIGH yang diidentifikasi Devil's Advocate: drift enum periode -> silent failure.)

export const PERIODE_VALUES = ["bulan", "3bulan", "6bulan", "tahun"] as const;

export type Periode = (typeof PERIODE_VALUES)[number];

export function isPeriode(v: unknown): v is Periode {
  return typeof v === "string" && (PERIODE_VALUES as readonly string[]).includes(v);
}

// Faktor konversi ke per-bulan (FR-IN-3 / FR-AI-2).
export const PERIODE_TO_MONTHS: Record<Periode, number> = {
  bulan: 1,
  "3bulan": 3,
  "6bulan": 6,
  tahun: 12,
};
