---
name: project-slice1-ux-challenges
description: Tantangan Devil's Advocate terhadap spec UI/UX Slice 1 Hunian (2026-06-26) — 7 tantangan dengan kondisi pencabutan
metadata:
  type: project
---

Review spec Slice 1 menghasilkan 7 tantangan utama dengan 3 tantangan HIGH severity yang harus dijawab sebelum kode ditulis.

**Why:** Spec UI/UX Slice 1 memiliki asumsi kritis yang belum divalidasi yang langsung mempengaruhi KPI cycle completion (target 60%).

**Tiga tantangan HIGH yang BLOCKING sebelum development:**

1. **Onboarding 4-step friction** — step mana yang bisa ditunda tanpa merusak scoring? PM perlu tentukan: Prioritas dan Deal Breaker bisa ditunda ke post-first-kandidat. Kondisi pencabutan: pilot test completion rate onboarding >80%, ATAU bukti bahwa scoring tidak bisa parsial.

2. **Copy-paste multi-listing + akurasi real WA** — extraction 92.7% hanya pada data sintetis. Gate >85% belum diuji pada teks WA nyata. Behavior multi-listing dalam satu paste belum terdefinisi. Kondisi pencabutan: test 20+ teks WA nyata dengan akurasi >85%, DAN definisi eksplisit behavior multi-listing.

3. **KM manual + NULL score_lokasi** — jika user skip jarak (high friction), score_lokasi NULL di semua kandidat, Compare hero feature kehilangan 1 dari 3 dimensi. Trade-off cards tidak bisa menghitung selisih jarak. Kondisi pencabutan: formula score_total ketika dimensi NULL terdefinisi, DAN trade-off card fallback text terdefinisi.

**Tantangan MEDIUM yang perlu spec update (tidak blocking):**

4. Compare density — horizontal scroll 3 kolom di 360px viewport belum divalidasi; referensi trade-off cards untuk 3+ kandidat tidak terdefinisi.

5. Empty/error states yang terlupakan: (a) all-amber review state, (b) score parsial di Compare, (c) placeholder apartemen di wireframe Layar 5, (d) referensi NFR-10/FR-LP-1 orphan, (e) definisi cycle completion saat kandidat pilihan berubah jadi "Tersewa."

6. Trust problem ✓ hijau — confidence ≥0.7 tidak berarti data benar, tapi user memperlakukan ✓ sebagai "benar." Fix: copy change saja, zero engineering cost.

7. Dead zone D+7 tanpa return trigger — tidak ada push notification di Slice 1, user yang sudah deal via WA tidak kembali ke app untuk tap "Pilih." KPI definition perlu klarifikasi atau perlu minimal 1 re-engagement mechanism.

**How to apply:** Gunakan sebagai checklist saat Orchestrator mengumpulkan response dari agen lain untuk memastikan tantangan HIGH sudah dijawab sebelum TL masuk development.

[[project-mvp-scope-decisions]]
