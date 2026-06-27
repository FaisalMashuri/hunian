---
name: project-slice2-gate
description: Vision gate Slice 2 Hunian — status UNCERTAIN, 2 gate BLOCKING untuk Faisal (bobot dimensi baru + migration sign-off), deadline sebelum TL finalize S2-2
metadata:
  type: project
---

Sesi perencanaan Slice 2 menghasilkan verdict dari Synthesizer. PO gate: UNCERTAIN — 2 pertanyaan BLOCKING sebelum eksekusi bisa dimulai.

**Why:** Synthesizer confidence MEDIUM (behavioral bet survey belum teruji); verdict mengandung asumsi tentang default bobot yang berpotensi melanggar keputusan terkunci Faisal ("bobot SELALU = pilihan user").

**Keputusan Slice 2 yang sudah SETTLED (tidak perlu konfirmasi ulang):**
- MVP scope: S2-0 (aktivasi DB) + S2-2 (survey fisik → skor 5 dimensi) + S2-4 (negosiasi harga) + S2-5 (biaya all-in display-only) + events-as-side-effect
- Biaya all-in = DISPLAY ONLY, tidak masuk scoring formula, wajib callout bila partial data
- Survey = 6D langsung (Kondisi, Owner, Harga, Lokasi, Fasilitas — lebih Kondisi+Owner dulu)
- Migration ke scoring v2.0 = ONE-SHOT (bukan lazy+badge) — Compare hero feature butuh konsistensi
- Foto survey dijahit ke review S2-2, bukan standalone gallery
- insertCandidateEvent = P0 (side-effect tanpa UI timeline)
- S2-3, S2-6, S2-7, S2-8 defer
- DeriveVerdict: perubahan harus explicit, framing tetap trade-off (bukan winner label)

**GATE BLOCKING — perlu jawaban Faisal sebelum TL finalize S2-2:**

G1 (BARU, vision-derived): Di mana user mengatur bobot untuk Kondisi & Owner?
- Kondisi & Owner = 2 dimensi baru yang belum ada di mekanisme Prioritas/bobot user existing
- Prinsip terkunci: "bobot SELALU = pilihan user"
- Opsi A: Masuk ke settings bobot yang bisa diubah user (default EQUAL, override kapanpun) — konsisten dengan prinsip
- Opsi B: Default EQUAL, fixed di Slice 2, user bisa ubah di Slice 3+
- Opsi C: Default RENDAH, fixed
- Default jika diam: TIDAK ADA (BLOCKING — TL tidak bisa finalize scoring formula)

G2 (= F2 Synthesizer): Sign-off one-shot migration
- Deploy S2-2 akan mengubah skor semua kandidat pilot (3D → 5D), ranking bisa berubah
- Faisal perlu inform pilot users sebelum deploy
- Default jika diam: TIDAK ADA (TL tidak deploy S2-2 tanpa konfirmasi ini)

**How to apply:** Sebelum eksekusi S2-2 dimulai, pastikan G1 dan G2 sudah dijawab Faisal. Tech spec scoring formula v2.0 tidak bisa difinalisasi tanpa G1. Deploy S2-2 tidak bisa dilakukan tanpa G2.

Related: [[project-slice1-decisions]] [[project-hunian-vision-principles]]
