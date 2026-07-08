# Browser Extension untuk Capture Listing

<!--
  Di-generate oleh Orchestrator setelah sesi debat 2026-07-01.
  Edit hanya section bertanda [FAISAL UPDATE].
-->

## Status

```
[ ] Backlog       — identified, belum dijadwalkan
[x] In Discussion — sedang didebat agent team (verdict keluar, menunggu konfirmasi Faisal)
[ ] Approved      — Product Owner approved, siap dibangun
[ ] In Progress   — sedang dibangun
[ ] Done          — selesai dan shipped
[ ] Rejected      — tidak akan dibangun, dengan alasan
```

**Current status:** `[ ] In Discussion` — Extension: **NO-GO / park pasca-PMF**. Alternatif PWA Web Share Target: **DEFER bersyarat** (gate riset).
**Last updated:** 2026-07-01
**Session:** `sessions/2026-07-01-hunian-browser-extension.md`
**Confidence:** MEDIUM-HIGH (extension NO-GO) · LOW-MEDIUM (Share Target — sengaja bersyarat, data device-split belum ada)

---

## Deskripsi Singkat

> Browser extension (Chrome) yang menangkap teks listing langsung dari halaman yang sedang dilihat user (OLX, FB Marketplace, situs properti) supaya tidak perlu copy-paste manual ke web app Hunian. Ide dari Faisal (owner).

---

## Deskripsi Lengkap

### Apa fitur ini?

Ide asli: Hunian tidak hanya web app, tapi juga punya browser extension. Bentuk yang paling masuk akal = extension yang membantu user "menangkap" listing dari halaman sumber (OLX, Facebook Marketplace, Mamikos, situs properti) tanpa harus select-copy → pindah tab → paste ke Hunian. Varian yang muncul di debat: one-click capture teks halaman, quick-add ke shortlist, dan overlay skor di halaman listing.

Verdict tim: bentuk apa pun dari extension **tidak dibangun sekarang**. Yang benar-benar mewujudkan semangat ide ("tangkap listing dari mana pun tanpa mengetik ulang") dengan biaya jauh lebih murah adalah **PWA Web Share Target** — user share listing dari app HP (share sheet Android) langsung ke Hunian, memakai pipeline paste/extract yang sudah ada. Itu pun ditahan sampai satu riset kecil membuktikan ada demand-nya.

### Siapa yang paling diuntungkan?

- **Primary:** pencari hunian yang mengumpulkan listing dari banyak sumber. Namun mayoritas sumber = WhatsApp japri broker (mobile), bukan halaman web desktop — sehingga audiens extension desktop diperkirakan sempit.
- **Secondary (hipotesis, belum tervalidasi):** young professional yang browsing OLX/Rumah123 dari laptop kantor pada fase "riset awal" sebelum masuk fase closing di WA.

### Di stage mana user journey ini terjadi?

```
discover → [STAGE INI: capture/shortlist] → compare → negotiate → decide → move in
```

Extension menyentuh ujung paling atas funnel (capture). Drop-off HIGH yang sudah teramati justru ada di tengah–bawah funnel (dead-zone survei fisik), bukan di capture.

---

## Kenapa Fitur Ini (Tidak) Dibangun

### Alasan dari debat

Empat agent (UX, PM, STR, TL) konvergen ke NO-GO/DEFER, lalu Devil's Advocate menantang konvergensi itu (mencegah groupthink), dan Synthesizer mengambil posisi. Argumen penentu:

- **STR — moat salah tempat + risiko ToS:** moat Hunian ada di data nego/all-in **pasca-keputusan** (yang Mamikos tak bisa kumpulkan karena conflict-of-interest struktural), bukan di kecepatan capture listing pra-keputusan yang sudah publik. Scraping FB Marketplace melanggar ToS Meta dan bisa mem-flag/lock akun FB pribadi user — liability fatal untuk produk berbasis trust, dikelola solo dev.
- **PM — opportunity cost:** effort extension (6–9 hari, opsi paling ramping) setara satu slice penuh dan head-to-head dengan **S2-2 survey fisik** (prioritas #1, satu-satunya fase Slice 2 yang menambah kualitas keputusan). Extension = acquisition surface, bukan cycle completion (north star).
- **TL — auth berduri:** cookie NextAuth `SameSite=Lax` tidak terkirim pada request cross-site dari content script. Opsi token-auth (permukaan auth kedua, liability token bocor di `chrome.storage`) **ditolak keras**; `SameSite=None` **ditolak** (melemahkan CSRF global). Yang tersisa = tab-handoff (6–9 hari) atau, jauh lebih murah, PWA Web Share Target (~2 hari, same-origin, nol perubahan auth).
- **UX — friction capture rendah-sedang:** copy-paste sudah muscle-memory user Indonesia; belum ada satu user pun mengeluh capture susah (asumsi founder, bukan observasi). Sumber listing dominan = WA japri di **mobile**, di luar jangkauan extension Chrome desktop.
- **DA — koreksi jujur:** fondasi "WA-mobile dominan" yang dipakai 4 agent **belum divalidasi dengan angka** — menolak asumsi Faisal dengan asumsi tim sendiri. Karena itu keputusan Share Target **ditahan** sampai riset 15 menit dijalankan. Steelman untuk extension (fase browsing desktop malam hari beda dari fase closing WA) sah secara logika, tapi kalah oleh drop-off konkret yang sudah teramati di survei fisik.

### Pain point yang di-solve

- Friksi copy-paste sumber → Hunian — severity: **LOW–MEDIUM** (bukan HIGH; sudah muscle-memory).
- (Yang sebenarnya lebih genting, tapi bukan yang di-solve extension) dead-zone survei fisik — severity: **HIGH**, ditangani oleh S2-2.

### Market gap yang diisi

Tidak ada gap kompetitif nyata yang extension isi. Chrome Web Store bukan channel discovery untuk tool vertikal niche seperti ini — orang install karena sudah tahu Hunian, bukan sebaliknya. Diferensiasi Hunian (decision tool netral demand-side) tidak diperkuat oleh extension; malah ada gravitasi scope-creep ke arah aggregator (crawling) yang justru ingin dihindari.

---

## Tradeoff yang Disadari

### Keputusan yang diambil

| Keputusan | Dipilih | Tidak dipilih | Alasan |
|---|---|---|---|
| Bangun extension sekarang? | **Tidak (park pasca-PMF)** | Full build extension; token-auth extension | Effort setara 1 slice head-to-head dengan S2-2; risiko ToS/lock-akun; token-auth = liability keamanan baru |
| Cara capture cross-origin (jika extension) | Tab-handoff (Opsi A) | Token-auth (Opsi B); `SameSite=None` | B = permukaan auth kedua + token bisa bocor; `SameSite=None` melemahkan CSRF global |
| Alternatif murah untuk semangat ide | **PWA Web Share Target (~2 hari)** | Bookmarklet; build langsung tanpa riset | Bookmarklet tipis & tak discoverable; build-tanpa-riset ditolak karena confidence LOW-MEDIUM |
| Kapan putuskan Share Target | Setelah riset 15 menit (gate) | Putuskan sekarang | Biaya verifikasi 15 menit << biaya build 2 hari; solo dev pre-PMF tak punya slack |

### Yang kita korbankan

Kita korbankan potensi menangkap "momen browsing desktop" (jika perilaku itu nyata dan bervolume) demi menjaga fokus solo-dev penuh pada S2-2 dan menjaga complexity budget (tidak menambah codebase + auth surface kedua). Kita memilih menuntaskan depth keputusan (survey fisik) meskipun kehilangan sedikit kenyamanan akuisisi, karena survival pre-PMF = 1 siklus penuh tervalidasi, bukan optimasi funnel atas.

### Yang akan jadi masalah kalau asumsi ini salah

Asumsi terbesar (dari DA): **"sumber listing dominan = WA-mobile"** — belum ada data. Jika ternyata porsi non-WA / desktop besar (≥30%), maka:
- Verdict extension NO-GO tetap aman (berdiri di atas moat/effort/ToS, bukan asumsi funnel), TAPI
- Share Target naik jadi layak dibangun. Gap tambahan: **Web Share Target tidak didukung iOS Safari** — jika basis iOS signifikan, Share Target saja tidak cukup, perlu fallback (bookmarklet / tetap copy-paste).

---

## Technical Approach

**Feasibility:** ⚠️ Feasible with caveats (extension feasible tapi berduri di auth; Share Target feasible & murah)

**Stack yang digunakan:**
- Jika Share Target: `app/manifest.ts` (sudah ada) + `share_target` config + route baru `/share` (POST title/text/url) → reuse pipeline ekstraksi existing. Same-origin, memakai session cookie NextAuth yang sudah aktif.
- Jika extension (nanti): Chrome Manifest V3 + content script "dumb capture" (`window.getSelection()` / `innerText`, BUKAN scraper selector per situs) + tab-handoff ke `hunian.app/capture`.

**Opsi implementasi yang dipertimbangkan:**

| Opsi | Pros | Cons | Dipilih? |
|---|---|---|---|
| C — PWA Web Share Target | ~2 hari, same-origin, nol ubah auth, cocok Android mobile-first, reversibility HIGH | Tak didukung iOS Safari | ✅ Kandidat utama (DEFER bersyarat) |
| A — Extension tab-handoff | Nol perubahan auth (tab first-party) | ~6–9 hari, UX "lompat tab", Chrome Web Store review di luar kontrol | ❌ Tidak sekarang (park) |
| B — Extension token-auth | UX seamless | ~10–14 hari, permukaan auth kedua, token bisa bocor dari `chrome.storage` | ❌ Ditolak keras |
| D — Bookmarklet | ~0.5 hari, cross-browser | Value tipis di atas copy-paste, tak discoverable | ❌ Bukan prioritas (fallback opsional) |
| `SameSite=None` cookie | Extension bisa fetch langsung | Melemahkan CSRF posture seluruh app | ❌ Ditolak keras |

**Effort estimate:** Extension 6–9 hari (Opsi A) · Share Target ~2 hari · Bookmarklet ~0.5 hari.
**Reversibility:** Share Target **HIGH** (config + 1 route, cabut tanpa jejak). Extension **MEDIUM** (sudah live di Store susah dicabut; user terlanjur install).

**Risiko teknikal:**
- Web Share Target tak didukung iOS Safari — mitigasi: jika riset tunjukkan basis iOS signifikan, sediakan fallback bookmarklet / tetap copy-paste.
- `SameSite=Lax` menghalangi cookie cross-site untuk extension — mitigasi: pakai tab-handoff (Opsi A), jangan revisit `SameSite=None`.
- DOM brittle situs pihak ketiga — mitigasi: pendekatan "dumb capture" (selection/page text, AI yang normalisasi), jangan bangun scraper selector per situs.
- Route `/share` harus tetap patuh pola streaming/Suspense (NFR-11) — jangan fetch-blocking di `page.tsx`.

---

## Product Owner Notes

**Vision alignment:** ✅ ALIGNED (verdict tidak melanggar prinsip inti)

Verdict NO-GO ini dicek terhadap prinsip inti dan tidak melanggar satu pun: tidak menyentuh "AI mengurangi ketik, bukan ambil keputusan" (ini soal entry point/distribusi, bukan AI mulai men-judge — overlay skor otomatis yang berisiko melanggar prinsip justru sudah ditolak UX); tidak menggeser Hunian ke aggregator; justru **menjaga** dua batasan yang Faisal sendiri tetapkan (S2-2 prioritas #1; complexity budget solo-dev). Tim tidak menolak ide bos sembarangan — penolakan berbasis constraint milik Faisal sendiri, dan ide **tidak dibuang** (di-park + ada jalur murah Share Target).

Status ditahan (PENDING) karena: (1) ini ide Faisal yang di-NO-GO-kan tim → wajib dikonfirmasi langsung, bukan ditutup diam-diam; (2) confidence Share Target LOW-MEDIUM (butuh data device-split).

**Konfirmasi dari Faisal:** PENDING
**Tanggal konfirmasi:** —

---

## Open Questions

1. Berapa % sumber listing user riil = WA-mobile vs channel lain (OLX/FB/Rumah123 desktop)? — validasi: riset 15 menit, chat/telepon 3–5 pilot ("listing terakhir dari mana, waktu itu pakai HP atau laptop?") — deadline: 2026-07-02.
2. Apakah basis user iOS signifikan (menentukan cukup-tidaknya Share Target)? — validasi: analytics device/OS PWA existing, atau ditanyakan di riset pilot yang sama.
3. Apakah fase "browsing multi-tab desktop malam hari" (steelman DA) perilaku nyata & bervolume, bukan hipotesis? — validasi: pertanyaan tambahan di riset pilot ("biasanya cari-cari listing di mana dulu sebelum WA broker?").

---

## Next Actions

- [ ] Jalankan riset 15 menit (3–5 pilot, 3 pertanyaan di atas) — owner: **Faisal** — by: 2026-07-02 (sebelum lanjut S2-2 lebih dalam; bisa paralel, tidak ganggu S2-2)
- [ ] Jika ≥70% WA-mobile → dokumentasikan extension & Share Target sebagai "shelved, revisit post-PMF", lanjut 100% S2-2 — owner: Faisal/dev — by: 2026-07-02 (setelah riset)
- [ ] Jika non-WA ≥30% → alokasikan slot ~2 hari untuk Share Target (Opsi C) **setelah** milestone S2-2 tercapai (bukan menyela di tengah) — owner: Faisal (solo dev) — by: setelah milestone S2-2
- [ ] Extension: tidak ada aksi build; catat sebagai ide di-park dengan revisit trigger — owner: PM/Faisal — by: sekarang (dokumentasi)

---

## Catatan Faisal

<!-- [FAISAL UPDATE] Tambahkan catatan, feedback, atau keputusan pribadi di sini.
     Q1: Setuju park browser extension sampai pasca-PMF? (Kalau ada alasan spesifik extension penting SEKARANG, share — akan dibawa balik ke Synthesizer.)
     Q2: Riset 15 menit ke 3-5 pilot — jalan paralel sekarang, atau tunggu S2-2 kelar?
     Default jika tak ada respon 3 hari kerja: extension park; riset jalan paralel; Share Target dieksekusi (bila threshold terpenuhi) setelah S2-2 selesai. -->

---

## Riwayat

| Tanggal | Event | Catatan |
|---|---|---|
| 2026-07-01 | Feature identified (ide Faisal) | Session: `sessions/2026-07-01-hunian-browser-extension.md` |
| 2026-07-01 | Debat selesai (PM·UX·STR·TL·DA·SYN·PO, 1 round) | Extension NO-GO/park; Share Target DEFER bersyarat. Confidence: MED-HIGH / LOW-MED |
| 2026-07-01 | PO verdict | PENDING CONFIRMATION — 2 gate ke Faisal (Q1 park extension, Q2 timing riset) |
