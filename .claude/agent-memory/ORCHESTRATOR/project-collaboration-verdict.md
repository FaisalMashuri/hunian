---
name: project-collaboration-verdict
description: Verdict sesi 2026-07-06 fitur Collaboration (undang pasangan) — DEFER-dengan-gate, model data candidate_shares additive, skor ditunda, 2 gate Faisal pending
metadata:
  type: project
---

Sesi 2026-07-06 fitur **Collaboration** (undang pasangan berbagi & analisis hunian bersama). Verdict tim = **DEFER-DENGAN-GATE**, Confidence MEDIUM, status PO UNCERTAIN (PENDING Faisal).

**Why (akar keputusan):** premis "pasangan AKTIF berdua mengevaluasi" belum tervalidasi 1 data point pun (DA-C3, tantangan terpenting). Kalau pola dominan ID = "solo-lead + partner PASIF approver", share-link read-only (sudah PREMIUM di roadmap [[project-monetization-verdict]]) sudah menjawab ~95% kebutuhan → collaboration 2-arah = over-build. Alasan DEFER BUKAN karena mahal (TL: slice read-only ~3-4 hari, additive). Mengulang pola sesi browser-extension (asumsi menolak asumsi).

**How to apply (jangan usulkan ulang tanpa alasan/data baru):**
- Model data (bila GO) = **Opsi A `candidate_shares` + `invitations` ADDITIVE**. JANGAN usulkan `workspace_id`/`household_id` — DITOLAK (migrasi 21 file `.eq("user_id")` + backfill live + isu bobot ganda). Reversibel. Helper terpusat `assertCandidateAccess`.
- **Skor collaborator DITUNDA.** "Satu skor owner untuk collaborator" DITOLAK PO (langgar prinsip terkunci "bobot=pilihan user") kecuali collaborator bisa atur bobot sendiri. Rata-rata bobot DITOLAK (skor fiksi). Jangan sentuh scoring engine untuk scope ini.
- Real-time DITOLAK (Supabase Realtime tak kompatibel service-role client); async sync-on-open.
- Sebelum commit kode apa pun: **VALIDASI-2** = tanya pilot "pernah screenshot Compare & kirim ke pasangan?" (2 hari, pemutus DEFER vs GO / pull-signal).

**2 GATE FAISAL PENDING (default 48 jam):** Q1 = share-link eksekusi sekarang vs tunggu validasi (default sekarang). Q2 = invite 1 partner gratis vs premium (default gratis) — bergantung gate freemium Q1 2026-06-29 yang masih pending.

Artefak: `next-feature/collaboration-partner.md`, `sessions/2026-07-06-collaboration.md`. Terkait proses: [[feedback-subagent-orchestration]].
