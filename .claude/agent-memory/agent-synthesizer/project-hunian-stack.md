---
name: project-hunian-stack
description: Hunian approved tech stack and rationale, decided 2026-06-26
metadata:
  type: project
---

Stack yang disetujui untuk Hunian (per 2026-06-26):

- **Frontend:** Next.js + Tailwind CSS + shadcn/ui
- **Database/Storage:** Supabase (Postgres + Storage) — schema harus support 4 moda transport dari hari pertama meski Slice 1 hanya pakai 2
- **AI Extraction:** GPT-4o mini (JSON structured output) — CONDITIONAL: wajib benchmark 20+ sampel pesan broker WA Indonesia sebelum S2 (Input+AI) go-live. Pre-processing lokal wajib (regex normalisasi "2,5jt" → 2500000, dll.)
- **Geocoding:** Google Maps — Mapbox/OSM ditolak karena data transit Indonesia lemah
- **Hosting:** Vercel

**Why:** TL memilih stack ini dengan justifikasi solid. Satu-satunya risiko terbuka adalah AI extraction reliability untuk teks informal WA Indonesia.

**How to apply:** Jangan rekomendasikan perubahan stack tanpa benchmark DA#4 diselesaikan dulu. Pre-processing lokal adalah prerequisite S2, bukan nice-to-have.

[[project-hunian-mvp]]
