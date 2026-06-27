---
name: t002-drop-off-analysis
description: T-002 UX analysis — titik drop-off berbahaya di flow Hunian MVP dan implikasi sequencing untuk cycle completion rate 60%
metadata:
  type: project
---

MVP metric utama: cycle completion rate = % user aktif yang selesaikan siklus dari input kandidat pertama → memilih satu. Target 60%.

Tiga titik drop-off berbahaya yang teridentifikasi (per analisis T-002, 2026-06-26):

**DROP-OFF A — Onboarding 5 step sebelum time-to-first-value (SEVERITY: HIGH)**
User belum lihat satu pun output Hunian setelah selesai onboarding. Mental model user: "coba dulu, baru setup." Hunian membalik urutan ini. Rekomendasi: pangkas ke 2 field wajib di awal (budget + lokasi), defer step 3-5 ke setelah input kandidat pertama.

**DROP-OFF B — Jeda survei fisik = dead zone 3-10 hari (SEVERITY: HIGH)**
Antara input kandidat dan status "Sudah Disurvey" ada jeda real. Tidak ada engagement hook. User yang deal di luar app tidak kembali untuk lapor ke Hunian → siklus putus. Butuh diary study untuk ukur berapa hari rata-rata gap ini di Indonesia.

**DROP-OFF C — Compare tidak bermakna dengan <3 kandidat (SEVERITY: MEDIUM)**
Hero feature hanya punya nilai di 3+ kandidat. User yang input <3 tidak pernah lihat Compare bekerja. Edge case: user dengan opsi terbatas (budget sangat ketat, area sempit) tidak punya journey di flow ini.

**Sequencing decision:**
- Pangkas onboarding ke 2 field di awal → defer deal breaker + prioritas ke sebelum compare pertama
- Minimum viable compare = 3 kandidat, flow harus encourage ke angka ini
- Tradeoff: verdict awal akan partial — harus dikomunikasikan ke user

**Why:** Ketiganya bisa membuat completion rate <60% terlepas dari fitur lengkap.
**How to apply:** Setiap diskusi tentang onboarding flow atau sequencing fitur harus mempertimbangkan tiga drop-off ini. [[mvp-metric-cycle-completion]]
