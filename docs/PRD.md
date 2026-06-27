# PRD — Hunian

**Product Requirements Document**

| | |
|---|---|
| **Produk** | Hunian — decision tool pencarian hunian sewa |
| **Versi** | 1.0 |
| **Tanggal** | 2026-06-26 |
| **Owner** | Faisal |
| **Status** | Approved untuk Slice 1 |
| **Dokumen terkait** | [`docs/BRD.md`](./BRD.md) · [`next-feature/mvp.md`](../next-feature/mvp.md) (spec sumber) · [`next-feature/mvp-build-sequencing.md`](../next-feature/mvp-build-sequencing.md) (keputusan build) |

> PRD ini fokus ke **perilaku produk & requirement**. Field detail tiap form ada lengkap di `next-feature/mvp.md` dan tidak diduplikasi penuh di sini.

---

## 1. Visi Produk

> **AI bertugas mengurangi pekerjaan mengetik, bukan mengambil keputusan.**

Hunian mengubah pencarian hunian dari "mengumpulkan & mengetik ulang" menjadi "memverifikasi & memutuskan". User tetap pemegang keputusan; AI dan rule membantu menyiapkan informasinya.

---

## 2. Goals & Non-Goals

**Goals (Slice 1):**
- User dapat menyelesaikan satu siklus keputusan penuh untuk properti jenis Kontrakan.
- Input via copy-paste teks listing → terstruktur otomatis dengan akurasi tinggi.
- Perbandingan kandidat berformat trade-off yang membuat user sadar & setuju dengan pengorbanannya.

**Non-Goals (Slice 1):**
- Bukan listing marketplace; tidak menyediakan inventory hunian.
- Tidak ada AI scoring (scoring murni rule-based).
- Tidak ada survey fisik penuh, timeline, multi-user, atau form Apartemen/Kost (ditunda).

---

## 3. Persona

| Persona | Deskripsi | Kebutuhan utama |
|---|---|---|
| **Pencari aktif** (primary) | Sedang membandingkan beberapa kandidat sewa, sumber tersebar | Cepat menstrukturkan & membandingkan tanpa input manual berat |
| **Pencari deadline** | Harus pindah dalam waktu dekat | Keputusan cepat, tahu trade-off, tidak menyesal |
| **Builder/PO (Faisal)** | Memvalidasi PMF | Sinyal completion & akurasi yang jujur |

---

## 4. User Journey (Slice 1)

```
Landing page (publik) — value prop + CTA "Masuk dengan Google"
        │
        ▼
Login (Google — wajib)
        │
        ▼
Onboarding (3-step)
  Budget · Tujuan+Transport · Prioritas
        │
        ▼
Input Property (Kontrakan)
  Copy deskripsi  /  Form manual
        │
        ▼
AI Extraction + Normalization (lokal pre-proc + GPT-4o mini)
        │
        ▼
Property Review (verifikasi, bukan input dari nol)
        │
        ▼
Deal Breaker check (flag minimal)  +  Rule Scoring (3 dimensi)
        │
        ▼
Compare ≥2 kandidat (trade-off forward)
        │
        ▼
Pilih satu  →  siklus selesai (KPI-1)
```

Onboarding penuh 5-step (+ Deadline pindah, + Deal breaker editor) tetap ada di spec; Slice 1 memakai 3 step inti + deal breaker sebagai opsi ringkas.

---

## 5. Ruang Lingkup Fitur

| Modul | Slice 1 | Ditunda |
|---|---|---|
| Landing page (publik) | Value prop + CTA login (layar pertama dibangun) | Konten marketing lanjutan, blog, pricing |
| Onboarding | 3 step inti (Budget, Tujuan+Transport, Prioritas) + deal breaker ringkas | Deadline pindah, editor deal breaker lengkap, progressive clarification |
| Input Property | Kontrakan: copy-paste + form manual | Form Apartemen, Form Kost |
| AI Extraction | Ekstraksi + normalisasi | URL auto-parsing |
| Property Review | Verifikasi field 🔴/🟡 | — |
| Scoring | Rule-based 3 dimensi (Harga, Lokasi, Fasilitas) | Kondisi & Owner (butuh survey), 5 dimensi penuh |
| Deal Breaker | Flag minimal (tandai pelanggar) | Auto-eliminasi penuh |
| Compare | Trade-off forward, ≥2 kandidat | — |
| Status kandidat | Tersedia / Sudah Disurvey / Sudah Tersewa | Otomasi prompt survey |
| Survey fisik | — | Rating bintang + quick tag (Slice ≥2) |
| Timeline | — | Property timeline (Slice ≥2) |
| Harga asli/akhir | Harga tunggal dulu | Dua-field + catat negosiasi |

---

## 6. Functional Requirements

Tiap requirement punya acceptance criteria (AC). Prioritas: **M**ust / **S**hould / **C**ould.

### 6.0 Landing Page (publik)

- **FR-LP-1 (M)** — Halaman landing publik di `/` (tanpa login) menjelaskan value Hunian + CTA "Masuk dengan Google".
  - AC: dapat diakses tanpa sesi; CTA memicu login; **responsif penuh** (NFR-9); **gambar placeholder + animasi proper** agar hidup (NFR-10); setelah login user diarahkan ke onboarding (pertama kali) atau app. Ini layar pertama yang dibangun.

### 6.0.1 Autentikasi

- **FR-AU-1 (M)** — User wajib login dengan akun **Google** (Auth.js/NextAuth) sebelum mengakses fitur apa pun.
  - AC: tanpa sesi login, semua route inti dialihkan ke halaman login; sesi tersimpan; tombol logout tersedia.
- **FR-AU-2 (M)** — Identitas dari sesi Google dipakai untuk mengaitkan data (onboarding, kandidat) ke user.
  - AC: data hanya dapat diakses pemiliknya; akses DB dilakukan server-side setelah verifikasi sesi.

### 6.1 Onboarding

- **FR-ON-1 (M)** — User mengisi budget ideal & maksimal (dua angka).
  - AC: kedua nilai tersimpan; dipakai sebagai budget zone di scoring harga.
- **FR-ON-2 (M)** — User menetapkan lokasi tujuan utama + moda transport.
  - AC: lokasi tersimpan (pin/alamat); minimal 2 moda transport tersedia (motor, mobil), schema siap 4 moda.
- **FR-ON-3 (M)** — User memilih prioritas (multi-select); sistem mengonversi ke bobot.
  - AC: user tidak pernah melihat angka persen; bobot ditampilkan sebagai bintang; bobot dipakai di scoring.
- **FR-ON-4 (S)** — User dapat menetapkan deal breaker ringkas dari daftar preset + tambah sendiri.
  - AC: deal breaker tersimpan & dievaluasi terhadap tiap kandidat (lihat FR-DB).
- **FR-ON-5 (M)** — Semua setting onboarding dapat diedit kapan saja di Settings.

### 6.2 Input Property (Kontrakan)

- **FR-IN-1 (M)** — User menempel teks listing bebas (copy-paste) untuk diekstrak.
  - AC: teks apa pun (WA/OLX/sosmed) diterima; memicu ekstraksi AI.
- **FR-IN-2 (M)** — User dapat mengisi form manual sebagai alternatif.
  - AC: field mengikuti spec form Kontrakan (mvp.md), status 🔴 wajib / 🟡 opsional dihormati.
- **FR-IN-3 (M)** — Harga sewa menerima periode (bulan / 3 bulan / tahun) dan dikonversi ke per bulan.
  - AC: nilai per-bulan tersimpan; periode asli dipertahankan.

### 6.3 AI Extraction + Normalization

- **FR-AI-1 (M)** — Teks bebas dikonversi ke JSON terstruktur sesuai schema field.
  - AC: field yang tak diketahui = null (bukan tebakan); akurasi field >85% pada data nyata (gate).
- **FR-AI-2 (M)** — Normalisasi format: "3,5jt"→3500000, "deket LRT"→penanda lokasi, periode→per bulan, deposit "N bulan"→nominal.
  - AC: pre-processing lokal berjalan sebelum/berdampingan dengan model; hasil konsisten.
- **FR-AI-3 (M)** — Sistem tidak menghitung skor via AI.
  - AC: AI hanya extraction, normalization, explanation — bukan scoring.

### 6.4 Property Review

- **FR-RV-1 (M)** — Hasil ekstraksi ditampilkan sebagai data untuk diverifikasi, bukan form kosong.
  - AC: field terisi ditandai ✓; field kosong/ragu ditandai ⚠; user melengkapi & mengoreksi lalu submit.
- **FR-RV-2 (M)** — User dapat mengoreksi nilai hasil ekstraksi sebelum disimpan.

### 6.5 Deal Breaker (flag minimal)

- **FR-DB-1 (M)** — Setiap kandidat dievaluasi terhadap deal breaker user; pelanggar **ditandai** (flag), tidak otomatis dihapus.
  - AC: flag tampil di kandidat & di Compare ("1 flag"); kandidat tetap muncul.
- **FR-DB-2 (C)** — (Post-MVP) opsi auto-eliminasi pelanggar.

### 6.6 Scoring (rule-based)

- **FR-SC-1 (M)** — Skor dihitung oleh rule dengan bobot, bukan AI.
  - AC: Slice 1 memakai 3 dimensi (Harga, Lokasi, Fasilitas) dengan bobot dari prioritas onboarding; hasil dapat diaudit.
- **FR-SC-2 (M)** — Tiap baris kandidat menyimpan `scoring_version`.
  - AC: perubahan formula tidak merusak komparabilitas historis.
- **FR-SC-3 (M)** — AI menjelaskan skor dalam bahasa natural (explanation), termasuk "yang belum diketahui".
  - AC: penjelasan tidak mengubah skor; menyebut faktor pendukung & data yang hilang.

### 6.7 Compare

- **FR-CM-1 (M)** — User membandingkan ≥2 kandidat dalam tampilan trade-off forward.
  - AC: tabel menampilkan dimensi dengan penanda ✓/~/✗; ada ringkasan "Pilih A → … tapi …".
- **FR-CM-2 (M)** — Skor ditampilkan kecil, bukan angka utama.
- **FR-CM-3 (M)** — User dapat memilih satu kandidat sebagai keputusan akhir (menyelesaikan siklus → KPI-1).

### 6.8 Status Kandidat

- **FR-ST-1 (M)** — Kandidat punya status: Tersedia (default), Sudah Disurvey, Sudah Tersewa.
  - AC: "Sudah Tersewa" disisihkan dari compare aktif, tetap tersimpan di arsip; status bisa diubah manual.

---

## 7. Non-Functional Requirements

| ID | Kategori | Requirement |
|---|---|---|
| NFR-1 | Performa | Ekstraksi satu listing terasa cepat (target < ~5 dtk) |
| NFR-9 | Responsif | UI **responsif penuh** — mobile, tablet, desktop — dengan pendekatan mobile-first (Tailwind breakpoints `sm`/`md`/`lg`). Tidak ada layar yang rusak/terpotong di lebar manapun; Compare tetap terbaca di layar kecil |
| NFR-10 | Animasi & visual | Animasi proper via **Framer Motion** (scroll-reveal, stagger, micro-interaction) — purposeful (mengarahkan perhatian/feedback), bukan dekorasi berlebih; **wajib hormati `prefers-reduced-motion`**. **Gambar placeholder** dipakai agar layar hidup sebelum asset final (`components/ui/placeholder-image.tsx`); primitives animasi di `components/motion/motion.tsx` |
| NFR-2 | Biaya | Biaya AI per ekstraksi rendah & terpantau (GPT-4o mini); fallback rule-based tersedia |
| NFR-3 | Privasi | Data user & kontak owner tidak ditaruh di URL/query; service-role key tidak pernah di client; minim data pribadi |
| NFR-4 | Auth | **Google login wajib dari awal** (Auth.js/NextAuth) sebagai gerbang aplikasi; Supabase dipakai untuk data + storage, bukan auth |
| NFR-5 | Keandalan | Ekstraksi yang gagal tidak memblokir; user dapat lanjut via form manual |
| NFR-6 | Bahasa | UI & ekstraksi berbahasa Indonesia; menangani gaya penulisan listing yang tidak baku |
| NFR-7 | Auditability | Skor & versinya dapat ditelusuri; perubahan data penting tercatat (fondasi timeline) |
| NFR-8 | Skalabilitas data | Schema mendukung 4 moda transport (nullable) & jenis properti lain sejak awal |

---

## 8. Arsitektur Teknis (ringkas)

| Layer | Pilihan | Alasan singkat |
|---|---|---|
| Frontend | Next.js + Tailwind + shadcn/ui | Cepat, mobile-web friendly |
| Backend/DB/Storage | Supabase (Postgres + Storage) | Data + storage; akses server-side via sesi NextAuth, RLS sebagai lapis pertahanan; kolom `scoring_version` |
| Auth | Auth.js (NextAuth) + Google OAuth | Login wajib dari awal; sesi server-side |
| AI extraction | GPT-4o mini + pre-processing lokal | Murah; lulus gate akurasi (bersyarat data nyata) |
| Maps/Geocoding | Google Maps | Data transit Indonesia lebih kuat (Mapbox/OSM ditolak) |
| Hosting | Vercel | Integrasi Next.js |

Detail keputusan & alternatif yang ditolak: `next-feature/mvp-build-sequencing.md`.

---

## 9. Requirement AI & Gate Akurasi

- **Schema field** sumber: `benchmark/schema.mjs` (selaras form Kontrakan).
- **Gate GO/NO-GO:** field accuracy **>85%** pada **≥20 teks broker WA nyata** sebelum membangun Slice 2.
- **Status saat ini:** directional GO — GPT-4o mini **92.7% overall / 92.0% critical** pada 20 listing sintetis (`benchmark/`). Belum mengikat sampai diuji data nyata.
- **Jika NO-GO:** iterasi `prompt.mjs` → tambah pre-processing → baru pertimbangkan model lain (Claude Haiku sudah jadi kolom pembanding).

---

## 10. Metrik & Instrumentasi

| Metrik | Cara ukur |
|---|---|
| Cycle completion (KPI-1) | Event: input kandidat pertama → event: pilih satu; rasio per user aktif |
| Session depth (KPI-2) | Jumlah langkah/aksi bermakna per sesi |
| Extraction accuracy (KPI-3) | Benchmark harness vs gold label |
| Exit survey di Compare | "Apakah skor ini membantu memutuskan?" (ya/tidak) |

---

## 11. Milestone & Fasing

1. **Gate akurasi (data nyata)** — kumpulkan 20+ teks asli, jalankan benchmark. *Owner: Faisal.*
2. **Slice 1 build** — pipeline end-to-end Kontrakan. Target ~19–26 hari.
3. **Instrumentasi** — pasang tracking KPI-1/2 + exit survey.
4. **Review** — setelah ≥5 user menyelesaikan sesi, evaluasi sebelum commit Slice 2.
5. **Slice 2+** — form Apartemen/Kost, survey fisik, timeline, harga asli/akhir.

---

## 12. Dependencies & Risiko

- **Dependencies:** OpenAI API, Supabase project, Google Maps API key, Vercel. (Kredensial dikelola di `.env`, tidak di kode.)
- **Risiko produk:**
  - Akurasi ekstraksi turun di teks nyata → mitigasi: gate + iterasi prompt.
  - Property Review terasa seperti "betulkan semua" jika ekstraksi buruk → akurasi adalah penjaga value.
  - Compare terasa kurang berguna tanpa data kondisi (survey ditunda) → deal breaker flag + 3 dimensi sebagai nilai awal.

---

## 13. Open Questions

1. Ambang pasti deal breaker → kapan naik dari flag ke auto-eliminasi (post-MVP).
2. Bagaimana jarak/lokasi diukur sebelum routing otomatis (km manual: UX-nya seperti apa).
3. Definisi operasional "session depth" yang prediktif terhadap completion.
4. Monetisasi & retensi — di luar PRD ini (lihat BRD §11).
