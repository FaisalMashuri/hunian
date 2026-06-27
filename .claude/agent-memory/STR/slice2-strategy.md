# Analisis Strategis Slice 2 — Hunian Decision Tool

| | |
|---|---|
| **Disusun oleh** | Product Strategist (agent-strategist) |
| **Tanggal** | 2026-06-27 |
| **Konteks** | Slice 1 selesai. Pilot berikutnya = user dikenal personal & aktif mencari. Fase Slice 2 dianalisis dari lens differentiator/moat. |

---

## Pertanyaan Strategis yang Dijawab

1. Fase mana yang memperkuat differentiator vs sekadar menyamai marketplace?
2. Subset pilot mana yang paling tajam membuktikan thesis?
3. Apartemen & Kost: coverage vs fokus?
4. Biaya all-in sebagai differentiator vs survey?
5. Feature parity trap: di mana risiko terletak?

---

## 1. Ranking Fase by Differentiator Strength

### Tier 1 — CORE MOAT (bangun ini dulu)

**S2-2: Survey Fisik → Skor 5 Dimensi**

Ini adalah satu-satunya fase di Slice 2 yang menciptakan moat yang benar-benar defensible. Berikut alasannya:

*Kenapa ini moat sesungguhnya:*
- Data kondisi fisik (Kebersihan, Kebisingan, Kondisi Bangunan, Owner, Keamanan) hanya bisa didapat dari kunjungan langsung. Tidak ada listing platform yang bisa mengekstraknya dari teks iklan.
- Mamikos BISA saja menambah form survey, tapi itu mengharuskan mereka mereposis produk dari "platform listing" ke "tools keputusan" — repositioning yang mahal dan berisiko mengasingkan landlord/agen yang selama ini menjadi supply mereka. Landlord tidak ingin dinilai buruk secara publik.
- Setiap user yang mengisi survey di Hunian menghasilkan data terstruktur (rating + tags) yang tidak dimiliki satu pun kompetitor. Saat cukup banyak terkumpul, ini bisa menjadi sinyal prediktif: "properti di area X, kisaran harga Y, cenderung rating Owner rendah." Data ini tidak bisa dibeli dari mana pun.
- Ini membuka radar 5 dimensi di Compare — menjadikan Compare view jauh lebih informatif dan membuat keputusan lebih terinformasi.

*Behavioral moat:* Jika user membuka Hunian SEBELUM melakukan kunjungan (untuk siapkan form survey), mengisi saat kunjungan, lalu membandingkan setelah pulang → Hunian masuk ke ritual keputusan. Habit ini sulit dihilangkan kompetitor.

*Defensibility timeline:* 18-24 bulan sebelum kompetitor sadar dan mulai ikut. Bahkan setelah sadar, mereka perlu waktu tambahan untuk mengumpulkan data historis yang setara.

---

**S2-5: Biaya All-In Terstruktur**

Masuk Tier 1 bukan sebagai moat teknis, tapi sebagai *immediate conviction trigger* untuk user.

*Kenapa kuat:*
- "Sewa Rp 2,5 juta/bulan" vs "Total all-in Rp 3,8 juta (listrik token + air PAM + IPL + internet)" adalah perbedaan yang *langsung* user rasakan.
- Marketplace tidak punya insentif menampilkan ini — hidden cost yang tinggi membuat properti terlihat tidak menarik. Hunian tidak punya konflik kepentingan ini.
- Data bisa datang dari dua sumber: ekstraksi AI dari teks listing (parsial) ATAU diisi manual saat/setelah kunjungan → sinergi dengan S2-2.

*Kenapa di bawah S2-2:*
- Beberapa informasi biaya kadang ada di teks listing (token listrik, tarif air), sehingga AI extraction bisa sebagian membantu. Ini berarti keunikannya kurang absolut dibanding survey kondisi fisik.
- Kurang kuat sebagai moat jangka panjang, tapi sangat kuat sebagai *value prop immediate* untuk pilot.

---

### Tier 2 — ENRICHMENT (mendukung tapi bukan pembeda utama)

**S2-4: Negosiasi Harga (Awal → Akhir)**

*Kenapa relevan strategis:*
- Merekam harga pasca-negosiasi → `harga_efektif_bulanan` adalah insight nyata. Listing menampilkan harga tawar pertama; Hunian bisa menampilkan harga yang benar-benar dibayar.
- Dikombinasikan dengan S2-5 (biaya all-in), ini membentuk gambar "true cost of living" yang tidak ada di mana pun.
- Kolom sudah siap (`harga_akhir_bulanan`), implementasi ringan.

*Trade-off:* kecil tapi additive. Jangan underprioritize.

---

**S2-3: Timeline / Events**

*Kenapa relevan:*
- Merekam jejak keputusan (kapan ditambah, kapan disurvey, kapan nego) membuat keputusan *dapat diaudit* oleh user sendiri.
- Menambah narrative ke Compare: "Properti A sudah disurvey 5 hari lalu; B baru ditambah kemarin" → konteks temporal untuk keputusan.

*Kenapa bukan prioritas pilot:*
- Tidak membuka kemampuan baru yang secara langsung membuktikan thesis "Hunian membantu memutuskan."
- Nilai terasa setelah ada data beberapa kandidat dengan history berbeda — di pilot awal, kandidat sedikit.

---

**S2-7: POI Rute Asli Ter-cache**

*Kenapa tidak prioritas:*
- Kita sudah punya POI dengan straight-line distance + estimasi kasar yang *berlabel* sebagai estimasi. Ini bukan bug — ini sudah diakui di UI.
- Upgrade ke rute asli adalah polish UX, bukan differentiator. Mamikos pun tidak punya ini, tapi user tidak membandingkan kita dengan Mamikos di fitur ini — mereka membandingkan kita dengan Google Maps yang mereka buka sendiri.
- Cost Google Directions setiap upsert cache bisa bertambah seiring data tumbuh.

---

### Tier 3 — RISIKO (perlu kewaspadaan posisioning)

**S2-1: Foto Kandidat Nyata**

*Ini Tier 3 karena risiko posisioning, bukan karena tidak berguna.*

Ada dua jenis foto dalam S2-1:
- **Foto listing** (dari broker/OLX) = FEATURE PARITY. Semua marketplace sudah punya ini. Menambah foto listing ke Hunian membuat kita terlihat seperti marketplace yang tertinggal.
- **Foto survey** (diambil user saat kunjungan) = DIFFERENTIATOR. Foto kondisi nyata yang user ambil sendiri sebagai *evidence* → ini ekstensi dari S2-2.

*Rekomendasi pisah strategi:*
- Jangan build "upload foto listing" sebagai fitur terpisah dari survey — itu jebakan feature parity.
- Build "Foto Survey" sebagai bagian dari form S2-2: saat mengisi rating, user bisa tambah foto kondisi kamar, kamar mandi, jendela. Caption default: "Diambil saat kunjungan [tanggal]."
- Foto listing (dari broker) bisa diabaikan atau jadi low-priority field manual tanpa AI extraction.

---

**S2-6: Apartemen & Kost**

Dianalisis terpisah di Bagian 3.

---

**S2-8: Aktivasi Pelengkap**

Low priority untuk pilot. Moda transit/jalan kaki menambah dimensi scoring tapi hanya relevan untuk user dengan commute non-motor. Deal breaker auto-eliminasi bisa jadi high-value tapi butuh lebih banyak deal breaker data dulu.

---

## 2. Subset Pilot yang Paling Tajam

### Thesis yang harus dibuktikan pilot:
"Setelah menggunakan Hunian, user dapat memutuskan kandidat mana yang dipilih lebih cepat, lebih yakin, dan dengan lebih sedikit informasi yang mengejutkan setelah pindah."

### Subset minimum untuk membuktikan thesis ini:

**Harus ada (MVP Slice 2 pilot):**
1. **S2-0** — Aktivasi DB (prerequisite, bukan fitur)
2. **S2-2** — Survey fisik → 5 dimensi (THE proof point: evidence dari kunjungan yang tidak ada di mana pun)
3. **S2-5** — Biaya all-in (immediate "aha" moment: harga total vs harga listing)
4. **S2-4** — Negosiasi harga (additive, ringan, melengkapi S2-5)

**Yang harus DITUNDA dari pilot:**
- **S2-1 (foto listing)** — defer entirely; foto survey saja bisa dijahit ke form S2-2
- **S2-3 (timeline)** — defer; berguna setelah ada beberapa siklus per user, bukan di pilot pertama
- **S2-6 (Apt/Kost)** — DEFER KERAS; lihat Bagian 3
- **S2-7 (POI rute)** — defer; upgrade polish bukan proof of thesis
- **S2-8 (pelengkap)** — defer seluruhnya

### Mengapa subset ini paling tajam:

Ketika seorang pilot user menggunakan Hunian dengan S2-2 + S2-5 + S2-4 aktif, siklus keputusannya menjadi:
1. Tambahkan kandidat dari WA broker (AI ekstraksi → verify)
2. Kunjungi fisik → isi form survey → foto kondisi → rating Kondisi/Owner/Kebisingan
3. Lihat total biaya all-in vs harga listing
4. Catat harga nego setelah tawar-menawar
5. Compare: radar 5 dimensi + true cost per kandidat + trade-off forward
6. Putuskan

Ini adalah *siklus keputusan lengkap* yang tidak bisa dijalankan di marketplace manapun. **Ini yang membuktikan thesis.**

Pertanyaan untuk validasi pilot (exit survey setelah Compare):
- "Apakah ada informasi yang baru Anda tahu setelah pakai Hunian yang tidak terlihat di listing aslinya?"
- "Apakah Anda lebih yakin memutuskan setelah melihat compare ini?"
- "Apa yang akan Anda cek ulang di listing asli sebelum memutuskan?" (kalau jawaban "tidak ada" = Hunian berhasil)

---

## 3. Apartemen & Kost — Trade-off Coverage vs Fokus

### Keputusan: DEFER S2-6 dari pilot Slice 2.

**Kenapa ini:**
- Hypothesis belum terbukti di Kontrakan. Sebelum ada sinyal kuat dari pilot bahwa decision-tool framework bekerja untuk satu property type, menambah tipe adalah menambah variabel yang mempersulit diagnosis.
- Jika pilot gagal, kita tidak tahu apakah gagal karena frameworknya salah atau karena satu tipe tidak representatif. Fokus satu tipe dulu = sinyal lebih bersih.
- `type_specific_data` (JSONB) sudah disiapkan di schema. Ini adalah keputusan baik di Slice 1 — artinya delay implementasi tidak memerlukan redesign schema.

**Yang tidak dipilih (dan mengapa):**
- Opsi: "Bangun Kost dulu karena market lebih besar dari Kontrakan" → ditolak. Pilot user yang "dikenal personal & aktif mencari" mungkin mix antara kost dan kontrakan. Tapi pilot bukan soal market size — pilot soal validasi framework keputusan. Kontrakan lebih kompleks (kontrak, negosiasi lebih intens) sehingga jika framework bekerja di Kontrakan, lebih mudah diturunkan ke Kost.
- Opsi: "Apartemen sebagai premium segment" → paling jauh untuk ditunda. Apartemen memerlukan data IPL, unit, tower, fasilitas gedung yang sangat berbeda dari Kontrakan. Effort tinggi, belum terbukti ada demand dari pilot user.

**Tradeoff yang disadari:**
- Ada kemungkinan pilot user sedang aktif mencari Kost, bukan Kontrakan. Jika itu terjadi, pilot set harus difilter ke user yang sedang cari Kontrakan.
- Delay S2-6 mungkin terasa menyia-nyiakan form yang sudah disiapkan (disabled + notice "Segera"). Tapi "sudah siap di UI" bukan alasan cukup untuk prioritaskan.

**Catatan asimetris untuk Kost (medium-term):**
- Kost sebenarnya memiliki potential yang lebih besar strategis untuk Slice 3, bukan Slice 2. Alasan: keputusan kost lebih emosional (akan tinggal bersama penghuni lain, aturan jam malam, tipe penghuni), data kondisi fisik dari survey lebih kritis (shared bathroom sangat penting), dan user kost cenderung lebih muda + tech-native = lebih mudah onboarded ke tool baru.
- **Flag untuk Slice 3:** Jika Kontrakan pilot menunjukkan validasi, prioritaskan Kost SEBELUM Apartemen.

---

## 4. Biaya All-In vs Survey — Seberapa Strategis Masing-masing?

### Survey (S2-2) > Biaya All-In (S2-5) sebagai moat jangka panjang.

**Kenapa Survey unggul sebagai moat:**
- Data kondisi fisik (rating + tags dari kunjungan langsung) bersifat *irreplaceable* — tidak bisa di-scrape, tidak bisa di-guess dari teks listing, tidak bisa diprediksi dari harga.
- Uniqueness absolut: hanya orang yang sudah datang ke lokasi yang bisa mengisi ini. Hunian menjadi *nilai dari pengalaman fisik yang terstruktur*.
- Flywheel: semakin banyak survey data → semakin akurat rekomendasi → semakin dibutuhkan tool ini sebelum kunjungan.

**Kenapa Biaya All-In penting sebagai *conviction trigger*:**
- Lebih mudah dikomunikasikan ke user baru: "Kami tunjukkan harga sebenarnya, bukan harga listing."
- Immediate value bahkan sebelum kunjungan (bisa diisi dari teks listing WA yang kadang mention token listrik, wifi, dll).
- Tapi: beberapa data bisa di-scrape atau di-extrapolate dari tipe properti + lokasi → kurang unik dibanding survey.

**Rekomendasi:**
- Keduanya harus ada di pilot (lihat Bagian 2).
- Narasi ke pilot user: "Setelah survey, Hunian tunjukkan biaya sebenarnya yang harus kamu bayar per bulan — bukan hanya sewa, tapi total."
- Jangan posisikan sebagai dua fitur terpisah. Jadikan satu narrative: *visit → survey kondisi → lengkapi biaya → compare dengan angka sesungguhnya*.

---

## 5. Feature Parity Trap — Daftar Risiko

### Definisi Feature Parity Trap untuk Hunian:
Ketika Hunian membangun sesuatu yang terlihat seperti "marketplace yang lengkap" alih-alih "tool keputusan yang dalam." Penanda utama: user datang ke Hunian untuk *menemukan* properti, bukan untuk *memutuskan* antar properti yang sudah ditemukan di tempat lain.

---

### Risiko 1: TINGGI — Foto Listing (subset dari S2-1)

**Apa risikonya:**
Upload foto dari broker/OLX sebagai fitur terpisah dari survey. Saat user bisa tambah foto listing, Hunian terlihat seperti "tempat simpan listing properti lengkap dengan foto" → marketplace lite.

**Sinyal bahaya:**
- User mengunggah foto marketing dari broker (bukan foto yang mereka ambil sendiri).
- User mulai membuka Hunian untuk cek foto dulu sebelum memutuskan mau kunjungi atau tidak → use case discovery, bukan keputusan.

**Mitigasi:**
- Hanya build "Foto Survey" (diberi label eksplisit: diambil saat kunjungan). Jangan buka upload foto listing umum.
- Dalam form survey (S2-2): tombol tambah foto ada di dalam form kondisi, bukan di halaman terpisah.

---

### Risiko 2: MEDIUM — Apartemen & Kost Sebagai "Lebih Banyak Tipe Listing" (S2-6)

**Apa risikonya:**
Jika S2-6 di-komunikasikan (atau dipersepsi) sebagai "Hunian sekarang support Kost dan Apartemen juga," positioning drift ke arah marketplace yang expanding coverage. User baru datang bukan karena butuh bantu memutuskan, tapi karena dengar "ada listing kost di Hunian."

**Sinyal bahaya:**
- User share link Hunian ke teman dengan framing "eh ada tuh app properti baru, coba deh."
- Onboarding baru dari share link (bukan referral langsung dari active seeker yang butuh tool keputusan).

**Mitigasi:**
- Komunikasi ke user: "Kamu bisa tambah kandidat Kost yang sudah kamu temukan di Mamikos, lalu compare di sini."
- Pastikan type selector di `/input` tidak memberi kesan Hunian adalah tempat browse Kost.

---

### Risiko 3: MEDIUM — POI sebagai "Location Explorer" (S2-7)

**Apa risikonya:**
POI rute asli bisa drift ke use case "cek lingkungan sekitar properti" → discovery behavior. User tidak punya kandidat, tapi buka Hunian untuk explore area.

**Sinyal bahaya:**
- User session dimulai dari POI section, bukan dari Compare atau Dashboard.

**Mitigasi:**
- POI hanya muncul di halaman detail kandidat yang sudah disimpan. Tidak ada "explore area" tanpa kandidat. Framing: "Lingkungan sekitar [nama kandidat]" — bukan "Cari properti di area ini."

---

### Risiko 4: LOW tapi perlu disadari — Scoring "Terlalu Cerdas" Terlihat Seperti AI Deciding

**Apa risikonya:**
Jika 5-dimensi radar terlalu dominan di UI (misalnya langsung menampilkan "KANDIDAT TERBAIK: A"), user percaya bahwa Hunian yang memutuskan. Ini melanggar positioning "AI mengurangi mengetik, bukan memutuskan" dan justru mengurangi trust (karena user tidak tahu dasar keputusannya).

**Sinyal bahaya:**
- User pilot yang pilih kandidat berdasarkan skor tertinggi tanpa membaca trade-off.
- Pertanyaan seperti "kenapa app-nya pilih yang ini?"

**Mitigasi:**
- Skor tetap sekunder, trade-off tetap primer (sudah didesain demikian di Slice 1).
- Copy UI di Compare: hindari "Rekomendasi: A" → gunakan "Kalau pilih A, kamu dapat X tapi korbankan Y."

---

## Ringkasan Eksekutif

### Differentiator Ranking (kuat → lemah untuk pilot):
1. S2-2 — Survey fisik + 5 dimensi (MOAT SESUNGGUHNYA)
2. S2-5 — Biaya all-in (immediate value prop + melengkapi moat)
3. S2-4 — Negosiasi harga (true cost picture, ringan)
4. S2-3 — Timeline (enrichment, bukan differentiator)
5. S2-7 — POI rute asli (polish UX)
6. S2-1 (foto survey saja) — evidence fisik, bisa dijahit ke S2-2
7. S2-1 (foto listing) — FEATURE PARITY TRAP
8. S2-6 — Market reach, bukan differentiator, defer dari pilot
9. S2-8 — Pelengkap, defer

### Pilot Subset:
S2-0 + S2-2 + S2-5 + S2-4 (dengan foto survey sebagai bagian dari S2-2)

### Apartemen & Kost:
DEFER dari pilot. Flag Kost sebagai prioritas Slice 3 (sebelum Apartemen).

### Feature Parity Trap Terbesar:
Foto listing upload (S2-1 versi marketplace), S2-6 tanpa framing tepat.

---

*Dokumen ini adalah backup analisis strategis sesi planning Slice 2.*
