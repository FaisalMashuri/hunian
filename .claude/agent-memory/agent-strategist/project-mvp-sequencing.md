---
name: project-mvp-sequencing
description: Strategic decision on MVP build order — Compare must be built first to validate Hunian's core differentiation before input infrastructure
metadata:
  type: project
---

Hunian MVP build order should prioritize the Compare view BEFORE AI extraction, full forms, or survey module.

**Why:** Compare is the only feature that differentiates Hunian from a marketplace or Google Sheets. Building Input + AI Extraction + Survey first risks spending runway on commodity features without validating the core decision-tool hypothesis. MVP spec (mvp.md) sequences Compare last in a 7-step pipeline — this is a strategic risk, not a safe default.

**How to apply:** When asked about build sequencing, always push back on any plan that defers Compare past the first 2-week sprint. The minimum valid path is: 2-3 dummy candidates → Compare view with trade-off forward framing → validate with 5 real users BEFORE building input infrastructure.

**What's safe to defer:** AI Extraction (reduce friction, not core), full 5-step onboarding (only Budget + Deal Breaker needed for first meaningful compare), Survey module (enriches compare, doesn't enable it), Property Timeline (post-MVP).

**What must NOT be deferred:** Compare view, rule-based scoring (5 dimensions), Budget + Deal Breaker onboarding fields.

**Key risk signal to monitor:** If first users ask "how do I add data?" instead of "how do I compare?" — the positioning hasn't landed yet. Iterate Compare before building more input infrastructure.

Related: [[project-hunian-positioning]], [[project-mvp-metric]]
