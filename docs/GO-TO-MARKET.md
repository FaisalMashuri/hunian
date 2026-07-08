# OPTIO — Go-to-Market Strategy

> **v0.2 — strategy, bukan lagi outline.**
> Bagian dari 3 dokumen: **Brand Foundation** (`BRAND-FOUNDATION.md`) · **Product Philosophy** (`PRODUCT-PHILOSOPHY.md`) · **Go-to-Market** (ini).
>
> Dokumen ini menjawab satu pertanyaan yang tidak dijawab oleh brand & filosofi:
> **"Besok pagi, user pertama datang dari mana — dan kenapa Optio menang, bukan sekadar ada?"**

> ⚠️ **Peringatan jujur:** dokumen ini adalah *hipotesis*, belum kebenaran. Semua angka & asumsi di bawah harus divalidasi (lihat bab **Validation Plan** di akhir). Startup lebih sering mati karena **distribusi & retention**, bukan branding.

---

## 1. Ideal Customer Profile (ICP)

Bukan persona umum — profil spesifik yang paling mungkin merasakan sakitnya *memilih*, bukan *mencari*.

### ICP #1 ⭐ — Fresh Graduate pindah kota (fokus utama fase awal)
- Umur ~22–25, gaji entry-level (sensitif biaya, tiap ratus ribu berarti).
- Baru pindah kota untuk kerja pertama; **tidak kenal medan**.
- Cari kos/kontrakan; sudah kumpulkan ~5–12 kandidat dari OLX/FB/grup.
- **Sakit utama:** bingung membandingkan, takut salah pilih di kota asing, waktu mepet sebelum mulai kerja.
- Kenapa ICP utama: volume besar, momen decision jelas & musiman (kelulusan/onboarding kerja), aktif di komunitas & TikTok → mudah dijangkau.

### ICP #2 — Pasangan baru menikah
- Memilih rumah pertama bersama; keputusan **berdua** → butuh membandingkan & sepakat.
- Nyambung dengan fitur kolaborasi (bandingkan bareng pasangan).

### ICP #3 — Relokasi kantor
- Karyawan dipindahtugaskan; deadline ketat, kota baru, stakes tinggi.
- Daya beli lebih tinggi → kandidat monetisasi lebih awal.

> Prioritas eksekusi: **kunci ICP #1 dulu**. Satu ICP yang menang > tiga ICP setengah matang.

---

## 2. Customer Journey

Journey menentukan channel. Perhatikan di mana Optio masuk:

```
Pindah kerja / lulus
      ↓
Perlu kos/kontrakan
      ↓
Buka OLX → buka FB → tanya grup → screenshot sana-sini
      ↓
Punya 12 kandidat berantakan
      ↓
BINGUNG (titik sakit)
      ↓
Google: "cara membandingkan kontrakan" / "checklist survey kos"
      ↓
━━━━━━━━━━ OPTIO MASUK DI SINI ━━━━━━━━━━
      ↓
Bandingkan → Decision
```

**Implikasi:** momen tertinggi niatnya adalah **pencarian Google saat sudah bingung** (bukan saat mulai mencari). → **SEO adalah channel penangkap paling alami.**

---

## 3. Problem Frequency & Retention Problem

**Ini masalah bisnis terbesar Optio — dan harus dijawab jujur.**

Orang memilih hunian **~sekali per 1–3 tahun**. Artinya:

- **Frekuensi rendah → retention klasik (buka aplikasi tiap hari) mustahil.** Setelah memutuskan, user "selesai".
- Konsekuensi wajib salah satu (atau kombinasi):
  1. **Terima sebagai tool high-intent low-frequency** → maka **acquisition harus sangat murah** (konten yang compounding, bukan iklan berbayar) + **word-of-mouth** jadi nyawa.
  2. **Perpanjang lifecycle** setelah Decision → **Moving** (lihat §4).
  3. **Perluas ke keputusan high-stakes lain** → *Decision Engine* (lihat `PRODUCT-PHILOSOPHY.md`).

> Jangan pura-pura Optio punya retention harian. Menangnya lewat **CAC murah + loop rujukan + perluasan lifecycle**, bukan DAU.

---

## 4. After the Decision: "Moving" (retention lifecycle)

Optio tidak berhenti di **Decision**. Setelah memilih, user masuk fase **pindahan** — masih nyambung, masih butuh bantuan mengurangi kekacauan:

- Checklist pindahan · listrik/token · internet · PDAM · deposit & serah terima · baca kontrak · furnitur & kebutuhan awal.

Ini memperpanjang hubungan **berminggu-minggu** setelah keputusan, menambah momen "share" (checklist ke pasangan/teman), dan memperkuat brand "teman yang membantu", bukan tool sekali pakai.

> Prinsip tetap dijaga: Moving pun **membantu, bukan mengambil alih**. Lolos Litmus Test.

---

## 5. Acquisition Strategy

Tiga channel, dinilai dengan **cost / scalable / speed** — bukan sekadar daftar.

| Channel | Kenapa | Murah? | Scalable? | Cepat? |
|---------|--------|:------:|:---------:|:------:|
| **SEO / konten** ⭐ | Journey berakhir di Google saat user bingung; niat tertinggi | ✅ sangat | ✅ compounding | ❌ lambat (3–6 bln) |
| **Komunitas** (Telegram mahasiswa, grup relokasi, FB) | Tempat ICP berkumpul saat cari; cocok cold-start | ✅ | ⚠️ terbatas | ✅ cepat |
| **TikTok / Reels** | Konten properti & "decision psychology" mudah viral; awareness | ⚠️ waktu | ✅ | ⚠️ tidak pasti |

**Keputusan channel per fase:**
- **Cold-start (0→100 user):** **Komunitas** — paling cepat, manual, personal. Cari 20 user pertama di sini (lihat Validation Plan).
- **Mesin utama (jangka panjang):** **SEO** — paling murah & scalable, cocok dengan momen high-intent. Mulai *sekarang* karena lambat matang.
- **Amplifier:** **TikTok** — bangun awareness kategori & funnel top, dukung SEO.

Jangan sebar ke 5 channel sekaligus. **Komunitas untuk mulai, SEO untuk menang.**

---

## 6. SEO Strategy (bab tersendiri)

SEO = mesin akuisisi utama. Petakan konten ke funnel + niat:

| Funnel | Contoh keyword / judul | Niat | Peran |
|--------|------------------------|------|-------|
| **Top** | "cara memilih kontrakan", "kenapa memilih kos itu sulit" | Sadar masalah | Tarik trafik luas, bangun kategori |
| **Middle** | "checklist survey kos", "biaya all-in ngontrak" | Riset aktif | Bangun trust, kumpulkan email/soft-CTA |
| **Bottom** | "cara membandingkan kontrakan", "bandingkan kos A vs B" | Siap memutuskan | **Konversi ke Optio** |
| **Product** | Optio (app) | Memutuskan | Aktivasi → Decision Completed |

Aturan: setiap artikel memperkuat **kategori** (lihat reframing di §Content), dan bottom-funnel selalu mengalir ke produk.

---

## 7. The Flywheel

Loop yang membuat acquisition makin murah seiring waktu:

```
Konten (SEO/TikTok)
      ↓
Trafik high-intent
      ↓
User membandingkan
      ↓
Decision Report (hasil yang jelas & layak dibagikan)
      ↓
Share ke pasangan / teman / grup
      ↓
Orang lain buka → trafik baru
      ↺ (kembali ke atas)
```

**Kunci flywheel = Decision Report yang layak di-share.** Ini menyiasati problem frekuensi rendah: satu user bisa membawa banyak user meski dia sendiri "selesai".

---

## 8. Positioning vs Competitor

Bukan adu fitur — adu **cara kerja pikiran user**:

| User ingin | Sekarang (tanpa Optio) | Dengan Optio |
|------------|------------------------|--------------|
| Mengingat 10+ listing | Screenshot berserakan | **Decision Dashboard** |
| Membandingkan | Spreadsheet manual | **Smart Compare** |
| Memutuskan | Feeling / nebak | **Decision Score** |

Marketplace membantu **menemukan**; Optio membantu **memilih**. (Detail di `BRAND-FOUNDATION.md` §Competitive Position.)

---

## 9. Pricing (hipotesis)

Belum final, tapi arah harus jelas sejak awal.

**Insight kunci — hati-hati subscription.** Produk **low-frequency** (sekali per 1–3 tahun) buruk untuk langganan bulanan; orang tidak akan berlangganan tool yang dipakai setahun sekali. Model yang lebih cocok:

| Model | Cocok? | Catatan |
|-------|:------:|---------|
| **Free** (bandingkan sampai N kandidat) | ✅ | Pintu masuk & bahan bakar SEO/word-of-mouth |
| **One-time "Decision Pass"** ⭐ | ✅ | Bayar sekali untuk unlock penuh selama masa mencari — pas dgn pola pakai |
| **Subscription bulanan** | ⚠️ | Hanya masuk akal jika lifecycle diperpanjang (Moving) atau jadi Decision Engine multi-kategori |
| **B2B2C** (kampus/HR relokasi) | 🔭 | Eksplorasi jangka menengah untuk ICP #3 |

**Premium unlock kandidat:** bandingkan lebih banyak kandidat, biaya all-in, skor survey fisik, export Decision Report.

> ⚠️ **Jaga janji lama:** fitur **kolaborasi tetap gratis** — sejak awal dirancang sebagai alat personal, jangan dipasangi paywall. Monetisasi lewat kedalaman analisis/kandidat, bukan lewat mengunci "berbagi keputusan".

---

## 10. North Star (rujukan)

> **Decision Completed** — jumlah keputusan yang berhasil dibantu. (Definisi di `PRODUCT-PHILOSOPHY.md`.)

Semua target GTM diturunkan ke sini: bukan "berapa kunjungan", tapi "berapa orang benar-benar sampai ke keputusan yang lebih yakin".

---

## 11. Content Strategy (memperkuat kategori)

Setiap konten memperkuat **kategori**, bukan menjual fitur:

| Jangan ❌ | Lebih baik ✅ |
|----------|--------------|
| 5 Tips Cari Kontrakan | Kenapa Memilih Hunian Lebih Sulit Daripada Mencarinya |
| AI untuk Kontrakan | Kenapa Kita Membutuhkan Housing Decision Assistant |
| Cara Survey Kontrakan | Kenapa Otak Manusia Buruk Membandingkan Banyak Pilihan |

**Lima pilar:** Decision Psychology (bangun kategori) · Housing Tips (SEO middle-funnel) · Product Journey · Build in Public · Customer Stories (bahan bakar flywheel).

---

## 12. Validation Plan — berhenti menulis, mulai memvalidasi

Dokumen ini sudah cukup untuk **mulai bertindak**. Sebelum menambah halaman strategi lagi, **buktikan janjinya di dunia nyata.**

**Eksperimen inti:**
1. Cari **20 orang** yang *benar-benar sedang* mencari kos/kontrakan (mulai dari **komunitas** — ICP #1).
2. Minta mereka memakai prototipe dengan kandidat **mereka sendiri**.
3. Amati tanpa mengarahkan.

**Sinyal kemenangan (magic sentence):**
> Jika kalimat *"Sekarang aku lebih yakin memilih"* keluar **tanpa kamu pancing** → brand *dan* produk memenuhi janjinya.

**Yang diukur di validasi:**
- Apakah mereka menyelesaikan perbandingan (**Decision Completed**)?
- Apakah mereka **membagikan** hasilnya (sinyal flywheel)?
- Apa yang bikin mereka berhenti/ragu (bahan iterasi)?

> Di tahap ini, satu insight dari pengguna nyata > sepuluh halaman dokumen strategi.

---

## Lampiran — Aset Marketing

### Landing Page
- **Hero headline:** Pahami Pilihanmu. Putuskan dengan Yakin.
- **Subheadline:** Tempel link atau deskripsi listing. Optio merapikan informasi, membandingkan setiap pilihan, dan membantu kamu memilih hunian yang paling sesuai.
- **CTA:** Coba Gratis · **Secondary:** Lihat Cara Kerjanya
- **Struktur:** Hero → Problem → Solution → How It Works → Features (bahasa manfaat) → Why Optio → FAQ. (Copy/tone ikut `BRAND-FOUNDATION.md`.)

### About Page (urutan)
1. Mengapa Optio dibuat → 2. Masalah yang kami lihat → 3. Filosofi nama Optio → 4. Cara AI bekerja → 5. Prinsip kami → 6. Tim → 7. Roadmap/visi.
