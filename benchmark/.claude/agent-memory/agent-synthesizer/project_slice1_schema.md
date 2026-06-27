---
name: project-slice1-schema
description: Keputusan desain ERD + schema DB Slice 1 — 8 tabel final, hybrid typed/jsonb, 3-layer authz, harga immutable
metadata:
  type: project
---

Schema DB Slice 1 sudah diputuskan dan siap dieksekusi per 2026-06-26. 8 tabel: users, user_preferences, user_deal_breakers, candidates, candidate_commute, candidate_deal_breaker_flags, candidate_photos, decisions.

**Why:** Sesi desain melibatkan TL (desain) + PM (scope PRD) + DA (challenge). 5 konflik/isu diadili, semua resolved.

**Keputusan utama:**
- Typed columns untuk scores (bukan jsonb) — domain dimensi terkunci, ORDER BY/CHECK butuh typed
- Tabel relasional candidate_deal_breaker_flags — is_active soft-delete butuh LEFT JOIN re-evaluation
- decisions table (bukan candidates.is_chosen boolean) — siklus berulang = multi-cycle, irreversible kalau boolean
- 3-layer authz: L1 server-side filter (PRIMER), L2 RLS default-deny (backstop anon-key), L3 GUC via SECURITY DEFINER only
- harga_sewa_bulanan = LISTING/ASLI immutable; harga_efektif_bulanan = GENERATED COALESCE(akhir,asli)
- periode_asli = TEXT+CHECK IN ('bulan','3bulan','6bulan','tahun') bukan PostgreSQL enum
- type_specific_data jsonb tanpa enforcement Slice 1 (selalu {}); pg_jsonschema masuk backlog Slice 2

**How to apply:** Setiap keputusan teknikal baru yang menyentuh schema harus merujuk ke keputusan ini. Khususnya: jangan pernah baca harga_sewa_bulanan di scoring engine (pakai harga_efektif_bulanan). Jangan pakai SET LOCAL GUC di dua RPC terpisah — wajib SECURITY DEFINER function.

**Open questions yang belum closed:**
1. PgBouncer pool mode (session vs transaction) — owner Faisal, harus konfirm sebelum kode authz ditulis
2. onboarding_completed boolean cukup atau perlu step tracking — owner Faisal, sebelum DDL ditulis

**Silent failure risks yang harus ada automated test:**
- GUC leak: PgBouncer tx-mode + SET LOCAL di RPC terpisah = GUC tidak persist = data scope salah tanpa error
- L1 filter hilang: service role bypass RLS = L2 tidak aktif = unauthenticated bisa dapat data kalau L1 lupa
