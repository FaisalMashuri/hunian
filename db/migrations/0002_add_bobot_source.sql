-- Migration 0002 — tambah kolom bobot_source ke user_preferences.
-- Kolom ini rekomendasi sesi UX (audit asal bobot) yang muncul setelah schema.sql awal.
-- Jalankan di Supabase SQL editor bila tabel user_preferences sudah dibuat dari schema.sql versi awal.

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS bobot_source text NOT NULL DEFAULT 'user-defined';

ALTER TABLE user_preferences
  DROP CONSTRAINT IF EXISTS chk_bobot_source;

ALTER TABLE user_preferences
  ADD CONSTRAINT chk_bobot_source CHECK (bobot_source IN ('user-defined', 'default-equal'));

-- Paksa PostgREST memuat ulang schema cache (kalau error "column not found in schema cache" masih muncul).
NOTIFY pgrst, 'reload schema';
