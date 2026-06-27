---
name: project-hunian-mvp-context
description: Core product and builder context for Hunian MVP — website-first housing decision tool, solo/small team, budget-conscious
metadata:
  type: project
---

Hunian MVP adalah website (bukan native app untuk tahap ini) untuk membantu user membandingkan dan memutuskan hunian sewa. Flow: Onboarding 5 step → Input property (copy-paste / manual form) → AI extraction+normalization → Property Review → Rule-based scoring 5 dimensi → Survey → Compare (trade-off forward).

Builder: Faisal — solo developer atau tim sangat kecil. Prioritas: time-to-ship, budget hemat.

**Why:** MVP membuktikan satu metric: cycle completion rate (berapa % user aktif selesai dari input kandidat pertama sampai pilih satu). Target: 60%+ complete rate = PMF signal.

**How to apply:** Selalu pertimbangkan complexity budget yang sangat terbatas. Setiap keputusan harus bisa dibangun solo, cepat, dan tidak over-engineer. Prefer fake/hardcode dulu untuk komponen non-critical.

Tiga tugas AI di MVP (bukan scoring — itu rule-based):
1. Extraction: teks bebas → JSON terstruktur
2. Normalization: standarisasi format tidak konsisten
3. Explanation: bahasa natural dari score yang sudah dihitung rule

Yang NOT in MVP: AI scoring, GIS/flood risk, multi-user, URL auto-parsing.

[[project-hunian-t004-decisions]]
