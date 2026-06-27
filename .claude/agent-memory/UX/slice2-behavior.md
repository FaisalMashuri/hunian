# UX Research: Slice 2 Behavior Analysis
**Tanggal:** 2026-06-27
**Scope:** Grounding Slice 2 (S2-0 s/d S2-8) ke perilaku user nyata — sebelum implementasi dimulai

---

## 1. Decision-Shaping vs Completeness Theater

Pertanyaan kalibrasi: apakah fitur ini mengubah KANDIDAT MANA yang dipilih user, atau hanya membuat produk terasa lebih lengkap?

### Decision-shaping (mengubah hasil nyata)

**S2-2 Survey — HIGHEST IMPACT**
Behavioral evidence: listing text tidak pernah memberi informasi tentang Kondisi Bangunan, perilaku Owner, tingkat kebisingan nyata, atau kualitas parkir aktual. User Indonesia yang pernah kost/kontrakan tahu bahwa "kondisi bagus" di listing bisa berarti apa saja. Survey adalah satu-satunya cara mendapat evidence dari realitas properti. Tanpa survey, dimensi Kondisi dan Owner di radar adalah GHOST — 2 dari 5 dimensi kosong. User yang membandingkan "murah tapi jauh" vs "mahal tapi dekat" perlu tahu apakah kandidat murah punya owner yang responsif dan kondisi yang layak sebelum memutuskan.

**S2-5 Biaya all-in — HIGH IMPACT**
Behavioral evidence: hidden cost adalah pain point yang sudah teridentifikasi (PRD). Listing 3.5 juta/bulan secara nyata bisa menjadi 4.1 juta jika ditambah listrik token 300k + air 50k + internet 100k + IPL 150k. Ini mempengaruhi scoring harga_efektif dan bisa membalik verdict. User yang membuat keputusan berdasarkan harga listing sedang membuat keputusan dengan data yang salah. Ini bukan kosmetik — ini adalah akurasi data inti.

**S2-4 Negosiasi harga — MEDIUM-HIGH IMPACT (tapi context-dependent)**
Behavioral evidence: negosiasi terjadi ketika user sudah menyempitkan pilihan ke 1-2 kandidat terakhir. Penurunan harga (mis. 3.5 → 3.2 juta) langsung mengubah harga_efektif_bulanan yang di-feed ke scoring. Ini adalah titik di mana Hunian paling relevan: user sedang aktif memutuskan. Fitur ini bukan hanya catatan — ini adalah sinyal bahwa verdict mungkin harus bergeser.

### Completeness theater (tidak mengubah kandidat yang dipilih)

**S2-1 Foto nyata — MOSTLY THEATER (post-survey)**
Behavioral evidence: pada saat user mengisi survey, mereka sudah secara fisik berada di properti. Foto yang diambil setelah kunjungan adalah memory aid, bukan decision input. EXCEPTION: jika keputusan dibuat bersama (pasangan muda, orang tua yang bayar) dan pihak lain belum lihat, foto menjadi decision-shaping. Untuk pilot solo, foto adalah cosmetic. Rekomendasi: bangun foto, tapi jangan posisikan sebagai decision feature — posisikan sebagai record.

**S2-3 Timeline — THEATER untuk decision quality, VALUABLE untuk retensi siklus**
Timeline tidak mengubah skor atau trade-off. Tapi timeline adalah fitur yang membuat Hunian terasa seperti companion persistent, bukan alat stateless. Nilainya ada di domain retention, bukan decision quality. Ini distinktif penting untuk prioritasi.

**S2-7 POI rute asli — MARGINAL upgrade**
Perbedaan antara "estimasi garis lurus 1.2 km" dan "rute asli 1.4 km" jarang membalik keputusan. Yang sudah ada (OpenStreetMap + haversine) sudah cukup untuk sinyal "dekat/jauh dari stasiun". EXCEPTION: user commuter TransJakarta/KRL yang berjalan kaki ke halte — beda 300m vs 800m karena gang bisa signifikan. Tapi ini edge case, bukan mainstream decision factor.

**S2-6 Apartemen & Kost — CONTINGENT**
Tidak bisa dikategorikan theater atau decision-shaping sampai kita tahu apakah pilot user ada yang mencari non-Kontrakan. Jika pilot 100% cari kontrakan, ini adalah theater. Jika 40% mahasiswa cari kost, ini adalah akses ke produk sama sekali.

---

## 2. Survey (S2-2): Worth Building Despite Dead Zone?

### Apakah worth dibangun?

**Ya — tapi dengan framing yang tepat.**

Dead zone (7+ hari antara input dan survey fisik) tidak disebabkan oleh form survey yang buruk. Ini disebabkan oleh logistics scheduling kunjungan fisik di Indonesia: tunggu owner available, waktu kerja, akses transport. Form Hunian tidak bisa fix ini. Yang bisa dilakukan Hunian: membuat form assez cepat sehingga user mengisinya SAAT BERDIRI DI DALAM PROPERTI, bukan setelah pulang ke rumah.

Behavioral evidence: dalam studi diary perumahan (konteks umum), detail dari kunjungan fisik hilang dalam 2-4 jam. User yang mengisi survey 3 jam setelah kunjungan sudah mengandalkan memori, bukan observasi segar. Form harus bisa diselesaikan dalam 90 detik, bukan 5 menit.

### Bentuk form survey yang paling rendah friction

**Yang perlu dipertahankan dari spec:**
- Rating bintang + quick tag multi-select: struktur ini sudah benar
- Semua dimensi opsional: benar, jangan ubah
- Tag tanpa bintang tidak valid: benar — bintang adalah anchor evidence

**Yang perlu dikoreksi dari spec:**

MASALAH: Urutan dimensi di spec (Kebersihan → Kebisingan → Parkir → Owner → Keamanan → Kondisi Bangunan) tidak optimal untuk decision value. Kondisi Bangunan dan Owner adalah dimensi GHOST yang paling mengubah radar — tapi keduanya ada di posisi 6 dan 4. Jika user mengisi 2 dimensi lalu tutup app karena bosan/terganggu, mereka telah mengisi Kebersihan dan Kebisingan — bukan yang paling decision-critical.

**Rekomendasi urutan ulang:**
1. Kondisi Bangunan (ghost dimension #1 — highest value untuk Compare)
2. Owner / Pengelola (ghost dimension #2 — highest value untuk Compare)
3. Kebersihan (paling visible saat kunjungan — natural starting point)
4. Keamanan (penting tapi bisa observed dari sekitar)
5. Kebisingan (tergantung waktu kunjungan)
6. Parkir (paling situasional)

Keputusan: urutan Kondisi Bangunan → Owner → Kebersihan → Keamanan → Kebisingan → Parkir
Kenapa ini: jika user hanya mengisi 1-2 dimensi, mereka mengisi yang paling mengubah Compare
Yang tidak dipilih: urutan berdasarkan alur natural inspeksi fisik (masuk → kondisi → kebersihan → dll) — ditolak karena optimizes for UX smoothness tapi bukan untuk decision value
Tradeoff disadari: dimensi Kondisi Bangunan muncul pertama mungkin terasa tidak natural (orang lebih mudah mulai dari yang paling obvious). Ada risiko abandonment rate lebih tinggi di dimensi pertama.

### Haruskah deriveVerdict berubah saat survey masuk?

**Ya, dengan syarat: perubahan harus dikomunikasikan secara eksplisit.**

Behavioral evidence: user membentuk preferensi awal sebelum survey ("ini kandidat terkuat saya"). Setelah survei fisik dan ternyata kondisi buruk + owner tidak responsif, cognitive dissonance terjadi jika system masih menampilkan "Kandidat Terkuat". User akan bingung: "kok masih bagus? Padahal saya lihat sendiri tidak oke."

Rekomendasi: deriveVerdict HARUS recalculate setelah survey. Tapi:
- Timeline harus mencatat event "Verdict berubah: [dari] → [ke] karena survey masuk"
- Pada saat verdict berubah, system menampilkan micro-notification di detail kandidat: "Verdict diperbarui berdasarkan hasil survey Kondisi (★★☆☆☆) dan Owner (★★★☆☆)"
- Jangan silent update verdict — user perlu tahu MENGAPA berubah

Keputusan: ya, deriveVerdict berubah + explicit changelog
Kenapa ini: verdict yang tidak berubah saat evidence baru masuk menciptakan cognitive dissonance dan merusak trust ke scoring system
Yang tidak dipilih: survey hanya memperkaya Compare tanpa mengubah verdict — ditolak karena membiarkan user melihat "Kandidat Terkuat" padahal survey baru menunjukkan kondisi buruk
Tradeoff disadari: verdict yang sering berubah bisa terasa tidak stabil. Mitigasi: label verdict dengan basis dimensi ("Berdasarkan 5 dimensi" vs "Berdasarkan 3 dimensi")

### Masalah partial data: hanya 1 dari 3 kandidat disurvey

Ini adalah masalah UX paling kritis di S2-2. Detail di Seksi 5.

---

## 3. Retensi-Dalam-Siklus: Timeline & Negosiasi

### Dead zone behavior pattern

User yang input kandidat ke Hunian dan kemudian hilang 7+ hari memiliki 3 kemungkinan perilaku:
1. Masih aktif mencari tapi via WhatsApp/telepon langsung — tidak membuka Hunian
2. Menunggu jadwal survey yang belum confirmed dengan owner
3. Sudah memutuskan di luar Hunian tanpa logging back

Dari ketiga ini, hanya kelompok 1 dan 2 yang bisa di-retain oleh fitur Slice 2. Kelompok 3 sudah lost.

### Timeline (S2-3) dan retensi

**Timeline TIDAK secara aktif menarik user kembali ke Hunian.** Ini adalah passive value: berguna saat user sudah membuka app, bukan yang menarik mereka membuka app.

Yang timeline BISA lakukan:
- Membuat Hunian terasa seperti persistent workspace, bukan stateless calculator
- Membantu user yang kembali setelah 7 hari untuk reorientasi ("oh ya, saya sudah telepon owner A tanggal 11, masih responsif")
- Auto-recorded events (status changed, survey filled) tidak memerlukan behavior change dari user

Yang timeline TIDAK bisa lakukan:
- Pull user kembali ke Hunian dari WhatsApp thread dengan owner
- Mengingatkan user bahwa mereka punya siklus yang menggantung (ini notification territory, bukan UI)

**Behavioral evidence dari analogi**: job application tracker (seperti Hunted, Jobstreet saved jobs) — majority user tidak log manual activities (calls, emails). Auto-tracking works; manual logging mostly doesn't unless value is immediately visible.

**Rekomendasi untuk Timeline:**
- Prioritaskan auto-recording (tidak butuh behavior change user)
- Manual logging (telepon, janji survey, catatan bebas) adalah secondary — berguna tapi tidak menggerakkan retention
- Timeline adalah feature yang BAIK tapi bukan retention mechanism aktif

Keputusan: bangun Timeline, tapi jangan expect it to solve dead zone
Kenapa ini: dead zone diselesaikan oleh follow-up manual (sudah disepakati tim) + engagement hooks yang belum ada di scope Slice 2
Yang tidak dipilih: posisikan Timeline sebagai dead zone solution — ditolak karena passive feature tidak mengubah behavior aktif user
Tradeoff disadari: membangun Timeline (S2-3) sebelum verifikasi bahwa follow-up manual benar-benar dibutuhkan bisa jadi premature. Tapi karena dependensinya rendah (hanya tabel baru + hook ke aksi yang sudah ada), cost-nya kecil.

### Negosiasi (S2-4) dan retensi

**Negosiasi adalah retention mechanism AKTIF, bukan pasif.**

Behavioral pattern untuk negosiasi:
1. User menyempitkan pilihan ke 1-2 kandidat
2. User menghubungi owner untuk negotiasi (WhatsApp)
3. Owner turunkan harga
4. User buka Hunian untuk log harga baru → sistem recalculate → verdict mungkin flip
5. User lihat nilai Hunian secara immediate (harga berubah → skor berubah → verdict berubah)

Ini adalah HIGHEST ENGAGEMENT moment dalam siklus penuh: user sedang aktif memutuskan, setiap informasi baru langsung relevan. Jika Hunian tidak bisa menangkap perubahan ini, user kehilangan trust bahwa Hunian mencerminkan realitas.

**Behavioral evidence**: Dari user yang sedang active di akhir siklus keputusan, notification "harga berubah → verdict berubah" adalah highest-value moment of engagement. Ini analog dengan e-commerce wishlist price drop notification.

**Rekomendasi:**
- S2-4 harus mendahului S2-3 dalam prioritas jika harus memilih satu
- Negosiasi log harus sesederhana mungkin: satu field "Harga baru" + "Simpan" → langsung recalculate
- Tautkan ke event timeline otomatis ("Harga diupdate: 3.5 → 3.2 juta")

Keputusan: S2-4 (Negosiasi) lebih tinggi priority dari S2-3 (Timeline) untuk tujuan retensi
Kenapa ini: S2-4 menciptakan active engagement moment; S2-3 hanya memperkaya context saat user sudah buka app
Yang tidak dipilih: S2-3 sebagai retention tool — ditolak karena passive feature
Tradeoff disadari: jika S2-4 dibangun tanpa S2-3, perubahan harga tidak punya konteks kronologis. Solusi: build S2-3 auto-recording (tanpa manual input UI) sebelum atau bersamaan dengan S2-4 — ini minimal effort karena manual input UI bisa defer

---

## 4. Apartemen & Kost (S2-6): Kebutuhan & Risiko

### Pertanyaan yang harus dijawab sebelum build

"Apakah pilot user ada yang mencari Apartemen atau Kost?" — ini harus ditanyakan eksplisit ke pilot user sebelum S2-6 masuk queue.

### Analisis kebutuhan per persona

**Mahasiswa cari kost dekat kampus:**
- Kost adalah tipe properti PRIMER mereka, bukan kontrakan
- Jika Hunian hanya support kontrakan, mahasiswa pilot user tidak bisa input listing kost mereka
- Kost punya deal-breaker attributes unik: Tipe Penghuni (Putra/Putri/Campur), Jam Malam, Boleh Masak — ini filter level pertama sebelum harga
- Risk: mahasiswa yang dapat invite ke pilot tapi cari kost → tidak bisa pakai Hunian → churn tidak karena product experience buruk, tapi karena product exclusion

**Young professional pindah kota:**
- Bisa mencari kontrakan ATAU apartemen tergantung budget dan kota
- Di Jakarta: apartemen studio mulai 3-4 juta relevan untuk gaji UMR
- Di kota non-Jabodetabek: kontrakan lebih dominan

**Pasangan muda:**
- Hampir pasti kontrakan — Hunian sudah support

### Risiko membangun 2 tipe baru sebelum Kontrakan terbukti

Risiko nyata:
1. **Extraction complexity**: setiap tipe baru membutuhkan schema ekstraksi sendiri. Kost listing punya "KM dalam/luar", "putra/putri", "jam malam 22:00" — terminology yang berbeda dari kontrakan
2. **Benchmark gap**: gate akurasi ekstraksi Slice 1 didesain untuk kontrakan. Kost dan apartemen perlu benchmark dataset sendiri (≥20 teks nyata per tipe)
3. **Scoring normalization**: bobot 5 dimensi untuk kost tidak sama dengan kontrakan. Kondisi Bangunan untuk kost lebih tentang kamar, bukan struktur gedung. Owner untuk kost lebih tentang "ada pengelola harian atau tidak"
4. **Surface area expansion**: jika Kontrakan masih belum terbukti (cycle completion rate belum mencapai 60%), menambah 2 tipe baru menggandakan debugging surface sebelum PMF confirmed

### Rekomendasi

**Kost > Apartemen untuk priority jika memang harus bangun di Slice 2.**

Alasan: mahasiswa adalah persona dengan frekuensi search paling tinggi (sering pindah kost), budget tightest (paling banyak merasakan decision complexity), dan paling banyak tidak ada di Kontrakan landscape. Apartemen searcher biasanya lebih sophisticated, punya lebih banyak waktu, dan sering pakai broker.

**Decision framework:**
- Tanya pilot users saat onboarding: "Kamu sedang mencari apa?" (Kontrakan/Kost/Apartemen)
- Jika <15% butuh non-Kontrakan: defer S2-6 ke Slice 3
- Jika 30-40% butuh Kost: prioritaskan Kost saja (bukan Apartemen)
- Jika >40% butuh non-Kontrakan: S2-6 menjadi blocker, bukan enhancement

Keputusan: S2-6 harus CONTINGENT pada data pilot, bukan default Slice 2 scope
Kenapa ini: membangun 2 tipe baru sebelum tipe pertama terbukti memperlebar surface area sebelum PMF
Yang tidak dipilih: bangun keduanya sekaligus sesuai spec saat ini — ditolak karena tidak ada evidence pilot user butuh keduanya
Tradeoff disadari: jika pilot user ada yang cari kost tapi fitur belum ada, mereka bisa saja exit sebelum tim sempat build. Mitigasi: dalam pilot onboarding, set expectation bahwa kost "coming soon" — jika ada demand, reprioritasi S2-6

---

## 5. Risiko Data Parsial dan Mitigasi

### Skenario parsial yang paling berbahaya

**PALING BERBAHAYA: Biaya parsial di Compare**

Jika Kandidat A sudah punya biaya all-in (4.1 juta) dan Kandidat B hanya punya harga listing (3.5 juta), user yang melihat Compare akan menyimpulkan B lebih murah. Ini bisa membalik keputusan ke arah yang salah.

Ini lebih berbahaya dari survey parsial karena:
- Harga adalah dimensi dengan bobot tertinggi (30% dalam scoring 5D)
- User cenderung mengasumsikan harga yang tampil adalah harga yang comparable
- Gap bisa signifikan (300-500 ribu/bulan = 15% dari harga listing)

Mitigasi:
- Di Compare, kolom Harga harus label sumber: "Rp 4.1 jt (all-in termasuk utilitas)" vs "Rp 3.5 jt (harga listing — belum termasuk biaya utilitas)"
- Add callout warning jika ada kandidat dengan harga listing saja: "Kandidat B: biaya utilitas belum diketahui. Minta rincian ke owner sebelum memutuskan."
- Scoring: jika biaya all-in tersedia, gunakan sebagai basis scoring. Jika tidak, gunakan listing tapi flag di explanation.

**MEDIUM-BERBAHAYA: Survey parsial di radar**

Jika hanya 1 dari 3 kandidat disurvey, radar visual menipu:
- Kandidat A: 5 dimensi terisi → polygon besar
- Kandidat B & C: 3 dimensi → polygon kecil (terlihat "lebih jelek")

Polygon kecil untuk B dan C bukan berarti buruk — berarti data belum ada.

Mitigasi:
- Dalam radar, dimensi ghost (Kondisi, Owner) harus secara visual berbeda dari dimensi yang diisi dengan skor rendah. Gunakan dashed outline bukan filled area untuk dimensi yang belum disurvey
- Di bawah setiap radar kandidat: label "Berdasarkan 3 dimensi (belum disurvey)" vs "Berdasarkan 5 dimensi"
- Jangan memasukkan dimensi ghost ke dalam total score comparison — exclude, bukan zero
- Tampilkan callout di Compare: "Kondisi & Owner Kandidat B dan C belum diketahui — data survey belum diisi"

**LOW-BERBAHAYA: POI top-N only**

Hanya menampilkan top-N POI per kategori bukan misleading — user selalu bisa ke detail page untuk lihat lengkap. Ini lebih tentang completeness UX daripada decision accuracy.

Mitigasi: label "Menampilkan 3 terdekat per kategori" cukup — tidak perlu architectural change.

### Prinsip umum untuk data parsial

Hunian harus selalu visible tentang apa yang TIDAK diketahui, bukan hanya apa yang diketahui. Ini sudah tercermin di Property Review (marker ✓/⚠). Prinsip yang sama harus diterapkan di Compare dan radar: partial data diakui secara eksplisit, tidak disembunyikan di balik visual yang terlihat lengkap.

---

## Prioritas Rekomendasi (Ranked)

| Rank | Fase | Klasifikasi | Rationale |
|------|------|-------------|-----------|
| 1 | S2-2 Survey | Decision-shaping | Membuka 2 dari 5 dimensi yang kini ghost |
| 2 | S2-5 Biaya all-in | Decision-shaping | Membuat harga scoring akurat |
| 3 | S2-4 Negosiasi | Decision-shaping + Retensi | Paling relevan saat user di final stage |
| 4 | S2-3 Timeline (auto only) | Retention support | Minimal effort; auto-recording saja |
| 5 | S2-1 Foto | Record/sharing | Bukan decision input untuk solo user |
| 6 | S2-6 Kost (jika demand terkonfirmasi) | Contingent access | Hanya jika pilot users butuhkan |
| 7 | S2-7 POI rute asli | Cosmetic precision | Tidak mengubah keputusan |
| Defer | S2-6 Apartemen | Low priority | Minimal overlap dengan pilot persona |

---

## Assumption Log (Hutang Riset)

Semua item di bawah adalah asumsi yang belum divalidasi dan harus dibayar sebelum membangun berdasarkan analisis ini.

1. **Asumsi: pilot user mayoritas cari Kontrakan** — validasi via onboarding question sebelum launch
2. **Asumsi: user mengisi survey saat masih di properti** — validasi via diary study (timestamp survey vs timestamp status change)
3. **Asumsi: negosiasi terjadi sebelum keputusan final** — validasi via interview: apakah user Indonesia biasa negosiasi kost/kontrakan atau langsung accept?
4. **Asumsi: dead zone 7+ hari bukan karena user memutuskan di luar Hunian** — perlu exit survey di pilot (mengapa tidak kembali?)
5. **Asumsi: foto tidak diperlukan untuk decision oleh solo user** — belum divalidasi. Jika ada pasangan yang decide bersama, foto menjadi critical
