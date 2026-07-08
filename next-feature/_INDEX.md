# Hunian — Feature Registry

Semua fitur yang pernah didiskusikan oleh agent team, beserta status terkini.
Di-update otomatis oleh Orchestrator setiap kali sesi debat selesai.

---

## Status Summary

```
Backlog      : 0
In Discussion: 3
Approved     : 3
In Progress  : 0
Done         : 0
Rejected     : 0
```

---

## Feature List

<!-- 
  Format per baris:
  | [Status] | [Nama fitur] | [Confidence] | [Tanggal] | [Link] |
  
  Status badges:
  ⬜ Backlog
  🔵 In Discussion
  🟢 Approved
  🔨 In Progress
  ✅ Done
  ❌ Rejected
-->

| Status | Feature | Confidence | Updated | File |
|---|---|---|---|---|
| 🟢 Approved | MVP Build Sequencing | MEDIUM | 2026-06-26 | [mvp-build-sequencing.md](mvp-build-sequencing.md) |
| 🟢 Approved | ERD & Schema Database (Slice 1) | HIGH | 2026-06-26 | [erd-schema-db.md](erd-schema-db.md) |
| 🟢 Approved | UX/UI Design — Slice 1 (8 layar) | HIGH | 2026-06-26 | [ux-ui-slice1.md](ux-ui-slice1.md) |
| 🔵 In Discussion | Slice 2 — Prioritisasi & Scope (Survey-First MVP) | MEDIUM | 2026-06-27 | [slice2-prioritisasi.md](slice2-prioritisasi.md) |
| 🔵 In Discussion | Monetisasi — Freemium + Premium (gate di output, manual-premium dulu) | MEDIUM | 2026-06-29 | [monetization-freemium-premium.md](monetization-freemium-premium.md) |
| 🔵 In Discussion | Collaboration — Undang Pasangan (DEFER-dengan-gate; validasi premis dulu) | MEDIUM | 2026-07-06 | [collaboration-partner.md](collaboration-partner.md) |

---

## Cara Membaca Index Ini

**Status flow normal:**
```
⬜ Backlog → 🔵 In Discussion → 🟢 Approved → 🔨 In Progress → ✅ Done
```

**Status flow kalau ditolak:**
```
🔵 In Discussion → ❌ Rejected (dengan alasan di file feature-nya)
```

**Kapan Orchestrator update index ini:**
- Setelah sesi debat selesai dan feature file dibuat
- Setelah Product Owner memberikan verdict
- Setelah Faisal mengkonfirmasi status

---

## Fitur Berdasarkan Kategori

### 🗂️ Core Survey Flow
*Fitur yang langsung terkait dengan proses survey kost secara fisik*

*(belum ada)*

### 📊 Comparison & Decision
*Fitur yang membantu user membandingkan dan memutuskan*

- 🟢 [MVP Build Sequencing](mvp-build-sequencing.md) — Slice 1 end-to-end (onboarding → input → extraction → scoring → compare)
- 🟢 [ERD & Schema Database (Slice 1)](erd-schema-db.md) — 8 tabel Postgres/Supabase, hybrid extensibility, forward-compat Slice 2
- 🔵 [UX/UI Design — Slice 1](ux-ui-slice1.md) — IA + 8 layar buildable (shadcn/ui), design direction, component inventory; spec di `docs/UX-DESIGN.md`
- 🔵 [Slice 2 — Prioritisasi & Scope](slice2-prioritisasi.md) — Survey-First MVP (S2-0+S2-2+S2-4+S2-5 display + events); Apt/Kost·POI·timeline·foto-listing defer; PENDING konfirmasi Faisal (G1 bobot, G2 sign-off migrasi)

### 🤖 AI & Intelligence
*Fitur yang menggunakan AI atau data untuk memberikan insight*

*(belum ada)*

### 🔐 Trust & Safety
*Fitur yang membangun kepercayaan antara user dan pemilik kost*

*(belum ada)*

### 👥 Collaboration
*Fitur yang melibatkan lebih dari satu orang dalam proses keputusan*

- 🔵 [Collaboration — Undang Pasangan](collaboration-partner.md) — verdict **DEFER-dengan-gate**: premis "pasangan aktif berdua" belum tervalidasi 1 data point; kalau pola dominan "solo-lead + partner pasif", share-link premium (sudah di roadmap) menjawab ~95% kebutuhan. Model data = `candidate_shares` additive (TOLAK workspace_id migrasi 21 file). Skor collaborator DITUNDA (satu-skor-owner DITOLAK PO — langgar "bobot=pilihan user"). PENDING VALIDASI-2 (2 hari) + konfirmasi Faisal (Q1 eksekusi share-link, Q2 batas free/premium).

### 💰 Monetization
*Fitur yang berhubungan dengan revenue model Hunian*

- 🔵 [Monetisasi — Freemium + Premium](monetization-freemium-premium.md) — gate di OUTPUT (deliverable) bukan INPUT; extraction/kandidat unlimited gratis; premium = foto cloud/share-link/PDF memo/nego script AI; manual-premium dulu (validasi WTP transfer manual); Rp59rb/siklus hipotesis. Model Fomo & subscription DITOLAK.

---

## Rejected Features

Fitur yang diputuskan untuk tidak dibangun, beserta alasannya.
Ini penting untuk di-track agar tidak diusulkan ulang tanpa alasan baru.

| Feature | Alasan ditolak | Tanggal | Kondisi untuk reconsider |
|---|---|---|---|
| — | — | — | — |

---

*Index ini di-generate dan di-maintain oleh Orchestrator.*
*Untuk detail lengkap setiap fitur, lihat file di folder `next-feature/`.*