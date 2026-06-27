# BRD — Hunian

**Business Requirements Document**

| | |
|---|---|
| **Produk** | Hunian — decision tool pencarian hunian sewa |
| **Versi** | 1.0 |
| **Tanggal** | 2026-06-26 |
| **Owner** | Faisal |
| **Status** | Approved (MVP scope) — lihat [`next-feature/mvp-build-sequencing.md`](../next-feature/mvp-build-sequencing.md) |
| **Sumber** | [`next-feature/mvp.md`](../next-feature/mvp.md), sesi agent team 2026-06-26 |

> Dokumen ini menjelaskan **kenapa** dan **hasil bisnis apa** yang dikejar. Detail perilaku produk ada di [`docs/PRD.md`](./PRD.md).

---

## 1. Executive Summary

Hunian membantu orang yang sedang mencari hunian sewa (kontrakan, apartemen, kost) **mengambil keputusan** — bukan sekadar menemukan listing. User mengumpulkan kandidat dari mana saja (WhatsApp broker, OLX, Mamikos, Facebook), menempelkannya ke Hunian, dan AI mengubah teks berantakan menjadi data terstruktur untuk dibandingkan secara objektif. Nilai inti: **AI mengurangi pekerjaan mengetik, bukan mengambil keputusan.**

MVP membuktikan satu hal: apakah user bisa sampai ke keputusan yang berguna dengan friction seminimal mungkin. Kelayakan teknis inti (akurasi ekstraksi AI) sudah divalidasi awal — GPT-4o mini mencapai 92.7% pada dataset uji.

---

## 2. Latar Belakang & Problem Statement

Mencari hunian sewa di Indonesia tersebar di banyak kanal tak terstruktur. Pencari menghadapi:

- **Data berantakan & tidak konsisten** — tiap listing format berbeda ("3,5jt", "Rp 3.500.000", "45jt/thn"), banyak info hilang.
- **Input manual berulang** — untuk membandingkan, user harus mengetik ulang data tiap kandidat dari nol.
- **Keputusan tanpa basis pembanding** — tidak ada cara konsisten menimbang harga vs lokasi vs kondisi; keputusan jadi emosional atau menyesal belakangan.
- **Evidence hilang seiring waktu** — riwayat negosiasi, hasil survey, perubahan harga tidak tercatat.

Platform existing (Mamikos, OLX) adalah **mesin listing/discovery** — kuat menemukan, lemah membantu memutuskan di antara kandidat yang sudah dikumpulkan.

---

## 3. Tujuan Bisnis

| ID | Tujuan | Deskripsi |
|---|---|---|
| BG-1 | Buktikan product-market fit fungsi keputusan | Tunjukkan user mau & mampu menyelesaikan siklus keputusan penuh di Hunian |
| BG-2 | Kurangi friction input | AI ekstraksi menggantikan pengetikan manual sebagai pembeda utama |
| BG-3 | Posisikan sebagai decision layer | Komplementer (bukan kompetitor langsung) terhadap listing aggregator |
| BG-4 | Bangun fondasi yang bisa di-scale | Arsitektur & data model siap untuk apartemen/kost dan fitur lanjutan |

---

## 4. Metrik Keberhasilan (KPI)

Metrik utama bukan jumlah download atau MAU.

| ID | Metrik | Target MVP | Catatan |
|---|---|---|---|
| KPI-1 | **Cycle completion rate** | **≥60%** user aktif mencari menyelesaikan siklus penuh (input kandidat pertama → memilih satu) | Metrik utama. Diukur pada pilot user yang dikenal personal & aktif (keputusan Faisal 2026-06-26), dengan follow-up manual menembus dead zone survey fisik |
| KPI-2 | **Session depth** | Naik dari waktu ke waktu | Leading indicator — terukur lebih cepat dari KPI-1, tidak bergantung re-engagement survey |
| KPI-3 | **Akurasi ekstraksi AI** | **>85%** field accuracy pada teks listing nyata | Gate teknikal GO/NO-GO. Status: directional GO (92.7% di data sintetis); butuh validasi data nyata |

**Prinsip pengukuran:** angka yang bisa dipercaya > angka yang terdengar kuat tapi tak terverifikasi.

---

## 5. Stakeholder

| Stakeholder | Peran | Kepentingan |
|---|---|---|
| Faisal | Founder / builder / product owner | Membuktikan PMF dengan effort & biaya minimal |
| Pencari hunian (primary user) | Pengguna utama | Memutuskan hunian dengan cepat & sadar trade-off |
| Pilot users (10 pertama) | Validator awal | Dikenal personal & aktif mencari — sumber sinyal PMF |
| Pemilik/broker | Subjek data (tidak langsung pakai di MVP) | — (relevan di fase monetisasi) |

---

## 6. Konteks Pasar & Posisi

- **Mamikos / OLX / Facebook Marketplace** — listing & discovery. Hunian tidak bersaing head-to-head di sini; justru memanfaatkannya sebagai sumber kandidat (copy-paste).
- **Whitespace Hunian** — *decision tooling*: normalisasi data lintas-sumber, scoring konsisten, perbandingan trade-off forward. Belum ada pemain yang fokus di sini.
- **Risiko strategis** — "membuktikan moat (Compare)" tidak sama dengan "membuktikan completion rate". MVP sengaja membuktikan completion dulu lewat satu pipeline utuh, bukan hanya memamerkan fitur pembeda.

---

## 7. Ruang Lingkup Bisnis

**Masuk MVP (Slice 1):**
- Satu jenis properti: **Kontrakan/Rumah**.
- Pipeline keputusan end-to-end: onboarding → input → ekstraksi AI → review → scoring → compare → pilih.
- Deal breaker sebagai flag minimal.

**Tidak masuk MVP (ditunda, valid untuk fase berikutnya):**
- AI scoring (scoring tetap rule-based), GIS/flood risk, Decision Freeze, Commitment Mode, Decision Memo, Shared Decision (multi-user), URL auto-parsing.
- Form Apartemen & Kost, Survey fisik penuh, Property Timeline, harga asli/akhir lanjutan — masuk Slice ≥2.
- **Monetisasi** — di luar scope MVP. Arah (freemium / marketplace fee / landlord subscription / leads) **TBD**, butuh sesi strategi terpisah.

---

## 8. Business Requirements

| ID | Requirement | Prioritas |
|---|---|---|
| BR-1 | Sistem harus menerima input listing dari teks bebas (copy-paste) lintas platform | Must |
| BR-2 | Sistem harus mengurangi input manual via ekstraksi otomatis yang akurat (>85% nyata) | Must |
| BR-3 | Scoring harus rule-based, konsisten, dapat diaudit, dan dapat dijelaskan ke user | Must |
| BR-4 | User harus dapat membandingkan ≥2 kandidat dan melihat trade-off, bukan sekadar ranking angka | Must |
| BR-5 | User wajib login dengan akun Google (Auth.js/NextAuth) sebelum memakai aplikasi | Must |
| BR-6 | Sistem harus mencatat keputusan & perubahan agar bisa dievaluasi (fondasi timeline) | Should (Slice ≥2) |
| BR-7 | Biaya operasional per user harus rendah & dapat diprediksi (AI + maps + hosting) | Must |
| BR-8 | Data pribadi user & kontak owner harus ditangani sesuai prinsip privasi (lihat PRD NFR) | Must |

---

## 9. Asumsi & Batasan

**Asumsi:**
- Pilot user pertama dikenal personal & sedang aktif mencari → follow-up manual memungkinkan untuk KPI-1.
- User bersedia copy-paste teks listing (perilaku natural dari WA/OLX).
- Ekstraksi AI cukup akurat pada teks nyata (asumsi terbesar — sedang divalidasi).

**Batasan:**
- Dibangun solo, target effort ~19–26 hari untuk Slice 1.
- Jarak ke tujuan memakai input km manual dulu (routing otomatis ditunda).
- Anggaran/biaya API & infra: **TBD** (perlu estimasi saat volume jelas).

---

## 10. Risiko Bisnis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Akurasi ekstraksi rendah di teks nyata | Value inti runtuh ("verifikasi" jadi "ketik ulang") | Gate GO/NO-GO sebelum Slice 2; iterasi prompt + pre-processing dulu |
| Session depth tidak prediktif terhadap completion | Metric menyesatkan | Tetap kejar KPI-1 lewat follow-up manual pilot |
| Low-frequency by nature (orang jarang pindah) | Retensi & word-of-mouth lemah | Di luar MVP; sesi Retention Strategy terpisah |
| Ketergantungan biaya pihak ketiga (OpenAI, Google Maps) | Margin/biaya naik | Pantau cost per user (BR-7); siapkan fallback rule-based |

---

## 11. Pertanyaan Terbuka / TBD

1. Arah monetisasi — perlu sesi strategi terpisah (preset Session D).
2. Estimasi biaya operasional per user pada volume nyata.
3. Strategi retensi & referral untuk produk low-frequency (preset Session F).
4. Apakah deal breaker akan berkembang dari flag minimal menjadi auto-eliminasi (post-MVP).

---

## Lampiran — Glosarium

- **Cycle / siklus** — dari input kandidat pertama sampai user memilih satu hunian.
- **Trade-off forward** — format compare yang menonjolkan apa yang dikorbankan tiap pilihan, bukan skor.
- **Deal breaker** — kondisi yang langsung menggugurkan/menandai sebuah hunian.
- **Slice** — irisan vertikal fitur end-to-end yang dirilis & diukur sebagai satu kesatuan.
