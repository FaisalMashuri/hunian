-- Migration 0003 — harga multi-skema.
-- Tambah harga_terpilih_bulanan + selected_periode + price_schemes; ubah harga_efektif_bulanan
-- jadi COALESCE(akhir, terpilih, asli). Jalankan di Supabase SQL editor.
-- Dibungkus transaksi karena mengubah kolom GENERATED (harus DROP + ADD).

BEGIN;

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS harga_terpilih_bulanan numeric(12,0);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS selected_periode       text;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS price_schemes          jsonb;

-- Ganti expression GENERATED: COALESCE(akhir, asli) -> COALESCE(akhir, terpilih, asli).
-- DROP COLUMN otomatis menghapus index yang bergantung (idx_cand_user_harga_efektif).
ALTER TABLE candidates DROP COLUMN IF EXISTS harga_efektif_bulanan;
ALTER TABLE candidates ADD COLUMN harga_efektif_bulanan numeric(12,0)
  GENERATED ALWAYS AS (
    COALESCE(harga_akhir_bulanan, harga_terpilih_bulanan, harga_sewa_bulanan)
  ) STORED;
CREATE INDEX IF NOT EXISTS idx_cand_user_harga_efektif
  ON candidates (user_id, harga_efektif_bulanan);

-- CHECK baru (enum periode sama dgn chk_periode_asli; price_schemes harus array).
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS chk_selected_periode;
ALTER TABLE candidates ADD CONSTRAINT chk_selected_periode CHECK (
  selected_periode IS NULL OR selected_periode IN ('bulan','3bulan','6bulan','tahun')
);
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS chk_price_schemes_array;
ALTER TABLE candidates ADD CONSTRAINT chk_price_schemes_array CHECK (
  price_schemes IS NULL OR jsonb_typeof(price_schemes) = 'array'
);

COMMENT ON COLUMN candidates.harga_terpilih_bulanan IS 'Per-bulan dari skema sewa terpilih user; drives harga_efektif (0003)';
COMMENT ON COLUMN candidates.selected_periode       IS 'Periode skema sewa yang dipilih user (multi-skema)';
COMMENT ON COLUMN candidates.price_schemes          IS 'Array skema harga {periode,harga,basis,basis_confirmed}';

COMMIT;

NOTIFY pgrst, 'reload schema';
