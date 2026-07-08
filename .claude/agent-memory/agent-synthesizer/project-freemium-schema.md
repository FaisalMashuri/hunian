---
name: project-freemium-schema
description: Verdict skema freemium/premium Hunian — matriks gating final, definisi paket, fasing, dan resolusi 6 konflik DA. Per 2026-06-29.
metadata:
  type: project
---

Sesi debat skema freemium/premium (2026-06-29). Input: PM, TL, DA. UX/STR tidak di-spawn.

**Keputusan final yang SETTLED:**

1. Extraction dan kandidat: UNLIMITED. Gate di OUTPUT (fitur deliverable), bukan INPUT.
   Prior verdict "JANGAN limit kandidat" mengikat. PM's posisi limit 3 overridden.

2. POI: Free = Overpass road-based estimate (spike TL 1 hari untuk konfirmasi feasibility).
   Jika tidak feasible: omit distance dari free tier entirely.
   Premium = Google Directions cached. CROW-FLIES TIDAK BOLEH DITAMPILKAN EVER.
   Google Directions = $0.125/user = cost terbesar, tidak bisa gratis.

3. Foto: OPFS lokal tetap untuk free (cost valid). DUA safeguard WAJIB sebelum ship:
   (a) warning BANNER saat foto pertama ditambahkan
   (b) export foto ZIP gratis always visible
   Premium = cloud sync Supabase Storage.

4. Preview static WAJIB untuk PDF dan nego script sebelum lock.
   Sample output (bukan data user) visible ke semua user sebagai CTA upgrade.

5. Definisi siklus wajib tampil di UI: "Siklus ini aktif sejak [tanggal]."

6. Manual premium dulu: Faisal set is_premium=true manual via Supabase dashboard.
   Counter table dan payment gateway DITUNDA sampai Gate 2 terpenuhi.

7. Exit survey 1 pertanyaan saat user exposed paywall tapi tidak upgrade.

**MATRIKS RINGKAS:**
- FREE: unlimited siklus/kandidat/extraction, scoring, Compare, survey, nego tracker,
  biaya all-in, timeline, foto OPFS + safeguard, POI road-estimate, preview PDF/nego
- PREMIUM Rp59rb/siklus: foto cloud sync, POI Google Directions, share-link,
  PDF memo actual, nego script AI actual

**Verdict DA:**
- C1 DIPERTAHANKAN (infra prematur) — is_premium trivial check boleh, counter table tidak
- C2 DIPERTAHANKAN PENUH (gate input bunuh aha-moment) — PM overridden
- C3 DIPERTAHANKAN PENUH (preview wajib sebelum lock)
- C4 DIPERTAHANKAN SEBAGIAN (OPFS ok, tapi warning + ZIP wajib)
- C5 DIPERTAHANKAN SEBAGIAN (harga ok, definisi siklus + exit survey wajib)
- C6 DIPERTAHANKAN PENUH (crow-flies menyesatkan, Overpass atau omit)

**3 Gate Faisal:**
- Gate 1: Preview static + OPFS safeguard READY sebelum launch premium
- Gate 2 (kill-condition): >=3 transfer manual terkonfirmasi dalam 30 hari / 100 user
- Gate 3: cycle completion >40% AND >=5 WTP → baru build counter table/payment gateway

**Why:** 0 user selesai siklus end-to-end. Semua WTP angka masih spekulasi. Lean validation via manual transfer lebih murah dari infra otomasi.

**How to apply:** Default ke gate output, bukan input. Jika ada debat fitur mana yang di-gate, tanya: apakah ini INPUT (data analysis) atau OUTPUT (deliverable yang butuh cloud resource)? Input = gratis. Output = premium kandidat.

[[project-hunian-mvp]] [[project-hunian-stack]]
