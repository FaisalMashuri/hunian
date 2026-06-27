-- ==============================================================
-- MIGRATION — SLICE 2 · S2-5 (Biaya all-in: kolom numerik)
-- Tanggal: 2026-06-27
-- Acuan: docs/DEVELOPMENT-PLAN-SLICE2.md (S2-5) · next-feature/slice2-prioritisasi.md
--
-- Keputusan tim: biaya all-in = DISPLAY-ONLY (TIDAK masuk scoring → hindari false precision).
-- Kolom teks lama (biaya_listrik/biaya_air) DIPERTAHANKAN untuk deskripsi ("Token", dll);
-- kolom numerik baru dipakai menghitung total all-in yang andal. biaya_ipl (numeric) sudah ada.
--
-- CARA PAKAI: jalankan di Supabase SQL editor SEBELUM memakai form biaya numerik / kartu all-in.
-- Idempoten (ADD COLUMN IF NOT EXISTS).
-- ==============================================================

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS biaya_listrik_nominal numeric(12,0),
  ADD COLUMN IF NOT EXISTS biaya_air_nominal     numeric(12,0);

COMMENT ON COLUMN candidates.biaya_listrik_nominal IS 'Estimasi listrik/bln (Rp) untuk total all-in — DISPLAY-ONLY, tak masuk scoring. Teks deskriptif tetap di biaya_listrik.';
COMMENT ON COLUMN candidates.biaya_air_nominal     IS 'Estimasi air/bln (Rp) untuk total all-in — DISPLAY-ONLY, tak masuk scoring. Teks deskriptif tetap di biaya_air.';
