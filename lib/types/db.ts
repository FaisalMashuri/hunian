// Tipe enum DB — selaras db/schema.sql SECTION 2.
// Catatan: periode_asli BUKAN enum di DB (TEXT + CHECK) — lihat lib/constants/periode.ts.

export const PROPERTY_TYPES = ["kontrakan", "apartemen", "kost"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const CANDIDATE_STATUSES = ["tersedia", "sudah_disurvey", "sudah_tersewa"] as const;
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

export const FURNISHED_STATUSES = ["furnished", "semi", "unfurnished"] as const;
export type FurnishedStatus = (typeof FURNISHED_STATUSES)[number];

export const TRANSPORT_MODES = ["motor", "mobil", "transit", "jalan_kaki_sepeda"] as const;
export type TransportMode = (typeof TRANSPORT_MODES)[number];

// Moda aktif di Slice 1 (schema siap 4 — NFR-8).
export const TRANSPORT_MODES_SLICE1: TransportMode[] = ["motor", "mobil"];
