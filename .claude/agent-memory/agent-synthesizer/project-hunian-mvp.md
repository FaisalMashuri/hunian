---
name: project-hunian-mvp
description: Hunian MVP scope decisions, build order, stack, and metric choices from session 2026-06-26
metadata:
  type: project
---

Hunian adalah tool berbasis web untuk membantu pencari kost/kontrakan membandingkan kandidat hunian. Builder: Faisal Mashuri, solo/tim kecil.

**Keputusan utama per 2026-06-26:**
- Slice 1 = end-to-end pipeline minimal: Onboarding 3-step → Input (Kontrakan only) → AI Extraction → Scoring 3D → Compare basic
- Primary metric Slice 1 = cycle completion 60% (keputusan Faisal 2026-06-26: pilot user dikenal personal & aktif → bisa follow-up manual menembus dead zone). Session depth jadi leading indicator, bukan metric utama.
- Auth: Google login wajib dari awal (Auth.js/NextAuth) — keputusan Faisal 2026-06-26, mengganti anonymous-first. Supabase untuk data+storage saja.
- Transport: 2 moda (motor + angkutan umum) di Slice 1, schema Supabase dirancang untuk 4 moda dari hari pertama
- GPT-4o mini: diterima bersyarat — wajib benchmark 20+ sampel pesan broker asli sebelum S2 go-live

**Why:** Metric 60% tidak bisa diukur jujur karena ada dead zone 7+ hari antara input dan survei fisik, tanpa re-engagement mechanism.

**How to apply:** Metric utama Slice 1 adalah cycle completion 60% (lewat pilot yang dikenal/aktif + follow-up manual menembus dead zone); session depth = leading indicator. "Why" di atas menjelaskan kenapa session depth sempat diusulkan sebagai alternatif.

[[project-hunian-stack]]
