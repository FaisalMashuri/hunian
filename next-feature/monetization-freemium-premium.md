# Monetisasi — Freemium + Premium (Gate di Output, Manual-Premium Dulu)

<!--
  Di-generate oleh Orchestrator, sesi debat 2026-06-29.
  Founder MENOLAK model "Fomo-style" (lihat bagian Alternatif Ditolak) dan memilih freemium+premium klasik.
  Edit hanya section bertanda [FAISAL UPDATE].
-->

## Status

```
[ ] Backlog       — identified, belum dijadwalkan
[x] In Discussion — sedang didebat agent team
[ ] Approved      — Product Owner approved, siap dibangun
[ ] In Progress   — sedang dibangun
[ ] Done          — selesai dan shipped
[ ] Rejected      — tidak akan dibangun, dengan alasan
```

**Current status:** `[x] In Discussion` (arsitektur gating ALIGNED secara vision; menunggu konfirmasi Faisal 2 gate)
**Last updated:** 2026-06-29
**Session:** `sessions/2026-06-29-monetization-fomo.md`
**Confidence:** MEDIUM (0 user selesai 1 siklus end-to-end → aha-moment & WTP masih asumsi)

---

## Deskripsi Singkat

> Model freemium klasik dengan prinsip **gate di OUTPUT, bukan INPUT**: semua input + analisis (extraction unlimited, kandidat unlimited, scoring, Compare, survey) GRATIS; hanya output deliverable yang butuh cloud resource / AI-generation baru yang premium. Paywall enforcement DITUNDA — validasi WTP via transfer manual dulu.

---

## Deskripsi Lengkap

### Apa fitur ini?

Founder menolak model "Fomo-style" (kontribusi data → unlock agregat) karena dinilai tidak cocok untuk Hunian, dan memilih **freemium + premium klasik**. Pertanyaan inti yang dijawab: fitur mana di-gate premium, mana freemium-terbatas, mana dikunci penuh karena terlalu mahal digratiskan.

Insight kunci dari debat (DA, dikuatkan SYN): **gate di OUTPUT bukan INPUT**. Membatasi extraction/jumlah kandidat (usulan awal PM 3, TL 5) akan membunuh aha-moment karena Compare (hero) butuh ≥2-3 kandidat untuk terasa ajaib. Lagipula prior-verdict monetisasi sudah mengikat **"JANGAN limit kandidat"**. Maka: biarkan user memasukkan semua kandidat nyata mereka (sticky, aha-moment tercapai), gate hanya muncul saat user siap **BERTINDAK** (share, cetak, generate skrip) — momen WTP tertinggi.

Koreksi teknikal penting (TL membaca codebase): biaya per-user terbesar **BUKAN AI** (AI calls ~$0.0004-0.0013/call, murah) melainkan **Google Directions untuk POI rute asli (~$0.125/user)**. Maka POI rute asli wajib di-gate di scale, bukan AI extraction.

### Siapa yang paling diuntungkan?

- **Primary:** Pencari hunian aktif (mahasiswa, young professional) — dapat seluruh nilai keputusan gratis, bayar hanya untuk deliverable yang mereka butuhkan saat closing.
- **Secondary:** Hunian (solo dev) — COGS terkendali (gate di cost-driver nyata: cloud storage foto + Google Directions), free tier aman sampai ~5000-10000 MAU.

### Di stage mana user journey ini terjadi?

```
discover → shortlist → compare → negotiate → [DECIDE ← paywall deliverable di sini] → move in
```

---

## Kenapa Fitur Ini Dibangun

### Alasan dari debat

- **PM:** Free tier harus bisa selesaikan 1 siklus penuh & alami aha-moment; gate di titik COGS-heavy + high-value end-journey.
- **TL (codebase nyata):** AI murah, gateable server-side; cost driver nyata = storage foto + Google Directions; scoring/Compare client-side = TAK bisa di-gate aman.
- **DA (decisive):** Gate di OUTPUT bukan INPUT — extraction/kandidat unlimited; preview untuk end-journey; safeguard foto OPFS; jangan bangun otomasi gating prematur.
- **SYN:** Limit kandidat ditolak (langgar prior-verdict); arsitektur bersih FREE=input+analisis / PREMIUM=output deliverable; manual-premium dulu.

### Pain point yang di-solve

- Solo dev butuh model revenue yang tidak membakar COGS di scale, tanpa membunuh completion rate — severity: **MEDIUM**.
- User butuh merasakan nilai penuh sebelum bayar (trust di pasar Indonesia) — severity: **HIGH**.

### Market gap yang diisi

Bukan tentang market gap kompetitor — ini keputusan revenue-model internal. Differentiator (survey fisik, Compare trade-off) tetap GRATIS justru untuk menjaga keunggulan vs Mamikos.

---

## Tradeoff yang Disadari

### Keputusan yang diambil

| Keputusan | Dipilih | Tidak dipilih | Alasan |
|---|---|---|---|
| Titik gate | OUTPUT (deliverable) | INPUT (limit extraction/kandidat) | Gate input bunuh aha-moment; prior-verdict "JANGAN limit kandidat" mengikat |
| Limit kandidat | UNLIMITED (free) | 3 (PM) / 5 (TL) | Compare butuh banyak kandidat; convert saat bertindak, bukan saat mengumpulkan |
| AI extraction/explanation/red-flags | FREE (soft-limit anti-abuse saja) | Gate/credit | Cost murah (~$0.0004); ini hook acquisition + comprehension (trust skor) |
| Foto | Cloud sync = PREMIUM; foto lokal (OPFS) = free | Foto cloud limited-free; foto = premium penuh | Storage = cost driver; tapi WAJIB 2 safeguard (lihat bawah) |
| POI rute | Premium = Google Directions; free = road-based estimate (pending spike) | Free = Google Directions (PM); free = crow-flies (TL) | Directions = cost terbesar; crow-flies MENYESATKAN (Jakarta) → bukan opsi |
| Nego script AI / PDF memo / share-link | PREMIUM (output deliverable) tapi dengan PREVIEW static | Full-lock tanpa preview | Full-lock tanpa preview = ~0% conversion (beli promise, bukan product) |
| Enforcement | MANUAL dulu (transfer + flag `is_premium`) | Bangun counter table/tier logic sekarang | Prematur (0 user selesai siklus); langgar verdict "validasi WTP manual dulu" |
| Harga | Rp59rb/siklus one-time (hipotesis diuji) | Subscription; Rp49rb/Rp79rb | Frekuensi rendah bunuh subscription; Rp59rb = serius tapi impulse-friendly |

### Yang kita korbankan

LTV per user lebih rendah (one-time vs recurring) dan revenue tertunda (free tier kaya). Diterima sadar: completion rate + trust > revenue dini yang mengorbankan funnel. Juga: user free yang ganti device bisa kehilangan foto lokal (dimitigasi safeguard).

### Yang akan jadi masalah kalau asumsi ini salah

Asumsi terbesar (DA-C1): **belum ada SATU user pun menyelesaikan siklus end-to-end** — aha-moment via Compare belum terbukti pada user nyata. Jika cycle completion rendah, seluruh diskusi monetisasi = kastil di atas pasir. Metrik pembuka: **% kandidat yang di-add benar-benar di-Compare** (jika <30% → Compare tak dipakai, monetisasi irrelevan).

---

## Technical Approach

**Feasibility:** ✅ Feasible (semua gate reversibility HIGH; tak ada migrasi kecuali counter table additive — dan itu pun ditunda).

**Stack yang digunakan:**
- Server-side gateable: AI routes (extract/red-flags/summary/memo/nego-script), foto upload queue → Supabase Storage, Google Directions, share-link (Supabase Realtime, belum dibangun), PDF (jika server-side).
- TAK gateable (client/IndexedDB): scoring rule (`recompute.ts`), Compare (`bandingkan`), deal-breaker eval, survey scoring, biaya all-in display. → tetap GRATIS.

**Opsi enforcement (untuk NANTI, bukan sekarang):**

| Opsi | Pros | Cons | Dipilih? |
|---|---|---|---|
| A: `user_usage_counters` table (counter atomic server-side) + candidate COUNT | Reliable, per-user, tak bypassable | +1 DB roundtrip/call (~5-10ms) | ✅ Ya (saat dibangun) |
| B: JWT claim + middleware | Cepat (no DB) | Counter tak bisa, tier-change tak propagate instan | ❌ Tidak |
| C: RLS row-count policies | — | Service-role BYPASS RLS; full-scan risk; susah debug | ❌ Tidak |

**Tahap SEKARANG (manual-premium):** transfer manual ke rekening → Faisal set flag `is_premium` manual. TIDAK perlu counter table/upload-queue logic.

**Effort estimate:** Otomasi gating 1-2 hari (saat dibutuhkan; bukan foundational). Spike Overpass road-routing: 1 hari (BLOCKING keputusan POI free tier).

**Reversibility:** Semua gate HIGH (toggle flag/hapus check). Tak ada data-loss/migration.

**Risiko teknikal:**
- Foto OPFS false-persistence → trust damage. Mitigasi WAJIB (blocking ship): (1) warning banner prominent saat upload foto pertama ("foto tersimpan di perangkat ini saja, hilang bila ganti device/clear cache"), (2) tombol export foto sebagai ZIP gratis.
- POI crow-flies menyesatkan di Jakarta (sungai/tol/macet). Mitigasi: crow-flies BUKAN opsi; spike Overpass road-routing dulu — jika tak bisa road-based, free tier TIDAK menampilkan distance sama sekali.
- Rate-limit existing (`lib/ai/rate-limit.ts`) IP-based in-memory = bypassable, bukan tier-enforcement. Retain hanya sbg abuse protection.

---

## Product Owner Notes

**Vision alignment:** ✅ ALIGNED — gate di output (bukan Compare/input) konsisten penuh dengan "Compare WAJIB gratis" & aha-moment. Kandidat unlimited benar. Manual-premium dulu benar. Tidak ada yang menggeser Hunian ke marketplace.

Conditional (blocking, bukan optional): **safeguard foto OPFS** (warning + export ZIP) — tanpa ini, "user in control atas datanya" dilanggar dan trust damage terlalu tinggi.

**Konfirmasi dari Faisal:** PENDING
**Tanggal konfirmasi:** —

---

## Open Questions

1. % kandidat yang di-add pilot user benar-benar di-Compare? — validasi: data Slice 1 / observasi 3 user pertama. Jika <30% → aha-moment belum terjadi, tunda monetisasi.
2. Apakah Overpass bisa road-based walking distance (bukan crow-flies)? — validasi: spike teknis 1 hari. Menentukan free tier POI.
3. WTP nyata? — validasi: transfer manual ≥3 orang setelah cycle completion terbukti.
4. Kenapa user TIDAK bayar (bila terjadi)? — validasi: exit-survey 1 pertanyaan saat tolak paywall.

---

## Next Actions

- [ ] **Spike Overpass road-routing (1 hari)** — menentukan POI free tier. — owner: Faisal/TL — by: sebelum desain UI POI
- [ ] **Instrumentasi sejak hari 1 (walau paywall ditunda):** track cycle-completion, % kandidat di-Compare, fitur mana paling dipakai, definisi "siklus" eksplisit di data. — owner: Faisal — by: sekarang
- [ ] **Manual-premium pilot:** semua fitur unlock untuk pilot; observasi engaged user; siapkan flag `is_premium` manual. — owner: Faisal — by: fase pilot
- [ ] **Safeguard foto OPFS (blocking sebelum ship foto):** warning banner prominent + export ZIP. — owner: Faisal — by: sebelum fitur foto live
- [ ] **GATE WTP:** transfer manual ≥3 orang setelah cycle completion terbukti → baru bangun otomasi gating. — owner: Faisal
- [ ] Kill-condition: 30 hari, ≥100 user, <3 bayar sukarela → freeze monetisasi. Saweria pasif cover COGS.

---

## Catatan Faisal

<!-- [FAISAL UPDATE] -->

**GATE FAISAL (material, butuh jawaban; default 48 jam ada):**
- **G1 — "Full free dulu" maksudnya apa?** (a) Tunda **paywall enforcement** sambil model sudah diputuskan = SUDAH persis rekomendasi tim, lanjut saja. (b) Tunda **keputusan model sama sekali** = JEBAKAN (low-frequency → user churn sebelum di-monet; COGS AI jalan tanpa revenue; tanpa instrumentasi hari-1 "user banyak" = data sampah). Default jika diam: (a). Konfirmasi mana yang dimaksud.
- **G2 — Safeguard foto OPFS = blocking?** Setuju warning prominent + export ZIP wajib sebelum fitur foto free di-ship? (Rekom & default: Ya, blocking.)
- **G3 (opsional) — Harga Rp59rb/siklus + definisi "siklus":** Setuju Rp59rb sbg hipotesis awal & definisi siklus dibuat eksplisit di UI? (Rekom: Ya.)

---

## Alternatif yang Ditolak (arsip)

- **Model "Fomo-style"** (kontribusi data sewa anonim → subscribe Rp50rb buka market-intelligence agregat). Dianalisis penuh sesi ini (STR/TL/PM/UX/DA/SYN/PO) — verdict tim: ambil mechanic, buang billing subscription. **Founder akhirnya MENOLAK** ("kayaknya ga cocok buat hunian"). Analisis lengkap diarsip di `.claude/agent-memory/agent-strategist/project-monetization-fomo.md` + transcript sesi. Whitespace data nego/all-in tetap dicatat sebagai potensi moat jangka panjang bila kelak relevan; JANGAN usulkan ulang tanpa alasan baru.
- **Subscription bulanan** — frekuensi pakai rendah membunuh recurring.
- **Limit jumlah kandidat/extraction** — bunuh aha-moment (Compare); langgar prior-verdict.

---

## Riwayat

| Tanggal | Event | Catatan |
|---|---|---|
| 2026-06-29 | Sesi monetisasi (lanjutan terputus) | Mula: analisis model Fomo |
| 2026-06-29 | Founder tolak Fomo, pivot freemium | Faisal: "kayaknya ga cocok buat hunian" |
| 2026-06-29 | Debat gating selesai | Agents: PM·TL·DA·SYN·PO. Confidence MEDIUM |
| 2026-06-29 | PO verdict | ALIGNED (vision); PENDING 2-3 gate Faisal; safeguard foto = blocking |
