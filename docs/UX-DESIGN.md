# UX/UI Design Spec — Hunian Slice 1

| | |
|---|---|
| **Scope** | Slice 1 — desain UI/UX 8 layar pipeline keputusan Kontrakan (mobile-web, bahasa Indonesia) |
| **Versi** | 1.0 · 2026-06-26 |
| **Status** | 🟦 PENDING CONFIRMATION (PO) — siap dieksekusi paralel; 3 keputusan menunggu Faisal (lihat §E) |
| **Sumber kebenaran** | [`next-feature/mvp.md`](../next-feature/mvp.md) (mockup) · [`docs/PRD.md`](./PRD.md) (FR) · [`docs/DEVELOPMENT-PLAN.md`](./DEVELOPMENT-PLAN.md) (scope) · [`docs/ERD.md`](./ERD.md) + [`db/schema.sql`](../db/schema.sql) (data) |
| **Sesi** | [`sessions/2026-06-26-ux-ui-slice1.md`](../sessions/2026-06-26-ux-ui-slice1.md) |
| **Agents** | UX (primary) · PM (scope) · TL (feasibility) · DA (challenge) · SYN (verdict) · PO (gate) — STR di-skip |

> Prinsip yang mengikat seluruh dokumen ini:
> **AI mengurangi pekerjaan mengetik, bukan mengambil keputusan.** Scoring rule-based & dapat diaudit; AI hanya extraction/normalization/explanation. Compare = trade-off forward (user sadar & setuju atas pengorbanannya), bukan ranking angka. Prioritas tampil bintang bukan %. Deal breaker = flag amber, kandidat tak pernah dihapus.

---

> **⚠️ OVERRIDE Faisal 2026-06-26 — baca sebelum membangun.** Sesi UX ini membaca PRD sebelum requirement landing/animasi ditambahkan. Yang berlaku sekarang:
> 1. **Landing TERPISAH dari login** (bukan satu layar seperti Layar 1). `/` = landing publik kaya (hero + value/how-it-works + CTA), responsif penuh, **gambar placeholder + animasi proper** (Framer Motion, hormati `prefers-reduced-motion`). `/login` = halaman login sendiri.
> 2. **Step Prioritas WAJIB** (bukan skippable/equal-weight). `bobot_source` = pilihan user.
> 3. Scoring **3 dimensi** (confirmed). Pengumpulan data uji **ditunda** (build UI dulu).
> Animasi & placeholder BUKAN opsional (PRD NFR-10 / FR-LP-1). Primitives: `components/motion/motion.tsx`, `components/ui/placeholder-image.tsx`.

## A. INFORMATION ARCHITECTURE

### A.1 Route Map

```
/                        Landing + Login CTA (publik, tanpa sesi)
/onboarding              Onboarding 4-step (gate: sesi ada, onboarding_completed=false)
/dashboard                Daftar kandidat            [TAB 1 🏠]
/shortlist/[id]           Detail kandidat (Skor + AI explanation)
/shortlist/[id]/review    Property Review (post-extraction)
/input                   Input Property Kontrakan
/bandingkan              Compare kandidat           [TAB 2 ⚖]
/pengaturan              Pengaturan preferensi      [TAB 3 ⚙]
/api/auth/[...nextauth]  Ditangani NextAuth (bukan layar)
```

Tidak ada route `/login` terpisah. Google OAuth dipicu dari CTA di `/`; callback NextAuth menentukan redirect.

### A.2 Gate Logic (middleware.ts)

```
REQUEST MASUK
   │
   ▼ Route publik? (/, /api/auth/*) ──► ALLOW
   │ tidak
   ▼ Sesi NextAuth valid? ──── tidak ──► redirect /
   │ ya
   ▼ onboarding_completed = true? ── tidak ──► redirect /onboarding
   │ ya
   ▼ ALLOW

Edge cases:
  / + sesi + completed=true    → redirect /dashboard
  / + sesi + completed=false   → redirect /onboarding
  /onboarding + completed=true → redirect /dashboard
```

`onboarding_completed` dibaca dari `user_preferences` via server session. Jika baris `user_preferences` belum ada (user baru sekali login), buat baris `onboarding_completed=false` lalu redirect `/onboarding`.

### A.3 Navigasi — RESPONSIF (keputusan Faisal 2026-06-26)

App shell (`components/app/app-shell.tsx`) dipakai semua layar app (`/dashboard`, `/shortlist/[id]`, `/bandingkan`, `/pengaturan`, `/input`, `/review`). TIDAK dipakai di `/` (landing), `/login`, `/onboarding` (layar fokus/flow).

**Layar besar (≥ `sm`):** **sidebar kiri** (`w-60`, fixed) — logo + nav (Kandidat · Bandingkan · Pengaturan, aktif = teal) + blok akun & **Keluar** di bawah. Konten `sm:pl-60`. Tidak ada bottom nav. (`components/app/sidebar.tsx`)

**Layar kecil (< `sm`):** **bottom navigation bar** (`sm:hidden`, `fixed bottom-0`, `safe-area-inset-bottom`) — tab **Kandidat · Bandingkan · Pengaturan** (aktif = teal-700, ikon stroke). Logout via halaman Pengaturan.

```
Desktop (≥sm)                         Mobile (<sm)
┌───────────────────────────┐        ┌───────────────────────────┐
│ Hunian.        ( A )▾      │        │ Hunian.                   │
│            Pengaturan      │        │  …konten…                 │
│            Keluar          │        ├───────────────────────────┤
└───────────────────────────┘        │  ⌂ Kandidat ▮▮ Banding ☰ Set │
                                      └───────────────────────────┘
```

Komponen "Tambah kandidat" tampil sebagai tombol di header section Kandidat (semua ukuran). Semua layar app **responsif penuh** (NFR-9): konten `max-w-5xl` terpusat, grid 1→2→3 kolom menyesuaikan lebar.

### A.4 Diagram Alur Antar Layar

```
/  (LANDING + LOGIN) ──OAuth callback──┐
                                       │
        user baru (completed=false) ───┤─── returning (completed=true)
                │                                     │
                ▼                                     ▼
        /onboarding (Step 1→4, Step 3&4 skippable)   /dashboard (TAB 1)
                │                                     │  [FAB +]
                └───── set completed=true ────────────┤
                                                 tap  │  FAB
                                            kandidat   │   │
                                   ┌────────────────┐  │   ▼
                                   │ /shortlist/[id] │◄─┘  /input
                                   │ Skor + AI      │      tab PASTE (default) / MANUAL
                                   └────────────────┘      │  Ekstrak (~5dtk)
                                                           │  gagal → fallback manual (NFR-5)
                                                           ▼
                                              /shortlist/[id]/review
                                              ReviewRow ✓/⚠ + input km manual
                                              [Simpan] → score dihitung server-side
                                                           │
                                                           ▼
                                                       /dashboard
   /bandingkan (TAB 2) — ≥2 kandidat aktif — trade-off forward — FR-CM-1/2/3
   /pengaturan (TAB 3) — edit semua preferensi — FR-ON-5
```

---

## B. SPEC PER LAYAR

> Legenda status field: 🔴 wajib · 🟡 opsional. Legenda verifikasi: ✓ emerald (confidence≥0.7) · ⚠ amber (confidence<0.7 / null) · ~ zinc (diisi manual, tanpa confidence AI).

### LAYAR 1 — Landing / Login

**Tujuan:** User memahami nilai Hunian dalam satu layar dan masuk dengan Google tanpa friction.
**Route:** `/` · **FR:** FR-AU-1, FR-AU-2

```
┌─────────────────────────────────────┐
│         [ilustrasi kandidat list]   │
│                                     │
│  Bandingkan hunian sewa             │
│  tanpa spreadsheet                  │
│                                     │
│  Copy deskripsi dari WhatsApp,      │
│  Hunian ekstrak & bantu kamu        │
│  pilih yang paling masuk akal.      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔵  Masuk dengan Google      │  │
│  └───────────────────────────────┘  │
│  Gratis. Tidak butuh install.       │
└─────────────────────────────────────┘
```

**Komponen:** `Button` (size lg, variant outline) + inline SVG logo Google · `Card`.
**State:**
| State | UX |
|---|---|
| Default | Landing + tombol Google aktif |
| Loading | Tombol: spinner + disabled, "Menghubungkan..." |
| OAuth error | Sonner: "Login gagal. Coba lagi, atau periksa koneksimu." Tombol aktif lagi |
| Success (baru) | Redirect `/onboarding` |
| Success (returning) | Redirect `/dashboard` |

**Microcopy:** Headline "Bandingkan hunian sewa tanpa spreadsheet". Sub "Copy deskripsi dari WhatsApp, Hunian ekstrak & bantu kamu pilih yang paling masuk akal." CTA "Masuk dengan Google" (bukan "Login/Sign in"). Footer "Gratis. Tidak butuh install."

**Tradeoff — landing+login satu layar vs `/login` terpisah:** Dipilih satu layar. Ditolak halaman login terpisah (menambah redirect tanpa nilai; satu-satunya aksi = tombol Google). Tradeoff: bila kelak ada login alternatif (magic link), barulah ekstrak ke `/login`.

> Catatan koreksi (dari DA/SYN): referensi "FR-LP-1" dan "NFR-10" yang sempat muncul TIDAK ada di PRD — diperlakukan sebagai keputusan desain internal (landing minimal + animasi fade-in opsional), bukan requirement. Jangan dikutip sebagai FR resmi.

---

### LAYAR 2 — Onboarding (4 Step)

**Tujuan:** User mengonfigurasi konteks pencarian (budget, tujuan, prioritas, deal breaker) sebelum kandidat pertama.
**Route:** `/onboarding` (step 1–4 client-side) · **FR:** FR-ON-1, FR-ON-2, FR-ON-3, FR-ON-4 (editable di Settings: FR-ON-5)

**Frame umum:**
```
┌─────────────────────────────────────┐
│ [← Kembali]              [Lewati]   │
├─────────────────────────────────────┤
│ ████████████░░░░░░░░ Step 2 dari 4  │
├─────────────────────────────────────┤
│  [Konten step]                      │
│  ┌───────────────────────────────┐  │
│  │         Lanjut →              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```
- "Kembali" mulai step 2. "Lewati" hanya step 3 & 4 (skippable). Step 4 CTA = "Selesai".
- `Progress` value=(step/4)*100, label "Step N dari 4". Tiap step submit = upsert parsial `user_preferences`.

**Step 1 — Budget (FR-ON-1) — WAJIB**
```
Berapa budget sewamu per bulan?
Budget ideal     [ Rp __________ ]
Budget maksimal  [ Rp __________ ]
ⓘ Ideal = target; Maksimal = batas keras yang tidak bisa dilewati.
```
`Form`, `Input` (prefix "Rp", inputmode numeric). Validasi `budget_max ≥ budget_ideal` (selaras `chk_budget_max_gte_ideal`). Error inline: "Budget maksimal harus sama atau lebih besar dari ideal." Lanjut aktif bila kedua valid.

**Step 2 — Tujuan + Transportasi (FR-ON-2) — WAJIB**
```
Di mana lokasi kerjamu sehari-hari?
[ 🔍 Ketik nama tempat atau alamat... ]
  ↳ (dropdown autocomplete Places)
✓ Komplek Perkantoran Sudirman, Jakarta Pusat   ← konfirmasi teks

Kamu biasanya pakai apa? (pilih semua yang berlaku)
☑ Motor   ☐ Mobil   ☐ Transportasi umum   ☐ Jalan kaki / sepeda
```
`Input` debounced (Google Places Autocomplete, dropdown custom), `Badge` konfirmasi alamat (teal-100), `Checkbox` multi-moda. Data: `dest_address/dest_lat/dest_lng` dari Places; `transport_modes[]`. Lanjut aktif bila alamat TERPILIH (bukan hanya diketik) + ≥1 moda. **TANPA embed peta** — hanya konfirmasi teks formatted address (keputusan TL).

**Step 3 — Prioritas (FR-ON-3) — SKIPPABLE (lihat §E/Q1)**
```
Apa yang paling penting buat kamu? (pilih semua yang relevan)
☑ Harga terjangkau   ☑ Dekat kantor/tujuan   ☑ Keamanan lingkungan
☐ Kondisi bangunan   ☐ Fasilitas lengkap     ☐ Furnished
☐ Parkir tersedia    ☐ Internet cepat        ☐ Tenang/tidak bising
─────────────────────────
Prioritasmu:
★★★★★  Harga      ★★★★☆  Dekat tujuan
★★★☆☆  Keamanan   ★★☆☆☆  Fasilitas
```
`Checkbox` + komponen custom `StarDisplay` (lucide `Star`, non-interactif, preview real-time). Bobot dihitung client-side untuk preview; bobot final di-generate server-side. Data: `priority_selection[]`, `weight_harga/lokasi/fasilitas` (+ `weight_keamanan/owner` placeholder).
**Bila di-SKIP →** equal-weight default (34/33/33 Harga/Lokasi/Fasilitas), `bobot_source = "default-equal"`, microcopy: "Gunakan bobot sama — bisa diubah di Settings kapan saja." Bila diisi → `bobot_source = "user-defined"`.

**Step 4 — Deal Breaker (FR-ON-4) — SKIPPABLE**
```
Ada hal yang langsung menggugurkan sebuah hunian? (opsional)
☐ Tidak ada parkir motor   ☐ Kamar mandi di luar   ☐ Tidak boleh masak
☐ Tidak ada dapur          ☐ Lantai >3 tanpa lift  ☐ Bayar setahun di muka
☐ Tidak boleh pasutri
+ Tambah sendiri [ __________________ ]
ⓘ Deal breaker hanya menandai, tidak menghapus kandidat.
[Lewati]                              [Selesai →]
```
`Checkbox` preset, `Input` custom (`custom_text`). Insert `user_deal_breakers` (`is_active=true`). "Lewati" & "Selesai" sama-sama set `onboarding_completed=true`; "Selesai" juga simpan pilihan.

**Tradeoff — 4 step, Step 3+4 skippable:** Dipilih 4 step (2 wajib + 2 skippable). Ditolak: (a) gabung Prioritas+Deal Breaker → user terburu di keduanya; (b) defer Prioritas penuh → scoring tak punya bobot (FR-ON-3). Tradeoff: 4 step berisiko drop-off (mitigasi: Step 3&4 skippable → 2 step efektif). Skip Prioritas memerlukan equal-weight default — **memodifikasi FR-ON-3 dari Must, butuh approval Faisal (Q1)**.

---

### LAYAR 3 — Input Property Kontrakan

**Tujuan:** User menambah kandidat via tempel teks listing atau form manual.
**Route:** `/input` · **FR:** FR-IN-1, FR-IN-2, FR-IN-3, FR-AI-1, FR-AI-2, NFR-5, NFR-6

**Tab PASTE (default):**
```
[✕]                Tambah Kandidat
┌─ Tempel teks ─┬─ Isi manual ─┐   ← tab aktif: Tempel
┌─────────────────────────────┐
│ Tempel deskripsi dari        │
│ WhatsApp, OLX, atau          │
│ mana saja di sini            │
│ ___________________________  │
│ (contoh: "Kontrakan          │
│  Jatibening 3,5jt/bln, 2KT   │
│  1KM, carport, deposit 2 bln")│
└─────────────────────────────┘
[  Ekstrak & Lanjut →  ]
```

**Tab MANUAL (alternatif/fallback):**
```
┌─ Tempel teks ─┬─ Isi manual ─┐   ← tab aktif: Manual
Informasi Dasar
Judul kandidat   🔴  [ mis. Kontrakan Jatibening ]
Kontak owner     🔴  [ Nomor WA / nama ]
Harga sewa       🔴  [ Rp ______ ] [ per bulan ▼ ]   (bulan/3 bulan/6 bulan/tahun)
Kamar tidur 🔴 [__]   Kamar mandi 🔴 [__]
Furnished        🔴  ○ Furnished  ○ Semi  ○ Unfurnished
▼ Detail lainnya (opsional)   ← Collapsible
   [Deposit · Alamat · Deskripsi · Listrik/Air · Carport · Dapur · Platform]
[  Simpan Kandidat →  ]
```

**Komponen:** `Tabs`, `Textarea`, `Form`, `Input`, `Select` (periode FR-IN-3), `RadioGroup` (furnished), `Checkbox` (carport/dapur), `Collapsible`, `Badge` (🔴/🟡), `Skeleton`, `Sonner`.

**State:**
| State | UX |
|---|---|
| PASTE default | Textarea kosong + placeholder hint |
| PASTE terisi | Counter karakter; "Ekstrak & Lanjut" aktif |
| PASTE loading | Tombol disabled+spinner "AI sedang membaca..."; Skeleton (NFR-1 target <5dtk) |
| PASTE success | Redirect `/shortlist/[id]/review` |
| PASTE gagal (NFR-5) | Sonner "Ekstraksi gagal — kami pindahkan ke form manual. Isi yang kurang." → auto-switch tab Manual; teks tetap tersimpan sebagai `source_text` |
| PASTE multi-listing | **Extract listing PERTAMA** + info banner "Kami mendeteksi lebih dari satu listing. Yang diproses listing pertama — tambah sisanya satu per satu." (bukan error/block — keputusan SYN) |
| MANUAL submit | Validasi client → server action → `/shortlist/[id]/review` (tanpa extraction) |

**Microcopy:** Placeholder "Tempel deskripsi dari WhatsApp, OLX, atau mana saja di sini". CTA "Ekstrak & Lanjut →". Badge wajib bertuliskan "wajib" (bukan hanya asterisk). Select periode: konversi otomatis ke per bulan (FR-IN-3).

**Tradeoff — paste-first vs form-first:** Dipilih paste-first (default tab). Ditolak form-first. Alasan: mental model riil user = teks WA ada duluan; melayani 80% kasus, manual cuma 1 tap. Tradeoff: user tanpa teks (deal langsung) klik 1 tab ekstra — diterima.

---

### LAYAR 4 — Property Review

**Tujuan:** User memverifikasi & melengkapi hasil ekstraksi sebelum kandidat disimpan final.
**Route:** `/shortlist/[id]/review` · **FR:** FR-RV-1, FR-RV-2, FR-IN-3, FR-SC-1 (input lokasi)

```
[← Kembali]        Review Kandidat
ⓘ Periksa hasil ekstraksi. Ketuk baris untuk mengoreksi.

─── Informasi Dasar ───
Judul          Kontrakan Jatibening   ✓
Kontak owner   08123456789            ✓
Platform       WhatsApp               ~
Alamat         —                      ⚠
─── Spesifikasi ───
Kamar tidur    2                      ✓
Kamar mandi    1                      ✓
Furnished      Unfurnished            ✓
Carport        Ya                     ✓
Dapur          Tidak diketahui        ⚠
─── Biaya ───
Harga sewa     Rp 3.500.000/bln       ✓
Deposit        Rp 7.000.000           ✓
Listrik        Token                  ✓
Air            Tidak diketahui        ⚠
─── Jarak ke Perkantoran Sudirman ───   (opsional — dipakai untuk skor lokasi)
Motor          [ ___ ] km
Mobil          [ ___ ] km
⚠ Jarak belum diisi — skor lokasi tidak dihitung
─── Dokumentasi ───
Foto           —                      ⚠   [+ Upload foto]

[  Simpan Kandidat →  ]   ← aktif bila field 🔴 terisi
```

**`ReviewRow` (komponen custom — inti layar):** label + nilai extracted + ikon status; tap → inline edit expand di bawah baris yang sama (bukan modal), baris lain collapse. Logika status: helper `getReviewStatus(confidence, value)` — `≥0.7 & non-null → ✓ emerald`; `<0.7 atau null → ⚠ amber`; manual → `~ zinc`.

**Section Jarak (menambal DATA GAP TL — `score_lokasi`):** muncul per moda di `transport_modes`. Tiap input → `candidate_commute` (`transport_mode`, `distance_km`, `api_provider='manual'`). Kosong → `score_lokasi=NULL` + warning amber non-blocking; warning hilang saat salah satu km diisi. Input `inputmode=decimal`, `step=0.1`, `min=0.1`.

**Komponen:** `ReviewRow` (custom), `Input`, `Select`, `Button`, `Separator`, `Sonner`.
**State:**
| State | UX |
|---|---|
| Post-extraction | Row ✓/⚠ per confidence |
| Post-manual | Semua row `~` (tanpa confidence) |
| All-amber (teks minim, semua ⚠) | Banner di atas: "Sebagian besar belum terdeteksi — lengkapi manual di bawah." (DA fix) Submit tetap diatur oleh field 🔴 |
| 🔴 masih ⚠ | "Simpan" disabled; badge header "Lengkapi N field wajib" |
| Semua 🔴 terisi | "Simpan" aktif |
| Submit loading | Spinner; scoring dihitung server-side |
| Submit success | Sonner "Kandidat disimpan" → `/dashboard` |
| Submit error | Sonner "Gagal menyimpan, coba lagi" |

**Microcopy:** Header "Ketuk baris untuk mengoreksi nilai yang ditandai ⚠". Tooltip ✓ "Kepercayaan tinggi — tetap cek sendiri" (trust-copy fix DA: confidence≥0.7 ≠ pasti benar). Tooltip ⚠ "Perlu dicek — kosong atau kurang yakin". CTA "Simpan Kandidat →".

**Tradeoff — ReviewRow tap-to-edit vs form pre-filled biasa:** Dipilih ReviewRow. Ditolak form pre-filled (tak membedakan "yakin" vs "tidak yakin"). Tradeoff: bila akurasi <85%, ReviewRow penuh ⚠ → frustrasi. **Gate akurasi (PRD FR-AI-1, >85%) adalah penjaga utama UX ini.**

---

### LAYAR 5 — Daftar Kandidat

**Tujuan:** User melihat semua kandidat aktif, status, & flag deal breaker dalam satu pandangan.
**Route:** `/dashboard` · **FR:** FR-ST-1, FR-DB-1

**Populated:**
```
Hunian                       [avatar] ⚙
3 kandidat aktif
┌───────────────────────────────────┐
│ ⚠ 1 deal breaker        (amber)   │
│ Kontrakan Jatibening              │
│ Rp 3.500.000 / bulan              │
│ ★★★☆☆  Skor belum lengkap         │   ← score_lokasi NULL
│ [Tersedia]                        │
└───────────────────────────────────┘
┌───────────────────────────────────┐
│ Kontrakan Cipete Selatan          │
│ Rp 3.800.000 / bulan              │
│ ★★★★★  Skor 89                    │
│ [Tersedia]                        │
└───────────────────────────────────┘
─── Tidak aktif ───
┌───────────────────────────────────┐
│ Kontrakan Kalibata (arsip)  ½opacity│
│ [Sudah Tersewa]                   │
└───────────────────────────────────┘
                              [  +  ]   ← FAB
🏠 Kandidat  │  ⚖ Bandingkan  │  ⚙
```
> Koreksi scope (DA/SYN): contoh "Apartemen Gateway Bekasi" pada draft sebelumnya DIHAPUS — Slice 1 = **Kontrakan ONLY**. Semua contoh kandidat = Kontrakan.

**Empty (0 kandidat):**
```
[ilustrasi daftar kosong]
Belum ada kandidat
Mulai dengan menambah hunian pertama yang kamu lirik.
[ + Tambah kandidat pertama ]
```

**Card anatomy:** judul · `harga_efektif_bulanan/bulan` · `StarDisplay` (score_total→bintang) atau "Skor belum lengkap" (NULL) · status badge (Tersedia emerald / Sudah Disurvey teal / Sudah Tersewa zinc). Deal breaker → border-left amber-400 4px + chip "⚠ N deal breaker".
**Urutan:** aktif (`tersedia`+`sudah_disurvey`) sort `score_total DESC NULLS LAST`; separator "Tidak aktif"; `sudah_tersewa` opacity-50.

**Komponen:** `Card`, `Badge`, `StarDisplay` (custom), `Skeleton`, `Separator`, `Button` (FAB), placeholder image (empty).
**State:** Loading→3 Skeleton card · Empty→ilustrasi+CTA · Populated→list sort skor · Error fetch→Sonner "Gagal memuat daftar, coba lagi" + Muat Ulang.
**Microcopy:** "3 kandidat aktif" / "1 aktif · 1 tidak aktif". Deal breaker "⚠ N deal breaker". NULL skor → "Skor belum lengkap". Empty headline "Belum ada kandidat", CTA "+ Tambah kandidat pertama".

**Tradeoff — empty state actionable vs redirect otomatis ke /input:** Dipilih empty state + CTA. Ditolak auto-redirect (menghilangkan orientasi "ini rumah Hunian-ku"). Tradeoff: 1 tap ekstra, hanya sekali saat kandidat 0 — diterima.
**Tradeoff — daftar minimalis (PM scope guard):** Tanpa sort/filter/grid toggle/bulk action. Ditolak karena tak ada FR & pilot ~3–5 kandidat. Tradeoff: navigasi berat bila >10 kandidat — masuk backlog Slice 2 bila data pilot menunjukkan.

---

### LAYAR 6 — Detail Kandidat / Skor + AI Explanation

**Tujuan:** Menampilkan scoring per dimensi & penjelasan AI natural; mendorong aksi nyata (lengkapi data, hubungi owner).
**Route:** `/shortlist/[id]` · **FR:** FR-SC-1, FR-SC-2, FR-SC-3, FR-AI-3, FR-DB-1, FR-ST-1, NFR-7

```
←  Kontrakan Jatibening
● Tersedia              [Ubah status ▾]
Rp 3.500.000 / bulan
2KT · 1KM · Unfurnished · Carport
6 km dari Perkantoran Sudirman · Motor
─── PENILAIAN AWAL              Skor: 74 ───   ← skor kecil/muted
Harga      ████████░░  82
Lokasi     █████░░░░░  52
Fasilitas  ████████░░  78
┌─────────────────────────────────────┐
│ Hunian ini layak dipertimbangkan    │
│ karena:                             │
│ ✓ Harga masih di bawah budget       │
│   maksimalmu                        │
│ ✓ Carport tersedia — sesuai         │
│   kebutuhanmu                       │
│ Yang belum diketahui:               │
│ · Biaya air bulanan                 │
│ · Ada dapur atau tidak              │
│ · Kondisi fisik bangunan (survey)   │
│ Konfirmasi ke owner sebelum survey. │
└─────────────────────────────────────┘
DEAL BREAKER:  ✓ Tidak ada pelanggaran
DETAIL                       [Lihat semua ▾]
Harga sewa/bln  Rp 3.500.000 ✓
Air             —            ⚠
Kontak: 0812-xxxx-xxxx
[  💬 Hubungi via WhatsApp  ]
```

**Hierarki (tradeoff):** Skor total KECIL/muted → bar dimensi tipis (h-1.5, angka di samping) → AI explanation card (primer secara whitespace). Ditolak skor besar (mendorong optimasi angka; melanggar mandate skor kecil) & "AI explanation tanpa skor" (hilang referensi numerik untuk Compare). Tradeoff: bar tipis bisa kurang terbaca → mitigasi angka teks selalu ada.

**AI explanation:** ON-DEMAND (tap "Lihat Penjelasan AI", bukan auto — hemat cost, keputusan TL), streaming, conversational. Selalu memuat "Yang belum diketahui:" bila ada field ⚠ (kritis untuk trust & dorong lengkapi data). **AI tidak menghitung/merekomendasikan** (FR-AI-3) — caching: session-cache (React state), regen tiap sesi baru, invalidate bila bobot berubah dalam sesi sama.

**WhatsApp:** `https://wa.me/{phone}?text=...`; tab baru; phone dari `kontak_owner`; bila kontak non-nomor tombol tidak muncul (degrade gracefully).
**State:** Loading→Skeleton · Jarak null→bar Lokasi tidak dirender + inline input km · Deal breaker ada→badge amber per item · Status→Tersewa→`Dialog` konfirmasi "Tandai sudah tersewa? Kandidat dipindah ke arsip, tidak ikut perbandingan aktif."
**Komponen:** `Progress` (bar), `Badge`, `Collapsible` (detail), `DropdownMenu` (status), `Dialog`, `Button`, `Separator`, `Card`.
**Microcopy:** Section "PENILAIAN AWAL" (bukan FINAL — kondisi fisik belum disurvey). "Yang belum diketahui:" wajib hadir bila ada ⚠.

---

### LAYAR 7 — Compare Trade-off Forward (HERO)

**Tujuan:** User membandingkan kandidat aktif secara trade-off forward (apa yang dikorbankan), lalu memilih satu — menutup siklus (KPI-1).
**Route:** `/bandingkan` · **FR:** FR-CM-1, FR-CM-2, FR-CM-3, FR-DB-1

**State <2 kandidat:**
```
Bandingkan
     [ ikon timbangan ]
Kamu butuh minimal 2 kandidat untuk mulai membandingkan.
Saat ini ada 1 kandidat aktif.
Tambah 1 lagi untuk mulai — atau 3 kandidat untuk compare yang lebih kuat.
[ + Tambah Kandidat ]
```

**State ≥2 kandidat (hero):**
```
Bandingkan                       3 aktif
← geser untuk lihat semua →
┌─────────┬──────────┬──────────┐
│         │    A     │    B     │
│         │Jatibening│Cipete    │
├─────────┼──────────┼──────────┤
│Harga    │3.5jt  ✓ │3.8jt  ~ │
│Jarak    │6 km   ~ │3 km   ✓ │
│Fasilitas│   ✓     │   ✓     │
│Deal brk │   ✓     │   ✓     │
│Skor     │   74    │   68    │   ← kecil
└─────────┴──────────┴──────────┘
✓ = sesuai   ~ = perlu pertimbangan   ✗ = di luar batas

PILIH DENGAN SADAR
┌────────────────────────────────┐
│ Pilih A — Kontrakan Jatibening │
│ ✓ Hemat Rp300rb/bln vs B       │
│ ✓ Carport + 2KT sesuai         │
│ ~ 3 km lebih jauh dari B       │
│ [   Pilih Kontrakan A   ]      │
└────────────────────────────────┘
┌────────────────────────────────┐
│ Pilih B — Kontrakan Cipete     │
│ ✓ Paling dekat kantor (3 km)   │
│ ~ Lebih mahal Rp300rb/bln dari A│
│ [   Pilih Kontrakan B   ]      │
└────────────────────────────────┘
```

**Layout (tradeoff):** Tabel horizontal-scroll + kolom pertama sticky (CSS `position:sticky;left:0`, tanpa library) + trade-off CARDS di bawah. Ditolak: card-stack/accordion (hancurkan comparative view), swipe carousel (tak side-by-side), tabel-saja (penuhi FR tapi bukan spirit trade-off). Tradeoff: horizontal scroll kurang "diketahui" → mitigasi gradient fade tepi kanan + label "← geser untuk lihat semua →". **Max 3 kandidat** (sticky col 100px, min col 120px); >3 → `Checkbox` selector "Pilih maks. 3 kandidat".

**Trade-off text = RULE-BASED (bukan AI, keputusan TL):** dihitung dari `harga_efektif_bulanan`, `distance_km`, flags. **Fallback bila jarak NULL (DA HIGH-3):** baris jarak tampil "Jarak belum diisi" dan trade-off card MENGHILANGKAN klausa jarak (tidak mengarang "0 km") — mis. "Pilih A → hemat Rp300rb/bln" tanpa komponen jarak; tambahkan nudge "Isi jarak untuk perbandingan lokasi."

**Simbol 3-layer (ikon+warna+teks):** ✓ emerald "Sangat sesuai" · ~ amber "Ada trade-off" · ✗ rose "Di luar batas / langgar deal breaker". Legenda selalu tampil. Deal breaker pelanggar → baris "Deal brk ✗" + card tambah "⚠ 1 deal breaker — cek dengan owner".

**Pilih → Dialog konfirmasi** (tampilkan ulang trade-off ~) → "Ya, ini pilihanku →" → INSERT `decisions` (`candidate_id`, `scoring_version` dari kandidat terpilih, `score_at_decision`, `candidates_compared` snapshot) → Toast "Kamu memilih [judul]. Semoga cocok!" → `Sheet` exit survey "Apakah perbandingan tadi membantu kamu memutuskan? [Ya] [Tidak] · Lewati" (KPI, PRD §10; auto-dismiss 15 dtk) → redirect `/dashboard` (kandidat terpilih dapat Badge "Dipilih").

**Komponen:** `Table`, `Dialog`, `Sheet`, `Badge`, `Skeleton`, `Button`, `Separator`, `Checkbox` (selector), `Sonner`. `CompareTable` & `TradeoffCard` = custom.
**State:** <2→empty · 2→tabel 2 kolom (no scroll) · 3→horizontal-scroll · 4+→selector · deal breaker→baris ✗ amber · score recalculating→Skeleton baris Skor saja · confirming→Dialog · post-pilih→Toast+Sheet+redirect.

---

### LAYAR 8 — Settings

**Tujuan:** User mengedit semua preferensi onboarding kapan saja; skor kandidat diperbarui otomatis.
**Route:** `/pengaturan` · **FR:** FR-ON-5 (+ FR-ON-1/2/3/4 re-edit), FR-AU-1 (logout)

```
Pengaturan
PREFERENSI PENCARIAN
[ Budget                    → ]  Rp 3.000.000 – Rp 4.500.000
[ Tujuan & Transportasi     → ]  Perkantoran Sudirman · Motor
[ Prioritas                 → ]  ★★★★★ Harga / ★★★★☆ Lokasi / ★★★☆☆ Fasilitas
[ Deal Breaker              → ]  2 aktif
AKUN
[A] Nama User · email@gmail.com               [ Keluar → ]
🏠 Kandidat  │  ⚖ Bandingkan  │  ⚙
```
Tiap row → `Sheet` dari bawah (reuse komponen onboarding, pre-filled). Prioritas tampil bintang (bukan %). Deal Breaker sheet: preset `Switch` + custom dengan ×hapus + input tambah.
**Setelah simpan:** Sheet tutup → skor SEMUA kandidat di-recalculate di background → Toast "Preferensimu diperbarui. Skor semua kandidat diperbarui." → list refresh tanpa full reload.
**Logout:** `Dialog` "Keluar dari akun ini? Data kamu tetap tersimpan dan bisa diakses saat masuk lagi." [Batalkan] [Keluar].
**Komponen:** `Card`, `Sheet`, `Input`, `RadioGroup`/`Checkbox`, `Switch`, `Avatar`, `Dialog`, `Button`, `Separator`, `Sonner`.
**State:** Loading→Skeleton row · Sheet open→overlay · Saving→tombol disabled+spinner · Error→Sonner rose "Gagal menyimpan. Coba lagi." · Success→toast recalculate.

---

## C. DESIGN DIRECTION

### Tipografi
**Font: Plus Jakarta Sans** (variable, Google Fonts). Dipilih atas Inter (terlalu identik default Tailwind/shadcn, tidak intentional) & Roboto (Android default feel). Tradeoff: Google Fonts dependency → mitigasi `font-display: swap` + preload + `system-ui` fallback.

Scale mobile:
```
H1 halaman   22px/600 zinc-900     Body primary    15px/400 zinc-900
H2 section   12px/600 zinc-500 UPPERCASE tracking-widest
Body second. 14px/400 zinc-600     Caption/helper  13px/400 zinc-500
Harga card   17px/600 zinc-900     Skor (kecil)    13px/500 zinc-400 (muted intentional)
AI explanation 14px/400 zinc-800 line-height 1.6
```

### Palet
Primer **teal-700 `#0F766E`** (kepercayaan + stabilitas, hangat, jarang di property app ID → diferensiasi). Background **stone-50 `#FAFAF9`** (off-white hangat, tak silau outdoor). Card putih + `shadow-sm` + `rounded-xl`.

Status 3-layer (ikon+warna+teks, jangan andalkan warna saja):
| Elemen | Tailwind |
|---|---|
| ✓ confirmed | `text-emerald-600 bg-emerald-50` |
| ⚠ needs input / deal breaker | `text-amber-600 bg-amber-50` |
| ✗ exceeded / violated | `text-rose-600 bg-rose-50` |
| ~ middle | `text-zinc-500` |
| Status dot Tersedia/Disurvey/Tersewa | `emerald-500 / blue-500 / zinc-400` |

**Deal breaker = amber, bukan merah** — merah menyiratkan error/penghapusan; amber = "perhatikan ini" (selaras "flag minimal, kandidat tak dihapus"). Skor bar `bg-teal-500` filled / `bg-zinc-100` unfilled, `h-1.5` (supporting, bukan focal).

### Spacing
Base 4px. Padding halaman `px-4`. Card `p-4`. Stack form `space-y-3`. Gap card `gap-3`. Section gap `mt-6`. Bottom nav `h-14` + `safe-area-inset-bottom`. Content `pb-24` (hindari tertutup nav+FAB).

### Prinsip Interaksi
1. **Sticky CTA dalam jangkauan ibu jari** (`sticky bottom-0`); konten `pb-24`.
2. **Progress onboarding jujur** — bar + "Step N dari 4", tak ada angka yang membohongi.
3. **✓/⚠ tiga layer** (ikon+warna+posisi konsisten kolom kanan).
4. **Trade-off framing — tidak ada "recommended"**; tombol "Pilih A"/"Pilih B" identik secara visual, tak ada highlight "terbaik".
5. **AI explanation = teman bicara**, conversational; "Yang belum diketahui:" selalu ada bila data tak lengkap.
6. **Perubahan Settings → auto-recalculate** + toast.
7. **Deal breaker: flag, bukan blokir** — tak ada tombol "hapus/exclude" yang dipromosikan.

### Loading & Skeleton states (NFR-11 — perceived performance)
Hunian harus **terasa instan**, jadi **bukan loading spinner**. Pola: **Server Components + Streaming + Suspense + Skeleton**. Tiap halaman data dipecah jadi **shell statis (tampil seketika)** + widget data yang di-stream lewat `<Suspense>` dengan **skeleton yang MENIRU layout asli** (bukan kotak generik) — ukuran/grid/border sama dengan komponen final agar transisi tak "melompat". Kerja lambat (geocode, Directions, Overpass POI, signed-URL Storage) **tak boleh memblok scaffold**; ia berada di boundary `<Suspense>` sendiri sehingga header/verdict/biaya tampil duluan, peta/POI/foto menyusul. `loading.tsx` per-route menampilkan skeleton shell saat navigasi pertama. Primitif tunggal: `components/ui/skeleton.tsx` (`Skeleton`/`SkeletonCard`). Animasi pulse **hormati `prefers-reduced-motion`** (Tailwind `animate-pulse` otomatis nonaktif). Implementasi: `docs/DEVELOPMENT-PLAN-SLICE2.md` §S2-PERF.

### Mobile & Aksesibilitas
Touch target min 44×44px. FAB 56×56px `bottom-20 right-4 shadow-lg`. Bottom nav `h-14` + `env(safe-area-inset-bottom)`. Input `text-base` (16px) cegah auto-zoom iOS. Compare `overflow-x-auto` native + kolom pertama `sticky left-0 z-10 bg-white`. Sheet selalu dari bawah (`side="bottom"`). Skeleton `prefers-reduced-motion`→instant.
Kontras AA (4.5:1): audit `emerald-600/amber-600` di atas bg-50 → bila <4.5:1 gunakan `emerald-700`/`amber-800` untuk teks. Jangan andalkan warna saja (semua status: ikon+teks). ARIA: FAB `aria-label="Tambah kandidat baru"`; score bar `aria-valuenow/min/max`; Compare `<th scope=col/row>`. Focus ring `ring-2 ring-teal-500 ring-offset-2`.

---

## D. COMPONENT INVENTORY

**shadcn/ui (`npx shadcn add ...`) — 21 komponen:**
| Komponen | Layar |
|---|---|
| button | semua |
| card | 1,5,6,7,8 |
| input | 2,3,4,8 |
| textarea | 3 (paste) |
| select | 3,4,8 |
| radio-group | 2 (transport), 3 (furnished) |
| checkbox | 2 (prioritas/deal breaker), 7 (selector) |
| badge | 5,6,7 |
| tabs | 3 (paste/manual) |
| progress | 2 (step), 6 (score bar) |
| skeleton | 3,5,6,7 |
| sonner | semua (toast) |
| dialog | 6 (tersewa), 7 (konfirmasi pilih), 8 (logout) |
| sheet | 7 (exit survey), 8 (edit settings) |
| separator | 4,6,8 |
| label | 2,3,4 |
| form | 2,3 |
| avatar | 8 |
| dropdown-menu | 6 (ubah status) |
| collapsible | 3 (opsional), 6 (detail) |
| switch | 8 (deal breaker toggle) |

**Komponen custom (8) — tidak ada di shadcn:**
| Nama | File | Layar |
|---|---|---|
| `ScoreBar` | `components/score-bar.tsx` | 6 |
| `StarDisplay` | `components/star-display.tsx` | 2 (prioritas), 5 (skor) |
| `TradeoffCard` | `components/tradeoff-card.tsx` | 7 |
| `ReviewRow` | `components/review-row.tsx` | 4 |
| `CandidateCard` | `components/candidate-card.tsx` | 5 |
| `CompareTable` | `components/compare-table.tsx` | 7 |
| `BottomNav` | `components/bottom-nav.tsx` | semua post-onboarding |
| `FAB` | `components/fab.tsx` | 5 |

> Bobot effort FE (TL): **Compare (Layar 7) paling berat** (~3–4 hari) — custom table responsive, sticky col, rule-based trade-off text, dialog, decisions insert. Berikutnya **Property Review (Layar 4)** — ReviewRow + parsing extraction_confidence + km manual + fallback. Settings & Login = ringan (reuse/trivial).

---

## E. KEPUTUSAN, RESOLUSI BLOCKER & OPEN QUESTIONS (SYN + PO)

### E.1 Keputusan terkunci tim (boleh dibangun)
- **Multi-listing 1 paste:** extract listing PERTAMA + info banner (bukan error/block).
- **Score NULL renormalisasi:** bila `score_lokasi` NULL → renormalisasi sisa bobot (mis. harga+fasilitas dijadikan total 100% proporsional). Hindari NULL=50 / zero-out (menciptakan signal palsu).
- **`scoring_version` per kandidat:** `"v1-3D"` (lengkap) · `"v1-2D"` (lokasi hilang) · `"v1-1D"`. Audit trail (FR-SC-2).
- **`bobot_source` field per user:** `"user-defined"` | `"default-equal"` — audit mechanism, WAJIB ada sebelum schema lock.
- **AI explanation:** session-cache, regen tiap sesi baru, invalidate bila bobot berubah.
- **Max Compare:** 3 kandidat.
- **Gate akurasi extraction >85% pada 20+ teks WA NYATA:** sebelum **beta launch** (bukan sebelum build); bila <85% → fallback manual jadi primary flow.
- **Fixes konsistensi (sudah masuk dokumen ini):** hapus scope-leak "Apartemen" di Layar 5 → Kontrakan-only; orphan NFR-10/FR-LP-1 → diperlakukan keputusan desain internal, bukan FR; trust-copy ✓ → "kepercayaan tinggi" + tooltip disclaimer.

### E.2 Genuine conflict yang diselesaikan SYN
**DA ("pangkas onboarding ke Budget+Tujuan, tunda Prioritas") vs FR-ON-3/PM ("Prioritas Must, bobot wajib untuk scoring").** Resolusi: Prioritas TIDAK dihapus — dijadikan **skippable dengan equal-weight default + audit `bobot_source`**. Ini menjaga cycle completion tanpa membuat scoring tak punya bobot. Namun karena ini memodifikasi klasifikasi FR-ON-3 (Must→efektif Should di UX), butuh approval Faisal.

### E.3 Status PO: 🟦 PENDING CONFIRMATION — butuh Faisal
| # | Pertanyaan | Rekomendasi PO | Default bila diam (48 jam) |
|---|---|---|---|
| **Q1** | Step Prioritas: skippable + equal-weight default (34/33/33) atau tetap wajib? | **Skippable + safeguard** (cycle completion KPI utama; default transparan, auditable, reversibel) | Prioritas WAJIB (aman, tak langgar prinsip) |
| **Q2** | Formula scoring Slice 1: resmi 3 dimensi (Harga/Lokasi/Fasilitas), Kondisi & Owner ditunda? | **Ya, 3D untuk Slice 1** — selaras PRD §6.6 FR-SC-1; 5D (mvp.md) = full-vision Slice 2 (butuh data survey) | TAHAN schema/scoring lock; build semua kecuali scoring engine |
| **Q3** | Owner & deadline pengumpulan 20+ teks WA kontrakan nyata Jabodetabek | **Faisal sendiri** (punya relasi pencari/broker); terkumpul sebelum integrasi screening AI pertama | Faisal = owner, deadline 1 minggu sebelum target beta |

> Catatan PO untuk Q2: PRD §6.6 sebenarnya **sudah menetapkan 3 dimensi untuk Slice 1**. Diskrepansi hanya terhadap tabel 5-dimensi di `mvp.md` (yang merupakan formula full-vision). Q2 efektif = konfirmasi bahwa 3D PRD berdiri, bukan redesign.

### E.4 Boleh dikerjakan paralel TANPA menunggu Faisal
Design system & tokens · Layar 1, 2 (Step 1+2), 3, 4, 5 (skeleton tanpa scoring engine), 7 (layout Compare), 8 (UI; tandai bagian bobot placeholder) · scope fixes · pipeline AI extraction.
**DITAHAN:** Step 3 Prioritas (form + default-weight UX) → Q1 · scoring engine & schema dimensi → Q2 · beta launch planning → Q3.

### E.5 Vision constraints (non-negotiable, dari PO)
1. AI = extraction + explanation saja; skor rule-based. AI explanation on-demand, session-cache, invalidate saat bobot berubah.
2. `bobot_source` wajib di schema sebelum lock.
3. Deal breaker = flag, bukan eliminasi — selamanya, semua slice.
4. `scoring_version` per kandidat di DB; display ke user TBD setelah Q2.
5. Trust copy: indikator kepercayaan AI WAJIB disertai tooltip disclaimer (confidence ≠ kepastian akurasi).
6. Scope Slice 1 = Kontrakan ONLY; scope leak = bug.
7. Fallback manual wajib bila extraction <85% saat beta — user tak pernah stuck.
8. Compare = trade-off forward; tak ada "kandidat terbaik"/rekomendasi.

---

*Hunian UX/UI Design Spec Slice 1 v1.0 — 2026-06-26. Dihasilkan agent team: UX→PM→TL→DA→SYN→PO.*
