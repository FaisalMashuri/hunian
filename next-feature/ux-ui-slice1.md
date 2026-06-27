# UX/UI Design — Slice 1 (8 Layar Pipeline Kontrakan)

## Status

```
[ ] Backlog       — identified, belum dijadwalkan
[ ] In Discussion — sedang didebat agent team
[x] Approved      — Product Owner approved, siap dibangun (Faisal menjawab Q1/Q2/Q3)
[ ] In Progress   — sedang dibangun
[ ] Done          — selesai dan shipped
[ ] Rejected      — tidak akan dibangun, dengan alasan
```

**Current status:** `[x] Approved` — Faisal menjawab gate Q1/Q2/Q3 (2026-06-26)
**Last updated:** 2026-06-26
**Session:** `sessions/2026-06-26-ux-ui-slice1.md`
**Spec lengkap:** `docs/UX-DESIGN.md`
**Confidence:** HIGH

---

## Keputusan Faisal (2026-06-26) — OVERRIDE atas desain

1. **Landing TERPISAH dari login.** `/` = halaman landing publik (value prop + CTA, gambar placeholder + animasi proper biar hidup, responsif penuh) → `/login` halaman sendiri. Override "landing+login satu layar" di Layar 1.
2. **Step Prioritas WAJIB** (bukan skippable). Override rekomendasi PO skippable+equal-weight. `bobot_source` selalu = pilihan user.
3. **Q2 scoring 3 dimensi** (Harga/Lokasi/Fasilitas) — confirmed (sudah di PRD §6.6).
4. **Pengumpulan 20+ teks WA asli DITUNDA** — build UI Fase 1 jalan dulu; gate akurasi dijalankan sebelum commit Slice 2.

---

## Deskripsi Singkat

> Spesifikasi UI/UX buildable (shadcn/ui + Tailwind, mobile-web, bahasa Indonesia) untuk 8 layar Slice 1 Hunian — dari Login Google sampai memilih satu kandidat di Compare trade-off forward.

---

## Deskripsi Lengkap

### Apa fitur ini?

Sesi desain mengubah mockup ASCII di `mvp.md` + functional requirements ber-ID di `PRD.md` menjadi spec UI/UX yang langsung bisa dibangun untuk Slice 1 (Kontrakan saja). Hasilnya: Information Architecture + spec per layar (layout, state empty/loading/error/success, microcopy Indonesia, komponen shadcn, FR yang dipenuhi) + design direction (tipografi, palet, interaksi, aksesibilitas) + component inventory untuk `npx shadcn add`.

8 layar (+ landing publik terpisah di `/`): **Login** (Google, `/login`) → **Onboarding 4-step** (Budget · Tujuan+Transport · Prioritas [WAJIB] · Deal Breaker [opsional]) → **Input Property** (tab paste-first / manual) → **Property Review** (verifikasi ✓/⚠, bukan form kosong, + input km manual) → **Daftar Kandidat** (status + flag deal breaker) → **Skor + AI Explanation** (skor kecil, AI on-demand) → **Compare trade-off forward** (hero) → **Settings**.

Navigasi: bottom nav 3 tab (🏠 Kandidat · ⚖ Bandingkan · ⚙ Pengaturan) + FAB. Bahasa visual: Plus Jakarta Sans + teal-700, stone-50 background, status 3-layer (ikon+warna+teks). 21 komponen shadcn + 8 komponen custom.

### Siapa yang paling diuntungkan?

- **Primary:** Pencari aktif (membandingkan beberapa kandidat sewa Kontrakan, sumber tersebar di WhatsApp/sosmed).
- **Secondary:** Pencari deadline; Builder/PO (Faisal) yang memvalidasi PMF lewat cycle completion.

### Di stage mana user journey ini terjadi?

```
discover → shortlist → [INPUT/REVIEW/SCORE] → [COMPARE] → decide → move in
```
Spec ini mencakup stage shortlist sampai decide (menutup siklus = KPI-1).

---

## Kenapa Fitur Ini Dibangun

### Alasan dari debat

Fase 1 coding tidak boleh dimulai tanpa peta layar yang jelas — tanpa spec, risiko Property Review terasa "betulkan semua" dan Compare jatuh ke mode ranking marketplace (kehilangan differentiator). Sesi ini mengunci: Compare adalah satu-satunya layar yang wajib dipoles full (PM); trade-off text rule-based bukan AI (TL); friction onboarding + km manual + scoring NULL adalah risiko nyata yang butuh resolusi sebelum kode (DA); semua dapat dijalankan dalam scope Slice 1 (SYN); selaras vision dengan 3 keputusan untuk Faisal (PO).

### Pain point yang di-solve

- Tanpa spec UI, pipeline Fase 1–4 dibangun ad-hoc dan tidak konsisten — severity: HIGH.
- DATA GAP: `score_lokasi` butuh `distance_km` yang tak punya UI di mockup — bila tak ditambal, 1 dari 3 dimensi Compare kosong — severity: HIGH.
- Onboarding berisiko drop-off sebelum user lihat satu kandidat (membutakan KPI) — severity: MEDIUM-HIGH.

### Market gap yang diisi

Compare trade-off forward (apa yang dikorbankan, bukan "skor 87/100") adalah pembeda dari Mamikos/Rumah123/OLX yang berparadigma listing+ranking. Spec ini menjaga paradigma itu konkret & buildable.

---

## Tradeoff yang Disadari

### Keputusan yang diambil

| Keputusan | Dipilih | Tidak dipilih | Alasan |
|---|---|---|---|
| Navigasi | Bottom nav 3 tab + FAB | Hamburger / stack-only | Thumb-reach mobile; 3 destinasi inti |
| Input default | Paste-first | Form-first | Mental model riil: teks WA ada duluan (80% kasus) |
| Map onboarding | Places Autocomplete (teks) | Embed peta interaktif | Akurasi "kira-kira kantor" cukup; embed 3–4x effort |
| Property Review | ReviewRow tap-to-edit ✓/⚠ | Form pre-filled biasa | Membedakan "yakin" vs "tidak yakin" → fokus koreksi |
| Compare layout | Horizontal-scroll table sticky col + trade-off cards | Card-stack / carousel / tabel-saja | Pertahankan side-by-side comparative + spirit trade-off |
| Trade-off text | Rule-based | GPT-4o mini | Data sudah ada; hemat cost + deterministik + tak menambah latency hero |
| Score viz | Progress bar + angka kecil | Recharts radar/donut | FR-CM-2 "skor kecil"; hindari dependency besar |
| AI explanation | On-demand + session-cache | Auto-generate tiap buka | Hemat cost API per kandidat |
| Prioritas onboarding | Skippable + equal-weight default | Wajib / di-defer penuh | Cycle completion vs scoring tetap punya bobot (PENDING Q1) |
| Score NULL (jarak kosong) | Renormalisasi sisa bobot + scoring_version | NULL=50 / zero-out | Tak menciptakan signal palsu; auditable |

### Yang kita korbankan

Kita korbankan kelengkapan (sort/filter daftar, multi-foto gallery, embed peta, 5 dimensi scoring, deadline pindah) demi kecepatan & fokus jalur menuju Compare. Diterima karena pilot ~3–5 kandidat dan KPI = cycle completion, bukan kekayaan fitur.

### Yang akan jadi masalah kalau asumsi ini salah

Asumsi terbesar (DA): **akurasi extraction >85% pada teks WA NYATA** (baru 92.7% sintetis). Bila gagal, Property Review penuh ⚠ dan value "verifikasi bukan ketik dari nol" runtuh — desain sebagus apapun tak menyelamatkan. Asumsi kedua: user mau mengisi **km manual** (input di luar app); bila mayoritas skip, dimensi Lokasi kosong di mana-mana.

---

## Technical Approach

**Feasibility:** ⚠️ Feasible with caveats (Compare = layar paling berat ~3–4 hari FE; Property Review berat).

**Stack yang digunakan:**
- Next.js 15 + Tailwind 3 + shadcn/ui (21 komponen) + 8 komponen custom (ScoreBar, StarDisplay, TradeoffCard, ReviewRow, CandidateCard, CompareTable, BottomNav, FAB).
- Supabase (data per layar dari 8 tabel `schema.sql`) · Auth.js + Google OAuth · GPT-4o mini (extraction/explanation) · Google Places/Geocoding (autocomplete, tanpa embed) · Plus Jakarta Sans.

**Opsi implementasi yang dipertimbangkan:** lihat tabel tradeoff di atas (map picker, Compare layout, score viz, trade-off text) — semuanya dengan alternatif yang ditolak beralasan.

**Effort estimate:** sejalan Fase 1–4 DEVELOPMENT-PLAN (~15–20 hari FE+integrasi); Compare (Fase 4) padat.
**Reversibility:** HIGH untuk hampir semua (perubahan visual/komponen); MEDIUM untuk keputusan formula scoring (Q2) & onboarding contract (Q1).

**Risiko teknikal:**
- `distance_km` tanpa UI → DITAMBAL (input km manual di Review) — mitigasi: renormalisasi bobot + scoring_version v1-3D/2D/1D.
- `extraction_confidence` shape & threshold ✓/⚠ belum dikunci → kunci konstanta TS (≥0.7 ✓) sebelum build Layar 4.
- Recompute skor saat bobot Settings berubah → server-side, semua kandidat di background.

---

## Product Owner Notes

**Vision alignment:** ⚠️ CONCERNS (mayoritas ✅ ALIGNED; status PENDING CONFIRMATION karena Q1 memodifikasi FR-ON-3 Must, dan Q2 formula 3D/5D perlu ditegaskan).

Catatan vision non-negotiable (PO): AI extraction+explanation saja (skor rule-based); `bobot_source` wajib di schema; deal breaker = flag bukan eliminasi (selamanya); `scoring_version` per kandidat; trust copy wajib tooltip disclaimer; Slice 1 = Kontrakan ONLY; fallback manual wajib bila extraction <85%; Compare = trade-off forward tanpa "kandidat terbaik".

**Konfirmasi dari Faisal:** PENDING
**Tanggal konfirmasi:** —

---

## Open Questions

1. **[Q1]** Step Prioritas skippable + equal-weight default (34/33/33), atau tetap wajib? — rekomendasi PO: skippable + safeguard — default bila diam: WAJIB.
2. **[Q2]** Formula scoring Slice 1 resmi 3 dimensi (Harga/Lokasi/Fasilitas), Kondisi & Owner ditunda? — PRD §6.6 sudah menetapkan 3D; ini konfirmasi vs 5D di mvp.md — default: tahan scoring lock.
3. **[Q3]** Owner & deadline pengumpulan 20+ teks WA kontrakan nyata Jabodetabek — rekomendasi PO: Faisal sendiri, sebelum integrasi screening AI pertama.

---

## Next Actions

- [ ] Faisal menjawab Q1/Q2/Q3 (human gate) — owner: Faisal — by: sebelum scoring engine (Fase 3) dibangun
- [ ] Kerjakan paralel tanpa menunggu: design system & tokens, Layar 1/2(step1-2)/3/4/5(skeleton)/7(layout)/8 + scope fixes + pipeline extraction — owner: dev — by: Fase 1–2
- [ ] Kunci konstanta TS `extraction_confidence` (threshold ✓≥0.7) sebelum build Property Review — owner: TL — by: awal Fase 2
- [ ] Tambah field schema: `bobot_source` (user_preferences), pastikan `scoring_version` mendukung v1-3D/2D/1D — owner: TL — by: sebelum schema lock final
- [ ] Faisal kumpulkan 20+ teks WA nyata untuk gate akurasi — owner: Faisal — by: sebelum beta

---

## Catatan Faisal

<!-- [FAISAL UPDATE] Jawab Q1/Q2/Q3 di sini atau di sesi berikutnya -->

---

## Riwayat

| Tanggal | Event | Catatan |
|---|---|---|
| 2026-06-26 | Sesi desain UI/UX Slice 1 | UX→PM→TL→DA→SYN→PO |
| 2026-06-26 | Debat selesai | Confidence: MEDIUM (3 open question) |
| 2026-06-26 | PO gate | PENDING CONFIRMATION — Q1/Q2/Q3 ke Faisal |
