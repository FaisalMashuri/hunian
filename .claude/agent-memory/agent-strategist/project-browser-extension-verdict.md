---
name: project-browser-extension-verdict
description: Verdict on Faisal's proposal to build a Chrome extension for capturing listings from OLX/FB Marketplace/Mamikos — deprioritized, not core moat, mobile-first mismatch
metadata:
  type: project
---

Faisal (product owner) proposed building a Chrome extension to capture listings directly from source sites (OLX, FB Marketplace, Mamikos, situs properti) into Hunian.

**Decision: Deprioritize. Not aligned to current phase leverage. Revisit only if paste-based input is empirically proven to be the #1 drop-off point AND desktop usage share is verified meaningful.**

**Why:**
1. Scoped correctly (single-listing, user-initiated capture into their own shortlist) it does NOT violate the "decision tool not aggregator" positioning — it's an input-friction fix, same spirit as paste+AI-extract. Risk is scope creep toward background/bulk capture, which WOULD drift into aggregator territory and must be explicitly ruled out if ever built.
2. It is not an acquisition channel. Chrome Web Store has near-zero organic discovery for a niche vertical extension — people install it because they already know Hunian, not the reverse. Any value is retention/habit, not top-of-funnel.
3. It does NOT feed the actual moat. The identified moat ([[project-monetization-fomo]]) is negotiation outcome / all-in cost data collected POST-decision — data Mamikos structurally can't collect. Extension captures PRE-decision listing metadata (asking price, photos) that source sites already own and display publicly. Saves typing; does not create exclusive data.
4. Platform risk is real and asymmetric: FB Marketplace scraping violates Meta ToS and can flag/lock the user's own FB account (trust-destroying for a small product); OLX/Mamikos DOM changes silently break capture; multi-site maintenance is disproportionate solo-dev burden. This is a maintenance liability that WEAKENS over time, the opposite of a moat.
5. **Critical structural mismatch: target users hunt kost/kontrakan primarily via mobile (FB app, mobile browser), not desktop Chrome.** Chrome extensions are desktop-only in any meaningful sense (Chrome for Android does not support extensions). A desktop-only capture tool serves a minority of the actual browsing context. This alone likely kills the ROI case regardless of the other points.

**What NOT to build now:** Multi-site DOM-scraping browser extension.

**Higher-leverage alternative if input friction is truly validated as a blocker:** Mobile share-target ("share to Hunian" from Android share sheet / bookmarklet) — achieves most of the friction reduction at a fraction of the engineering and ToS risk, and matches actual mobile-first usage context. Still should not be built speculatively — validate via [[project-mvp-sequencing]] cycle-completion metric first.

**Signal to monitor:** If user research ever shows desktop Chrome is the dominant browsing surface for listing discovery in the target segment, re-open this — the mobile-mismatch objection would no longer hold.

Related: [[project-hunian-positioning]], [[project-monetization-fomo]], [[project-mvp-sequencing]]
