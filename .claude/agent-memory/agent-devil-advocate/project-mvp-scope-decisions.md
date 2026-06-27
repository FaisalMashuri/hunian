---
name: project-mvp-scope-decisions
description: Keputusan scope MVP Hunian dan build sequencing dari sesi tim (2026-06-26)
metadata:
  type: project
---

Sesi memutuskan scope MVP Hunian dan urutan build untuk membuktikan metric "cycle completion rate" (target: 60% user aktif menyelesaikan siklus input kandidat pertama → memilih satu).

**Why:** Solo-builder, runway terbatas, perlu bukti metric secepat mungkin sebelum expand scope.

**Keputusan utama yang dikontestasi:**
- PM: Thinnest Viable Cycle — onboarding dipotong ke 3-step, form Kontrakan SAJA, scoring 3 dimensi, survey bintang saja, potong Timeline/Harga Asli-Akhir/quick tags/progressive clarification/form Apartemen+Kost
- STR: Build harus dimulai dari Compare (moat/diferensiasi), bukan form input (commodity)
- TL: Stack Next.js + Tailwind + shadcn/ui, Supabase, GPT-4o mini, Google Maps Platform, Vercel. Effort 19-26 hari, 7 slice. S2 (Input+AI) paling berisiko.
- UX: Dead zone survei 7+ hari memutus siklus; asumsi 3 kandidat minimum untuk Compare perlu diuji

**Pertanyaan terbuka dari TL:** ~~anonymous vs wajib login~~ → RESOLVED 2026-06-26: **Google login wajib dari awal** (Auth.js/NextAuth). Apakah 4 moda transport wajib di MVP → Slice 1 pakai 2 moda, schema siap 4.

**How to apply:** Gunakan konteks ini saat menantang prioritisasi fitur, build order, atau metric definition. Dead zone survei adalah risiko nyata yang belum dijawab spec.

[[project-tech-stack-hunian]]
