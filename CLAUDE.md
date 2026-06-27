# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Apa ini

**Hunian** — decision tool berbasis web untuk pencari hunian sewa (Kontrakan/Apartemen/Kost). User menempel teks listing berantakan (WA broker, OLX, dll), AI mengekstrak ke data terstruktur, rule engine menskor, dan user membandingkan kandidat secara trade-off untuk memutuskan. Prinsip inti: **AI mengurangi pekerjaan mengetik, bukan mengambil keputusan.**

**Slice 1 selesai** (pipeline end-to-end Kontrakan + semua halaman di-revamp ke mockup; lihat `docs/DEVELOPMENT-PLAN.md`). **Sekarang mulai Slice 2** — menambah kedalaman (survey fisik → skor 5 dimensi, foto nyata, timeline, negosiasi, biaya all-in, Apartemen & Kost, rute POI ter-cache). Rencana: `docs/DEVELOPMENT-PLAN-SLICE2.md`. Mayoritas kolom/tabel sudah dirancang di `db/schema.sql` (SECTION 8 = DDL Slice 2 referensi).

## Stack

Next.js 15 (App Router) + React 19 + TypeScript · Tailwind 3 (shadcn/ui-ready) · Auth.js/NextAuth v5 (Google OAuth) · Supabase (Postgres + Storage, **data+storage saja, bukan auth**) · OpenAI GPT-4o mini (ekstraksi) · Google Maps · Vercel.

## Perintah

```bash
npm run dev         # dev server (http://localhost:3000)
npm run build       # production build + typecheck
npm run typecheck   # tsc --noEmit saja
npm start           # jalankan hasil build

# Benchmark ekstraksi (folder terpisah, package.json sendiri)
cd benchmark && npm install
node run.mjs --model openai   # uji GPT-4o mini vs gold label
node run.mjs --model all      # openai + anthropic + rule baseline
```

Butuh `.env.local` (lihat `.env.example`). `benchmark/` punya `.env` sendiri.

## Struktur

- `app/` — App Router. `page.tsx` (beranda terproteksi), `login/`, `api/auth/[...nextauth]/`.
- `auth.ts` / `auth.config.ts` — NextAuth. **Split config**: `auth.config.ts` edge-safe (dipakai `middleware.ts`, tanpa DB); `auth.ts` Node (upsert user ke Supabase). Jangan impor `auth.ts` dari middleware.
- `lib/supabase/server.ts` — klien service-role **server-only**.
- `lib/constants/periode.ts`, `lib/types/db.ts` — konstanta/tipe selaras DB.
- `db/schema.sql` — DDL migration (8 tabel). Jalankan di Supabase SQL editor.
- `docs/` — `BRD.md` → `PRD.md` → `DEVELOPMENT-PLAN.md` → `ERD.md`. PRD memuat FR ber-ID (FR-AU/ON/IN/AI/RV/DB/SC/CM/ST) yang dirujuk di kode & schema.
- `next-feature/`, `sessions/`, `.claude/agents/` — sistem agent team (ORCHESTRATOR + sub-agent) untuk keputusan produk; `next-feature/mvp.md` = spec produk sumber.
- `benchmark/` — harness akurasi ekstraksi (gate GO/NO-GO >85%).

## Konvensi yang WAJIB dijaga (non-obvious, mahal kalau dilanggar)

1. **Identitas dari NextAuth, bukan Supabase Auth.** Semua query server-side pakai service role yang **BYPASS RLS** — jadi SETIAP query WAJIB memfilter `user_id` dari sesi NextAuth. RLS hanya backstop, bukan pengganti filter (lihat `db/schema.sql` SECTION 6).
2. **`periode_asli` single-source** di `lib/constants/periode.ts` — harus identik dengan DB `CHECK` (`db/schema.sql`) dan `benchmark/schema.mjs`. Ubah ketiganya bersamaan.
3. **Semantik harga terkunci:** `harga_sewa_bulanan` = ASLI/listing, immutable. Scoring SELALU baca kolom GENERATED `harga_efektif_bulanan` (COALESCE akhir, asli). Bila formula/semantik skor berubah, **naikkan `scoring_version`**.
4. **Scoring rule-based, bukan AI.** AI hanya extraction/normalization/explanation (FR-AI-3). Jangan biarkan AI menentukan skor.
5. **Jangan commit secrets.** `.env.local` gitignored; service-role key hanya server-side (`import "server-only"`).

## Setup eksternal (sekali, manual)

- Jalankan `db/schema.sql` di Supabase SQL editor (project `zoxuqttewkipqkaiwxac`).
- Google OAuth redirect URI: `http://localhost:3000/api/auth/callback/google` (dev) + URL produksi saat deploy.
- Cek Supabase connection pooling mode (transaction vs session) — memengaruhi pola RLS GUC (lihat `docs/ERD.md`).
