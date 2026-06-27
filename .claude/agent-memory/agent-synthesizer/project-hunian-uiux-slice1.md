---
name: project-hunian-uiux-slice1
description: Key design decisions from UI/UX Slice 1 synthesis session 2026-06-26 — scoring formula, onboarding, extraction gate
metadata:
  type: project
---

Sesi desain UI/UX Slice 1 selesai 2026-06-26. Verdict: GO untuk UX-DESIGN.md dengan 2 syarat (lihat open questions).

**Keputusan yang sudah dikunci tim:**
- 8 layar final: Login → Onboarding 4-step → Input → Property Review → Daftar Kandidat → Skor+AI → Compare → Settings
- Bottom nav 3 tab + FAB. Plus Jakarta Sans + teal-700. 21 shadcn + 8 custom components.
- Onboarding: Step 1 (Budget) + Step 2 (Tujuan+Transport) = WAJIB. Step 3 (Prioritas) + Step 4 (Deal Breaker) = SKIPPABLE
  - Step 3 skip → equal-weight defaults (34%/33%/33% Harga/Lokasi/Fasilitas), simpan bobot_source = "default-equal"
  - Microcopy skip: "Gunakan bobot sama — bisa diubah di Settings kapan saja"
  - PENDING: Faisal harus konfirmasi equal-weight defaults acceptable [F1]
- Multi-listing dalam 1 paste: extract FIRST only + info banner (bukan error, bukan block)
- scoring_version field per kandidat: "v1-3D" | "v1-2D" | "v1-1D"
- bobot_source field per user profile: "user-defined" | "default-equal"
- Score NULL renormalisasi: jika score_lokasi NULL → renormalisasi sisa bobot (w_harga + w_fasilitas = total)
- AI explanation: session-cache (React state), regen tiap session baru. Invalidate jika bobot berubah di session yang sama.
- Max Compare: 3 kandidat, sticky col 100px, min column 120px, horizontal scroll

**Gate akurasi extraction:**
- Target >85% pada 20+ WA nyata (bukan sintetis) — SEBELUM beta launch, bukan sebelum build
- Jika <85%: fallback manual jadi primary flow

**Open questions (human gate Faisal):**
- [F1] Prioritas step: skippable dengan equal-weight defaults, atau mandatory?
- [F2] scoring_version field: expose ke user atau internal saja?
- [F3] Timeline test 20+ WA nyata — kapan, siapa yang jalankan?

**Pending fixes sebelum UX-DESIGN.md final:**
- Remove scope leak "Apartemen" di wireframe Layar 5 → ganti "Kontrakan"
- Remove/define orphan NFR-10 dan FR-LP-1
- Update trust copy ✓ → "kepercayaan tinggi" + tooltip disclaimer

**Why:** Scoring renormalisasi dipilih atas NULL=50 atau zero-out karena tidak menciptakan signal palsu. Equal-weight defaults dipilih atas mandatory Prioritas karena completion onboarding > akurasi scoring di tahap pilot.

**How to apply:** Jika diskusi menyentuh scoring formula, bobot, atau onboarding steps — cek keputusan ini dulu sebelum memberikan saran baru. scoring_version dan bobot_source adalah field wajib di schema.

[[project-hunian-mvp]]
[[project-hunian-stack]]
