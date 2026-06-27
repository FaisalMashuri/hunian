---
name: project-slice1-decisions
description: Keputusan arsitektur Slice 1 Hunian MVP — APPROVED Faisal 2026-06-26 (metric, deal breaker, auth Google login wajib)
metadata:
  type: project
---

Sesi T-006 Synthesizer menghasilkan verdict untuk Slice 1 Hunian MVP (end-to-end pipeline). Status: PENDING CONFIRMATION dari Faisal untuk 2 isu material.

**Why:** Sesi pertama yang membahas arsitektur eksekusi konkret Slice 1 — dari onboarding sampai Compare.

**Keputusan yang sudah ALIGNED (tidak perlu konfirmasi ulang):**
- Slice 1 = end-to-end pipeline: Onboarding → Input → AI extraction → Scoring → Compare. Compare WAJIB ada di Slice 1.
- AI hanya untuk extraction/normalization/explanation. Scoring rule-based (30% harga, 20% lokasi, 20% kondisi, 15% fasilitas, 15% owner). Align dengan prinsip "AI tidak mengambil keputusan."
- GPT-4o mini dengan benchmark 20+ sampel WA broker nyata, accuracy >85%, wajib sebelum S2 go-live.
- Auth: Google login wajib dari awal (Auth.js/NextAuth) — keputusan Faisal 2026-06-26, mengganti anonymous-first. Supabase untuk data+storage saja.
- 2 moda transport (motor+umum) di Slice 1, schema siap 4 moda. Distance input km manual dulu.
- Stack: Next.js+Tailwind+shadcn/ui, Supabase, Google Maps geocoding, Vercel. Effort 19-26 hari solo.

**Keputusan PENDING konfirmasi Faisal (deadline 48 jam dari 2026-06-26):**

Q1 — Metric Slice 1:
- SYN merekomendasikan ganti dari "cycle completion 60%" ke "session depth proxy" (60% user mencapai Compare screen ≥2 kandidat dalam satu sesi)
- Alasan: dead zone survei fisik 7+ hari + tidak ada re-engagement mechanism di Slice 1
- Kunci: apakah 10 pilot user adalah orang yang Faisal kenal personal dan sedang aktif mencari sekarang? Kalau YA → cycle completion bisa diukur manual, metric tidak perlu diturunkan

Q2 — Onboarding 3-step vs 5-step:
- SYN: 3-step (Budget + Lokasi + Prioritas). Timeline jadi field opsional di form.
- Issue: Deal Breaker (step 4 di spec) nasibnya tidak jelas — hilang dari Slice 1 atau dipindah ke form?
- Deal Breaker kritis karena ia menggugurkan kandidat otomatis tanpa tunggu survey

**RESOLVED oleh Faisal 2026-06-26:**
- Q1 Metric: pilot user DIKENAL personal & aktif → metric utama cycle completion 60% + follow-up manual; session depth jadi leading indicator.
- Q2: Deal Breaker masuk Slice 1 sebagai **flag minimal** (tandai pelanggar, tanpa auto-eliminasi). Onboarding 3-step.
- Auth: Google login wajib dari awal (lihat di atas).

**How to apply:** Sebelum membahas implementasi Slice 1, pastikan konfirmasi Faisal sudah diterima untuk Q1 dan Q2. Jangan mulai build sebelum metric dan onboarding scope clear.

Related: [[project-hunian-vision-principles]]
