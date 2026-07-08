# PRD — Hunian
**Versi**: 2.0
**Tanggal**: Juni 2026
**Author**: Faisal
**Status**: Final Draft

---

## Daftar Isi

1. Overview
2. Problem Statement
3. Goals
4. User Personas
5. Scope
6. Jenis Properti
7. Fitur Detail — Core
8. AI-Powered Features
9. GIS Features
10. User Stories
11. Data Model
12. Tech Stack
13. Non-Functional Requirements
14. Wireframe Alur
15. Iteration Plan
16. Open Questions
17. Asumsi
18. Feature Map Lengkap

---

## 1. Overview

**Hunian** adalah aplikasi web untuk survei, evaluasi, dan perbandingan hunian sewa di Indonesia — kontrakan rumah, apartemen, dan kost-kostan.

Tiga layer intelligence:
- **Form survey terstruktur** — Quick Survey (30 detik di lapangan) + Full Survey (detail, diisi kapan saja)
- **AI LLM** — ekstraksi data otomatis, analisis, dan insight keputusan
- **GIS** — analisis geospasial berbasis lokasi: POI, banjir, transportasi, walkability

**Stack**: Next.js + Supabase + Tailwind CSS
**Storage**: Dual-layer — IndexedDB (local-first) + Supabase (sync target)
**Offline**: Semua operasi CRUD jalan tanpa internet, sync otomatis saat online

---

## 2. Problem Statement

Proses cari hunian sewa itu messy:

- Form panjang bikin user malas isi saat di lapangan — panas, capek, pegang HP
- Harga sewa pokok tidak mencerminkan total biaya sesungguhnya
- Tidak ada cara membandingkan hunian secara apple-to-apple
- Budget dikelola sebagai satu angka — padahal realita ada "nyaman", "masih oke", dan "tidak mungkin"
- Hunian bagus tapi sedikit di atas budget langsung dicoret, padahal mungkin worth it kalau dilihat dari total value
- Data lingkungan (banjir, transportasi, keamanan) tidak diketahui sampai sudah pindah

---

## 3. Goals

### Primary Goal
Menghasilkan keputusan hunian yang worth it — berbasis data, bukan perasaan sesaat.

### Success Metrics (v1.0)
- Quick Survey selesai ≤ 30 detik di lapangan
- User bisa tambah ≥ 3 hunian dan langsung dapat skor + budget indicator
- Keputusan final tercapai dari sesi review ≤ 30 menit
- ≥ 80% hunian punya lokasi terverifikasi sebelum keputusan dibuat

---

## 4. User Personas

### Pencari Hunian Aktif (Primary)
- Sedang survey beberapa tempat dalam waktu berdekatan
- Butuh pencatatan cepat di lapangan, satu tangan
- Punya budget yang jelas tapi fleksibel pada angka tertentu
- Mempertimbangkan opini pasangan

### Evaluator — Pasangan / Rekan (Secondary)
- Tidak ikut survey langsung
- Butuh akses lihat ringkasan pilihan yang sudah diinput

---

## 5. Scope

### v1.0 — Core Foundation
- CRUD hunian: Quick Survey + Full Survey
- **Budget system dual-threshold** (budget_ideal + budget_max + stretch zone)
- Kalkulasi biaya all-in + upfront cost
- Scoring 5 dimensi dengan segmented curve per zona budget
- **Worth It Consideration** — insight otomatis berbasis data lokal
- Dashboard + Budget Overview + filter + status
- Compare view + radar chart + budget indicator
- Map multi-titik + location accuracy (approximate vs verified)
- Foto terstruktur: 2 slot wajib + compress ke Supabase Storage
- Offline-first + sync queue + photo upload queue
- AI: Text-to-Form Extraction + Link Extraction via Jina AI
- Next.js API Routes `/api/ai` + `/api/gis`

### v1.1 — GIS Dasar + AI Intelligence
- POI Radar, Walkability Score, Transit Score, Livability Score
- AI: Smart Notes + Red Flags, Contextual Checklist, Summary Pasangan
- Video upload (OPFS, local only)

### v1.2 — GIS Lanjutan
- Flood Susceptibility Estimate
- Noise Risk Map
- Isochrone Map
- Area Activity Indicator

### v1.3 — AI Lanjutan + GIS Synthesis
- AI: Neighborhood Intelligence
- AI: Negotiation Script Generator
- Area Brief (GIS + LLM Synthesis)

### v2.0 — Share & Export
- Share link ke pasangan (view-only, tanpa login)
- Export PDF laporan perbandingan
- Export data ke CSV

### v3.0 — Price Intelligence
- Price Fairness Check (Jina scrape Mamikos/OLX)
- Defer — maintenance cost scraping tinggi, hasil bisa misleading

### Out of Scope
- Voice-to-form
- Contract clause analyzer
- Turn-by-turn navigation
- Auto-monitor listing baru
- Multi-user role management

---

## 6. Jenis Properti yang Didukung

| Tipe | Keterangan | Ciri Biaya |
|------|-----------|-----------|
| **Kontrakan Rumah** | Dikontrak per tahun | Semua utilitas & biaya lingkungan terpisah |
| **Apartemen** | Sewa bulanan/tahunan | Ada IPL/service charge; sebagian utilitas bisa include |
| **Kost** | Sewa bulanan | Paling variatif — bisa include listrik, air, WiFi, makan |

Form survey menyesuaikan secara dinamis berdasarkan tipe yang dipilih.

---

## 7. Fitur Detail — Core

### 7.1 Form Survey: Quick vs Full

#### Quick Survey — di lapangan, ≤ 30 detik

| Field | Input |
|-------|-------|
| Nama / label | Text — "Kost Bu Sari - Pondok Gede" |
| Tipe properti | Enum: kontrakan / apartemen / kost |
| Harga sewa pokok | Integer + periode (bulanan/tahunan) |
| Lokasi | GPS capture atau paste Maps link |
| Foto tampak depan | Kamera langsung — slot wajib #1 |
| Foto area utama | Kamera langsung — slot wajib #2 |

Setelah submit: hunian masuk dashboard dengan **skor parsial**, label "Skor Sementara", dan reminder "Full Survey belum lengkap."

---

#### Full Survey — 5 tab, diisi kapan saja

**Tab 1 — Biaya Detail** *(berbeda per tipe)*

Kontrakan Rumah:

| Field | Tipe |
|-------|------|
| Harga sewa | Integer (per tahun atau per bulan) |
| Harga per bulan | Calculated jika input tahunan |
| Deposit | Integer (berapa bulan) |
| Listrik | Enum: token / tagihan PLN |
| Air | Enum: PAM terpisah / sumur gratis / galon |
| Biaya kebersihan RT | Integer/bulan (nullable) |
| Biaya keamanan (siskamling) | Integer/bulan (nullable) |
| PBB | Enum: pemilik / penyewa (nullable) |
| Parkir | Enum: free / paid / none |
| Biaya lainnya | Dynamic list: label + nominal |
| **Estimasi total per bulan** | Calculated |

Apartemen:

| Field | Tipe |
|-------|------|
| Harga sewa | Integer (per bulan / per tahun) |
| IPL — include? | Boolean |
| IPL — nominal | Integer/bulan (jika tidak include) |
| Service charge — include? | Boolean |
| Service charge — nominal | Integer/bulan (jika tidak include) |
| Sinking fund | Integer/bulan (nullable) |
| Listrik — include? | Boolean |
| Listrik — sistem | Enum: token / tagihan / meteran (nullable) |
| Listrik — estimasi | Integer/bulan (nullable) |
| Air — include? | Boolean |
| Air — estimasi | Integer/bulan (nullable) |
| Internet — include? | Boolean |
| Internet — estimasi | Integer/bulan (nullable) |
| Parkir motor | Integer/bulan (nullable, 0 = gratis) |
| Parkir mobil | Integer/bulan (nullable) |
| AC | Enum: include / sewa / tidak ada |
| AC service cost | Integer/tahun (nullable) |
| Biaya lainnya | Dynamic list: label + nominal |
| **Estimasi total per bulan** | Calculated |

Kost:

| Field | Tipe |
|-------|------|
| Harga sewa | Integer/bulan |
| Listrik — include? | Boolean |
| Listrik — sistem | Enum: token / meteran / bagi rata (nullable) |
| Listrik — estimasi | Integer/bulan (nullable) |
| Air — include? | Boolean |
| WiFi | Enum: ada / tidak ada |
| Makan — include? | Boolean |
| Makan — frekuensi | Enum: 1x / 2x / 3x (nullable) |
| Laundry | Enum: include / bayar per kg / tidak ada |
| Kamar mandi | Enum: private / sharing |
| Dapur | Enum: boleh masak / sharing / tidak ada |
| Parkir | Enum: free / paid / none |
| Biaya lainnya | Dynamic list: label + nominal |
| **Estimasi total per bulan** | Calculated |

**Tab 2 — Kondisi Fisik**
- Luas (m²)
- Jumlah kamar tidur / kamar mandi
- Kondisi bangunan: 1–5
- Furnitur: unfurnished / semi / full furnished
- AC: ada / tidak *(kontrakan & kost)*
- Lantai *(apartemen)*
- Menghadap: U/S/T/B/tidak tahu

**Tab 3 — Lingkungan & Administrasi**
- Keamanan komplek: satpam 24 jam / one gate / tidak ada
- Lingkungan: sangat tenang / tenang / campuran / ramai
- Riwayat banjir: tidak pernah / pernah / tidak tahu
- Aturan tambahan
- Periode kontrak tersedia (multi-select): bulanan / 3 bulan / 6 bulan / tahunan
- Periode minimum (calculated dari terpendek yang tersedia)
- Deposit (bulan)
- Kontak pemilik / agen
- Sumber listing: Mamikos / OLX / referral / lainnya
- Waktu tempuh ke kantor: input manual (menit) — opsional, untuk upgrade masa depan

**Tab 4 — Foto & Video** *(lihat section 7.9)*

**Tab 5 — Catatan**
Textarea bebas: kesan, hal yang perlu ditanyakan lagi, observasi lapangan.

---

### 7.2 Budget System

Budget dikelola dengan **dual-threshold** — bukan satu angka. Ini mencerminkan cara orang sesungguhnya berpikir tentang anggaran.

#### Dua Threshold

| Threshold | Nama di UI | Makna |
|-----------|-----------|-------|
| `budget_ideal` | "Budget Ideal" | Angka yang paling nyaman — tidak ada stress finansial |
| `budget_max` | "Batas Maksimum" | Angka absolut yang tidak bisa dilampaui |

#### Tiga Zona Budget

```
Rp 0 ───────────[budget_ideal]────[budget_max]──────→
      Comfort        Ideal          Stretch      Over
```

| Zona | Kondisi | Artinya |
|------|---------|---------|
| **Comfort** | < 70% budget_ideal | Jauh di bawah ideal, sangat affordable |
| **Ideal** | 70–100% budget_ideal | Dalam zona nyaman |
| **Stretch** | > 100% budget_ideal, ≤ budget_max | Di atas ideal, tapi masih dalam batas |
| **Over** | > budget_max | Melebihi batas absolut |

#### Stretch Zone — Konfigurasi

Default: budget_max = budget_ideal × 1.2 (20% di atas ideal).

User bisa set `budget_max` sendiri secara manual dari Settings — tidak harus persentase dari ideal. Contoh: ideal Rp 3.500.000, max Rp 4.200.000 (20% lebih tinggi).

#### Budget Indicator di UI

Setiap hunian ditampilkan dengan indikator posisi terhadap budget:

```
Rp 4.100.000/bln  🟡 103% dari ideal
```

| Dot | Zona | Kondisi |
|-----|------|---------|
| 🟢 Hijau | Comfort / Ideal | ≤ budget_ideal |
| 🟡 Kuning | Stretch | budget_ideal < harga ≤ budget_max |
| 🔴 Merah | Over | > budget_max |

#### Budget Overview di Dashboard

Card ringkas yang selalu muncul di atas list hunian:

```
┌──────────────────────────────────────────┐
│ Budget Kamu                              │
│ Ideal: Rp 3.500.000 · Maks: Rp 4.200.000│
│ ────────────────────────────────────── │
│ 🟢 3 dalam budget ideal                 │
│ 🟡 2 di stretch zone                   │
│ 🔴 1 melebihi batas                    │
└──────────────────────────────────────────┘
```

#### Budget Setup — Onboarding

Saat pertama kali buka app atau belum set budget, muncul wizard singkat:

```
Berapa budget per bulan yang nyaman?
[Rp ________] ← budget_ideal
"Di angka ini kamu tidak perlu khawatir."

Berapa batas yang benar-benar tidak bisa dilampaui?
[Rp ________] ← budget_max
"Di atas ini, tidak bisa negosiasi."
```

---

### 7.3 Kalkulasi Biaya & Upfront Cost

**Estimasi total per bulan** — all-in, ini yang dipakai scoring. Bukan harga sewa pokok.

**Upfront cost** — ditampilkan prominan, tidak masuk skor tapi wajib tampil:

```
Upfront Cost (estimasi):
  Deposit         : Rp 4.000.000  (2 bulan)
  Biaya masuk lain: Rp 500.000
  ─────────────────────────────────
  Total cash out  : Rp 4.500.000

  + Bulan pertama : Rp 2.050.000
  ─────────────────────────────────
  Total awal      : Rp 6.550.000
```

---

### 7.4 Sistem Scoring

5 dimensi berbobot, dapat dikonfigurasi user. Default:

| Dimensi | Bobot Default | Sumber Data |
|---------|--------------|------------|
| Harga (vs budget) | 30% | Form — pakai segmented curve |
| Jarak kantor | 25% | Auto-calculate Haversine |
| Kondisi fisik | 20% | Full Survey |
| Lingkungan & keamanan | 10% | Full Survey (manual) |
| Livability (GIS) | 15% | GIS — aktif jika lokasi verified |

Jika lokasi belum verified atau GIS belum tersedia: bobot 15% livability diredistribusi ke 4 dimensi lain.

---

#### Mekanisme Scoring Harga — Segmented Curve

Scoring harga menggunakan `monthly_total` (all-in) dibandingkan zona budget user.

```
Skor
100 │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 75 │                ╲▓▓▓▓▓▓▓▓▓
 40 │                          ╲▓▓▓▓▓
  0 │                                ╲▓▓
    └────────────────────────────────────→ harga
        0%     70%    100%  100%   >130%
               ideal  ideal  max   max
               budget budget
```

| Zona | Kondisi | Skor |
|------|---------|------|
| Comfort | `monthly_total` < 70% `budget_ideal` | 100 |
| Ideal | 70–100% `budget_ideal` | 100 → 75 (linear) |
| Stretch | 100% `budget_ideal` s/d `budget_max` | 75 → 40 (linear) |
| Over (ringan) | `budget_max` s/d 130% `budget_max` | 40 → 0 (linear) |
| Over (berat) | > 130% `budget_max` | 0 (hard cap) |

**Kenapa tidak langsung 0 di atas budget_max:** Hunian yang sedikit over budget bisa tetap worth it jika dimensi lain sangat unggul. Scoring memberi kesempatan itu muncul dalam perbandingan.

---

#### Mekanisme Scoring Jarak

Dihitung otomatis dari koordinat via **Haversine formula** (pure JS, no API).

| Jarak | Skor |
|-------|------|
| 0–3 km | 100 |
| 3–8 km | 100 → 70 (linear) |
| 8–15 km | 70 → 30 (linear) |
| > 15 km | 30 (minimum, tidak nol) |

**Catatan commute:** Jarak ≠ waktu tempuh. Field `commute_time_minutes` tersedia sebagai input opsional di Full Survey untuk masa depan.

---

#### Mekanisme Scoring Kondisi Fisik

Rata-rata dari field kondisi yang diisi: `condition_score` (1–5), `furnish_type`, AC, dll. Field kosong tidak mengurangi skor.

---

#### Mekanisme Scoring Lingkungan

Checklist positif dari input manual: keamanan komplek, akses transportasi, banjir, lingkungan. Skor akumulatif.

**Contract mismatch flag:** Jika `planned_stay_months` di UserConfig lebih pendek dari `min_contract` hunian → warning muncul di card dan detail view. Tidak mempengaruhi skor tapi wajib ditampilkan.

---

#### Mekanisme Scoring Livability (GIS)

Komposit dari POI Radar + Transit Score + Walkability Score. Hanya aktif jika `location_accuracy = verified`. Tersedia penuh di v1.1.

---

#### Output Skor

- Skor total: 0–100
- Breakdown per dimensi
- Label: Sangat Direkomendasikan / Direkomendasikan / Perlu Pertimbangan / Tidak Direkomendasikan
- Budget zone indicator (warna dot)
- Worth It Consideration jika terpicu (lihat section 8.8)

---

### 7.5 Dashboard

```
┌──────────────────────────────────────────┐
│ Budget Overview (selalu tampil)          │
│ Ideal: Rp 3.5jt · Maks: Rp 4.2jt        │
│ 🟢 3 ideal · 🟡 2 stretch · 🔴 1 over   │
└──────────────────────────────────────────┘

[Card Hunian 1]  — skor 87 · 🟡 103% dari ideal
[Card Hunian 2]  — skor 82 · 🟢 89% dari ideal
[Card Hunian 3]  — skor 71 · 🟡 112% dari ideal
...
```

- Sort: skor tertinggi (default) / harga terendah / jarak terdekat / tanggal
- Filter: tipe, status, zona budget, lokasi verified/belum, full survey selesai/belum
- Badge "Worth It Pick" untuk skor ≥ 80
- Badge "Full Survey belum lengkap" per card
- Tombol "Lihat Semua di Peta"

---

### 7.6 Compare View

- Pilih 2–4 hunian, side-by-side
- Highlight: field terbaik (hijau) / terburuk (merah muted)
- Baris **Upfront Cost** selalu di paling atas
- Baris **Budget Position** di bawah upfront cost:
  ```
  Budget Position    🟢 89%    🟡 103%   🔴 128%
  ```
- Radar chart 5 dimensi scoring
- GIS data jika lokasi verified
- Export: screenshot

---

### 7.7 Konfigurasi

- Set lokasi kantor (koordinat atau alamat, geocode via Nominatim)
- **Budget dual-threshold**: budget_ideal + budget_max (wizard saat pertama kali)
- **Stretch zone**: persentase dari budget_ideal (default: 20%, range: 10–50%)
- Bobot scoring 5 dimensi (slider, total 100%)
- Rencana lama tinggal (`planned_stay_months`) — untuk contract mismatch detection
- Sinkronisasi: status + manual trigger + log

---

### 7.8 Status Hunian

| Status | Arti |
|--------|------|
| `Aktif` | Masih dalam pertimbangan |
| `Survei Lanjut` | Mau survey kedua kali |
| `Favorit` | Kandidat kuat |
| `Sudah Diambil` | Tidak tersedia lagi |
| `Dicoret` | Tidak layak dilanjutkan |
| `Dipilih` | Final decision |

Hunian dengan status `Dicoret` dan `Sudah Diambil` dikecualikan dari kalkulasi rata-rata dan compare baseline.

---

### 7.9 Foto Terstruktur Per Area

Foto dikelompokkan per **slot kategori**, bukan upload bebas. **2 slot wajib** per tipe — tidak blocking tapi ada warning jika kosong saat submit.

Setiap slot: 1–5 foto, compress di client (Canvas API, max 500KB, JPEG) sebelum upload ke Supabase Storage via photo_upload_queue.

#### Slot Foto — Kontrakan Rumah

| Slot | Label | Status |
|------|-------|--------|
| `front_exterior` | Tampak Depan / Fasad | ✅ Wajib |
| `living_room` | Ruang Tamu | ✅ Wajib |
| `kitchen` | Dapur | Recommended |
| `bedroom_[n]` | Kamar Tidur (dinamis) | Recommended |
| `bathroom_[n]` | Kamar Mandi (dinamis) | Recommended |
| `parking` | Area Parkir | Recommended |
| `laundry_area` | Area Cuci / Jemur | Opsional |
| `frontyard` | Halaman Depan | Opsional |
| `backyard` | Halaman Belakang | Opsional |
| `electricity_meter` | Meteran Listrik | Opsional |
| `ceiling_condition` | Kondisi Plafon / Atap | Opsional |
| `damage_notes` | Kerusakan yang Ditemukan | Opsional + reminder prompt |
| `neighborhood` | Lingkungan Sekitar | Opsional |

#### Slot Foto — Apartemen

| Slot | Label | Status |
|------|-------|--------|
| `building_exterior` | Tampak Gedung | ✅ Wajib |
| `living_area` | Ruang Utama (Living Area) | ✅ Wajib |
| `lobby` | Lobby Gedung | Recommended |
| `corridor` | Koridor / Lorong | Recommended |
| `kitchen` | Dapur / Pantry | Recommended |
| `bedroom_[n]` | Kamar Tidur (dinamis) | Recommended |
| `bathroom_[n]` | Kamar Mandi (dinamis) | Recommended |
| `view` | View dari Jendela / Balkon | Recommended |
| `balcony` | Balkon | Opsional |
| `parking` | Area Parkir | Opsional |
| `lift` | Lift / Elevator | Opsional |
| `facilities` | Fasilitas Gedung | Opsional |
| `damage_notes` | Kerusakan yang Ditemukan | Opsional + reminder prompt |
| `neighborhood` | Lingkungan Sekitar | Opsional |

#### Slot Foto — Kost

| Slot | Label | Status |
|------|-------|--------|
| `front_exterior` | Tampak Depan / Gerbang | ✅ Wajib |
| `bedroom` | Kamar (min. 2 sudut) | ✅ Wajib |
| `bathroom` | Kamar Mandi | Recommended |
| `shared_kitchen` | Dapur Bersama | Opsional |
| `shared_living` | Ruang Tamu Bersama | Opsional |
| `laundry_area` | Area Cuci / Jemur | Opsional |
| `parking` | Area Parkir | Opsional |
| `damage_notes` | Kerusakan yang Ditemukan | Opsional + reminder prompt |
| `neighborhood` | Lingkungan Sekitar | Opsional |

Slot dinamis (kamar tidur, kamar mandi) muncul otomatis sesuai input jumlah kamar di Full Survey.

Video: maks 2 video per hunian, 200 MB/video, MP4/MOV, simpan di OPFS (local only, v1.1).

---

### 7.10 Map View

#### Multi-Titik Dashboard Map
- Semua hunian sebagai pin — berwarna sesuai skor (verified) atau abu-abu transparan (approximate)
- Klik pin → popup: nama, tipe, harga all-in, budget dot, skor
- Pin bintang: lokasi kantor user
- Berguna untuk **plan urutan survey** sebelum berangkat

#### Location Accuracy

| Status | Sumber | Akurasi | GIS |
|--------|--------|---------|-----|
| `approximate` | Geocoding teks (Nominatim) | ±100–500m | Disabled |
| `verified` | GPS browser / Google Maps link | ±5–20m | Fully enabled |

Pre-survey tracking: hunian bisa ditambahkan hanya dengan nama + tipe + alamat — sebelum survey, untuk planning peta.

#### Detail Map
- Container overlay GIS di halaman detail hunian
- Toggle layer: POI / Flood / Isochrone / Noise

---

### 7.11 Offline & Sync Architecture

**Local-first**: semua CRUD ke IndexedDB dulu, Supabase adalah sync target.

#### Dual Storage

| Data | Local | Cloud | Sync |
|------|-------|-------|------|
| Property data | IndexedDB (Dexie.js) | Supabase PostgreSQL | ✅ Dua arah |
| Foto | OPFS (blob) | Supabase Storage | ✅ Upload queue |
| Video | OPFS (blob) | — | ❌ Local only |
| AI cache | IndexedDB | — | ❌ Local only |
| GIS cache | IndexedDB | — | ❌ Local only |

#### Sync Triggers

**Otomatis:** App launch, `online` event, tab focus, interval 5 menit.
**Manual:** Tombol "Sync Sekarang" di header dan Settings.

#### Sync States

| State | Arti | UI |
|-------|------|-----|
| `synced` | Local == server | Tidak ada badge |
| `pending` | Ada perubahan belum push | Badge abu-abu kecil |
| `conflict` | Keduanya berubah | Badge merah + dialog resolusi |

**Conflict resolution:** Last-write-wins berbasis `updated_at`. Jika conflict, user ditampilkan dialog pilihan eksplisit.

#### Yang Tetap Berjalan Offline
✅ Semua CRUD + scoring + dashboard + compare + map (tiles cached Service Worker)
❌ AI features, GIS features, foto upload (masuk queue)

---

## 8. AI-Powered Features

Semua AI calls via **Next.js API Route `/api/ai`** (Vercel). API key OpenAI GPT-4o mini aman di server. Fallback graceful jika error.

---

### 8.1 Text-to-Form Extraction *(v1.0)*

**Entry:** Tombol "Paste Deskripsi" sebelum Quick Survey.
**Input:** Caption IG/TikTok, forward WA, teks apapun.
**Flow:** Teks → LLM → JSON fields dengan confidence score → pre-fill form. Field confidence < 0.7 di-highlight kuning.
**Cost:** ~$0.001–0.002/call.

---

### 8.2 Link Extraction via Jina AI *(v1.0)*

**Entry:** Tombol "Paste URL".
**Supported:** Mamikos, OLX, Rumah.com, Lamudi, 99.co.
**Flow:** URL → `r.jina.ai/{url}` → markdown → LLM → JSON → pre-fill form.
**Cost:** Jina gratis + ~$0.002–0.004/call.

---

### 8.3 Smart Notes & Red Flags *(v1.1)*

**Entry:** Auto-trigger setelah Full Survey submit. Bisa refresh manual.
**Output:**
- 🚩 Red Flags — potensi masalah dari data yang ada
- ⚠️ Missing Info — field penting yang masih kosong
- 💡 Insights — komparasi vs hunian lain di daftar (termasuk posisi budget)
**Cost:** ~$0.002–0.004/call.

---

### 8.4 Contextual Question Checklist *(v1.1)*

**Entry:** Tombol "Apa yang belum ditanyakan?" di form atau detail view.
**Output:** Daftar pertanyaan spesifik dan kontekstual per tipe properti, dari field yang terisi + kosong. Bukan generic checklist.
**Cost:** ~$0.001/call.

---

### 8.5 Summary untuk Pasangan *(v1.1)*

**Entry:** Tombol "Buat Ringkasan" di dashboard (≥ 2 hunian).
**Output:** Narrative WhatsApp-ready, ranked 🏆🥈🥉, pro/con per kandidat, posisi budget per hunian, rekomendasi akhir. Bahasa santai.
**Cost:** ~$0.003–0.005/call.

---

### 8.6 Neighborhood Intelligence *(v1.3)*

**Entry:** Tombol "Cek Area" di detail hunian.
**Flow:** Alamat/area → Jina fetch berita banjir + infrastruktur → LLM aggregate → structured summary.
**Cost:** ~$0.005–0.010/call.

---

### 8.7 Negotiation Script Generator *(v1.3)*

**Entry:** Tombol "Siapkan Argumen Nego" di detail hunian.
**Input:** Data kondisi fisik + catatan + posisi budget + `budget_ideal`.
**Output:** Target harga realistis + 3–6 argumen per kategori (kondisi fisik, komitmen kontrak, harga pasaran, alternatif diskon).
**Cost:** ~$0.003–0.005/call.

---

### 8.8 Worth It Consideration *(v1.0)*

**Bukan AI call berbayar** — ini logic berbasis data lokal + template. Insight otomatis yang muncul tanpa user harus minta.

#### Trigger Conditions

Semua kondisi berikut harus terpenuhi:

1. `budget_zone = stretch` ATAU `monthly_total ≤ 110% × budget_max` (sedikit over)
2. `score ≥ 75` (hunian berkualitas, layak dipertimbangkan meski mahal)
3. Ada minimal 1 dimensi skor yang ≥ 85 (ada keunggulan nyata)

#### Output Format

```
⚡ Worth It Consideration

Rp 350.000/bulan di atas budget ideal kamu.
Tapi ini hunian dengan skor tertinggi dari yang kamu survey (87/100).

Kenapa mungkin masih worth it:
• Walkability 88/100 — minimarket & masjid dalam 5 mnt jalan kaki
  → Hemat biaya ojol harian ±Rp 150.000/bulan
• Jarak kantor terpendek — 4.2 km
  → Hemat bensin ±Rp 200.000/bulan vs rata-rata daftarmu
• Kondisi fisik 5/5 — tidak perlu keluar biaya renovasi awal

Estimasi penghematan dari keunggulan ini: ±Rp 350.000/bulan
→ Selisih budget bisa netral secara finansial.
```

**Logic penghematan** dihitung dari data lokal:
- Walkability tinggi → estimasi hemat ojol (Rp 150rb/bulan asumsi default, dapat dikonfigurasi)
- Jarak lebih dekat vs rata-rata → estimasi hemat bensin (Rp per km, dikonfigurasi)
- Kondisi fisik 5/5 vs rata-rata → tidak ada biaya perbaikan awal

Jika user mau analisis lebih dalam, tombol "Analisis Lebih Lanjut" memanggil LLM dengan konteks penuh (~$0.003/call).

---

### 8.9 Price Fairness Check *(v3.0)*

**Entry:** Tombol "Cek Harga Pasaran".
**Flow:** Jina scrape Mamikos/OLX → LLM parse → range pasar + percentile posisi harga.
**Defer:** Maintenance cost scraping tinggi, hasil bisa misleading jika scraping parsial.
**Cost:** ~$0.005–0.008/call.

---

## 9. GIS Features

Semua GIS calls via **Next.js API Route `/api/gis`** — bukan direct dari browser. Rate limit terpusat, caching di IndexedDB.

GIS aktif hanya jika `location_accuracy = verified`.

---

### 9.1 POI Radar *(v1.1)*

Query POI dalam radius 1–3 km via Overpass API.

| Kategori | Radius |
|----------|--------|
| Masjid / musola | 1 km |
| Minimarket / supermarket | 1 km |
| RS / klinik / puskesmas | 3 km |
| Apotek | 1 km |
| Sekolah | 2 km |
| SPBU | 2 km |
| ATM / Bank | 1 km |
| Halte bus / TransJakarta | 1 km |
| Stasiun KRL | 3 km |
| Pasar tradisional | 2 km |
| Kantor polisi / pos polisi | 3 km |

Output: list per kategori (nama, jarak) + pin per layer di peta.

---

### 9.2 Flood Susceptibility Estimate *(v1.2)*

**Label "Estimate"** — bukan "Risk" — karena tidak mempertimbangkan tanggul dan drainase. Disclaimer wajib di setiap output.

**Sinyal 1 — Elevasi (Open Elevation API):**
- > 15m dpl → Rendah
- 5–15m dpl → Sedang
- < 5m dpl → Tinggi

**Sinyal 2 — Proximity ke waterway (OSM):**
- < 200m → +Tinggi
- 200–500m → +Sedang
- > 500m → Neutral

Output: level (Rendah/Sedang/Tinggi) + breakdown + disclaimer wajib.

---

### 9.3 Area Activity Indicator *(v1.2)*

**Bukan Crime Indicator.** Tidak ada terminologi "kriminalitas" atau "bahaya." Mengukur kepadatan aktivitas dan infrastruktur keamanan dari OSM.

**Komponen:**
- Jarak ke polsek / pos polisi
- Kepadatan permukiman
- Proximity ke jalan arteri
- Kepadatan POI aktif (warung, toko)
- Area industrial terisolir (flag negatif)

Output: deskriptif + disclaimer "bukan data kriminalitas resmi."

---

### 9.4 Isochrone Map *(v1.2)*

Area yang bisa dicapai dari lokasi dalam waktu tertentu (OpenRouteService).

- 🟢 15 menit jalan kaki
- 🟡 30 menit motor

Ditampilkan sebagai polygon overlay di peta Leaflet. Bisa di-overlay dengan POI Radar.

---

### 9.5 Transit Score *(v1.1)*

Skor 0–100 aksesibilitas transportasi umum.

| Komponen | Poin Maks |
|----------|-----------|
| Halte bus dalam 500m | 30 |
| Stasiun KRL dalam 3 km | 40 |
| Angkutan feeder | 15 |
| Akses jalan arteri | 15 |

Masuk sebagai komponen Livability Score.

---

### 9.6 Noise Risk Map *(v1.2)*

Proxy kebisingan dari OSM.

| Sumber | Radius | Level |
|--------|--------|-------|
| Jalan tol | < 300m | Tinggi |
| Jalan arteri | < 100m | Sedang |
| Rel kereta | < 200m | Tinggi |
| Pasar tradisional | < 150m | Sedang |
| Area industri | < 500m | Tinggi |

---

### 9.7 Walkability Score *(v1.1)*

Skor 0–100 berbasis kepadatan POI dalam jangkauan kaki.

| Kategori | Poin Maks |
|----------|-----------|
| Minimarket / warung | 20 |
| Masjid | 15 |
| Apotek | 15 |
| Klinik / puskesmas | 15 |
| ATM / bank | 10 |
| Pasar / supermarket | 15 |
| Sekolah | 10 |

Masuk sebagai komponen Livability Score. Juga dipakai sebagai input kalkulasi penghematan di Worth It Consideration.

---

### 9.8 Area Brief — GIS + LLM Synthesis *(v1.3)*

Semua data GIS + Neighborhood Intelligence di-synthesize LLM jadi narasi ringkas: Kelebihan / Perhatian / Kesimpulan.

Format output:
```
Area Brief — [Nama Area]

KELEBIHAN
✅ ...

PERHATIAN
⚠️ ...

KESIMPULAN
[2–3 kalimat ringkas]

[Data GIS: Juni 2026 | Estimasi berbasis data publik, bukan survei resmi]
```

**Cost:** ~$0.008–0.015/call.

---

## 10. User Stories

```
Sebagai pencari hunian,
saya ingin menyelesaikan input data dalam 30 detik saat masih di lokasi,
supaya tidak ada hunian yang terlewat karena form terlalu panjang.

Sebagai pencari hunian,
saya ingin set dua threshold budget — ideal dan maksimum,
supaya aplikasi bisa membedakan "lebih mahal dari nyaman" dan "benar-benar tidak mampu."

Sebagai pencari hunian,
saya ingin tahu posisi setiap hunian terhadap budget saya di satu pandangan,
supaya bisa langsung filter secara finansial tanpa harus hitung manual.

Sebagai pencari hunian,
saya ingin ada peringatan otomatis kalau hunian sedikit di atas budget tapi skornya tinggi,
supaya tidak asal coret padahal sebenarnya worth it secara total.

Sebagai pencari hunian,
saya ingin paste teks caption IG atau forward WA,
supaya form terisi otomatis tanpa ngetik ulang.

Sebagai pencari hunian,
saya ingin paste URL listing Mamikos atau OLX,
supaya data langsung masuk ke form tanpa copy manual.

Sebagai pencari hunian,
saya ingin lihat semua kandidat di satu peta sekaligus,
supaya bisa plan urutan survey dan bandingkan posisi ke kantor.

Sebagai pencari hunian,
saya ingin ambil GPS saat tiba di lokasi,
supaya data GIS langsung aktif.

Sebagai pencari hunian,
saya ingin tahu total biaya all-in dan upfront cost sekaligus,
supaya bisa bandingkan beban finansial yang sesungguhnya.

Sebagai pencari hunian,
saya ingin aplikasi tetap berjalan saat tidak ada sinyal,
supaya saya bisa input data di lokasi survey tanpa khawatir koneksi.

Sebagai pencari hunian,
saya ingin generate ringkasan untuk dikirim ke pasangan,
supaya keputusan bisa dibuat bersama dengan basis data yang sama.

Sebagai pencari hunian,
saya ingin mendapat argumen nego berbasis data kondisi fisik,
supaya bisa nego dengan percaya diri dan bukan asal tawar.
```

---

## 11. Data Model

### `properties` (Supabase + IndexedDB)

```
id                    uuid (PK)
user_id               uuid (FK → auth.users)
label                 text
type                  text — kontrakan | apartemen | kost

-- Lokasi
address               text
maps_link             text (nullable)
latitude              float (nullable)
longitude             float (nullable)
location_accuracy     text — approximate | verified
location_source       text — geocoded | gps | maps_link (nullable)
location_radius_m     integer (nullable)

-- Jarak (calculated)
distance_km           float (nullable) — Haversine dari koordinat kantor
commute_time_minutes  integer (nullable) — input manual opsional

-- Harga
price_base            integer (IDR)
price_period          text — daily | monthly | yearly
monthly_total         integer (calculated) — all-in per bulan
upfront_cost          integer (calculated) — deposit + biaya masuk

-- Budget (calculated dari UserConfig)
budget_zone           text — comfort | ideal | stretch | over
budget_ratio          float — monthly_total / budget_ideal

-- Kondisi Fisik
area_sqm              integer (nullable)
bedrooms              integer (nullable)
bathrooms             integer (nullable)
condition_score       integer 1–5 (nullable)
furnish_type          text — unfurnished | semi | furnished (nullable)

-- Lingkungan (manual)
security_level        text — satpam24 | one_gate | none (nullable)
noise_level           text — quiet | mixed | noisy (nullable)
flood_history         text — never | yes | unknown (nullable)
extra_rules           text[] (nullable)

-- Kontrak & Admin
available_periods     text[] — [monthly, 3months, 6months, yearly]
min_contract          text (calculated — terpendek dari available_periods)
deposit_months        integer (nullable)
contact_name          text (nullable)
contact_phone         text (nullable)
listing_source        text — mamikos | olx | marketplace | referral | other (nullable)
extra_costs           jsonb — [{label, amount}]

-- Dokumentasi
photo_slots           jsonb — array of PhotoSlot
notes                 text (nullable)
survey_date           date (nullable)

-- Form Progress
quick_survey_done     boolean (default: false)
full_survey_done      boolean (default: false)

-- Sync
sync_status           text — synced | pending | conflict (default: pending)
local_updated_at      timestamptz
server_updated_at     timestamptz (nullable)

-- Status & Scoring
status                text — active | revisit | favorite | taken | rejected | chosen
score                 float (nullable — null jika quick survey saja)
score_breakdown       jsonb — {price, distance, condition, environment, livability}
worth_it_flag         boolean — true jika Worth It Consideration aktif

created_at            timestamptz
updated_at            timestamptz
```

---

### `PhotoSlot` (embedded di `photo_slots` jsonb)

```
category    text — front_exterior | living_room | bedroom_1 | dst
label       text — human readable
required    boolean
files       text[] — OPFS paths (local) atau Supabase URLs (uploaded)
captions    text[] (nullable)
slot_order  integer
```

---

### Type-Specific Fields

Disimpan di tabel terpisah atau JSONB column di `properties`:

**`property_kontrakan`:**
```
electricity     text — token | tagihan_pln
water_source    text — pam | sumur | galon
kebersihan_rt   integer (nullable)
keamanan_rt     integer (nullable)
pbb_tanggungan  text — pemilik | penyewa (nullable)
parking         text — free | paid | none (nullable)
parking_cost    integer (nullable)
ac_available    boolean (nullable)
```

**`property_apartemen`:**
```
ipl_include       boolean
ipl_cost          integer (nullable)
sc_include        boolean
sc_cost           integer (nullable)
sinking_fund      integer (nullable)
elec_include      boolean
elec_type         text (nullable)
elec_estimate     integer (nullable)
water_include     boolean
water_estimate    integer (nullable)
internet_include  boolean
internet_estimate integer (nullable)
parking_motor     integer (nullable)
parking_mobil     integer (nullable)
ac_status         text — include | sewa | tidak_ada
ac_service_cost   integer (nullable)
floor_number      integer (nullable)
facing            text (nullable)
```

**`property_kost`:**
```
elec_include      boolean
elec_type         text (nullable)
elec_estimate     integer (nullable)
water_include     boolean
wifi_available    boolean
meal_include      boolean
meal_frequency    text (nullable)
laundry           text — include | bayar_per_kg | tidak_ada
bathroom_type     text — private | sharing
kitchen_access    text — boleh | sharing | tidak_ada
parking           text (nullable)
parking_cost      integer (nullable)
```

---

### `user_config` (Supabase + IndexedDB)

```
user_id               uuid (PK, FK → auth.users)
office_address        text (nullable)
office_lat            float (nullable)
office_lng            float (nullable)

-- Budget dual-threshold
budget_ideal          integer — angka nyaman per bulan (all-in)
budget_max            integer — batas absolut per bulan (all-in)
stretch_zone_pct      integer (default: 20) — % dari budget_ideal sebagai zona stretch
                      Note: default budget_max = budget_ideal × (1 + stretch_zone_pct/100)

-- Rencana tinggal
planned_stay_months   integer (nullable)

-- Scoring weights
weight_price          integer (default: 30)
weight_distance       integer (default: 25)
weight_condition      integer (default: 20)
weight_environment    integer (default: 10)
weight_livability     integer (default: 15)

-- Worth It Consideration settings
worth_it_min_score    integer (default: 75)
worth_it_ojol_savings integer (default: 150000) — estimasi hemat ojol/bulan jika walkability tinggi
worth_it_fuel_per_km  integer (default: 1500) — estimasi biaya bensin per km
```

---

### `ai_outputs` (IndexedDB — local only)

```
id               text (UUID)
property_id      text (FK)
output_type      text — checklist | red_flags | neighborhood | negotiation | summary | worth_it_detail
content          json
input_hash       text
prompt_version   integer
model_used       text
generated_at     timestamptz
is_stale         boolean
```

---

### `gis_cache` (IndexedDB — local only)

```
id            text (UUID)
property_id   text (FK)
cache_type    text — poi | flood | activity | isochrone | transit | noise | walkability | area_brief
content       json
fetched_at    timestamptz
is_stale      boolean
```

---

### `sync_queue` (IndexedDB — local only)

```
id            text (UUID)
entity_type   text — property | photo_slot | user_config
entity_id     text
operation     text — create | update | delete
payload       json
created_at    timestamptz
retry_count   integer (default: 0)
last_error    text (nullable)
```

---

### `photo_upload_queue` (IndexedDB — local only)

```
id              text (UUID)
property_id     text
slot_category   text
local_path      text — OPFS file path
file_size_bytes integer
status          text — pending | uploading | uploaded | failed
retry_count     integer (default: 0)
created_at      timestamptz
uploaded_at     timestamptz (nullable)
supabase_url    text (nullable)
```

---

## 12. Tech Stack

Semua gratis kecuali OpenAI API (sudah ada key).

### Frontend

| Layer | Tool | Cost |
|-------|------|------|
| Framework | Next.js (App Router) | Gratis |
| Styling | Tailwind CSS | Gratis |
| State management | Zustand | Gratis |
| Chart | Recharts | Gratis |
| Peta | Leaflet.js | Gratis |
| Geospatial calc | Turf.js (browser) | Gratis |
| Hosting | Vercel (free tier) | Gratis |

### Storage — Dual Layer

| Layer | Tool | Isi | Cost |
|-------|------|-----|------|
| Local DB | Dexie.js (IndexedDB) | Property, queues, caches | Gratis |
| Local media | OPFS | Foto blob + video blob | Gratis |
| Cloud DB | Supabase PostgreSQL | Sync target | Gratis (500MB) |
| Cloud media | Supabase Storage | Foto (post-compress-upload) | Gratis (1GB) |
| Auth | Supabase Auth | Session | Gratis |
| Realtime | Supabase Realtime | Multi-device sync | Gratis |
| Offline cache | Next.js Service Worker | OSM tiles + app shell | Gratis |
| API Routes | Next.js API Routes | /api/ai + /api/gis | Gratis (Vercel) |

### AI

| Tool | Fungsi | Cost |
|------|--------|------|
| GPT-4o mini (OpenAI) | Semua LLM calls | ~$0.15/1M token |
| Jina AI (r.jina.ai) | Web reader URL extraction + berita | Gratis, rate limited |

### GIS

| Tool | Fungsi | Cost |
|------|--------|------|
| OpenStreetMap | Map tiles | Gratis |
| Nominatim | Geocoding | Gratis |
| Overpass API | POI query | Gratis |
| Open Elevation API | Ketinggian lokasi | Gratis |
| OpenRouteService | Isochrone | Gratis (2K req/hari) |

**Semua GIS API via `/api/gis`** — bukan direct dari browser. Rate limit terpusat, retry logic terpusat.

### Arsitektur

```
Browser (Next.js + Service Worker)
  |
  +-- IndexedDB (Dexie.js)          ← primary local store
  |     +-- properties
  |     +-- sync_queue
  |     +-- photo_upload_queue
  |     +-- ai_outputs (cache)
  |     +-- gis_cache
  |
  +-- OPFS                           ← binary storage
  |     +-- foto → compress → upload queue → Supabase Storage
  |     +-- video → local only
  |
  +-- Sync Manager
  |     +-- online event → flush sync_queue → Supabase
  |     +-- online event → flush photo_queue → Supabase Storage
  |     +-- Supabase Realtime → pull → IndexedDB
  |
  +-- POST /api/ai                   ← OpenAI + Jina
  +-- POST /api/gis                  ← Overpass/Nominatim/OES/ORS

Supabase (Cloud sync target)
  +-- PostgreSQL, Storage, Auth, Realtime
```

### Estimasi Cost per Bulan

| Item | Monthly |
|------|---------|
| OpenAI: extraction 20x | $0.04 |
| OpenAI: checklist + smart notes 25x | $0.05 |
| OpenAI: summary + nego 10x | $0.05 |
| OpenAI: neighborhood + area brief 10x | $0.10 |
| Worth It detail (opsional) 5x | $0.015 |
| Semua infra, GIS | $0.00 |
| **Total** | **~$0.26/bulan** |

---

## 13. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| Quick Survey | Selesai ≤ 30 detik di HP |
| Load time | < 2 detik FCP |
| Offline | Semua core features jalan tanpa internet |
| Sync otomatis | Push ke Supabase < 30 detik setelah online |
| Sync manual | Selesai < 10 detik untuk < 20 record |
| Conflict detection | Berbasis updated_at, dialog eksplisit ke user |
| Mobile | Optimal di 375px |
| Worth It Consideration | Kalkulasi lokal < 100ms, tanpa API call |
| Budget scoring | Re-kalkulasi otomatis jika budget_ideal/max berubah |
| Foto upload | Maks 5/slot, compress → max 500KB, JPEG |
| Foto wajib | 2 slot, warning jika kosong, tidak blocking |
| Video | v1.1, OPFS local only |
| Jarak | Haversine, < 1ms |
| Scoring | Real-time saat form diisi, < 100ms |
| GIS load | < 10 detik setelah lokasi verified |
| GIS cache | Tidak re-fetch jika koordinat sama |
| AI response | < 5 detik extraction/generation |
| AI cache | Invalidasi via input_hash + prompt_version |
| Map | Render 50+ pin tanpa lag |
| Photo queue retry | Maks 3x, exponential backoff |
| Sync queue retry | Maks 5x, log jika gagal semua |

---

## 14. Wireframe Alur

```
[Header Global]
  [● Online — Tersinkron 2 mnt lalu] [↻]
  [● Offline — 4 perubahan pending  ]

[Dashboard]
  ┌─────────────────────────────────┐
  │ Budget Overview                 │
  │ Ideal: Rp 3.5jt · Maks: Rp 4.2jt│
  │ 🟢3 ideal · 🟡2 stretch · 🔴1  │
  └─────────────────────────────────┘
  [Card] skor 87 · 🟡 103% · ⚡Worth It
  [Card] skor 82 · 🟢 89%
  [Card] skor 71 · 🟡 112%
  [Card] skor 54 · 🔴 128%
  [Lihat di Peta]

[Tambah Hunian]
  A: "Paste Deskripsi" → Text-to-Form → Quick Survey pre-fill
  B: "Paste URL" → Link Extraction → Quick Survey pre-fill
  C: Manual → Quick Survey (6 field + 2 foto wajib)
     → Simpan → Dashboard
     → "Lanjut Full Survey?" → 5 tab

[Detail Hunian]
  Header: nama · tipe · harga all-in · upfront cost · skor · budget dot
  Mini map + [Verifikasi Lokasi] (jika approximate)
  Tab: Overview | Biaya | Kondisi | Foto | GIS | AI

  ⚡ Worth It Consideration (jika triggered — auto, tanpa tap)
     Rp Xrb/bulan di atas ideal · skor tertinggi di daftarmu
     [alasan berbasis data lokal]
     [Analisis Lebih Lanjut →] (panggil LLM jika diminta)

  GIS Tab (aktif setelah verified):
    POI Radar (v1.1) | Walkability + Transit (v1.1)
    Flood Estimate (v1.2) | Noise (v1.2)
    Isochrone (v1.2) | Area Activity (v1.2)

  AI Tab:
    Smart Notes + Red Flags (v1.1)
    Checklist (v1.1)
    Neighborhood (v1.3)
    Nego Script (v1.3)

[Compare View]
  Baris 1: Upfront Cost
  Baris 2: Budget Position  🟢89%  🟡103%  🔴128%
  Baris 3–N: semua field
  Radar chart 5 dimensi

[Settings]
  Lokasi kantor
  Budget:
    Ideal: [Rp _____]
    Maks:  [Rp _____]
    Stretch zone: [20]%
  Rencana tinggal: [__] bulan
  Bobot scoring (5 slider, total 100%)
  Worth It: min skor [75] · estimasi hemat ojol [Rp 150rb] · bensin [Rp 1.500/km]
  Sinkronisasi: status · log · [Sync Sekarang]
```

---

## 15. Iteration Plan

### v1.0 — Core Foundation (3–4 minggu)
- CRUD: Quick Survey + Full Survey
- Budget dual-threshold + stretch zone + zona indicator
- Kalkulasi all-in + upfront cost
- **Worth It Consideration** (logic lokal, no LLM)
- Scoring 5 dimensi dengan segmented curve per zona budget
- Contract mismatch detection (planned_stay vs min_contract)
- Dashboard + Budget Overview + filter
- Compare view + budget indicator baris
- Map multi-titik + location accuracy
- Pre-survey tracking
- Foto terstruktur (2 wajib + compress ke Supabase)
- Offline-first: IndexedDB + sync_queue + photo_upload_queue
- Supabase Auth + Realtime
- AI: Text-to-Form Extraction (GPT-4o mini)
- AI: Link Extraction via Jina AI
- Next.js API Routes `/api/ai` + `/api/gis`

### v1.1 — GIS Dasar + AI Intelligence (2–3 minggu)
- POI Radar + Walkability Score + Transit Score
- Livability Score aktif (komposit)
- AI: Smart Notes + Red Flags
- AI: Contextual Question Checklist
- AI: Summary untuk Pasangan
- Video upload (OPFS, local only)

### v1.2 — GIS Lanjutan (2 minggu)
- Flood Susceptibility Estimate
- Noise Risk Map
- Isochrone Map (OpenRouteService)
- Area Activity Indicator

### v1.3 — AI Lanjutan + GIS Synthesis (2 minggu)
- AI: Neighborhood Intelligence (Jina + LLM)
- AI: Negotiation Script Generator
- Area Brief (GIS + LLM Synthesis)
- Worth It "Analisis Lebih Lanjut" via LLM

### v2.0 — Share & Export (2 minggu)
- Share link ke pasangan (view-only, tanpa login)
- Export PDF laporan perbandingan
- Export CSV

### v3.0 — Price Intelligence (TBD)
- Price Fairness Check
- Defer — maintenance scraping tinggi

---

## 16. Open Questions

- [ ] Budget Overview di dashboard: apakah perlu mini chart distribusi (histogram) atau cukup angka count per zona?
- [ ] Worth It: estimasi hemat ojol dan bensin — pakai angka default di UserConfig atau input manual? Atau keduanya (default bisa di-override)?
- [ ] Contract mismatch: apakah warning cukup visual di card, atau perlu pop-up konfirmasi saat user mau set status ke "Favorit"?
- [ ] Score sementara (Quick Survey only): tampilkan skor parsial dengan label "Sementara" atau sembunyikan dulu sampai Full Survey selesai?
- [ ] Export PDF: template minimal (skor + harga + foto) atau bisa pilih field?
- [ ] Supabase free tier: apakah perlu monitoring usage alert sebelum mencapai 80% limit?
- [ ] GIS cache expiry: auto-refresh setelah 7 hari atau manual refresh saja?

---

## 17. Asumsi

- Lokasi kantor satu titik (tidak multi-office)
- Mata uang IDR
- Supabase Auth wajib dari v1.0 — data di server
- Multi-device sync otomatis via Supabase Realtime dari v1.0
- Video OPFS local only — tidak sync ke cloud
- Foto compress di client (Canvas API) sebelum upload
- Worth It Consideration adalah logic lokal (no LLM), LLM hanya jika user minta "Analisis Lebih Lanjut"
- Scoring parsial (Quick Survey only) ditampilkan dengan label "Skor Sementara"
- GIS dan AI bersifat opsional — core feature jalan tanpa keduanya
- Crime/kriminalitas tidak disebutkan sebagai label — diganti Area Activity Indicator
- Flood Susceptibility selalu ada disclaimer — bukan label definitif

---

## 18. Feature Map Lengkap

| # | Fitur | Kategori | Versi |
|---|-------|----------|-------|
| 1 | Quick Survey (6 field, ≤ 30 detik) | Core | v1.0 |
| 2 | Full Survey (5 tab, per tipe properti) | Core | v1.0 |
| 3 | Budget Dual-Threshold (ideal + max) | Core | v1.0 |
| 4 | Stretch Zone (configurable %) | Core | v1.0 |
| 5 | Budget Overview di Dashboard | Core | v1.0 |
| 6 | Budget Indicator per Card (dot + %) | Core | v1.0 |
| 7 | Budget Position di Compare View | Core | v1.0 |
| 8 | Kalkulasi Biaya All-in Otomatis | Core | v1.0 |
| 9 | Upfront Cost Display | Core | v1.0 |
| 10 | Scoring Harga Segmented Curve (per zona) | Core | v1.0 |
| 11 | Auto-Calculate Jarak via Haversine | Core | v1.0 |
| 12 | Scoring 5 Dimensi Berbobot | Core | v1.0 |
| 13 | Periode Kontrak Multi-Select + Mismatch Flag | Core | v1.0 |
| 14 | Dashboard + Filter + Sort | Core | v1.0 |
| 15 | Status Management | Core | v1.0 |
| 16 | Compare View + Radar Chart | Core | v1.0 |
| 17 | Map Multi-Titik | Core | v1.0 |
| 18 | Location Accuracy (Approximate vs Verified) | Core | v1.0 |
| 19 | Pre-Survey Tracking | Core | v1.0 |
| 20 | Foto Terstruktur Per Slot (2 wajib) | Core | v1.0 |
| 21 | Offline-First (IndexedDB local store) | Core | v1.0 |
| 22 | Sync Queue (auto + manual) | Core | v1.0 |
| 23 | Photo Upload Queue | Core | v1.0 |
| 24 | Sync Status Indicator + Conflict Resolution | Core | v1.0 |
| 25 | Supabase Auth + Realtime | Core | v1.0 |
| 26 | Worth It Consideration (logic lokal) | Core | v1.0 |
| 27 | Text-to-Form Extraction | AI | v1.0 |
| 28 | Link Extraction via Jina AI | AI | v1.0 |
| 29 | Smart Notes + Red Flags | AI | v1.1 |
| 30 | Contextual Question Checklist | AI | v1.1 |
| 31 | Summary untuk Pasangan | AI | v1.1 |
| 32 | Video Upload (OPFS, local) | Core | v1.1 |
| 33 | POI Radar | GIS | v1.1 |
| 34 | Walkability Score | GIS | v1.1 |
| 35 | Transit Score | GIS | v1.1 |
| 36 | Livability Score (komposit GIS) | GIS | v1.1 |
| 37 | Flood Susceptibility Estimate | GIS | v1.2 |
| 38 | Noise Risk Map | GIS | v1.2 |
| 39 | Isochrone Map | GIS | v1.2 |
| 40 | Area Activity Indicator | GIS | v1.2 |
| 41 | Neighborhood Intelligence | AI | v1.3 |
| 42 | Negotiation Script Generator | AI | v1.3 |
| 43 | Area Brief (GIS + LLM Synthesis) | GIS+AI | v1.3 |
| 44 | Worth It — Analisis Lanjut via LLM | AI | v1.3 |
| 45 | Share Link ke Pasangan (view-only) | Infra | v2.0 |
| 46 | Export PDF + CSV | Infra | v2.0 |
| 47 | Price Fairness Check | AI | v3.0 |
