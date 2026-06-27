# MVP Build Sequencing

<!--
  Di-generate oleh Orchestrator (sesi 2026-06-26), dipersist oleh main thread
  karena Write subagent diblokir izin. Edit hanya section [FAISAL UPDATE].
-->

## Status

```
[ ] Backlog       — identified, belum dijadwalkan
[ ] In Discussion — sedang didebat agent team
[x] Approved      — Product Owner approved, siap dibangun
[ ] In Progress   — sedang dibangun
[ ] Done          — selesai dan shipped
[ ] Rejected      — tidak akan dibangun, dengan alasan
```

**Current status:** `[x] Approved`
**Last updated:** 2026-06-26
**Session:** `sessions/2026-06-26-mvp-build-sequencing.md`
**Confidence:** MEDIUM

---

## Deskripsi Singkat

> Menentukan vertical slice mana dari MVP spec yang dibangun pertama, dan urutan build berikutnya, agar value inti Hunian (sampai ke verdict dengan friction minimal) cepat terbukti.

---

## Deskripsi Lengkap

### Apa fitur ini?

Ini bukan fitur produk, melainkan **keputusan build/sequencing** untuk website Hunian berdasarkan `next-feature/mvp.md`. Hasil sesi: scope MVP di spec dinilai benar, tapi **tidak dibangun sekaligus**. Dibangun sebagai irisan vertikal (vertical slice) end-to-end yang tak dipecah, supaya tiap rilis membuktikan satu hal nyata, bukan sekadar memajang UI.

**Slice 1 (satu pipeline end-to-end, tidak boleh dipecah):**
Onboarding 3-step (Budget · Tujuan+Transport · Prioritas) → Input form **Kontrakan** → AI extraction + pre-processing normalisasi lokal → Property Review (verifikasi, bukan input dari nol) → Scoring rule-based **3 dimensi** (Harga, Lokasi, Fasilitas) → Compare basic (≥2 kandidat, trade-off forward) → pilih satu.

Yang **ditunda** ke slice berikutnya: Survey bintang+tag (punya "dead zone" 7+ hari karena butuh kunjungan fisik), form Apartemen & Kost, timeline kandidat, harga asli/akhir, progressive clarification, deal-breaker lanjutan, 4 moda transport penuh.

### Siapa yang paling diuntungkan?

- **Primary:** pencari hunian aktif yang sedang membandingkan beberapa kandidat sewa.
- **Secondary:** Faisal sebagai builder — slice end-to-end memberi sinyal validasi tercepat.

### Di stage mana user journey ini terjadi?

```
discover → shortlist → [INPUT + EVALUASI + COMPARE] → negotiate → decide → move in
```

---

## Kenapa Fitur Ini Dibangun

### Alasan dari debat

Konflik kunci dibongkar oleh Devil's Advocate: usulan Strategist "bangun Compare dulu karena itu moat" tidak sama dengan "membuktikan completion rate". Compare tanpa pipeline data nyata hanya menguji preferensi UI, bukan apakah user bisa sampai ke keputusan. Resolusi: kedua sisi benar tapi menjawab pertanyaan berbeda → **satu slice end-to-end dengan Compare wajib di dalamnya, tidak dipecah.**

### Pain point yang di-solve

- User harus mengetik ulang data dari listing berantakan (WA/OLX/Mamikos) — severity: HIGH → diatasi AI extraction.
- User memutuskan tanpa basis pembanding yang konsisten — severity: HIGH → diatasi scoring rule-based + Compare.

### Market gap yang diisi

Mamikos/OLX = mesin listing/discovery. Hunian = **decision tool** untuk kandidat yang sudah dikumpulkan user dari mana saja. Posisi ini tidak head-to-head dengan listing aggregator.

---

## Tradeoff yang Disadari

### Keputusan yang diambil

| Keputusan | Dipilih | Tidak dipilih | Alasan |
|---|---|---|---|
| Bentuk Slice 1 | Pipeline end-to-end tak dipecah | Compare-first / Input-first terpisah | Hanya end-to-end yang menguji completion nyata; potongan UI tidak |
| Metric Slice 1 | Session depth proxy | Cycle completion 60% | Dead zone survei 7+ hari bikin completion tak terukur jujur tanpa re-engagement |
| Form pertama | Kontrakan saja | Semua 3 form sekaligus | Schema termurah, paling umum; Apartemen/Kost menyusul |
| Scoring Slice 1 | 3 dimensi (Harga/Lokasi/Fasilitas) | 5 dimensi penuh | Kondisi & Owner butuh survey (di luar Slice 1) |
| AI extraction | GPT-4o mini + pre-processing lokal | rule-based murni / model besar | Murah, cukup; tapi bersyarat lulus benchmark akurasi |
| Geocoding/Maps | Google Maps | Mapbox / OSM | Data transit Indonesia lebih kuat di Google |
| Jarak ke tujuan | Input km manual dulu | Hitung rute otomatis | Tunda kompleksitas routing; schema disiapkan |

### Yang kita korbankan

Kelengkapan demi pembuktian: MVP spec lengkap, tapi Slice 1 sengaja sempit agar sinyal validasi datang sebelum effort besar dikeluarkan.

### Yang akan jadi masalah kalau asumsi ini salah

Asumsi terbesar (dari DA): **akurasi AI extraction pada teks broker WA nyata cukup tinggi.** Kalau di bawah ~85%, "verifikasi bukan ketik dari nol" runtuh menjadi "betulkan semuanya" — value inti hilang. Karena itu benchmark = GO/NO-GO gate.

---

## Technical Approach

**Feasibility:** ⚠️ Feasible with caveats (gate: benchmark akurasi extraction)

**Stack yang digunakan:**
- Frontend: Next.js + Tailwind + shadcn/ui
- Backend/DB/Storage: Supabase (Postgres + Storage, RLS aktif), kolom `scoring_version` per row
- Auth: Auth.js (NextAuth) + Google OAuth — login wajib dari awal
- AI: GPT-4o mini (bersyarat benchmark) + pre-processing normalisasi lokal ("3,5 jt" → 3500000, dll)
- Maps/Geocoding: Google Maps
- Hosting: Vercel
- Auth: **Google login wajib dari awal** (Auth.js/NextAuth); Supabase dipakai untuk data + storage saja

**Opsi implementasi yang dipertimbangkan:**

| Opsi | Pros | Cons | Dipilih? |
|---|---|---|---|
| GPT-4o mini + pre-proc | murah, fleksibel ke teks bebas | akurasi belum teruji | ✅ Ya (bersyarat benchmark) |
| Rule-based extraction murni | deterministik, gratis | rapuh ke variasi bahasa listing | ❌ Tidak — fallback/pelengkap |
| Google Maps | transit ID kuat | biaya per call | ✅ Ya |
| Mapbox / OSM | lebih murah | data transit ID lemah | ❌ Tidak |

**Effort estimate:** ~19–26 hari (solo)
**Reversibility:** HIGH untuk hampir semua keputusan; **LOW** hanya untuk "Slice 1 = end-to-end".

**Risiko teknikal:**
- Akurasi extraction di bawah ambang — mitigasi: benchmark 20+ teks nyata sebelum Slice 2; pre-processing + Property Review sebagai jaring.
- Biaya/kuota Google Maps — mitigasi: km manual dulu, geocode seperlunya.

---

## Product Owner Notes

**Vision alignment:** ✅ ALIGNED — selaras dengan prinsip "AI mengurangi mengetik, bukan memutuskan". Dua pertanyaan material sudah dijawab Faisal (lihat Open Questions).

**Konfirmasi dari Faisal:** APPROVED
**Tanggal konfirmasi:** 2026-06-26

**Keputusan Faisal:**
1. Pilot user dikenal personal & aktif cari hunian → metric utama **cycle completion (target 60%)** dengan follow-up manual menembus dead zone; session-depth jadi leading indicator.
2. Deal Breaker masuk Slice 1 sebagai **flag minimal** (tandai pelanggar, tanpa auto-eliminasi).

---

## Open Questions

1. ~~Apakah 10 pilot user pertama dikenal personal & aktif cari hunian sekarang?~~ — **RESOLVED (2026-06-26): YA.** Metric utama = cycle completion (target 60%) + follow-up manual; session-depth = leading indicator.
2. ~~Apakah Deal Breaker auto-eliminasi masuk Slice 1?~~ — **RESOLVED (2026-06-26): flag minimal saja** (tandai pelanggar, tanpa auto-hapus).

**Tersisa (gate teknikal, bukan PO):** akurasi AI extraction >85% pada 20+ teks WA broker nyata — GO/NO-GO sebelum Slice 2.

---

## Next Actions

- [x] Jawab 2 pertanyaan PO — owner: Faisal — ✅ 2026-06-26 (pilot dikenal/aktif → cycle completion; deal breaker → flag minimal)
- [ ] Kumpulkan 20+ teks broker WA nyata → uji extraction GPT-4o mini → hitung field accuracy (GO/NO-GO Slice 2) — owner: Faisal — by: hari 1–3
- [ ] Setup Supabase schema (transport 4-moda nullable, RLS aktif, `scoring_version`) + Auth.js/Google OAuth — owner: Faisal — by: hari 1–2
- [ ] Build Slice 1 end-to-end — owner: Faisal — by: target 19–26 hari
- [ ] Pasang session-depth tracking + exit survey "apakah skor ini membantu memutuskan?" di Compare — owner: Faisal
- [ ] Review setelah ≥5 user menyelesaikan sesi, sebelum commit Slice 2 — owner: Faisal

---

## Catatan Faisal

<!-- [FAISAL UPDATE] Tambahkan catatan, feedback, atau keputusan pribadi di sini -->

---

## Riwayat

| Tanggal | Event | Catatan |
|---|---|---|
| 2026-06-26 | Feature identified | Sesi: MVP build sequencing |
| 2026-06-26 | Debat selesai | 7 agent (PM·UX·STR·TL·DA·SYN·PO), Confidence: MEDIUM |
| 2026-06-26 | PO gate | UNCERTAIN → awaiting Faisal (2 pertanyaan) |
| 2026-06-26 | Faisal approved | 2 pertanyaan dijawab → status Approved |
| 2026-06-26 | Benchmark extraction (dummy) | GPT-4o mini overall 92.7% / critical 92.0% pada 20 listing sintetis. Sinyal directional GO; gate mengikat tetap menunggu 20+ teks WA asli |
| 2026-06-26 | Auth diubah | Anonymous-first → **Google login wajib dari awal** (Auth.js/NextAuth), keputusan Faisal |
