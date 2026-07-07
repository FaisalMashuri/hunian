# Collaboration — Undang Pasangan Berbagi & Analisis Hunian Bersama

<!-- Di-generate Orchestrator dari sesi 2026-07-06. Edit hanya section [FAISAL UPDATE]. -->

## Status

```
[ ] Backlog       — identified, belum dijadwalkan
[ ] In Discussion — sedang didebat agent team
[ ] Approved      — Product Owner approved, siap dibangun
[x] In Progress   — sedang dibangun (Slice C-1 selesai)
[ ] Done          — selesai dan shipped
[ ] Rejected      — tidak akan dibangun, dengan alasan
```

**Current status:** `[x] In Progress` — Faisal OVERRIDE verdict DEFER (2026-07-07): GO penuh, **tanpa monetisasi** (alat personal untuk cari rumah bareng pasangan LDR). Slice C-1 (share read-only berbasis email) sudah dibangun.
**Last updated:** 2026-07-07
**Session:** `sessions/2026-07-06-collaboration.md`
**Confidence:** MEDIUM (asumsi "pasangan aktif" tervalidasi oleh use-case Faisal sendiri)

---

## Deskripsi Singkat

> Memungkinkan user mengundang pasangan/rekan keputusan untuk melihat (dan mungkin ikut menganalisis) kandidat hunian yang sudah dikumpulkan — agar keputusan sewa yang biasanya melibatkan lebih dari satu orang punya satu sumber kebenaran bersama.

---

## Deskripsi Lengkap

### Apa fitur ini?

Keputusan sewa hunian di Indonesia jarang dibuat sendirian — sering melibatkan pasangan (suami-istri, calon), orang tua, atau teman satu kontrakan. Hari ini seluruh Hunian dibangun single-user: setiap kandidat, preferensi, skor, dan keputusan terikat ke satu `user_id`. Collaboration memungkinkan orang kedua ikut masuk ke gambaran yang sama.

Sesi ini TIDAK menghasilkan keputusan "bangun sekarang". Sesi ini menghasilkan **verdict DEFER-dengan-gate**: fitur ini layak dibangun, tapi seluruh desainnya (skor, granularitas share, monetisasi) berubah drastis tergantung satu pertanyaan yang belum punya satu data point pun — **apakah pola dominan pencari hunian adalah "dua orang aktif mengevaluasi bersama" atau "satu orang lead + partner pasif yang cukup di-update/approve"?** Kalau yang kedua dominan, maka **share-link read-only** (yang sudah direncanakan sebagai fitur premium di sesi monetisasi 2026-06-29) sudah menjawab ~95% kebutuhan, dan collaboration dua-arah = over-build.

Karena itu langkah pertama BUKAN menulis kode, melainkan validasi murah 2 hari (tanya pilot user apakah mereka pernah screenshot Compare untuk dikirim ke pasangan).

### Siapa yang paling diuntungkan?

- **Primary:** Pasangan muda yang cari kontrakan bersama di Jabodetabek, terutama saat salah satu tidak ikut survey fisik.
- **Secondary:** Anak + orang tua (approver), teman satu kontrakan. **Catatan: segmen ini belum tervalidasi — bisa jadi dominan justru pola "approver pasif".**

### Di stage mana user journey ini terjadi?

```
discover → shortlist → [compare/DECIDE ← STAGE INI] → negotiate → decide → move in
```
Collaboration menempel di ujung journey (Compare & keputusan), bukan di awal.

---

## Kenapa Fitur Ini Dibangun

### Alasan dari debat

- **STR:** whitespace nyata — tidak ada kompetitor cari-hunian Indonesia (Mamikos/OLX/Rumah123/Rukita) yang punya kolaborasi pasangan. Memperkuat positioning "decision tool untuk pencari" karena unit pengambil keputusan (DMU) sewa memang sering >1 orang. Efeknya = "qualified-pair acquisition" (setiap siklus bawa 1 partner qualified) + menaikkan **within-cycle completion** (social accountability), BUKAN viral eksponensial dan BUKAN long-term retention.
- **UX:** job sebenarnya = **shared source-of-truth tanpa harus jelasin dari awal**, bukan real-time co-editing. Workaround hari ini = screenshot + WA yang berantakan dan menyebabkan asimetri informasi.
- **TL:** feasibility tinggi via pendekatan additive — tidak perlu bongkar fondasi identitas.

### Pain point yang di-solve

- Asimetri informasi antara yang survey fisik dan yang tidak — severity: **MEDIUM** (belum tervalidasi sebagai top pain).
- Tidak ada satu sumber kebenaran bersama; setiap orang punya versi berbeda di kepala — severity: MEDIUM.

### Market gap yang diisi

Tidak ada kompetitor lokal yang punya fitur ini. Namun gap kosong ≠ gap yang harus segera diisi: collaboration adalah **UX multiplier, bukan data-source/moat** — tidak menghasilkan data terstruktur unik seperti survey fisik. Whitespace bisa ditunggu sampai fondasi single-user terbukti.

---

## Tradeoff yang Disadari

### Keputusan yang diambil

| Keputusan | Dipilih | Tidak dipilih | Alasan |
|---|---|---|---|
| Timing | **DEFER dengan trigger terukur** | Build sekarang (murah 3-4 hari); Defer tanpa tanggal | Effort rendah ≠ prioritas tinggi. Premis "pasangan aktif" belum tervalidasi 1 data point; bangun untuk use-case yang belum tentu dominan = waste di pre-PMF. Tapi defer wajib bertanggal (bukan groupthink malas). |
| Model data | **Opsi A: tabel `candidate_shares` + `invitations` (additive)** | `workspace_id`/`household_id` (migrasi 21 file); hybrid workspace opsional | Zero backfill, zero perubahan destruktif ke 21 file `.eq("user_id")`. Loader `app/dashboard/data.ts` cukup diperluas 1 branch. Reversibel (tabel bisa di-drop). workspace_id = risiko regresi tinggi untuk solo dev. |
| Skor untuk collaborator | **DITUNDA** — pending pola aktual | Rata-rata bobot (DITOLAK); satu-skor-owner diam-diam (DITOLAK oleh PO) | Rata-rata = skor fiksi yang tak mewakili siapa pun + langgar "bobot=pilihan user". Satu-skor-owner tanpa mekanisme collaborator atur bobot = langgar prinsip terkunci (ditutup PO, bukan open question). Pilihan yang tepat (dua-skor / tanpa-skor+komentar) bergantung apakah collaborator = evaluator aktif atau approver pasif. |
| Real-time | **Async sync-on-open** | Supabase Realtime (presence/live cursor) | Low-frequency app: dua orang buka bersamaan hampir tak pernah terjadi. Realtime juga tak kompatibel dengan pola service-role client (butuh anon-key + RLS aktif yang saat ini tak fungsional). |
| Monetisasi | **Share-link=PREMIUM (deliverable publik tanpa akun); collaboration=GRATIS 1 partner (workflow, butuh akun)** — pending Faisal | Semua premium; semua gratis | Konsisten "gate di output". TAPI diferensiasi harus fungsional & tak-bisa-diworkaround agar invite gratis tak mengkanibal share-link premium (DA-C5). Bergantung gate freemium Q1 yang masih pending. |

### Yang kita korbankan

Dengan DEFER, kita sadar **menanggung risiko kehilangan pasangan yang butuh workflow bersama hari ini dan mungkin tidak kembali** setelah Slice 2 selesai. Ini nyata. Tapi risiko sebaliknya — menyedot kapasitas solo dev dari Slice 2 untuk membangun collaboration aktif lalu menemukan 80% pasangan hanya butuh "kirim link, approve" — dinilai lebih mahal.

### Yang akan jadi masalah kalau asumsi ini salah

**Asumsi terbesar (DA-C3, HIGH):** use-case dominan = pasangan AKTIF (dua-duanya survey & evaluate). Kalau salah dan pola dominan = solo-lead + partner pasif approver, seluruh arsitektur collaboration 2-arah (invite berakun, permission, skor ganda, komentar) = solusi untuk masalah yang tak dialami mayoritas. Skenario gagal: partner buka magic-link, tak paham konteks bobot owner, tutup tab, komunikasi balik ke WA, usage ~10%. Pola ini persis mengulang sesi browser-extension (asumsi menolak asumsi).

---

## Technical Approach

**Feasibility:** ⚠️ Feasible with caveats (timing, bukan teknis)

**Stack yang digunakan:**
- Tabel baru Postgres: `candidate_shares` (candidate_id, owner_id, grantee_id, role viewer/collaborator, status active/revoked) + `invitations` (token_hash SHA-256, inviter_id, candidate_id, invited_email, status, expires_at 72 jam, accepted_by).
- Helper terpusat `lib/authz/candidate.ts` → `assertCandidateAccess(userId, candidateId, requiredRole)` sebagai satu-satunya gerbang authz. Migrasi 21 file bertahap, mulai dari mutation actions (`shortlist/[id]/actions.ts`, `survey/actions.ts`, `input/actions.ts`).
- Email service (Resend/SMTP) HANYA untuk magic-link → bisa ditunda; slice read-only pertama tak butuh.
- Foto: path `users/{owner_user_id}/candidates/...` tetap; signed URL server-side ambil owner_id dari `candidates`, bukan dari session viewer.

**Opsi implementasi yang dipertimbangkan:**

| Opsi | Pros | Cons | Dipilih? |
|---|---|---|---|
| A — `candidate_shares` additive | Zero backfill, zero migrasi 21 file, reversibel | Dua jalur authz (owner OR shared) harus terpusat | ✅ Ya |
| B — `workspace_id`/`household_id` | Model "cleanest" jangka panjang | Migrasi 21 file `.eq(user_id)` + backfill live + isu bobot ganda | ❌ Tidak — blast radius & risiko regresi terlalu tinggi untuk solo dev |
| C — Hybrid workspace opsional | — | Implementasi identik A jika workspace non-mandatory, tanpa keunggulan | ❌ Tidak — redundant dengan A |

**Skor per-viewer (isu teknis terberat):** Opsi X (satu skor = skor owner) tersedia teknis TANPA sentuh scoring engine, TAPI ditolak PO bila tak ada mekanisme collaborator atur bobot (langgar prinsip). Opsi Y (`candidate_scores` per user_id) = refactor semua loader baca skor, defer. Opsi Z (on-the-fly) = hilang index sort/filter by score. Keputusan skor ditunda sampai pola tervalidasi.

**Effort estimate:** Slice C-1 read-only ~1 minggu (3-4 hari tanpa email service). C-2 invite 2-arah +3-4 hari. C-3 skor per-viewer +2-3 minggu (opsional).
**Reversibility:** HIGH (tabel additive bisa di-drop; belum ada kode yang di-commit).

**Risiko teknikal:**
- Authorization bypass: collaborator akses kandidat bukan haknya via direct ID — mitigasi: `assertCandidateAccess` wajib di setiap mutation path + integration test unauth→0 row SEBELUM ship.
- Verdict pool contamination: kandidat shared masuk ke verdict pool owner — mitigasi: filter verdict pool tetap `candidates.user_id = ownerId`, bukan kandidat shared.
- Token invite di-forward — mitigasi: expiry 72 jam + single-use + confirm-mismatch email.
- Scoring frozen untuk scope collaboration sampai validasi selesai — jangan sentuh `scoring_version`/engine.

---

## Product Owner Notes

**Vision alignment:** ⚠️ CONCERNS (verdict DEFER sendiri ALIGNED; ada 1 koreksi prinsip + 2 dependency)

- **Koreksi prinsip (ditutup PO, bukan pertanyaan Faisal):** opsi "satu skor owner untuk collaborator" **DITOLAK** kecuali ada mekanisme collaborator mengatur bobotnya sendiri — melanggar "bobot scoring SELALU pilihan user". Tim tak perlu menunggu Faisal untuk menutup opsi ini.
- **Compare tetap aman:** collaboration tidak mengubah Compare jadi voting/ranking; tetap trade-off forward. "AI tidak mengambil keputusan" tidak dilanggar.
- **Dependency:** batas FREE/PREMIUM collaboration bergantung pada gate freemium Q1 (sesi 2026-06-29, masih PENDING) dan scoring v2.0 (gate Slice 2 G1, masih PENDING). Jangan rancang skor/monetisasi collaborator sebelum keduanya dijawab.
- Verdict DEFER dinilai **presisi, bukan konservatif** untuk solo dev pre-PMF — asalkan bertanggal.

**Konfirmasi dari Faisal:** PENDING
**Tanggal konfirmasi:** —

### 🙋 Pertanyaan material ke Faisal (dipangkas dari 4 → 2)

**Q1 — Share-link read-only: eksekusi sekarang atau tunggu validasi?**
Share-link sudah di roadmap premium (bukan keputusan baru). Boleh dieksekusi sekarang terpisah dari collaboration, atau tunggu hasil validasi 2 hari dulu?
- *Default 48 jam:* Share-link BOLEH dieksekusi sekarang; collaboration tetap DEFER.

**Q2 — Batas FREE/PREMIUM collaboration: invite 1 partner = gratis atau premium?**
Usulan tim: share-link (tanpa akun, read-only) = PREMIUM; collaboration 2-arah (butuh akun partner) = GRATIS 1 partner. Bergantung pada Q1 freemium (2026-06-29) yang masih pending.
- *Default 48 jam:* Collaboration invite = GRATIS 1 partner (framing workflow, bukan deliverable).

---

## Open Questions

1. **[TERPENTING] Pola pencari: solo vs berdua, aktif vs approver pasif?** — validasi: intercept survey 10-15 orang yang cari kost/kontrakan 6 bulan terakhir ("Siapa terlibat keputusan? Bagaimana kamu berbagi info?"). Menentukan seluruh arah fitur.
2. **Ada pilot yang sudah screenshot Compare & kirim ke pasangan?** — validasi: tanya langsung pilot (2 hari, termurah). Ini pemutus DEFER vs GO / pull-signal STR.
3. **Granularitas share:** per-kandidat atau per-akun (seluruh shortlist)? — putuskan saat GO; mengubah schema `candidate_shares`.
4. **Kalau collaborator boleh tambah kandidat/decision:** dimiliki siapa (`candidates.user_id`, `decisions.user_id`)? — putuskan saat GO.
5. **Invite gratis substitusi atau komplementer dengan share-link premium?** — hanya bisa divalidasi pasca-launch keduanya; tetapkan diferensiasi fungsional dulu.

---

## Next Actions

- [ ] **VALIDASI-2** — tanya pilot: pernah screenshot Compare & kirim ke pasangan/ortu? (pemutus DEFER vs GO) — owner: Faisal — by: 2 hari (2026-07-08)
- [ ] **VALIDASI-1** — intercept survey 10-15 pencari: solo vs berdua, aktif vs pasif — owner: Faisal — by: 1 minggu (2026-07-13)
- [ ] **Jawab Q1 & Q2** (dan idealnya gate freemium Q1 2026-06-29 yang unblocking 3 keputusan) — owner: Faisal — by: sebelum Slice 2 selesai
- [ ] **Share-link read-only PREMIUM** — build terpisah dari collaboration (per default Q1) — owner: Faisal (dev) — by: dalam Slice 2 aktif
- [ ] **CONTINGENCY** — jika validasi tunjukkan pasangan aktif >~30%: jadwalkan C-1 (invite read-only, tanpa skor, tanpa email, Opsi A schema) ~3-4 hari — owner: Faisal (dev) — trigger: hasil validasi positif

**REVISIT TRIGGER:** VALIDASI-2 tunjukkan >20% pilot sudah kirim screenshot Compare (pull-signal kuat) · keluhan organik "tak bisa ajak pasangan lihat bareng" · kompetitor lokal tambah collaboration (whitespace tertutup) · %di-Compare >30% (fondasi single-user solid, aman tambah kompleksitas).

---

## Catatan Faisal

<!-- [FAISAL UPDATE] Tambahkan catatan, feedback, atau keputusan pribadi di sini -->

**2026-07-07 — Keputusan Faisal:** GO penuh, tanpa monetisasi (semua user bisa pakai gratis). Ini alat personal untuk aku + pasangan yang lagi LDR, cari rumah bareng buat setelah nikah. Verdict DEFER-dengan-gate & premium-gate DIBATALKAN. Model share disederhanakan jadi **berbasis email** (tanpa magic-link/email service): undang partner via email Google, saat dia login kandidatku muncul di dashboard & Bandingkan-nya (read-only).

---

## Riwayat

| Tanggal | Event | Catatan |
|---|---|---|
| 2026-07-06 | Feature identified & didebat | Session: `sessions/2026-07-06-collaboration.md`; agents PM·UX·STR·TL·DA·SYN·PO |
| 2026-07-06 | Debat selesai | Verdict: DEFER-DENGAN-GATE; Confidence MEDIUM |
| 2026-07-06 | PO status | UNCERTAIN — PENDING konfirmasi Faisal (Q1, Q2) |
| 2026-07-07 | Faisal override → GO | GO penuh tanpa monetisasi (alat personal, pasangan LDR). Model share berbasis email. |
| 2026-07-07 | Slice C-1 dibangun | Migration `collab_shares` + `lib/authz/candidate.ts` + read paths (dashboard/detail/compare) + halaman `/kolaborasi`. Build hijau. |
| 2026-07-07 | Slice C-2 dibangun | Migration `candidate_comments` + diskusi async per kandidat (owner & partner) di halaman detail. `assertCandidateAccess(..,"viewer")`. Build hijau. |
