-- ==============================================================
-- HUNIAN — Slice 1 Schema Migration (REVISI FINAL)
-- Date: 2026-06-26
-- Target: Supabase PostgreSQL v14+
-- Sumber: sesi agent team "ERD + Schema DB Slice 1"
--   (TL desain → PM scope → DA challenge → TL revisi → SYN → PO ALIGNED)
-- Catatan desain & ERD: docs/ERD.md
-- ==============================================================


-- ==============================================================
-- SECTION 1 — EXTENSIONS & HELPERS
-- ==============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Trigger function: set updated_at = now() pada setiap UPDATE
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ==============================================================
-- SECTION 2 — CUSTOM TYPES
-- ==============================================================

-- Jenis properti; Slice 1 aktif: kontrakan
CREATE TYPE property_type AS ENUM ('kontrakan', 'apartemen', 'kost');

-- Status kandidat dalam pipeline user
CREATE TYPE candidate_status AS ENUM ('tersedia', 'sudah_disurvey', 'sudah_tersewa');

-- Status furnitur kandidat
CREATE TYPE furnished_status AS ENUM ('furnished', 'semi', 'unfurnished');

-- Moda transportasi untuk commute scoring (4 moda siap; Slice 1: motor/mobil)
CREATE TYPE transport_mode AS ENUM ('motor', 'mobil', 'transit', 'jalan_kaki_sepeda');

-- R3: periode_sewa TIDAK jadi enum — gunakan TEXT + CHECK (lihat tabel candidates)


-- ==============================================================
-- SECTION 3 — CORE USER TABLES
-- ==============================================================

-- Di-upsert dari NextAuth signIn callback (service role), conflict key: google_sub
CREATE TABLE users (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  google_sub  text        UNIQUE NOT NULL,
  email       text        UNIQUE NOT NULL,
  name        text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  users            IS 'Akun user; di-upsert dari NextAuth signIn callback via service role (BUKAN Supabase Auth)';
COMMENT ON COLUMN users.google_sub IS 'Google OAuth subject — conflict key untuk upsert';

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------

-- 1:1 dengan users; dibuat/diupdate selama flow onboarding
CREATE TABLE user_preferences (
  user_id              uuid        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  budget_ideal         numeric(12,0),
  budget_max           numeric(12,0),
  dest_address         text,
  dest_lat             double precision,
  dest_lng             double precision,
  transport_modes      transport_mode[],   -- multi-moda; Slice 1: motor/mobil
  priority_selection   text[],             -- label mentah pilihan user
  weight_harga         numeric,
  weight_lokasi        numeric,
  weight_fasilitas     numeric,
  weight_keamanan      numeric,            -- placeholder Slice 2; simpan agar total bobot konsisten
  weight_owner         numeric,            -- placeholder Slice 2; simpan agar total bobot konsisten
  bobot_source         text        NOT NULL DEFAULT 'user-defined',  -- audit asal bobot: 'user-defined' | 'default-equal'
  deadline_pindah      date,               -- step ditunda; kolom disiapkan Slice 2+
  onboarding_completed boolean     NOT NULL DEFAULT false,  -- R5: gantikan integer step posisional
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_bobot_source CHECK (bobot_source IN ('user-defined', 'default-equal')),
  CONSTRAINT chk_budget_max_gte_ideal CHECK (
    budget_max IS NULL OR budget_ideal IS NULL OR budget_max >= budget_ideal
  )
);

COMMENT ON COLUMN user_preferences.onboarding_completed IS 'R5: boolean; gantikan integer step posisional';
COMMENT ON COLUMN user_preferences.weight_keamanan      IS 'Placeholder aktif Slice 2; disimpan agar total bobot tidak bergeser';
COMMENT ON COLUMN user_preferences.weight_owner         IS 'Placeholder aktif Slice 2; disimpan agar total bobot tidak bergeser';
COMMENT ON COLUMN user_preferences.deadline_pindah      IS 'Step ditunda; kolom disiapkan Slice 2+';

CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------

-- Deal breakers per user: preset slug ATAU custom text
CREATE TABLE user_deal_breakers (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_breaker_key  text,       -- slug preset: no_parkir_motor|km_di_luar|no_dapur|no_memasak|lantai_3_tanpa_lift|bayar_setahun_dimuka|no_pasutri
  custom_text       text,
  is_active         boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_key_or_custom CHECK (
    deal_breaker_key IS NOT NULL
    OR (custom_text IS NOT NULL AND length(trim(custom_text)) > 0)
  )
);

COMMENT ON TABLE  user_deal_breakers                  IS 'Deal breakers per user; minimal satu dari key/custom_text harus diisi';
COMMENT ON COLUMN user_deal_breakers.deal_breaker_key IS 'Slug preset; NULL jika custom';


-- ==============================================================
-- SECTION 4 — CANDIDATE TABLES
-- ==============================================================

CREATE TABLE candidates (
  -- Identitas & status
  id             uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_type  property_type    NOT NULL DEFAULT 'kontrakan',
  status         candidate_status NOT NULL DEFAULT 'tersedia',

  -- Input sumber
  title          text             NOT NULL,
  kontak_owner   text,
  platform_asal  text,
  source_text    text,
  deskripsi      text,
  alamat         text,
  location_lat   double precision,
  location_lng   double precision,
  catatan        text,

  -- Harga (R2 — SEMANTIK TERKUNCI, JANGAN RENAME/REINTERPRETASI)
  -- harga_sewa_bulanan    = harga LISTING/ASLI per bulan; immutable setelah disimpan; selaras schema.mjs
  -- harga_akhir_bulanan   = harga pasca negosiasi [Slice 2]; NULL di Slice 1
  -- harga_efektif_bulanan = GENERATED COALESCE(akhir, asli); scoring SELALU baca kolom ini
  harga_sewa_bulanan     numeric(12,0)   NOT NULL,
  harga_akhir_bulanan    numeric(12,0),
  harga_terpilih_bulanan numeric(12,0),  -- per-bulan dari skema sewa yang DIPILIH user (multi-skema)
  harga_efektif_bulanan  numeric(12,0)   GENERATED ALWAYS AS (
                           COALESCE(harga_akhir_bulanan, harga_terpilih_bulanan, harga_sewa_bulanan)
                         ) STORED,
  deposit                numeric(12,0),
  -- R3: TEXT + CHECK selaras schema.mjs; nilai tak dikenali dari AI -> NULL, bukan error insert
  periode_asli           text,
  selected_periode       text,           -- periode skema sewa yang DIPILIH user (multi-skema)
  price_schemes          jsonb,          -- array skema harga: {periode,harga,basis,basis_confirmed}
  periode_minimum        text,
  biaya_ipl              numeric(12,0),
  biaya_listrik          text,
  biaya_air              text,

  -- Detail fisik
  kamar_tidur        int,
  kamar_mandi        int,
  luas_bangunan_m2   numeric(7,2),
  furnished          furnished_status,
  carport            boolean,
  dapur              boolean,

  -- Scoring (diisi RULE ENGINE, bukan AI — FR-AI-3)
  scoring_version    text        NOT NULL DEFAULT '1.0',
  score_total        numeric(5,2),
  score_harga        numeric(5,2),
  score_lokasi       numeric(5,2),
  score_fasilitas    numeric(5,2),
  score_kondisi      numeric(5,2),   -- placeholder Slice 2 (butuh survey)
  score_owner        numeric(5,2),   -- placeholder Slice 2 (butuh survey)
  score_breakdown    jsonb,
  score_computed_at  timestamptz,

  -- Metadata ekstraksi (domain AI: extraction/normalization/explanation)
  extraction_confidence  jsonb,
  -- R4: bentuk per-jenis dikunci konstanta TS + divalidasi Zod sebelum insert; Slice 1 selalu {}
  type_specific_data     jsonb   NOT NULL DEFAULT '{}',

  -- Timestamps
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT chk_periode_asli CHECK (
    periode_asli IS NULL OR periode_asli IN ('bulan','3bulan','6bulan','tahun')
  ),
  CONSTRAINT chk_selected_periode CHECK (
    selected_periode IS NULL OR selected_periode IN ('bulan','3bulan','6bulan','tahun')
  ),
  CONSTRAINT chk_price_schemes_array CHECK (
    price_schemes IS NULL OR jsonb_typeof(price_schemes) = 'array'
  ),
  CONSTRAINT chk_harga_sewa_positif   CHECK (harga_sewa_bulanan > 0),
  CONSTRAINT chk_harga_akhir_positif  CHECK (harga_akhir_bulanan IS NULL OR harga_akhir_bulanan > 0),
  CONSTRAINT chk_deposit_non_negatif  CHECK (deposit IS NULL OR deposit >= 0),
  CONSTRAINT chk_kamar_tidur_positif  CHECK (kamar_tidur IS NULL OR kamar_tidur > 0),
  CONSTRAINT chk_kamar_mandi_positif  CHECK (kamar_mandi IS NULL OR kamar_mandi > 0),
  CONSTRAINT chk_luas_positif         CHECK (luas_bangunan_m2 IS NULL OR luas_bangunan_m2 > 0),
  CONSTRAINT chk_score_total          CHECK (score_total IS NULL OR score_total BETWEEN 0 AND 100),
  CONSTRAINT chk_score_harga          CHECK (score_harga IS NULL OR score_harga BETWEEN 0 AND 100),
  CONSTRAINT chk_score_lokasi         CHECK (score_lokasi IS NULL OR score_lokasi BETWEEN 0 AND 100),
  CONSTRAINT chk_score_fasilitas      CHECK (score_fasilitas IS NULL OR score_fasilitas BETWEEN 0 AND 100),
  CONSTRAINT chk_score_kondisi        CHECK (score_kondisi IS NULL OR score_kondisi BETWEEN 0 AND 100),
  CONSTRAINT chk_score_owner          CHECK (score_owner IS NULL OR score_owner BETWEEN 0 AND 100)
);

COMMENT ON COLUMN candidates.harga_sewa_bulanan    IS 'Harga LISTING/ASLI per bulan — immutable setelah disimpan, selaras schema.mjs (R2)';
COMMENT ON COLUMN candidates.harga_akhir_bulanan   IS 'Harga pasca negosiasi [Slice 2]; NULL = belum ada negosiasi';
COMMENT ON COLUMN candidates.harga_efektif_bulanan IS 'GENERATED COALESCE(akhir,asli); scoring WAJIB baca kolom ini; scoring_version naik bila formula berubah (R2)';
COMMENT ON COLUMN candidates.periode_asli          IS 'R3: TEXT+CHECK; nilai tak dikenali AI -> NULL bukan insert error (FR-AI-1)';
COMMENT ON COLUMN candidates.type_specific_data    IS 'R4: dikunci TS const+Zod sebelum insert; Slice 1={}; pertimbangkan pg_jsonschema Slice 2';
COMMENT ON COLUMN candidates.scoring_version       IS 'Wajib naik bila formula atau semantik skor berubah (FR-SC-2)';
COMMENT ON COLUMN candidates.extraction_confidence IS 'Per-field confidence AI untuk tanda Verifikasi ✓/⚠ di Property Review (FR-RV-1)';
COMMENT ON COLUMN candidates.source_text           IS 'Teks listing asli yang di-paste user; untuk re-extraction & audit (NFR-7)';

CREATE TRIGGER trg_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------

CREATE TABLE candidate_commute (
  id             uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id   uuid           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  transport_mode transport_mode NOT NULL,
  distance_km    numeric(6,2),
  duration_min   int,
  route_summary  text,
  api_provider   text,          -- 'google_maps' | 'manual'
  calculated_at  timestamptz    NOT NULL DEFAULT now(),

  CONSTRAINT uq_commute_candidate_mode UNIQUE (candidate_id, transport_mode),
  CONSTRAINT chk_distance_positif      CHECK (distance_km IS NULL OR distance_km > 0),
  CONSTRAINT chk_duration_positif      CHECK (duration_min IS NULL OR duration_min > 0)
);

COMMENT ON TABLE  candidate_commute              IS 'Commute per moda per kandidat; satu baris per kombinasi unik. Slice 1: insert motor/mobil';
COMMENT ON COLUMN candidate_commute.api_provider IS 'Sumber data: google_maps (API) atau manual (input km user, fallback Slice 1)';

-- ---------------------------------------------------------------

CREATE TABLE candidate_deal_breaker_flags (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id     uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  deal_breaker_id  uuid        NOT NULL REFERENCES user_deal_breakers(id) ON DELETE CASCADE,
  evaluation_notes text,
  flagged_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_flag_candidate_db UNIQUE (candidate_id, deal_breaker_id)
);

COMMENT ON TABLE candidate_deal_breaker_flags IS 'Flag minimal (FR-DB-1): deal breaker yang dilanggar kandidat. Kandidat TIDAK dihapus. Gap re-evaluasi via LEFT JOIN';

-- ---------------------------------------------------------------

CREATE TABLE candidate_photos (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id    uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  storage_path    text        NOT NULL,
  storage_bucket  text        NOT NULL DEFAULT 'candidate-photos',
  caption         text,
  sort_order      int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  candidate_photos              IS 'Foto kandidat di Supabase Storage; signed URL di-generate server-side (NFR-3)';
COMMENT ON COLUMN candidate_photos.storage_path IS 'Object key, BUKAN URL. Format: users/{user_id}/candidates/{candidate_id}/{file}';

-- ---------------------------------------------------------------

-- 1 row = 1 siklus keputusan selesai (KPI-1); siklus berulang = multi row, urut created_at
CREATE TABLE decisions (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_id        uuid        NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
  scoring_version     text        NOT NULL,
  score_at_decision   numeric(5,2),
  candidates_compared jsonb,      -- snapshot id+score kandidat yang dibandingkan saat keputusan
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  decisions                     IS '1 row = 1 siklus keputusan (KPI-1 cycle completion); siklus berulang = multi row diurut created_at';
COMMENT ON COLUMN decisions.candidates_compared IS 'Snapshot kandidat+score saat keputusan diambil — bukan FK live';
COMMENT ON COLUMN decisions.candidate_id        IS 'ON DELETE RESTRICT — kandidat terpilih tidak bisa dihapus sembarangan';


-- ==============================================================
-- SECTION 5 — INDEXES
-- ==============================================================

-- user_preferences: user_id = PRIMARY KEY, index B-tree sudah ada, tidak perlu tambahan

-- user_deal_breakers
CREATE INDEX idx_db_user        ON user_deal_breakers (user_id);
CREATE INDEX idx_db_user_active ON user_deal_breakers (user_id) WHERE is_active = true;

-- candidates
CREATE INDEX idx_cand_user               ON candidates (user_id);
CREATE INDEX idx_cand_user_status        ON candidates (user_id, status);
CREATE INDEX idx_cand_user_type          ON candidates (user_id, property_type);
CREATE INDEX idx_cand_user_created       ON candidates (user_id, created_at DESC);
CREATE INDEX idx_cand_user_score         ON candidates (user_id, score_total DESC NULLS LAST);
CREATE INDEX idx_cand_user_harga_efektif ON candidates (user_id, harga_efektif_bulanan);

-- candidate_commute
CREATE INDEX idx_commute_candidate ON candidate_commute (candidate_id);

-- candidate_deal_breaker_flags
CREATE INDEX idx_flag_candidate ON candidate_deal_breaker_flags (candidate_id);
CREATE INDEX idx_flag_db        ON candidate_deal_breaker_flags (deal_breaker_id);

-- candidate_photos
CREATE INDEX idx_photo_candidate_order ON candidate_photos (candidate_id, sort_order);

-- decisions
CREATE INDEX idx_dec_user_created ON decisions (user_id, created_at DESC);
CREATE INDEX idx_dec_candidate    ON decisions (candidate_id);


-- ==============================================================
-- SECTION 6 — ROW LEVEL SECURITY (R1)
-- ==============================================================

-- *** ARSITEKTUR KEAMANAN BERLAPIS — BACA SEBELUM MODIFIKASI ***
--
-- [LAYER 1 — PRIMER] Authorization lapisan aplikasi:
--   Semua query server-side (Next.js API Routes / Server Actions) menggunakan service role.
--   Service role BYPASS RLS sepenuhnya — filter user_id dari sesi NextAuth WAJIB ada
--   di setiap query kode server. Ini satu-satunya penjaga nyata untuk jalur server.
--   RLS BUKAN solusi untuk "lupa WHERE clause" di kode yang memakai service role.
--
-- [LAYER 2 — BACKSTOP] RLS default-deny:
--   Tanpa policy permisif untuk role anon/authenticated, bocornya anon key
--   tidak mengekspos data — akses langsung ke DB ditolak secara default.
--
-- [LAYER 3 — GUC POLICY] Efektif HANYA bila KEDUA kondisi terpenuhi:
--   (a) Koneksi menggunakan role NON-service (mis. app_user tanpa BYPASSRLS), DAN
--   (b) GUC + query dieksekusi dalam SATU transaksi atomik via SECURITY DEFINER function.
--   JANGAN panggil set_config lalu SELECT sebagai dua RPC terpisah:
--   PgBouncer transaction-mode port 6543 TIDAK menjamin GUC bertahan antar statement.
--   Policy USING(...) di bawah hanya efektif untuk koneksi non-service-role.

ALTER TABLE users                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_deal_breakers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_commute            ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_deal_breaker_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_photos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions                    ENABLE ROW LEVEL SECURITY;

-- Default-deny aktif: tanpa policy di bawah ini, role anon/authenticated tidak dapat baca/tulis.

-- Contoh policy GUC untuk candidates (pola sama untuk tabel lain bila adopsi non-service-role).
-- NULLIF menghindari error cast bila GUC belum di-set (returns NULL -> row disembunyikan).
CREATE POLICY pol_candidates_owner ON candidates
  FOR ALL
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

-- Slice 1 beroperasi via service role -> policy di atas belum fungsional secara aktif.
-- Tambahkan policy serupa untuk tabel lain saat mengadopsi pola koneksi non-service-role.


-- ==============================================================
-- SECTION 7 — FUNCTIONS (R1: pola atomik GUC)
-- ==============================================================

-- Helper: set GUC per-transaksi; is_local=true -> reset otomatis di akhir transaksi
CREATE OR REPLACE FUNCTION set_current_user_id(p_user_id uuid)
RETURNS void LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.current_user_id', p_user_id::text, true);
END;
$$;

COMMENT ON FUNCTION set_current_user_id(uuid) IS
  'Set GUC is_local; berguna HANYA bila dipanggil dalam transaksi yang sama dengan query data (bukan dua RPC terpisah)';

-- ---------------------------------------------------------------

-- Contoh SECURITY DEFINER atomik (R1 — POLA YANG BENAR):
-- GUC di-set dan SELECT dieksekusi dalam SATU function body -> tidak ada celah antar statement.
-- Gunakan pola ini sebagai template untuk semua query yang memanfaatkan RLS via GUC.
CREATE OR REPLACE FUNCTION app_get_candidates(p_user_id uuid)
RETURNS SETOF candidates LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- set_config dan RETURN QUERY dalam satu body = atomik
  -- filter user_id eksplisit tetap ada sebagai defense-in-depth (tidak hanya andalkan GUC)
  PERFORM set_config('app.current_user_id', p_user_id::text, true);
  RETURN QUERY
    SELECT * FROM candidates
     WHERE user_id = p_user_id;
END;
$$;

COMMENT ON FUNCTION app_get_candidates(uuid) IS
  'Pola R1: GUC+query atomik dalam SECURITY DEFINER; filter user_id eksplisit sebagai defense-in-depth';


-- ==============================================================
-- SECTION 8 — DDL DITUNDA SLICE 2+ (JANGAN DIEKSEKUSI)
-- ==============================================================

/*
  *** SLICE 2 DDL — BELUM AKTIF ***
  Disertakan sebagai referensi desain. Jangan dieksekusi bersama migration ini.

  >>> UPDATE (S2-0, 2026-06-27): `candidate_surveys` & `candidate_events` SUDAH dipromosikan
  >>> ke migration aktif: db/migrations/2026-06-27_slice2_s2-0_surveys_events.sql
  >>> (versi di sana = sumber kebenaran: + index, trigger updated_at, CHECK event_type, RLS GUC).
  >>> Blok di bawah dipertahankan sebagai catatan desain saja.

  -- candidate_surveys: hasil survei lapangan per kandidat (rating bintang + tag)
  CREATE TABLE candidate_surveys (
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
  -- Saat tabel ini aktif: score_kondisi & score_owner di candidates diisi dari rating.
  -- Tidak ada schema change di candidates — kolom placeholder sudah ada.

  -- candidate_events: timeline aktivitas per kandidat (auto + manual)
  CREATE TABLE candidate_events (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    user_id      uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type   text        NOT NULL, -- added|status_changed|data_updated|survey_completed|verdict_changed|price_changed|user_note|call_log|negotiation|appointment
    source       text        NOT NULL DEFAULT 'auto' CHECK (source IN ('auto','manual')),
    event_data   jsonb       NOT NULL DEFAULT '{}',
    occurred_at  timestamptz NOT NULL DEFAULT now(),
    created_at   timestamptz NOT NULL DEFAULT now()
  );
  -- harga_akhir_bulanan sudah ada -> saat diisi, app/trigger insert event_type='price_changed'.

  -- Slice 2 aktivasi lainnya (tanpa migrasi besar):
  -- * score_kondisi, score_owner: aktifkan di scoring engine (kolom sudah ada)
  -- * harga_akhir_bulanan: aktifkan fitur negosiasi (kolom + GENERATED harga_efektif sudah ada)
  -- * weight_keamanan, weight_owner: aktifkan di formula scoring 5 dimensi
  -- * transport_mode 'transit' & 'jalan_kaki_sepeda': insert baris baru ke candidate_commute
  -- * property_type 'apartemen'/'kost': isi type_specific_data (Zod), promosikan ke typed column hanya bila masuk scoring
  -- * Pertimbangkan pg_jsonschema untuk validasi type_specific_data di level DB
  -- * Tambah RLS policy untuk tabel baru + tabel lama bila adopsi pola non-service-role
*/

-- ==============================================================
-- END OF MIGRATION — SLICE 1
-- ==============================================================
