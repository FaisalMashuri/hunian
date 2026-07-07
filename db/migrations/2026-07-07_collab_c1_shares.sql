-- ==============================================================
-- MIGRATION — COLLABORATION · C-1 (Share read-only antar-akun)
-- Tabel: collab_shares
-- Tanggal: 2026-07-07
-- Acuan: next-feature/collaboration-partner.md · plan collaboration (Opsi A additive)
--
-- KONTEKS: alat personal Faisal + pasangan (LDR) untuk cari rumah bareng.
-- TIDAK ada gating premium — semua user boleh share.
--
-- MODEL: sharing berbasis EMAIL (grantee_email). Owner mengundang partner dengan
-- alamat email Google-nya. Saat partner login dengan email tsb, kandidat milik owner
-- tampil di dashboard/compare partner. Tidak butuh email service / magic-link token.
--
-- CARA PAKAI: jalankan SELURUH file ini di Supabase SQL editor (project zoxuqttewkipqkaiwxac).
-- Idempoten: aman dijalankan ulang.
--
-- KEAMANAN (lihat db/schema.sql SECTION 6): query server pakai service role BYPASS RLS.
-- LAYER PRIMER = authz aplikasi lewat lib/authz/candidate.ts (owner OR share aktif).
-- READ path memakai .in("user_id", visibleOwnerIds). WRITE path tetap owner-only
-- (.eq("user_id", ownerId)) di C-1. RLS di bawah = backstop default-deny.
-- ==============================================================

BEGIN;

-- ---------------------------------------------------------------
-- collab_shares — 1 baris = 1 owner membagikan SELURUH shortlist-nya ke 1 email partner.
-- Granularitas per-AKUN (bukan per-kandidat): job = "lihat semua kandidat bareng".
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collab_shares (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grantee_email text        NOT NULL,   -- email Google partner (lowercase); dicocokkan saat partner login
  role          text        NOT NULL DEFAULT 'viewer',   -- 'viewer' (C-1). 'editor' disiapkan C-2+.
  status        text        NOT NULL DEFAULT 'active',    -- 'active' | 'revoked'
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_share_owner_email  UNIQUE (owner_id, grantee_email),
  CONSTRAINT chk_share_role   CHECK (role   IN ('viewer','editor')),
  CONSTRAINT chk_share_status CHECK (status IN ('active','revoked'))
);

COMMENT ON TABLE  collab_shares               IS 'Collaboration C-1: owner membagikan shortlist ke email partner. Read-only (viewer). Personal tool, no premium gate.';
COMMENT ON COLUMN collab_shares.grantee_email IS 'Email Google partner (lowercase). Dicocokkan dengan users.email saat partner login — tak butuh grantee_id/link step.';
COMMENT ON COLUMN collab_shares.role          IS 'viewer=lihat saja (C-1). editor disiapkan untuk C-2+ (belum aktif).';

-- Lookup utama: "shortlist siapa saja yang boleh dilihat email X" → filter grantee_email + status.
CREATE INDEX IF NOT EXISTS idx_share_grantee_active ON collab_shares (grantee_email) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_share_owner          ON collab_shares (owner_id);

-- Trigger updated_at (pakai helper existing fn_set_updated_at dari schema.sql SECTION 1).
DROP TRIGGER IF EXISTS trg_collab_shares_updated_at ON collab_shares;
CREATE TRIGGER trg_collab_shares_updated_at
  BEFORE UPDATE ON collab_shares
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------
-- RLS backstop (default-deny). Jalur server = service role (bypass); penjaga nyata di app.
-- ---------------------------------------------------------------
ALTER TABLE collab_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pol_collab_shares_owner ON collab_shares;
CREATE POLICY pol_collab_shares_owner ON collab_shares
  FOR ALL
  USING (
    owner_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

COMMIT;

-- ==============================================================
-- CATATAN
-- ==============================================================
-- * Tidak menyentuh tabel existing → zero backfill, reversibel (DROP TABLE collab_shares).
-- * Verdict pool tetap per-owner: loader mengelompokkan kandidat per user_id sebelum deriveVerdict.
-- * C-2 (opsional): tabel candidate_comments + role 'editor'. Belum di migration ini.
