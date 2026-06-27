import type { PropertyType } from "@/lib/types/db";

// Data spesifik per tipe properti (Slice 2 / S2-6) → disimpan di candidates.type_specific_data (JSONB).
// Field config dipakai bersama: form input, review, & render detail (single source).
export type TSKind = "text" | "int" | "rupiah" | "toggle";
export type TSField = { key: string; label: string; kind: TSKind; options?: string[]; placeholder?: string };

// Catatan: nama gedung/kost TIDAK disimpan di sini — pakai `title` (Nama Kandidat) sebagai
// nama apartemen/kost agar tidak redundan (lihat ApartemenForm/KostForm yang me-relabel title).
export const APARTEMEN_FIELDS: TSField[] = [
  { key: "lantai", label: "Lantai", kind: "int", placeholder: "12" },
  { key: "tower", label: "Tower", kind: "text", placeholder: "mis. Tower A" },
  { key: "nomor_unit", label: "Nomor Unit", kind: "text", placeholder: "mis. 12B" },
  { key: "tipe_unit", label: "Tipe Unit", kind: "toggle", options: ["Studio", "1BR", "2BR", "3BR"] },
  { key: "ipl", label: "IPL / Service / bln", kind: "rupiah", placeholder: "200.000" },
];

export const KOST_FIELDS: TSField[] = [
  { key: "km_posisi", label: "Kamar Mandi", kind: "toggle", options: ["Di Dalam", "Di Luar"] },
  { key: "tipe_penghuni", label: "Tipe Penghuni", kind: "toggle", options: ["Putra", "Putri", "Campur"] },
  { key: "jam_malam", label: "Jam Malam", kind: "text", placeholder: "mis. Pukul 22.00" },
];

export type TSValue = string | number | null;
export type TypeData = Record<string, TSValue>;

export function tsFields(pt: PropertyType): TSField[] {
  return pt === "apartemen" ? APARTEMEN_FIELDS : pt === "kost" ? KOST_FIELDS : [];
}

// Whitelist + buang kosong → object aman untuk disimpan ke JSONB (pengganti Zod sederhana).
export function cleanTypeData(pt: PropertyType, raw: TypeData): Record<string, TSValue> {
  const out: Record<string, TSValue> = {};
  for (const f of tsFields(pt)) {
    const v = raw[f.key];
    if (v !== null && v !== undefined && v !== "") out[f.key] = v;
  }
  return out;
}

// Normalisasi hasil ekstraksi AI (raw JSON) → TypeData sesuai konfigurasi field tipe.
// toggle dicocokkan case-insensitive ke opsi resmi; int/rupiah diangkakan; teks dirapikan.
export function coerceTypeData(pt: PropertyType, raw: Record<string, unknown>): TypeData {
  const out: TypeData = {};
  for (const f of tsFields(pt)) {
    const v = raw[f.key];
    if (v === null || v === undefined || v === "") continue;
    if (f.kind === "toggle") {
      const match = f.options!.find((o) => o.toLowerCase() === String(v).trim().toLowerCase());
      if (match) out[f.key] = match;
    } else if (f.kind === "rupiah" || f.kind === "int") {
      const n = Number(String(v).replace(/[^\d.-]/g, ""));
      if (Number.isFinite(n)) out[f.key] = f.kind === "rupiah" ? Math.round(n) : n;
    } else {
      out[f.key] = String(v).trim();
    }
  }
  return out;
}
