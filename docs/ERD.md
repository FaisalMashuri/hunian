# ERD & Schema Notes — Hunian Slice 1

| | |
|---|---|
| **Scope** | Slice 1 — schema DB untuk pipeline keputusan Kontrakan, forward-compatible ke Slice 2+ |
| **Versi** | 1.0 · 2026-06-26 |
| **Status** | ✅ ALIGNED (Product Owner) — siap jadi migration |
| **DDL** | [`db/schema.sql`](../db/schema.sql) |
| **Sesi** | [`sessions/2026-06-26-erd-schema-db.md`](../sessions/2026-06-26-erd-schema-db.md) |
| **Sumber kebenaran** | [`docs/PRD.md`](./PRD.md) · [`next-feature/mvp.md`](../next-feature/mvp.md) · [`benchmark/schema.mjs`](../benchmark/schema.mjs) |

> Dihasilkan oleh agent team: TL (desain) → PM (scope/PRD) → DA (challenge) → TL (revisi) → SYN (verdict) → PO (gate ALIGNED).

---

## A. ERD (Mermaid)

```mermaid
erDiagram
    users ||--|| user_preferences : "1:1 (onboarding)"
    users ||--o{ user_deal_breakers : "punya"
    users ||--o{ candidates : "memiliki"
    users ||--o{ decisions : "membuat"
    candidates ||--o{ candidate_commute : "jarak/waktu per moda"
    candidates ||--o{ candidate_deal_breaker_flags : "flag pelanggaran"
    user_deal_breakers ||--o{ candidate_deal_breaker_flags : "dievaluasi jadi"
    candidates ||--o{ candidate_photos : "foto"
    candidates ||--o{ decisions : "dipilih sebagai"

    users {
        uuid id PK
        text google_sub UK "dari NextAuth, BUKAN Supabase Auth"
        text email UK
        text name
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }

    user_preferences {
        uuid user_id PK_FK "1:1 ke users"
        numeric budget_ideal "FR-ON-1"
        numeric budget_max "FR-ON-1"
        text dest_address "FR-ON-2"
        float dest_lat
        float dest_lng
        transport_mode_arr transport_modes "siap 4 moda (FR-ON-2/NFR-8)"
        text_arr priority_selection "FR-ON-3"
        numeric weight_harga "bobot scoring"
        numeric weight_lokasi
        numeric weight_fasilitas
        numeric weight_keamanan "placeholder Slice 2"
        numeric weight_owner "placeholder Slice 2"
        date deadline_pindah "ditunda; kolom disiapkan"
        bool onboarding_completed
        timestamptz created_at
        timestamptz updated_at
    }

    user_deal_breakers {
        uuid id PK
        uuid user_id FK
        text deal_breaker_key "slug preset, NULL jika custom"
        text custom_text "NULL jika preset"
        bool is_active "soft-delete"
        timestamptz created_at
    }

    candidates {
        uuid id PK
        uuid user_id FK
        property_type property_type "kontrakan|apartemen|kost"
        candidate_status status "tersedia|sudah_disurvey|sudah_tersewa"
        text title "FR-IN-2"
        text kontak_owner
        text platform_asal
        text source_text "FR-IN-1, audit NFR-7"
        text alamat
        float location_lat
        float location_lng
        numeric harga_sewa_bulanan "ASLI/listing, immutable (R2)"
        numeric harga_akhir_bulanan "Slice 2, nullable"
        numeric harga_efektif_bulanan "GENERATED COALESCE; scoring baca ini"
        text periode_asli "TEXT+CHECK selaras schema.mjs (R3)"
        numeric deposit
        int kamar_tidur
        int kamar_mandi
        numeric luas_bangunan_m2
        furnished_status furnished
        bool carport
        bool dapur
        text scoring_version "per kandidat (FR-SC-2)"
        numeric score_total
        numeric score_harga
        numeric score_lokasi
        numeric score_fasilitas
        numeric score_kondisi "placeholder Slice 2"
        numeric score_owner "placeholder Slice 2"
        jsonb score_breakdown "audit (NFR-7)"
        jsonb extraction_confidence "tanda Verifikasi ✓/⚠ (FR-RV-1)"
        jsonb type_specific_data "field per-jenis; Slice 1 = {}"
        timestamptz created_at
        timestamptz updated_at
    }

    candidate_commute {
        uuid id PK
        uuid candidate_id FK
        transport_mode transport_mode "4 moda siap (NFR-8)"
        numeric distance_km
        int duration_min
        text route_summary
        text api_provider "google_maps|manual"
        timestamptz calculated_at
    }

    candidate_deal_breaker_flags {
        uuid id PK
        uuid candidate_id FK
        uuid deal_breaker_id FK
        text evaluation_notes
        timestamptz flagged_at
    }

    candidate_photos {
        uuid id PK
        uuid candidate_id FK
        text storage_path "Supabase Storage object key (NFR-3)"
        text storage_bucket
        text caption
        int sort_order
        timestamptz created_at
    }

    decisions {
        uuid id PK
        uuid user_id FK
        uuid candidate_id FK "ON DELETE RESTRICT"
        text scoring_version
        numeric score_at_decision
        jsonb candidates_compared "snapshot saat keputusan"
        text notes
        timestamptz created_at "1 row = 1 siklus KPI-1"
    }
```

**Kardinalitas inti:** `users` 1:1 `user_preferences`; `users` 1:N `candidates`; `candidates` 1:N `candidate_commute` (unik per moda), `candidate_deal_breaker_flags`, `candidate_photos`; `candidate_deal_breaker_flags` adalah junction `candidates` × `user_deal_breakers`; `decisions` 1 row = 1 siklus keputusan selesai.

---

## B. DDL

DDL Postgres lengkap (SECTION 1–8: extensions, types, tables, indexes, RLS, functions, Slice-2 deferred) ada di **[`db/schema.sql`](../db/schema.sql)**. Siap dijalankan sebagai satu migration di Supabase (Postgres v14+).

---

## C. Catatan Keputusan

### C.1 — Pola Extensibility: HYBRID (typed columns + `type_specific_data` jsonb)

**Keputusan:** Field critical/common/scoring → typed columns. Field type-specific non-scoring → `type_specific_data jsonb`.

- Typed (selalu kolom): `harga_sewa_bulanan`, `kamar_tidur`, `kamar_mandi`, `deposit`, `furnished` (5 CRITICAL dari `schema.mjs`) + dimensi scoring + field lintas-tipe (title, alamat, kontak, deposit, ipl).
- JSONB (`type_specific_data`): Apartemen `{nama_apartemen, tower, nomor_unit, lantai, tipe_unit, fasilitas_gedung}`; Kost `{tipe_kamar, kamar_mandi_type, lantai, tipe_penghuni, jam_malam, aturan}`. Slice 1 = `{}`.

**Tradeoff (Mandate):**

| Keputusan | Dipilih | Tidak dipilih | Alasan |
|---|---|---|---|
| Pola jenis properti | Hybrid typed + jsonb | Single-table all-nullable | 45+ kolom mayoritas NULL; cognitive load tanpa benefit |
| | | Table-per-type | Compare wajib UNION lintas tipe; duplikasi constraint/trigger; migrasi 3 tabel untuk field common |
| | | EAV | Field CRITICAL harus typed+indexable utk scoring; EAV memaksa string-cast |
| | | All-jsonb | CRITICAL kehilangan tipe, index native, CHECK; query scoring jauh lebih kompleks |

**Yang dikorbankan:** sebagian enforcement bentuk JSON (tak ada di level DB). Mitigasi: konstanta TS + Zod sebelum insert; `pg_jsonschema` dipertimbangkan Slice 2. **Hidden cost:** bila field di `type_specific_data` ternyata masuk scoring (mis. `lantai` apartemen untuk deal breaker "lantai >3 tanpa lift"), promosikan ke typed column via `ALTER TABLE ADD COLUMN` — additive, bukan destruktif. **Reversibility: MEDIUM.**

### C.2 — Strategi RLS & Akses Server-Side dengan NextAuth (bukan Supabase Auth)

Karena identitas dari NextAuth, **tidak ada `auth.uid()`** dan **service role BYPASS RLS**. Maka keamanan disusun 3 lapis (jangan diframe sebagai "RLS penjaga lupa-WHERE" — itu keliru saat pakai service role):

1. **L1 PRIMER — authz aplikasi:** seluruh akses DB server-side (Server Actions / Route Handlers) pakai service role; **setiap query WAJIB filter `user_id`** dari sesi NextAuth yang sudah diverifikasi (`getServerSession`). Service-role key tidak pernah ke client (NFR-3).
2. **L2 BACKSTOP — RLS default-deny:** semua tabel `ENABLE ROW LEVEL SECURITY` tanpa policy permisif untuk role anon/authenticated → anon key bocor = tidak ada yang terbaca.
3. **L3 GUC — defense nyata bersyarat:** policy `user_id = NULLIF(current_setting('app.current_user_id', true),'')::uuid` hanya efektif bila (a) koneksi pakai role **non-service** tanpa BYPASSRLS, DAN (b) GUC + query **atomik** dalam satu transaksi via fungsi `SECURITY DEFINER` (lihat `app_get_candidates`). **Jangan** `set_config` lalu `SELECT` sebagai dua RPC terpisah — PgBouncer transaction-mode (port 6543) tidak menjamin GUC bertahan antar statement → bug silent (hasil kosong).

**Alur signIn:** Google OAuth → NextAuth `signIn` callback (server) upsert `users` by `google_sub` via service role → simpan `user.dbId` di session → tiap request server verifikasi session lalu query ber-filter `user_id`.

### C.3 — Pemetaan Field → Functional Requirements

| Tabel / Kolom | FR |
|---|---|
| `users.google_sub` (upsert NextAuth) | FR-AU-1, FR-AU-2, NFR-4 |
| `user_preferences.budget_ideal/max` | FR-ON-1, FR-SC-1 |
| `user_preferences.dest_*`, `transport_modes` | FR-ON-2, NFR-8 |
| `user_preferences.priority_selection`, `weight_*` | FR-ON-3, FR-SC-1 |
| `user_deal_breakers.*` | FR-ON-4 |
| seluruh `user_preferences` editable | FR-ON-5 |
| `candidates.source_text` | FR-IN-1, NFR-7 |
| typed columns Kontrakan | FR-IN-2 |
| `harga_sewa_bulanan` + `periode_asli` | FR-IN-3 |
| `extraction_confidence` (null = tak tahu) | FR-AI-1, FR-AI-2 |
| score_* diisi rule engine (bukan AI) | FR-AI-3, FR-SC-1 |
| `extraction_confidence` → ✓/⚠ UI | FR-RV-1, FR-RV-2 |
| `candidate_deal_breaker_flags` (tak hapus) | FR-DB-1 |
| `scoring_version`, `score_breakdown` | FR-SC-2, NFR-7 |
| score_* (AI hanya menjelaskan) | FR-SC-3 |
| `decisions.candidates_compared` | FR-CM-1, FR-CM-2 |
| `decisions` (pilih satu) | FR-CM-3, KPI-1 |
| `candidates.status` | FR-ST-1 |

### C.4 — Sengaja Ditunda ke Slice 2 (jalur sudah disiapkan)

| Ditunda | Jalur forward-compat (tanpa redesign) |
|---|---|
| Survey rating/tag | `candidate_surveys` (komentar Section 8); `score_kondisi`/`score_owner` & status `sudah_disurvey` sudah ada |
| Property timeline | `candidate_events` (komentar Section 8); FK ke tabel yang sudah ada |
| Harga asli/akhir + negosiasi | `harga_akhir_bulanan` nullable + GENERATED `harga_efektif_bulanan` sudah ada |
| Form Apartemen & Kost | `property_type` enum + `type_specific_data` jsonb |
| Transport 4 moda penuh | enum `transport_mode` 4 nilai + `candidate_commute` UNIQUE per moda |
| Routing otomatis | `location_lat/lng` + `dest_lat/lng` + `api_provider` |
| Deal breaker auto-eliminasi | filter `WHERE NOT EXISTS (... flags ...)` — query saja |
| Progressive clarification | update `weight_*`; `decisions.candidates_compared` sbg konteks |
| 5 dimensi scoring | `weight_keamanan`/`weight_owner` + `score_kondisi`/`score_owner` placeholder |

---

## D. Risiko Implementasi yang Harus Dijaga (dari DA, bukan blocking desain)

1. **RLS GUC / PgBouncer (silent failure HIGH).** Konfirmasi pool mode (Database > Connection Pooling). Jika transaction-mode, fungsi `SECURITY DEFINER` atomik **mandatory**. Wajib integration test: request unauth → **0 row**.
2. **Drift enum periode (silent failure HIGH).** Satu konstanta TS sebagai single-source untuk Zod (extraction) **dan** DB CHECK `('bulan','3bulan','6bulan','tahun')`. Periode asing dari AI → `null`, bukan insert gagal.
3. **Semantik harga.** `harga_sewa_bulanan` = ASLI immutable; scoring selalu baca `harga_efektif_bulanan`; **bump `scoring_version`** bila formula/semantik berubah.
