-- ==============================================================
-- MIGRATION — SLICE 2 · S2-1 (Foto kandidat nyata)
-- Tanggal: 2026-06-27
-- Acuan: docs/DEVELOPMENT-PLAN-SLICE2.md (S2-1)
--
-- 1) Kolom `source` di candidate_photos (bedakan foto listing vs foto survei).
-- 2) Bucket Storage `candidate-photos` (private). Akses via service role server-side + signed URL.
--    Tak perlu policy storage.objects untuk anon/authenticated (app pakai service role, NextAuth identity).
--
-- CARA PAKAI: jalankan di Supabase SQL editor. Idempoten.
-- ==============================================================

ALTER TABLE candidate_photos
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'listing'
    CHECK (source IN ('listing', 'survey'));

COMMENT ON COLUMN candidate_photos.source IS 'Sumber foto: listing (dari iklan) atau survey (kunjungan langsung).';

-- Bucket privat untuk foto kandidat (signed URL di-generate server-side).
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-photos', 'candidate-photos', false)
ON CONFLICT (id) DO NOTHING;
