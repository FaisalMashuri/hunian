---
name: monetization-verdict
description: Verdict sesi monetisasi Hunian (2026-06-29) — cost-recovery, Saweria dulu, one-time per-cycle, 3 gate Faisal PENDING
metadata:
  type: project
---

Sesi tim agent (2026-06-29) menjawab "bisakah Hunian dimonetisasi & modelnya". Verdict tim: BISA, tapi ini lifestyle/cost-recovery business (ceiling realistis ~Rp50-150jt/th dengan constraint no-ads/no-data), BUKAN venture-scale.

**UPDATE 2026-06-29 (sesi lanjutan, model Fomo):** Faisal sempat usul model ala "Fomo" (kontribusi data sewa anonim -> subscribe Rp50rb buka market-intelligence agregat). Tim menganalisis (STR/TL/PM/UX/DA/SYN/PO): subscription bulanan DITOLAK (frekuensi rendah membunuh recurring), tapi mechanic contribute-to-unlock + data nego/all-in sbg moat dinilai NYATA. SYN verdict: ambil mechanic, buang billing; intel dasar (RANGE harga area, BUKAN persentase) gratis pendorong completion; cold-start butuh ~500 MAU/N>=30 per kecamatan (DA-C5 BLOCKING: 0 user selesai cycle -> prematur). **NAMUN FAISAL AKHIRNYA MENOLAK MODEL FOMO** ("kayaknya ga cocok buat hunian") dan memilih FREEMIUM + PREMIUM KLASIK dulu. Analisis Fomo lengkap diarsip di `.claude/agent-memory/agent-strategist/project-monetization-fomo.md` + transcript sesi. JANGAN usulkan ulang Fomo/subscription tanpa alasan baru.

**VERDICT FREEMIUM FINAL (2026-06-29, PENDING konfirmasi Faisal, Confidence MEDIUM):** Prinsip mengikat = **GATE DI OUTPUT, BUKAN INPUT**. FREE = akses penuh semua INPUT+ANALISIS: AI extraction UNLIMITED, **kandidat UNLIMITED** (limit kandidat DITOLAK — langgar prior-verdict + bunuh aha-moment Compare), scoring 5D, Compare, survey, biaya all-in, nego tracker, timeline, AI explanation/red-flags/summary (bundled, cost ~0). PREMIUM = hanya OUTPUT DELIVERABLE (butuh cloud/AI-gen baru): foto cloud sync, share-link, PDF memo, nego script AI — WAJIB pakai PREVIEW static (bukan full-lock). Cost reality (TL baca codebase): AI MURAH (~$0.0004-0.0013/call); cost terbesar = **Google Directions/POI ~$0.125/user** -> gate POI (free=road-based Overpass, BUKAN crow-flies; spike 1 hari) + foto cloud -> free aman 5000-10000 MAU. Foto OPFS free WAJIB safeguard (warning + export ZIP, blocking). **MANUAL-PREMIUM dulu** (transfer manual + flag is_premium); otomasi gating (counter table) HANYA setelah cycle-completion terbukti & >=3 transfer manual. Harga Rp59rb/siklus = hipotesis; definisi "siklus" eksplisit + exit-survey. **"Full free dulu" = tunda PAYWALL bukan tunda MODEL** (tunda model = jebakan: low-freq churn + COGS tanpa revenue + data sampah tanpa instrumentasi hari-1). Metrik pembuka: % kandidat di-add yang di-Compare; <30% -> tunda monet, fokus completion. Lihat `next-feature/monetization-freemium-premium.md`.

**KEPUTUSAN FINAL FAISAL (2026-06-29, CONFIRMED):**
- Arah model DIKUNCI = **FREEMIUM gate-di-output + DATA FLYWHEEL PASIF** (bangun modal "Catat Hasil Final" sejak awal untuk kumpulkan data nego/all-in; intel jadi fitur GRATIS saat densitas N>=30/cell tercapai ~12-18 bln). BUKAN free murni tanpa instrumentasi.
- "Full free dulu" = TUNDA PAYWALL, bukan tunda MODEL — Faisal setuju reframe ini.
- Disclosure kontribusi data: Faisal pilih **CUKUP DI PRIVACY POLICY** (bukan di titik kontribusi). FLAG: saat fitur "Catat Hasil Final" dibangun & data dipakai agregat, tambahkan 1 baris consent di titik kontribusi demi UU PDP 27/2022 + trust. Belum perlu sekarang (belum ada fitur agregat).
- Subscription & Fomo-as-billing TETAP DITOLAK. (Catatan: memory sempat salah tulis "Faisal menolak Fomo seluruhnya" — sebenarnya Faisal usul Fomo lalu pilih freemium+flywheel pasif; mechanic contribute-to-unlock DIAMBIL sbg fitur, bukan produk subscription.)

Keputusan tim (SYN + PO ALIGNED secara teknis):
- Launch Saweria/Trakteer (donasi pasif footer) sekarang — 0 engineering, cover ~$45/bln COGS (Vercel Pro+Supabase Pro). Bukan monetisasi journey.
- Model berbayar (nanti) = freemium + one-time PER-CYCLE Rp49-79k. BUKAN subscription (frekuensi pakai rendah), BUKAN lifetime dulu (lifetime hanya jika >30% repeat user organik).
- Gate hanya END-JOURNEY BUNDLE: cloud storage foto (free=local OPFS), share-link real-time, PDF decision memo, nego script AI. Compare/scoring/deal-breaker WAJIB gratis (aha-moment + tak bisa di-gate aman client-side karena offline-first/IndexedDB).
- Validasi WTP via TRANSFER MANUAL + flag is_premium Supabase SEBELUM bangun payment gateway (gateway=5-7mgg + registrasi bisnis 3-14 hari).
- KILL-CONDITION: jika dalam 30 hari setelah share ke >=100 user nyata tdk ada 3 orang bayar tanpa dipancing -> FREEZE monetisasi.
- JANGAN: payment gateway sekarang, subscription, limit kandidat, paywall Compare, kejar B2B.

Fakta teknis penting: free-tier Supabase pecah di ~100 user karena STORAGE foto (bukan DB); OpenAI cost terasa di 50-100 MAU. Paywall harus server-side (hanya AI calls/sync bisa di-gate aman).

**Why:** Constraint BR-012/BU-021 (no ads, no data sell) = founder value mengikat; menghapus model scalable consumer-utility -> ceiling cost-recovery. Belum ada satu pun user menyelesaikan siklus end-to-end -> semua angka WTP/SOM masih spekulasi (confidence MEDIUM).

**How to apply:** Jangan rekomendasikan subscription/ads/data-monetization untuk Hunian. Untuk fitur monetisasi, default ke validasi murah dulu. Status: 3 GATE FAISAL PENDING (Q1 terima ceiling lifestyle ~Rp50-150jt/th; Q2 apakah no-ads/no-data FINAL; Q3 setuju one-time per-cycle). Default jika no-respon 48 jam: hanya jalankan Saweria + validasi manual, jangan build bundle. Lihat [[slice2-plan-gates]].
