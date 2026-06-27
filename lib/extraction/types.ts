import type { Periode } from "@/lib/constants/periode";
import type { FurnishedStatus, PropertyType } from "@/lib/types/db";

// Hasil ekstraksi listing Kontrakan (selaras benchmark/schema.mjs + kolom candidates).
export type ExtractedDraft = {
  title: string | null;
  harga_asli: number | null; // harga sesuai listing (untuk periode_asli) — yang ditampilkan ke user
  harga_sewa_bulanan: number | null; // per-bulan turunan (untuk skor & banding)
  periode_asli: Periode | null;
  deposit: number | null;
  kamar_tidur: number | null;
  kamar_mandi: number | null;
  luas_bangunan_m2: number | null;
  furnished: FurnishedStatus | null;
  carport: boolean | null;
  dapur: boolean | null;
  alamat: string | null;
  kontak_owner: string | null;
  deskripsi: string | null; // info kualitatif tambahan (bebas banjir, akses jalan, minus, dll)
};

// Hasil ekstraksi lengkap: draft (kolom candidates) + klasifikasi tipe + raw JSON model
// (raw dipakai app untuk memetakan field khusus apartemen/kost ke type_specific_data).
export type ExtractionResult = {
  draft: ExtractedDraft;
  propertyType: PropertyType;
  raw: Record<string, unknown>;
};

export const EMPTY_DRAFT: ExtractedDraft = {
  title: null,
  harga_asli: null,
  harga_sewa_bulanan: null,
  periode_asli: null,
  deposit: null,
  kamar_tidur: null,
  kamar_mandi: null,
  luas_bangunan_m2: null,
  furnished: null,
  carport: null,
  dapur: null,
  alamat: null,
  kontak_owner: null,
  deskripsi: null,
};
