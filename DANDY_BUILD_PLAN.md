# DANDY BUILD PLAN
## Recommended implementation sequence — DR program + big swings, ordered by dependency

**Date:** 2026-08-16 · Sources: `DANDY_DR_DESIGN_PROPOSAL.md` (certified 10/10 ×3), `DANDY_BIG_SWINGS.md`, `DANDY_DESIGN_TEST_DOC.md`, `JAKE_DANDY_SITE_HANDOFF.md`. Owners: **J** = Jake (build), **D** = David (decisions/ops), **L** = legal, **C** = Cansu (assets), **Lab** = manufacturer/lab.

**The sequencing principle:** decisions unblock builds; builds unblock variations; variations unblock tests; swings ride on surfaces already being built. Nothing waits that doesn't have to.

---

## PHASE 0 — THIS WEEK: decisions + one-email tests (zero build, unblocks everything)

| # | Item | Owner | Output |
|---|---|---|---|
| 0.1 | **Guarantee sentence signed** incl. refund cap $X (recommended: "30-day money-back on your first order — no return required, refund capped at $X") | D+L | The one locale string; unblocks every CTA surface |
| 0.2 | **Processor test**: end-to-end recurring kratom transaction incl. renewal on Argyle/Authorize.net | D | Decides sub-first (PDP-A) vs plan-card fallback (PDP-B grammar) — both already designed |
| 0.3 | **Review platform chosen** (third-party auditable) | J | Day-1 orders get asked; proof engine starts |
| 0.4 | **COA panel transcription** from a real report + confirm mitragynine is *quantified per lot* | D+Lab | Unblocks S-03 copy, exclusion list, AND the Dandy Index (one email answers both) |
| 0.5 | **Supplier email**: what lot-level provenance (region/vein/harvest) comes with powder? | D | Decides Single Lot |
| 0.6 | **Counsel ×2**: Reject Shelf (publishing pre-release failures) · The Pass (stored-value/escheatment) | D+L | Two yes/no gates |
| 0.7 | **David sign-offs batch**: capsule-sub economics (stays OFF at launch) · price-lock scope · "Same-day dispatch" claim verify-or-remove · cost-range publication (Receipts) · The Line's no-7-OH roadmap constraint | D | Each is a table row in DR §3.7 |
| 0.8 | **Legal throughput plan** — the named bottleneck; batch all `aggressive-draft` FAQ/PDP/education copy into one review cycle | D+L | Clears the release scan's biggest blocker |
| 0.9 | **Adopt the honest-scarcity ruling** into release-scan spec (Big Swings §3) | J | Unblocks Lot 001/batch mechanics later |

## PHASE 1 — WEEKS 1–3: launch-blocking build (DR §3.3, in order)

1. **Delete the F-C defect** in `snippets/dandy-buy-box.liquid`: stacked $95.98/$143.98 prices, MOST POPULAR/BEST VALUE badges, the sub-strikethrough. Also rename the three "routine" strings. *(J, hours — do first; it's live contradiction of approved pricing)*
2. **Real catalog + selling plans + server-authoritative ladder pricing** (Shopify Function/app; displayed math = charged math on all 5 surfaces). *(J, ~1 wk — the long pole; start immediately)*
3. **Guarantee string wired** to buy box/sticky/recap/cart/FAQ/policy from one locale key. *(J, hours, after 0.1)*
4. **/COA minimum-viable real**: native page (not virtual router), real batch report, plain-language panel summary, batch selector, COA-literacy accordion, QR destination test. Build straight to the **Batch Passport timeline** layout if schedule allows — it's the same data. *(J, 2–3 days)*
5. **Cart re-skin**: Dandy tokens, selection echo, trust triplet (tested/guarantee/reship-or-refund), state note line, sub-terms echo. *(J, 1–2 days)*
6. **Capsule + powder PDPs enabled**: ladder ON, sub OFF (no-sub grammar), real prices, PDP-A structure incl. condensed category translator, AST-01/02 text placeholders; fold budgets 1,112/1,020 verified at 390px. *(J, 2 days)*
7. **Buy-box completion on gummy PDP**: per-gummy on both paths, receipt → CHARGED TODAY, honesty microstack, cadence selector (interval-only), 10-ct replacement state, benefits ×6 w/ gated line suppressed until 0.2/decision-#10 confirm. *(J, 2 days)*
8. **State-restriction page** (text list v1) + cancellation-instructions page (indexed) + thank-you minimum (recap + start-low line + sub preview) + /about page (founder letter + facts ledger). *(J, 2 days)*
9. **Proof bridge** into the review slot: founder note + provable-facts ledger incl. the zero-reviews row; grid sized to future ReviewCard swap. *(J+C, 1 day + Cansu portrait when ready)*
10. **21+ affirmation** (one restrained step, per 0.7/L) + FDA-disclaimer adjacency rule + compliance placements. *(J+L, 1 day)*
11. **Release-scan upgrade**: all §3.3#9 mechanism assertions (price-literal regex, guarantee grep-single, green/artifact schema, tested→coa_url, /day ban, ask counts, px budgets, scarcity clause, routine blocklist, /COA uptime). *(J, 1 day — this is what keeps everything honest after launch)*
12. **Lifecycle minimum**: Klaviyo E0–E3 (confirm/ship-QR/day-5 check-in/day-14 review ask) + renewal reminder (gated on capability confirm). *(J, 1 day)*

**Exit criteria:** release scan passes · theme check clean · 390px render check on all three PDPs · displayed=charged verified across every state permutation · QR resolves.

## PHASE 2 — WEEKS 3–5: the certified variations + instrumentation

- Ship **HOME-A ("The Receipts")** + **PDP-A ("Credential Stack")** as defaults — or PDP-B grammar if 0.2 failed.
- Build **PDP-B's plan-card grammar regardless** (the processor-proof fallback; Opus: "costs nothing to have, everything to not have").
- Build **HOME-B ("Two Gears First")** as the permanent `?ref=pack` source-keyed path.
- Instrumentation: `data-dandy-variant` + `{variant, master, source, section_position}` on all `dandy:*` events; GA4 attach; restricted-state early-bounce vs checkout-block metric; retention metric set.
- Sequential test windows begin (X-series, per sample-size honesty): X1 per-gummy framing → X2 guarantee line → X4 COA-in-buy-area.

## PHASE 3 — LAUNCH MONTH: the free swings layer (all ride on Phase-1 surfaces)

1. **Skeptic's Page** (/learn/for-the-worried) — after its 5-skeptic test passes. *(J+L, days)*
2. **De-Strained + Index four-part position** (if 0.4 confirmed quantified MIT): /no-strains manifesto · MIT numeral on PDPs · Reject Shelf published empty with policy · The Receipt cost breakdown (per 0.7 scope). *(J+D+L — "bigger than any single item")*
3. **Batch culture v1**: Lot 001 page w/ real published count · Batch Board first posts · pack QR → Batch Passport. *(J, days — needs 0.9 ruling)*
4. **First Bag Ritual** as email-linked page. *(J, 1 day)*
5. **Open Books dispatch #0** → David redline → publish what survives. *(J+D)*
6. /learn cluster to 3 pages + 50-State Ledger first 5 states. *(J, ongoing)*

## PHASE 4 — Q1 POST-LAUNCH: compounding + signature-gated bets

- **Review engine live** (E-156 timing → tagged display → honest distribution); swap proof bridge → real reviews at ~50 reviews.
- **Quarter-one swings**: Strength Compass (after its "nobody calls it a health quiz" test) · Serving Journal PDF · Mitragynine Museum · anonymized Lab Desk piece → r/kratom · The Flight as bundle · Explainer Seat flagship #1 (its subreddit test decides the whole seat) · Raccoon 3-strip test.
- **Signature-gated launches as signatures land**: The Line (promote to top priority if D signs the no-7-OH constraint — timing window) · The Ceiling (after LTV model) · The Pass concierge (first 25 by hand, after counsel) · Single Lot (if supplier said yes; cap 4 lots/yr).
- **Decision reviews at day 60**: sub attach vs Pass take-rate · HOME-A vs -B on trust-vs-comprehension metrics · rung distribution → earned flags ("Most chosen") · wholesale revisit if DTC underperforms.

## STANDING RULES (from the certification)
Every number from Appendix B/Shopify objects · one guarantee sentence everywhere · nothing renders that an artifact can't back · gated lines stay suppressed until their decision signs · the release scan is the enforcement, not good intentions.
