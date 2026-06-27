# Development Plan — Hunian Slice 1

| | |
|---|---|
| **Scope** | Slice 1 — pipeline keputusan end-to-end untuk **Kontrakan** |
| **Versi** | 1.0 · 2026-06-26 |
| **Owner** | Faisal |
| **Estimasi total** | ~19–26 hari kerja (solo) |
| **Dokumen acuan** | [`docs/PRD.md`](./PRD.md) · [`docs/BRD.md`](./BRD.md) · [`next-feature/mvp-build-sequencing.md`](../next-feature/mvp-build-sequencing.md) |

> Prinsip: Slice 1 dibangun sebagai **satu pipeline utuh, tidak dipecah**. Tiap fase menambah segmen pipeline dan harus tetap menjaga jalur end-to-end bisa dijalankan secepat mungkin.

---

## Peta Fase

```
Fase 0  Fondasi + Gate Akurasi        ██░░░░░░  2–3 hari   (sebagian paralel: Faisal kumpulkan teks)
Fase 1  Onboarding + Data Model       ███░░░░░  3–4 hari
Fase 2  Input + Extraction + Review   ██████░░  5–7 hari   ← inti value, paling berat
Fase 3  Scoring + Explanation         ███░░░░░  3–4 hari
Fase 4  Compare + Decision            ████░░░░  4–5 hari   ← hero feature, penutup siklus
Fase 5  Instrumentasi + Pilot         ██░░░░░░  2–3 hari
```

**Critical path:** Fase 0 → 1 → 2 → 3 → 4 → 5 (mostly sequential, karena pipeline).
**Bisa paralel:** pengumpulan 20+ teks nyata (Faisal) berjalan selama Fase 0–1; setup Google Maps key bisa kapan saja sebelum Fase 1 selesai.

---

## Fase 0 — Fondasi & Gate Akurasi

**Tujuan:** repo siap bangun, infra tersambung, dan asumsi terbesar (akurasi ekstraksi) divalidasi di data nyata **sebelum** effort besar.

**Tugas:**
- [x] Bereskan repo: hapus `go.mod` nyasar; scaffold project Next.js 15 + Tailwind 3 (shadcn-ready); perbarui `CLAUDE.md`. ✅ build hijau.
- [~] Setup Supabase: DDL `db/schema.sql` (8 tabel, RLS, GENERATED harga) **sudah siap** — tinggal dijalankan di Supabase SQL editor (langkah manual Faisal).
- [x] Setup **Auth.js (NextAuth) v5 + Google OAuth** (split config edge-safe + upsert user); middleware proteksi route; halaman `/login` & beranda terproteksi. ✅
- [x] Konfigurasi `.env.local` (OpenAI, Supabase, Google Maps, AUTH_SECRET). ✅
- [ ] Set Google OAuth redirect URI + jalankan `schema.sql` (manual) → lalu `npm run dev` untuk verifikasi login end-to-end.
- [ ] Deploy skeleton ke Vercel (memastikan pipeline deploy jalan sejak awal).
- [ ] **Gate:** kumpulkan ≥20 teks broker WA nyata → isi `benchmark/dataset.json` → `npm run bench` → verdict GO/NO-GO.

**Exit criteria:**
- App kosong ter-deploy & tersambung Supabase.
- Benchmark data-nyata **≥85% overall** (GO). Jika NO-GO → iterasi `prompt.mjs`/pre-processing dulu, jangan lanjut Fase 2.

**Dependensi:** kredensial (ada). Estimasi: **2–3 hari** (di luar waktu Faisal mengumpulkan teks).

---

## Fase 1 — Onboarding + Data Model

**Tujuan:** sistem punya context user untuk evaluasi; fondasi data & auth siap.

**Tugas (FR-LP-1 + FR-ON-1..5):**
- [x] **Landing page publik di `/`** (hero + how-it-works + features + CTA), responsif penuh, animasi Framer Motion + gambar placeholder — FR-LP-1, NFR-9/10. ✅ build hijau. `/login` terpisah; app di `/dashboard` (+ route lain) diproteksi middleware.
- [ ] **Google login wajib (Auth.js/NextAuth)** sebagai gerbang awal sebelum onboarding; kaitkan data ke user — FR-AU-1/2, NFR-4. *(Setup OAuth dikerjakan di Fase 0; di sini integrasi ke flow + proteksi route.)*
- [ ] Step Budget (ideal & maksimal) — FR-ON-1.
- [ ] Step Tujuan + moda transport (≥2 moda; schema siap 4) + lokasi via Google Maps — FR-ON-2.
- [ ] Step Prioritas (multi-select → bobot; tampil bintang, tanpa angka %) — FR-ON-3.
- [ ] Deal breaker ringkas (preset + tambah sendiri) — FR-ON-4.
- [ ] Settings: semua dapat diedit — FR-ON-5.

**Exit criteria:** user baru bisa menuntaskan onboarding; preferensi tersimpan & terbaca; bobot scoring ter-generate.

**Dependensi:** Fase 0. Estimasi: **3–4 hari**.

---

## Fase 2 — Input + AI Extraction + Property Review

**Tujuan:** inti value — input copy-paste jadi data terstruktur yang user cukup **verifikasi**.

**Tugas (FR-IN, FR-AI, FR-RV):**
- [x] UI input `/input`: tab "Tempel teks" & "Form manual" — FR-IN-1/2. ✅
- [x] Ekstraksi server action (`lib/extraction/extract.ts` + `app/input/actions.ts`): GPT-4o mini, `response_format: json_object`, normalisasi/coerce + null untuk tak diketahui — FR-AI-1/2. ✅
- [x] Harga + periode → konversi per bulan; deposit "N bulan" → nominal (di prompt) — FR-IN-3, FR-AI-2. ✅
- [x] Property Review (di `/input`, step "review"): hasil ekstraksi editable + marker ✓/⚠, bukan form kosong — FR-RV-1/2. ✅
- [x] Simpan kandidat ke `candidates` (status default "tersedia", `property_type=kontrakan`) — FR-ST-1. ✅
- [x] Fallback: tab Form manual (tanpa AI) — NFR-5. ✅
- [ ] (Lanjutan) input km manual untuk `distance_km` + scoring 3 dimensi → Fase 3.

**Exit criteria:** dari teks tempel → kandidat tersimpan dengan field terverifikasi, dalam < ~5 dtk (NFR-1). Reuse logika ekstraksi yang sama dengan benchmark.

**Dependensi:** Fase 0 (gate GO), Fase 1 (ada user/context). Estimasi: **5–7 hari**.

---

## Fase 3 — Scoring + Deal Breaker Eval + Explanation

**Tujuan:** tiap kandidat punya skor yang konsisten, dapat dijelaskan, dan deal breaker tertandai.

**Tugas (FR-SC, FR-DB):**
- [x] Engine rule-based 3 dimensi (`lib/scoring/score.ts`) dengan bobot onboarding + **renormalisasi NULL** — FR-SC-1. ✅
- [x] `scoring_version` per kandidat (`v1-3D`/`v1-2D`/`v1-1D`) + `score_breakdown` jsonb (audit), di-compute saat simpan — FR-SC-2. ✅
- [x] Evaluasi deal breaker → flag pelanggar (`candidate_deal_breaker_flags`, tanpa hapus); subset terdeteksi Slice 1 (no_dapur/no_memasak) — FR-DB-1. ✅
- [x] Jarak/skor Lokasi: **Google Maps Distance Matrix** (`lib/maps/distance.ts`) — saat simpan, jarak tujuan→kandidat dihitung otomatis (server-side) dari `dest_address` + `alamat` kandidat, moda dari onboarding → `candidate_commute` (api_provider=google_maps) → `score_lokasi` (skor jadi `v1-3D`). Gagal/data kurang → null (di-renormalisasi). ✅
- [x] AI explanation on-demand (`lib/explain/explain.ts` + ExplainPanel): faktor pendukung + "yang belum diketahui", AI tidak mengubah skor — FR-SC-3, FR-AI-3. ✅
- [x] **Layar detail kandidat `/shortlist/[id]`** (Layar 6): breakdown skor, flag, detail, sumber, ubah status, hapus. ✅

**Exit criteria:** kandidat menampilkan skor (kecil), flag deal breaker, dan penjelasan natural; skor dapat diaudit & reproducible.

**Dependensi:** Fase 2 (ada data kandidat). Estimasi: **3–4 hari**.

---

## Fase 4 — Compare + Decision

**Tujuan:** hero feature — tempat keputusan terbentuk; menutup siklus (KPI-1).

**Tugas (FR-CM, FR-ST):**
- [x] Compare ≥2 kandidat (`/bandingkan`), **trade-off forward** (tabel ✓/~/✗ kolom sticky + ringkasan "Pilih X berarti…", rule-based bukan AI) — FR-CM-1. ✅
- [x] Skor tampil sekunder, bukan ranking utama — FR-CM-2. ✅
- [x] Deal breaker sebagai baris di compare (flag count) — FR-DB-1. ✅
- [x] Aksi "Pilih ini" **OPSIONAL** → catat `decisions` (1 row = siklus selesai, KPI-1). Keputusan Faisal: user boleh hanya melihat perbandingan tanpa memilih — FR-CM-3. ✅
- [x] Status kandidat (di detail): Tersedia/Disurvey/Tersewa; "Tersewa" disisihkan dari compare & dashboard — FR-ST-1. ✅
- [ ] (Lanjutan) skor Lokasi via Google Maps; max 3 kandidat sudah diterapkan.

**Exit criteria:** user dapat menjalankan **siklus penuh** input → compare → pilih. Inilah definisi "siklus selesai" untuk KPI-1.

**Dependensi:** Fase 3 (ada skor). Estimasi: **4–5 hari**.

---

## Fase 5 — Instrumentasi, Polish & Pilot

**Tujuan:** ukur yang benar, rapikan, dan dorong ke 10 pilot user.

**Tugas:**
- [ ] Tracking **KPI-1** (cycle completion) & **KPI-2** (session depth) — PRD §10.
- [ ] Exit survey di Compare: "Apakah skor ini membantu memutuskan?" (ya/tidak).
- [ ] Error handling, empty states, polish mobile-web (NFR-1/6).
- [ ] Review privasi: tak ada data pribadi di URL; service-role key hanya server-side (NFR-3).
- [ ] Onboard 10 pilot user (dikenal & aktif) + jalur follow-up manual untuk dead zone.

**Exit criteria:** ≥5 user menyelesaikan sesi penuh; data KPI mengalir; siap **review GO/NO-GO sebelum Slice 2**.

**Dependensi:** Fase 4. Estimasi: **2–3 hari**.

---

## Definition of Done (Slice 1)

- Pipeline end-to-end (onboarding → input → extraction → review → scoring → compare → pilih) berjalan di production (Vercel).
- Gate akurasi data-nyata terlewati & tercatat.
- KPI-1/KPI-2 + exit survey ter-instrumentasi.
- ≥5 pilot user menyelesaikan siklus → bahan keputusan lanjut/ tidaknya Slice 2.

## Yang Eksplisit DITUNDA ke Slice ≥2

> **Slice 2 sudah dimulai** — rencana detail (fase, tabel, file) ada di [`docs/DEVELOPMENT-PLAN-SLICE2.md`](./DEVELOPMENT-PLAN-SLICE2.md). Catatan: **Deadline pindah** & **Deal breaker kustom** dari daftar ini sudah diaktifkan di Slice 1 (kolom tersedia).

~~Form Apartemen & Kost~~ (**aktif manual, S2-6**) · ~~Survey fisik~~ (**aktif, S2-2**) · ~~Property Timeline~~ (**aktif, S2-3**) · ~~Harga asli/akhir + catat negosiasi~~ (**aktif, S2-4**) · Progressive clarification prioritas · Routing jarak otomatis · Deal breaker auto-eliminasi · ~~Onboarding step Deadline pindah penuh~~ (sudah aktif).

### Placeholder "Segera" di UI (detail page & dashboard) — apa yang belum & apa yang dibutuhkan

Redesign detail page + dashboard menampilkan beberapa section sebagai placeholder `<ComingSoon>` (komponen `components/app/coming-soon.tsx`) agar layout sesuai mockup tanpa mengarang angka. Yang harus dibangun agar nyata:

| Section (placeholder) | Belum ada | Dibutuhkan untuk mengaktifkan |
|---|---|---|
| **Verdict** (Pertahankan/Sisihkan) | Sistem keputusan per kandidat | Kolom verdict/keputusan di `candidates` + aksi UI + (opsional) integrasi dgn `recordDecisionAction`. Catatan: "Perlu data" sudah diturunkan nyata (skor null / jarak kosong) di kartu dashboard. |
| **Hasil survey** (★ Kondisi/Owner/Lingkungan) | ~~Tabel `candidate_surveys`~~ **SUDAH AKTIF (S2-2)** | `candidate_surveys` dibuat (migration S2-0); form survei di `/shortlist/[id]/survey` (lengkapi data + rating) → `score_kondisi`/`score_owner` + radar 5 dimensi (detail & bandingkan); bobot K&O di editor Prioritas `/pengaturan`. |
| **Timeline** | ~~Tabel `candidate_events`~~ **SUDAH AKTIF (S2-3)** | `candidate_events` (migration S2-0) + `lib/events.ts` (`insertCandidateEvent`) mencatat added/status_changed/data_updated/survey_completed/price_changed/user_note; timeline + "Tambah catatan manual" di detail. |
| **Biaya all-in** (listrik/air/internet/IPL) | ~~Ekstraksi & pengisian~~ **SUDAH AKTIF (S2-5, display-only)** | Migration S2-5 menambah `biaya_listrik_nominal`/`biaya_air_nominal`; diisi via form "Update Survey" (Rp listrik/air/IPL); kartu "Rincian Biaya All-in" di detail menghitung total. **Tidak masuk scoring** (hindari false precision). Internet masih "Segera". |
| **Negosiasi harga awal→akhir** | ~~Nilai `harga_akhir_bulanan`~~ **SUDAH AKTIF (S2-4)** | `recordNegotiationAction` + kontrol "Catat harga nego" di header detail → set `harga_akhir_bulanan` (GENERATED `harga_efektif` COALESCE) → badge hemat + re-score + event `price_changed`. |
| **Deadline pindah** (hitung mundur di panel konteks) | ~~Pengisian nilai + input~~ **SUDAH AKTIF** | Kolom `user_preferences.deadline_pindah` (date) diisi via editor di `/pengaturan` (date picker + tombol cepat); countdown tampil di panel konteks sidebar (`SidebarContext`). Tak lagi placeholder. |
| **Foto kandidat** (galeri utama + lightbox + "Foto Survey") di detail page | ~~UI upload + render foto nyata~~ **SUDAH AKTIF (S2-1)** | `photo-actions.ts` (upload/delete via service role) + `lib/photos.ts` (signed URL) + `candidate_photos.source` (migration S2-1) + bucket `candidate-photos` privat. Galeri nyata + lightbox + hapus di `photo-gallery.tsx`; listing vs survei dibedakan. `next.config.mjs` bodySizeLimit 10mb. |

Catatan detail page: tombol footer **"Update Survey"** sengaja `disabled` (Slice 2). **"Sisihkan"**/**"Pulihkan"** = ubah status nyata (`updateStatusAction`), **"Bandingkan"** → `/bandingkan?ids=`. Tanggal "Disurvey" di status strip tidak ditampilkan karena belum ada field tanggal survey (lihat baris Hasil survey).

Catatan halaman **Tambah Kandidat (`/input`)**: di-revamp ke mockup — **lepas dari `AppShell`/sidebar** (wizard fokus), pakai **topnav + stepper 3 langkah** (Input · Review · Selesai), **action bar** bawah, dan **layar sukses**. Komponen: `input-flow.tsx` (controller), `paste-card.tsx` (textarea + loading overlay AI), `type-selector.tsx`, `manual-forms.tsx`, `review-list.tsx` (Cek Hasil Ekstraksi: inline-edit + badge), `success.tsx`. Yang **disabled / Slice 2** (form disiapkan tapi belum aktif):
- **Form Apartemen & Kost**: markup lengkap tapi semua input `disabled` + notice; tombol Simpan diblokir bila tipe ≠ kontrakan (hanya **Kontrakan** yang tersimpan). Implementasi penuh nanti via kolom **`type_specific_data` JSONB** (sudah ada di schema) — tanpa migrasi per-kolom.
- **Field Slice-2 di form/review**: Harga Akhir (negosiasi `harga_akhir_bulanan`), Platform Asal, Biaya bulanan (listrik/air/internet), Status kandidat saat buat → **tampil disabled + badge "Segera"** (tak ditulis ke DB).

Yang **nyata/aktif sekarang**: ekstraksi AI (`extractAction`→`lib/extraction/extract.ts`), badge "Terdeteksi/Diisi manual/Kosong" diturunkan dari **provenance field** (bukan hardcoded), simpan (`saveCandidate`) + skor + deal-breaker flag. **Jarak**: tetap auto dari alamat (Distance Matrix) **+ fallback input km manual** di Review bila alamat kosong/geocode gagal → disimpan `candidate_commute` dengan `api_provider='manual'` (sesuai desain Slice 1). Tidak ada migrasi DB.

Catatan peta: detail page memakai **Leaflet + OpenStreetMap** (`react-leaflet`), koordinat di-*geocode* lazy via Google Geocoding (`lib/maps/geocode.ts`) dan disimpan ke `candidates.location_lat/lng` & `user_preferences.dest_lat/lng` (kolom sudah ada). **Garis rute mengikuti jalan** (bukan garis lurus) + **durasi tempuh** via Google Directions (`lib/maps/directions.ts`), dipanggil **sekali lalu di-cache** di `candidate_commute`: `route_summary` menyimpan *encoded overview_polyline*, `duration_min` menyimpan durasi. Cache di-*update* hanya bila baris commute sudah ada (tidak mengganggu data scoring); `rescore` yang menghapus/menulis ulang baris commute akan memicu refetch rute saat detail dibuka lagi. Angka **jarak** tetap dari Distance Matrix `mode=driving` (`lib/maps/distance.ts`) — bukan haversine. Tidak ada migrasi DB.

Catatan seksi **"Akses & Lingkungan Sekitar" (POI)** di detail page:

- **Sekarang (sudah jalan):** POI nyata (halte/stasiun, minimarket/pasar/mall, RS/klinik/apotek, sekolah, tempat ibadah, kuliner, pintu tol) diambil dari **OpenStreetMap Overpass API** — `lib/maps/poi.ts` → `fetchNearbyPOIs(lat,lng)`. **GRATIS, tanpa Google Maps key**, di-*cache* via Next fetch (`revalidate` 7 hari, key = URL → koordinat dibulatkan 5 desimal; ada endpoint Overpass fallback + timeout 12 dtk). Komponen: `poi-section.tsx` (server, dibungkus `<Suspense>` agar Overpass yang lambat tak memblok render halaman), `poi-explorer.tsx` (filter kategori + list + peta), `poi-map.tsx` (Leaflet). **Jarak = garis lurus (haversine)** + estimasi waktu kasar (jalan <1,2 km @5 km/jam; motor @25 km/jam) — keduanya **dilabeli "estimasi garis lurus"** di UI, bukan diklaim jarak/waktu tempuh. **Tanpa perubahan schema.**
- **Upgrade (Slice berikutnya) — rute asli per-POI, di-cache di DB** agar tak memanggil Google berulang. **Perlu tabel baru** (tambahkan ke `db/schema.sql`, jaga konsistensi jumlah tabel; aktifkan RLS + tetap filter `user_id` di query server karena service role bypass RLS):

  ```sql
  -- candidate_poi: cache POI sekitar + hasil rute per kandidat (Slice berikutnya)
  create table candidate_poi (
    id           uuid primary key default gen_random_uuid(),
    candidate_id uuid not null references candidates(id) on delete cascade,
    osm_id       text not null,              -- "node/123" dst (idempoten antar-fetch)
    category     text not null,              -- transport|grocery|health|education|worship|dining|highway
    name         text,
    lat          double precision not null,
    lng          double precision not null,
    straight_km  numeric(5,2) not null,      -- haversine (terisi saat fetch Overpass)
    route_km     numeric(5,2),               -- dari Directions (lazy, NULL sampai dihitung)
    route_min    integer,                    -- durasi tempuh menit (lazy)
    mode         text,                       -- driving|walking|transit saat route dihitung
    fetched_at   timestamptz not null default now(),
    unique (candidate_id, osm_id)
  );
  create index on candidate_poi (candidate_id);
  -- RLS: enable + policy lewat join ke candidates(user_id).
  ```

  Alur: saat detail dibuka & cache POI kandidat kosong/kedaluwarsa → fetch Overpass, *upsert* baris (`straight_km` terisi). Durasi rute dihitung **lazy & terbatas** (mis. hanya top-N terdekat per kategori) lewat `lib/maps/directions.ts`, lalu disimpan ke `route_km`/`route_min`. UI menampilkan `route_*` bila sudah ada, jika belum *fallback* ke `straight_km` (estimasi). Dengan ini biaya Directions terbayar **sekali per (kandidat × POI)**, bukan tiap buka halaman.

Catatan halaman **Bandingkan (`/bandingkan`)**: di-revamp ke mockup — **lepas `AppShell`/sidebar**, topnav (Kembali + breadcrumb tahap dekoratif + pill kandidat). Bagian: **Kesimpulan Cepat** (kolom per kandidat, tag win/lose lintas set), **Radar 5-dimensi + Key Facts**, **Insight cards**, **Trade-off "Kalau kamu pilih…"** (pros/cons dari data), **tabel detail** collapsible, **dialog konfirmasi**, **layar sukses + Decision Memo**. Tetap dukung **2–4 kandidat** (picker chips); **identik mockup saat 2 kandidat**, 3–4 mengembang. Semua angka nyata: harga, `budgetZone`/`BUDGET_ZONE_META`, jarak+durasi (`candidate_commute`), deal-breaker label (join `user_deal_breakers`), deposit, **upfront = deposit + sewa 1 bln** (dihitung), skor 3-dim. **Slice-2 ditandai "Segera"**: dimensi radar **Kondisi & Owner** (di-ghost di `compare-radar.tsx`), baris **bintang survey** (Kebersihan/Kebisingan/Kondisi/Owner), **internet/WiFi**. **Decision Memo** disusun dari data nyata (`buildMemo`) & **disimpan ke `decisions.notes`** (`recordDecisionAction` diperluas param `notes`); tombol "Salin Memo". **What-if budget simulator dihapus** (tak ada di mockup). Radar lama `radar-chart.tsx` tetap dipakai detail page (tak diubah). Tanpa migrasi DB.

Catatan halaman **Pengaturan (`/pengaturan`)**: di-revamp ke mockup — **tetap `AppShell` + sidebar konteks** (reuse `SidebarContext`: Budget, Prioritas bintang, Distribusi budget zona, Deadline countdown; `navBadge` = jumlah kandidat aktif). Konten: section **Preferensi Pencarian** = baris expandable (Budget, Tujuan & Transportasi, Prioritas, Deal Breaker, Deadline) — tiap baris punya panel + tombol **Simpan** sendiri yang memanggil `updatePreferencesAction` (kirim full state) → **`rescoreAllForUser`** (Maps hanya bila tujuan berubah); section **Akun** (profil, Ekspor/Bagikan = "Segera", Privasi, **Keluar** + dialog → `signOutAction`); footer Tentang. Komponen: `settings-content.tsx` (client) + `page.tsx` (server, hitung `zoneCount`/deadline untuk sidebar). **Deadline pindah AKTIF** (simpan `deadline_pindah` + countdown). **Deal breaker kustom AKTIF** (`custom_text`) sebagai pengingat pribadi — **belum auto-flag** (hanya preset auto-flag); preset +`no_pasutri` (kini 7). Opsi prioritas non-Slice-1 (keamanan/kondisi/ketenangan/internet) tampil **disabled "Segera"**. `preferences-form.tsx` lama dihapus (digantikan). Reuse `options.ts`/`LocationAutocomplete`/`computeWeights`. Tanpa migrasi DB.

## Risiko & Mitigasi (lihat PRD §12, BRD §10)

| Risiko | Mitigasi | Fase |
|---|---|---|
| Akurasi ekstraksi turun di data nyata | Gate di Fase 0; iterasi prompt sebelum Fase 2 | 0 |
| Property Review terasa "betulkan semua" | Akurasi adalah penjaga; pre-processing | 0,2 |
| Compare kurang berguna tanpa data survey | Deal breaker flag + 3 dimensi sebagai nilai awal | 3,4 |
| Session depth tak prediktif | Tetap kejar KPI-1 via follow-up manual pilot | 5 |

## Catatan Open Decision (boleh diubah sebelum mulai)

- Slice 1 pakai **harga tunggal** (bukan asli/akhir) & **onboarding 3-step**. Jika ingin harga asli/akhir atau 5-step penuh sejak awal, sesuaikan Fase 1 & 2.
