---
name: slice2-prioritisasi
description: Analisis prioritas PM untuk Slice 2 Hunian — value/dep/effort tiap fase, urutan optimal, definisi Slice 2 MVP, dan rekomendasi 4 scope terbuka
metadata:
  type: project
---

# PM Assessment: Slice 2 Prioritisasi (2026-06-27)

## Konteks keputusan

Slice 1 selesai. Pipeline Kontrakan end-to-end jalan. Metric utama: **cycle completion rate → target 60%**. Faisal = solo builder, runway terbatas. Pilot = user dikenal personal, aktif. Slice 2 berisi 8 fase bernilai variatif — tujuan PM adalah memilih subset terkecil yang paling menggerakkan metric, bukan mengaktifkan semua placeholder.

---

## Tabel: Value × Dependensi × Effort

| Fase | Value ke cycle completion | Dependensi kunci | Effort | Catatan singkat |
|------|--------------------------|-------------------|--------|-----------------|
| S2-0 Aktivasi DB | Prasyarat (n/a) | — blokir S2-1/2/3 | S | Manual/DDL, bukan fitur |
| S2-2 Survey fisik 5D | **HIGH** | S2-0 | L | Satu-satunya fase yang menambah KUALITAS keputusan (2 dimensi baru) |
| S2-4 Negosiasi harga | MEDIUM | S2-0, schema siap | S | Final-stage commitment; kolom sudah ada, field tinggal diaktifkan |
| S2-1 Foto nyata | LOW-MEDIUM | S2-0 (bucket) | M | Visible win, mengurangi friction recall; tidak tambah dimensi keputusan |
| S2-5 Biaya all-in | MEDIUM | S2-0 (kolom ada) | M | Melengkapi dimensi Harga (40%) — sewa tanpa utilitas = perbandingan tidak apel-ke-apel |
| S2-6 Apartemen & Kost | MEDIUM-HIGH (expansi pasar) | S2-0, S2-2 | L | Market expansion, bukan kedalaman; risiko tinggi untuk solo builder |
| S2-7 POI rute asli | LOW-MEDIUM | S2-0 (tabel baru) | M | Incremental upgrade dari straight-line; ada biaya API recurring |
| S2-3 Timeline/events | LOW | S2-0; dampak naik bila S2-2/4 ada | M | Transparency feature; tidak bantu user memutuskan |
| S2-8 Pelengkap | LOW | Various | M | Enrichment; bukan penggerak completion |

**Effort scale:** S = beberapa jam–1 hari. M = 2–4 hari. L = 1–2 minggu (multi-komponen).

---

## Apakah Urutan yang Diusulkan (foto→survey→timeline→…) Optimal?

**Tidak optimal.** Alasan:

### Masalah utama urutan asli
Urutan asli menempatkan S2-1 (foto) sebelum S2-2 (survey). Logika tersembunyi: foto = effort lebih rendah, bisa ship lebih cepat. Tapi ini adalah logika **kecepatan ship**, bukan **nilai untuk completion rate**.

Survey (S2-2) adalah satu-satunya fase Slice 2 yang mengubah KUALITAS keputusan — menambah 2 dimensi (Kondisi, Owner) ke radar yang kini hanya 3D. Foto melengkapi UI placeholder tapi tidak menambah dimensi baru. Kalau harus memilih mana yang dikerjakan lebih dulu, survey menang jelas.

Argumen "dead zone 7+ hari sebelum survey fisik" justru MENDUKUNG mengerjakan S2-2 lebih awal: supaya ketika user sampai di property, fitur survey sudah siap — bukan muncul belakangan.

S2-3 (Timeline) seharusnya digeser ke bawah. Ini transparency feature, bukan decision quality feature. Memory lama dari analisis Slice 1 pun mencatat "timeline = zero impact ke completion rate."

### Urutan Optimal yang Direkomendasikan

```
S2-0 → S2-2 → S2-4 → S2-1 → S2-5 → S2-6 → S2-7 → S2-3 → S2-8
```

Logika urutan:
1. **S2-0** — prasyarat teknis, tidak ada pilihan
2. **S2-2** — ship dulu sebelum user punya kesempatan survey fisik; paling tinggi value
3. **S2-4** — effort S, colom siap; aktifkan final-commitment tool segera setelah survey ada
4. **S2-1** — visible win untuk pilot; membangun kepercayaan UI tapi tidak blocking
5. **S2-5** — melengkapi dimensi Harga; relevan saat user sudah punya beberapa kandidat dengan utilitas berbeda
6. **S2-6** — market expansion setelah PMF terkonfirmasi dengan Kontrakan
7. **S2-7** — incremental; defer kecuali ada user report bahwa garis lurus menyesatkan
8. **S2-3** — pasang setelah aksi-aksi utama sudah ada (S2-2/S2-4 generate events); effort lebih efisien
9. **S2-8** — pelengkap, bila masih ada waktu

---

## Definisi Slice 2 MVP (Paling Tajam)

### Yang Masuk Slice 2 MVP

**S2-0 + S2-2 + S2-4**

| | Keputusan | Kenapa ini | Yang TIDAK dipilih | Tradeoff |
|--|-----------|------------|-------------------|----------|
| S2-0 | Wajib pertama | Tanpa DDL + bucket, S2-1/2/3 tidak bisa jalan | Tidak ada alternatif; ini infrastruktur | Tidak ada tradeoff — ini prerequisite murni |
| S2-2 | Prioritas P1 — masuk MVP | Satu-satunya fase yang menambah dimensi keputusan baru. 5D > 3D = hasil survey fisik bisa dimasukkan ke sistem, bukan hilang di catatan WA. North star metric langsung terdampak: user yang sudah survey punya data lebih lengkap untuk complete cycle | Menunda S2-2 ke setelah S2-1 (foto dulu) | **Tradeoff:** S2-2 effort L; ada "dead zone" 7+ hari sebelum user bisa survey fisik. Artinya fitur ini mungkin tidak dipakai langsung oleh pilot yang sudah di tahap akhir. Counter-argumen: kirim lebih awal = siap saat mereka butuh |
| S2-4 | Prioritas P1 — masuk MVP | Effort S, kolom `harga_akhir_bulanan` dan GENERATED `harga_efektif_bulanan` sudah ada. Mengaktifkan field ini memungkinkan user mencatat harga nego — yang sering terjadi di tahap akhir sebelum commit. Tanpa ini, user harus catat di luar Hunian | Menunda ke Slice 2.5 setelah validasi user butuh negosiasi | **Tradeoff:** ukuran samplenya kecil (pilot = user dikenal). Negosiasi mungkin belum terjadi di siklus pertama mereka. Tapi cost effort S tidak signifikan |

### Yang Masuk Slice 2 Standar (jika kapasitas ada setelah MVP)

**S2-1 (foto) + S2-5 (biaya all-in)**

| | Keputusan | Kenapa ini | Yang TIDAK dipilih | Tradeoff |
|--|-----------|------------|-------------------|----------|
| S2-1 | P2 — setelah survey | Visible win untuk pilot; foto dari kunjungan langsung menggantikan dummy. UI lightbox dan grid sudah siap | Ship foto sebelum survey (urutan asli) | **Tradeoff:** foto tidak menambah dimensi skor. Kalau budget waktu habis setelah S2-2/S2-4, S2-1 bisa dipotong tanpa menggerus completion rate secara langsung |
| S2-5 | P2 — melengkapi Harga | Biaya all-in (listrik + air + internet + IPL) adalah komponen nyata keputusan sewa. Tanpa ini, dimensi Harga (40%) hanya membandingkan sewa pokok — kandidat dengan sewa murah tapi listrik mahal bisa salah menang skor | Biarkan user kalkulasi manual di luar Hunian | **Tradeoff:** AI extraction untuk biaya sering tidak akurat (banyak listing tidak menyebut utilitas). Risk: kolom terisi kosong untuk sebagian besar kandidat → total all-in menyesatkan jika hanya partial |

### Yang Ditunda ke Slice 2.5/3

| Fase | Keputusan | Alasan tunda |
|------|-----------|--------------|
| S2-6 Apartemen & Kost | **Tunda ke Slice 3** | Keputusan / Kenapa: validasi PMF Kontrakan dulu sebelum expand. Yang TIDAK dipilih: ship Apartemen/Kost di Slice 2 bersamaan dengan survey. Ditolak karena: effort L + type_specific_data JSONB membutuhkan Zod schema baru + extraction multi-tipe = risiko tinggi untuk solo builder. Tradeoff yang disadari: mahasiswa pasar besar, kost relevan — tapi target pilot awal adalah user yang sedang cari kontrakan |
| S2-7 POI rute asli | **Tunda ke Slice 3** | Keputusan / Kenapa: straight-line OpenStreetMap cukup untuk skor Lokasi (35%). Yang TIDAK dipilih: ship POI rute di Slice 2 untuk akurasi Lokasi lebih baik. Ditolak karena: Google Directions ada biaya API recurring + effort M + nilai incremental. Threshold untuk membangun: 5+ user report bahwa jarak garis lurus menyesatkan keputusan mereka. Tradeoff: skor Lokasi kurang akurat untuk rute berkelok (area kota padat seperti Jakarta) |
| S2-3 Timeline | **Tunda ke Slice 2.5** | Keputusan / Kenapa: timeline = transparency, bukan decision quality. Yang TIDAK dipilih: ship timeline bersamaan dengan S2-2 karena event dari survey akan ada. Ditolak karena: render timeline membutuhkan effort M; completion rate tidak terdampak. Tradeoff: pengguna tidak punya history audit trail tentang kapan mereka visit/negosiasi |
| S2-8 Pelengkap | **Tunda ke Slice 3** | Low value, low urgency |

---

## Rekomendasi 4 Scope Terbuka

### (a) Bentuk form survey & apakah deriveVerdict ikut 5 dimensi

**Keputusan:** Rating 1–5 per dimensi (6 dimensi: kebersihan, kebisingan, parkir, komunikasi_owner, keamanan, kondisi_bangunan) + optional tags max 5–6 per kategori + satu field `catatan_survey`. deriveVerdict: YA, diperluas ke 5 dimensi.

**Kenapa ini:** Rating 1–5 per dimensi lebih kaya dari satu bintang overall (Slice 1), memungkinkan radar 5D yang berarti. Tags optional saja — bukan 48 tag wajib dari spec asli. deriveVerdict HARUS mengikuti 5D karena kalau verdict tetap 3D sementara radar sudah 5D, pengguna akan confused.

**Yang TIDAK dipilih:** (1) Satu rating overall — informasi terlalu coarse untuk radar 5D yang ostentatif; (2) 48 tag wajib seperti spec asli — overkill untuk solo builder, sudah dipotong sejak planning Slice 1.

**Tradeoff:** Weight awal untuk dimensi baru (Kondisi, Owner) harus lebih rendah secara default (misal 10% masing-masing, redistribute dari 3D) agar kandidat tanpa survey tidak salah dihukum. Ini berarti scoring formula berubah → WAJIB bump `scoring_version` (1.0 → 2.0).

---

### (b) Apartemen & Kost sejauh apa di Slice 2

**Keputusan:** SKIP sepenuhnya dari Slice 2. Masuk Slice 3.

**Kenapa ini:** Memory dari analisis Slice 1 sudah menetapkan Apartemen/Kost sebagai Slice 3. PMF belum terkonfirmasi untuk Kontrakan. Menambah 2 tipe properti baru berarti: 3 extraction schema berbeda, form JSONB Zod baru, scoring rubric berbeda (lantai/tower relevan untuk apartemen; jam malam untuk kost). Effort L untuk solo builder di tahap validasi.

**Yang TIDAK dipilih:** Ship type_specific_data JSONB sebagai "storage-only" di Slice 2 (save data tapi tanpa scoring). Ditolak: setengah jalan tanpa scoring = user tidak mendapat nilai dari data yang mereka masukkan → frustrasi. Lebih baik tidak ship sama sekali daripada ship tanpa insight.

**Tradeoff:** Mahasiswa adalah target pasar besar untuk Hunian. Tidak ada kost = produk tidak relevan untuk segmen ini di Slice 2. Acceptance: fokus pilot Slice 2 adalah young professionals yang cari kontrakan.

---

### (c) Biaya all-in seberapa terstruktur

**Keputusan:** Semi-terstruktur. AI extraction best-effort + manual override + display total — tapi TIDAK masuk formula scoring.

**Kenapa ini:** AI extraction untuk biaya listrik/air/internet/IPL sering tidak ada di listing (banyak landlord tidak menyebut). Kalau masuk scoring dan sebagian besar field kosong, total all-in = misleading (misal hanya ada data listrik, air dan IPL tidak ada → total under-count). Display "Estimasi biaya all-in" yang jelas berlabel sebagai estimasi lebih aman.

**Yang TIDAK dipilih:** (1) Biaya all-in masuk scoring sebagai komponen Harga — ditolak karena data partial akan merusak akurasi skor Harga. (2) Manual-only tanpa AI extraction — ditolak karena menambah typing burden yang bertentangan dengan prinsip inti Hunian.

**Tradeoff:** Harga dimension (40%) tetap mengukur sewa pokok saja, bukan true total cost. User yang peduli biaya all-in harus membaca tabel biaya tambahan secara manual di halaman detail — belum ter-integrated ke skor.

---

### (d) Batas biaya POI Directions

**Keputusan:** TIDAK build Google Directions di Slice 2. Tetap straight-line OpenStreetMap. Threshold build: 5+ user report bahwa jarak garis lurus menyesatkan keputusan.

**Kenapa ini:** Straight-line cukup untuk membandingkan kandidat relatif satu sama lain dalam pilot kecil. Google Directions API ada biaya per-request — untuk fitur yang bersifat incremental (akurasi jarak), cost-to-value ratio belum justified di tahap validasi. Cache table (`candidate_poi`) sudah dirancang di schema, jadi bisa dibangun kapan saja tanpa migrasi.

**Yang TIDAK dipilih:** Build lazy fetch Directions dengan cache untuk top-N POI saja. Ditolak: bahkan lazy fetch tetap ada API cost dan complexity edge case (jalan macet, moda berbeda). Incremental accuracy gain tidak worth di pilot dengan < 20 kandidat total.

**Tradeoff:** Skor Lokasi untuk area padat Jakarta (jarak lurus ≠ waktu tempuh riil) bisa misleading. User yang memutuskan berdasarkan skor Lokasi 3.5 vs 3.8 mungkin membuat keputusan berbeda kalau mereka tahu waktu tempuh aslinya.

---

## Ringkasan Eksekusi Rekomendasi

### Slice 2 MVP (ship dulu, ukur completion rate)
S2-0 → S2-2 → S2-4

### Slice 2 Standar (jika kapasitas masih ada)
+ S2-1 → S2-5

### Slice 2.5
+ S2-3 (setelah S2-2/S2-4 ada, event generation efisien)

### Slice 3
S2-6 (Apartemen/Kost) + S2-7 (POI Directions) + S2-8

---

## Pertanyaan untuk Validasi Sebelum Build

- Apakah pilot user sudah di tahap "mau survey fisik segera" atau masih cari-cari listing? (memengaruhi urgency S2-2)
- Seberapa sering pilot user memotret properti saat survei? (validasi urgency S2-1)
- Apakah ada pilot yang sudah negosiasi harga? (validasi S2-4 dibutuhkan segera)
- Berapa kandidat rata-rata yang dimiliki pilot saat ini? (memengaruhi apakah biaya all-in relevan untuk compare)

[[hunian-mvp-scope]] [[hunian-faisal-context]]
