# Development Plan — Hunian Slice 2

| | |
|---|---|
| **Scope** | Slice 2 — menambah **kedalaman** ke pipeline keputusan Slice 1 (survey fisik, foto nyata, timeline, negosiasi, biaya all-in, Apartemen & Kost, rute POI asli) |
| **Versi** | 0.1 · 2026-06-27 |
| **Acuan** | [`docs/DEVELOPMENT-PLAN.md`](./DEVELOPMENT-PLAN.md) (Slice 1) · [`docs/PRD.md`](./PRD.md) · [`docs/ERD.md`](./ERD.md) · `db/schema.sql` (SECTION 8 = DDL Slice 2 referensi) |

> Prinsip dipertahankan dari Slice 1: **AI mengurangi mengetik, bukan memutuskan**; **scoring rule-based** (AI hanya ekstraksi/normalisasi/penjelasan); **tanpa angka karangan** (placeholder jelas berlabel); setiap query server **filter `user_id`** (RLS bypass service role).

---

## Status transisi (akhir Slice 1)

Pipeline Slice 1 (onboarding → input → extraction → review → scoring 3-dim → compare → pilih) **lengkap**, dan seluruh halaman sudah di-revamp ke mockup: **Detail kandidat** (+ fitur **POI** OpenStreetMap), **Tambah kandidat** `/input` (wizard 3 langkah), **Bandingkan** (Decision Memo → `decisions.notes`), **Pengaturan** (sidebar konteks), **Edit kandidat** (form manual selaras `/input`). Dua fitur "ambang Slice 2" **sudah diaktifkan** karena kolomnya tersedia: **Deadline pindah** (`deadline_pindah` + countdown) dan **Deal breaker kustom** (`custom_text`, sebagai pengingat — belum auto-flag).

Sisanya = **placeholder "Segera"** di UI yang menunggu data Slice 2. Slice 2 = mengaktifkannya **tanpa migrasi besar** (mayoritas kolom/tabel sudah dirancang di schema).

### Yang sudah disiapkan di schema (tinggal diaktifkan)
- Tabel referensi (SECTION 8, belum di-`CREATE`): **`candidate_surveys`** (rating bintang + tag), **`candidate_events`** (timeline).
- Tabel sudah ada: **`candidate_photos`** (storage_path/caption/sort_order), **`candidate_commute`** (multi-moda).
- Kolom placeholder di `candidates`: **`score_kondisi`**, **`score_owner`**, **`harga_akhir_bulanan`** (feed `harga_efektif_bulanan` GENERATED), **`biaya_listrik`/`biaya_air`/`biaya_ipl`**, **`type_specific_data`** (JSONB).
- Kolom di `user_preferences`: **`weight_keamanan`**, **`weight_owner`** (untuk 5-dimensi).
- Tabel rancangan (di dok, belum dibuat): **`candidate_poi`** (cache POI + rute asli — lihat DEVELOPMENT-PLAN.md §POI).

---

## Keputusan MVP — APPROVED 2026-06-27 (sumber: `next-feature/slice2-prioritisasi.md`)

Setelah diskusi tim ORCHESTRATOR (PM·UX·Strategist·Tech-Lead·Devil's-Advocate·Synthesizer·PO), **Slice 2 MVP dipersempit & diurut ulang** dari katalog fase di bawah:

- **MVP = S2-0 (aktivasi DB) + S2-2 (survey fisik → skor 5 dimensi) + S2-4 (negosiasi harga) + S2-5 (biaya all-in *display-only*) + events sebagai side-effect** (isi `candidate_events`, **tanpa** membangun UI timeline dulu).
- **Urutan eksekusi:** **S2-0 → S2-2 (taruhan inti) → (S2-4 ∥ S2-5)**. **Bukan foto-first** — hanya survey yang menambah *dimensi keputusan baru* (Kondisi & Owner); fase lain = enrichment.
- **Ditunda ke Slice 2.5/3:** galeri **foto-listing standalone** (S2-1 — feature-parity trap; "Foto Survey" dijahit ke form survey S2-2 saja), **UI Timeline** (S2-3), **Apartemen & Kost** (S2-6; nanti **Kost dulu**), **POI rute asli** (S2-7; tetap garis lurus), S2-8.
- **Keputusan scope terkunci:**
  - **G1 = A** — bobot **Kondisi & Owner** masuk editor Prioritas `/pengaturan` (default EQUAL, **bisa di-override user**); perluas `computeWeights` 3D→5D, pakai `weight_keamanan`/`weight_owner`. (Menjaga prinsip "bobot = pilihan user".)
  - **G2 = Ya** — pilot diberi tahu skor 3D→5D bisa menggeser ranking (one-shot migration, bukan bug).
  - **Survey** = 6 dimensi langsung (Kondisi+Owner diprioritaskan), skor = **rata-rata sederhana per kelompok** → 0–100; `deriveVerdict` boleh ikut 5D tapi perubahannya **eksplisit** & framing tetap trade-off.
  - **Biaya all-in** = **ADD COLUMN numeric** (`biaya_listrik_nominal`/`biaya_air_nominal`; teks asli tetap disimpan) tapi **display-only** — **tidak masuk scoring** (hindari false precision); wajib label sumber harga + callout di Compare.
  - **scoring_version → 2.0**, migrasi **one-shot** semua kandidat sebelum deploy (pilot <20 kandidat).
- **Revisit trigger:** 0 event `survey_completed` setelah 3 sesi pilot → emergency review (saat itu opsi survey 2D bertahap jadi relevan, dengan data).

> Katalog fase di bawah tetap jadi **referensi desain lengkap**; untuk eksekusi MVP ikuti urutan & scope di atas.

## Peta Fase (urut nilai × dependensi)

```
S2-0  Aktivasi DB (jalankan DDL + bucket)     ░░░░░░  manual/kecil
S2-1  Foto kandidat nyata                      ███░░░  visible, dependensi rendah
S2-2  Survey fisik → skor 5 dimensi            ██████  kunci (membuka radar Kondisi/Owner)
S2-3  Timeline / events                        ███░░░  bergantung aksi yang sudah ada
S2-4  Negosiasi harga (awal→akhir)             ██░░░░  kecil, kolom siap
S2-5  Biaya all-in terstruktur                 ███░░░  ekstraksi + form + total
S2-6  Apartemen & Kost (type_specific_data)    █████░  perluas extraction + form + detail
S2-7  POI rute asli ter-cache di DB            ███░░░  upgrade dari garis lurus
S2-8  Aktivasi lain (moda, dll)                ██░░░░  pelengkap
```

**Catatan scoring (konvensi CLAUDE.md #3):** begitu survey menambah dimensi Kondisi/Owner, **naikkan `scoring_version`** (mis. `1.0` → `2.0`/`v2-5D`) agar skor lama vs baru bisa dibedakan. `harga_efektif_bulanan` tetap COALESCE(akhir, terpilih, asli).

---

## S2-0 — Aktivasi DB
- Jalankan DDL **`candidate_surveys`** & **`candidate_events`** (SECTION 8 `db/schema.sql`) di Supabase SQL editor; tambah index + **RLS** (policy via join ke `candidates(user_id)`), tetap filter `user_id` di query server.
- Buat **Supabase Storage bucket `candidate-photos`** (untuk S2-1).
- (Saat S2-7) tambahkan tabel **`candidate_poi`** (DDL sudah ditulis di DEVELOPMENT-PLAN.md). Jaga konsistensi jumlah tabel & dokumentasikan di `db/schema.sql`.

## S2-1 — Foto kandidat nyata — ✅ IMPLEMENTED 2026-06-27
- **Migration:** `db/migrations/2026-06-27_slice2_s2-1_photos.sql` — `candidate_photos.source` (listing/survey) + bucket `candidate-photos` (private). **Jalankan di Supabase.**
- `photo-actions.ts` (`uploadPhotoAction` FormData→Storage via service role; `deletePhotoAction`), `lib/photos.ts` (`loadCandidatePhotos` + signed URL batch, toleran bila migration belum jalan).
- `photo-gallery.tsx` ditulis ulang: galeri nyata (`<img>` signed URL) + hapus (hover) + lightbox (kbd nav). **Galeri atas = SEMUA foto** (listing + survei; survei diberi badge "Survey"). Section "Foto Survey" terpisah **dihapus** (redundan). Foto survei ditambah lewat **form survey** (`survey-client.tsx`, upload langsung tanpa reload).
- **Upload**: multi-file (`multiple`), **kamera** (`capture="environment"`), dan **tempel gambar** (paste Ctrl/⌘+V → window paste listener, hanya bila clipboard berisi gambar). `Photo.source` membedakan listing/survey.
- `next.config.mjs`: `serverActions.bodySizeLimit: "10mb"` (default 1MB terlalu kecil utk foto ponsel).

## S2-2 — Survey fisik → lengkapi data + skor 5 dimensi  *(fase kunci)* — ✅ IMPLEMENTED 2026-06-27
> Status: **selesai** (typecheck hijau). File: `lib/scoring/score.ts` (5D + `scoreKondisiFromSurvey`/`scoreOwnerFromSurvey`), `lib/scoring/rescore.ts` (baca survey scores), `app/onboarding/options.ts` (`computeWeights` 5D + PRIORITIES), callers (`app/input/actions.ts`, `app/onboarding/actions.ts`, `app/pengaturan/actions.ts`). Capture: `app/kandidat/[id]/survey/{page,survey-client,actions}.tsx` (form 2-bagian + `saveSurveyAction`). UI: detail (`Update Survey` link, Hasil Survey nyata, Disurvey date, radar 5D), settings (prioritas Kondisi/Owner aktif), bandingkan (radar un-ghost, baris bintang nyata). Sisa minor: foto-survei masih dummy (S2-1), timeline UI (S2-3), migrasi one-shot otomatis terjadi via rescore saat prefs berubah / kandidat disurvey.
**Survey = DUA fungsi sekaligus** (kunjungan fisik momen paling natural untuk keduanya):
- **(A) Lengkapi data objektif** yang belum ada di listing — persis daftar **"Yang belum lengkap"** di detail (`listUnknowns`, `lib/extraction/unknowns.ts`): kamar tidur/mandi, furnished, carport, dapur, luas, deposit, biaya listrik/air, alamat, dll. → update kolom `candidates` → **memperbaiki skor 3D lama** (terutama Fasilitas/Lokasi) + completeness.
- **(B) Penilaian subjektif** (rating 1–5 + tag) → `candidate_surveys` → **menambah 2 dimensi baru** (Kondisi, Owner).

> Jadi satu kunjungan **menyempurnakan skor lama DAN menambah dimensi baru** — bukan sekadar 2D tambahan. Memperkuat argumen "survey = penggerak cycle completion".

**Membuka:** section **"Hasil Survey"** (★) di detail, **"Foto Survey"** nyata, tanggal **"Disurvey"** di status strip, dimensi **Kondisi & Owner** di radar (detail + `compare-radar.tsx` yang kini di-ghost), tombol footer **"Update Survey"** (kini disabled), dan **menutup item "Yang belum lengkap"** di detail.

**Form survey (target <90 detik on-location):**
- **Bagian "Lengkapi data"** — **hanya tampilkan field yang MASIH kosong** (dari `listUnknowns` kandidat itu; yang sudah terisi tak diminta lagi). Reuse field-field manual `app/input/manual-forms.tsx`. Submit → update `candidates` (memicu re-score 3D + `data_updated` event).
- **Bagian "Penilaian"** — rating 1–5 + tag per dimensi (kebersihan/kebisingan/parkir/owner/keamanan/kondisi_bangunan) + `catatan_survey` → upsert `candidate_surveys` (`UNIQUE(candidate_id)`).
- Set status `sudah_disurvey`; log `survey_completed` ke `candidate_events`.

**Scoring:** isi `score_kondisi` & `score_owner` dari rating (avg sederhana per kelompok → 0–100); aktifkan `weight_keamanan`/`weight_owner` di formula → radar **5 dimensi** nyata (`lib/scoring/score.ts`, `rescore.ts`). **Bump `scoring_version` → 2.0** + migrasi one-shot. Bobot K&O **bisa diatur user** di editor Prioritas `/pengaturan` (G1=A); perluas `computeWeights` 3D→5D. `deriveVerdict` (`lib/scoring/verdict.ts`) boleh ikut 5D dengan perubahan **eksplisit**, framing tetap trade-off.

**UI:** detail page (`app/kandidat/[id]/page.tsx`) ganti `<ComingSoon title="Hasil survey">` & `SurveyPhotos` dummy dengan data nyata; "Yang belum lengkap" menyusut seiring data terisi; di **Bandingkan** (`compare-client.tsx`) baris survey "— Segera" → bintang nyata, `compare-radar.tsx` dims Kondisi/Owner lepas `placeholder`.

## S2-3 — Timeline / events — ✅ IMPLEMENTED 2026-06-27
- Helper terpusat `lib/events.ts` (`insertCandidateEvent`, best-effort). Event dicatat: `added` (saveCandidate), `status_changed` (updateStatusAction), `data_updated` (updateCandidateAction), `survey_completed`+`data_updated` (saveSurveyAction), `price_changed` (recordNegotiationAction), `user_note` (`recordNoteAction`).
- UI: section Timeline di detail render dari `candidate_events` (urut `occurred_at`) + `timeline-note.tsx` ("Tambah catatan manual"). `ComingSoon` dihapus dari detail.

## S2-4 — Negosiasi harga (awal → akhir) — ✅ IMPLEMENTED 2026-06-27
- `recordNegotiationAction` (`app/kandidat/[id]/actions.ts`) set `harga_akhir_bulanan` → GENERATED `harga_efektif_bulanan` COALESCE → re-score (skor harga) + event `price_changed`.
- UI: komponen `negotiation-control.tsx` ("Catat harga nego") di header detail; badge **hemat** muncul otomatis. Tanpa migrasi.

## S2-5 — Biaya all-in (display-only) — ✅ IMPLEMENTED 2026-06-27
- **Migration:** `db/migrations/2026-06-27_slice2_s2-5_biaya_nominal.sql` — ADD COLUMN `biaya_listrik_nominal`/`biaya_air_nominal` numeric (teks lama tetap; `biaya_ipl` sudah ada). **Jalankan di Supabase sebelum pakai.**
- Pengisian: field Rp listrik/air/IPL di form **Update Survey** (`saveSurveyAction` dataPatch).
- Detail: kartu **"Rincian Biaya All-in"** menghitung total (sewa + listrik + air + IPL) + upfront + callout bila belum lengkap. **DISPLAY-ONLY — tak masuk scoring** (hindari false precision). Internet = "Segera". Tanpa ekstraksi AI dulu.

## S2-6 — Apartemen & Kost (manual) — ✅ IMPLEMENTED 2026-06-27
- **Config tunggal** `app/input/type-specific.ts` (field per tipe + `cleanTypeData` whitelist — pengganti Zod ringan, tanpa dependency). Apartemen: nama/lantai/tower/nomor unit/tipe unit/IPL. Kost: nama/KM dalam-luar/tipe penghuni/jam malam.
- Form **fungsional** (`manual-forms.tsx` ApartemenForm/KostForm), type-selector tanpa "Segera"; field umum → kolom `candidates`, extra → **`type_specific_data`** JSONB. `saveCandidate` tulis `property_type` + `type_specific_data`; review-list & detail render adaptif per tipe; **edit** juga mendukung (`updateCandidateAction` tulis type_specific_data).
- **Ditunda**: ekstraksi AI paste untuk apartemen/kost (tetap Kontrakan-only — apartemen/kost = manual). Scoring pakai 3D/5D yang ada (type_specific_data display-only). Zod/`pg_jsonschema` bila perlu validasi lebih ketat.

## S2-7 — POI rute asli ter-cache di DB
**Upgrade:** dari **jarak garis lurus** (sekarang) ke **rute asli per-POI** via Google Directions, **di-cache** agar tak call berulang.
- Buat tabel `candidate_poi` (DDL di DEVELOPMENT-PLAN.md). Saat detail dibuka & cache kosong → fetch Overpass, upsert (`straight_km`). Hitung `route_km`/`route_min` **lazy & terbatas** (top-N) via `lib/maps/directions.ts`; UI pakai `route_*` bila ada, fallback `straight_km`. Biaya Directions terbayar sekali per (kandidat × POI).

## S2-8 — Aktivasi pelengkap
- Moda **`transit`** & **`jalan_kaki_sepeda`**: insert baris baru `candidate_commute` saat dipilih.
- (Opsional) Deal breaker **auto-eliminasi** sebagai mode; **progressive clarification** prioritas; breadcrumb "Survey" di topnav Bandingkan jadi nyata setelah S2-2.
- (Opsional) Deal breaker **kustom** ikut evaluasi semi-otomatis bila kelak ada aturan; saat ini tetap pengingat pribadi.

---

## Definition of Done (Slice 2)
- Survey fisik mengisi `candidate_surveys` → **radar 5 dimensi nyata** (Kondisi/Owner) di detail & bandingkan; `score_kondisi`/`score_owner` terisi; `scoring_version` dinaikkan.
- Foto kandidat nyata (upload + render dari Storage) menggantikan dummy.
- Timeline nyata dari `candidate_events`; negosiasi harga & biaya all-in aktif.
- Apartemen & Kost bisa disimpan & dinilai (via `type_specific_data`).
- POI memakai rute asli ter-cache; tak ada lagi placeholder "Segera" untuk fitur di atas.
- Tak ada angka difabrikasi; semua placeholder Slice-1 yang relevan sudah berisi data nyata.

## Catatan implementasi
- Mayoritas fase **tanpa migrasi besar** — kolom/tabel sudah dirancang. Yang perlu `CREATE`: `candidate_surveys`, `candidate_events`, `candidate_poi` + bucket `candidate-photos`.
- Jaga konvensi CLAUDE.md: `periode_asli` single-source (`lib/constants/periode.ts`); semantik harga terkunci (`harga_efektif` baca generated); bump `scoring_version` saat formula berubah; service-role server-only + filter `user_id`.
