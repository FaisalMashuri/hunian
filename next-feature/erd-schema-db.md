# ERD & Schema Database — Slice 1

<!--
  Di-generate oleh Orchestrator (sesi 2026-06-26 ERD/Schema DB).
  Edit hanya section bertanda [FAISAL UPDATE].
-->

## Status

```
[ ] Backlog       — identified, belum dijadwalkan
[ ] In Discussion — sedang didebat agent team
[x] Approved      — Product Owner approved, siap dibangun
[ ] In Progress   — sedang dibangun
[ ] Done          — selesai dan shipped
[ ] Rejected      — tidak akan dibangun, dengan alasan
```

**Current status:** `[x] Approved`
**Last updated:** 2026-06-26
**Session:** `sessions/2026-06-26-erd-schema-db.md`
**Confidence:** HIGH (desain) · MEDIUM (eksekusi RLS bergantung konfirmasi PgBouncer)

---

## Deskripsi Singkat

> Schema database Postgres/Supabase untuk pipeline keputusan Hunian Slice 1 (Kontrakan), dirancang forward-compatible ke Apartemen/Kost, survey, timeline, dan harga asli/akhir di Slice 2 tanpa migrasi besar.

---

## Deskripsi Lengkap

### Apa fitur ini?

Ini fondasi data, bukan fitur user-facing. Hasil sesi: ERD ([`docs/ERD.md`](../docs/ERD.md)) + DDL migration siap pakai ([`db/schema.sql`](../db/schema.sql)) berisi 8 tabel: `users`, `user_preferences`, `user_deal_breakers`, `candidates`, `candidate_commute`, `candidate_deal_breaker_flags`, `candidate_photos`, `decisions`.

Identitas dari Google login via NextAuth (bukan Supabase Auth) — Supabase dipakai untuk data + storage saja. Skor diisi rule engine (bukan AI), `scoring_version` disimpan per kandidat agar skor historis tetap komparabel. Pola extensibility hybrid (typed columns untuk field critical/scoring + `type_specific_data` jsonb untuk field per-jenis) menyiapkan Apartemen/Kost tanpa redesign.

### Siapa yang paling diuntungkan?

- **Primary:** Faisal (builder) — fondasi yang tidak perlu di-rework saat Slice 2.
- **Secondary:** pencari hunian aktif — datanya aman, terisolasi per user, dapat diaudit.

### Di stage mana user journey ini terjadi?

```
discover → shortlist → [INPUT + EVALUASI + COMPARE] → negotiate → decide → move in
```
(Schema menopang seluruh pipeline Slice 1: onboarding → input → review → scoring → compare → pilih.)

---

## Kenapa Fitur Ini Dibangun

### Alasan dari debat

Slice 1 sudah approved; tanpa schema yang forward-compatible, masuknya Apartemen/Kost/survey/timeline/harga-asli-akhir di Slice 2 berisiko migrasi destruktif. DA membongkar tiga silent-failure yang tidak akan muncul di test standar (RLS yang di-bypass service role, semantik harga yang bergeser, enum periode yang drift) — ketiganya diselesaikan di desain sebelum satu baris kode ditulis.

### Pain point yang di-solve

- Risiko redesign DB saat Slice 2 — severity: HIGH → diatasi pola hybrid + kolom/jalur disiapkan nullable.
- Kebocoran data lintas-user tanpa Supabase Auth — severity: HIGH → diatasi authz aplikasi (L1) + RLS default-deny (L2) + GUC atomik (L3).

### Market gap yang diisi

N/A (keputusan internal teknikal).

---

## Tradeoff yang Disadari

### Keputusan yang diambil

| Keputusan | Dipilih | Tidak dipilih | Alasan |
|---|---|---|---|
| Pola jenis properti | Hybrid typed + `type_specific_data` jsonb | single-table all-nullable / table-per-type / EAV / all-jsonb | Field CRITICAL harus typed+indexable utk scoring & Compare; jsonb hanya untuk field per-jenis non-scoring |
| Penyimpanan skor | Typed columns (`score_*`) | jsonb scores (usulan PM) | Compare butuh `ORDER BY`/`CHECK` per dimensi; domain dimensi sudah terkunci. DA mencabut tantangannya di sini |
| Deal breaker flags | Tabel relasional | jsonb array di candidates (usulan PM) | `is_active` soft-delete → user bisa ubah deal breaker → butuh gap-detection/re-evaluasi via LEFT JOIN |
| Keputusan akhir | Tabel `decisions` terpisah | `candidates.is_chosen`+`chosen_at` (usulan PM) | Siklus berulang bikin `is_chosen` ambigu; `decisions` = audit + KPI-1 yang jelas |
| Harga | `harga_sewa_bulanan` ASLI immutable + GENERATED `harga_efektif_bulanan` | overload satu kolom via COALESCE | Cegah drift semantik asli↔efektif (silent scoring bug) |
| Periode | TEXT + CHECK selaras `schema.mjs` | Postgres ENUM | Hindari `ALTER TYPE`; AI period asing → null bukan insert gagal; single-source Zod+CHECK |
| Auth/RLS | Authz aplikasi primer + RLS default-deny + GUC atomik | "RLS sebagai penjaga lupa-WHERE" | Service role bypass RLS — framing lama itu security theater |

### Yang kita korbankan

Enforcement bentuk JSON di level DB (untuk `type_specific_data`) demi menghindari table-per-type yang memberatkan tim solo — dikompensasi konstanta TS + Zod. Dan kompleksitas RLS 3-lapis demi kejujuran model keamanan tanpa Supabase Auth.

### Yang akan jadi masalah kalau asumsi ini salah

Bila PgBouncer transaction-mode dipakai dan pola dua-RPC terpisah dipakai untuk GUC, scope user jadi salah secara silent (hasil kosong, tanpa error). Mitigasi: fungsi `SECURITY DEFINER` atomik wajib + integration test unauth→0 row.

---

## Technical Approach

**Feasibility:** ✅ Feasible (desain final, valid sintaks)

**Stack yang digunakan:**
- Supabase Postgres v14+ (uuid PK via pgcrypto, timestamptz, FK eksplisit, enum + CHECK, GENERATED column, RLS)
- Auth.js (NextAuth) + Google OAuth — identitas; Supabase = data + storage
- Zod + konstanta TS — validasi extraction sebelum insert

**Opsi implementasi yang dipertimbangkan:** lihat tabel Tradeoff di atas (hybrid vs 4 alternatif; typed vs jsonb scores; relasional vs jsonb flags; decisions vs is_chosen).

**Effort estimate:** schema = bagian Fase 0–1 (~1–2 hari setup) dari estimasi Slice 1 19–26 hari.
**Reversibility:** MEDIUM (pola extensibility); HIGH untuk sebagian besar kolom (additive).

**Risiko teknikal:**
- RLS GUC/PgBouncer silent failure — mitigasi: konfirmasi pool mode + fungsi atomik + integration test unauth→0 row.
- Drift enum periode — mitigasi: single-source TS const untuk Zod + DB CHECK.
- Semantik harga bergeser — mitigasi: kolom ASLI immutable + GENERATED efektif + disiplin `scoring_version`.

---

## Product Owner Notes

**Vision alignment:** ✅ ALIGNED

Schema memisahkan tegas domain AI (extraction/confidence/explanation) dari rule engine (`score_*`) — tidak ada AI scoring menyelinap. Data keyed per `user_id`; `source_text`+`extraction_confidence` memberi user bukti asal data (verifikasi, bukan input nol). Tidak ada tabel marketplace/landlord/monetisasi. Survey & timeline ditunda sebagai komentar, bukan tabel aktif — tidak ada scope creep Slice 2. PgBouncer dinilai PO sebagai gate deployment (checklist developer), **bukan** keputusan produk yang memblokir → tidak dibawa ke Faisal sebagai blocker.

**Konfirmasi dari Faisal:** PENDING (tidak memblokir — desain sudah ALIGNED; lihat Open Questions)
**Tanggal konfirmasi:** —

---

## Open Questions

1. PgBouncer pool mode di environment Supabase (transaction vs session)? — cara validasi: cek Database > Connection Pooling > Pool mode — menentukan apakah fungsi `SECURITY DEFINER` atomik mandatory. Default action bila tak ada respon: **asumsikan transaction-mode** dan perlakukan fungsi atomik sebagai mandatory (aman di kedua mode).

---

## Next Actions

- [ ] Jalankan `db/schema.sql` sebagai migration pertama di Supabase project — owner: Faisal — by: Fase 0–1
- [ ] Buat 1 konstanta TS single-source untuk periode (`bulan|3bulan|6bulan|tahun`) dipakai Zod extraction + acuan DB CHECK — owner: Faisal — sebelum fitur harga pertama
- [ ] Konfirmasi PgBouncer pool mode; adopsi pola `SECURITY DEFINER` atomik untuk query ber-RLS — owner: Faisal — sebelum deploy production
- [ ] Integration test: request unauth ke tiap tabel → 0 row (bukti RLS backstop) — owner: Faisal — Fase 5 / sebelum production
- [ ] Wire NextAuth `signIn` callback → upsert `users` by `google_sub` via service role — owner: Faisal — Fase 1

---

## Catatan Faisal

<!-- [FAISAL UPDATE] Tambahkan catatan, feedback, atau keputusan pribadi di sini -->

---

## Riwayat

| Tanggal | Event | Catatan |
|---|---|---|
| 2026-06-26 | Feature identified | Sesi: ERD + Schema DB Slice 1 |
| 2026-06-26 | Debat selesai | 5 agent (TL·PM·DA·SYN·PO); STR & UX di-skip (bukan market / behavior sudah terkunci) |
| 2026-06-26 | DA challenge | 6 tantangan + 1 bonus; 1 dicabut (scores typed); 3 HIGH diadili → revisi |
| 2026-06-26 | TL revisi final | 6 revisi diterapkan; DDL SECTION 1–8 lengkap |
| 2026-06-26 | PO gate | ✅ ALIGNED; PgBouncer = gate deployment, bukan keputusan Faisal |
