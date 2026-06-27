# Slice 2 — Prioritisasi, Urutan Eksekusi & Scope (Survey-First MVP)

<!--
  Di-generate oleh Orchestrator setelah sesi debat 2026-06-27.
  Edit hanya section bertanda [FAISAL UPDATE].
-->

## Status

```
[ ] Backlog       — identified, belum dijadwalkan
[ ] In Discussion — menunggu konfirmasi Faisal atas 2 gate (G1 bobot, G2 sign-off migrasi)
[x] Approved      — Product Owner approved, siap dibangun (G1=A, G2=Ya — 2026-06-27)
[ ] In Progress   — sedang dibangun
[ ] Done          — selesai dan shipped
[ ] Rejected      — tidak akan dibangun, dengan alasan
```

**Current status:** `[x] Approved` (PO: CONFIRMED — G1=A, G2=Ya)
**Last updated:** 2026-06-27
**Session:** `sessions/2026-06-27-slice2-prioritisasi.md`
**Confidence:** HIGH (2 gate material terjawab; tak ada konflik prinsip tersisa)

---

## Deskripsi Singkat

> Menetapkan "Slice 2 MVP" yang paling tajam untuk pilot berikutnya: **survey fisik → skor 5 dimensi** sebagai taruhan inti, ditambah negosiasi harga dan biaya all-in (display-only), dengan Apartemen/Kost, POI rute asli, dan UI timeline DITUNDA.

---

## Deskripsi Lengkap

### Apa keputusan ini?

Slice 1 (pipeline Kontrakan end-to-end, scoring 3 dimensi) sudah selesai. Slice 2 menambah **kedalaman** ke pipeline, bukan lebar. Sesi ini memutuskan subset fase Slice 2 mana yang dibangun untuk pilot, dalam urutan apa, dan menyelesaikan 4 keputusan scope yang terbuka.

Verdict tim: **Slice 2 MVP = S2-0 (aktivasi DB) + S2-2 (survey fisik → 5 dimensi) + S2-4 (negosiasi harga) + S2-5 (biaya all-in, display-only) + events-as-side-effect** (mengisi `candidate_events` tanpa membangun UI timeline). Foto survey dijahit ke review S2-2 sebagai tier-2 — bukan galeri foto-listing berdiri sendiri (itu feature-parity trap). Apartemen/Kost (S2-6), POI rute asli (S2-7), UI timeline (S2-3), dan pelengkap (S2-8) ditunda ke Slice 2.5/3.

S2-2 adalah satu-satunya fase yang mengubah **kualitas keputusan** user — ia mengaktifkan 2 dimensi radar (Kondisi & Owner) yang selama ini ghost. Ini juga moat sesungguhnya Hunian: evidence dari kunjungan fisik yang tidak bisa di-scrape marketplace manapun (defensibility 18-24 bulan menurut Strategist).

### Siapa yang paling diuntungkan?

- **Primary:** pencari Kontrakan aktif (young professional) yang sudah survei fisik dan ingin keputusannya berbasis evidence nyata, bukan teks listing.
- **Secondary:** pilot user yang sedang di tahap negosiasi harga akhir.

### Di stage mana user journey ini terjadi?

```
discover → shortlist → compare → [SURVEY + NEGOTIATE] → decide → move in
```

Survey mengisi gap evidence pasca-kunjungan; negosiasi & biaya all-in menajamkan dimensi harga sebelum keputusan final.

---

## Kenapa Fitur Ini Dibangun

### Alasan dari debat

- **Survey = penggerak cycle completion (4/4 agen setuju).** Fase lain (foto, timeline, POI) adalah enrichment atau "completeness theater" — tidak mengubah kandidat yang dipilih. Hanya survey menambah dimensi keputusan baru.
- **Survey = moat irreplaceable (STR).** Marketplace tidak bisa meniru tanpa mengasingkan landlord yang tak ingin dinilai kondisi fisiknya — konflik kepentingan yang tak bisa mereka selesaikan.
- **Negosiasi (S2-4) dicabut dari daftar risiko oleh DA sendiri:** negosiasi sewa adalah norma budaya Indonesia (bukan edge case), effort kecil (~1 hari), dan tanpa ini cycle terputus ke WhatsApp.
- **Biaya all-in = conviction trigger (STR/UX):** "sewa 2,5jt tapi all-in 3,8jt" adalah aha-moment yang tidak ditunjukkan marketplace.

### Pain point yang di-solve

- Evidence kunjungan fisik hilang di catatan WhatsApp, tidak masuk ke perbandingan — severity: HIGH
- Harga listing tidak comparable apple-to-apple (utilitas tersembunyi) — severity: MEDIUM
- Keputusan negosiasi final dicatat di luar Hunian → siklus terputus — severity: MEDIUM

### Market gap yang diisi

Marketplace (Mamikos/OLX/Rumah123) fokus discovery & lead-gen, bukan membantu **memutuskan** antar kandidat yang sudah dikumpulkan. Survey fisik 5D dan biaya all-in adalah data yang struktur insentif marketplace tidak akan tampilkan.

---

## Tradeoff yang Disadari

### Keputusan yang diambil

| Keputusan | Dipilih | Tidak dipilih | Alasan |
|---|---|---|---|
| Garis Slice 2 MVP | S2-0+S2-2+S2-4+S2-5(display)+events | Penuh 8 fase; atau foto-first | Hanya survey menggerakkan metric; sisanya enrichment/expansion |
| Biaya all-in | DISPLAY ONLY (label sumber + callout) | Masuk scoring formula | Data parsial = false precision yang bisa MEMBALIK keputusan di Compare |
| Ukuran survey | 6 dimensi langsung | 2D bertahap lalu expand | Non-adopsi = behavior problem, bukan form-length; 2D = 2× migration |
| scoring_version 2.0 | ONE-SHOT migration semua kandidat | Lazy rescore + badge | Compare hero; 3D vs 5D dalam 1 view = functional failure; pilot <20 kandidat = script trivial |
| Foto | "Foto Survey" dijahit ke S2-2 | Galeri foto-listing standalone | Foto-listing standalone = feature-parity trap (drift ke marketplace) |
| Apartemen & Kost | ~~DEFER ke Slice 3~~ **DIBANGUN MANUAL 2026-06-27** (atas permintaan Faisal) | Build sekarang (JSONB/typed) | Validasi PMF Kontrakan dulu; 2 tipe baru = surface area + risiko diagnosis. **Catatan:** dibangun via `type_specific_data` JSONB + form manual (paste/extraction tetap Kontrakan-only). |
| POI rute asli | DEFER (tetap straight-line) | Distance Matrix lazy cache (~$0.75/bln) | Straight-line belum terbukti menyesatkan; DDL `candidate_poi` belum ada |
| Biaya all-in schema | ADD COLUMN numeric (fixed) | JSONB `{komponen,nominal}[]` | TL: query/total andal; listrik+air ~80% kasus. Revisit bila schema creep |
| Survey scoring | avg sederhana per kelompok → 0-100 | weighted per sub-dimensi; per-dimensi threshold verdict | Hindari fabricated weights & over-engineering tanpa data |

### Yang kita korbankan

Kita mengorbankan **lebar** (Apartemen/Kost, POI presisi, UI timeline, galeri foto) demi **kedalaman keputusan** (survey 5D) pada satu tipe properti yang sudah terbukti jalan. Kandidat dengan biaya all-in lengkap tidak mendapat keuntungan scoring dari kelengkapan datanya — diterima: lebih baik kehilangan upside daripada menciptakan downside lewat false precision.

### Yang akan jadi masalah kalau asumsi ini salah

**Asumsi terbesar (DA):** pilot user membuka Hunian saat/segera setelah kunjungan fisik untuk mengisi survey. Jika mereka memutuskan secara verbal di lokasi / via WhatsApp dan tidak kembali, survey data = 0 dan 4-5 hari effort jadi theater. **Mitigasi:** `insertCandidateEvent` (side-effect S2-2) memberi detection window — kita tahu dalam **3 sesi pilot**, bukan 3 bulan. **REVISIT TRIGGER:** 0 `survey_complete` events setelah 3 sesi → emergency review (saat itu usul 2D DA jadi relevan, dengan data).

---

## Technical Approach

**Feasibility:** ⚠️ Feasible with caveats

**Stack yang digunakan:**
- Existing: Next.js 15, Supabase (Postgres+Storage), kolom placeholder Slice 1 (`score_kondisi`, `score_owner`, `harga_akhir_bulanan`, `weight_keamanan`/`weight_owner`, generated `harga_efektif_bulanan`), renormalisasi NULL Slice 1.
- Baru: tabel `candidate_surveys` + `candidate_events` (DDL SECTION 8, di-CREATE di S2-0); ADD COLUMN `biaya_listrik_nominal`/`biaya_air_nominal` numeric; helper `insertCandidateEvent`; migration script rescore v1→v2.

**Opsi implementasi yang dipertimbangkan:**

| Opsi | Pros | Cons | Dipilih? |
|---|---|---|---|
| Survey 6D langsung + one-shot migration | Tak ada double-migration; Compare konsisten | Effort L di depan; taruhan behavior | ✅ Ya |
| Survey 2D bertahap | Validasi murah | 2× migration cycle; non-adopsi tetap mungkin | ❌ Tidak — behavior problem bukan form-length |
| Biaya all-in masuk scoring | "Reward" data lengkap | False precision; Compare menyesatkan | ❌ Tidak — langgar prinsip |
| POI Distance Matrix lazy cache | Presisi rute; murah ($0.75/bln) | DDL belum ada; belum terbukti perlu | ❌ Defer |

**Effort estimate:** ~18-25 hari solo untuk Slice 2 penuh; MVP (S2-0+S2-2+S2-4+S2-5+events) = porsi terbesar S2-2 (L, 4-5 hari) + S2-0 (0.5h) + S2-4 (1h) + S2-5 (M).
**Reversibility:** MEDIUM (survey/scoring formula = HIGH-stakes via scoring_version; ADD COLUMN biaya = HIGH; defer items = HIGH).

**Risiko teknikal:**
- RLS via JOIN untuk `candidate_surveys`/`candidate_events` (tabel tanpa `user_id` langsung) — risiko **data leak antar user**. Mitigasi: SETIAP query child table JOIN ke `candidates WHERE user_id = $session`; verify integration test unauth→0 row.
- Compare mencampur kandidat v1.0 (3D) & v2.0 (5D) — Mitigasi: one-shot migration sebelum deploy, test di staging dulu.
- Re-survey overwrite `surveyed_at` (UNIQUE candidate_id) → history hilang. Mitigasi: log `survey_completed` ke `candidate_events` tiap submit.
- Biaya parsial di Compare (all-in vs listing) menyesatkan. Mitigasi: label sumber harga wajib + callout "harga belum lengkap".
- `candidate_poi` DDL belum ada di `db/schema.sql` (hanya bila S2-7 diaktifkan).

---

## Product Owner Notes

**Vision alignment:** ⚠️ CONCERNS (PENDING CONFIRMATION)

Radar 5D, one-shot rescore, dan perubahan `deriveVerdict` AMAN terhadap prinsip "AI tidak memutuskan" — SELAMA `deriveVerdict` dijaga dalam framing trade-off, bukan winner-label (constraint implementasi, bukan gate Faisal). Biaya all-in display-only AMAN terhadap "tanpa angka difabrikasi".

**Satu konflik vision nyata yang diangkat:** menambah dimensi Kondisi & Owner ke scoring memerlukan bobot untuk keduanya — padahal user saat ini hanya memilih bobot Harga/Lokasi/Fasilitas via Prioritas onboarding. Keputusan terkunci Faisal: **"bobot SELALU = pilihan user"**. Default sistem fixed untuk 2 dimensi baru ini akan melanggar prinsip itu secara struktural. Karena itu output DITAHAN sampai Faisal menjawab G1.

**→ RESOLVED (Faisal, 2026-06-27): G1 = Opsi A.** Kondisi & Owner ditambahkan ke editor Prioritas di `/pengaturan` (default EQUAL, **bisa di-override user**) — pakai kolom `weight_keamanan`/`weight_owner` yang sudah ada di `user_preferences`. Konflik vision **hilang**: bobot tetap 100% pilihan user, konsisten penuh dengan prinsip terkunci. **Implikasi build:** editor Prioritas (Slice-1 yang menandai opsi non-Slice-1 "Segera") harus mengaktifkan opsi Keamanan/Kondisi(→Owner) saat S2-2; `computeWeights` diperluas dari 3D ke 5D; `bobot_source` tetap `user-defined`.

**Konfirmasi dari Faisal:** ✅ CONFIRMED — G1 = A (bobot K&O editable di settings, default EQUAL), G2 = Ya (pilot diberi tahu skor 3D→5D bisa bergeser).
**Tanggal konfirmasi:** 2026-06-27
**Vision alignment (pasca-jawaban):** ✅ ALIGNED

---

## Open Questions

> ✅ Kedua gate sudah terjawab Faisal (2026-06-27). Tidak ada blocker tersisa untuk TL.

1. **[G1 — RESOLVED] Bobot Kondisi & Owner → Opsi A.** Masuk editor Prioritas `/pengaturan` (default EQUAL, bisa di-override). `computeWeights` diperluas ke 5D; pakai `weight_keamanan`/`weight_owner`.
2. **[G2 — RESOLVED] Inform pilot → Ya.** Pilot diberi tahu (personal) bahwa skor 3D→5D bisa menggeser ranking saat Slice 2 live — bukan bug.

---

## Next Actions

- [x] **Faisal:** jawab G1 → **Opsi A** (bobot K&O editable di settings, default EQUAL) — 2026-06-27
- [x] **Faisal:** sign-off G2 → **Ya** (inform pilot soal one-shot migration 3D→5D) — 2026-06-27
- [~] **TL:** S2-0 — **DDL migration SIAP**: `db/migrations/2026-06-27_slice2_s2-0_surveys_events.sql` (candidate_surveys + candidate_events + index + trigger updated_at + CHECK event_type + RLS GUC owner; surveys via JOIN). **Sisa (manual):** (1) jalankan file di Supabase SQL editor, (2) buat bucket `candidate-photos` (SQL ada di file), (3) integration test app-layer unauth/lintas-user→0 row saat S2-2. `scoring_version` tak butuh DDL (kolom sudah ada). — owner: TL/Faisal — by: Day 1
- [ ] **UX/Faisal:** finalize urutan field form survey (Kondisi+Owner DULU, target <90 detik on-location) — owner: UX — by: Day 2 (paralel S2-0)
- [x] **TL:** S2-2 **IMPLEMENTED** (2026-06-27, typecheck hijau) — scoring 5D (`score.ts`/`rescore.ts`), `computeWeights` 5D, form survei 2-bagian (`/kandidat/[id]/survey`) + `saveSurveyAction`, UI detail/settings/bandingkan aktif, event `survey_completed`/`data_updated`. Migrasi: v2 otomatis saat kandidat disurvey / rescore prefs (pilot <20 kandidat). Sisa: foto-survei (S2-1), timeline UI (S2-3).
- [x] **TL:** S2-4 (negosiasi) + S2-5 (biaya all-in display-only) **IMPLEMENTED** (2026-06-27, typecheck hijau). S2-4: `recordNegotiationAction` + `negotiation-control.tsx` (tanpa migrasi). S2-5: migration `..._s2-5_biaya_nominal.sql` (ADD COLUMN numeric) + field Rp di form survey + kartu all-in detail (display-only + callout). **Sisa manual:** jalankan migration S2-5 di Supabase.
- [ ] **Faisal:** onboard pilot user on-location + monitor `survey_complete` events 3 sesi (REVISIT TRIGGER: 0 events → emergency review) — owner: Faisal — by: post-launch ongoing

---

## Catatan Faisal

<!-- [FAISAL UPDATE] Tambahkan catatan, feedback, atau keputusan pribadi di sini -->

**2026-06-27 — Keputusan gate:**
- **G1 = A** — Bobot Kondisi & Owner masuk editor Prioritas `/pengaturan` (default EQUAL, bisa di-override). Prinsip "bobot = pilihan user" dijaga penuh. Saat S2-2: aktifkan opsi Keamanan/Kondisi/Owner di editor Prioritas (yang kini berlabel "Segera") + perluas `computeWeights` ke 5D.
- **G2 = Ya** — Pilot akan diberi tahu skor 3D→5D bisa menggeser ranking saat Slice 2 live.
- Status → **Approved**. TL boleh mulai S2-0 saat eksekusi di-kick-off (menunggu instruksi mulai ngoding dari Faisal — saat ini baru tahap dokumentasi/perencanaan).

**2026-06-27 — S2-3 (Timeline) dibangun lebih awal (Faisal):** Awalnya ditunda tim, tapi karena event lifecycle sudah otomatis terkumpul di `candidate_events` (dari S2-2/S2-4), UI timeline jadi murah. Implementasi: `lib/events.ts` + pencatatan added/status_changed/data_updated/survey_completed/price_changed/user_note + render timeline & "Tambah catatan manual" di detail. Typecheck hijau.

**2026-06-27 — Refinement scope S2-2 (Faisal):** Survey punya **DUA fungsi**, bukan hanya rating. (A) **Lengkapi data objektif** yang belum ada di listing (dari `listUnknowns`: KT/KM, furnished, carport, dapur, luas, deposit, biaya listrik/air, alamat) → update `candidates` → memperbaiki **skor 3D lama** + completeness + menutup "Yang belum lengkap" di detail. (B) Rating subjektif → `score_kondisi`/`score_owner` (2D baru). Jadi satu kunjungan menyempurnakan skor lama **dan** menambah dimensi baru. **Guard adopsi (target <90 dtk):** bagian "Lengkapi data" hanya tampilkan field yang MASIH kosong (bukan form ulang). Detail di `docs/DEVELOPMENT-PLAN-SLICE2.md` §S2-2. *(Catatan: ini memperkuat tesis "survey = cycle driver"; tetap selaras keputusan tim — tak mengubah gate G1/G2.)*

---

## Riwayat

| Tanggal | Event | Catatan |
|---|---|---|
| 2026-06-27 | Feature identified & didebat | Session: `sessions/2026-06-27-slice2-prioritisasi.md` |
| 2026-06-27 | Debat selesai | Confidence: MEDIUM; agen PM·UX·STR·TL·DA·SYN·PO |
| 2026-06-27 | PO gate | PENDING CONFIRMATION — menunggu G1 & G2 dari Faisal |
| 2026-06-27 | **Gate terjawab → Approved** | G1=A (bobot K&O editable), G2=Ya (inform pilot). Vision ALIGNED, Confidence→HIGH |
