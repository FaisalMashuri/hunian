# Hunian Team Context

Context lintas sesi untuk agent team. Dibaca Orchestrator di awal tiap sesi.

---

## Keputusan & Prinsip yang Sudah Disepakati

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
