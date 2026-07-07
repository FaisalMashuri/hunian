-- ==============================================================
-- MIGRATION — COLLABORATION · C-2 (Diskusi/komentar per kandidat)
-- Tabel: candidate_comments
-- Tanggal: 2026-07-07
-- Acuan: next-feature/collaboration-partner.md · plan collaboration (Slice C-2)
--
-- KONTEKS: alat personal Faisal + pasangan (LDR). Kolaborasi ASYNC — dua orang jarang
-- buka app bersamaan, jadi komentar tersimpan per kandidat jadi cara diskusi utama.
-- Siapa pun yang PUNYA AKSES ke kandidat (owner ATAU partner yang di-share) boleh
-- membaca & menulis komentar. Penghapusan hanya oleh penulis komentar.
--
-- CARA PAKAI: jalankan SELURUH file ini di Supabase SQL editor (project zoxuqttewkipqkaiwxac).
-- Idempoten: aman dijalankan ulang.
--
-- KEAMANAN: service role BYPASS RLS. Penjaga nyata = lib/authz/candidate.ts
-- (addCommentAction memanggil assertCandidateAccess(..,"viewer")). RLS = backstop.
-- ==============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS candidate_comments (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  author_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_comment_body_nonempty CHECK (length(trim(body)) > 0)
);

COMMENT ON TABLE  candidate_comments IS 'Collaboration C-2: diskusi async per kandidat. Akses baca/tulis = owner atau partner yang di-share (cek app-layer). Hapus = penulis saja.';

CREATE INDEX IF NOT EXISTS idx_comment_candidate_time ON candidate_comments (candidate_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comment_author         ON candidate_comments (author_id);

-- RLS backstop (default-deny). Policy GUC by author (selaras pola SECTION 6) — hanya efektif
-- untuk koneksi non-service-role. Jalur server (service role) diproteksi di app-layer.
ALTER TABLE candidate_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pol_comments_author ON candidate_comments;
CREATE POLICY pol_comments_author ON candidate_comments
  FOR ALL
  USING (
    author_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

COMMIT;
