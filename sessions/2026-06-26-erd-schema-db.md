# Sesi: ERD + Schema Database Slice 1

**Tanggal:** 2026-06-26
**Topik:** Desain ERD + schema database Postgres/Supabase untuk Hunian Slice 1, forward-compatible ke Slice 2+
**Agents:** TL (primary) · PM · DA · SYN · PO. Di-skip: STR (bukan market), UX (behavior sudah terkunci di mvp.md)
**Verdict:** ✅ ALIGNED (Product Owner). Confidence: HIGH (desain) / MEDIUM (eksekusi RLS).
**Artefak:** [`docs/ERD.md`](../docs/ERD.md) · [`db/schema.sql`](../db/schema.sql) · [`next-feature/erd-schema-db.md`](../next-feature/erd-schema-db.md)

---

## Task Decomposition & Execution

| ID | Task | Agent | Deps | Status |
|---|---|---|---|---|
| T-001 | Desain ERD + DDL + pola extensibility | TL | - | ✅ |
| T-002 | Cek scope vs PRD, peta field→FR, anti over-build | PM | - | ✅ |
| T-003 | Tantang: jsonb vs relational, RLS, integritas, harga, enum | DA | T-001,002 | ✅ |
| T-004 | Revisi final DDL sesuai challenge diterima | TL | T-003 | ✅ |
| T-005 | Verdict + tradeoff + ditunda Slice 2 | SYN | T-004 | ✅ |
| T-006 | Vision check & human gate | PO | T-005 | ✅ |

Wave 1 (paralel): T-001, T-002 → Wave 2: T-003 → Wave 3: T-004 → Wave 4: T-005 → Wave 5: T-006. Eksekusi sinkron (blocking tiap wave).

---

## Konflik Genuine yang Diadili (bukan "semua valid")

1. **Scores: typed columns vs jsonb (TL vs PM).** DA mencabut tantangannya sendiri → typed columns MENANG: Compare butuh `ORDER BY score_*` + `CHECK` per dimensi; domain dimensi sudah terkunci; `score_breakdown` jsonb sebagai escape valve. PM salah di sini.
2. **Deal breaker flags: relasional vs jsonb (TL vs PM).** Relasional MENANG: `is_active` soft-delete = user bisa ubah deal breaker → butuh gap-detection & re-evaluasi via LEFT JOIN yang jsonb tak bisa.
3. **decisions table vs is_chosen (TL vs PM).** decisions MENANG: siklus berulang bikin `is_chosen` ambigu (multi true); decisions = 1 row per siklus KPI-1 + snapshot audit.
4. **RLS tanpa Supabase Auth (DA HIGH).** Service role BYPASS RLS → narasi "RLS penjaga lupa-WHERE" = security theater. Reframe 3 lapis: L1 authz aplikasi (primer), L2 RLS default-deny (backstop anon-key), L3 GUC atomik via SECURITY DEFINER (nyata hanya untuk role non-service). PgBouncer tx-mode + dua RPC terpisah = silent bug.
5. **Semantik harga drift (DA HIGH).** `harga_sewa_bulanan` dikunci = ASLI immutable; tambah GENERATED `harga_efektif_bulanan` = COALESCE(akhir,asli) yang selalu dibaca scoring; `scoring_version` naik bila formula berubah.
6. **Enum periode mismatch (DA HIGH).** `periode_asli` turun dari ENUM ke TEXT+CHECK `('bulan','3bulan','6bulan','tahun')` persis `schema.mjs`; AI period asing → null; single-source TS const + Zod.
7. **type_specific_data tanpa enforcement (MED) + onboarding_step (LOW).** jsonb tetap dengan Zod+constants lock (Slice 1={}); onboarding_step integer → onboarding_completed boolean.

---

## Keputusan Orchestrator atas Tantangan DA

DITERIMA → constraint revisi T-004: R1 (RLS reframe jujur), R2 (harga anti-drift via GENERATED), R3 (periode TEXT+CHECK), R4 (jsonb + Zod), R5 (onboarding boolean), R6 (enum lain tetap).
DIPERTAHANKAN sesuai TL (DA setuju): scores typed (1A dicabut), flags relasional (1B), decisions table (2).

---

## Hasil PM (scope enforcement)

Entity minimum Slice 1: `users`, `user_preferences`, `candidates`, `user_deal_breakers` (+ child tables). 3 field fatal-jika-absen: `source_text` (audit/re-extraction), `periode_asli` (FR-IN-3), `chosen_at`/decision (KPI-1). Anti over-build: JANGAN bangun tabel survey/timeline/violations/dual-harga sekarang — status "sudah_disurvey" = enum, bukan trigger tabel survey. mvp.md = spec penuh; build-sequencing = yang mengikat Slice 1.

---

## Verdict SYN

Schema 8 tabel, pola hybrid, forward-compat siap. Dua silent-failure HIGH yang harus dijaga implementasi: (1) RLS GUC/PgBouncer — konfirmasi pool mode + fungsi atomik + integration test unauth→0 row; (2) enum periode drift — 1 TS const single-source untuk Zod+CHECK. Satu pertanyaan konfigurasi Faisal: PgBouncer pool mode (menentukan apakah fungsi atomik mandatory).

---

## Gate PO

✅ ALIGNED. Vision pass di semua layer (AI tak memutuskan; user in control; bukan marketplace; simplicity terjaga; scope Slice 1 utuh tanpa creep). PgBouncer = gate deployment / checklist developer, BUKAN keputusan produk → tidak dibawa ke Faisal sebagai blocker. Tiga catatan implementasi masuk definition-of-done: konfirmasi pool mode, single-source const periode, integration test unauth→0 row.

---

## Pelajaran Proses

- DA berkualitas: mencabut 1 tantangan setelah rebuttal kuat (bukti menimbang, bukan melawan buta); 3 HIGH-nya mengubah desain secara material.
- Output TL pertama terpotong di transcript (paruh DDL hilang) — diatasi dengan ronde revisi TL yang mengembalikan DDL utuh dengan komentar ringkas.
- Subagent tetap tak bisa tulis disk; main-thread/Orchestrator yang mempersist semua artefak.
