# Code Review — Slice 1: Fondasi Auth + Landing Page

> **STATUS FIX (2026-06-26):** ✅ **HIGH-1 RESOLVED** — guard email di `auth.ts` jwt; `session` callback dipindah ke `auth.config.ts` + `authorized` cek `auth.user.id`; guard halaman (`login`/landing) cek `id` (putus redirect-loop). Cheap wins juga selesai: **MED-2** focus-visible ring global (`globals.css`), **LOW-2** host avatar `lh3.googleusercontent.com` (`next.config.mjs`), **LOW-3** dedupe `antialiased`. Build hijau. Sisa MED/LOW (LOW-7 AUTH_SECRET sebelum deploy, dll) ditunda sebagai polish. **Fondasi siap lanjut bangun screen berikutnya.**

- **Tanggal:** 2026-06-26
- **Reviewer utama:** Tech Lead (TL) · **Challenge:** Devil's Advocate (DA) · **Sintesis & verifikasi:** Orchestrator
- **Scope:** `auth.ts`, `auth.config.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`, `lib/supabase/server.ts`, `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`, `next.config.mjs`, `app/page.tsx`, `app/login/page.tsx`, `app/kandidat/page.tsx`, `components/motion/motion.tsx`, `components/ui/placeholder-image.tsx`, `lib/constants/periode.ts`, `lib/types/db.ts`, `types/next-auth.d.ts`.
- **Acuan:** `docs/PRD.md`, `docs/UX-DESIGN.md`, `db/schema.sql`, `.claude/hunian-team-context.md`.

## Verdict

**TAHAN — perbaiki paket HIGH-1 dulu, lalu fondasi layak lanjut.**

Fondasi sebenarnya solid (split-config benar, `server-only` benar, design system konsisten). Yang menahan hanyalah **satu klaster bug auth yang nyata dan deterministik** (HIGH-1). Setelah klaster itu beres, screen berikutnya boleh dibangun. HIGH-2 dari TL **dicabut** menjadi catatan arsitektur (bukan blocker), karena onboarding belum dibangun dan solusi yang benar tidak menyentuh kode fondasi.

| Severity | Jumlah | Catatan |
|---|---|---|
| HIGH (blocker) | 1 klaster (HIGH-1, mencakup 3 sub-fix) | Wajib sebelum bangun screen berikutnya |
| MED | 3 | Tidak memblokir; kerjakan beriringan |
| LOW | 8 | Polish sebelum beta/launch |
| DEFERRED (catatan arsitektur) | 1 (eks-HIGH-2) | Keputusan dikunci sekarang, implementasi di Slice berikutnya |
| FALSE-POSITIVE / dicabut | 1 (eks-MED-1) | Perilaku kode saat ini sudah memadai |

---

## HIGH — Blocker (wajib sebelum lanjut)

### HIGH-1 — Login bisa "berhasil" dengan user ID kosong (sesi broken senyap)

**File:** `auth.ts:13-37` (jwt), `auth.ts:39-45` (session), `auth.config.ts:17` (authorized), `db/schema.sql:54`.

**Masalah (rantai akar → gejala):**
1. **Akar deterministik — `email` null → langgar NOT NULL.** `auth.ts:20` mengirim `email: token.email` ke upsert. `db/schema.sql:54` = `email text UNIQUE NOT NULL`. Bila Google tidak meng-expose email (akun G-Suite dengan privacy ketat), `token.email` `undefined` → upsert error **100% deterministik** untuk user tersebut. Ini bukan sekadar kasus "DB down" berprobabilitas rendah.
2. **Kegagalan ditelan.** `auth.ts:32-34` hanya `console.error` lalu `return token` tanpa `uid`. Login tetap lanjut.
3. **Gejala.** `auth.ts:41` `session.user.id = (token.uid as string) ?? ""` → `""`. User "masuk" tapi tanpa UUID Supabase. Setiap insert berikutnya (`candidates.user_id = ''`) gagal FK → user berada di state "masuk tapi tak bisa apa-apa".
4. **Choke point gagal menahan.** `auth.config.ts:17` `authorized: ({ auth }) => !!auth?.user` bernilai *true* untuk sesi broken (`user` ada walau `id=""`) → middleware **tidak** memblokir.

**Kenapa berbahaya:** invisible failure, diagnostic nightmare, dan ini fondasi semua screen Slice 2.

**Rekomendasi (3 sub-fix — mekanisme final hasil sintesis, BUKAN `throw`):**

**(a) Guard `email` sebelum upsert** (`auth.ts`, dalam jwt callback):
```ts
if (account && profile?.sub) {
  if (!token.email) {
    console.error("[auth] token.email kosong, lewati upsert:", profile.sub);
    return token; // uid tak diset → akan ditahan middleware (lihat sub-fix b)
  }
  // ...upsert seperti semula...
}
```

**(b) Perketat choke point middleware — DAN pindahkan `session` callback ke edge config.**
> Nuansa penting (hasil verifikasi Orchestrator): cukup mengubah `authorized` jadi `!!(auth?.user?.id)` **tidak memadai**. `session` callback yang memetakan `token.uid → session.user.id` saat ini hanya ada di `auth.ts` (Node), tidak di `auth.config.ts` (edge) yang dipakai `middleware.ts`. Tanpa pemetaan itu di edge, `auth.user.id` `undefined` untuk SEMUA user → bisa memblokir semua orang. Karena `session` callback murni mapping token (tanpa DB), ia **edge-safe** dan boleh dipindah ke `auth.config.ts`.

```ts
// auth.config.ts — tambahkan session callback (edge-safe, tanpa DB)
callbacks: {
  authorized({ auth }) {
    return !!auth?.user?.id;           // tolak sesi broken (id kosong)
  },
  session({ session, token }) {
    if (session.user) {
      session.user.id = (token.uid as string | undefined) ?? "";
      session.user.googleSub = (token.googleSub as string | undefined) ?? "";
    }
    return session;
  },
},
```
`auth.ts` cukup menyebar `...authConfig.callbacks` lalu meng-override **hanya** `jwt` (yang butuh DB). Hapus duplikasi `session` di `auth.ts` agar single-source.

**(c) (Opsional, MED) feedback error ke user** — alih-alih hanya `console.error`, arahkan ke `/login?error=db` dengan copy actionable, agar kegagalan terlihat (lihat MED-NEW-1).

**Tradeoff yang disadari (kenapa BUKAN `throw` di jwt callback — usul awal TL):**
- **Dipilih:** guard + perketat middleware. **Alternatif ditolak — `throw` di jwt callback:** NextAuth v5 menangkapnya jadi redirect ke `/api/auth/error?error=JWTCallbackError` (halaman generik, tanpa copy/retry bermakna) dan **bisa terpicu juga saat token refresh** (bukan hanya initial sign-in) → user aktif tiba-tiba kena error page di tengah sesi. Untuk pilot user-dikenal, UX itu lebih merusak daripada redirect bersih ke `/login`.
- **Tradeoff yang diterima:** dengan guard-only, saat Supabase benar-benar down, user "login" lalu dipantulkan middleware kembali ke `/login` (tanpa uid) — bisa terasa seperti loop lembut, tapi *terlihat* (mentok di login), jauh lebih baik daripada dashboard rusak senyap. Sub-fix (c) menutup celah visibilitas ini.

---

## MEDIUM (tidak memblokir; kerjakan beriringan)

### MED-NEW-1 — Tidak ada feedback ke user saat login/upsert gagal
**File:** `auth.ts:32-34`. Hanya `console.error`; user tak tahu apa yang terjadi. Untuk pilot dengan user test nyata ini menyulitkan debugging. **Rekomendasi:** simpan error state dan tampilkan pesan actionable di `/login` (mis. query `?error=db`). Menyatu dengan HIGH-1(c).

### MED-2 — `focus-visible` hilang di tombol interaktif (NFR-9 / WCAG 2.4.7)
**File:** `app/page.tsx` (nav button ~baris 77, hero CTA ~baris 105), `app/login/page.tsx` (~baris 29). Tailwind Preflight menghapus outline default; tanpa `focus-visible:ring`, navigasi keyboard tak terlihat. **Rekomendasi:** tambahkan `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2` ke setiap kontrol (atau utility `@layer components`). *Dipertahankan di MED (bukan LOW seperti usul DA): NFR-9 eksplisit dan perbaikannya murah.*

### MED-4 — `types/next-auth.d.ts:6` mendeklarasikan `id: string` padahal bisa `""`
**File:** `types/next-auth.d.ts:6-7` vs `auth.ts:41`. Type "berbohong" → caller percaya selalu UUID valid. **Rekomendasi:** ubah ke `id: string | undefined` (memaksa caller meng-handle missing case) ATAU — bila HIGH-1 beres dan choke point menjamin sesi valid selalu punya `id` — pertahankan `string` secara jujur. *Severity diturunkan dari penilaian awal: ini gejala HIGH-1, fix menyusul HIGH-1.*

---

## LOW (polish sebelum beta/launch)

- **LOW-NEW-1 — `trustHost: true` (`auth.config.ts:7`).** Mempercayai header `Host` untuk base URL. Aman untuk pilot di Vercel, tapi sebelum scale/proxy kustom set `AUTH_URL`/`NEXTAUTH_URL` eksplisit untuk hindari risiko host-header.
- **LOW-1 — `app/page.tsx` footer "Slice 1 — Kontrakan".** Bahasa milestone internal ter-render ke user. Ganti `© 2026 Hunian` / hapus sebelum go-live.
- **LOW-2 — `next.config.mjs` `remotePatterns`.** Belum ada `lh3.googleusercontent.com` (host avatar Google `users.avatar_url`). Tambahkan sebelum avatar dipakai via `next/image`, jika tidak `<Image>` akan error domain.
- **LOW-3 — Duplikasi `antialiased`.** `app/layout.tsx:25` (class Tailwind) + `app/globals.css:27` (`-webkit-font-smoothing`). Hapus salah satu.
- **LOW-4 — Metadata minim.** `app/layout.tsx:12-16` tanpa `openGraph`/`twitter` → tak ada preview saat link dibagikan ke WhatsApp. Tambahkan sebelum launch.
- **LOW-5 — `components/motion/motion.tsx` `Stagger` tak menghormati reduced-motion.** `StaggerItem` sudah menghapus translate, tapi timing stagger pada `Stagger` tetap jalan. **PERLU VERIFIKASI preferensi:** bila timing dianggap motion, panggil `useReducedMotion()` dan netralkan `containerVariants`.
- **LOW-6 — Ikon/emoji dekoratif tanpa `aria-hidden`.** `app/page.tsx` (✓ value props ~182, ✓ list ~277, 3 dot window ~289-292). Tambahkan `aria-hidden="true"`.
- **LOW-7 — `AUTH_SECRET` dev predictable.** `.env.local` = `hunian-secret-key-change-in-production`; bila ter-deploy apa adanya, JWT bisa dipalsukan. Tambahkan guard di `next.config.mjs` yang `throw` bila nilai dev terdeteksi di production, dan dokumentasikan `openssl rand -base64 32` di `.env.example`.
- **LOW-8 — Kontradiksi dokumentasi (bukan bug kode).** `docs/UX-DESIGN.md` A.1 ("tidak ada /login terpisah") vs OVERRIDE Faisal ("landing terpisah"). Kode mengikuti OVERRIDE (benar). Update A.1/A.4 agar konsisten.
- **LOW-MED-3 — Tabel Compare di landing tanpa `<caption>`/`scope`/`<th>`** (`app/page.tsx` ~295-353). *Diturunkan ke LOW: ini tabel marketing dekoratif di landing, bukan fitur Compare aplikasi yang sesungguhnya.* Tetap perbaiki: `aria-label` pada `<table>`, `scope="col"` pada header kolom, `<th scope="row">` pada label baris.

---

## DEFERRED — Catatan arsitektur (eks-HIGH-2, DICABUT sebagai blocker)

### Gate `onboarding_completed` — JANGAN simpan flag di JWT
**Status:** bukan defect kode saat ini (route `/onboarding` & screen-nya belum dibangun). Disepakati TL+DA: **dicabut dari blocker**, tapi keputusan dikunci sekarang untuk cegah rework.

**Keputusan mengikat:** saat membangun `/kandidat` (Slice berikutnya), terapkan gate di **server component** (`redirect('/onboarding')` setelah baca DB), **BUKAN** flag di JWT.

**Tradeoff:**
- **Ditolak — Opsi A (flag `onboarding_completed` di JWT):** JWT stateless; setelah user menyelesaikan onboarding, token lama tetap `false` sampai expire/rotate (default ~30 hari) → middleware terus memantulkan ke onboarding → user stuck. Staleness ini cacat konsep, bukan detail kecil.
- **Dipilih — Opsi B (guard di server component + query DB):** selalu fresh, dan **tak menyentuh kode fondasi** sama sekali. Tradeoff: 1 query DB ringan per load `/kandidat` (dapat dioptimasi nanti dengan cache), diterima demi korektnes.

---

## FALSE-POSITIVE — Dicabut

### eks-MED-1 — "Landing tak auto-redirect user login"
**Dicabut.** UX-DESIGN A.2 menyebut auto-redirect `/` → `/kandidat`, tapi OVERRIDE Faisal menjadikan landing **halaman publik kaya yang terpisah**; returning user sah ingin melihatnya/membagikannya (pola Airbnb/Booking: homepage tidak memaksa redirect). Kode saat ini sudah mengambil jalan tengah yang tepat — **conditional CTA** ("Buka aplikasi" untuk user login) tanpa redirect paksa. **Tindakan:** tidak ada perubahan kode; cukup rekonsiliasi spec UX-DESIGN A.2 (digabung ke LOW-8).

---

## Verifikasi positif (jangan diubah tanpa alasan)

- `lib/supabase/server.ts:1` — `import "server-only"` benar; service-role tak bisa bocor ke bundle client. `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` memang publik by design Supabase. Env guard `throw` saat kosong = baik.
- **Split-config benar:** `auth.config.ts` edge-safe (tanpa DB) untuk middleware; `auth.ts` (Node) untuk jwt+DB. Sesuai pola NextAuth v5. *(Catatan HIGH-1(b): `session` callback sebaiknya ikut ke edge config — tetap edge-safe.)*
- `components/motion/motion.tsx:1` — `"use client"` benar; Framer Motion terpisah dari server component.
- `middleware.ts` matcher = allowlist route protected (`/kandidat`,`/onboarding`,`/bandingkan`,`/pengaturan`,`/input`,`/review`); `/`, `/login`, `/api/auth/*` publik — benar.
- `lib/constants/periode.ts` — single-source periode selaras CHECK `db/schema.sql` (`'bulan','3bulan','6bulan','tahun'`).
- `lib/types/db.ts` — enum konsisten dengan `db/schema.sql`.
- `app/login/page.tsx:6-7` — guard redirect untuk user yang sudah login sudah ada.
- Design system konsisten: teal-700 (#0F766E), Plus Jakarta Sans, stone-50 selaras `tailwind.config.ts`/`globals.css`/UX-DESIGN.
- `tsconfig.json` `strict: true`, alias `@/*`; `next.config.mjs` `reactStrictMode: true`.

---

## Siap lanjut bangun screen berikutnya?

**Belum — kerjakan paket HIGH-1 dulu** (3 sub-fix: guard `email` null; perketat `authorized()` + pindahkan `session` callback ke edge config; opsional feedback error login). Effort kecil (~½ hari) tapi memblokir karena ini fondasi semua screen Slice 2.

**Setelah HIGH-1 beres:** lanjutkan urutan build (onboarding → input → review → kandidat → skor → compare → settings). Saat membangun `/kandidat`, terapkan gate onboarding via **server component** (catatan DEFERRED), bukan JWT. MED & LOW dikerjakan beriringan; LOW-7 (`AUTH_SECRET`) wajib sebelum deploy.
