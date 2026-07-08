# Sesi 2026-06-29 — Monetisasi Hunian: Model Fomo → Pivot Freemium/Premium

**Tipe:** Strategic / monetisasi. **Status akhir:** 🙋 PENDING CONFIRMATION (substansi ALIGNED).
**Agents:** STR · TL · PM · UX · DA · SYN · PO (dua wave).
**Confidence:** MEDIUM (0 user menyelesaikan siklus end-to-end → aha-moment & WTP masih asumsi).
**Artefak:** `next-feature/monetization-freemium-premium.md` (utama), analisis Fomo diarsip di `.claude/agent-memory/agent-strategist/project-monetization-fomo.md`.

---

## Konteks & Intent

Lanjutan sesi monetisasi yang terputus. Verdict awal (sebelumnya): freemium + one-time per-cycle Rp49-79k + Saweria donasi; ceiling lifestyle ~Rp50-150jt/th; constraint NO ADS / NO jual data individual.

Founder (Faisal) mengusulkan model baru ala **Fomo** (kontribusi data sewa anonim → subscribe Rp50rb buka market-intelligence agregat). Sesi ini menganalisisnya, lalu founder **menolak Fomo** dan memilih **freemium+premium klasik**, lalu menambah pertanyaan **"full free dulu, monet belakangan"**.

---

## WAVE 1 — Analisis Model Fomo (STR · TL · PM · UX)

**STR:** Whitespace NYATA = data hasil nego + biaya all-in (Mamikos tak bisa publikasikan tanpa khianati supply-side = conflict-of-interest struktural). TAPI "timing inversion": user butuh data sebelum memutuskan, baru bisa kontribusi setelah. Rekom: kumpulkan diam-diam sbg by-product cycle gratis → moat untuk cycle fee. JANGAN jual sekarang.

**TL:** Cold-start math: unit = kecamatan, k=5. ~1800 cell Jabodetabek. 200 MAU@30% kontribusi = 0.1 data/cell (mayoritas kosong). Butuh ~500 MAU baru bermakna di area padat. Schema TAK punya `area_kecamatan` (perlu reverse geocode ~$5/1000). `luas` sering NULL → per-m² gagal; pakai median `harga_efektif` per cell, rolling 12 bln. Materialized view (Option A, zero new pipeline). Anti-spam: Tukey outlier + account-age gate + rate limit (SQL murah). Defer paywall; launch free saat data cukup.

**PM:** Reject standalone subscription (frekuensi rendah bunuh recurring). Absorb "X% di atas pasar" sbg fitur GRATIS pendorong completion. Credit/one-time-unlock, bukan subscription. Test WTP via mock landing.

**UX:** Kontribusi = by-product zero-effort → bottleneck bukan willingness, tapi densitas N. Sequencing paywall menentukan trust: Model A (gotong royong) vs Model B (tol). Data nego sensitif (owner-trace) → bucket ≥20, tampilkan RANGE bukan presisi. N≥30 sebelum tampil angka. Barter murni → gaming/junk.

## WAVE 2 — Devil's Advocate (Fomo)

5 tantangan, C5 BLOCKING (0 user selesai siklus → diskusi monetisasi prematur; bahkan kolom kecamatan = salah fokus). C1 (defer 12-18 bln = prokrastinasi), C2 ("X% di atas pasar" tak ubah keputusan / false confidence), C3 (moat nego rapuh — Mamikos bisa derive), C4 (agregat N-rendah merusak trust). Tidak mencabut satu pun.

## SYN (Fomo)

Memisahkan dua debat yang tercampur: (1) strategi data sebagai diferensiasi, (2) cara monetisasi. Verdict: ambil **mechanic** Fomo (contribute-to-unlock), buang **billing** subscription. Intel dasar (RANGE, bukan persentase) = fitur gratis; deeper intel = unlock dalam per-cycle flow existing. DA-C3 DICABUT (rebuttal: Mamikos conflict-of-interest struktural; segmen kontrakan tak terlayani; moat = kombinasi sinyal survey+nego+all-in). C1 dimodifikasi (event-trigger ganti kalender). C2/C4/C5 dipertahankan.

## PO (Fomo)

PENDING CONFIRMATION, substansi ALIGNED. Menambah gate yang SYN lewatkan: **informed consent** saat kontribusi data (Trigger Level 1, komitmen prinsip "user in control").

---

## PIVOT FOUNDER

Faisal: *"kayaknya model kayak fomo itu ga cocok buat hunian, gimana kalau fitur premium dan freemium dulu aja. fitur apa aja yang dikasih gate premium, tapi freemium bisa tapi terbatas (tapi kalau fitur di premium itu terlalu mahal untuk dikasih gratis maka di kunci aja)."*

→ Model Fomo dihentikan. Arah baru: freemium + premium klasik, klasifikasi tiap fitur ke FREE / FREEMIUM-LIMIT / LOCKED.

---

## WAVE 3 — Freemium/Premium Gating (PM · TL)

**PM:** FREE = unlimited siklus, 3 kandidat/siklus, scoring 5D, Compare, survey, foto lokal OPFS, biaya all-in, nego tracker, timeline, POI. AI explanation di-bundle (gratis). PREMIUM Rp59rb/siklus: kandidat unlimited, foto cloud, share-link, PDF memo, nego script AI. AI explanation bundle (cost marginal 0 setelah extraction).

**TL (baca codebase):** Koreksi penting — AI calls MURAH (~$0.0004-0.0013); cost per-user TERBESAR = **Google Directions POI rute (~$0.125/user)**, wajib gate. Foto: gate CLOUD SYNC bukan kemampuan foto (storage = pemecah free-tier). Limit kandidat usul 5 (vs PM 3). Enforcement: `user_usage_counters` table atomic + candidate COUNT; JWT-claim & RLS-count ditolak. Gate POI+foto cloud → free tier aman 5000-10000 MAU. Semua gate reversibility HIGH.

## WAVE 4 — Devil's Advocate (Gating)

6 tantangan. **C2 DECISIVE:** gate di OUTPUT bukan INPUT — limit kandidat bunuh aha-moment; extraction harus unlimited. C1 (gating infra prematur, manual-premium dulu). C3 (full-lock end-journey tanpa preview = 0% conversion → preview static). C4 (foto OPFS false-persistence → trust damage; butuh warning + export ZIP). C5 SEBAGIAN DICABUT (Rp59rb OK sbg hipotesis; "siklus" ambigu + butuh exit-survey). C6 (POI: TL benar gate di scale, tapi crow-flies MENYESATKAN → harus road-based Overpass). Insight pemandu: **% kandidat yang di-add benar-benar di-Compare** = metrik pembuka; jika <30%, monetisasi irrelevant.

## SYN (Gating)

- PM keliru 2 hal: limit kandidat (prior-verdict mengikat "JANGAN limit kandidat") & POI gratis (Directions = cost terbesar).
- Arsitektur bersih: **FREE = akses penuh semua INPUT + ANALISIS** (extraction & kandidat unlimited, scoring, Compare, survey). **PREMIUM = hanya OUTPUT deliverable** yang butuh cloud / AI-generation baru (foto cloud, share-link, PDF, nego script).
- Foto OPFS: 2 safeguard WAJIB sebelum ship (warning banner + export ZIP).
- POI terblokir spike Overpass road-routing (1 hari); crow-flies BUKAN opsi.
- Manual-premium dulu (transfer + flag `is_premium`); jangan bangun otomasi gating prematur.

## PO (Gating + "Full Free Dulu")

ALIGNED secara vision (gate di output konsisten dgn "Compare wajib gratis"; kandidat unlimited benar; manual-premium benar). Safeguard foto OPFS = blocking, bukan optional.

**"Full free dulu" = dua pertanyaan:** (a) tunda **paywall enforcement** sambil model sudah diputuskan = persis rekomendasi tim, lanjut. (b) tunda **keputusan model sama sekali** = JEBAKAN (low-frequency → churn sebelum di-monet; COGS AI jalan tanpa revenue; tanpa instrumentasi hari-1 "user banyak" = data sampah). Yang ditunda = PAYWALL, BUKAN model.

---

## KEPUTUSAN FINAL (mengikat, pending konfirmasi Faisal)

1. Model Fomo & subscription bulanan **DITOLAK**.
2. Freemium gate di **OUTPUT bukan INPUT**: extraction & kandidat **unlimited gratis**; scoring/Compare/survey/biaya/nego-tracker/timeline GRATIS.
3. PREMIUM (output deliverable): foto cloud sync, share-link, PDF memo, nego script AI — dengan **preview static** (bukan full-lock).
4. POI: premium = Google Directions; free = road-based estimate (pending spike Overpass); **crow-flies bukan opsi**.
5. Foto OPFS free: **WAJIB** warning prominent + export ZIP (blocking).
6. **Manual-premium dulu** (transfer + flag `is_premium`); otomasi gating (counter table) HANYA setelah cycle-completion terbukti & ≥3 transfer manual.
7. Harga Rp59rb/siklus one-time = hipotesis diuji; definisi "siklus" eksplisit + exit-survey.
8. "Full free dulu" diterima HANYA sbg penundaan paywall, BUKAN penundaan keputusan model; instrumentasi (cycle-completion, % di-Compare, WTP signal) dirancang sejak hari 1.

## Kill-condition & Revisit

- Kill: 30 hari, ≥100 user, <3 bayar sukarela → freeze monetisasi. Saweria pasif cover COGS.
- Revisit pembuka: jika % kandidat di-add yang di-Compare <30% → aha-moment belum terjadi, tunda semua monetisasi, fokus cycle completion.

## Gate Faisal (material)

- **G1:** "Full free dulu" = tunda paywall (default) atau tunda model (jebakan)? Konfirmasi.
- **G2:** Safeguard foto OPFS (warning + export ZIP) = blocking sebelum ship foto? (Default: Ya.)
- **G3 (opsional):** Rp59rb/siklus + definisi siklus eksplisit? (Default: Ya.)
