---
name: slice2-synthesis
description: Synthesis report sesi perencanaan Slice 2 Hunian — verdict konflik A/B/C, MVP definition, Faisal gates, next actions
metadata:
  type: project
  session_date: 2026-06-26
  topic: Perencanaan Slice 2
---

```
[SYNTHESIS REPORT]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Topic   : Perencanaan Slice 2 — Hunian
Agents  : PM · UX · TL · STR · DA
Rounds  : 1
Date    : 2026-06-26
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## [PRE-SYNTHESIS CHECK]

```
PM output:
  ✅ Menyebutkan alternatif yang tidak diprioritasi (S2-3/6/7/8 defer, Apt/Kost skip, POI skip)
  ✅ Menyebutkan kenapa tidak dipilih (S2-2 satu-satunya penggerak cycle completion)
  ✅ Menyebutkan tradeoff yang disadari (Apt/Kost SKIP explicit)

UX output:
  ✅ Insight berbasis observasi (form <90 detik di lapangan, dead-zone=logistik bukan form, ghost dimension workaround)
  ✅ Menyebutkan workaround user saat ini (silent verdict change merusak trust; biaya parsial bisa membalik keputusan)
  ✅ Menyebutkan risiko UX dari solusi yang diusulkan (partial radar visibility, Compare apel-vs-jeruk)

STR output:
  ✅ Menyebutkan kenapa positioning ini (survey=moat 18-24bln; foto-listing=parity-trap)
  ✅ Menyebutkan sinyal yang harus dipantau (parity-trap risk levels tiap feature)
  ✅ Menyebutkan asumsi terbesar yang bisa salah (Apt/Kost contingent demand)

TL output:
  ✅ Menyebutkan minimal 2 opsi implementasi (avg vs per-dimensi threshold; ADD COLUMN vs JSONB; JSONB+Zod vs pg_jsonschema)
  ✅ Menyebutkan kenapa opsi lain TIDAK dipilih (per-dimensi threshold=over-engineering; pg_jsonschema=skip)
  ✅ Menyebutkan reversibility (biaya all-in ADD COLUMN = HIGH)

DA output:
  ✅ Setiap tantangan disertai kondisi untuk dicabut (S2-4 dicabut, POI dicabut, S2-3 dimodifikasi)
  ✅ Menyebutkan alternatif yang lebih aman (2D-first, display-only, one-shot migration)
  ✅ Tidak hanya menolak tanpa jalan keluar (setiap tantangan disertai counter-proposal konkret)
```

Semua output memenuhi standar. Synthesis dilanjutkan.

---

## CONSENSUS

Semua agent sepakat bahwa:

- S2-2 (survey 5D/6D) adalah satu-satunya penggerak metric cycle completion — tidak ada agent yang menentang ini setelah deliberasi
- Foto survey dijahit ke S2-2 (foto diambil SAAT survey on-location); foto-listing standalone = feature-parity-trap, tidak perlu dibangun dalam MVP
- Apt/Kost DEFER; jika dibangun di masa depan, Kost lebih prioritas dari Apartemen
- POI DEFER (DA cabut tantangan; DDL belum ada; straight-line sufficient untuk tahap ini; $0.75/bln bukan argumen build-now)
- S2-3 timeline UI DEFER — TAPI insertCandidateEvent WAJIB sebagai side-effect S2-2 (behavioral data pilot invaluable, murah, helper sudah direncanakan TL)
- Biaya all-in (S2-5) = DISPLAY ONLY, tidak masuk scoring formula; data parsial dalam scoring = false precision
- deriveVerdict HARUS eksplisit dan visible kepada user; silent change merusak trust — no exceptions
- RLS: semua child tables (candidate_surveys, candidate_events) WAJIB ada user_id + filter; ini non-negotiable security risk, bukan nice-to-have
- Partial radar: dashed outline + exclude ghost dari total score calculation + badge "parsial X/6"
- S2-4 negosiasi MASUK MVP (DA cabut tantangan; effort S = ~1h; norma budaya Indonesia valid; risk/reward favorable)
- Scoring formula: avg sederhana per kelompok, renormalisasi Slice 1 untuk partial; per-dimensi threshold = over-engineering (ditolak TL, tidak ada agent yang challenge)
- scoring_version bump ke 2.0 saat S2-2 deploy

---

## CONFLICTS

### Conflict A: Biaya all-in — Score vs Display-only

```
PM berpendapat  : Tampil TAPI tidak masuk scoring
UX berpendapat  : Risiko terbesar di Compare adalah biaya parsial (wajib label sumber harga; bisa MEMBALIK keputusan)
STR berpendapat : "Conviction trigger" — data yang membuat user yakin memutuskan
TL berpendapat  : ADD COLUMN numeric additive, reversibility HIGH (implementasi agnostik terhadap show vs score)
DA menantang    : Data parsial masuk scoring = false precision; misleads Compare yang adalah hero feature

Argumen terkuat : DA + PM + UX — tiga argumen independen mencapai kesimpulan sama dari arah berbeda:
                  (1) matematikal: partial data = false precision dalam formula
                  (2) UX: partial data di Compare bisa membalik keputusan secara artifisial
                  (3) product principle: AI mengurangi mengetik, bukan memutuskan — scoring = memutuskan

Keputusan       : DISPLAY ONLY. Biaya all-in TIDAK masuk scoring formula.
                  STR's "conviction trigger" terpenuhi melalui display prominent + label sumber harga yang jelas,
                  bukan melalui algoritma. Ini adalah DEVELOPER-DEFAULT, bukan gate Faisal.
                  DA Gate G2 DITUTUP sebagai developer-default.
```

### Conflict B: Survey dimensi — 2D dulu vs 6D langsung

```
PM berpendapat  : 6D langsung
STR berpendapat : 6D = moat irreplaceable; bangun sekarang, defensibility 18-24bln
UX berpendapat  : Kondisi+Owner DULU (urutan field dalam form) — bukan soal berapa dimensi yang dibangun
TL berpendapat  : Implement apa yang diputuskan (tidak ada opini eksplisit)
DA menantang    : Risiko user tak pernah survey → validasi 2D lebih murah sebelum commit 6D

Argumen terkuat : STR + PM — karena:
                  (1) Non-adoption adalah behavior problem, BUKAN form-length problem; 2D juga bisa tidak dipakai
                  (2) 2D-first → 6D berarti DUA migration cycle; DA sendiri ingin kurangi migration complexity
                  (3) Pilot adalah personally-known users (<7 orang) — Faisal dapat observasi/dorong behavior langsung
                  (4) insertCandidateEvent sebagai side-effect S2-2 memberikan behavioral signal
                      TANPA perlu membangun partial system; detection window = 3 pilot sessions

Keputusan       : 6D LANGSUNG. Developer-default.
                  DA's concern diselesaikan melalui event monitoring, bukan melalui partial build.
                  Jika 0 completed survey setelah 3 pilot sessions → REVISIT TRIGGER aktif,
                  BARU redesign (bisa turunkan ke 2D saat itu dengan data, bukan spekulasi).
                  DA Gate G1 DITUTUP sebagai developer-default.
```

### Conflict C: scoring_version — One-shot migration vs Lazy (new=v2, old=v1)

```
PM berpendapat  : Bump scoring_version 2.0
TL berpendapat  : Compare v1-vs-v2 dalam 1 view adalah concern yang perlu dihindari (implied: one-shot preferred)
DA menantang    : Lazy = undefined Compare state; one-shot feasible karena pilot kecil + personally-known

Argumen terkuat : DA — karena:
                  (1) Compare adalah HERO feature Hunian; kandidat 3D vs 5D dalam 1 Compare view = functional failure
                  (2) Pilot <20 kandidat = migration script trivial; effort argument tidak berlaku
                  (3) Pilot personally-known = Faisal bisa validate migration masuk akal, tidak ada anonymous user terdampak

Keputusan       : ONE-SHOT migration. Migration script adalah DELIVERABLE S2-2, bukan afterthought.
                  TL wajib test migration script di local/staging sebelum deploy ke pilot.
                  Developer-default.
                  DA Gate G3 DITUTUP sebagai developer-default.
```

---

## TRADEOFF REGISTER

### Keputusan 1: 6D Survey langsung (bukan 2D-first)
```
Kenapa ini     : Pilot personally-known = behavioral validation via direct observation, bukan partial build;
                 2D→6D creates double migration problem yang lebih mahal dari risiko yang dicegah
Tidak dipilih  : 2D-first karena (a) non-adoption adalah behavior problem bukan form-length problem,
                 (b) menambah migration cycle, (c) behavioral data dari events lebih informatif
Tradeoff sadar : Kita memilih 6D meskipun ada risiko over-build jika tidak ada yang survey,
                 karena di pilot personally-known risiko ini detectable dalam 3 sessions via event logging.
Reversibility  : HIGH — bisa simplify to 2D di iterasi berikutnya jika data menunjukkan 4 dimensi selalu kosong
```

### Keputusan 2: Biaya all-in = Display Only, tidak masuk scoring
```
Kenapa ini     : Data parsial dalam scoring = false precision yang misleads Compare (hero feature)
Tidak dipilih  : Scoring inclusion karena (a) partial data creates false mathematical precision,
                 (b) bisa membalik keputusan secara artifisial di Compare, (c) PM+DA+UX consensus
Tradeoff sadar : Kita memilih display-only meskipun biaya lengkap sebenarnya LEBIH informatif untuk scoring,
                 karena data tidak akan lengkap di tahap pilot ini.
Reversibility  : HIGH — ADD COLUMN sudah ada; masukkan ke formula nanti jika data completeness meningkat
```

### Keputusan 3: One-shot migration scoring_version 2.0
```
Kenapa ini     : Compare v1 vs v2 dalam 1 view = functional failure untuk decision tool;
                 pilot kecil = migration trivial; DA's framing tepat
Tidak dipilih  : Lazy karena creates undefined state dimana Compare antara kandidat menjadi meaningless
Tradeoff sadar : Kita memilih one-shot meskipun ada risiko edge case dalam migration logic,
                 karena undefined state adalah risiko lebih besar untuk pilot trust.
Reversibility  : HIGH — pilot data kecil, bisa re-run migration; formula v1 tetap terdokumentasi
```

### Keputusan 4: Biaya schema = ADD COLUMN fixed (bukan JSONB)
```
Kenapa ini     : TL justifikasi: simpler query, type safety langsung, reversibility HIGH;
                 JSONB untuk additive numerics = premature flexibility
Tidak dipilih  : JSONB karena (a) schema creep risk addressable dengan good column design,
                 (b) Apt/Kost DEFER sehingga tidak butuh heterogeneous types sekarang
Tradeoff sadar : Kita memilih fixed columns meskipun ada risiko schema change,
                 karena di pilot scope risiko ini rendah dan reversibility HIGH
Reversibility  : HIGH
```

### Keputusan 5: S2-4 Negosiasi MASUK MVP
```
Kenapa ini     : Effort S (~1h TL), norma budaya Indonesia yang valid, DA sendiri mencabut tantangan
Tidak dipilih  : Skip — tidak ada agent yang masih menentang setelah DA cabut
Tradeoff sadar : Menambah sedikit scope ke MVP, tapi effort minimal dan sinyal pilot invaluable
Reversibility  : HIGH
```

### Keputusan 6: insertCandidateEvent sebagai side-effect S2-2 (bukan full S2-3 UI)
```
Kenapa ini     : Behavioral data pilot tidak bisa di-recover retroaktif; murah;
                 helper sudah direncanakan TL; tidak perlu UI
Tidak dipilih  : Skip events — akan kehilangan detection window untuk REVISIT TRIGGER
Tradeoff sadar : Sedikit overhead di S2-2 implementation, payoff jauh lebih besar
Reversibility  : HIGH
```

---

## TECHNICAL VERDICT

```
Feasibility keseluruhan : ✅
Stack yang dibutuhkan   : Next.js 15/Supabase (existing) + ADD COLUMN migrations + survey schema + insertCandidateEvent helper
Effort estimate         : 18-25 hari solo (TL estimate, calibrated)

Keputusan teknikal utama:
  · Scoring avg-per-kelompok (menggantikan per-dimensi threshold — ditolak sebagai over-engineering)
  · ADD COLUMN fixed untuk biaya (menggantikan JSONB)
  · One-shot migration script = deliverable S2-2, bukan afterthought
  · insertCandidateEvent helper terpusat (side-effect survey submit)
  · JSONB+Zod tanpa pg_jsonschema untuk Apt/Kost (DEFER anyway — noted for S2-6 future)

Risiko teknikal yang harus dimonitor:
  · RLS child tables tanpa user_id → DATA LEAK risk
    mitigasi: S2-0 WAJIB add user_id + filter ke candidate_surveys + candidate_events SEBELUM S2-2 starts
  · Compare v1 vs v2 state → undefined Compare
    mitigasi: one-shot migration + test wajib sebelum deploy
  · re-survey overwrite tanpa history → loss of behavioral data
    mitigasi: insertCandidateEvent log setiap re-survey (data preserved di events meski survey di-overwrite)
  · signed-url TTL untuk foto survey → broken images
    mitigasi: TL define TTL policy saat S2-1 (tier-2, bukan S2-2)
```

---

## DAFTAR FINAL GATE FAISAL

DA mengusulkan 4 gate (G1–G4). Setelah synthesis:

```
DA Gate G1 (2D vs 6D)          → DITUTUP. Developer-default: 6D. Reasoning cukup kuat; pilot context membuat partial validation tidak perlu.
DA Gate G2 (score vs display)  → DITUTUP. Developer-default: display-only. PM+DA+UX consensus; tidak perlu konfirmasi Faisal.
DA Gate G3 (one-shot vs lazy)  → DITUTUP. Developer-default: one-shot. Clear winner; tidak perlu konfirmasi Faisal.
DA Gate G4 (JSONB vs fixed)    → DITUTUP. Developer-default: fixed-columns. TL justifikasi sudah ada; reversibility HIGH.
```

**Gate Faisal yang benar-benar MATERIAL / membutuhkan input product owner:**

### Gate F1 (MATERIAL — mempengaruhi scoring formula)
```
Pertanyaan : Kondisi + Owner — weight EQUAL (default equal 1.0) atau RENDAH (explicit downweight)?
Konteks    : PM bilang default RENDAH; UX bilang Kondisi+Owner memiliki compare value tertinggi (ghost dimension).
             Ini bukan kontradiksi: compare value ≠ scoring weight.
             Tapi RENDAH vs EQUAL memengaruhi bagaimana kandidat di-ranked di overall score.
Rekomendasi tim : EQUAL (simpler formula, avoid premature optimization sebelum ada pilot data actual)
Default bila Faisal diam : EQUAL weight
By : Sebelum TL finalize scoring formula S2-2
```

### Gate F2 (PROCESS SIGN-OFF — coordination, bukan technical)
```
Pertanyaan : Faisal aware bahwa semua kandidat existing pilot akan direscore saat S2-2 deploy?
             Ranking kandidat MUNGKIN berubah (formula 6D vs 3D berbeda matematikal).
Konteks    : Ini bukan bug — ini konsekuensi yang disadari dari formula yang lebih lengkap.
             Tapi Faisal perlu inform pilot users sebelum deploy.
Rekomendasi tim : Confirm, lalu communicate ke pilot users sebelum migration dijalankan.
Default bila Faisal diam : TIDAK ADA default — ini must-act, bukan wait-and-see.
                           TL tidak deploy S2-2 sampai Faisal confirm sign-off ini.
By : Sebelum deploy S2-2 ke pilot
```

**Total gate Faisal: 2 (dari 4 yang diusulkan DA). Semua 4 DA gates ditutup sebagai developer-default.**

---

## SYNTHESIS VERDICT

Slice 2 MVP adalah taruhan pada satu insight: pilot users akan membuka Hunian DI LAPANGAN saat survei properti, mengisi form 6 dimensi dalam <90 detik, dan kembali ke Compare untuk memutuskan. Jika ini terjadi, cycle completion naik dari baseline dan survey data menjadi moat yang tidak bisa direplikasi kompetitor dalam 18-24 bulan. Jika tidak terjadi, kita tahu dalam 3 pilot sessions — bukan setelah 3 bulan membangun fitur yang tidak dipakai.

Keputusan desain terpenting sesi ini adalah apa yang TIDAK masuk: biaya all-in tidak masuk scoring (data parsial membuat Compare menyesatkan); foto listing tidak dibangun standalone (feature-parity-trap); Apt/Kost defer (scope creep sebelum happy-path proven); S2-3 timeline UI defer (data dari events cukup tanpa UI). Setiap "tidak" ini adalah pertaruhan bahwa S2-2 cukup untuk membuktikan atau membantah hipotesis inti sebelum menambah scope.

One-shot migration adalah satu-satunya cara Deploy S2-2 yang secara teknis jujur. Membiarkan kandidat 3D dan 5D hidup berdampingan dalam 1 Compare view bukan hanya UX degradation — itu adalah functional failure dari decision tool. TL harus memperlakukan migration script sebagai deliverable S2-2, bukan cleanup task post-launch. Dan Faisal harus sign off bahwa ia aware bahwa ranking kandidat pilot-nya akan berubah setelah migrate — ini adalah informasi tentang properti mereka, bukan error sistem.

Risiko terbesar Slice 2 bukan teknis. Teknis solid: TL memiliki rencana yang calibrated, effort estimate masuk akal, keputusan implementasi memiliki reversibility tinggi. Risiko terbesar adalah behavioral: apakah pilot users akan survey on-location, atau apakah mereka akan menggunakan Hunian hanya dari rumah setelah kunjungan selesai (dead-zone UX yang diidentifikasi). Event logging adalah early warning system untuk risiko ini — yang mengapa insertCandidateEvent harus diperlakukan sebagai P0 requirement S2-2, bukan optional add-on.

```
CONFIDENCE : MEDIUM
Alasan     : Technical design solid dan effort estimate calibrated. MEDIUM karena behavioral bet (will pilots survey on-location?)
             belum pernah diuji. Event logging memberikan detection window, tapi data belum ada.
             HIGH confidence pada keputusan teknikal; MEDIUM pada product hypothesis.
```

---

## OPEN QUESTIONS

Hal yang tidak bisa diputuskan karena butuh data eksternal:

1. **Apakah pilot users akan survey on-location?**
   → validasi: monitor insertCandidateEvent dengan event_type='survey_complete' per user dalam 3 pilot sessions pertama
   → jika 0 events → REVISIT TRIGGER aktif, redesign S2-2 UX (mungkin turunkan ke 2D, atau ubah flow)

2. **Apakah Kondisi + Owner harus weight RENDAH atau EQUAL?**
   → validasi: tanya Faisal (Gate F1); default EQUAL jika diam; adjust berdasarkan pilot data setelah beberapa sessions

---

## SLICE 2 MVP — DEFINISI DAN URUTAN EKSEKUSI

**MVP = S2-0 + S2-2 + S2-4 + S2-5(display) + events-as-side-effect**
**Tier-2 (post-MVP) = S2-1(foto survey, dijahit ke S2-2 review) + S2-5(biaya) lebih dalam**
**Defer = S2-3(UI) + S2-6(Apt/Kost) + S2-7(POI) + S2-8**

### Urutan Eksekusi Konkret

```
FASE 0 — UNBLOCK (sebelum coding apapun dimulai)
─────────────────────────────────────────────────
[Gate F1] Faisal putuskan: Kondisi + Owner weight EQUAL atau RENDAH?
          Default jika diam: EQUAL
          Deadline: sebelum TL finalize scoring formula

[Gate F2] Faisal sign-off awareness: kandidat existing akan direscore saat S2-2 deploy.
          Ini MUST-ACT, tidak ada default.
          Deadline: sebelum TL deploy S2-2

FASE 1 — S2-0 DB ACTIVATION + RLS FIX (blocker semua S2-2)
─────────────────────────────────────────────────
Step 1: TL run DB migration:
        - Add user_id ke candidate_surveys table
        - Add user_id ke candidate_events table
        - Pastikan semua query child tables filter user_id (RLS via JOIN risk fix)
Step 2: TL verify RLS tidak bocor: test query candidate_surveys + candidate_events
        tanpa user_id filter, pastikan tidak ada data leak
Step 3: TL prep scoring_version 2.0 schema changes (tanpa formula dulu, tunggu Gate F1)
        Estimasi: 0.5h

FASE 2 — S2-2 SURVEY (core bet, terbesar)
─────────────────────────────────────────────────
[Prerequisite: Fase 1 selesai + Gate F1 resolved]

Step 4: UX/Faisal finalize field order form survey:
        - Kondisi + Owner fields PERTAMA (compare value tertinggi, UX insight)
        - Remaining 4 dimensi urutan
        - Form harus selesai dalam <90 detik on-location
        (Bisa parallel dengan Step 1-3 TL)

Step 5: TL implement survey schema (tables, columns, types)

Step 6: TL implement form 6 dimensi + field order dari Step 4

Step 7: TL implement scoring formula:
        - avg sederhana per kelompok
        - renormalisasi partial (identik Slice 1 pattern)
        - Kondisi + Owner weight sesuai Gate F1 decision
        - badge "parsial X/6" display

Step 8: TL implement partial radar:
        - dashed outline untuk dimensi belum diisi
        - EXCLUDE ghost dimensi dari total score calculation
        - callout badge visible

Step 9: TL implement deriveVerdict eksplisit:
        - NO silent change
        - User HARUS lihat jika verdict berubah akibat data baru

Step 10: TL implement insertCandidateEvent helper terpusat:
         - event_type: 'survey_start', 'survey_complete', 'survey_update'
         - dipanggil sebagai side-effect survey submit/update
         - ini adalah behavioral data collection untuk pilot monitoring

Step 11: TL tulis one-shot migration script:
         - rescore SEMUA kandidat existing dengan formula scoring_version 2.0
         - test di local/staging DAHULU (wajib, bukan optional)
         - output: log kandidat mana yang berubah score + berapa delta

Step 12: [Gate F2 harus resolved] TL DEPLOY S2-2 ke pilot environment
         + jalankan one-shot migration script
         + verify di staging bahwa Compare tidak ada v1/v2 mixed state

FASE 3 — S2-4 + S2-5 (parallel, post S2-2 deploy)
─────────────────────────────────────────────────
[Prerequisite: S2-2 deployed]

Step 13: TL implement S2-4 negosiasi tracking
         (Effort S ~1h; define scope minimal: log negosiasi, harga tawaran, status)

Step 14: TL implement S2-5 biaya all-in:
         - ADD COLUMN numeric untuk setiap komponen biaya
         - simpan text asli (jangan hilangkan data mentah)
         - Display di Compare dengan label sumber harga yang jelas
         - Callout "harga belum lengkap" jika ada field kosong
         - TIDAK masuk scoring formula

FASE 4 — PILOT LAUNCH + MONITORING
─────────────────────────────────────────────────
Step 15: Faisal onboard pilot users ke S2-2:
         - Tunjukkan cara pakai survey on-location (bukan dari rumah)
         - Set ekspektasi: form ~90 detik, dilakukan DI properti
         - Inform tentang perubahan scoring (Gate F2 follow-through)

Step 16: Monitor selama 3 pilot sessions:
         - Ada survey_complete events? (detection window untuk REVISIT TRIGGER)
         - Ada anomali di Compare setelah migration?
         - Ada feedback dari pilot users tentang perubahan score?
```

---

## NEXT ACTIONS

```
  → [F1] Faisal putuskan Kondisi+Owner weight (EQUAL vs RENDAH)
    | owner: Faisal | by: sebelum TL mulai Step 7 (scoring formula)

  → [F2] Faisal sign-off awareness one-shot migration (ranking kandidat MUNGKIN berubah)
    | owner: Faisal | by: sebelum TL Step 12 (deploy S2-2)

  → TL: S2-0 DB migration — user_id ke child tables + RLS fix + test
    | owner: TL | by: Day 1 (blocker semua)

  → UX/Faisal: finalize field order survey form (Kondisi+Owner first, <90s target)
    | owner: UX / Faisal approval | by: Day 2 (parallel dengan TL S2-0)

  → TL: implement S2-2 survey (Steps 5-11 berurutan)
    | owner: TL | by: setelah S2-0 + Gate F1 + field order resolved

  → TL: test one-shot migration script di local/staging SEBELUM deploy
    | owner: TL | by: dalam deliverable S2-2 (bukan afterthought)

  → TL: deploy S2-2 + jalankan migration
    | owner: TL | by: setelah Gate F2 sign-off

  → TL: implement S2-4 + S2-5 (parallel, post S2-2 deploy)
    | owner: TL | by: setelah S2-2 live

  → Faisal: onboard pilot users ke S2-2 on-location usage
    | owner: Faisal | by: setelah S2-2 deploy

  → Faisal: monitor survey_complete events dalam 3 pilot sessions
    | owner: Faisal | by: ongoing post-launch
```

---

## REVISIT TRIGGER

Keputusan ini perlu di-review ulang jika:

- **0 survey_complete events setelah 3 pilot sessions** → emergency review S2-2 UX; pertimbangkan redesign ke 2D atau ubah entry point; DA's concern tentang 2D-first menjadi relevant saat itu
- **Biaya all-in tersedia untuk >80% kandidat dalam Compare** → evaluate masukkan ke scoring formula (current: display only; justifikasi untuk keep-out lemah jika data completeness tinggi)
- **>2 pilot users meminta Kost atau Apartemen** → aktivasi S2-6 planning; ingat Kost > Apartemen dalam prioritas
- **One-shot migration menghasilkan ranking yang terasa "salah" bagi Faisal** (berbeda signifikan tanpa alasan jelas) → review formula per-dimensi; kemungkinan edge case dalam avg-per-kelompok
- **pilot users tidak kembali ke Compare setelah survey** → artinya survey bukan penggerak cycle completion; hipotesis inti harus di-challenge

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session backup: D:\hunian\.claude\agent-memory\SYN\slice2-synthesis.md
Produced by  : Synthesizer agent
Date         : 2026-06-26
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
