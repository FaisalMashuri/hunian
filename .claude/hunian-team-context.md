# Hunian Team Context

Context lintas sesi untuk agent team. Dibaca Orchestrator di awal tiap sesi.

---

## Keputusan & Prinsip yang Sudah Disepakati

### Sesi 2026-07-06 — Collaboration (Undang Pasangan): DEFER-dengan-Gate (Confidence: MEDIUM, status: 🙋 UNCERTAIN / PENDING FAISAL)

**Artefak:** `next-feature/collaboration-partner.md`, transcript `sessions/2026-07-06-collaboration.md`. Agents: PM·UX·STR·TL·DA·SYN·PO (semua 7 — high-stakes, menyentuh fondasi identitas). Grounding: 21 file `.eq("user_id")`, 10 file child via `candidate_id`.

**VERDICT: DEFER-DENGAN-GATE** (bukan GO, bukan NO). Alasan utama BUKAN mahal (TL: slice read-only ~3-4 hari, additive) tapi karena **premis "pasangan AKTIF berdua" belum tervalidasi 1 data point pun (DA-C3, tantangan terpenting)**. Kalau pola dominan ID = "solo-lead + partner PASIF approver", maka **share-link read-only** (sudah direncanakan PREMIUM di sesi 2026-06-29) sudah menjawab ~95% kebutuhan → collaboration 2-arah = over-build. Pola ini mengulang sesi browser-extension (asumsi menolak asumsi). DEFER wajib bertanggal/bertrigger, bukan defer selamanya.

**Keputusan mengikat (bila kelak GO):**
- **Model data = Opsi A `candidate_shares` + `invitations` (ADDITIVE).** TOLAK `workspace_id`/`household_id` (migrasi 21 file `.eq(user_id)` + backfill live + isu bobot ganda). Reversibel (tabel bisa di-drop). Loader `app/dashboard/data.ts` cukup +1 branch (perluas `ids` dengan shared candidate_id). Helper terpusat `assertCandidateAccess` (migrasi bertahap dari mutation actions). Foto: path owner tetap, ambil owner_id dari `candidates` bukan session viewer.
- **Skor collaborator DITUNDA** sampai pola tervalidasi. Rata-rata bobot DITOLAK (skor fiksi + langgar prinsip). **"Satu skor owner untuk collaborator" DITOLAK PO** kecuali collaborator bisa atur bobot sendiri — melanggar prinsip terkunci "bobot=pilihan user" (ditutup prinsip, bukan open question). Opsi bila GO: approver-pasif → tanpa-skor+komentar cukup; evaluator-aktif → dua-skor-berdampingan+label sumber bertahap. Jangan sentuh scoring engine/`scoring_version` untuk scope ini.
- **Real-time DITOLAK; async sync-on-open.** Supabase Realtime tak kompatibel pola service-role client (butuh anon-key + RLS aktif yang belum fungsional); low-frequency = dua orang buka bersamaan hampir tak pernah.
- **Share-link read-only PREMIUM = eksekusi terpisah** dari debat collaboration (sudah di roadmap). Menyelesaikan job "partner pasif lihat data".
- **Monetisasi collaboration:** diferensiasi FUNGSIONAL tak-bisa-diworkaround (share=publik-tanpa-akun-deliverable-PREMIUM vs collaboration=butuh-akun-workflow-GRATIS-1-partner) agar invite gratis tak mengkanibal share-link premium (DA-C5). Efek strategis = "qualified-pair acquisition" (~1 partner, BUKAN viral eksponensial) + within-cycle completion, BUKAN long-term retention.

**Langkah pemutus (murah, sebelum commit kode apa pun):** VALIDASI-2 = tanya pilot "pernah screenshot Compare & kirim ke pasangan?" (2 hari, termurah, pemutus DEFER vs GO / pull-signal). VALIDASI-1 = intercept 10-15 pencari (solo vs berdua, aktif vs pasif).

**DA quality:** 5 tantangan SEMUA aktif; hanya 1 minor dicabut (schema-additive, tak ada argumen teknis). Lebih sedikit pencabutan dari sesi Slice 2 karena premis collaboration lebih lemah (nol behavioral data).

**🙋 GATE FAISAL (output ditahan, default 48 jam):**
1. **Q1:** Share-link read-only — eksekusi sekarang (terpisah) atau tunggu validasi 2 hari? (Default: eksekusi sekarang; collaboration tetap DEFER.)
2. **Q2:** Batas free/premium collaboration — invite 1 partner gratis atau premium? Bergantung gate freemium Q1 (2026-06-29) yang masih pending. (Default: gratis 1 partner.)

**BOLEH jalan tanpa Faisal:** VALIDASI-2 (hari ini), finalisasi spec share-link. **DITAHAN:** arsitektur collaboration 2-arah; skor/monetisasi collaborator (bergantung gate lama: Slice 2 G1 + Freemium Q1, keduanya PENDING).

**REVISIT TRIGGER:** VALIDASI-2 >20% pilot sudah screenshot Compare · keluhan organik "tak bisa ajak pasangan" · kompetitor lokal tambah collaboration · %di-Compare >30% (fondasi single-user solid).

---

### Sesi 2026-06-29 — Monetisasi: Tolak Fomo, Pivot Freemium/Premium (Confidence: MEDIUM, status: 🙋 PENDING CONFIRMATION oleh Faisal)

**Artefak:** `next-feature/monetization-freemium-premium.md`, transcript `sessions/2026-06-29-monetization-fomo.md`, analisis Fomo diarsip `.claude/agent-memory/agent-strategist/project-monetization-fomo.md`. Agents: STR·TL·PM·UX·DA·SYN·PO (2 wave).

**Model Fomo (kontribusi data anonim → subscribe Rp50rb buka market-intelligence agregat): DITOLAK FAISAL** ("kayaknya ga cocok buat hunian"). Tim sempat verdict: ambil mechanic contribute-to-unlock, buang billing subscription; whitespace data nego/all-in = potensi moat (Mamikos conflict-of-interest struktural ke supply-side). Diarsip; JANGAN usulkan ulang Fomo/subscription tanpa alasan baru.

**Arah final = FREEMIUM + PREMIUM klasik. Prinsip mengikat: GATE DI OUTPUT, BUKAN INPUT.**
- **FREE = akses PENUH semua INPUT + ANALISIS:** AI extraction UNLIMITED, **kandidat UNLIMITED** (limit kandidat DITOLAK — langgar prior-verdict & bunuh aha-moment Compare), scoring 5D, Compare (HERO), survey fisik, biaya all-in, nego tracker, timeline, AI explanation/red-flags/summary (bundled dlm extraction, cost marginal ~0).
- **PREMIUM = hanya OUTPUT DELIVERABLE yang butuh cloud resource / AI-generation baru:** foto cloud sync, share-link real-time, PDF decision memo, nego script AI. WAJIB ada **preview static/sample** (bukan full-lock → hindari 0% conversion).
- **Cost reality (TL baca codebase):** AI calls MURAH (~$0.0004-0.0013/call). Cost per-user TERBESAR = **Google Directions (POI rute asli) ~$0.125/user**. Gate POI+foto cloud → free tier aman 5000-10000 MAU.
- **POI:** premium = Google Directions; free = road-based estimate (BLOCKING spike Overpass 1 hari); **crow-flies/garis lurus BUKAN opsi** (menyesatkan di Jakarta: sungai/tol/macet).
- **Foto OPFS lokal (free):** 2 safeguard WAJIB sebelum ship (BLOCKING, bukan optional): **warning banner prominent + tombol export foto ZIP gratis** (DA-C4 trust damage; "user in control atas datanya").

**Fasing (DA-C1: jangan prematur):** MANUAL-PREMIUM dulu — semua fitur unlock untuk pilot, validasi WTP via **transfer manual + flag `is_premium`**. Bangun otomasi gating (`user_usage_counters` atomic / candidate COUNT; JWT-claim & RLS-count DITOLAK) HANYA setelah cycle-completion terbukti & ≥3 transfer manual. Effort otomasi 1-2 hari (bukan foundational).

**"Full free dulu, monet nanti" (pertanyaan Faisal):** Yang ditunda = **PAYWALL (enforcement)**, BUKAN **keputusan MODEL**. Tunda model sama sekali = JEBAKAN untuk Hunian (low-frequency → user churn sebelum di-monet; COGS AI jalan tanpa revenue = net-negatif solo dev; tanpa instrumentasi hari-1, "user banyak" = data sampah). Instrumentasi (cycle-completion, % kandidat di-Compare, WTP signal, definisi "siklus") WAJIB dirancang sejak hari 1.

**Harga:** Rp59rb/siklus one-time = hipotesis diuji (bukan fiksi — kill-condition = measurement). Definisi "SIKLUS" wajib eksplisit di UI + exit-survey 1 pertanyaan saat user tolak paywall.

**Metrik pembuka (DA):** % kandidat yang di-add benar-benar di-Compare. Jika <30% → aha-moment belum terjadi, TUNDA semua monetisasi, fokus cycle completion. Kill-condition: 30 hari/≥100 user/<3 bayar sukarela → freeze. Saweria pasif cover COGS.

**DA quality:** sesi Fomo 5 tantangan (C3 dicabut SYN dgn rebuttal); sesi gating 6 tantangan (C2 decisive = gate output, C5 sebagian dicabut). PM keliru 2 hal (limit kandidat & POI gratis), dikoreksi SYN.

**🙋 GATE FAISAL (output ditahan, ada default 48 jam):**
1. **G1:** "Full free dulu" = tunda paywall (default, = rekomendasi tim) atau tunda model (jebakan)? Konfirmasi maksud.
2. **G2:** Safeguard foto OPFS (warning + export ZIP) = blocking sebelum ship foto? (Default: Ya.)
3. **G3 (opsional):** Rp59rb/siklus + definisi siklus eksplisit di UI? (Default: Ya.)

**REVISIT TRIGGER:** % di-Compare <30% → emergency review (tunda monet); ≥3 transfer manual + cycle-completion terbukti → mulai bangun otomasi gating; spike Overpass selesai → kunci desain POI free tier.

---

### Sesi 2026-06-27 — Slice 2 Prioritisasi & Scope (Confidence: MEDIUM, status: 🙋 PENDING CONFIRMATION oleh Faisal)

**Artefak:** `next-feature/slice2-prioritisasi.md`, transcript `sessions/2026-06-27-slice2-prioritisasi.md`. Agents: PM·UX·STR·TL·DA·SYN·PO (semua 7). Acuan: `docs/DEVELOPMENT-PLAN-SLICE2.md` (fase S2-0..S2-8).

**Slice 2 MVP (verdict tim, tertajam):** `S2-0 (aktivasi DB) + S2-2 (survey fisik → skor 5 dimensi, FASE KUNCI) + S2-4 (negosiasi harga) + S2-5 (biaya all-in DISPLAY-ONLY) + events-as-side-effect` (isi `candidate_events` tanpa UI timeline). Tier-2: **foto survey** dijahit ke review S2-2. **DEFER ke Slice 2.5/3:** S2-3 UI timeline · S2-6 Apartemen/Kost · S2-7 POI rute asli · S2-8 pelengkap.

**Urutan eksekusi:** S2-0 → S2-2 → (S2-4 ∥ S2-5) pasca-deploy S2-2. Bukan foto-first (urutan plan asli ditolak — ship-cepat ≠ gerakkan metric).

**Resolusi 3 konflik (mengikat):**
- **Biaya all-in = DISPLAY ONLY**, tidak masuk scoring formula. Partial data = false precision yang bisa MEMBALIK keputusan di Compare. Wajib **label sumber harga** + callout "harga belum lengkap" di Compare. (STR "conviction trigger" terpenuhi via display, bukan algoritma.)
- **Survey = 6 dimensi LANGSUNG** (bukan 2D bertahap). Non-adopsi = behavior problem bukan form-length; 2D = 2× migration. Urutan dimensi: **Kondisi + Owner DULU** (ghost, nilai compare tertinggi). deriveVerdict ikut 5D TAPI perubahan verdict **eksplisit** (silent merusak trust); framing tetap trade-off bukan winner-label.
- **scoring_version 2.0 = ONE-SHOT migration** semua kandidat existing (bukan lazy+badge). Compare hero; 3D vs 5D dalam 1 view = functional failure. Pilot <20 kandidat = script trivial; migration script = deliverable S2-2, test staging dulu.

**Scope settled lain:** survey scoring = **avg sederhana per kelompok → 0-100** (per-dimensi threshold ditolak = over-engineering); partial pakai renormalisasi NULL Slice 1 + badge "parsial X/6". Biaya = **ADD COLUMN numeric fixed** (`biaya_listrik_nominal`/`biaya_air_nominal`, text asli disimpan), bukan JSONB (revisit bila schema creep). Apt/Kost = JSONB `type_specific_data`+Zod TANPA pg_jsonschema (saat dibangun nanti); **Kost > Apartemen** di Slice 3. POI = Distance Matrix lazy top-15 cache (~$0.75/bln/100MAU) bila kelak dibangun; `candidate_poi` DDL **belum ada** di schema.sql.

**Prinsip BARU yang ditegakkan PO (penting lintas sesi):** menambah dimensi scoring baru (Kondisi, Owner) harus tetap menghormati keputusan terkunci **"bobot SELALU = pilihan user"**. Default sistem fixed untuk dimensi baru = pelanggaran struktural. → diangkat sebagai gate Faisal, bukan diputuskan tim.

**Risiko teknikal HIGH yang harus dijaga:** RLS via JOIN untuk `candidate_surveys`/`candidate_events` (tabel tanpa `user_id` langsung) → **risiko data leak antar user**; SETIAP query child table WAJIB JOIN ke `candidates WHERE user_id = $session` + integration test unauth→0 row. Re-survey overwrite `surveyed_at` → log `survey_completed` ke events. `insertCandidateEvent` helper terpusat = P0.

**DA quality (debat sehat):** mencabut 2 tantangan (S2-4 negosiasi = norma budaya; POI defer tetap benar) + modifikasi 1 (S2-3 events side-effect, defer UI saja).

**🙋 GATE FAISAL (output DITAHAN sampai dijawab — tidak ada default):**
1. **G1 (BLOCKING formula v2.0):** Di mana/bagaimana user mengatur bobot **Kondisi & Owner**? Opsi A (settings override, default EQUAL — konsisten penuh prinsip) / B (default EQUAL fixed Slice 2) / C (default RENDAH fixed). Rekom tim: A atau B.
2. **G2 (BLOCKING deploy S2-2):** Bersediakah Faisal **inform pilot user** bahwa skor kandidat berubah saat Slice 2 live (3D→5D, ranking bisa berubah, bukan bug)? Rekom: Ya.

**REVISIT TRIGGER:** 0 `survey_complete` events setelah 3 sesi pilot → emergency review (usul 2D DA jadi relevan, dengan data); biaya all-in >80% complete → evaluasi masuk scoring; >2 pilot minta Kost/Apt → aktivasi S2-6.

---

### Sesi 2026-06-26 — MVP Build Sequencing (Confidence: MEDIUM, status: APPROVED oleh Faisal)

**Build order:**
- MVP dibangun sebagai **vertical slice end-to-end**, bukan per-komponen terpisah.
- **Slice 1 (tak dipecah):** Onboarding 3-step → Input form Kontrakan → AI extraction + pre-processing lokal → Property Review → Scoring 3 dimensi (Harga/Lokasi/Fasilitas) → Compare basic (≥2 kandidat) → pilih.
- Ditunda: Survey bintang+tag (dead zone 7+ hari), form Apartemen & Kost, timeline, harga asli/akhir, progressive clarification, 4 moda transport penuh.

**Metric (diputuskan Faisal 2026-06-26):**
- Pilot user dikenal personal & aktif → metric utama = **cycle completion (target 60%)** dengan follow-up manual menembus dead zone survei; **session-depth** dipakai sebagai leading indicator.
- Prinsip: "angka yang bisa dipercaya > angka yang terdengar kuat tapi tak terverifikasi."

**Gate teknikal (GO/NO-GO sebelum Slice 2):**
- **Benchmark akurasi AI extraction >85% pada 20+ teks broker WA nyata.** Kalau gagal, value inti "verifikasi bukan ketik dari nol" runtuh.

**Stack (diterima):**
- Next.js + Tailwind + shadcn/ui · Supabase (Postgres+Storage, RLS aktif, `scoring_version` per row — data+storage saja) · GPT-4o mini (bersyarat benchmark) + pre-processing normalisasi lokal · Google Maps geocoding · Vercel · **Auth.js (NextAuth) + Google OAuth, login wajib dari awal** (keputusan Faisal 2026-06-26, mengganti anonymous-first).
- Ditolak: Mapbox/OSM (transit Indonesia lemah); routing otomatis ditunda (pakai km manual dulu); rule-based extraction murni (jadi fallback, bukan utama).
- Effort Slice 1: ~19–26 hari solo.

**Reversibility:** hampir semua keputusan HIGH; hanya "Slice 1 = end-to-end" yang LOW.

**Jawaban Faisal (2026-06-26):**
1. Pilot user dikenal personal & aktif → metric cycle completion 60% + follow-up manual.
2. Deal Breaker masuk Slice 1 sebagai **flag minimal** (tandai pelanggar, tanpa auto-eliminasi).

**Gate tersisa sebelum Slice 2:** benchmark akurasi AI extraction >85% pada 20+ teks WA broker nyata.

---

### Sesi 2026-06-26 — ERD + Schema Database Slice 1 (Confidence: HIGH desain / MEDIUM eksekusi, status: ALIGNED oleh PO)

**Artefak:** `docs/ERD.md` (ERD Mermaid + catatan), `db/schema.sql` (DDL migration siap pakai), `next-feature/erd-schema-db.md`. Agents: TL·PM·DA·SYN·PO (STR & UX di-skip).

**Schema 8 tabel:** users · user_preferences · user_deal_breakers · candidates · candidate_commute · candidate_deal_breaker_flags · candidate_photos · decisions.

**Keputusan desain yang mengikat (acuan sesi berikut):**
- **Pola extensibility = HYBRID:** typed columns untuk field critical/common/scoring; `type_specific_data` jsonb untuk field per-jenis non-scoring (Apartemen/Kost Slice 2). Ditolak: single-table all-nullable, table-per-type, EAV, all-jsonb.
- **Scores = typed columns** (bukan jsonb) — Compare butuh ORDER BY/CHECK per dimensi; `score_breakdown` jsonb hanya escape valve. (DA mencabut tantangan jsonb-scores.)
- **Deal breaker flags = tabel relasional** (bukan jsonb) — `is_active` soft-delete butuh gap-detection/re-evaluasi via LEFT JOIN. Flag minimal, kandidat tak dihapus.
- **decisions = tabel terpisah** (bukan `is_chosen`) — siklus berulang; 1 row = 1 siklus selesai (KPI-1).
- **Harga anti-drift:** `harga_sewa_bulanan` = ASLI/listing immutable (selaras `schema.mjs`); kolom GENERATED `harga_efektif_bulanan` = COALESCE(akhir,asli) yang SELALU dibaca scoring; `scoring_version` naik bila formula berubah.
- **periode_asli = TEXT + CHECK** `('bulan','3bulan','6bulan','tahun')` persis `schema.mjs` (BUKAN Postgres ENUM); AI period asing → null; single-source TS const untuk Zod + DB CHECK.
- **RLS 3-lapis (jujur):** L1 authz aplikasi server-side filter `user_id` (PRIMER, karena service role BYPASS RLS) · L2 RLS default-deny (backstop anon-key) · L3 GUC `app.current_user_id` + policy hanya NYATA via role non-service + fungsi `SECURITY DEFINER` atomik (`app_get_candidates`). JANGAN dua RPC terpisah untuk GUC (PgBouncer tx-mode = silent bug).
- Forward-compat tanpa migrasi besar: Apartemen/Kost (`property_type`+jsonb), 4 moda (`transport_mode` enum + `candidate_commute`), survey & timeline (DDL ditunda di komentar Section 8), routing (`lat/lng`+`api_provider`), 5 dimensi (`weight_*`/`score_*` placeholder).

**Risiko eksekusi yang harus dijaga (2 silent-failure HIGH + 1 disiplin):**
1. RLS GUC/PgBouncer — konfirmasi pool mode; fungsi atomik mandatory bila transaction-mode; integration test unauth→0 row.
2. Drift enum periode — 1 TS const single-source untuk Zod + DB CHECK.
3. Disiplin `scoring_version` naik tiap formula/semantik skor berubah.

**Open (config, bukan blocker desain):** PgBouncer pool mode — PO menilai gate deployment/checklist developer, BUKAN keputusan Faisal. Default: asumsikan transaction-mode → fungsi atomik mandatory.

---

### Sesi 2026-06-26 — UX/UI Design Slice 1 (Confidence: HIGH, status: APPROVED — Faisal menjawab Q1/Q2/Q3)

**Artefak:** `docs/UX-DESIGN.md` (IA + 8 layar + design direction + component inventory), `next-feature/ux-ui-slice1.md`, transcript `sessions/2026-06-26-ux-ui-slice1.md`. Agents: UX(primary)·PM·TL·DA·SYN·PO (STR di-skip — bukan topik market).

**8 layar final (+ landing publik TERPISAH di `/`):** Login(Google, `/login`) → Onboarding 4-step (Budget·Tujuan+Transport·Prioritas WAJIB; Deal Breaker opsional) → Input (tab paste-first/manual) → Property Review (ReviewRow ✓/⚠ + input km manual) → Daftar Kandidat (status + flag deal breaker) → Skor+AI (skor kecil, AI on-demand) → Compare trade-off forward (hero) → Settings.

**Keputusan desain mengikat (acuan build Fase 1–4):**
- **Navigasi RESPONSIF (keputusan Faisal 2026-06-26):** layar besar (≥sm) = **sidebar kiri** (logo + Kandidat/Bandingkan/Pengaturan + akun & Keluar, `components/app/sidebar.tsx`); layar kecil (<sm) = **bottom navigation** + header logo. App shell di `components/app/app-shell.tsx`. Landing/login/onboarding tanpa nav. Semua layar app responsif penuh (NFR-9).
- **Compare:** kandidat dipilih EKSPLISIT dari daftar listing user (mulai kosong, bukan auto-pilih); memilih satu OPSIONAL (user boleh hanya melihat perbandingan). UI: kartu-pilih + **radar multi-dimensi** (Harga/Lokasi/Fasilitas/Aman/Lengkap, SVG sendiri `app/bandingkan/radar-chart.tsx`) + **what-if budget slider** (re-score live pakai `scoreHarga`, tak disimpan) + **tabel best/worst** (hijau/merah per baris). Max **4** kandidat.
- **Bahasa visual:** Plus Jakarta Sans + teal-700 (#0F766E), background stone-50, card putih rounded-xl. Status 3-layer (ikon+warna+teks): ✓ emerald / ⚠+deal-breaker amber (BUKAN merah) / ✗ rose / ~ zinc. Prioritas tampil BINTANG bukan %.
- **Komponen:** 21 shadcn + 8 custom (ScoreBar, StarDisplay, TradeoffCard, ReviewRow, CandidateCard, CompareTable, BottomNav, FAB). Compare = layar paling berat (~3–4 hari FE).
- **Map onboarding = Places Autocomplete teks (BUKAN embed peta).** Trade-off text Compare = RULE-BASED (bukan AI/GPT). AI explanation ON-DEMAND + session-cache (bukan auto). Score viz = Progress bar + angka kecil (bukan Recharts). Max Compare 3 kandidat.
- **Input = paste-first.** Multi-listing dalam 1 paste → extract listing PERTAMA + info banner (bukan error/block).
- **DATA GAP ditambal:** `candidate_commute.distance_km` butuh UI input km MANUAL di Property Review (routing otomatis ditunda). Kosong → `score_lokasi=NULL`.
- **Score NULL renormalisasi:** bila satu dimensi NULL → renormalisasi sisa bobot (bukan NULL=50/zero-out — hindari signal palsu). `scoring_version` per kandidat: v1-3D/v1-2D/v1-1D.
- **Field baru wajib sebelum schema lock:** `bobot_source` di user_preferences ("user-defined" | "default-equal"). `extraction_confidence` shape + threshold ✓≥0.7 dikunci konstanta TS sebelum build Property Review.
- **Trust copy:** indikator ✓ = "kepercayaan tinggi" + tooltip disclaimer (confidence≥0.7 ≠ pasti benar).
- **Scope leak diperbaiki:** Slice 1 = Kontrakan ONLY (contoh "Apartemen" di wireframe dihapus). Referensi NFR-10/FR-LP-1 = keputusan desain internal, BUKAN FR resmi.
- **Gate akurasi >85% pada 20+ teks WA NYATA → sebelum BETA LAUNCH (bukan sebelum build);** bila <85% fallback manual jadi primary.

**Genuine conflict yang diselesaikan (SYN):** DA usul pangkas onboarding ke Budget+Tujuan & tunda Prioritas vs FR-ON-3 (Must, bobot wajib untuk scoring). Resolusi: Prioritas TIDAK dihapus, dijadikan SKIPPABLE + equal-weight default (34/33/33) + audit `bobot_source`. Karena memodifikasi klasifikasi FR-ON-3 → butuh approval Faisal (Q1).

**JAWABAN FAISAL (2026-06-26) — status: APPROVED:**
1. **[Q1]** Prioritas **WAJIB** (bukan skippable). Override rekomendasi PO; `bobot_source` selalu = pilihan user.
2. **[Q2]** Scoring **3 dimensi** (Harga/Lokasi/Fasilitas) — confirmed; Kondisi & Owner ditunda.
3. **[Q3]** Pengumpulan 20+ teks WA **DITUNDA** — build UI Fase 1 jalan dulu; gate akurasi sebelum commit/beta Slice 2.
4. **Landing TERPISAH** dari login: `/` landing publik kaya (gambar placeholder + animasi Framer Motion, responsif penuh) → `/login` sendiri. Animasi/placeholder = requirement (PRD NFR-10/FR-LP-1), BUKAN opsional.

**Urutan build:** landing `/` (pertama) → `/login` → onboarding → Input → Review → Kandidat → Skor+AI → Compare → Settings.

---

## Prinsip Produk Inti (dari mvp.md)

- **AI mengurangi pekerjaan mengetik, bukan mengambil keputusan.**
- Scoring rule-based, bukan AI — konsisten, bisa diaudit, mudah dijelaskan. AI hanya extraction, normalization, explanation.
- Compare = hero feature, format **trade-off forward** bukan ranking angka.
- User memverifikasi hasil ekstraksi, bukan input dari nol.

---

## Cara Kerja Tim (lesson dari proses)

- Orchestrator menjalankan sub-agent **sinkron** (blocking) — jangan spawn async lalu berhenti menunggu; harness tidak bisa me-resume agent yang sudah mengakhiri giliran.
- Subagent tidak bisa menulis ke disk di environment ini (Write/Bash diblokir izin) — artefak final dipersist oleh main thread.
