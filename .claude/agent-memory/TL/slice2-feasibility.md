# Tech Lead Feasibility Assessment — Slice 2
Date: 2026-06-27
Author: TL Agent (claude-sonnet-4-6)
Grounding: db/schema.sql SECTION 8 + docs/DEVELOPMENT-PLAN-SLICE2.md

---

## 1. DEPENDENCY MAP & EFFORT MATRIX

### Apa yang "kolom sudah siap, tinggal aktifkan" vs "butuh CREATE baru"

**Kolom sudah ada di candidates (zero migration):**
- score_kondisi, score_owner → aktifkan di scoring engine (S2-2)
- harga_akhir_bulanan → aktifkan field form (S2-4)
- biaya_listrik TEXT, biaya_air TEXT, biaya_ipl NUMERIC → aktifkan di form + extraction (S2-5)
- type_specific_data JSONB → aktifkan per property_type (S2-6)
- weight_keamanan, weight_owner di user_preferences → aktifkan di formula (S2-2)
- harga_efektif_bulanan GENERATED COALESCE → sudah bekerja otomatis saat harga_akhir terisi

**Tabel sudah ada (zero migration):**
- candidate_photos → perlu Storage bucket + server action upload + UI render
- candidate_commute → perlu tambah rows untuk moda baru (S2-8)

**Tabel perlu CREATE (DDL sudah ditulis di SECTION 8, belum dieksekusi):**
- candidate_surveys → S2-2
- candidate_events → S2-3

**Tabel perlu CREATE + DDL baru (belum ada di schema.sql):**
- candidate_poi → S2-7 (DDL di-reference di DEVELOPMENT-PLAN.md §S2-7 tapi belum di-commit ke schema.sql)

**Bucket Storage perlu dibuat:**
- candidate-photos → S2-0/S2-1

---

### Dependency Graph

```
S2-0 (DB Activation)
  ├── S2-1 (Foto)              — prasyarat: bucket candidate-photos
  ├── S2-2 (Survey → 5D)       — prasyarat: CREATE candidate_surveys
  │     └── S2-3 (Timeline, partial) — survey_completed event
  ├── S2-3 (Timeline)          — prasyarat: CREATE candidate_events
  │     └── S2-4 (Negosiasi)   — feeds price_changed event
  ├── S2-4 (Negosiasi)         — kolom harga_akhir_bulanan sudah ada; S2-0 minimal
  ├── S2-5 (Biaya All-in)      — kolom TEXT sudah ada; keputusan NUMERIC additive = migrasi ringan
  ├── S2-6 (Apartemen & Kost)  — type_specific_data sudah ada; schema Zod baru
  ├── S2-7 (POI Rute)          — prasyarat: CREATE candidate_poi
  └── S2-8 (Pelengkap)         — partial depends S2-2 (moda baru lewat commute scoring)
```

**S2-0 adalah prasyarat KERAS untuk S2-1, S2-2, S2-3, S2-7** (tabel/bucket belum exist).
**S2-4, S2-5, S2-6 tidak punya prasyarat hard** — kolom sudah ada, bisa dierjakan paralel setelah S2-0.
**S2-3 bisa dimulai setelah S2-0** (CREATE candidate_events) tanpa tunggu S2-2 — event `added` dan `status_changed` bisa dikerjakan independent dari survey.

---

### Effort Estimates

| Fase | Effort | Alasan |
|------|--------|--------|
| S2-0 | S (0.5 hari) | SQL editor: 2 CREATE TABLE + 1 bucket + RLS policies. Manual, tapi cepat |
| S2-1 | M (2-3 hari) | Signed URL server action, upload UI (progress state), render grid + lightbox, sumber listing vs survey |
| S2-2 | L (4-5 hari) | Form 6 dimensi + tags, server action upsert, scoring formula 5D + bump scoring_version, rescore existing, radar chart update, compare page update, deriveVerdict |
| S2-3 | M (2-3 hari) | CREATE table, hook ke 4-5 existing actions (tambah/status/survey/nego/catatan), render timeline |
| S2-4 | S (1 hari) | Enable form field Harga Akhir + server action, feed S2-3 event |
| S2-5 | M (2-3 hari) | Keputusan schema TEXT vs NUMERIC (migrasi ringan jika additive), update extraction prompt, UI all-in total display |
| S2-6 | L (3-4 hari) | Zod schema per type, update extraction prompt multi-type, form per type (2 types × lebih banyak field), detail render per type |
| S2-7 | M (2-3 hari) | CREATE candidate_poi DDL, lazy-fetch logic, cost-cap constant, cache hit/miss logic, UI fallback |
| S2-8 | S (1-2 hari) | Insert rows baru ke candidate_commute, optional deal breaker work |

**Total rough estimate: ~18-25 hari** (solo builder, tidak paralel).

---

## 2. EMPAT KEPUTUSAN SCOPE TERBUKA

---

### (a) SURVEY — candidate_surveys schema, score derivation, partial survey handling

#### Keputusan 1: Mapping Rating → score_kondisi / score_owner

**Rekomendasi: Rata-rata sederhana per kelompok dimensi, mapped 0-100.**

```
score_kondisi = avg(kebersihan_rating, kondisi_bangunan_rating, kebisingan_rating) / 5 * 100
score_owner   = owner_rating / 5 * 100
```

Catatan: keamanan_rating → masuk ke weight_keamanan sebagai dimensi terpisah (bukan sub dari kondisi).
Parkir_rating → sub-dimensi kondisi atau berdiri sendiri? Rekomendasi: parkir masuk score_kondisi (fisik).
Revisi formula mungkin setelah user testing — bumping scoring_version sudah cukup cover ini.

**Opsi yang TIDAK dipilih:**

A. Weighted average per sub-dimensi (mis. kondisi_bangunan berbobot 2x kebersihan):
   → Ditolak: weights tanpa data user preference = fabrication. Kompleksitas tanpa evidence.

B. AI menentukan score dari catatan_survey:
   → Ditolak: melanggar prinsip "scoring rule-based, bukan AI" (CLAUDE.md konvensi #4). Juga cost per survey.

C. Setiap dimensi rating = skor terpisah (6 score columns di candidates):
   → Ditolak: schema bloat. Slice 1 hanya punya 5 score columns. Menambah 6 lagi = radar chart 9+ axis. Tidak ada nilai product yang terbukti untuk granularitas ini di MVP.

**Tradeoff disadari:** Formula rata-rata sederhana kehilangan nuansa (user mungkin anggap kebersihan lebih penting dari kebisingan). Tradeoff ini diterima karena: (1) user sudah punya weight slider untuk 5 dimensi besar — granularitas di dalam kondisi cukup di level survei, bukan scoring; (2) reversible — scoring_version bump saja kalau formula berubah.

---

#### Keputusan 2: Partial Survey Handling

**Rekomendasi: score_kondisi/score_owner tetap NULL sampai sub-dimensinya terisi MINIMAL 50% (rounding logic), dan renormalisasi Slice 1 yang sudah ada handles NULL gracefully.**

Konkretnya:
- score_kondisi = NULL jika semua sub-dimensi-nya NULL
- score_kondisi = avg dari sub-dimensi yang TIDAK NULL (partial average, bukan strict require-all)
- score_owner = owner_rating / 5 * 100 (single dimension, tidak ada partial issue)
- scoring engine yang sudah handle `NULL score → redistribute weight ke dimensi lain` tetap berlaku

**Implikasi:**
- Kandidat tanpa survey → score_kondisi NULL, score_owner NULL → weight_keamanan + weight_owner di-redistribute ke 3 dimensi lama (renormalisasi Slice 1 sudah handle ini)
- Kandidat dengan survey parsial (misal hanya owner_rating diisi) → score_owner terisi, score_kondisi NULL → hanya weight_owner aktif dari 2 dimensi baru

**Opsi yang TIDAK dipilih:**

A. Require ALL sub-dimensi tidak NULL sebelum score_kondisi dihitung:
   → Ditolak: memaksa user isi semua field saat survey = friction tinggi. User mungkin ingat kebersihan tapi lupa rating parkir.

B. Frontend enforce semua field required sebelum submit:
   → Sama seperti A, tapi di UI. Ditolak — lebih baik save partial data daripada tidak save sama sekali.

C. score_kondisi = 0 (bukan NULL) jika survey belum dilakukan:
   → Ditolak: misleading — 0 berarti buruk, NULL berarti belum tahu. Renormalisasi hanya bekerja benar dengan NULL.

**Tradeoff disadari:** Partial average bisa misleading (user isi 1 dari 3 sub-dimensi = rata-rata 1 nilai). Diterima karena: data parsial > tidak ada data; user bisa update survey; dan di UI bisa tampilkan badge "survey parsial" berdasarkan jumlah sub-dimensi terisi.

---

#### Keputusan 3: scoring_version bump

**Rekomendasi: Bump dari `1.0` ke `2.0` (atau `v2-5D`) saat S2-2 diaktifkan.**

Bump wajib karena:
- score_total sebelumnya = WEIGHTED(harga, lokasi, fasilitas) / total_weight_3D
- score_total setelah S2-2 = WEIGHTED(harga, lokasi, fasilitas, kondisi, owner, keamanan) / total_weight_5D (di-redistribute)
- Kandidat lama dengan scoring_version=1.0 tidak perlu di-rescore paksa — biarkan NULL score_kondisi/owner, renormalisasi handle. Tapi score_total mereka tetap versi 3D. Saat user buka, bisa trigger rescore lazy.

**Opsi yang TIDAK dipilih:**

A. Tidak bump, tambah dimensi diam-diam:
   → Ditolak: decisions table menyimpan scoring_version snapshot. Saat PM audit "kenapa kandidat A menang di bulan lalu", harus bisa tahu formula yang dipakai. Tanpa bump = ambiguitas audit trail.

B. Bump ke minor version (1.0 → 1.1):
   → Kurang tegas. Perubahan dari 3-dimensi ke 5-dimensi adalah perubahan formula major — major bump lebih jelas.

**Tradeoff disadari:** Major bump membuat skor lama vs baru tidak comparable secara langsung. Diterima — ini memang intended behavior (CLAUDE.md konvensi #3 eksplisit).

---

#### Keputusan 4: deriveVerdict — apakah ikut 5 dimensi?

**Rekomendasi: deriveVerdict tetap berbasis score_total (yang sudah 5D setelah bump). Tidak perlu logic baru khusus per-dimensi kecuali ada deal breaker logic.**

Alasan: score_total sudah mengagregasi semua dimensi. Verdict dari total sudah representatif.
Exception: kalau user set deal breaker yang menyentuh dimensi survey (mis. keamanan_rating < 3 → discard), itu masuk ke deal breaker flow, bukan verdict.

**Opsi yang TIDAK dipilih:**

A. Verdict berbasis threshold per-dimensi (mis. kondisi < 40 = "Hindari"):
   → Ditolak untuk Slice 2. Over-engineering tanpa evidence bahwa threshold ini meaningful bagi user Indonesia. Bisa ditambah S3+.

B. AI-generated verdict berdasarkan semua dimensi + catatan survey:
   → Ditolak: melanggar "AI tidak memutuskan skor" (CLAUDE.md konvensi #4).

---

### (b) APARTEMEN & KOST — JSONB vs Typed Columns

**Rekomendasi: Tetap JSONB type_specific_data dengan Zod TypeScript validation. TANPA pg_jsonschema untuk Slice 2.**

**Alasan konkret:**
1. Tidak ada field Apartemen/Kost yang masuk scoring formula di Slice 2 (sesuai "promosikan ke typed column hanya bila masuk scoring" — CLAUDE.md + schema comment)
2. Zod validation di application layer sudah sufficient: kalau insert gagal validasi Zod, tidak sampai DB
3. pg_jsonschema = satu extension dependency baru di Supabase — perlu aktifkan manual di SQL editor, dan validation error dari DB level lebih susah di-handle gracefully di UI vs Zod error di TypeScript

**Schema Zod per property_type (Slice 2):**

```typescript
// Apartemen
const ApartemenData = z.object({
  lantai: z.number().int().positive().nullable(),
  total_lantai: z.number().int().positive().nullable(),
  nomor_unit: z.string().nullable(),
  nama_tower: z.string().nullable(),
  fasilitas_gedung: z.array(z.string()).default([]),  // kolam, gym, dll
})

// Kost
const KostData = z.object({
  tipe_penghuni: z.enum(['putra', 'putri', 'campur']).nullable(),
  km_dalam: z.boolean().nullable(),
  jam_malam: z.string().nullable(),  // "22:00"
  dapur_bersama: z.boolean().nullable(),
})
```

TypeScript union type: `type TypeSpecificData = ApartemenData | KostData | Record<string, never>`

**Guard penting:** Saat property_type berubah (edit kandidat), `type_specific_data` HARUS di-reset ke `{}` agar shape lama tidak bertabrakan dengan shape baru. Ini jebakan nyata — lihat Jebakan Teknis #5.

**Opsi yang TIDAK dipilih:**

A. pg_jsonschema untuk DB-level validation:
   → Ditolak: (1) butuh aktifasi extension manual di Supabase; (2) error dari DB lebih opaque di UI dibanding Zod TypeScript error; (3) overhead setup untuk validation yang sudah di-handle Zod; (4) di solo developer, debugging DB-level JSON schema error lebih time-consuming. Nilai tambah minimal untuk cost setup tinggi.

B. Promosi ke typed columns (ALTER TABLE ADD COLUMN lantai INT, dll):
   → Ditolak untuk Slice 2 karena tidak ada field yang masuk scoring. Migrasi schema = risk + overhead. Bisa di-promote S3+ kalau ada evidence bahwa field tertentu perlu di-index/aggregate untuk scoring.

C. JSONB tanpa Zod (validasi manual / ad-hoc):
   → Ditolak: tanpa Zod, type safety hilang di TypeScript layer. Bug akan silent (wrong shape masuk DB, display error downstream).

**Tradeoff disadari:** JSONB tidak bisa di-query/filter/sort securely tanpa GIN index. Kalau S3+ butuh "tampilkan semua apartemen lantai > 5", perlu migrasi ke typed column ATAU tambah GIN index. Untuk Slice 2 (display only, no filter on these fields), tradeoff ini diterima.

**Reversibility: MEDIUM** — migrate JSONB → typed column butuh ALTER TABLE + data transform. Tapi karena belum ada scoring dependency, migrasi ini straightforward bila diperlukan.

---

### (c) BIAYA ALL-IN — TEXT vs NUMERIC untuk biaya_listrik / biaya_air

**Rekomendasi: Additive NUMERIC columns (biaya_listrik_nominal, biaya_air_nominal) — ALTER TABLE ADD COLUMN, TANPA drop TEXT asli.**

**Alasan konkret:**
- biaya_listrik TEXT sering berisi: "termasuk", "Rp 50.000", "1.500/kwh", "terpisah" — tidak bisa di-CAST langsung ke NUMERIC
- biaya_ipl sudah NUMERIC(12,0) — inconsistency yang perlu diakui tapi tidak di-break sekarang
- Untuk total all-in yang reliable: butuh numeric value
- Additive column = zero-downtime migration (ADD COLUMN nullable = tidak perlu lock lama)

**DDL migration:**
```sql
ALTER TABLE candidates
  ADD COLUMN biaya_listrik_nominal  numeric(12,0),  -- NULL jika tidak bisa di-parse / "termasuk"
  ADD COLUMN biaya_air_nominal      numeric(12,0);  -- NULL jika tidak bisa di-parse / "termasuk"
```

**Extraction update:** GPT-4o mini prompt ditambah field `biaya_listrik_nominal: number | null` dan `biaya_air_nominal: number | null` (parse berapa rupiah/bulan estimasi). Jika "termasuk", kembalikan null.

**Total all-in formula:**
```typescript
const totalAllin = 
  (harga_efektif_bulanan ?? 0) +
  (biaya_listrik_nominal ?? 0) +
  (biaya_air_nominal ?? 0) +
  (biaya_ipl ?? 0)
// Display: "~Rp 2.1jt/bln (listrik termasuk, air terpisah)"
```

UI menampilkan label per biaya: jika nominal NULL dan text berisi "termasuk" → tampil badge "termasuk". Jika nominal NULL dan text berisi "terpisah" / tidak diketahui → tampil "?". Jika nominal ada → tampil angka.

**Opsi yang TIDAK dipilih:**

A. ALTER biaya_listrik TEXT → NUMERIC (drop TEXT, replace):
   → Ditolak: (1) kehilangan informasi original AI extraction ("1.500/kwh" vs "50.000/bln" = berbeda semantis); (2) "termasuk" tidak bisa di-store di NUMERIC; (3) breaking migration.

B. JSONB breakdown per biaya ({jenis, nominal, include_dalam_sewa, satuan}):
   → Ditolak: over-engineering untuk Slice 2. Price_schemes sudah JSONB dan kompleks. Menambah satu JSONB lagi per biaya = debugging overhead tanpa yield product nyata. Simpler additive column cukup.

C. Tetap TEXT, tampilkan as-is, tidak hitung total:
   → Ditolak: "kartu Rincian Biaya All-in" di S2-5 target secara eksplisit mensyaratkan total. Tanpa numeric, fitur tidak bisa selesai (hanya display teks, bukan total). Ini bukan full implementation S2-5.

D. Parse TEXT → NUMERIC di application layer saat read (runtime parsing):
   → Ditolak: fragile, regex untuk format harga Indonesia informal sangat kompleks. Lebih reliable parse saat extraction (GPT-4o mini punya konteks teks asli). Runtime parsing = parse ulang setiap load.

**Tradeoff disadari:** Menambah dua kolom = schema lebih lebar. Jika ada field biaya baru di masa depan (internet, parkir), akan ada lebih banyak _nominal columns. Untuk Slice 2-3, ini masih manageable. Kalau berkembang ke 8+ biaya, pertimbangkan restructure ke tabel candidate_costs.

**Reversibility: HIGH** — menambah nullable column mudah di-rollback (DROP COLUMN jika tidak jadi). Tidak ada data yang hilang.

---

### (d) POI RUTE ASLI — Google Directions Cost & Strategy

**Rekomendasi: Distance Matrix API (bukan Directions), batch, top-5 per user-defined kategori, lazy per kandidat, cache selamanya per (candidate_id × POI_hash).**

**Alasan memilih Distance Matrix atas Directions:**
- Directions API: $10/1000 requests, returns full route polyline (overkill untuk display jarak/waktu)
- Distance Matrix API: $5/1000 elements (cheaper), supports multiple origins×destinations dalam satu call
- Kita tidak butuh turn-by-turn — hanya butuh `distance_km` dan `duration_min` untuk display
- Satu call Distance Matrix: 1 origin (kandidat) × N destinations (POIs) = N elements, satu API call

**Estimasi cost kasar:**
- Per kandidat: top-5 POI per kategori × 3 kategori (kuliner, kesehatan, pendidikan) = 15 POI
- 1 Distance Matrix call untuk kandidat itu: 15 elements = 1 API call = $0.075/1000 calls × 15 = $0.00075
- User dengan 10 kandidat: $0.0075 per siklus keputusan
- 100 MAU/bulan, rata-rata 1 siklus: ~$0.75/bulan
- Masih dalam Google Maps free tier ($200/bulan) dengan sangat mudah untuk early stage

**Caching strategy:**
- Cache key: (candidate_id, POI_location_hash) di tabel candidate_poi
- Fetch once, store forever (hingga kandidat dihapus)
- Invalidasi: hanya jika lokasi kandidat berubah (edit alamat → clear poi cache untuk kandidat itu)
- Di-trigger: lazy saat user buka detail page pertama kali (bukan saat create kandidat)

**Cost cap per kandidat:** Constant `MAX_POI_DIRECTIONS_PER_CANDIDATE = 15` (configurable di `lib/maps/constants.ts`). Jika POI > 15, hanya ambil top-15 terdekat (by straight-line first) untuk Directions.

**Struktur tabel candidate_poi (DDL baru, belum di schema.sql):**
```sql
CREATE TABLE candidate_poi (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id   uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  poi_name       text        NOT NULL,
  poi_category   text        NOT NULL,  -- 'kuliner' | 'kesehatan' | 'pendidikan' | 'transportasi'
  poi_lat        double precision NOT NULL,
  poi_lng        double precision NOT NULL,
  straight_km    numeric(6,3),
  route_km       numeric(6,3),          -- NULL = belum di-fetch Directions
  route_min      int,                   -- NULL = belum di-fetch Directions
  directions_fetched_at timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_poi_candidate_location UNIQUE (candidate_id, poi_lat, poi_lng)
);
```

**Opsi yang TIDAK dipilih:**

A. Google Directions API (per-request, full route):
   → Ditolak: lebih mahal ($10 vs $5 per 1000), returns polyline yang tidak kita gunakan. Overkill untuk "jarak dan waktu tempuh" sederhana.

B. Tetap garis lurus (current behavior):
   → Ditolak sebagai default final Slice 2, tapi dipertahankan sebagai FALLBACK (`straight_km`) saat cache belum ada. "Tetap garis lurus selamanya" = fitur tidak selesai (S2-7 goal adalah rute asli).

C. Mapbox Directions:
   → Ditolak: (1) vendor dependency baru di luar Google Maps yang sudah committed (T-004); (2) Indonesia coverage Mapbox lebih lemah dari Google untuk jalan lokal; (3) menambah satu lagi API key + billing account.

D. OSRM / OpenRouteService (free, self-hosted):
   → Ditolak: self-hosted = infrastructure overhead yang tidak sesuai untuk solo builder. Managed OSRM instance tidak reliable untuk SLA kita. Indonesia road data di OSRM kurang akurat untuk jalan lokal.

E. Fetch ALL POI sekaligus saat kandidat ditambahkan:
   → Ditolak: (1) create kandidat menjadi slow (blocking API calls); (2) user mungkin tidak pernah buka detail → bayar untuk data yang tidak ditampilkan; (3) lazy-on-first-view lebih cost-efficient.

**Tradeoff disadari:** Distance Matrix tidak memberikan route summary text ("Via Jl. Gatot Subroto"). Jika product memutuskan butuh text summary, perlu upgrade ke Directions API. Reversible — candidate_poi schema sudah punya `route_km` dan `route_min` tapi bisa ditambah `route_summary text` kolom nanti tanpa breaking change.

**Reversibility: HIGH** — candidate_poi adalah tabel baru, tidak ada dependency yang mengunci API provider.

---

## 3. JEBAKAN TEKNIS NON-OBVIOUS

### Jebakan 1: RLS untuk tabel baru via JOIN, bukan direct user_id

`candidate_surveys` dan `candidate_events` tidak punya kolom `user_id` langsung — hanya `candidate_id` yang join ke `candidates(user_id)`.

**Implikasi RLS policy (untuk backstop non-service-role):**
```sql
CREATE POLICY pol_candidate_surveys_owner ON candidate_surveys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM candidates c
      WHERE c.id = candidate_surveys.candidate_id
        AND c.user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    )
  );
```
Policy via subquery ke candidates. Ini lebih slow daripada direct `user_id = ...` tapi necessary.

**Lebih kritis:** dengan service role (bypass RLS), SETIAP server query ke candidate_surveys/candidate_events WAJIB filter via JOIN ke candidates dan filter candidates.user_id = $sessionUserId. Kalau lupa JOIN ini, user A bisa lihat survey kandidat user B kalau tahu candidate_id. Ini bukan hipotesis — ini risiko nyata saat fitur baru dibangun terburu-buru.

**Mitigasi:** Selalu query kandidat dengan WHERE candidates.user_id = session.user.id sebelum/bersamaan dengan query ke child tables. Gunakan CTE atau subquery yang include ownership check.

---

### Jebakan 2: candidate_events punya dual FK — kandidat DAN user

```sql
candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```

Setiap INSERT ke candidate_events butuh KEDUA nilai. Server actions yang kini ada (tambah kandidat, ubah status, dll.) harus diupdate untuk pass `user_id` dari NextAuth session ke event insert. Mudah terlupakan saat menambah event baru untuk aksi yang sudah ada.

**Risiko:** Kalau user_id di candidate_events tidak konsisten dengan candidates.user_id (karena bug), data integrity di timeline bisa corrupt.

**Mitigasi:** Buat helper function `insertCandidateEvent(candidateId, userId, eventType, eventData)` yang selalu menerima dan menyimpan keduanya. Centralize semua event insert di satu utility, jangan scatter di setiap action.

---

### Jebakan 3: Storage Signed URL TTL expires mid-session

`candidate_photos.storage_path` menyimpan object key, bukan URL. Server generate signed URL untuk render. Default Supabase signed URL TTL: 1 jam (configurable ke max 1 minggu, tapi default pendek).

**Skenario bug:** User buka detail kandidat jam 10:00, lihat foto, tinggalkan tab open, buka lagi jam 11:30 → foto 404 karena signed URL expired.

**Opsi:**
1. Set TTL panjang (misal 7 hari) → reduce issue tapi tidak hilangkan
2. Generate signed URL fresh per-request (bukan cache di client) → add latency setiap load
3. Public bucket → signed URL tidak diperlukan, tapi tidak ada access control
4. Client-side refresh: detect 403/404 pada `<Image>` error, trigger refetch signed URL

Rekomendasi Slice 2: TTL = 24 jam (cukup untuk session normal), refresh saat halaman di-mount jika foto sudah ada di state. Lebih lama dari ini perlu justifikasi security.

---

### Jebakan 4: scoring_version di decisions vs candidates

Dua tempat menyimpan scoring_version:
- `candidates.scoring_version` — versi formula yang dipakai saat skor di-compute
- `decisions.scoring_version` — snapshot versi saat keputusan dibuat

Saat S2-2 bump ke `2.0`:
- Kandidat LAMA yang sudah punya score_total (3D) masih punya scoring_version='1.0'
- Kandidat baru akan di-score dengan formula 5D, scoring_version='2.0'
- Rescore lazy (saat user buka detail) akan update ke 2.0
- `decisions` lama tetap snapshot 1.0 → BENAR (audit trail)

**Potensi confusion:** UI mungkin membandingkan kandidat v1.0 (belum di-rescore) dan v2.0 (sudah rescore) dalam satu compare screen. Score_total mereka tidak comparable secara apple-to-apple.

**Mitigasi:** Di compare screen, tampilkan badge "⚠ Skor dihitung dengan versi berbeda" jika kandidat yang dibandingkan punya scoring_version berbeda. Atau: trigger rescore semua kandidat user setelah bump scoring_version (satu-kali background process atau lazy-rescore saat list loaded).

---

### Jebakan 5: type_specific_data shape tidak di-reset saat property_type berubah

Saat user edit kandidat Apartemen → ubah jadi Kontrakan, `type_specific_data` masih berisi `{lantai: 3, nama_tower: "Tower A"}`. Zod validation akan fail saat next update karena Kontrakan schema tidak expect field ini.

**Mitigasi:** Di server action edit kandidat, jika `property_type` berubah, set `type_specific_data = {}` sebelum merge dengan data baru.

```typescript
// Di server action updateCandidate:
if (newPropertyType !== existingPropertyType) {
  updateData.type_specific_data = {}
}
```

---

### Jebakan 6: periode_asli consistency saat S2-5 extraction update

Jika S2-5 mengupdate extraction prompt (tambah field biaya_listrik_nominal), Zod schema extraction di `lib/extraction/extract.ts` harus diupdate. `periode_asli` harus tetap di extract dengan nilai hanya dari SET yang didefinisikan di `lib/constants/periode.ts`. Jika prompt update accidentaly mengubah format periode_asli output (mis. AI mulai output "1 bulan" bukan "bulan"), CHECK constraint di DB akan reject insert — silent failure jika tidak di-handle.

**Mitigasi:** Setiap perubahan extraction prompt HARUS melalui benchmark re-run (`node benchmark/run.mjs`) sebelum deploy. Ini sudah ada di CLAUDE.md tapi mudah di-skip saat deadline.

---

### Jebakan 7: PgBouncer transaction mode (port 6543) dan GUC

Sudah di-dokumentasi di SECTION 6 schema.sql, tapi perlu diulang: kalau developer baru coba adopt pola non-service-role dengan GUC `app.current_user_id`, GUC TIDAK persistent across statements di port 6543 (transaction mode). Satu-satunya cara aman: SECURITY DEFINER function yang set GUC dan query dalam satu function body (lihat `app_get_candidates` di SECTION 7).

**Relevansi Slice 2:** Semua tabel baru yang dibuat (candidate_surveys, candidate_events, candidate_poi) perlu RLS policy yang menggunakan pola yang sama. Jangan buat RLS policy yang bergantung pada GUC jika query datang dari dua RPC call terpisah.

---

### Jebakan 8: Race condition pada Directions lazy-fetch

Jika user buka detail page kandidat yang belum punya POI cache, dan browser/user trigger dua rapid request (mis. tab duplicated, atau double click), server bisa trigger dua simultaneous Distance Matrix API calls untuk POI yang sama sebelum hasil cache pertama tersimpan.

**Implikasi:** Double billing untuk call yang sama, dan UNIQUE constraint `uq_poi_candidate_location` akan throw conflict pada second insert.

**Mitigasi:** Gunakan `ON CONFLICT DO NOTHING` atau `ON CONFLICT DO UPDATE` saat upsert candidate_poi. Untuk duplicate API calls, tambah semaphore atau lock di server action (mis. check if `directions_fetched_at IS NOT NULL` sebelum fetch). Atau: buat fetch idempotent dengan upsert-only pattern.

---

### Jebakan 9: candidate_surveys UNIQUE (candidate_id) = upsert semantics

Schema: `CONSTRAINT uq_survey_candidate UNIQUE (candidate_id)` — satu survey per kandidat.
Upsert via `ON CONFLICT (candidate_id) DO UPDATE` sudah benar. Tapi:

- `surveyed_at` semantik: apakah ini timestamp survey PERTAMA atau survey TERAKHIR?
- Jika user re-survey (update data), `surveyed_at` akan di-overwrite ke waktu re-survey → timeline di S2-3 kehilangan tanggal survey pertama

**Mitigasi:** Di `candidate_events`, log `survey_completed` dengan timestamp setiap kali survey disubmit (termasuk update). `candidate_surveys.surveyed_at` = waktu update terbaru (OK, karena survey adalah live document). Sejarah survey ada di events timeline, bukan di candidate_surveys.

---

### Jebakan 10: biaya_ipl di candidates sudah NUMERIC, di schema tipe berbeda dengan listrik/air

`biaya_ipl numeric(12,0)` — sudah ada dan NUMERIC.
`biaya_listrik text`, `biaya_air text` — TEXT.

Kalau S2-5 menambahkan `biaya_listrik_nominal numeric` dan `biaya_air_nominal numeric`, kita punya:
- biaya_ipl → NUMERIC langsung (sumber ekstraksi AI)
- biaya_listrik → TEXT (nilai original) + biaya_listrik_nominal NUMERIC (parsed)
- biaya_air → TEXT (nilai original) + biaya_air_nominal NUMERIC (parsed)

Inkonsistensi ini adalah technical debt yang harus didokumentasikan. Untuk total all-in, gunakan biaya_ipl + biaya_listrik_nominal + biaya_air_nominal (semua nullable → COALESCE dengan 0). Jangan biarkan developer mendatang bingung kenapa IPL langsung NUMERIC tapi listrik punya dua kolom.

**Mitigasi:** Comment di schema.sql yang menjelaskan mengapa inconsistency ini terjadi, dan di lib/scoring/allin.ts comment kenapa biaya_listrik_nominal digunakan (bukan biaya_listrik).

---

## RINGKASAN KEPUTUSAN

| Keputusan | Rekomendasi | Reversibility |
|-----------|-------------|---------------|
| Survey score derivation | Rata-rata sederhana per kelompok dimensi → 0-100 | HIGH (scoring_version bump) |
| Partial survey | Allow partial, NULL jika kosong, renormalisasi existing handle | MEDIUM |
| scoring_version | Bump ke `2.0` saat S2-2 diaktifkan | LOW (deliberate break) |
| deriveVerdict | Tetap dari score_total, tidak per-dimensi | HIGH |
| type_specific_data | JSONB + Zod TypeScript, tanpa pg_jsonschema | MEDIUM |
| biaya_listrik/air | Additive NUMERIC columns, TEXT asli tetap | HIGH |
| POI routing | Distance Matrix API, lazy, top-15 per kandidat, cache selamanya | HIGH |

---

*File ini adalah backup analisis feasibility Slice 2. Sumber kebenaran: pesan terstruktur di chat session.*
