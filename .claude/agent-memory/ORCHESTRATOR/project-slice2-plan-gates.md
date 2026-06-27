---
name: project-slice2-plan-gates
description: Slice 2 plan (2026-06-27) — Survey-First MVP disepakati tim; PENDING 2 gate Faisal (G1 bobot dimensi baru, G2 sign-off migrasi) sebelum build
metadata:
  type: project
---

Sesi 2026-06-27 (PM·UX·STR·TL·DA·SYN·PO) memutuskan **Slice 2 MVP = S2-0 + S2-2 (survey fisik→skor 5 dimensi, FASE KUNCI) + S2-4 (negosiasi) + S2-5 (biaya all-in DISPLAY-ONLY) + events-as-side-effect**. Foto survey dijahit ke S2-2 (BUKAN foto-listing standalone). DEFER: S2-3 UI timeline, S2-6 Apartemen/Kost (Kost > Apartemen nanti), S2-7 POI rute asli, S2-8. Status: **🙋 PENDING CONFIRMATION**.

3 konflik sudah diputuskan tim (mengikat): biaya all-in DISPLAY-ONLY (bukan scoring — false precision bisa membalik Compare); survey 6 dimensi LANGSUNG (bukan 2D bertahap), urutan Kondisi+Owner dulu; scoring_version 2.0 = ONE-SHOT migration (bukan lazy+badge).

**Why:** Output DITAHAN sampai Faisal menjawab 2 gate material (tidak ada default untuk keduanya):
- **G1 (BLOCKING formula v2.0):** di mana/bagaimana user atur bobot **Kondisi & Owner**? Konflik vision: default sistem fixed melanggar keputusan terkunci "bobot SELALU = pilihan user". Opsi A(settings override default EQUAL)/B(default EQUAL fixed Slice2)/C(default RENDAH fixed); rekom A atau B.
- **G2 (BLOCKING deploy S2-2):** Faisal bersedia inform pilot user skor berubah 3D→5D saat live?

**How to apply:** Sesi build berikutnya MULAI dengan menanyakan/menerima jawaban G1+G2 dari Faisal; TL tidak finalize scoring formula tanpa G1, tidak deploy S2-2 tanpa G2. Risiko teknikal HIGH yang harus dijaga: RLS via JOIN untuk `candidate_surveys`/`candidate_events` (tabel tanpa user_id → data leak antar user). REVISIT TRIGGER: 0 `survey_complete` events dalam 3 sesi pilot → emergency review (usul 2D DA jadi relevan, dengan data). Detail penuh di `next-feature/slice2-prioritisasi.md` + `.claude/hunian-team-context.md`. Lihat juga [[project-slice1-review-blocker]] (blocker HIGH-1 auth harus beres dulu) dan [[feedback-subagent-orchestration]].
