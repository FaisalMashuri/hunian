# Slice 2 — PO Vision Gate
Date: 2026-06-27
Status: UNCERTAIN

---

## Status Akhir: UNCERTAIN

### Trigger Aktif
- **Level 1**: Penambahan 2 dimensi baru ke scoring (Kondisi, Owner) mengubah cara sistem menghitung skor kandidat — bersinggungan langsung dengan keputusan terkunci "bobot SELALU = pilihan user"
- **Level 3**: F1 dari Synthesizer mengandung asumsi tentang preferensi Faisal ("default EQUAL") untuk 2 dimensi yang belum pernah masuk ke mekanisme pilihan user — asumsi ini belum pernah dikonfirmasi

Output Synthesizer DITAHAN sampai G1 dan G2 dikonfirmasi Faisal.

---

## Vision Check Detail

### Check 1: DeriveVerdict + Radar 5D + One-shot Rescore → "Sistem yang Memutuskan"?

**Temuan: ALIGNED dengan catatan implementasi developer**

- **DeriveVerdict**: Rule-based function. Selama outputnya mempertahankan framing trade-off ("Kandidat A unggul Harga, lemah Kondisi") dan bukan label pemenang tunggal ("RECOMMENDED" / "BEST"), prinsip "AI tidak mengambil keputusan" tetap terjaga. "No silent change" yang disebut verdict = transparansi teknis, bukan perubahan semantik. Ini constraint implementasi yang harus masuk ke tech spec TL, bukan gate Faisal.
- **Radar 5D**: Chart multi-dimensi secara inheren adalah visualisasi trade-off — tidak memilih pemenang, menampilkan profil. Ini justru lebih trade-off forward dari score tunggal. Aligned.
- **One-shot Rescore**: Migrasi teknis. Pilot <20 kandidat, script trivial. Tidak ada elemen "sistem memutuskan" di sini. Aligned.

**Catatan implementasi (bukan gate Faisal)**: TL harus memastikan deriveVerdict tidak berevolusi menjadi winner label. Ini harus eksplisit di tech spec S2-2.

---

### Check 2: Biaya All-In Display-Only → "Tanpa Angka Difabrikasi"?

**Temuan: ALIGNED dengan catatan implementasi developer**

Display-only + label sumber + callout bila tidak lengkap = pendekatan yang benar untuk partial data. Tidak masuk scoring formula = tidak ada false precision di core decision flow (Compare).

**Catatan implementasi (bukan gate Faisal)**: Callout harus surfaced dan spesifik — "Total ini belum mencakup [komponen X]" bukan sekadar asterisk tersembunyi. Jika callout dikubur, prinsip tetap dilanggar meski secara arsitektural benar. TL/UX responsibility.

---

### Check 3 (KRITIS): F1 Synthesizer vs Keputusan Terkunci Bobot User-Defined

**Temuan: TENSION — menghasilkan Gate G1 baru**

**Keputusan terkunci Faisal**: "bobot SELALU = pilihan user (bukan default-equal jika user memilih)"

**Situasi Slice 2**:
- Kondisi & Owner = 2 dimensi BARU yang masuk ke scoring
- Mekanisme bobot yang ada (Prioritas onboarding) saat ini hanya cover: Harga, Lokasi, Fasilitas
- Dua dimensi baru ini belum pernah ditanyakan ke user

**Masalah dengan framing F1 Synthesizer**: F1 bertanya "EQUAL atau RENDAH?" — tapi ini hanya memilih di antara dua opsi DEFAULT SISTEM. Pertanyaan yang lebih dalam: apakah user akan punya cara mengekspresikan preferensinya untuk 2 dimensi baru ini? Jika tidak, maka apapun yang tim pilih (EQUAL atau RENDAH), prinsip "bobot = pilihan user" dilanggar secara struktural.

**Skenario konflik nyata**:
- User dengan anak kecil: weight Kondisi sangat tinggi → ingin override
- User yang cari tempat transit murah: weight Kondisi bisa rendah → ingin override
- Jika sistem memutuskan EQUAL tanpa memberi user pilihan → sistem mengabaikan preferensi user untuk 2 dimensi yang bisa sangat material

**Resolusi**: Ini harus menjadi Gate G1 dengan frame yang lebih tepat dari F1 Synthesizer.

---

### Check 4: Behavioral Bet Survey On-Location (Confidence MEDIUM)

**Temuan: ALIGNED dengan prinsip early-stage Hunian**

Verdict mengakui ketidakpastian ini dan menyediakan detection mechanism (insertCandidateEvent, window 3 sesi pilot). Ini adalah pendekatan yang tepat untuk "validasi dulu sebelum scale." Tidak ada gate Faisal diperlukan — ini adalah risiko yang disadari tim dan dikelola dengan cara yang benar.

---

### Check 5: Prioritas WAJIB (tidak skippable)

Verdict tidak mengubah ini. Survey 6D = user input semua dimensi yang relevan. Tidak ada dimensi yang dihapus dari scope tanpa alasan. Tidak ada konflik terdeteksi.

---

## Gate Final untuk Faisal

### G1 (BARU — Vision-Derived): Bobot untuk 2 Dimensi Survey Baru

Kondisi Fisik & Pemilik/Owner adalah 2 dimensi baru yang akan masuk ke scoring formula di Slice 2. Saat ini user mengatur bobot lewat pilihan Prioritas onboarding (Harga/Lokasi/Fasilitas). Dua dimensi baru ini belum ada dalam pilihan tersebut. Prinsip terkunci Faisal: "bobot SELALU = pilihan user."

┌────────────────────────────────────────────────────────────────────┐
│ Keputusan : Di mana dan bagaimana user mengatur bobot              │
│             untuk Kondisi & Owner di Slice 2?                     │
│ Alasan    : Prinsip terkunci "bobot = pilihan user" harus         │
│             diterapkan juga ke 2 dimensi baru ini. Tim tidak       │
│             bisa memilih default tanpa tahu apakah user bisa      │
│             mengoverride-nya.                                      │
│ Alternatif: Fixed weight (EQUAL/RENDAH) tanpa kontrol user        │
│             → melanggar prinsip terkunci secara struktural         │
│ Trade-off : Memberi user kontrol = tambah UX surface;             │
│             Fixed = simpler tapi constraint prinsip                │
│ Dampak    : Mempengaruhi scoring formula v2.0 yang TL finalize    │
│             di S2-2. Ini BLOCKING.                                 │
└────────────────────────────────────────────────────────────────────┘

**Q1**: Untuk Kondisi & Owner di Slice 2, pilih:

- **Opsi A** — Masuk ke settings bobot yang bisa diubah user (settings page atau entry sebelum survey pertama). Default EQUAL, user bisa override kapanpun. Konsisten penuh dengan prinsip terkunci.
- **Opsi B** — Default EQUAL, fixed di Slice 2 (rencana bisa diubah user di Slice 3+). Kompromi: sementara melonggarkan prinsip untuk scope yang lebih kecil.
- **Opsi C** — Default RENDAH (Kondisi & Owner = secondary), fixed, tidak bisa diubah di Slice 2.

Rekomendasi tim: A atau B — tim belum settle antara keduanya dan menunggu arah Faisal.

**Default jika diam: TIDAK ADA — ini BLOCKING.** TL tidak bisa finalize scoring formula v2.0 tanpa keputusan ini.

---

### G2 (= F2 Synthesizer): Sign-off One-Shot Migration

Deploy Slice 2 akan mengubah skor semua kandidat pilot existing. Scoring berubah dari 3 dimensi ke 5 dimensi — ranking bisa berubah. Ini bukan bug, tapi bisa mengejutkan pilot users yang belum tahu.

┌────────────────────────────────────────────────────────────────────┐
│ Keputusan : Apakah Faisal bersedia inform pilot users             │
│             sebelum deploy S2-2?                                   │
│ Alasan    : Pilot users aktif; perubahan skor tanpa              │
│             pemberitahuan bisa merusak trust dan mengacaukan      │
│             interpretasi mereka tentang produk.                   │
│ Alternatif: Deploy tanpa inform → risiko confusion + trust        │
│             damage ke pilot users                                  │
│ Trade-off : Satu komunikasi singkat ke pilot users sebelum deploy │
│ Dampak    : TL tidak deploy S2-2 sampai ini dikonfirmasi          │
└────────────────────────────────────────────────────────────────────┘

**Q2**: Apakah Faisal bersedia memberi tahu pilot users bahwa skor kandidat mereka akan berubah saat Slice 2 live?

Opsi: Ya / Tidak (jika tidak, tim perlu diskusi alternatif sebelum deploy)

Rekomendasi tim: Ya — dibutuhkan untuk menjaga trust dan konteks pilot users.

**Default jika diam: TIDAK ADA.** TL tidak deploy S2-2 tanpa konfirmasi ini.

---

## Developer Defaults (Tidak Perlu Ditanyakan ke Faisal)

Semua item ini adalah keputusan teknis dalam constraint yang sudah established. Faisal tidak perlu dibebankan:

1. **Survey form = 6D langsung** (bukan 2D staged) — TL decision; alasan: menghindari 2x migration, non-adopsi adalah behavior problem bukan form-length
2. **Foto survey via camera capture, dijahit ke review S2-2** — UX/TL decision; bukan standalone gallery (parity trap)
3. **Biaya all-in = ADD COLUMN fixed** (bukan JSONB) — TL decision; schema lebih sederhana dan queryable
4. **DeriveVerdict = explicit change** (bukan silent) — TL decision; transparansi backward compat
5. **Migration script staging-first sebelum production** — TL decision; standard practice
6. **insertCandidateEvent = P0, tanpa UI timeline** — TL decision; event logging side-effect saja
7. **RLS child tables wajib filter user_id** — TL decision; established constraint dari Slice 1
8. **Scoring avg-per-kelompok** (per-dimensi threshold ditolak dalam debat) — DA/TL decision; settled
9. **S2-3 (timeline UI), S2-6 (Apt/Kost), S2-7 (POI rute), S2-8 (pelengkap) defer** — sudah settled, tidak perlu re-confirm
10. **Callout implementation untuk biaya partial** — UX/TL decision; implementation detail dari prinsip "angka yang bisa dipercaya"
11. **Urutan dimensi survey: Kondisi+Owner dulu** — UX/TL decision; anchoring dari dimensi yang paling berbeda dengan listing data

---

## Tradeoff Mandate Summary

| Keputusan | Dipilih | Tidak Dipilih | Tradeoff |
|-----------|---------|---------------|----------|
| Bobot Kondisi+Owner | Perlu keputusan Faisal (G1) | Fixed default tanpa user control | Prinsip terkunci vs scope simplicity |
| Migration | One-shot semua kandidat | Lazy + badge versi | Compare hero feature vs complexity migrasi |
| Biaya | Display-only + callout | Masuk scoring formula | Partial data visible vs false precision |
| Survey | 6D langsung | 2D staged | No re-migration vs incremental complexity |
| Foto | Dijahit ke review survey | Standalone gallery | Trust-worthy data flow vs feature parity |

---

*Ditulis oleh: PO agent — 2026-06-27*
*Gate ini berlaku sampai G1 dan G2 dijawab Faisal.*
