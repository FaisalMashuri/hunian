# Session Transcript — Slice 2: Prioritisasi, Urutan Eksekusi & Scope

| | |
|---|---|
| **Tanggal** | 2026-06-27 |
| **Topik** | Prioritisasi fase Slice 2, urutan eksekusi optimal, 4 keputusan scope terbuka, risiko over-build |
| **Agents** | PM · UX · STR · TL · DA · SYN · PO (semua 7) |
| **Execution** | ASYNC background agents (notified on completion) |
| **Status akhir** | 🙋 PENDING CONFIRMATION — menunggu G1 & G2 dari Faisal |
| **Confidence** | MEDIUM |
| **Feature file** | `next-feature/slice2-prioritisasi.md` |

---

## Intent

Bukan "fitur apa saja yang mungkin" (sudah ada di `docs/DEVELOPMENT-PLAN-SLICE2.md`). Yang benar-benar ditanya: (a) urutan eksekusi MANA yang optimal dan MENGAPA; (b) di mana garis "Slice 2 MVP" ditarik agar tajam untuk pilot; (c) 4 keputusan scope konkret; (d) di mana risiko over-build menggeser fokus dari "membentuk keputusan, bukan mengoptimalkan".

## Task Decomposition

| ID | Task | Agent | Depends |
|---|---|---|---|
| T-001 | Prioritisasi value/dep/effort + Slice 2 MVP | PM | — |
| T-002 | Behavior grounding; survey dead-zone | UX | — |
| T-003 | Differentiator/moat & strategi pilot | STR | — |
| T-004 | Feasibility, 4 scope, effort, cost | TL | — |
| T-005 | Challenge over-build & fokus keputusan | DA | T-001..004 |
| T-006 | Sintesis: MVP + urutan konkret | SYN | T-005 |
| T-007 | Vision check & human gate | PO | T-006 |

Execution: Wave 1 paralel (PM/UX/STR/TL) → Wave 2 sequential (DA → SYN → PO). 1 round.

---

## Wave 1

### PM (T-001)
- Slice 2 MVP = **S2-0 + S2-2 + S2-4**; tier-2 jika kapasitas = S2-1 + S2-5; defer S2-3/6/7/8.
- Urutan diusulkan plan (foto→survey) **TIDAK optimal** — itu logika "ship cepat" bukan "gerakkan metric". Survey satu-satunya yang mengubah kualitas keputusan. Urutan PM: S2-0→S2-2→S2-4→S2-1→S2-5→S2-6→S2-7→S2-3→S2-8.
- Scope: (a) survey rating 1-5 ×6 + tag opsional + catatan; deriveVerdict ikut 5D; weight Kondisi/Owner default RENDAH agar kandidat tanpa survey tak dihukum; bump scoring_version 2.0. (b) Apt/Kost SKIP→Slice 3. (c) biaya all-in tampil tapi TIDAK masuk scoring. (d) POI skip, straight-line cukup.

### UX (T-002)
- Decision-shaping: S2-2, S2-5, S2-4. Completeness theater (solo pilot): S2-1 foto, S2-3 timeline, S2-7 POI.
- Survey worth dibangun; dead-zone = masalah logistik kunjungan, bukan form. Form harus <90 detik diisi saat user DI properti.
- KOREKSI urutan dimensi: **Kondisi Bangunan + Owner DULU** (keduanya ghost, nilai compare tertinggi) — bukan kebersihan dulu.
- deriveVerdict HARUS berubah saat survey masuk TAPI dengan penjelasan eksplisit; silent update merusak trust.
- Partial survey: radar ghost = dashed outline, label "berdasarkan 3 dimensi", EXCLUDE ghost dari total (bukan zero), callout.
- **Risiko paling berbahaya: biaya parsial di Compare** (all-in vs listing tak comparable → bisa membalik keputusan) → wajib label sumber harga.
- Apt/Kost contingent demand (tanya onboarding); Kost > Apartemen. Assumption log: dead-zone mungkin karena user putuskan di LUAR Hunian tanpa log balik.

### STR (T-003)
- S2-2 survey = **moat sesungguhnya** (data irreplaceable; marketplace tak bisa replikasi karena konflik kepentingan dgn landlord). Defensibility 18-24 bulan.
- Subset pilot tajam = S2-0 + S2-2 + S2-5 + S2-4. Foto survey dijahit ke S2-2, BUKAN foto-listing standalone (= feature-parity trap).
- S2-5 biaya all-in = conviction trigger ("sewa 2,5jt tapi all-in 3,8jt").
- Apt/Kost DEFER; **Kost > Apartemen** untuk Slice 3 (mahasiswa lebih muda, tech-native, survey kondisi lebih kritis).
- 4 feature-parity-trap: foto-listing standalone (TINGGI), Apt/Kost-as-listing (MED), POI-as-explorer (MED), AI-deciding (LOW).

### TL (T-004)
- Effort total 18-25 hari solo. S2-0 (0.5h) → S2-2 (L, 4-5h) → S2-4 (S, 1h) → S2-1 (M) → S2-5 (M).
- (a) survey score = avg sederhana per kelompok → 0-100; partial pakai renormalisasi NULL Slice 1; bump scoring_version 2.0; badge "parsial 3/6". Per-dimensi threshold deriveVerdict = over-engineering (tolak).
- (b) Apt/Kost = JSONB `type_specific_data` + Zod, TANPA pg_jsonschema; reset `type_specific_data` saat property_type ganti (jebakan korupsi).
- (c) biaya all-in = ADD COLUMN numeric additive (`biaya_listrik_nominal`/`biaya_air_nominal`), text asli disimpan; total = harga_efektif + COALESCE(...). Reversibility HIGH.
- (d) POI = Distance Matrix (bukan Directions), lazy top-15/kandidat, cache selamanya, ~$0.75/bln per 100 MAU. `candidate_poi` DDL BELUM ada di schema.sql.
- 10 jebakan: **RLS via JOIN untuk candidate_surveys/events (tanpa user_id → risiko DATA LEAK)**, helper `insertCandidateEvent` terpusat, signed-url TTL, compare v1.0 vs v2.0, re-survey overwrite → log events, race double-billing, type_specific reset, PgBouncer GUC.

---

## Wave 2

### DA (T-005) — challenge
- **CABUT 2 tantangan:** S2-4 negosiasi (norma budaya Indonesia, effort S, asimetri risk/reward favorable) → S2-4 MASUK; POI (defer tetap benar walau $0.75 murah — straight-line belum terbukti menyesatkan, DDL belum ada).
- **MODIFIKASI S2-3:** defer UI timeline TAPI POPULATE `candidate_events` sebagai side-effect S2-2 (helper sudah direncanakan; data behavior pilot invaluable; murah).
- Tantangan aktif: (1) bahkan S2-2 6-dimensi berisiko bila user putuskan di LUAR Hunian → usul validasi murah 2 dimensi dulu; (2) S2-5 jangan masuk scoring (false precision); (3) partial-survey system = premature defensive coding; (4) scoring_version 2.0 mid-pilot = lazy rescore menciptakan undefined Compare state → usul one-shot migration; (5) S2-5 fixed-columns berisiko schema creep vs JSONB.
- 3 konflik untuk SYN: (A) S2-5 show-vs-score; (B) survey 2D vs 6D; (C) scoring_version one-shot vs lazy.
- 4 gate Faisal diusulkan (G1-G4) dengan default 2D / display-only / one-shot / minta TL justifikasi.

### SYN (T-006) — sintesis (semua konflik DIPUTUSKAN)
- **Conflict A → DISPLAY ONLY.** PM+UX+DA konvergen dari 3 arah (matematik false precision, UX membalik keputusan, prinsip inti). STR conviction trigger terpenuhi via display + label, bukan algoritma. DA Gate G2 ditutup developer-default.
- **Conflict B → 6D LANGSUNG.** Non-adopsi = behavior problem bukan form-length; 2D-first = 2× migration. insertCandidateEvent side-effect beri detection window 3 sesi. DA Gate G1 ditutup developer-default.
- **Conflict C → ONE-SHOT migration.** Compare hero; 3D+5D dalam 1 view = functional failure; pilot <20 kandidat = script trivial; migration = deliverable S2-2, test staging dulu. DA Gate G3 ditutup, DA menang.
- **MVP = S2-0 + S2-2 + S2-4 + S2-5(display) + events-as-side-effect.** Tier-2: foto survey dijahit ke S2-2. Defer S2-3 UI/S2-6/S2-7/S2-8.
- 4 gate DA semua ditutup developer-default. **2 gate Faisal BARU:** F1 (weight Kondisi+Owner EQUAL vs RENDAH; rekom EQUAL; default diam=EQUAL); F2 (sign-off awareness one-shot migration; MUST-ACT, no default).
- REVISIT TRIGGER: 0 survey_complete dlm 3 sesi → emergency review. Confidence MEDIUM.

### PO (T-007) — vision gate → **PENDING CONFIRMATION**
- Vision check: radar 5D, one-shot rescore, deriveVerdict berubah AMAN selama deriveVerdict tetap framing trade-off (constraint implementasi). Biaya all-in display-only AMAN.
- **Konflik vision nyata:** F1 hanya memilih antar dua DEFAULT SISTEM. Pertanyaan lebih dalam: bisakah user mengekspresikan preferensi sendiri untuk 2 dimensi baru (Kondisi, Owner)? Jika tidak, apapun yang tim pilih **melanggar keputusan terkunci "bobot SELALU = pilihan user"** secara struktural. Output DITAHAN.
- **2 gate final untuk Faisal:**
  - **G1 (BLOCKING formula v2.0):** Di mana/bagaimana user mengatur bobot Kondisi & Owner? Opsi A (settings override, default EQUAL) / B (default EQUAL fixed Slice 2) / C (default RENDAH fixed). Rekom: A atau B. Default diam: TIDAK ADA.
  - **G2 (BLOCKING deploy S2-2):** Bersediakah Faisal inform pilot user bahwa skor berubah saat Slice 2 live? Rekom: Ya. Default diam: TIDAK ADA.
- Developer-default (TIDAK perlu ditanyakan): survey 6D langsung, foto survey-only, biaya ADD COLUMN fixed, deriveVerdict explicit trade-off, migration staging-first, insertCandidateEvent P0, RLS child tables, scoring avg-per-kelompok, S2-3/6/7/8 defer, callout impl, urutan dimensi survey.

---

## Quality markers sesi (terpenuhi)
- DA mencabut 2 tantangan setelah menimbang (S2-4, POI) + memodifikasi 1 (S2-3 events).
- TL menyertakan ≥2 alternatif teknis dengan alasan penolakan di tiap scope.
- SYN mengidentifikasi & memutuskan 3 genuine conflict (bukan "semua valid").
- PO hanya meneruskan 2 gate yang benar-benar material; memangkas 4 gate DA jadi developer-default; mengangkat konflik vision yang Orchestrator flag.

## Outcome
🙋 **AWAITING FAISAL** atas G1 (bobot Kondisi/Owner) & G2 (sign-off migrasi). Tanpa keduanya, TL tidak finalize scoring formula v2.0 / tidak deploy S2-2. Sisanya siap dieksekusi.
