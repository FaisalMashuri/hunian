---
name: project-slice1-review-blocker
description: Code review fondasi Slice 1 (2026-06-26) — blocker HIGH-1 auth wajib di-fix sebelum bangun screen berikutnya
metadata:
  type: project
---

Code review fondasi Slice 1 (auth + landing) selesai 2026-06-26. Verdict: **TAHAN** — ada blocker HIGH-1 sebelum membangun onboarding/screen berikutnya. Detail di `docs/CODE-REVIEW-slice1.md`.

**HIGH-1 (klaster, wajib):** login bisa "berhasil" dengan `session.user.id=""`. Tiga sub-fix: (a) guard `token.email` null sebelum upsert (akar: `db/schema.sql` `email NOT NULL`); (b) `authorized()` jadi `!!(auth?.user?.id)`; (c) opsional feedback error login. BUKAN pakai `throw` di jwt callback (UX error-page jelek + bisa terpicu saat refresh).

**Why:** ini fondasi semua screen Slice 2; sesi broken senyap = diagnostic nightmare.

**How to apply:** sesi build berikutnya harus mulai dengan paket HIGH-1 (~0.5 hari) sebelum lanjut. Saat membangun `/kandidat`, gate onboarding lewat **server component + query DB**, BUKAN flag di JWT (staleness 30 hari). 

**Nuansa non-obvious yang ditemukan saat sintesis:** memperketat `authorized()` saja tak cukup — `session` callback yang memetakan `token.uid -> session.user.id` hanya ada di `auth.ts` (Node), tidak di `auth.config.ts` (edge) yang dipakai middleware. Harus dipindah ke edge config (edge-safe, tanpa DB) agar `auth.user.id` terisi di middleware.

Lihat juga [[feedback-subagent-orchestration]].
