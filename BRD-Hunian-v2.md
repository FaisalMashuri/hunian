# BRD — Hunian
**Business Requirements Document**
**Versi**: 2.0
**Tanggal**: Juni 2026
**Author**: Faisal
**Status**: Draft
**Referensi PRD**: PRD-Hunian-v2.1

---

## Daftar Isi

1. Executive Summary
2. Business Context & Background
3. Problem Statement
4. Business Objectives
5. Success Criteria & KPI
6. Stakeholders
7. Scope
8. Business Requirements
9. Functional Requirements
10. Non-Functional Requirements
11. Business Rules
12. Constraints
13. Assumptions
14. Dependencies
15. Risks & Mitigations
16. Glossary

---

## 1. Executive Summary

**Hunian** adalah platform digital pengambilan keputusan hunian sewa — kontrakan rumah, apartemen, dan kost-kostan — yang menggabungkan tiga layer:

1. **Structured Survey** — pencatatan cepat (30 detik di lapangan) dengan form yang menyesuaikan per tipe properti
2. **Logic Engine** — kalkulasi, deteksi, dan alerting berbasis rules tanpa AI — high impact, zero marginal cost
3. **AI LLM** — analisis pattern keputusan, coaching, dan dokumen keputusan final

**Yang membedakan Hunian dari spreadsheet atau catatan biasa:**

- Harga selalu **all-in** (bukan sewa pokok) + upfront cost display yang prominan
- **Dual-threshold budget** dengan zona stretch yang dinamis — tidak binary
- **Deal Breaker Detector** — user tidak lupa kriteria sendiri di tengah proses
- **Dominated Property Elimination** — kandidat inferior di-flag, waktu tidak terbuang
- **Scoring 7 dimensi** termasuk Commitment Risk dan Value for Money yang sering terlewat
- **Decision coaching via AI** — bukan hanya skor, tapi analisis pattern dan potensi penyesalan
- **Offline-first** — berjalan penuh tanpa internet, sync ke cloud saat tersambung

**Model**: Personal tool yang dimulai dari satu user. Arsitektur dan data model dirancang untuk ekspansi ke multi-user SaaS tanpa restrukturisasi besar.

**Stack**: Next.js + Supabase + Tailwind CSS. Semua infrastructure gratis (free tier). Satu-satunya biaya: OpenAI API yang sudah dimiliki user.

---

## 2. Business Context & Background

### 2.1 Konteks Pasar

Pasar sewa hunian di Indonesia — khususnya Jabodetabek — punya karakteristik yang menyulitkan pengambilan keputusan:

| Karakteristik | Implikasi |
|--------------|-----------|
| Harga tidak transparan | Sewa pokok ≠ total biaya (IPL, listrik, deposit tidak disebutkan di listing) |
| Informasi tersebar | Mamikos, OLX, Instagram, WhatsApp grup — tidak ada sumber tunggal |
| Survey intensif | 5–15 tempat dalam beberapa minggu, sering dalam kondisi panas dan terburu-buru |
| Keputusan berulang | Kontrak 1–2 tahun, keputusan diulang reguler sepanjang karir |
| Dampak finansial besar | Sewa = 20–40% penghasilan bulanan + upfront cost yang sering tidak diantisipasi |
| Analysis paralysis | Terlalu banyak kandidat, terlalu banyak variabel, tidak ada framework yang jelas |

### 2.2 Kondisi Saat Ini (As-Is)

```
Lihat listing di platform/medsos
        ↓
Screenshot atau forward ke WA
        ↓
Survey beberapa tempat
        ↓
Foto acak, catatan di Notes/WA
        ↓
Coba ingat dan bandingkan secara mental
        ↓
Keputusan berdasarkan perasaan + diskusi panjang
        ↓
Baru sadar hidden cost setelah pindah
```

Tidak ada sistem, tidak ada perbandingan apple-to-apple, tidak ada data lingkungan yang terukur, dan tidak ada mekanisme untuk mencegah analysis paralysis.

### 2.3 Kondisi yang Diinginkan (To-Be)

```
Lihat listing → paste URL/teks → form auto-fill (AI)
        ↓
Set deal breaker sebelum berangkat
        ↓
Survey → Quick Survey 30 detik + foto terstruktur
        ↓
GPS capture → GIS analysis otomatis
        ↓
Deal breaker check, dominated property flagged
        ↓
AI coaching: pattern, devil's advocate, regret predictor
        ↓
Decision Memo → keputusan dengan dokumentasi lengkap
```

### 2.4 Nilai Tambah Logic Engine vs AI

Kebanyakan fitur high-impact di Hunian adalah **logic-based** (tidak butuh AI):

| Fitur | Tipe | Cost | Impact |
|-------|------|------|--------|
| Deal Breaker Detector | Logic | $0 | Mencegah keputusan yang melanggar kriteria sendiri |
| Dominated Property | Logic | $0 | Eliminasi kandidat inferior otomatis |
| Missing Cost Detector | Logic | $0 | Mencegah underestimate biaya |
| Hidden Cost Alert | Logic | $0 | Memperlihatkan commitment tersembunyi |
| Future Cost Projection | Logic | $0 | Dampak jangka panjang dari selisih kecil |
| What If Analysis | Logic | $0 | Simulasi budget tanpa LLM |
| Decision Freeze Alert | Logic | $0 | Mencegah analysis paralysis |
| Commute Fatigue | Logic | $0 | Reframe jarak km menjadi "hari hidup" |
| Survey Priority | Logic | $0 | Efisiensi waktu survey lapangan |
| Reverse Recommendation | Logic | $0 | Framing eliminasi yang lebih natural |

AI LLM digunakan untuk task yang genuinely membutuhkan understanding konteks: coaching pattern, devil's advocate, regret analysis, dan decision memo.

---

## 3. Problem Statement

### 3.1 Problem Utama

Pencari hunian sewa tidak punya alat yang memadai untuk membuat keputusan finansial jangka menengah (1–2 tahun) secara objektif — yang mencegah mereka dari overpaying, melanggar kriteria sendiri, atau terjebak analysis paralysis.

### 3.2 Root Causes

| ID | Root Cause | Dampak Konkret |
|----|-----------|---------------|
| RC-01 | Harga sewa pokok ≠ total biaya sesungguhnya | Perbandingan tidak apple-to-apple; hidden cost muncul setelah pindah |
| RC-02 | Budget diperlakukan binary (masuk/tidak) | Hunian sedikit over budget tapi far superior terlewat begitu saja |
| RC-03 | User lupa kriteria yang ditetapkan sendiri | Keputusan akhir melanggar deal breaker yang pernah ditetapkan |
| RC-04 | Kandidat inferior tidak terlihat jelas | Waktu terbuang mengevaluasi hunian yang sudah punya kandidat lebih baik di semua aspek |
| RC-05 | Form survey terlalu panjang untuk diisi di lapangan | Data kritis hilang; foto tidak terorganisir; keputusan berdasarkan ingatan |
| RC-06 | Tidak ada data lingkungan terukur | Risiko banjir, akses transportasi, dan keamanan baru diketahui setelah pindah |
| RC-07 | Tidak ada mekanisme anti-analysis-paralysis | Pencarian berlanjut tanpa henti; tidak pernah sampai keputusan |
| RC-08 | Tidak ada dokumentasi keputusan | Alasan memilih hunian tidak terdokumentasi; sulit dijelaskan ke pasangan |
| RC-09 | Komitmen jangka panjang tidak terlihat di harga bulanan | Deposit besar + kontrak panjang tidak diperhitungkan saat perbandingan |
| RC-10 | Confirmation bias saat sudah suka satu kandidat | Kelemahan hunian favorit tidak terlihat objektif |

### 3.3 Dampak jika Tidak Diselesaikan

- Overpay antara Rp 300.000–2.000.000/bulan karena tidak tahu harga total yang sebenarnya
- Hidden cost (IPL, listrik, kebersihan RT) tidak diperhitungkan → cash flow terganggu
- Pindah ke hunian yang tidak suitable → biaya pindah + kehilangan deposit
- Waktu dan energi terbuang untuk deliberasi panjang tanpa basis data
- Deal breaker dilanggar karena tidak ada sistem pengingat
- Keputusan yang sulit dipertanggungjawabkan ke pasangan karena tidak ada dokumentasi

---

## 4. Business Objectives

| ID | Objective | Ukuran Keberhasilan |
|----|-----------|-------------------|
| BO-01 | Menghasilkan keputusan hunian yang objektif berbasis data | Keputusan dapat di-trace ke data terukur, bukan "perasaan" |
| BO-02 | Mengurangi total biaya hunian melalui kalkulasi all-in yang akurat | User tidak overpay karena hidden cost tidak terdeteksi |
| BO-03 | Mencegah keputusan yang melanggar kriteria sendiri | Deal Breaker Detector aktif sebelum dan selama proses |
| BO-04 | Mengeliminasi kandidat inferior secara otomatis | Waktu evaluasi difokuskan pada kandidat yang genuinely kompetitif |
| BO-05 | Mempercepat proses keputusan tanpa mengorbankan kualitas | Dari "berminggu-minggu" menjadi ≤ 30 menit sesi evaluasi final |
| BO-06 | Mengurangi friction dokumentasi di lapangan | Quick Survey selesai dalam 30 detik on-site |
| BO-07 | Menyediakan data lingkungan yang tidak terlihat saat survey singkat | GIS data tersedia otomatis setelah lokasi diverifikasi |
| BO-08 | Mendukung keputusan bersama pasangan dengan basis data yang sama | Summary + Decision Memo sebagai dokumen komunikasi |
| BO-09 | Membangun fondasi arsitektur yang dapat scale ke SaaS | Data model dan codebase tidak perlu restrukturisasi untuk multi-user |

---

## 5. Success Criteria & KPI

### 5.1 Kriteria Sukses v1.0

| Kriteria | Target | Cara Ukur |
|----------|--------|-----------|
| Quick Survey completion on-site | ≥ 80% diisi saat masih di lokasi | Bandingkan `survey_date` dengan `created_at` |
| Deal Breaker setup rate | ≥ 70% user set ≥ 1 rule sebelum survey pertama | `deal_breakers` tidak kosong saat hunian pertama dibuat |
| Budget dual-threshold setup | ≥ 90% user set kedua threshold | `budget_ideal` + `budget_max` keduanya terisi |
| Full Survey completion | ≥ 60% hunian punya Full Survey lengkap | `full_survey_done = true` |
| Time-to-decision | ≤ 30 menit dari dashboard ke keputusan final | Interview / session recording |
| Foto terstruktur coverage | ≥ 2 slot wajib terisi per hunian | `photo_slots` dengan `required=true` dan `files` tidak kosong |

### 5.2 KPI Bisnis

| KPI | Target | Catatan |
|-----|--------|---------|
| Gap all-in vs harga pokok yang terdeteksi | Rata-rata > Rp 500.000/bulan | Menunjukkan kalkulasi all-in memberi nilai nyata |
| Deal breaker violation yang ditangkap | ≥ 1 per 5 hunian di-survey | Bukti Deal Breaker Detector aktif dan relevant |
| Dominated property yang di-dismiss | ≥ 80% setelah di-flag | Fitur dipakai, bukan di-ignore |
| Decision Freeze yang berujung keputusan | ≥ 60% dalam 3 hari setelah alert | Alert efektif mendorong keputusan |
| AI features yang di-trigger | ≥ 3 AI call per proses pencarian | AI dipakai, bukan di-skip |
| Keputusan menggunakan Decision Memo | ≥ 70% hunian ber-status `Dipilih` | Dokumentasi keputusan dianggap valuable |

---

## 6. Stakeholders

### 6.1 Stakeholder Map

| Stakeholder | Peran | Kepentingan | Pengaruh |
|-------------|-------|-------------|---------|
| **Pencari Hunian (Primary User)** | Pengguna utama — input data, buat keputusan | Keputusan tepat, hemat waktu dan uang, tidak ada surprise cost | Tinggi |
| **Pasangan / Evaluator** | Reviewer — menerima summary dan memo, beri masukan | Terlibat dalam keputusan tanpa harus ikut survey | Tinggi |
| **Pemilik Properti** | Tidak langsung — data properti mereka yang di-input | Tidak ada interaksi langsung | Rendah |
| **Platform Properti** (Mamikos, OLX) | Sumber data via URL extraction | Data listing dipakai sebagai input | Tidak ada |

### 6.2 RACI

| Aktivitas | Pencari Hunian | Pasangan | Developer |
|-----------|---------------|---------|-----------|
| Set deal breaker | R/A | C | — |
| Input data hunian | R/A | I | — |
| Verifikasi lokasi GPS | R/A | — | — |
| Review AI analysis | R/A | C | — |
| Dismiss deal breaker violation | R/A | C | — |
| Dismiss dominated property | R/A | — | — |
| Buat keputusan final | A | C | — |
| Generate Decision Memo | R/A | I | — |
| Maintain & iterate sistem | I | — | R/A |

---

## 7. Scope

### 7.1 In Scope

**Domain:**
- Manajemen data hunian sewa (kontrakan rumah, apartemen, kost)
- Kalkulasi biaya all-in dan upfront cost
- Dual-threshold budget dengan stretch zone
- Scoring 7 dimensi yang dapat dikonfigurasi
- Logic engine: deal breaker, missing cost, dominated property, decision freeze, dll
- AI coaching: pattern analysis, devil's advocate, regret predictor, decision memo
- GIS analysis berbasis lokasi
- Dokumentasi foto terstruktur per area
- Offline-first dengan sync ke cloud

**Tipe Properti:**
Kontrakan rumah, apartemen, kost-kostan.

**Geografi:**
Fokus awal Jabodetabek. Data GIS (OSM, Overpass) tersedia seluruh Indonesia.

### 7.2 Out of Scope

| Item | Alasan |
|------|--------|
| Hunian untuk dibeli (KPR) | Beda domain, beda decision criteria |
| Properti komersial | Bukan kebutuhan personal |
| Booking atau transaksi hunian | Tidak ada payment gateway |
| Profil / listing untuk pemilik | Beda persona |
| Rating atau review untuk pemilik | Di luar scope personal tool |
| Auto-monitor listing baru | Beda scope — notification system |
| Voice-to-form | Defer — cukup text/URL extraction |
| Contract clause analyzer | Defer — terlalu spesifik hukum |
| Turn-by-turn navigation | Cukup buka Maps |

---

## 8. Business Requirements

### BR-001 — Kalkulasi Biaya Total Transparan

**Pernyataan:** Sistem harus menghitung dan menampilkan total biaya hunian secara all-in per bulan, mencakup semua komponen biaya yang diketahui, sehingga perbandingan dilakukan pada basis yang setara.

**Justifikasi:** Harga sewa pokok yang tertera di listing bukan angka yang real dikeluarkan per bulan. Tanpa kalkulasi all-in, keputusan bisa menyesatkan secara finansial.

**Acceptance Criteria:**
- Sistem menghitung estimasi total bulanan dari semua komponen biaya per tipe properti
- Upfront cost (deposit + biaya masuk) ditampilkan terpisah dan prominan
- Jika komponen biaya penting belum diisi, sistem menampilkan indikator "estimasi belum lengkap"
- Harga yang dipakai untuk scoring dan perbandingan adalah all-in, bukan harga pokok

---

### BR-002 — Budget yang Realistis dan Non-Binary

**Pernyataan:** Sistem harus mendukung budget yang mencerminkan realita pengambilan keputusan — bukan satu angka batas yang binary, melainkan dua threshold (ideal dan maksimum) dengan zona stretch yang dapat dikonfigurasi.

**Justifikasi:** Realitanya, hunian yang Rp 200.000/bulan di atas budget ideal tapi unggul di semua dimensi lain tetap layak dipertimbangkan. Budget binary membuang kandidat yang genuinely worth it.

**Acceptance Criteria:**
- User dapat set `budget_ideal` (angka nyaman) dan `budget_max` (batas absolut)
- Zona stretch (default 20% dari ideal) dapat dikonfigurasi 10–30%
- Setiap hunian dikategorikan ke satu dari empat zona: comfort, ideal, stretch, over
- Kategorisasi menggunakan icon + teks + warna (tidak hanya warna)
- Scoring harga menggunakan segmented curve, bukan linear binary

---

### BR-003 — Deal Breaker Detector

**Pernyataan:** Sistem harus mendukung user untuk menetapkan kriteria wajib (must-have) dan larangan (must-not) sebelum survey, dan secara otomatis mendeteksi hunian yang melanggar kriteria tersebut.

**Justifikasi:** Dalam proses pencarian yang panjang, user sering melupakan kriteria yang ditetapkan di awal. Sistem harus menjadi pengingat yang konsisten — tidak bergantung pada memori user.

**Acceptance Criteria:**
- User dapat membuat minimal 1 rule must-have atau must-not
- Rule dievaluasi secara otomatis setiap kali data hunian diisi atau diubah
- Hunian yang melanggar deal breaker ditampilkan dengan badge yang jelas
- Panel checklist per hunian menampilkan status setiap rule (terpenuhi / dilanggar / belum diisi)
- Field yang belum diisi ditampilkan sebagai "belum diketahui" — bukan diasumsikan pass atau fail

---

### BR-004 — Eliminasi Kandidat yang Didominasi

**Pernyataan:** Sistem harus secara otomatis mendeteksi kandidat yang kalah di semua dimensi dibanding kandidat lain, dan menginformasikan hal ini kepada user — tanpa memaksa eliminasi.

**Justifikasi:** Dengan 8–10 kandidat, sulit melihat secara manual mana yang genuinely kompetitif. Kandidat yang didominasi membuang waktu evaluasi.

**Acceptance Criteria:**
- Sistem mendeteksi dominated property menggunakan strict Pareto dominance (unggul di semua dimensi yang terisi)
- Kandidat yang didominasi diberi badge informatif — bukan otomatis dihapus
- User tetap yang memutuskan untuk coret atau pertahankan kandidat tersebut
- Panel "Bantu Sederhanakan" menampilkan list kandidat yang dapat dipertimbangkan untuk dicoret beserta alasannya

---

### BR-005 — Dokumentasi Lapangan yang Efisien

**Pernyataan:** Proses input data minimum saat di lokasi survey harus dapat diselesaikan dalam waktu tidak lebih dari 30 detik.

**Justifikasi:** Kondisi lapangan (panas, capek, terburu-buru) membuat form panjang tidak realistis. Jika dokumentasi tidak bisa dilakukan on-site, data kritis akan hilang.

**Acceptance Criteria:**
- Quick Survey maksimal 6 field + 2 slot foto wajib
- Quick Survey dapat di-submit dan hunian langsung muncul di dashboard
- Full Survey dapat dilengkapi kapan saja setelah Quick Survey tersimpan

---

### BR-006 — Data Lingkungan Otomatis

**Pernyataan:** Sistem harus menyediakan data lingkungan berbasis lokasi secara otomatis — tanpa input manual — setelah koordinat hunian diverifikasi.

**Justifikasi:** Data ini tidak bisa diperoleh dari survey singkat, tapi dampaknya signifikan (risiko banjir, akses transportasi, kepadatan area).

**Acceptance Criteria:**
- Data GIS tersedia dalam < 10 detik setelah lokasi diverifikasi
- Mencakup minimal: POI radius 1–3 km, transit score, walkability score, flood susceptibility
- Semua data GIS ditampilkan dengan sumber dan disclaimer yang memadai
- Flood Susceptibility selalu disertai disclaimer bahwa model tidak mempertimbangkan tanggul

---

### BR-007 — Anti-Analysis Paralysis

**Pernyataan:** Sistem harus mendeteksi kondisi analysis paralysis dan memberikan dorongan yang tepat untuk membantu user bergerak menuju keputusan.

**Justifikasi:** Banyak pencari hunian yang terus menambah kandidat baru tanpa pernah memutuskan. Sistem harus membantu mengenali bahwa data sudah cukup.

**Acceptance Criteria:**
- Decision Freeze Alert muncul ketika: ≥ 5 kandidat aktif + ≥ 80% data terisi + tidak ada aksi 3+ hari
- Alert bersifat informatif dan dapat di-dismiss — tidak memaksa keputusan
- Alert menampilkan 3 kandidat terkuat berdasarkan data yang ada
- Alert muncul maksimal sekali per siklus pencarian

---

### BR-008 — Transparansi Output AI

**Pernyataan:** Semua output yang dihasilkan AI harus ditampilkan dengan konteks yang memadai — termasuk sifat estimatif dan batasan datanya.

**Justifikasi:** Output AI yang salah dipahami sebagai fakta dapat menyebabkan keputusan yang buruk.

**Acceptance Criteria:**
- Setiap output AI dilabeli sebagai analisis atau estimasi, bukan fakta
- Devil's Advocate dapat di-dismiss oleh user — sistem tidak memaksakan perspektif
- Regret Predictor ditampilkan sebelum keputusan final, bukan sebagai "peringatan keras"
- Semua output AI dapat diregenerasi oleh user
- AI tidak pernah menggunakan terminologi "kriminalitas" atau "berbahaya" untuk area

---

### BR-009 — Offline-First Operasional

**Pernyataan:** Semua fungsi pencatatan dan evaluasi hunian harus berjalan penuh tanpa koneksi internet.

**Justifikasi:** Lokasi survey sering memiliki sinyal buruk. Ketergantungan internet untuk pencatatan akan menghalangi penggunaan on-site.

**Acceptance Criteria:**
- CRUD hunian berfungsi tanpa internet
- Data yang dibuat offline otomatis tersinkronisasi saat koneksi tersedia
- User mendapat informasi yang jelas tentang status sinkronisasi
- Konflik data diselesaikan secara eksplisit oleh user — tidak ada silent overwrite

---

### BR-010 — Dokumentasi Keputusan

**Pernyataan:** Sistem harus mampu menghasilkan dokumen keputusan formal yang menjelaskan alasan pemilihan hunian, trade-off yang diterima, dan kandidat yang dipertimbangkan.

**Justifikasi:** Keputusan hunian adalah keputusan finansial signifikan yang perlu dapat dijelaskan dan dipertanggungjawabkan — terutama kepada pasangan atau keluarga.

**Acceptance Criteria:**
- Decision Memo dapat di-generate setelah user menetapkan status `Dipilih`
- Memo mencakup: hunian terpilih, alasan utama, trade-off yang diterima, kandidat yang dipertimbangkan, ringkasan finansial
- Memo dapat di-export ke PDF
- Bahasa memo natural dan readable — bukan dump data teknis

---

### BR-011 — Integrasi Data dari Listing Online

**Pernyataan:** Sistem harus dapat mengekstrak data hunian dari teks bebas dan URL listing properti untuk mengurangi input manual.

**Acceptance Criteria:**
- Menerima teks bebas (caption, forward pesan) dan mengekstrak field relevan
- Menerima URL dari platform mayor (Mamikos, OLX, Rumah.com) dan mengekstrak data halaman
- Field yang diekstrak di-highlight untuk verifikasi sebelum tersimpan
- Field dengan kepercayaan rendah di-highlight berbeda untuk perhatian user

---

### BR-012 — Privasi Data Finansial User

**Pernyataan:** Data finansial user tidak boleh digunakan untuk keperluan apapun selain kepentingan user sendiri dalam aplikasi.

**Acceptance Criteria:**
- Tidak ada pengiriman data finansial ke pihak ketiga (kecuali sync ke akun Supabase user sendiri)
- Data yang dikirim ke OpenAI tidak mengandung informasi yang dapat mengidentifikasi user secara personal
- Tidak ada iklan atau monetisasi berbasis data user

---

### BR-013 — Portabilitas Data

**Pernyataan:** User harus dapat mengekspor seluruh data hunian mereka.

**Acceptance Criteria:**
- Export ke CSV untuk semua data property
- Export PDF untuk laporan perbandingan dan Decision Memo
- Data dapat didownload kapan saja

---

## 9. Functional Requirements

| ID | Requirement | Prioritas | BR Terkait |
|----|-------------|-----------|-----------|
| FR-001 | Sistem mendukung penambahan, pengeditan, dan penghapusan data hunian | Tinggi | BR-005 |
| FR-002 | Quick Survey dapat diselesaikan dalam ≤ 30 detik dengan 6 field + 2 foto | Tinggi | BR-005 |
| FR-003 | Full Survey tersedia dalam 5 tab, dapat diisi kapan saja setelah Quick Survey | Tinggi | BR-005 |
| FR-004 | Sistem menghitung estimasi total biaya bulanan all-in per tipe properti | Tinggi | BR-001 |
| FR-005 | Sistem menampilkan upfront cost (deposit + biaya masuk) terpisah dari biaya bulanan | Tinggi | BR-001 |
| FR-006 | User dapat set dual-threshold budget (ideal + max) dengan stretch zone konfigurasi | Tinggi | BR-002 |
| FR-007 | Setiap hunian dikategorikan ke zona budget (comfort/ideal/stretch/over) | Tinggi | BR-002 |
| FR-008 | Scoring 7 dimensi dihitung otomatis dengan bobot yang dapat dikonfigurasi | Tinggi | BR-002 |
| FR-009 | User dapat membuat deal breaker rules (must-have dan must-not) | Tinggi | BR-003 |
| FR-010 | Deal breaker dievaluasi otomatis dan ditampilkan per hunian | Tinggi | BR-003 |
| FR-011 | Sistem mendeteksi dan menandai kandidat yang didominasi kandidat lain | Sedang | BR-004 |
| FR-012 | Panel "Bantu Sederhanakan" menampilkan kandidat yang dapat dipertimbangkan untuk dicoret | Sedang | BR-004 |
| FR-013 | Sistem mendeteksi komponen biaya penting yang belum diisi per tipe properti | Tinggi | BR-001 |
| FR-014 | Sistem mendeteksi dan memperingatkan deposit besar dan lock-in kontrak panjang | Tinggi | BR-001 |
| FR-015 | Sistem menampilkan proyeksi total biaya untuk 6, 12, dan 24 bulan | Sedang | BR-001 |
| FR-016 | What If Analysis slider di compare view merecalculate skor secara real-time | Sedang | BR-002 |
| FR-017 | Commute Fatigue Score mengkonversi waktu tempuh ke jam/hari per tahun | Sedang | BR-001 |
| FR-018 | Survey Priority Ranking merekomendasikan urutan survey berdasarkan data yang tersedia | Sedang | BR-005 |
| FR-019 | Decision Freeze Alert muncul saat kondisi analysis paralysis terdeteksi | Sedang | BR-007 |
| FR-020 | Reverse Recommendation panel menampilkan alasan kuat untuk tidak memilih | Sedang | BR-007 |
| FR-021 | Sistem mendukung upload dan organisasi foto per kategori area hunian (slot terstruktur) | Tinggi | BR-005 |
| FR-022 | Lokasi hunian dapat diverifikasi via GPS atau Google Maps link | Tinggi | BR-006 |
| FR-023 | Sistem mendukung pre-survey tracking (tambah kandidat sebelum survey) | Sedang | BR-005 |
| FR-024 | Data POI, transit score, dan walkability score tersedia otomatis setelah lokasi verified | Tinggi | BR-006 |
| FR-025 | Flood Susceptibility Estimate tersedia dengan disclaimer yang jelas | Sedang | BR-006, BR-008 |
| FR-026 | Area Activity Indicator tersedia tanpa menggunakan terminologi kriminalitas | Sedang | BR-006, BR-008 |
| FR-027 | Sistem menyimpan data secara lokal dan menyinkronkan ke cloud saat koneksi tersedia | Tinggi | BR-009 |
| FR-028 | Konflik data diselesaikan secara eksplisit oleh user | Tinggi | BR-009 |
| FR-029 | AI mengekstrak data dari teks bebas dan URL listing | Tinggi | BR-011 |
| FR-030 | Personal Decision Coach menganalisis pattern preferensi dari data yang ada | Sedang | BR-008 |
| FR-031 | Devil's Advocate memberikan counterargument terhadap kandidat favorit | Sedang | BR-008 |
| FR-032 | AI Red Team mendeteksi kontradiksi dan anomali dalam data hunian | Sedang | BR-008 |
| FR-033 | Hidden Pattern Finder mengidentifikasi pola tersembunyi dari semua kandidat | Rendah | BR-008 |
| FR-034 | Regret Predictor menampilkan potensi penyesalan sebelum dan sesudah keputusan | Sedang | BR-008 |
| FR-035 | Decision Memo Generator menghasilkan dokumen keputusan yang dapat di-export PDF | Sedang | BR-010 |
| FR-036 | Negotiation Strategy 2.0 menghasilkan target harga dan argumen nego terstruktur | Rendah | BR-011 |
| FR-037 | Sistem menampilkan peta multi-titik semua kandidat dengan warna per skor | Tinggi | BR-006 |
| FR-038 | Compare view menampilkan side-by-side dengan What If slider dan radar chart 7 dimensi | Tinggi | BR-002 |
| FR-039 | Summary untuk pasangan menghasilkan narrative WhatsApp-ready | Sedang | BR-010 |
| FR-040 | Export data ke CSV dan Decision Memo ke PDF | Sedang | BR-013 |


---

## 10. Non-Functional Requirements

| ID | Requirement | Target | Kategori |
|----|-------------|--------|---------|
| NFR-001 | Quick Survey selesai dalam ≤ 30 detik di HP | 30 detik | Usability |
| NFR-002 | Semua core dan logic features berjalan tanpa internet | 100% offline | Availability |
| NFR-003 | Data offline tersinkronisasi ke cloud dalam < 30 detik setelah koneksi tersedia | < 30 detik | Reliability |
| NFR-004 | Tidak ada silent overwrite — konflik data diselesaikan eksplisit oleh user | 0 silent overwrite | Integrity |
| NFR-005 | Aplikasi optimal di layar 375px (mobile first) | 375px | Usability |
| NFR-006 | Semua touch target minimum 44×44px | 44×44px | Accessibility |
| NFR-007 | Scoring 7 dimensi dikalkulasi real-time saat form diisi | < 150ms | Performance |
| NFR-008 | Budget zone recalculate otomatis saat harga atau budget berubah | < 100ms | Performance |
| NFR-009 | Deal breaker check berjalan real-time saat data diisi | < 50ms | Performance |
| NFR-010 | Dominated property recalculate saat ada kandidat baru | < 200ms | Performance |
| NFR-011 | What If slider recalculate skor semua kandidat secara real-time | < 200ms | Performance |
| NFR-012 | GIS data tersedia dalam < 10 detik setelah lokasi diverifikasi | < 10 detik | Performance |
| NFR-013 | AI response untuk extraction dan generation | < 5 detik | Performance |
| NFR-014 | AI gagal secara graceful — tidak blocking semua fungsi | Graceful degradation | Reliability |
| NFR-015 | Total biaya AI per bulan tidak melebihi $5 untuk penggunaan personal | < $5/bulan | Cost |
| NFR-016 | Semua infrastructure (Supabase, Vercel, GIS API) menggunakan free tier | $0 infrastructure | Cost |
| NFR-017 | Data finansial user tidak dikirim ke pihak ketiga selain sync ke akun sendiri | 0 data leak | Security |
| NFR-018 | Foto dikompresi otomatis ke max 500KB sebelum upload | Max 500KB | Efficiency |
| NFR-019 | Peta tetap dapat ditampilkan tanpa koneksi internet (tiles cached) | Offline maps | Availability |
| NFR-020 | WCAG AA minimum untuk semua kombinasi warna | 4.5:1 min | Accessibility |

---

## 11. Business Rules

Business rules mengatur perilaku sistem dari perspektif bisnis — bukan keputusan teknis.

### Keuangan & Harga

| ID | Rule | Dampak jika Dilanggar |
|----|------|-----------------------|
| BU-001 | Harga yang ditampilkan di dashboard, card, dan compare view adalah **total all-in per bulan**, bukan sewa pokok | Perbandingan menyesatkan |
| BU-002 | Upfront cost **wajib ditampilkan** berdampingan dengan harga bulanan di setiap tampilan utama | User tidak siap dengan beban kas awal |
| BU-003 | Scoring harga menggunakan **total all-in** sebagai basis, bukan sewa pokok | Hunian dengan banyak biaya tersembunyi terlihat lebih murah secara artifisial |
| BU-004 | Hunian dengan status `Dicoret` dan `Sudah Diambil` **tidak masuk** kalkulasi average dan compare baseline | Outlier mempengaruhi insight secara tidak tepat |

### Budget

| ID | Rule | Dampak jika Dilanggar |
|----|------|-----------------------|
| BU-005 | Budget Ideal harus **selalu lebih rendah** dari Budget Maksimum | Sistem tidak bisa menghitung stretch zone |
| BU-006 | Jika Budget Maksimum tidak diset, **tidak ada penalti** untuk zona over — hanya ditampilkan sebagai informasi | False penalty pada hunian di luar budget yang belum ditetapkan |
| BU-007 | Budget Overview **selalu ditampilkan** di atas dashboard — tidak conditional | User kehilangan konteks budget saat evaluasi |

### Deal Breaker

| ID | Rule | Dampak jika Dilanggar |
|----|------|-----------------------|
| BU-008 | Field yang **belum diisi** tidak dievaluasi sebagai pass atau fail dalam deal breaker — ditampilkan sebagai "belum diketahui" | False positive atau false negative yang menyesatkan |
| BU-009 | Deal breaker violation **tidak mencegah** user dari menyimpan atau melihat hunian — hanya ditampilkan sebagai peringatan | Friction tidak perlu; user harus tetap bisa mempertimbangkan tradeoff |
| BU-010 | Deal breaker bersifat **global** (berlaku untuk semua hunian dalam satu akun) — tidak per sesi | Inkonsistensi evaluasi antar hunian |

### Dominated Property

| ID | Rule | Dampak jika Dilanggar |
|----|------|-----------------------|
| BU-011 | Dominated property **tidak otomatis dicoret** — sistem hanya memberikan informasi dan saran | User kehilangan agency; ada kasus di mana hunian "dominated" tetap worth it karena alasan subjektif |
| BU-012 | Dominance dihitung menggunakan **strict Pareto** — A mendominasi B hanya jika A unggul atau sama di semua dimensi yang terisi dan unggul di minimal satu | False dominance yang menyesatkan |
| BU-013 | Dimensi yang **belum terisi** di salah satu kandidat tidak dimasukkan ke kalkulasi dominance | Perbandingan yang tidak fair |

### AI & Output Sistem

| ID | Rule | Dampak jika Dilanggar |
|----|------|-----------------------|
| BU-014 | Semua output AI **wajib dilabeli** sebagai analisis atau estimasi — bukan fakta | User mengambil keputusan berdasarkan output AI yang salah dipahami |
| BU-015 | Terminologi "kriminalitas", "berbahaya", atau "tidak aman" **dilarang** digunakan sebagai label atau output sistem | Menyesatkan dan berpotensi merugikan area atau pemilik properti |
| BU-016 | Flood Susceptibility **selalu ditampilkan** dengan disclaimer bahwa model tidak mempertimbangkan tanggul dan drainase | User menganggap data sebagai penilaian definitif |
| BU-017 | Devil's Advocate **selalu dapat di-dismiss** oleh user — sistem tidak memaksakan perspektif | Friction berlebihan; user merasa "diinterogasi" |
| BU-018 | Decision Freeze Alert **dapat di-dismiss** dan muncul maksimal sekali per siklus pencarian | Notifikasi yang berulang dianggap spam |
| BU-019 | AI Red Team menampilkan kontradiksi data secara **netral** — bukan sebagai penghakiman | User merasa dihakimi, bukan dibantu |

### Sync & Data

| ID | Rule | Dampak jika Dilanggar |
|----|------|-----------------------|
| BU-020 | Sinkronisasi data **tidak boleh silent overwrite** — jika konflik terdeteksi, user harus memilih | Data lebih baru tertimpa tanpa sepengetahuan user |
| BU-021 | Data finansial user **tidak boleh digunakan** untuk analitik pihak ketiga atau training model AI | Pelanggaran privasi user |
| BU-022 | Minimal kontrak yang berlaku adalah **periode terpendek** dari `available_periods` yang ditawarkan pemilik | User berasumsi bisa kontrak lebih pendek |

### Commute & Jarak

| ID | Rule | Dampak jika Dilanggar |
|----|------|-----------------------|
| BU-023 | Jarak kantor dihitung **otomatis via Haversine** dari koordinat — tidak ada input manual jarak | User input perkiraan yang tidak akurat |
| BU-024 | `commute_time_minutes` bersifat **opsional** dan hanya digunakan untuk Commute Fatigue Score — tidak replace kalkulasi jarak Haversine | Scoring terganggu jika field tidak diisi |
| BU-025 | Commute Fatigue Score menggunakan **asumsi 5 hari kerja, 22 hari/bulan** yang ditampilkan secara eksplisit | User tidak tahu basis kalkulasi |

---

## 12. Constraints

| ID | Constraint | Implikasi |
|----|-----------|-----------|
| CON-001 | Tidak ada anggaran infrastructure berbayar — semua tools pada free tier | Pilihan teknologi dibatasi |
| CON-002 | OpenAI API (GPT-4o mini) adalah satu-satunya LLM — tidak ada fallback ke provider lain | AI tidak bisa digunakan jika OpenAI down |
| CON-003 | Tidak ada data kriminalitas resmi yang dapat di-query per lokasi di Indonesia | Crime indicator tidak bisa diimplementasikan — diganti Area Activity Indicator |
| CON-004 | Supabase free tier: storage foto 1GB, database 500MB | Foto wajib dikompresi; video tidak diupload ke cloud |
| CON-005 | OpenRouteService free tier: 2.000 request/hari | GIS cache wajib diimplementasikan agresif |
| CON-006 | Jina AI dibatasi ~20 request/menit | URL extraction tidak bisa dilakukan batch atau paralel |
| CON-007 | Aplikasi dibangun oleh satu developer | Scope setiap iterasi harus realistis |
| CON-008 | Semua logic features harus berjalan di browser (tidak butuh server) | Logic Engine = pure JavaScript, tidak ada backend call |

---

## 13. Assumptions

| ID | Asumsi | Risiko jika Salah |
|----|--------|-------------------|
| AS-001 | User memiliki smartphone dengan browser modern (OPFS, Service Worker, Geolocation) | Fitur offline dan location tidak berfungsi di browser lama |
| AS-002 | Koneksi internet tersedia setidaknya sekali sehari untuk sinkronisasi | Data lama tidak tersinkron; risiko conflict tinggi |
| AS-003 | User survey maksimal 15 kandidat per proses pencarian | Storage dan performance dioptimasi untuk scale ini |
| AS-004 | OpenStreetMap memiliki coverage POI yang cukup untuk Jabodetabek | GIS features tidak memberikan nilai di area coverage OSM rendah |
| AS-005 | User bersedia melakukan verifikasi GPS di lokasi saat survey | GIS tidak aktif jika user tidak mau verifikasi |
| AS-006 | Data listing dari Mamikos/OLX memiliki struktur yang cukup konsisten untuk diekstrak AI | URL extraction menghasilkan data tidak akurat jika struktur berubah signifikan |
| AS-007 | User memahami bahwa output AI dan GIS adalah estimasi, bukan fakta | Keputusan dibuat berdasarkan data yang salah dipahami |
| AS-008 | Satu lokasi kantor sudah cukup sebagai referensi jarak | User dengan multiple kantor tidak mendapat insight jarak yang akurat |
| AS-009 | Logic features (Deal Breaker, Dominated, dll) sudah cukup valuable tanpa AI untuk sebagian besar use case | Jika tidak, akan ada pressure untuk memindahkan logic ke AI yang lebih mahal |
| AS-010 | Devil's Advocate yang baik lebih valuable daripada validasi yang selalu setuju | Fitur ini harus genuinely challenge user, bukan sekedar "bisa di-dismiss" |

---

## 14. Dependencies

| ID | Dependency | Tipe | Versi | Risiko |
|----|-----------|------|-------|--------|
| DEP-001 | OpenAI API (GPT-4o mini) | External, berbayar (ada key) | gpt-4o-mini | API down, harga naik, rate limit |
| DEP-002 | Supabase (PostgreSQL, Auth, Storage, Realtime) | External, free tier | Latest | Breaking changes, limit naik |
| DEP-003 | Jina AI (r.jina.ai) | External, gratis | Public | Rate limit, ToS berubah, URL target struktur berubah |
| DEP-004 | Overpass API | External, gratis, fair use | Public | Server down, rate limit saat traffic tinggi |
| DEP-005 | Open Elevation API | External, gratis | Public | Server tidak selalu reliable |
| DEP-006 | OpenRouteService | External, free tier | v2 | 2K request/hari limit |
| DEP-007 | Nominatim (OSM Geocoding) | External, gratis, rate limited | Public | 1 req/detik limit |
| DEP-008 | OpenStreetMap | External, gratis | — | Coverage data bervariasi per area |
| DEP-009 | Vercel | External, free tier | — | Cold start, build limit, Edge Function timeout |
| DEP-010 | Next.js | Framework, open source | 14+ | Major version breaking changes |
| DEP-011 | Dexie.js | Library, open source | v3 | IndexedDB browser support |
| DEP-012 | Leaflet.js | Library, open source | v1 | — |

---

## 15. Risks & Mitigations

### 15.1 Business Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| BR-R01 | Output AI salah dan mempengaruhi keputusan hunian | Sedang | Tinggi | Label "estimasi" wajib; user verification step untuk extraction |
| BR-R02 | GIS data tidak akurat untuk area tertentu (coverage OSM rendah) | Sedang | Sedang | Warning jika POI count sangat sedikit; disclaimer di semua output GIS |
| BR-R03 | Deal Breaker terlalu ketat → user override semua → fitur jadi tidak berguna | Rendah | Sedang | Limit jumlah rules; edukasi bahwa rules bisa di-edit |
| BR-R04 | Flood Susceptibility disalahartikan sebagai garansi keamanan | Sedang | Tinggi | Disclaimer wajib + label "Estimate" bukan "Risk" |
| BR-R05 | Devil's Advocate terasa menghakimi → user frustrasi | Sedang | Sedang | Framing yang tepat; selalu bisa di-dismiss; tone netral |
| BR-R06 | Decision Freeze Alert muncul di waktu yang salah → user abaikan | Sedang | Rendah | Timing yang tepat; dismissible; maksimal sekali per siklus |

### 15.2 Technical Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| TR-R01 | Supabase free tier limit terlampaui (storage foto) | Rendah | Tinggi | Kompresi agresif (max 500KB/foto); monitor usage |
| TR-R02 | Jina AI gagal mengekstrak URL (struktur berubah) | Tinggi | Sedang | Fallback ke manual input; error message informatif |
| TR-R03 | Overpass API rate limit saat load testing | Sedang | Sedang | Cache agresif di IndexedDB; semua via /api/gis dengan rate control |
| TR-R04 | Dominated property calculation salah (partial data) | Sedang | Tinggi | Strict mode: hanya hitung dimensi yang terisi di kedua kandidat |
| TR-R05 | Sync conflict tidak terdeteksi → silent overwrite | Rendah | Tinggi | Conflict detection via `updated_at`; dialog eksplisit wajib |
| TR-R06 | IndexedDB penuh (terlalu banyak foto blob di OPFS) | Rendah | Sedang | Monitoring kapasitas; warning jika < 500MB tersisa |
| TR-R07 | OPFS tidak didukung browser lama | Sedang | Sedang | Browser check saat load; fallback graceful dengan pesan informatif |
| TR-R08 | OpenAI API cost melonjak akibat prompt yang tidak efisien | Rendah | Sedang | Caching via input_hash + prompt_version; monitoring cost |

### 15.3 Product Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| PR-R01 | Scope creep — terus tambah fitur sebelum v1.0 selesai | Tinggi | Tinggi | Feature freeze setelah PRD v2.1; fitur baru ke backlog v1.x+ |
| PR-R02 | Logic Engine lebih kompleks dari estimasi (dominated, deal breaker edge cases) | Sedang | Sedang | Start simple; tambah edge case handling iteratif |
| PR-R03 | Scoring 7 dimensi dengan bobot yang bisa dikonfigurasi = complexity tinggi | Sedang | Sedang | Sediakan preset bobot (default, prioritas harga, prioritas jarak) |
| PR-R04 | Offline-sync lebih kompleks dari estimasi | Sedang | Tinggi | Implementasi Dexie.js + sync queue sebagai first priority v1.0 |
| PR-R05 | User tidak paham cara set deal breaker yang effective | Sedang | Sedang | Template deal breaker siap pakai; onboarding yang guided |

---

## 16. Glossary

| Term | Definisi |
|------|---------|
| **All-in cost** | Total biaya hunian per bulan termasuk semua komponen: sewa pokok, IPL, listrik, air, internet, parkir, dan biaya rutin lainnya |
| **Upfront cost** | Total biaya yang dibayar sebelum atau saat masuk: deposit + biaya administrasi + bulan pertama |
| **Budget ideal** | Angka budget yang nyaman — tidak ada stress finansial jika membayar jumlah ini |
| **Budget maksimum** | Angka batas absolut yang benar-benar tidak bisa dilampaui |
| **Stretch zone** | Area antara budget ideal dan budget maksimum — masih layak dipertimbangkan jika nilai yang didapat setara |
| **Budget zone** | Kategori posisi harga all-in hunian relatif terhadap dual-threshold budget (comfort/ideal/stretch/over) |
| **Quick Survey** | Mode input ringkas — 6 field + 2 foto, dirancang selesai dalam 30 detik di lapangan |
| **Full Survey** | Mode input lengkap dengan detail biaya, kondisi fisik, dan administrasi — 5 tab, bisa diisi kapan saja |
| **Deal Breaker** | Kriteria wajib (must-have) atau larangan (must-not) yang ditetapkan user sebelum survey |
| **Dominated Property** | Hunian yang kalah di semua dimensi dibanding kandidat lain — Pareto dominated |
| **Pareto Dominance** | Kondisi di mana kandidat A unggul atau sama di semua dimensi yang terisi dibanding kandidat B, dan lebih unggul di minimal satu dimensi |
| **Scoring 7 Dimensi** | Sistem penilaian hunian berdasarkan: Affordability, Accessibility, Condition, Livability, Environment & Safety, Value for Money, Commitment Risk |
| **Commitment Risk** | Risiko finansial dari deposit besar dan kontrak panjang yang tidak sesuai rencana tinggal |
| **Value for Money** | Perbandingan antara harga yang dibayar vs fasilitas yang didapat, termasuk harga per m² dan komponen yang include |
| **Livability Score** | Skor komposit dari data GIS: walkability, transit access, dan kepadatan POI |
| **GIS** | Geographic Information System — dalam konteks ini: query POI, kalkulasi jarak, estimasi flood risk, aksesibilitas |
| **POI (Point of Interest)** | Titik lokasi yang penting: masjid, minimarket, RS, stasiun, dll |
| **Isochrone** | Area yang dapat dicapai dari suatu titik dalam batas waktu tertentu |
| **Approximate location** | Koordinat dari geocoding alamat — akurasi ±100–500m, GIS tidak aktif |
| **Verified location** | Koordinat dari GPS capture atau Maps link — akurasi ±5–20m, GIS aktif penuh |
| **Sync queue** | Antrian operasi CRUD yang belum tersinkronisasi ke Supabase |
| **Photo upload queue** | Antrian foto yang tersimpan lokal (OPFS) menunggu diupload ke Supabase Storage |
| **Local-first** | Arsitektur di mana semua operasi tulis ke local storage (IndexedDB) dulu, cloud adalah sync target |
| **Flood Susceptibility Estimate** | Indikasi kemungkinan area terdampak banjir berbasis elevasi dan proximity ke waterway — bukan data resmi |
| **Area Activity Indicator** | Indikator kepadatan aktivitas dan infrastruktur keamanan area dari OSM — bukan data kriminalitas |
| **Haversine formula** | Formula matematika untuk menghitung jarak garis lurus antara dua koordinat — digunakan untuk kalkulasi jarak ke kantor |
| **Commute Fatigue Score** | Konversi waktu tempuh harian menjadi total jam/hari yang "terbuang" per tahun — membuat dampak jarak lebih terasa |
| **Decision Freeze Alert** | Notifikasi saat sistem mendeteksi tanda-tanda analysis paralysis |
| **Personal Decision Coach** | Fitur AI yang menganalisis pattern preferensi user dari data perilaku, bukan hanya bobot yang diset |
| **Devil's Advocate** | Fitur AI yang secara aktif memberikan counterargument terhadap kandidat yang sudah sangat disukai user |
| **AI Red Team** | Fitur AI yang mencari kontradiksi, anomali, dan data mencurigakan dalam data hunian |
| **Hidden Pattern Finder** | Fitur AI yang mengidentifikasi pola tersembunyi dari semua kandidat yang tidak terlihat secara eksplisit |
| **Regret Predictor** | Fitur yang menampilkan potensi penyesalan sebelum dan sesudah keputusan final — fase pertama logic-based, fase kedua AI |
| **Decision Memo** | Dokumen keputusan formal yang dihasilkan AI setelah user menetapkan hunian final — dapat di-export PDF |
| **Negotiation Strategy 2.0** | Output AI yang lebih actionable dari sekadar script nego: target ideal/realistis, probabilitas berhasil, argumen per kategori |
| **Reverse Recommendation** | Pendekatan framing yang menampilkan "alasan kuat untuk TIDAK memilih" — lebih natural dari memilih |
| **Survey Priority Ranking** | Sistem ranking kandidat pre-survey berdasarkan budget match, jarak, dan kelengkapan data |
| **Future Cost Projection** | Proyeksi total pengeluaran kumulatif untuk 6, 12, 24 bulan — mengubah perspektif selisih kecil jadi dampak besar |
| **What If Analysis** | Slider interaktif di compare view yang merecalculate skor semua kandidat saat budget diubah — tanpa LLM |
| **Worth It Consideration** | Alert yang muncul saat hunian di stretch zone/sedikit over budget tapi skor tinggi — template lokal, tidak butuh AI |
| **Dominated Property Elimination** | Proses penandaan kandidat yang didominasi dengan badge informatif dan saran untuk dicoret |
