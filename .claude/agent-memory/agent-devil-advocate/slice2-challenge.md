---
name: slice2-challenge
description: Tantangan Devil's Advocate terhadap plan Slice 2 Hunian — 5 challenge area dengan kondisi pencabutan, 1 tantangan dicabut DA sendiri, konflik resolusi SYN, dan gate keputusan Faisal
metadata:
  type: project
---

# DEVIL'S ADVOCATE — SLICE 2 PLANNING CHALLENGE

**Tanggal:** 2026-06-27
**Status pilot:** Slice 1 selesai, pilot <20 kandidat total, user personally known
**Prinsip inti yang dijaga:** AI mengurangi mengetik BUKAN memutuskan; Compare trade-off = hero; scoring RULE-BASED.

---

## CHALLENGE 1: S2-2 Survey — Apakah feature ini dibangun di atas asumsi yang belum divalidasi?

```
[DEVIL'S ADVOCATE CHALLENGE]

Klaim yang sedang ditantang:
S2-2 survey 6 dimensi adalah "satu-satunya penggerak cycle completion" dan worth
L effort (4-5 jam). UX menyatakan "survey worth dibangun; dead zone = masalah
logistik kunjungan, bukan form."

Asumsi kritis yang belum divalidasi:

1. User AKAN membuka Hunian saat di properti atau segera setelah kunjungan
   — risikonya: HIGH
   Dari Slice 1 memory: dead zone D+7 sudah teridentifikasi sebagai risiko nyata
   (user deal via WA tanpa return ke app). Survey membutuhkan WINDOW yang lebih
   sempit dari "kapan saja" — harus diisi saat sensasi fisik masih segar. Jika
   dead zone sudah ada di Slice 1 tanpa survey, asumsi bahwa survey akan
   "menarik" user untuk return tidak punya basis bukti.

2. 6 dimensi dalam <90 detik feasible di kondisi nyata survei lapangan
   — risikonya: HIGH
   UX sendiri menyatakan "form harus <90 detik diisi saat user masih DI properti."
   Di properti = sinyal mungkin buruk (asumsi offline-first dari Slice 1), baterai
   ponsel mungkin rendah, user dalam konteks sosial (bersama broker/pemilik),
   pikiran masih dalam mode "social negotiation" bukan "data entry." 6 dimensi
   bintang dengan tag opsional + catatan = estimasi waktu optimistis.

3. Data 6 dimensi dari pilot <20 kandidat cukup untuk membuktikan nilai fitur
   — risikonya: MEDIUM
   Dengan rata-rata 3 kandidat per user dan <7 user pilot, total survey yang
   mungkin terkumpul: 6-21 survey. Data ini tidak cukup untuk memvalidasi apakah
   dimensi scoring baru (Kondisi + Owner) benar-benar menggerakkan keputusan
   berbeda dari 3D sebelumnya.

Skenario kegagalan paling mungkin:
Pilot user mengunjungi properti bersama keluarga/pasangan. Diskusi terjadi
on-site secara verbal. Keputusan informal dibuat di lokasi atau di perjalanan
pulang via WhatsApp. Saat kembali ke rumah, tidak ada motivasi untuk membuka
Hunian dan mengisi 6 bintang untuk properti yang sudah "mentally decided." Survey
data = 0. Sistem radar ghost tidak pernah muncul. 6D scoring tidak pernah
terpicu. 4-5 jam effort = theater yang tidak bisa diukur dampaknya.

Pertanyaan yang harus dijawab sebelum proceed:
- Apakah ada observasi langsung (bukan asumsi) bahwa pilot user SUDAH membuka
  app saat di properti, bukan hanya sebelum dan sesudah?
- Apakah dead zone dari Slice 1 sudah terukur (berapa % kandidat yang di-add
  tapi tidak pernah di-update lagi)?
- Apakah UX researcher pernah mewawancarai pilot user tentang KAPAN mereka
  berniat mengisi data setelah kunjungan?

Kondisi di mana aku akan cabut tantangan ini:
- Bukti observasi bahwa ≥2 dari pilot user secara spontan membuka app saat
  di properti (tanpa diminta)
- ATAU: versi minimal 2-dimensi (Kondisi + Owner saja, 20 detik) dibangun
  TERLEBIH DAHULU dan diuji satu minggu sebelum membangun 4 dimensi sisanya
- ATAU: data Slice 1 menunjukkan cycle completion >60% sudah tercapai,
  artinya fitur baru tidak perlu menanggung beban metric

Alternatif yang lebih aman untuk dieksplor:
Bangun survey 2 dimensi (Kondisi Bangunan + Owner/Landlord saja) sebagai
validasi awal. UX sudah benar bahwa keduanya adalah "ghost" dengan nilai
compare tertinggi. Effort: ½L (2 jam). Tunggu 1 minggu data pilot. Jika
>50% kandidat terkunjungi punya 2 dimensi terisi, then expand ke 6 dimensi.
Build order: S2-2-minimal → validate → S2-2-full.
```

---

## CHALLENGE 2: S2-5 Biaya All-In — Show vs Score, Siapa yang Benar?

```
[DEVIL'S ADVOCATE CHALLENGE]

Klaim yang sedang ditantang:
Ada konflik genuine antara PM (jangan masuk scoring — data parsial misleading)
vs STR+UX (ini aha moment + accuracy dimensi tertinggi). Kedua pihak mengklaim
posisi masing-masing "valid."

Asumsi kritis yang belum divalidasi:

1. User akan menginput biaya tambahan dengan akurasi yang cukup untuk
   membuat kalkulasi all-in meaningful
   — risikonya: HIGH
   "AI best-effort + manual override" = dua sumber error yang stack:
   (a) AI salah ekstrak biaya dari teks listing berantakan, (b) user tidak tahu
   atau tidak ingat angka pasti biaya listrik/air/kebersihan saat input.
   Biaya listrik kost misalnya sering "sesuai pemakaian" tanpa angka tetap
   di listing. All-in yang tidak lengkap atau estimasi adalah WORSE than nothing
   karena memberi false precision.

2. "Aha moment" bisa dicapai via DISPLAY saja, tanpa masuk scoring
   — risikonya: LOW (ini asumsi yang LEBIH AMAN dari yang PM/STR claim)
   STR mengklaim "sewa 2,5jt tapi all-in 3,8jt = aha moment yang marketplace
   tak tunjukkan." Aha moment ini adalah tentang VISIBILITAS, bukan tentang
   skor berubah. User bisa mendapat aha moment dari melihat angka 3,8jt
   di Compare row "Biaya Total" tanpa perlu angka itu mengubah radar/score.

3. Tidak ada data parsial yang lebih berbahaya dari data yang terlihat
   lengkap tapi tidak comparable
   — risikonya: HIGH
   Kandidat A: biaya_listrik_nominal = 200rb, biaya_air_nominal = 50rb → all-in 2,75jt
   Kandidat B: kedua kolom NULL → all-in = harga_listing 2,5jt
   Di Compare, B terlihat lebih murah bukan karena memang lebih murah, tapi
   karena datanya tidak lengkap. UX sendiri menyadari ini: "harga all-in vs harga
   listing TIDAK comparable di Compare → bisa membalik keputusan."

Skenario kegagalan paling mungkin:
User memasukkan biaya listrik untuk kandidat A (yang pernah ditanya pemilik)
tapi lupa atau tidak tahu untuk kandidat B. Compare menunjukkan A lebih mahal
dari B. User memilih B. Padahal B sebenarnya sama atau lebih mahal secara all-in.
Hunian secara aktif menyesatkan keputusan — kebalikan dari prinsip inti.

Pertanyaan yang harus dijawab sebelum proceed:
- Apakah ada mekanisme eksplisit untuk menandai "all-in tidak lengkap" di
  Compare agar user TIDAK membandingkan apel dengan jeruk?
- Biaya listrik "sesuai pemakaian" — apakah akan disimpan sebagai NULL atau
  estimasi? Siapa yang estimasi?
- Apakah "label sumber harga" yang dipropose UX cukup untuk mencegah
  misinterpretasi, atau user akan tetap visual-scan angka tertinggi?

Kondisi di mana aku akan cabut tantangan ini:
- S2-5 tetap EXCLUDE dari scoring (PM menang)
- DAN: Compare row "Biaya Total" hanya muncul jika ≥1 komponen biaya
  tambahan terisi, dengan disclaimer eksplisit "biaya parsial — tidak semua
  komponen diisi"
- DAN: UX researcher confirm bahwa "show prominently but don't score" sudah
  cukup untuk aha moment (artinya STR juga setuju)
- KESIMPULAN DA: Show tapi jangan score adalah jalan tengah yang benar.
  Konflik PM vs STR/UX adalah false dilemma — keduanya bisa dipuaskan tanpa
  masuk scoring. Yang perlu diputuskan adalah apakah label disclaimer cukup
  atau butuh mekanisme lebih kuat (lock Compare row kalau data parsial).

Alternatif yang lebih aman untuk dieksplor:
Compare row "Biaya Estimasi All-In" dengan badge "Parsial" jika ada NULL.
Baris ini TIDAK mempengaruhi radar/skor. Saat semua komponen diisi, badge
hilang. Jika hanya listing price yang ada, baris ini tidak muncul sama sekali
(bukan 0 atau "tidak diketahui" yang bisa disalahartikan).
```

---

## CHALLENGE 3: Over-Build Check Per Fase

```
[DEVIL'S ADVOCATE CHALLENGE]

Klaim yang sedang ditantang:
Plan Slice 2 MVP = S2-0 + S2-2 + S2-4 well-scoped. TL menyatakan total effort
18-25 hari "masih reasonable."

Asumsi kritis yang belum divalidasi:

[A] S2-2: 6 dimensi survey adalah ukuran yang tepat untuk pilot ini

Risikonya: HIGH
Pilot dengan <20 kandidat, <7 user personally known, belum ada validasi bahwa
user akan survey sama sekali. 6 dimensi berarti:
- Partial survey system (bagaimana handle 3/6 dimensi terisi?)
- Radar ghost dengan dashed outline (UI complexity)
- Badge "survey parsial (3/6)" (state management tambahan)
- Weight Kondisi/Owner default RENDAH agar tidak menghukum kandidat tanpa survey
- Semua ini untuk feature yang belum terbukti dipakai

Ini adalah classic mistake: membangun resilience untuk edge case sebelum
membuktikan bahwa happy path dipakai.

[B] S2-4 negosiasi worth dibangun di pilot ini

Risikonya: LOW → TANTANGAN INI DICABUT (lihat bagian akhir)

[C] S2-5 biaya all-in: 2-kolom numeric (biaya_listrik_nominal/biaya_air_nominal)
vs pendekatan alternatif

Risikonya: MEDIUM
TL memilih ADD COLUMN numeric per komponen biaya. Ini berarti:
- Setiap komponen baru (parkir, internet, keamanan, dll) = kolom baru
- Schema creep: biaya_listrik_nominal, biaya_air_nominal... dan kemudian?
- AI extraction prompt semakin panjang dengan setiap komponen baru
- "Text asli disimpan" = duplikasi storage dan source-of-truth ambigu

Alternatif yang lebih simple: satu kolom JSONB `biaya_tambahan` dengan
struktur {komponen: string, nominal: number}[] yang open-ended, ditampilkan
as-is, dijumlahkan untuk total. Reversibility EQUALLY HIGH tapi schema
tidak creep.

Skenario kegagalan paling mungkin:
Pilot user menyebut "biaya parkir 150rb/bln" dalam listing. AI tidak
tahu ke kolom mana ini harus di-extract (tidak ada biaya_parkir_nominal).
AI drop data ini atau masukkan ke catatan free-text yang tidak dijumlahkan.
All-in total understated. User tidak tahu kenapa angkanya kecil.

Pertanyaan yang harus dijawab sebelum proceed:
- Berapa komponen biaya tambahan yang realistically akan ditemukan di
  listing kontrakan Jakarta/Jabodetabek? Apakah 2 (listrik+air) sudah 80%
  kasus, atau ada parkir/internet/keamanan/RT-RW yang signifikan?
- Apakah TL sudah mempertimbangkan JSONB vs fixed columns? Jika belum,
  ini perlu dibahas.

Kondisi di mana aku akan cabut tantangan ini:
- Riset singkat (atau pengetahuan PM/STR) menunjukkan bahwa listrik+air
  merepresentasikan >80% kasus biaya tambahan di kontrakan
- ATAU: TL mempertimbangkan dan AKTIF memilih fixed columns atas JSONB
  dengan alasan yang solid (mis. query performance, type safety)

Alternatif yang lebih aman:
JSONB open-ended untuk komponen biaya dengan UI yang allow user add
komponen manual. Lebih fleksibel, schema tidak perlu berubah saat ada
komponen baru.
```

---

## CHALLENGE 4: scoring_version 2.0 Mid-Pilot — Blocker atau Manageable?

```
[DEVIL'S ADVOCATE CHALLENGE]

Klaim yang sedang ditantang:
TL menyatakan scoring_version 2.0 dengan "badge warning/lazy-rescore" cukup
sebagai mitigasi untuk kandidat v1.0 vs v2.0 di Compare.

Asumsi kritis yang belum divalidasi:

1. "Lazy rescore" tidak menciptakan undefined state di Compare
   — risikonya: HIGH
   Lazy rescore = kandidat A di-rescore ke v2.0 saat pertama kali dibuka,
   kandidat B belum dibuka → Compare menampilkan skor A (v2.0) vs skor B (v1.0).
   Badge "v1.0" di B mungkin tidak cukup untuk user memahami bahwa angka-angka
   ini tidak sebanding. User akan tetap visual-compare radar chart yang angkanya
   dihitung dengan formula berbeda.

2. Pilot user yang personally known bisa "dimanage" migrasinya
   — risikonya: MEDIUM
   Pilot kecil = ada opsi untuk: (a) force rescore semua kandidat existing
   saat v2.0 deploy (bukan lazy), (b) koordinasi langsung dengan pilot user
   tentang timing deployment.
   Tapi jika force rescore dijalankan saat pilot user sedang aktif di app
   = data berubah di depan mata mereka = trust rusak.

3. Badge warning cukup untuk mencegah false comparison
   — risikonya: HIGH
   UX principle: user scan visual, tidak baca badge. Di mobile, badge kecil
   "v1.0" di sebelah skor yang berbeda dari v2.0 akan diabaikan oleh 80%
   user. Ini bukan hypothetical — ini well-documented UX pattern failure.

Skenario kegagalan paling mungkin:
Pilot user Faisal menginput 3 kandidat di Slice 1 (v1.0 scoring: Harga +
Lokasi + Fasilitas). Slice 2 deploy dengan v2.0 (+ Kondisi + Owner, berbeda
weight). Kandidat 1-3 masih v1.0 (belum dibuka ulang). Kandidat 4 baru = v2.0.
Compare menampilkan 4 kandidat. Kandidat 1-3 punya radar 3D, kandidat 4 punya
radar 5D. Perbandingan secara definitif meaningless. User melihat kandidat 4
unggul di 2 dimensi baru tapi tidak tahu apakah ini karena propertinya lebih
baik atau karena scoring berubah.

Pertanyaan yang harus dijawab sebelum proceed:
- Apakah ada cutoff: "v2.0 hanya berlaku untuk kandidat yang dibuat setelah
  tanggal X"? (Bukan lazy rescore, tapi versi pinning per kandidat)
- Apakah koordinasi dengan pilot user memungkinkan: "kami akan deploy v2.0
  pada hari X, semua kandidat lama akan di-rescore otomatis, mohon tidak
  tambah kandidat baru selama 1 jam"?
- Apakah pilot saat ini sudah punya kandidat yang sudah di-Compare, atau
  masih di tahap input?

Kondisi di mana aku akan cabut tantangan ini:
- Force rescore semua kandidat dilakukan sebelum v2.0 release kepada pilot
  user (tidak lazy, tapi one-shot migration)
- DAN: Deploy timing dikoordinasikan dengan pilot user (pilot kecil,
  personally known = ini feasible)
- DAN: Selama window migration (<1 jam), Compare di-lock atau diberi banner
  "sistem sedang diperbarui"

Alternatif yang lebih aman:
One-shot migration script: sebelum v2.0 live untuk pilot user, jalankan
rescore semua kandidat existing dengan formula v2.0. Dimensi Kondisi + Owner
= default weight rendah + NULL score = tidak menghukum. Setelah migration
selesai, semua kandidat comparable. Effort: 30 menit script, bukan sistem
lazy-rescore yang kompleks. Pilot kecil = ini feasible.
```

---

## CHALLENGE 5: Audit Defer — Ada yang Salah Di-Defer?

```
[DEVIL'S ADVOCATE CHALLENGE]

Klaim yang sedang ditantang:
Konsensus semua agent untuk defer S2-3 (timeline), S2-6, S2-7 (POI), S2-8.
Khususnya POI disebut "hanya $0.75/bln per 100 MAU" — apakah ini argumen
cukup untuk reconsider?

Asumsi kritis yang belum divalidasi:

[A] POI Rute ($0.75/bln) — DICABUT oleh DA (lihat bagian bawah)

[B] S2-3 Timeline auto-recording minimal — apakah "auto" = gratis?

Risikonya: MEDIUM
TL menyebutkan "helper insertCandidateEvent terpusat" sudah direncanakan
dalam S2-2 scope (untuk log re-survey). Jika helper ini dibangun, maka
"timeline auto-recording minimal" = tinggal add event types dan UI timeline
sederhana. Effort mungkin lebih rendah dari yang diasumsikan saat defer.

TAPI: nilai untuk KEPUTUSAN sewa tidak jelas. Timeline "input listing →
kunjungi → survey → pilih" membantu USER atau membantu ANALITIK HUNIAN?
Jika untuk analitik (memahami behavior pilot), itu adalah developer/product
need, bukan user need. Defer tetap correct untuk S2-3.

[C] Apt/Kost — Apakah defer mengandung hidden cost?

Risikonya: LOW untuk Slice 2, tapi MEDIUM untuk Slice 3
TL: JSONB type_specific_data + reset saat property_type ganti. Jika schema
ini dibangun di Slice 2 untuk Kontrakan (bahkan tanpa Apt/Kost UI), maka
Slice 3 hanya perlu menambah form fields. Ini adalah investasi forward-compatible.
TAPI jika schema belum dibangun, Slice 3 butuh migration yang lebih disruptif.

Pertanyaan untuk TL: apakah JSONB type_specific_data sudah ada di schema
Slice 2 atau benar-benar defer?

Skenario kegagalan paling mungkin untuk defer yang salah:
POI defer tapi pilot user mulai complain bahwa jarak straight-line misleading
untuk properti di gang kecil atau dekat sungai (common di Jakarta). Jika 5+
complain datang dalam 2 minggu pilot, dev harus interrupt S2-5 atau S2-1
untuk insert POI feature. Interrupt lebih mahal dari include upfront.

Kondisi di mana aku akan cabut tantangan POI:
- DICABUT: $0.75/bln cost argument tidak cukup kuat untuk reconsider karena
  biaya bukan bottleneck-nya. Yang menjadi argumen defer yang KUAT adalah:
  (a) straight-line BELUM TERBUKTI menyesatkan di pilot (belum ada complain),
  (b) effort POI (DDL candidate_poi belum ada + Distance Matrix integration)
  tidak trivial per TL, dan (c) "5 user report trigger" adalah proxy yang
  tepat untuk validated demand. DEFER tetap benar.

Kondisi di mana aku akan cabut tantangan S2-3 Timeline:
- Jika insertCandidateEvent helper dibangun sebagai bagian S2-2 (sudah benar),
  maka timeline UI minimal (<30 menit tambahan effort) worth dipertimbangkan
  BUKAN untuk user, tapi untuk Faisal sebagai developer untuk memahami
  behavior pilot. Ini bukan fitur user-facing, ini product analytics minimal.
  Reframe: bukan "S2-3 untuk user" tapi "event logging untuk product metrics."
  Dengan reframe ini, DA mencabut tantangan terhadap defer S2-3, TAPI merekomendasikan
  bahwa events table di-populate sebagai side-effect S2-2 bahkan jika UI
  timeline tidak dibangun.

Alternatif yang lebih aman:
Defer S2-3 UI timeline, tapi TIDAK defer event logging. insertCandidateEvent
untuk event types: CREATED, VISITED, SURVEYED, SELECTED, REJECTED. Data ini
invaluable untuk memahami pilot behavior tanpa membangun UI apapun.
```

---

## TANTANGAN YANG DICABUT SENDIRI OLEH DA

### CABUT 1: S2-4 Negosiasi (dari Challenge 3B)

**Klaim awal DA:** S2-4 negosiasi prematur karena belum ada validasi bahwa
pilot user bernegosiasi.

**Alasan pencabutan:** Setelah menimbang:
- Effort S (1 jam) = asimetri risk/reward yang menguntungkan build
- Kulturalnya, negosiasi harga sewa di Indonesia adalah NORMA, bukan edge case.
  Ini berbeda dari asumsi survey yang memerlukan behavior change. Negosiasi
  adalah behavior yang SUDAH ADA, Hunian hanya perlu menampung datanya.
- Jika user bernegosiasi (sangat mungkin) dan tidak bisa log di Hunian, mereka
  log di WhatsApp atau notes → cycle completion terpotong karena data tidak
  terekam di app.
- Risk negatif jika tidak build: user kehilangan satu reason to keep app open
  selama proses negosiasi.

**TANTANGAN S2-4 DICABUT.**

### CABUT 2: POI $0.75 reconsider (dari Challenge 5A)

**Klaim awal DA:** Biaya $0.75/bln seharusnya tidak menjadi penghalang,
jadi defer perlu argumen lebih kuat.

**Alasan pencabutan:** Setelah menimbang, defer POI adalah BENAR karena:
- Straight-line BELUM TERBUKTI menyesatkan di pilot (tidak ada data complain)
- DDL candidate_poi belum ada = effort tidak trivial
- "5 user report trigger" adalah proxy validated demand yang tepat
- Biaya $0.75 bukan argumen untuk build, itu hanya menghapus satu counter-argument.
  Validated demand tetap harus ada sebelum build.

**TANTANGAN POI DICABUT.**

---

## KONFLIK YANG BUTUH RESOLUSI SYN

### Konflik A: S2-5 Posisi di Plan — Show vs Score

**PM:** Exclude dari scoring (data parsial misleading)
**STR + UX:** Include atau at least sangat prominently shown karena "aha moment"

**DA Resolution Proposal:**
"Show prominently, NEVER score" adalah jalan yang memuaskan keduanya JIKA:
1. UX researcher explicitly confirms bahwa aha moment bisa dicapai dari display
   saja (tidak perlu mempengaruhi radar/score)
2. Compare row "Biaya Estimasi All-In" hanya muncul jika ≥1 komponen terisi
3. Badge "Parsial" mandatory jika ada komponen NULL
4. Compare row tidak diikutsertakan dalam rank-sorting

Jika UX tetap berpendapat bahwa skor harus berubah untuk user "notice" → ini
adalah keputusan Faisal (lihat Gate Faisal di bawah).

### Konflik B: Ukuran S2-2 — 2 Dimensi vs 6 Dimensi Langsung

**UX:** Kondisi + Owner dulu (nilai compare tertinggi, mungkin abandonment lebih tinggi)
**PM:** 6 dimensi karena deriveVerdict butuh semua dimensi untuk berubah meaningful

**DA Resolution Proposal:**
Build 2 dimensi sebagai MVP, 4 sisanya sebagai "std jika kapasitas" DALAM
satu sprint S2-2. Tech debt tidak ada karena schema sama. Pilot validation
window: 1 minggu setelah deploy 2D, jika survey rate >0 (bahkan 1 user mengisi),
expand ke 6D.

### Konflik C: Scoring 2.0 Migration Strategy

**TL:** Lazy rescore + badge warning
**DA:** One-shot migration lebih aman untuk pilot kecil

Ini bukan konflik ideologis — ini adalah pilihan teknis yang dampaknya berbeda
untuk pilot kecil (<20 kandidat) vs skala besar. Untuk pilot Faisal saat ini,
one-shot migration LEBIH AMAN dan effort lebih rendah (tidak perlu maintain
dua versi logic secara bersamaan).

---

## GATE KEPUTUSAN FAISAL (Material & Irreversible)

### Gate 1 — URGENT: Survey Scope (2D vs 6D langsung)
**Keputusan:** Apakah S2-2 dibangun 2 dimensi dulu (Kondisi + Owner) sebagai
validasi murah, atau langsung 6 dimensi?
**Implikasi jika salah:** 6D dibangun dan tidak ada yang mengisi = 3 jam wasted.
2D dibangun dan terbukti diisi = ekspansi ke 6D dengan confidence.
**DA recommendation:** 2D dulu. Tapi jika Faisal memiliki signal kuat dari
percakapan dengan pilot user bahwa mereka SIAP mengisi 6 dimensi, 6D langsung
acceptable.

### Gate 2 — URGENT: S2-5 Scoring vs Display
**Keputusan:** Apakah biaya all-in mempengaruhi scoring atau display-only?
**Implikasi jika salah:** Include dalam scoring dengan data parsial = Compare
menyesatkan. Exclude = mungkin user tidak notice (user scan visual, abaikan
annotation).
**DA recommendation:** Exclude dari scoring. Tapi jika ada bukti (observasi
atau interview pilot user) bahwa mereka TIDAK akan manual-check annotation,
pertimbangkan scoring dengan mandatory "data lengkap sebelum Compare" gate.

### Gate 3 — URGENT: scoring_version 2.0 Migration Timing
**Keputusan:** One-shot migration (koordinasi dengan pilot) vs lazy rescore
(deploy kapan saja, migration bertahap)?
**Implikasi jika salah:** Lazy rescore di pilot aktif = undefined Compare state
yang bisa merusak trust pilot user yang sedang dalam proses keputusan nyata.
**DA recommendation:** One-shot migration. Koordinasi dengan pilot users (bisa
via WhatsApp karena personally known). Jika tidak memungkinkan koordinasi,
set maintenance window.

### Gate 4 — MEDIUM: Biaya Komponen Schema (JSONB vs Fixed Columns)
**Keputusan:** TL memilih fixed columns (biaya_listrik_nominal, biaya_air_nominal).
Apakah Faisal setuju dengan potensi schema creep untuk komponen baru?
**DA recommendation:** Minta TL justifikasi explicit untuk fixed columns vs
JSONB. Jika tidak ada alasan teknis kuat (type safety per komponen, query
join yang spesifik), JSONB lebih future-safe.

---

## SUMMARY RISK MATRIX

| Challenge | Severity | DA Position | Status |
|-----------|----------|-------------|--------|
| C1: S2-2 6D langsung | HIGH | Bangun 2D dulu, validate | TETAP TANTANGAN |
| C2: S2-5 scoring vs display | HIGH | Show-never-score, butuh SYN | TETAP TANTANGAN |
| C3a: S2-2 partial survey complexity | HIGH | Over-spec untuk pilot | TETAP TANTANGAN |
| C3b: S2-4 negosiasi | LOW | Worth build (effort S) | DICABUT |
| C3c: S2-5 JSONB vs fixed columns | MEDIUM | Perlu TL justifikasi | TETAP TANTANGAN |
| C4: scoring_version 2.0 mid-pilot | HIGH | One-shot migration | TETAP TANTANGAN |
| C5a: POI defer | LOW | Defer tetap benar | DICABUT |
| C5b: S2-3 timeline | LOW | Defer UI, jangan defer events | DIMODIFIKASI |
| C5c: Apt/Kost schema forward-compat | MEDIUM | Tanya TL apakah JSONB sudah ada | TETAP TANTANGAN |

**Tantangan yang dicabut DA sendiri: 2 (S2-4 negosiasi, POI reconsider)**
**Tantangan yang dimodifikasi: 1 (S2-3 → event logging tanpa UI)**
**Tantangan aktif yang butuh resolusi: 6**
**Gate keputusan Faisal: 4 (Gate 1-4 di atas)**

**Why:** Dokumentasi challenge DA Slice 2 untuk referensi SYN session dan keputusan Faisal.
**How to apply:** SYN harus resolve Konflik A/B/C sebelum TL mulai development. Gate 1-3 harus ada jawaban dari Faisal.

[[project-mvp-scope-decisions]]
[[project-slice1-ux-challenges]]
