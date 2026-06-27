# Hunian MVP Spec
**v1.0 — Juni 2026**

> Satu aturan yang mengatur seluruh MVP:
> **AI bertugas mengurangi pekerjaan mengetik, bukan mengambil keputusan.**

---

## Architecture

```
Onboarding
(Budget + Lokasi tujuan + Prioritas)
  │
  ▼
Input Property
(Copy deskripsi / Form manual)
  │
  ▼
AI Extraction + Normalization
  │
  ▼
Property Review
(User verifikasi, bukan input dari nol)
  │
  ▼
Rule Evaluation → Initial Verdict
  │
  ▼
Survey
(Rating bintang + quick tag)
  │
  ▼
Rule Evaluation → Survey Verdict
  │
  ▼
Compare Kandidat
(Trade-off forward + progressive clarification prioritas)
```

---

## Onboarding

Lima step wajib sebelum user bisa menambah kandidat pertama. Semua bisa diedit kapan saja di Settings. Tanpa ini sistem tidak punya context untuk evaluasi.

---

**Step 1 — Budget**

```
Berapa budget sewa bulananmu?

Ideal    Rp ___________
Maksimal Rp ___________
```

Dua angka — ideal dan maksimal. Dipakai untuk budget zone evaluation dan scoring harga.

---

**Step 2 — Tujuan & Transportasi**

```
Di mana lokasi kerjamu / tujuan utama sehari-hari?

🔍 Cari alamat atau pin di peta

Kamu biasanya pakai?

○ Motor
○ Mobil
○ Transportasi umum
○ Jalan kaki / sepeda
```

Moda transportasi mempengaruhi kalkulasi jarak — 6 km naik motor berbeda dengan 6 km naik transportasi umum.

---

**Step 3 — Deadline Pindah**

```
Kapan kamu harus sudah pindah?

📅 ___________

○ Belum tahu / fleksibel
```

Dipakai sebagai dynamic context — semakin dekat deadline, sistem menyesuaikan rekomendasi. Tidak wajib diisi jika belum tahu.

---

**Step 4 — Deal Breaker**

```
Ada hal yang langsung menggugurkan sebuah hunian?
(opsional, tapi sangat direkomendasikan)

□ Tidak ada parkir motor
□ Kamar mandi di luar
□ Tidak boleh masak
□ Tidak ada dapur
□ Lantai lebih dari 3 tanpa lift
□ Harus bayar setahun di muka
□ Tidak boleh pasutri
□ + Tambah sendiri
```

Jika diset, sistem langsung flag setiap kandidat yang melanggar — tanpa perlu tunggu survey. Bisa ditambah atau dihapus kapan saja.

---

**Step 5 — Prioritas**

```
Yang paling penting buat kamu? (pilih semua yang relevan)

☑ Harga terjangkau
☑ Dekat kantor / tujuan
☑ Keamanan lingkungan
☑ Kondisi bangunan bagus
□ Fasilitas lengkap
□ Furnished
□ Parkir tersedia
□ Internet cepat
□ Ketenangan / tidak bising
```

Sistem generate bobot otomatis dari pilihan. User tidak pernah lihat angka persentase.

Di balik layar, pilihan dikonversi ke bobot scoring:

```
Contoh — user pilih Harga, Dekat kantor, Keamanan:

Harga      → 38%
Lokasi     → 27%
Keamanan   → 22%
Fasilitas  → 13%  (sisa dibagi rata ke dimensi yang tidak dipilih)
```

Ditampilkan ke user sebagai:

```
Prioritasmu

★★★★★  Harga
★★★★☆  Keamanan
★★★☆☆  Lokasi
★★☆☆☆  Fasilitas
```

---

**Progressive clarification saat compare pertama**

Setelah compare pertama dijalankan, sistem mengklarifikasi prioritas secara contextual jika ada trade-off signifikan:

```
Hunian A lebih murah Rp 600rb/bln dari B.
Apakah harga memang prioritasmu?

○ Sangat penting
○ Cukup penting
○ Tidak terlalu penting
```

Jawaban memperbarui bobot untuk compare berikutnya. Tidak muncul setiap compare.

---



**Cara 1 — Copy deskripsi**
User copy teks dari platform manapun — WhatsApp, OLX, Mamikos, Facebook, caption apapun — lalu paste ke Hunian. AI mengekstrak ke field terstruktur. User hanya review dan lengkapi yang kosong.

**Cara 2 — Form manual**
User mengisi field satu per satu. Dipakai ketika tidak ada deskripsi yang bisa di-copy.

---

## Property Review (bukan "Form")

Setelah AI ekstrak, yang muncul bukan form kosong. Yang muncul adalah hasil ekstraksi yang perlu diverifikasi:

```
Harga          Rp 3.500.000    ✓
Deposit        Rp 7.000.000    ✓
Parkir         Tidak diketahui ⚠
Internet       Tidak diketahui ⚠
```

User melengkapi yang `⚠`, mengkoreksi yang salah, lalu submit. Pekerjaan user adalah **memverifikasi**, bukan mengetik dari nol.

---

## Fields MVP

Field berubah sesuai jenis properti. Jenis dipilih pertama kali, lalu form menyesuaikan.

---

### Form: Rumah / Kontrakan

**Informasi Dasar**

| Field | Status |
|-------|--------|
| Judul Properti | 🔴 |
| Jenis Properti | 🔴 |
| Kontak Owner | 🔴 |
| Platform asal | 🟡 |
| Alamat | 🟡 — opsional, listing sosmed sering tidak ada |
| Titik Lokasi (Map) | 🟡 — auto-geocode dari alamat, bisa diedit manual |
| Deskripsi | 🟡 |

**Spesifikasi**

| Field | Status |
|-------|--------|
| Kamar Tidur | 🔴 |
| Kamar Mandi | 🔴 |
| Luas Bangunan (m²) | 🟡 |
| Furnished | 🔴 — Furnished / Semi / Unfurnished |
| Carport / Garasi | 🟡 |
| Dapur | 🟡 |

**Biaya**

| Field | Status |
|-------|--------|
| Harga Sewa + Periode | 🔴 — per bulan / per 3 bulan / per tahun → sistem konversi ke per bulan |
| Deposit | 🟡 |
| Periode Minimum Sewa | 🟡 |
| IPL / Biaya Lingkungan | 🟡 |
| Listrik | 🟡 |
| Air | 🟡 |

**Furnitur** — semua ⚪ opsional

**Dokumentasi**

| Field | Status |
|-------|--------|
| Foto (minimal 1) | 🟡 |
| Catatan bebas | ⚪ |

---

### Form: Apartemen

**Informasi Dasar**

| Field | Status |
|-------|--------|
| Judul Properti | 🔴 |
| Jenis Properti | 🔴 |
| Kontak Owner | 🔴 |
| Platform asal | 🟡 |
| Nama Apartemen | 🔴 |
| Tower | 🟡 |
| Nomor Unit | 🟡 |
| Lantai | 🔴 |
| Alamat | 🟡 — opsional, listing sosmed sering tidak ada |
| Titik Lokasi (Map) | 🟡 — auto-geocode dari alamat, bisa diedit manual |
| Deskripsi | 🟡 |

**Spesifikasi Unit**

| Field | Status |
|-------|--------|
| Tipe Unit | 🔴 — Studio / 1BR / 2BR / 3BR |
| Kamar Mandi | 🔴 |
| Luas Unit (m²) | 🟡 |
| Furnished | 🔴 — Furnished / Semi / Unfurnished |
| Balkon | ⚪ |
| View | ⚪ |

**Fasilitas Gedung**

| Field | Status |
|-------|--------|
| Lift | 🟡 — default: ya |
| Parkir | 🟡 |
| Kolam Renang | ⚪ |
| Gym | ⚪ |
| Keamanan 24 Jam | ⚪ |
| Akses Kartu | ⚪ |

**Biaya**

| Field | Status |
|-------|--------|
| Harga Sewa + Periode | 🔴 — per bulan / per 3 bulan / per tahun → sistem konversi ke per bulan |
| Deposit | 🟡 |
| Periode Minimum Sewa | 🟡 — apartemen sering ada minimum 6 bulan atau 1 tahun |
| IPL / Service Charge | 🟡 |
| Listrik | 🟡 |
| Air | 🟡 |
| Parkir | ⚪ |
| Internet | ⚪ |

**Furnitur** — semua ⚪ opsional (AC, TV, Sofa, Tempat Tidur, Lemari, Kitchen Set, Kulkas, Water Heater, Mesin Cuci, Meja Kerja, WiFi)

**Dokumentasi**

| Field | Status |
|-------|--------|
| Foto (minimal 1) | 🟡 |
| Foto Ruang Tamu | 🟡 |
| Foto Kamar | 🟡 |
| Foto Kamar Mandi | 🟡 |
| Catatan bebas | ⚪ |

---

*Kost menyusul setelah dua form di atas solid.*

---

## Survey MVP: 5 Indikator + Catatan

```
⭐ Kebersihan
⭐ Kebisingan
⭐ Parkir
⭐ Owner / responsivitas pemilik
⭐ Keamanan lingkungan

📝 Catatan survey
```

Rating 1–5 per indikator. Catatan bebas untuk hal yang tidak masuk indikator. Tidak lebih dari ini di MVP.

---

## Scoring: Rule-Based, Bukan AI

Formula sederhana, bobot tetap di MVP:

| Dimensi | Bobot |
|---------|-------|
| Harga (vs budget user) | 30% |
| Lokasi (jarak ke kantor) | 20% |
| Kondisi (dari survey) | 20% |
| Fasilitas | 15% |
| Owner | 15% |

Score dihitung oleh rule. Bukan AI. Konsisten, bisa diaudit, mudah dijelaskan.

---

## Tiga Pekerjaan AI di MVP

**1. Extraction**
Deskripsi teks bebas → JSON terstruktur.

```
Input:  "Kontrakan Jatibening 3,5 jt/bulan, 2KT 1KM, carport, deposit 2 bulan"
Output: { harga: 3500000, kt: 2, km: 1, parkir: "carport", deposit: 7000000 }
```

**2. Normalization**
Standarisasi format yang tidak konsisten:
- "3,5 jt" → `3500000`
- "2 kamar" → `bedroom: 2`
- "deket LRT" → `near_lrt: true`

**3. Explanation**
Setelah score muncul, AI menjelaskan dalam bahasa natural:

```
Hunian ini masih layak dipertimbangkan karena:
✓ Harga masih dalam budget
✓ Jarak ke kantor sesuai target

Yang belum diketahui:
• Kondisi parkir
• Tingkat kebisingan

Sebaiknya dicek langsung saat survey.
```

AI tidak menentukan score. AI menjelaskan score yang sudah dihitung rule.

---

## Yang Tidak Ada di MVP

- AI scoring
- GIS / flood risk
- Decision Freeze detection
- Commitment Mode
- Decision Memo
- Shared Decision (multi-user)
- URL auto-parsing (fase berikutnya)

Semua itu valid — tapi bukan pekerjaan MVP. MVP membuktikan satu hal: apakah user bisa sampai ke verdict yang berguna dengan friction seminimal mungkin.

---

## Metric Keberhasilan MVP

Bukan jumlah download. Bukan MAU.

**Cycle completion rate:** berapa persen user yang mencari hunian aktif berhasil menyelesaikan siklus penuh — dari input kandidat pertama sampai memilih satu.

Target awal: jika 60%+ user yang aktif mencari (bukan hanya registrasi) menyelesaikan siklus penuh, product-market fit terbukti cukup untuk lanjut ke fase berikutnya.

---

*Hunian MVP Spec v1.0 — Juni 2026*

---

### Form: Kost

**Informasi Dasar**

| Field | Status |
|-------|--------|
| Judul Kos | 🔴 — nama kandidat di list Hunian |
| Nama Kos | 🟡 — nama asli kos jika ada |
| Kontak Owner / Pengelola | 🔴 |
| Platform asal | 🟡 |
| Alamat | 🟡 — opsional, sering tidak ada di listing sosmed |
| Titik Lokasi (Map) | 🟡 — auto-geocode dari alamat, bisa diedit |
| Deskripsi | 🟡 |

**Informasi Kamar**

| Field | Status |
|-------|--------|
| Tipe Kamar | 🔴 — Standar / Deluxe / VIP atau deskripsi bebas |
| Kamar Mandi | 🔴 — Dalam / Luar |
| Furnished | 🔴 — Furnished / Semi / Unfurnished |
| Luas Kamar (m²) | 🟡 |
| Lantai | 🟡 |

**Biaya**

| Field | Status |
|-------|--------|
| Harga Sewa + Periode | 🔴 — per bulan / per 3 bulan / per tahun → konversi ke per bulan |
| Periode Minimum Sewa | 🟡 — beberapa kost ada minimum 3 atau 6 bulan |
| Deposit | 🟡 |
| Listrik | 🟡 — Termasuk / Terpisah |
| Air | 🟡 |
| Internet | ⚪ |
| Parkir | ⚪ |

**Fasilitas Kamar** — semua ⚪ (AC, Kipas, Tempat Tidur, Lemari, Meja Belajar, Kursi, WiFi, TV, Water Heater, Kulkas Mini)

**Fasilitas Bersama** — semua ⚪ (Dapur Bersama, Ruang Tamu, Mesin Cuci, Laundry, CCTV, Penjaga Kos, Mushola)

**Aturan Kos**

| Field | Status |
|-------|--------|
| Tipe Penghuni | 🔴 — Putra / Putri / Campur |
| Jam Malam | 🟡 |
| Boleh Pasutri | ⚪ |
| Boleh Membawa Tamu | ⚪ |
| Boleh Memasak | ⚪ |
| Boleh Membawa Hewan | ⚪ |
| Boleh Merokok | ⚪ |

*Catatan: Aturan Kos adalah sumber deal breaker paling sering untuk segmen ini. Pertimbangkan menampilkan section ini lebih awal di flow — sebelum biaya dan fasilitas.*

**Dokumentasi**

| Field | Status |
|-------|--------|
| Foto Kamar | 🟡 |
| Foto Kamar Mandi | 🟡 |
| Foto Area Bersama | ⚪ |
| Video | ⚪ |

---

## Status Kandidat

Berlaku untuk semua jenis properti. Ditampilkan sebagai flag yang bisa diubah kapan saja.

| Status | Keterangan |
|--------|------------|
| **Tersedia** | Default saat kandidat pertama ditambahkan |
| **Sudah Disurvey** | Tandai setelah kunjungan langsung — memicu prompt untuk mengisi Survey form |
| **Sudah Tersewa** | Kandidat tidak lagi tersedia — otomatis disisihkan dari perbandingan aktif, tapi tetap tersimpan di arsip |

**Behavior:**
- `Tersedia → Sudah Disurvey`: sistem menampilkan prompt untuk mengisi Survey form
- `Sudah Tersewa`: kandidat pindah ke arsip, tidak muncul di daftar aktif atau compare — history tetap ada
- Status bisa diubah manual kapan saja jika informasi berubah

---

## Survey

Survey bukan form terpisah. Survey adalah proses melengkapi evidence yang hanya bisa didapat dari kunjungan langsung.

Dipicu ketika user mengubah status kandidat ke `Sudah Disurvey`. Sistem menampilkan field-field yang belum terisi dan relevan untuk dicek on-site.

**Format: Rating bintang + quick tag opsional (multi-select)**

User tap bintang, lalu muncul tag konteks. Tag bisa multi-select, bisa di-skip. Tidak ada textbox.

---

### Kebersihan
```
Bagaimana kebersihan?
★★★★☆

○ Sangat bersih      ○ Cukup bersih      ○ Berdebu
○ Lembab             ○ Bau               ○ Ada serangga / tikus
○ Kamar mandi kotor  ○ Saluran tersumbat
```

---

### Kebisingan
```
Bagaimana kebisingan?
★★★☆☆

○ Tenang             ○ Ramai siang        ○ Ramai malam
○ Suara kendaraan    ○ Suara tetangga     ○ Suara konstruksi
○ Dekat rel / tol    ○ Bisa ditoleransi
```

---

### Parkir
```
Bagaimana parkir?
★★★☆☆

○ Tidak ada          ○ Hanya motor        ○ Motor + mobil
○ Sempit             ○ Sangat padat       ○ Berantakan
○ Tidak ada atap     ○ Jauh dari unit     ○ Cukup & rapi
```

---

### Owner / Pengelola
```
Bagaimana owner / pengelola?
★★★★☆

○ Responsif          ○ Lambat balas       ○ Tidak bisa dihubungi
○ Ramah              ○ Kaku               ○ Tinggal di lokasi
○ Tinggal di luar    ○ Ada pengelola harian
```

---

### Keamanan
```
Bagaimana keamanan?
★★★★☆

○ Ada penjaga        ○ Ada CCTV           ○ Ada portal / palang
○ Akses kartu        ○ Lingkungan ramai   ○ Sepi & gelap malam
○ Pernah ada maling  ○ Terasa aman
```

---

### Kondisi Bangunan
```
Bagaimana kondisi bangunan?
★★★☆☆

○ Bagus              ○ Perlu cat ulang     ○ Ada bocor
○ Ada retak          ○ Lembab             ○ Ventilasi kurang
○ Pencahayaan gelap  ○ Terawat
```

---

### Catatan Survey
Satu field teks bebas opsional di akhir — untuk hal yang tidak tertangkap tag manapun.

```
📝 Catatan tambahan (opsional)
____________________________
```

---

**Aturan survey:**
- Semua dimensi opsional kecuali user mau isi
- Rating bintang tanpa tag tetap disimpan sebagai evidence
- Tag tanpa rating tidak valid — bintang dulu, tag menyusul
- Jawaban tersimpan per dimensi, bisa diubah setelah keluar dan buka lagi

---

## Compare

Compare adalah hero feature — tempat di mana keputusan terbentuk.

### Format: Trade-off forward, bukan score forward

Bukan ranking angka. Yang ditampilkan adalah apa yang dikorbankan jika memilih masing-masing kandidat.

```
Kamu membandingkan 3 kandidat.

                    A           B           C
Harga all-in     3.2 jt ✓    3.8 jt ~    4.1 jt ✗
Jarak kantor     6 km ~      3 km ✓      8 km ✗
Kondisi          ✓           ✓           ~
Owner            ~           ✓           ✓
Deal Breaker     Clear ✓     Clear ✓     1 flag ✗

Trade-off utama:

Pilih A  →  hemat Rp 600rb/bln, tapi 3 km lebih jauh dari B
Pilih B  →  paling dekat kantor, tapi lebih mahal Rp 600rb/bln
Pilih C  →  ada 1 deal breaker yang belum resolved
```

Skor tetap ada — tapi kecil, bukan angka utama.

### Framing pilihan

Bukan *"mana yang terbaik?"* tapi *"trade-off apa yang kamu setujui?"*

```
Pilih A berarti:
✓ Budget lebih aman
✓ Kondisi dan survey paling bersih
~ Jarak 3 km lebih jauh dari kantor dibanding B
```

User yang memilih A bukan karena skor tertinggi — tapi karena sadar dan setuju dengan trade-off-nya.

---

## Post-MVP: Sistem Prioritas Adaptif — Fase Lanjutan

*Onboarding checklist dan progressive clarification sudah masuk MVP. Yang di bawah ini untuk fase berikutnya.*

### Behavior inference
Kemungkinan tidak relevan untuk housing context. User hanya membuat 5–8 keputusan dalam satu siklus pencarian — terlalu sedikit untuk inference yang reliable. Lebih applicable jika Hunian berkembang ke domain dengan frekuensi keputusan lebih tinggi.

### Safeguard: prioritas tidak boleh di-game

Jika user mengubah prioritas setelah melihat hasil compare, sistem catat sebagai signal dan bertanya:

```
Kamu baru mengubah prioritas setelah melihat hasil.

Apakah prioritasmu memang berubah,
atau ada kandidat tertentu yang ingin kamu pertahankan?
```

Sistem tidak menghakimi — hanya mengajukan pertanyaan yang jujur.

---

## Property Timeline

Setiap kandidat punya timeline kronologis. Ini adalah implementasi dari prinsip "evaluation adalah snapshot" — user bisa melihat bagaimana keputusan terbentuk dari waktu ke waktu.

### Dua tipe events

**Auto-recorded** — sistem catat otomatis:
```
Kandidat ditambahkan
Status berubah (Tersedia → Disurvey → Tersewa)
Data diupdate (harga berubah, field dilengkapi)
Verdict berubah + alasan perubahan
Survey diisi
```

**Manual input** — user catat sendiri:
```
📞 Telepon / chat owner
🤝 Negosiasi harga
📅 Janji survey (termasuk yang batal)
📝 Catatan bebas
```

### Tampilan

```
09 Jun  Kandidat ditambahkan dari WhatsApp
11 Jun  📞 Telepon owner — responsif, masih tersedia
13 Jun  Status → Sudah Disurvey
13 Jun  Survey diisi — Kebersihan ★★★★☆ · Parkir ★★☆☆☆
13 Jun  Verdict berubah: Prioritaskan → Pertahankan
15 Jun  📝 Owner mau turunkan harga kalau deal minggu ini
16 Jun  Harga diupdate: 3.500.000 → 3.200.000
16 Jun  Verdict berubah: Pertahankan → Kandidat Terkuat
19 Jun  Dipilih
```

---

## Harga: Asli dan Akhir

Dua field terpisah untuk semua jenis properti.

| Field | Status | Keterangan |
|-------|--------|------------|
| Harga Asli | 🔴 | Dari listing — dikunci, tidak bisa diubah setelah disimpan |
| Harga Akhir | 🟡 | Hasil negosiasi — dipakai untuk scoring dan all-in cost |

**Behavior:**
- Kalau Harga Akhir belum diisi → sistem pakai Harga Asli untuk evaluasi
- Perubahan Harga Akhir otomatis tercatat di timeline
- Harga Asli tetap tersimpan sebagai evidence historis

**Tampilan di card:**
```
Harga akhir   Rp 3.200.000
              dari Rp 3.500.000  · hemat Rp 300rb/bln
```