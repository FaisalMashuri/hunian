-- ==============================================================
-- MIGRATION — SLICE 2 · S2-0 (Aktivasi DB)
-- Tabel: candidate_surveys, candidate_events
-- Tanggal: 2026-06-27
-- Acuan: docs/DEVELOPMENT-PLAN-SLICE2.md (S2-0/S2-2/S2-3) ·
--        next-feature/slice2-prioritisasi.md (APPROVED) ·
--        db/schema.sql SECTION 8 (DDL referensi)
--
-- CARA PAKAI: jalankan SELURUH file ini di Supabase SQL editor (project zoxuqttewkipqkaiwxac).
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS + CREATE OR REPLACE + DROP POLICY IF EXISTS).
--
-- KEAMANAN (lihat db/schema.sql SECTION 6): query server pakai service role yang BYPASS RLS —
-- jadi LAYER PRIMER tetap "filter user_id dari sesi NextAuth WAJIB di setiap query".
-- Kedua tabel ini TIDAK punya user_id langsung kecuali candidate_events; SETIAP query
-- candidate_surveys WAJIB JOIN ke candidates WHERE user_id = <sesi>. RLS di bawah = backstop.
-- ==============================================================

BEGIN;

-- ---------------------------------------------------------------
-- 1) candidate_surveys — hasil survei lapangan (rating bintang + tag), 1 baris per kandidat
--    Saat aktif: score_kondisi & score_owner di candidates diisi dari rating (kolom sudah ada).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_surveys (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id    uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  kebersihan_rating       smallint CHECK (kebersihan_rating BETWEEN 1 AND 5),
  kebersihan_tags         text[],
  kebisingan_rating       smallint CHECK (kebisingan_rating BETWEEN 1 AND 5),
  kebisingan_tags         text[],
  parkir_rating           smallint CHECK (parkir_rating BETWEEN 1 AND 5),
  parkir_tags             text[],
  owner_rating            smallint CHECK (owner_rating BETWEEN 1 AND 5),
  owner_tags              text[],
  keamanan_rating         smallint CHECK (keamanan_rating BETWEEN 1 AND 5),
  keamanan_tags           text[],
  kondisi_bangunan_rating smallint CHECK (kondisi_bangunan_rating BETWEEN 1 AND 5),
  kondisi_bangunan_tags   text[],
  catatan_survey  text,
  surveyed_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_survey_candidate UNIQUE (candidate_id)
);

COMMENT ON TABLE candidate_surveys IS
  'Survei lapangan per kandidat (Slice 2). 1 baris/kandidat (UNIQUE) -> upsert. score_kondisi/score_owner diturunkan dari rating; re-survey: log candidate_events survey_completed agar history tak hilang.';

CREATE INDEX IF NOT EXISTS idx_survey_candidate ON candidate_surveys (candidate_id);

-- ---------------------------------------------------------------
-- 2) candidate_events — timeline aktivitas per kandidat (auto + manual)
--    Punya user_id langsung -> RLS owner sederhana + memudahkan query timeline per user.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type   text        NOT NULL,
  source       text        NOT NULL DEFAULT 'auto' CHECK (source IN ('auto','manual')),
  event_data   jsonb       NOT NULL DEFAULT '{}',
  occurred_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- event_type yang dikenal Slice 2 (bukan enum agar mudah ditambah; CHECK longgar):
  CONSTRAINT chk_event_type CHECK (event_type IN (
    'added','status_changed','data_updated','survey_completed',
    'verdict_changed','price_changed','user_note','call_log','negotiation','appointment'
  ))
);

COMMENT ON TABLE candidate_events IS
  'Timeline event per kandidat (Slice 2). Diisi side-effect dari aksi yang sudah ada (added/status_changed/survey_completed/price_changed/user_note). UI timeline = S2-3 (ditunda); S2-0 cukup isi data.';

CREATE INDEX IF NOT EXISTS idx_events_candidate_time ON candidate_events (candidate_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_time      ON candidate_events (user_id, occurred_at DESC);

-- ---------------------------------------------------------------
-- 3) Trigger updated_at untuk candidate_surveys (re-survey via upsert menyentuh updated_at)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION slice2_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_survey_updated_at ON candidate_surveys;
CREATE TRIGGER tg_survey_updated_at
  BEFORE UPDATE ON candidate_surveys
  FOR EACH ROW EXECUTE FUNCTION slice2_set_updated_at();

-- ---------------------------------------------------------------
-- 4) RLS (backstop default-deny + policy GUC owner — selaras SECTION 6)
--    LAYER PRIMER tetap filter user_id di kode server (service role bypass RLS).
-- ---------------------------------------------------------------
ALTER TABLE candidate_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_events  ENABLE ROW LEVEL SECURITY;

-- candidate_events: owner langsung (punya user_id) — pola sama pol_candidates_owner.
DROP POLICY IF EXISTS pol_events_owner ON candidate_events;
CREATE POLICY pol_events_owner ON candidate_events
  FOR ALL
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

-- candidate_surveys: tanpa user_id -> owner VIA JOIN ke candidates (cegah leak antar user).
DROP POLICY IF EXISTS pol_surveys_owner ON candidate_surveys;
CREATE POLICY pol_surveys_owner ON candidate_surveys
  FOR ALL
  USING (
    candidate_id IN (
      SELECT id FROM candidates
       WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    )
  );

COMMIT;

-- ==============================================================
-- VERIFIKASI (opsional — jalankan terpisah, BUKAN sebagai service role)
-- ==============================================================
-- Tujuan: pastikan default-deny aktif (unauth/lintas-user -> 0 row) tanpa GUC di-set.
-- Jalankan sebagai role 'authenticated'/'anon' (non-BYPASSRLS). Harus mengembalikan 0:
--
--   SET ROLE authenticated;          -- atau anon
--   SELECT count(*) FROM candidate_surveys;   -- expect 0 (tanpa GUC, policy menyembunyikan semua)
--   SELECT count(*) FROM candidate_events;    -- expect 0
--   RESET ROLE;
--
-- Catatan: jalur SERVER (service role) sengaja BYPASS RLS. Penjaga nyata = filter user_id di kode.
-- Untuk candidate_surveys, setiap query server WAJIB JOIN candidates WHERE user_id = <sesi>
-- (atau ambil candidate_id yang sudah diverifikasi milik user lebih dulu).
-- Integration test app-layer (S2-2): query survei/event kandidat milik user lain -> 0 row.

-- ==============================================================
-- LANGKAH MANUAL TERKAIT S2-0 (di luar SQL ini)
-- ==============================================================
-- (a) Supabase Storage: buat bucket 'candidate-photos' (private) untuk S2-1 (foto nyata).
--     Bisa via dashboard Storage, atau SQL:
--       insert into storage.buckets (id, name, public)
--       values ('candidate-photos','candidate-photos', false)
--       on conflict (id) do nothing;
--     (Policy storage.objects detail = S2-1, belum di sini.)
-- (b) scoring_version: TIDAK perlu DDL — kolom candidates.scoring_version (text, default '1.0')
--     sudah ada. App akan menulis '2.0' saat formula 5-dimensi aktif (S2-2) + migrasi one-shot.
-- (c) Biaya all-in numeric (biaya_listrik_nominal/biaya_air_nominal) = migrasi S2-5 terpisah,
--     bukan bagian S2-0.
