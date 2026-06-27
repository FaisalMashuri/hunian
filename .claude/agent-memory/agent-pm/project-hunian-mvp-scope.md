---
name: hunian-mvp-scope
description: Keputusan scope MVP Hunian v1.0 — apa yang masuk, apa yang dipotong, dan urutan 3 slice
metadata:
  type: project
---

MVP Hunian v1.0 ditetapkan terlalu lebar untuk solo builder (Faisal). Keputusan scope per 2026-06-26:

**Yang DIPOTONG dari MVP asli:**
- Property Timeline — transparency feature, zero impact ke completion rate
- Harga Asli vs Akhir — negosiasi belum terjadi di cycle pertama; pakai 1 field harga
- Survey quick tags — 48 UI element untuk granularitas yang belum terbukti dibutuhkan; pakai star rating only
- Progressive Clarification — state machine tambahan; masuk Slice 2
- Form Apartemen + Kost — expansion play; masuk Slice 3

**Thinnest Viable Cycle (Slice 1):**
Onboarding 3 step (Budget + Lokasi + Prioritas) → Copy-paste input → AI Extraction → Property Review (Kontrakan/Rumah only) → Scoring 3D (Harga 40%, Lokasi 35%, Fasilitas 25%) → Survey 5 bintang only → Compare basic → Pilih.

**Urutan slice:**
- Slice 1: Prove completion — Kontrakan/Rumah + copy-paste + scoring 3D + survey bintang
- Slice 2: Reduce friction — form manual + deal breaker + quick tags + AI explanation + harga asli/akhir
- Slice 3: Expand market — Apartemen + Kost + Timeline + deadline + progressive clarification

**North star metric:** cycle completion rate — % user aktif yang menyelesaikan dari input kandidat pertama → memilih satu. Target 60%.

**Why:** Faisal adalah solo builder dengan runway terbatas. MVP spec asli mencakup 3 form type + survey tags + timeline + 2 price fields + progressive clarification sekaligus — terlalu lebar untuk divalidasi dalam waktu singkat.

**How to apply:** Saat ada request fitur baru, anchor ke "apakah ini Slice 1 atau bisa ditunda?" Prioritas tajam: completion rate dulu, enrichment kemudian. [[hunian-faisal-context]]
