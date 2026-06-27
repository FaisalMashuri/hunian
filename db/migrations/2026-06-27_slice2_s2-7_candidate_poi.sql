-- ==============================================================
-- MIGRATION — SLICE 2 · S2-7 (POI rute asli ter-cache)
-- Tabel: candidate_poi
-- Tanggal: 2026-06-27
-- Acuan: docs/DEVELOPMENT-PLAN.md §POI (DDL) · docs/DEVELOPMENT-PLAN-SLICE2.md (S2-7)
--
-- CARA PAKAI: jalankan SELURUH file ini di Supabase SQL editor (project zoxuqttewkipqkaiwxac).
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS + DROP POLICY IF EXISTS).
-- Catatan: di environment ini tabel SUDAH ada — file ini untuk reproducibility (version control).
--
-- KEAMANAN (lihat db/schema.sql SECTION 6): query server pakai service role yang BYPASS RLS.
-- candidate_poi TIDAK punya user_id langsung → SETIAP query server harus lewat candidate_id yang
-- sudah diverifikasi milik user (detail page memverifikasi candidates.user_id lebih dulu). RLS = backstop.
-- ==============================================================

BEGIN;

-- ---------------------------------------------------------------
-- candidate_poi — cache POI sekitar + hasil rute per kandidat.
--   straight_km : haversine (terisi saat fetch Overpass)
--   route_km/route_min : dari Google Directions (lazy, NULL sampai dihitung; UI fallback ke straight_km)
--   Biaya Directions terbayar SEKALI per (kandidat × POI) berkat UNIQUE(candidate_id, osm_id) + upsert.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_poi (
  id           uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid             NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  osm_id       text             NOT NULL,                 -- "node/123" dst (idempoten antar-fetch)
  category     text             NOT NULL,                 -- transport|grocery|health|education|worship|dining|highway
  name         text,
  lat          double precision NOT NULL,
  lng          double precision NOT NULL,
  straight_km  numeric(5,2)     NOT NULL,                 -- haversine
  route_km     numeric(5,2),                              -- Directions (lazy)
  route_min    integer,                                   -- durasi tempuh menit (lazy)
  mode         text,                                      -- driving|walking|transit saat route dihitung
  fetched_at   timestamptz      NOT NULL DEFAULT now(),
  CONSTRAINT uq_poi_candidate_osm UNIQUE (candidate_id, osm_id)
);

COMMENT ON TABLE candidate_poi IS
  'Cache POI sekitar + rute asli per kandidat (Slice 2 S2-7). Daftar POI dari Overpass; route_km/route_min dari Directions (lazy, top-N terpenting). UI pakai route_* bila ada, fallback straight_km.';

CREATE INDEX IF NOT EXISTS idx_poi_candidate ON candidate_poi (candidate_id);

-- ---------------------------------------------------------------
-- RLS (backstop) — owner VIA JOIN ke candidates (tabel tak punya user_id). Selaras pol_surveys_owner.
-- ---------------------------------------------------------------
ALTER TABLE candidate_poi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pol_poi_owner ON candidate_poi;
CREATE POLICY pol_poi_owner ON candidate_poi
  FOR ALL
  USING (
    candidate_id IN (
      SELECT id FROM candidates
       WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    )
  );

COMMIT;
