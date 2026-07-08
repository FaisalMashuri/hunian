# Sesi Agent Team — Fitur Collaboration (Undang Pasangan)

**Tanggal:** 2026-07-06
**Topik:** Fitur collaboration — user mengundang pasangan untuk berbagi, melihat, dan menganalisis bersama hunian yang sudah ditambahkan. Analisis menyeluruh implikasi arsitektur (identitas NextAuth `user_id` per-row).
**Agents:** PM · UX · STR · TL · DA · SYN · PO (semua 7 — high-stakes, irreversible: menyentuh fondasi identitas + migrasi data existing)
**Mode:** PLAN MODE (read-only; tidak ada kode diubah)
**Verdict akhir:** DEFER-DENGAN-GATE · Confidence MEDIUM · Status PO: UNCERTAIN (PENDING Faisal)

---

## Grounding (kode nyata yang dibaca sebelum spawn)

- `db/schema.sql` — 8 tabel; `candidates.user_id` FK; child-table (`candidate_commute`/`_deal_breaker_flags`/`_photos`/`_surveys`/`_events`) di-guard via `candidate_id`, tanpa `user_id` langsung. RLS SECTION 6: service-role BYPASS RLS → filter user_id aplikasi = penjaga primer; policy GUC belum fungsional (pakai service role).
- `auth.ts` / `auth.config.ts` — identitas NextAuth: jwt callback upsert `users` by google_sub → `token.uid`; session callback `session.user.id = token.uid`; authorized tolak user tanpa id.
- `lib/supabase/server.ts` — service-role client, komentar eksplisit: SETIAP query WAJIB filter user_id.
- `app/dashboard/data.ts` — loader ber-`cache()`: filter `.eq("user_id")` lalu child `.in("candidate_id", ids)`.
- **Blast radius terverifikasi:** 21 file `app/**` filter `.eq("user_id")`; 10 file sentuh child via `candidate_id`.

---

## Task Decomposition

Intent sebenarnya = BUKAN "bikin fitur share", melainkan pertanyaan arsitektur: apakah Hunian harus pindah dari identity-per-user ke shared-space, dan seberapa dalam untuk MVP tanpa membongkar fondasi yang jalan.

- Wave 1 (paralel): PM, UX, STR, TL
- Wave 2 (sequential): DA → SYN → PO

---

## Ringkasan Argumen per Agent

### PM
DEFER post-S2-2 sampai %di-Compare >30%. Job lebih sempit & lebih akhir di journey daripada S2-2 (survey) & S2-5 (biaya) yang melayani 100% user. Collaboration melayani ~30-40% (yang berpasangan & keduanya aktif). Slice pertama = share-link read-only (menyelesaikan 70% job, = fitur premium yang sudah direncanakan). Invite 1 partner gratis (acquisition channel — jangan di-paywall). Tolak presence/anotasi/voting/komentar untuk MVP. Minta Faisal cek: % pilot berpasangan; ada komplain sharing? Validasi 1 pertanyaan ke pilot bisa selesai 48 jam tanpa kode.

### UX
Job = **shared source-of-truth**, bukan real-time. Workaround hari ini = screenshot + WA berantakan → asimetri informasi.
**INSIGHT KRITIS (skor ganda):** skor = ekspresi preferensi, bukan fakta objektif. Tolak (c) rata-rata bobot (skor fiksi, langgar prinsip). Tolak (a) skor-owner-diam-diam (menyesatkan collaborator). Rekom (b) dua-skor-berdampingan + label sumber (butuh guest onboarding) + (d) toggle. Fallback: label "skor berdasarkan preferensi [owner]".
Voting/komentar/anotasi = mostly cosmetic untuk pasangan yang bisa ngobrol langsung/WA; komentar berguna hanya untuk catatan survey async. Presence real-time DITOLAK (low-frequency). Magic-link tanpa akun V1. WAJIB validasi: diary study 5 pasangan + intercept test link.

### STR
Whitespace nyata — tak ada kompetitor cari-hunian ID (Mamikos/OLX/Rumah123/Rukita) punya kolaborasi pasangan. Memperkuat positioning "decision tool" (DMU sewa sering >1 orang). Efek = **qualified-pair acquisition** (1 partner qualified/siklus, BUKAN viral eksponensial) + naikkan **within-cycle completion** (BUKAN long-term retention). Collaboration = UX multiplier, bukan moat/data-source. DEFER sampai pull-signal (user spontan screenshot compare). Beda fungsional: share = 1-arah deliverable PREMIUM; collaborate = 2-arah workflow GRATIS 1 partner.

### TL
**Opsi A `candidate_shares` (additive)** — zero backfill, zero migrasi 21 file; loader `data.ts` cukup +1 branch. TOLAK Opsi B `workspace_id` (migrasi 21 file + backfill live + isu bobot ganda). Opsi C hybrid = redundant dengan A. 2 tabel baru: `candidate_shares` + `invitations` (token SHA-256, expiry 72 jam, confirm-mismatch email, accepted_by). Helper terpusat `assertCandidateAccess` (migrasi bertahap dari mutation actions). **Skor:** Opsi X satu-skor-owner dulu (jangan sentuh engine); Opsi Y `candidate_scores` per-viewer = refactor besar, defer; Opsi Z on-the-fly = hilang index sort. Async bukan Realtime (Realtime tak kompatibel service-role client). Slice C-1 read-only ~1 minggu (3-4 hari tanpa email). Foto: path owner tetap, ambil owner_id dari `candidates`. Pertanyaan terbuka: granularitas share, siapa boleh tambah kandidat, decisions per siapa, deal-breaker collaborator.

### DA — 5 tantangan (semua AKTIF; 1 minor dicabut sendiri: skema-additive risk, tak ada argumen teknis)
- **C-1 (HIGH):** "Defer" bisa groupthink malas — TL bilang 3-4 hari zero-risk, jadi alasan defer lemah KECUALI ada tanggal evaluasi gate + konfirmasi tak ada pilot yang sudah coba sharing informal. Tapi kalau semurah itu & tetap tak gerakkan metric = shiny distraction. Pisahkan "worth building" dari "worth building SEKARANG".
- **C-2 (HIGH):** dua-skor-berdampingan bisa MEMFORMALKAN konflik pasangan ("skormu 45" jadi leverage argumen) → merusak "memutuskan bersama". Kemungkinan ketiga tak dieksplor: collaborator mungkin tak butuh SKOR, cukup DATA + reaksi/komentar. Skor = tool perancang kriteria (owner), bukan reviewer.
- **C-3 (HIGH, terpenting):** SELURUH sesi berasumsi use-case = pasangan AKTIF berdua. Belum ada 1 data point. Pola dominan ID mungkin "solo-lead + partner PASIF approver" → cukup share-link/export. Persis pola sesi browser-extension (asumsi menolak asumsi).
- **C-4 (HIGH):** kalau share-link = 70% (mungkin 95%) job, collaboration 2-arah mungkin OVER-BUILD. Mungkin cukup share-link, titik.
- **C-5 (HIGH):** batas gratis-vs-premium kabur; invite gratis magic-link bisa MENGKANIBAL share-link premium. Butuh diferensiasi FUNGSIONAL tak-bisa-diworkaround.
- Pertanyaan pemungkas DA: "Apakah kamu sudah pernah tanya 1 pilot: siapa yang ikut terlibat dalam keputusan hunianmu?"

### SYN — Verdict: DEFER-DENGAN-GATE
Bukan cop-out. Resolusi 4 genuine conflict:
1. **Defer vs build-murah:** DA menang — "murah teknis ≠ prioritas tinggi", TL keliru menggabungkan effort-rendah dgn prioritas. Tapi defer wajib bertanggal. → DEFER-dengan-trigger terukur.
2. **Skor ganda vs satu vs tanpa:** DA+UX menang dari dua arah — skor = representasi preferensi. → TUNDA keputusan skor sampai pola tervalidasi (approver pasif → tanpa-skor+komentar cukup; evaluator aktif → dua-skor bertahap).
3. **Collaboration vs cukup share-link:** STR menang secara definisional (beda fungsional nyata), DA menang secara empiris (segmen belum diketahui). → Share-link read-only DAHULU; collaboration 2-arah GO hanya setelah konfirmasi segmen aktif.
4. **Batas monetisasi:** DA-C5 + prinsip gate-di-output → diferensiasi HARUS fungsional tegas (share=publik-tanpa-akun-deliverable-PREMIUM; collaboration=butuh-akun-workflow-GRATIS-1-partner); kalau tetap terasa substitut, PM drop salah satu.
Langkah pemutus: **VALIDASI-2** (tanya pilot screenshot Compare — 2 hari, termurah) + VALIDASI-1 (intercept 10-15 orang). Confidence MEDIUM (bergantung hasil validasi). 4 hal butuh Faisal (F-1..F-4).

### PO — Vision check → Status UNCERTAIN (PENDING Faisal)
- "AI tak mengambil keputusan" AMAN; Compare tetap trade-off forward AMAN.
- **Koreksi prinsip (ditutup PO, bukan pertanyaan Faisal):** "satu skor owner untuk collaborator" DITOLAK kecuali collaborator bisa atur bobot sendiri — langgar "bobot=pilihan user". Sudah closed oleh prinsip.
- Batas free/premium collaboration = **dependency** ke gate freemium Q1 (2026-06-29, PENDING) & scoring v2.0 (Slice 2 G1, PENDING). Jangan rancang skor/monetisasi collaborator sebelum dijawab.
- Verdict DEFER = presisi, bukan konservatif (asalkan bertanggal).
- Pangkas F-1..F-4 → **2 pertanyaan material** (Q1 eksekusi share-link sekarang vs tunggu; Q2 batas free/premium invite), masing-masing dengan default 48 jam.
- BOLEH jalan tanpa Faisal: VALIDASI-2 (hari ini), finalisasi spec share-link. DITAHAN: eksekusi collaboration 2-arah, skor collaborator (sampai gate lama dijawab).

---

## Keputusan Final (mengikat lintas sesi)

1. **Verdict: DEFER-DENGAN-GATE.** Layak dibangun, bukan sekarang; alasan = premis pasangan-aktif belum tervalidasi (bukan karena mahal). Trigger terukur, bukan defer selamanya.
2. **Model data (bila GO): Opsi A `candidate_shares` + `invitations` additive.** workspace_id DITOLAK (migrasi 21 file). Reversibel.
3. **Skor collaborator DITUNDA.** Rata-rata bobot & satu-skor-owner-diam DITOLAK (langgar prinsip). Pilihan final tergantung pola aktual.
4. **Real-time DITOLAK; async sync-on-open.**
5. **Share-link read-only PREMIUM dieksekusi terpisah** dari debat collaboration (sudah di roadmap 2026-06-29).
6. **Monetisasi collaboration:** diferensiasi fungsional tak-bisa-diworkaround; bergantung gate freemium Q1 yang masih pending.

## 🙋 Gate Faisal (output collaboration DITAHAN, default 48 jam)

- **Q1:** Share-link read-only — eksekusi sekarang (terpisah) atau tunggu validasi 2 hari? *(Default: eksekusi sekarang; collaboration tetap DEFER.)*
- **Q2:** Batas free/premium collaboration — invite 1 partner gratis atau premium? Bergantung Q1 freemium 2026-06-29. *(Default: gratis 1 partner.)*

## REVISIT TRIGGER
VALIDASI-2 >20% pilot sudah screenshot Compare (pull-signal) · keluhan organik "tak bisa ajak pasangan" · kompetitor lokal tambah collaboration · %di-Compare >30% (fondasi solid).

---

## Catatan proses
- Semua agent hormati Tradeoff Mandate.
- DA hanya cabut 1 tantangan minor (schema-additive) — lebih sedikit dari sesi Slice 2 (cabut 2), karena premis collaboration lebih lemah (nol behavioral data vs Slice 1 punya observasi).
- Konflik terpenting yang di-surface: premis "pasangan aktif" (DA-C3) = akar dari semua keputusan downstream.
