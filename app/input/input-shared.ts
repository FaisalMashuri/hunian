import type { ExtractedDraft } from "@/lib/extraction/types";

// Provenance tiap field di Review — menentukan badge (Terdeteksi/Manual/Kosong). Data nyata, bukan hardcoded.
export type FieldSource = "ai" | "manual" | "empty";
export type SourceMap = Partial<Record<keyof ExtractedDraft, FieldSource>>;

// Field yang dihitung untuk ringkasan "n dari N terdeteksi" (12 field inti — selaras mockup).
export const TRACKED_FIELDS: (keyof ExtractedDraft)[] = [
  "title",
  "harga_asli",
  "periode_asli",
  "deposit",
  "kamar_tidur",
  "kamar_mandi",
  "luas_bangunan_m2",
  "furnished",
  "carport",
  "dapur",
  "alamat",
  "kontak_owner",
];

// Kosong yang "perlu dilengkapi" (badge ⚠) vs sekadar opsional (badge ~).
export const WARN_IF_EMPTY: (keyof ExtractedDraft)[] = [
  "alamat",
  "kamar_tidur",
  "kamar_mandi",
  "furnished",
  "carport",
  "dapur",
];

export const filled = (v: unknown) => v !== null && v !== undefined && v !== "";

export const fmtRupiah = (n: number | null | undefined) =>
  n == null ? "" : "Rp " + new Intl.NumberFormat("id-ID").format(n);

export const parseRupiah = (s: string): number | null => {
  const d = s.replace(/\D/g, "");
  return d === "" ? null : Number(d);
};

// Bangun SourceMap awal sesudah ekstraksi AI (terisi → "ai", kosong → "empty").
export function sourceFromDraft(draft: ExtractedDraft, all: "ai" | "manual"): SourceMap {
  const m: SourceMap = {};
  for (const k of TRACKED_FIELDS) m[k] = filled(draft[k]) ? all : "empty";
  return m;
}
