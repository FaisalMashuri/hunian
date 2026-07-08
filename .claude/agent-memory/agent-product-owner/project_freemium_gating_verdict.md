---
name: project-freemium-gating-verdict
description: Verdict arsitektur freemium gating Hunian — gate di OUTPUT bukan INPUT, manual premium pilot, PENDING CONFIRMATION 2 gate dari Faisal per 2026-06-29
metadata:
  type: project
---

Faisal menolak model Fomo sebagai billing model dan memilih FREEMIUM+PREMIUM klasik. Synthesizer menghasilkan verdict arsitektur gating. PO: PENDING CONFIRMATION untuk 2 pertanyaan material.

**Why:** Confidence Synthesizer MEDIUM — 0 user selesai 1 siklus end-to-end, WTP/aha-moment masih asumsi. Arsitektur gating sendiri ALIGNED secara vision, tapi ada ambiguitas dari pertanyaan Faisal tentang "full free dulu" yang butuh klarifikasi sebelum eksekusi.

**Arsitektur yang sudah SETTLED (tidak perlu konfirmasi ulang):**

FREE tier — akses PENUH semua INPUT + ANALISIS:
- Extraction unlimited, kandidat unlimited
- Scoring 5D, Compare (aha-moment wajib gratis)
- Survey fisik, biaya all-in, nego tracker, timeline
- AI explanation/red-flags/summary bundled
- Foto lokal via OPFS (dengan 2 safeguard — lihat di bawah)
- POI road-based estimate jika teknis memungkinkan; jika tidak = tidak dapat distance (crow-flies ditolak karena menyesatkan di Jakarta)

PREMIUM tier — hanya OUTPUT DELIVERABLE yang butuh cloud resource baru:
- Foto cloud sync
- Share-link
- PDF memo
- Nego script AI (dengan preview static gratis untuk hindari 0% conversion)

**Keputusan eksekusi yang sudah SETTLED:**
- Limit kandidat DITOLAK (prior verdict mengikat — gate di output bukan input)
- Fasing MANUAL PREMIUM dulu: semua unlock untuk pilot, WTP via transfer manual + flag is_premium
- Bangun gating otomasi HANYA setelah: cycle completion terbukti + >=3 transfer manual
- Kill condition: 30 jam / 100 user / <3 bayar
- Harga Rp59rb/siklus = hipotesis, diuji di pilot
- Kata "siklus" WAJIB didefinisikan eksplisit di UI (bukan di FAQ tersembunyi)
- Exit survey 1 pertanyaan wajib saat user tolak paywall

**PENDING CONFIRMATION dari Faisal (diajukan 2026-06-29, default 48 jam):**

Q1: "Full free dulu" yang dimaksud Faisal = (A) tunda paywall ENFORCEMENT saja sambil tetap putuskan model sekarang, atau (B) tunda keputusan MODEL sama sekali?
- Default jika diam: (A) — lanjut sesuai verdict Synthesizer (manual premium)
- Jika (B): PO flagging sebagai jebakan; perlu diskusi lebih lanjut sebelum lanjut

Q2: Warning banner prominent + export ZIP gratis untuk foto OPFS = syarat WAJIB sebelum foto feature boleh di-ship, atau bisa dilewati untuk MVP awal?
- Default jika diam: WAJIB — safeguard jadi blocking requirement
- Alasan: tanpa ini melanggar prinsip "user in control atas datanya"

**Yang WAJIB dirancang sejak hari 1 walau paywall belum aktif:**
- Definisi siklus eksplisit di DB dan UI (untuk mengukur north star metric)
- Flag is_premium di user table (siap dipakai manual sejak pilot pertama)
- COGS tracking per-user (berapa spend AI per user aktif per bulan)
- Cycle completion event logging (event ketika user buka Compare dengan 2+ kandidat)
- Exit survey 1 pertanyaan di titik kritis (WTP signal paling jujur)

**How to apply:** Sebelum sprint eksekusi gating dimulai, pastikan Q1 dan Q2 sudah dijawab. Jika Q1 dijawab (A) dan Q2 dijawab WAJIB — eksekusi bisa lanjut sesuai verdict. Jika ada jawaban berbeda dari default, perlu re-evaluasi sebelum eksekusi.

Related: [[project-hunian-vision-principles]] [[project-monetization-fomo-verdict]] [[project-slice2-gate]]
