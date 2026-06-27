---
name: project-hunian-t004-decisions
description: T-004 tech stack decisions locked for Hunian MVP — AI model, geocoding, styling, slice order, sticky vs fakeable
metadata:
  type: project
---

Tech stack decisions finalized in T-004 (2026-06-26):

**AI Extraction:** GPT-4o mini — chosen for battle-tested JSON structured output (`response_format: json_object`) reliability for Indonesian informal text. Cost negligible (~$0.0001/extraction). Haiku 3.5 rejected (5x more expensive, no concrete advantage for this task). Gemini Flash rejected (structured output for Indonesian text less battle-tested).

**Geocoding + Distance Matrix:** Google Maps Platform — chosen for superior Indonesia coverage (named apartments, perumahan, landmarks). Nominatim/OSRM rejected (rate limit, inconsistent Indonesia coverage, no transit data). Mapbox rejected (no Indonesia transit data). Cache all results per-property, not per-view. Jakarta transit (Transjakarta, MRT, KRL) reliable; other cities may not be — flag to user.

**Styling:** Tailwind CSS + shadcn/ui — copy-paste components, no npm lock-in.

**Sticky decisions (must get right from day 1):**
- Supabase schema + RLS policies (painful to migrate retroactively)
- Supabase Auth + user identity (all RLS depends on this; require login before add property)
- Score formula versioning — add `schema_version` field from the start
- AI output JSON schema must match DB schema before S3 (scoring) is built

**Safely fakeable for MVP validation:**
- Distance matrix (S4): replace with manual "Estimasi jarak ke kantor (km)" field initially. Scoring for Lokasi dimension still works. Integrate Google Maps later.
- AI Explanation (S6): start with rule-based template strings. Upgrade to GPT-generated after core flow is solid.
- Photo upload: validate decision flow without photos first.

**Slice order + effort estimates:**
- S1: Foundation (schema+RLS+auth+onboarding) — 3-4 days, LOW risk
- S2: Input + AI Extraction + Review — 4-5 days, MEDIUM-HIGH risk (prompt engineering for Indonesian text)
- S3: Rule-based Scoring — 2-3 days, LOW risk
- S4: Geocoding + Distance Matrix — 3-4 days, MEDIUM risk (properties without full address)
- S5: Survey Flow — 2-3 days, LOW risk
- S6: Compare + AI Explanation — 3-4 days, LOW-MEDIUM risk
- S7: Timeline — 2-3 days, LOW risk
Total: ~19-26 days feature complete

**Why:** Solo builder, tight budget, early validation stage. Every decision optimizes for shipping fast while avoiding decisions that are painful to reverse.

**How to apply:** When future features are discussed, reference these slice boundaries. S2 and S4 are the highest technical risk — give extra buffer. When new features touch geocoding or AI extraction, re-evaluate against these decisions first.

[[project-hunian-mvp-context]]
