# DANDY DESIGN TEST DOCUMENT
## Variation implementation brief for Claude Design

**Date:** 2026-08-16 · **Source of truth:** `DANDY_CONVERSION_BLUEPRINT.md` (element IDs `E-###`, spec cards `S-##`, anti-patterns `F-##` referenced throughout) + `JAKE_DANDY_SITE_HANDOFF.md` + the Dandy Figma (binding for visual decisions) · **Theme:** this repo (Shopify OS 2.0, `sections/dandy-*.liquid`, `assets/dandy-tokens.css`).

**What this document is.** A build-ready spec for implementing the teardown's ranked conversion elements as **testable module variations** plus three **master page variations** (complete compositions of every S-tier element). Each variation is designed inside the existing Dandy design system — no new tokens, no new visual language. Implement variations as section/block settings or alternate templates (`product.test-m1.json` etc.) so any variation can be toggled per template without code forks.

**This document is self-contained.** Appendix A carries the complete token layer, Appendix B the confirmed catalog and pricing, Appendix C the source-of-truth rules and the relevant handoff excerpts. No repo or external-document access is required to build from it.

---

## §0. CONFLICT RESOLUTIONS (rulings, not guesses)

These resolve the known divergences between the Figma file and this brief. Authority: **for the visual system, the Figma is binding** (owner's handoff: "The Figma is binding for the wordmark, typography hierarchy, palette, controls, radii, strokes, shadows, photography, composition, and section rhythm" — confirmed by Jake 2026-08-16: *"Figma should be the source of truth, not what's currently live."*). Two domains the Figma does **not** govern, per the same handoff's hierarchy: **commerce data** (catalog, prices, offer terms — approved pricing records win, see R4) and **claims/proof content** (owner non-negotiables win, see R5). Full hierarchy text in Appendix C.

**R1 — Palette: your Figma extraction governs.** Page = **white**; core palette = orange `#F04B23` / brown `#28110C` / white, with **green reserved for verification/positive states only** (COA-verified, savings checks). The shipped token layer's cream page (`#fff8f1`), peach, blue, gray, and muted values are implementation drift — treat them as **deprecated pending reconciliation**: keep using the CSS variables as the mechanism (they are the single-source seam), but bind them to the Figma values (`--dandy-cream` → `#ffffff` as page; peach/blue demoted to photographic/illustrative accents only where the Figma actually uses them, never as structural section tints unless a Figma frame shows it). Where §4 module specs mention peach-light or dark-brown narrative bands, substitute the Figma's actual sectioning treatment; if the Figma shows no banded treatment, use white with brown rules/strokes for section rhythm.

**R2 — Type: Nobel is the typeface; design to the Figma ramp.** Design every variation against **Nobel and the Figma's 10–72px scale**. The Barlow Condensed/Barlow stack is only the *licensed-file-gap fallback* living behind `var(--dandy-display)` / `var(--dandy-body)` — never hardcode a family; the moment Nobel webfonts arrive they swap in at the seam. One accessibility floor is retained from the owner's mobile mandates and is not a design preference: **body/functional text ≥16px, controls ≥44px**. Figma sizes below 16px are honored only for non-essential decorative/label type.

**R3 — Border/shadow: Figma Effects frame governs.** Standard hard shadow = **4×4**, common stroke = **2px**, with **5×5 reserved for the primary CTA** as the Figma documents. *(Superseded in detail by the parsed design-system sheet, 2026-08-16 — see `figma-extraction.md` and `DANDY_DR_DESIGN_PROPOSAL.md` §3.7: three button roles — standard elements 2px/4×4 · primary CTA 3px stroke + 5×5 · full-width CTA pill + 4×4.)* Update the token *values* accordingly (`--dandy-border` → 2px; `--dandy-shadow` → `4px 4px 0`; introduce/retain a primary-CTA-only 5×5 variant) rather than introducing parallel literals — one border/shadow pair per role, sourced from variables, values from Figma. The currently-live 3px/5×5 layer is drift to be reconciled, not a second standard.

**R4 — Product model: the Figma's catalog and prices are stale; Appendix B governs.** The handoff states directly that the corrected launch catalog is **10/30-count gummies + 50/90 mg capsules + 100/250 g powder**, and that approved working pricing is the table reproduced in Appendix B (hero: 30-ct gummies $59.99 one-time / $47.99 subscription; 1/3/5 ladder with deterministic totals). The Figma's $18.99–$48.99 gummy pricing and $28.99 subscription are an earlier design iteration — level 2 (approved pricing records) beats level 3 (Figma). No pouch/capsule frames exist in the Figma because those pages must be **composed from the design-system primitives** — that is exactly the job of this brief's §4 module specs. Never render a Figma price literal; all prices bind to Appendix B (and, in the live theme, to Shopify records).

**R5 — Review proof: the guardrail stands; the Figma's review content is fixture data, not launch content.** "2,847 Reviews," "4.8 / 5," and "Join 20,000+ happy customers" in the Figma are placeholder/aspirational comps. The owner's non-negotiables (level 1, quoted in Appendix C) prohibit fabricated reviews, invented customer counts, and fabricated testimonials — F-08/F-10/F-13 restate that, they don't contradict the Figma's *components*. Resolution: **keep `StarRating`, `ReviewCard`, and the review-grid components in the design system** — they are the post-launch swap target for Module G (real, verified reviews via E-071/082). **Purge every fabricated number/instance**: no star glyph, count, rating, or customer number may render anywhere until it binds to real review data. Module G (founder note / provable-facts ledger) is what ships in that slot at launch.

**R6 — Repo/doc access: not needed.** Everything §4 depends on is now in the appendices: complete token CSS (A), catalog + pricing + ladder math (B), source-hierarchy and guardrail excerpts (C). If your environment later gains repo access, the live files are `assets/dandy-tokens.css`, `assets/dandy.css`, `snippets/dandy-buy-box.liquid`, `sections/dandy-*.liquid` — but nothing in this brief requires them.

---

## 1. DESIGN SYSTEM CONSTRAINTS (non-negotiable; **values per Figma, mechanism per tokens — see §0 R1–R3**)

- **Palette (Figma-governed):** orange `#F04B23` / brown `#28110C` / **white page**, green for verification/positive states only (COA-verified, savings checks). **CTA monopoly: orange is reserved for buy actions and active offer states (E-119).** The token names (`--dandy-orange`, `--dandy-brown`, etc.) remain the required reference mechanism; peach/blue/cream/gray/muted token values are deprecated drift per §0-R1 — use only where a Figma frame actually shows them (photographic/illustrative contexts).
- **Structure (Figma-governed):** **2px** brown strokes, hard offset shadows **4×4** standard (**5×5 primary CTA only** — three button roles per §0-R3 note), radii 24px desktop / 16px mobile, pill radius 999px for CTAs and kickers. Reference via `var(--dandy-border)` / `var(--dandy-shadow)` after reconciliation — never literals.
- **Type:** **Nobel, sole typeface, Figma 10–72px ramp** — always via `var(--dandy-display)` / `var(--dandy-body)` (Barlow stack is the temporary fallback behind the seam; never hardcode families). Uppercase condensed display hierarchy, kickers as bordered pill labels. Accessibility floors (retained mandates): body/functional text ≥16px, decorative/label type may follow smaller Figma sizes.
- **Rhythm:** `--dandy-section: clamp(72px, 7vw, 112px)`; editorial authored scroll — do not repeat the same bordered card or icon grid for consecutive sections (handoff §6).
- **Sectioning for narrative (E-120):** follow the Figma's actual section treatments; default is white ground with brown rules/strokes for rhythm. Use tinted or dark bands only where a Figma frame documents them; on any dark band, text is white and orange CTAs keep their brown stroke.
- **Interaction:** visible focus outline per system; 44px minimum tap targets; 16px minimum body text (E-163).

---

## 2. HARD GUARDRAILS (violations = do not ship; from §8 F-tier + handoff non-negotiables)

1. **No countdown timers, no stock meters, no "selling fast," no fake milestones** (F-01, F-11, F-12). The theme has no countdown component; keep it that way.
2. **Every displayed price labeled one-time or subscription**; first charge = renewal charge; strikethroughs only against the true one-time price; savings math from product prices only, never gift values (F-03, F-06, F-07, F-16).
3. **One guarantee sentence, identical everywhere** it appears — buy box, sticky bar, recap, FAQ, cart (F-05). Until David approves terms, render the placeholder `[GUARANTEE_SENTENCE]` with `data-copy-status="pending-legal"`.
4. **No invented proof**: no review stars, counts, customer numbers, press logos, or expert badges anywhere at launch (F-08, F-10, F-13). The proof bridge (module G) is the honest substitute.
5. **Claims discipline**: all benefit copy carries existing `data-copy-status` attributes; serving amounts are never presented as a guaranteed-effect ladder (blueprint E-131 rule); final labels are the source of truth for directions/warnings.
6. **Subscription transparency**: amount charged today, renewal amount, cadence, and skip/pause/cancel visibility in every subscription presentation; toggle-off updates all prices instantly and grays (never breaks) sub benefits (S-05).
7. **Restricted-state disclosure** reachable within one tap of any shipping mention (E-102).
8. Preview-safe: all variations must respect `design_preview_mode` (nontransactional CTA) exactly as `snippets/dandy-buy-box.liquid` does today.

---

## 3. VARIATION NAMING & INSTRUMENTATION

- Variant IDs: `<module>-v<N>` (e.g. `hero-v2`, `buybox-v1`). Master compositions: `M1/M2/M3`.
- Every section root emits `data-dandy-variant="<id>"`. Extend existing events (`dandy:add_to_cart_intent`, `dandy:selling_plan_select`, `dandy:quantity_select`, `dandy:faq_engagement`, `dandy:preview_offer_intent`) with `{ variant, master, section_position }` payload fields so attribution-by-position works (S-13 metric).
- Templates: keep `product.json` / `index.json` as control; add `*.test-m1/m2/m3.json` alternates composing the master variations.

---

## 4. MODULE VARIATION SETS

Each set: purpose (element refs) → **Control** (current build) → variations → states → mobile → primary metric → acceptance criteria. Copy shown is *direction*, not final; route through legal via `data-copy-status`.

### Module A — PDP hero / above-the-fold [S-01, S-11 · E-016/017/018/023/024]

**Control (A-v0):** current two-column gallery + offer panel, benefit bullets, ≈1,400px mobile CTA budget.
- **A-v1 "Format-first":** gallery slot 1 = pouch packshot; H1 leads with format ("THE GUMMY THAT MAKES KRATOM EASY."); benefit bullets second. Goli-style legibility bet.
- **A-v2 "Category-first":** H1 leads with category translation ("KRATOM, MADE EASY.") + one-line experience subline; format shown, not stated. AG1-style frame bet.
- **A-v3 "Benefit-first":** H1 leads with outcome territory ("BRIGHT ENERGY. EASY UNWINDING.") + format tag pill ("35 MG GUMMY · MIXED BERRY"). Grüns-style outcome bet.
- **States:** 10/30-count selected; sub on/off (prices re-render); restricted-state visitor (unchanged hero; disclosure lives in reassurance row).
- **Mobile:** first viewport = media + H1 + rating-bridge line + price; CTA ≤1,400 CSS px on ALL variants — reject any variant that breaks the budget.
- **Metric:** time-to-first `dandy:add_to_cart_intent`; hero scroll-past rate.
- **Accept:** 5-second test — a kratom-naive reader can answer "what is this?" on every variant.

### Module B — Trust strip at first CTA [S-08 · E-020, E-102]

**Control (B-v0):** current reassurance row under CTA.
- **B-v1 "Triplet":** exactly three items — "✓ Every batch lab-tested — read the COA" (links, `--dandy-green-dark` check) · "✓ [GUARANTEE_SENTENCE short form]" · "✓ Ships fast — check your state" (links). Pill-bordered micro-items, kicker type.
- **B-v2 "Inline sentence":** same three facts as one muted body-line under the CTA, COA + state as text links. Quieter, premium-restraint bet.
- **Cap at three items on any variant (S-08 failure mode).**
- **Metric:** first-CTA CTR; early state-page visits (want restricted-state discovery BEFORE checkout).
- **Accept:** COA link resolves to /COA; state link resolves to restriction page; both tappable at 44px.

### Module C — Offer panel: ladder × subscription [S-04, S-05, S-06 · E-026–029, E-033, E-036, E-041, E-048–051]

> **SUPERSESSION (2026-08-16, ruling F-D in `DANDY_DR_DESIGN_PROPOSAL.md` §3.4.5/§3.7):** every "per-day" framing in this module and in the variation copy below ("$1.60/day", "$2.00/day", "$1.60/day subscribed" in C-v1/C-v3/J-v1) is superseded by **per-gummy** framing — "$1.60/gummy" / "$2.00/gummy" ($2.20 delivered) — same arithmetic, compliance-safe (no daily-ritual assertion). Appendix B.2's "Per day" column is read as per-gummy. "Per day" is an inert, legal-gated alternate behind a single locale key; the release scan fails any rendered `/day` price string while this ruling stands.

The highest-stakes module. All variants share: honest math (§2.2), benefits checklist, per-day framing on BOTH paths, dynamic selected-offer summary feeding CTA + sticky bar.
**Control (C-v0):** current build — 10/30 selector, 1/3/5 cards, sub toggle default-on for 30-ct, 20% stacked on ladder (preview behavior).
- **C-v1 "Subscription-first, ladder second":** sub toggle rendered ABOVE the 1/3/5 cards as the primary decision ("$47.99/mo · $1.60/day · 20% off + free shipping" vs "one-time $59.99 · $2.00/day"); ladder cards below apply to one-time path only. David's stated tiebreak (handoff §4: prefer sub clarity over a confusing matrix). Card treatment: selected card = orange fill, white text, 2px stroke + standard 4×4 shadow; unselected = white, brown stroke (per §0-R1/R3).
- **C-v2 "Ladder-first, Resilia grammar honest":** 1/3/5 cards primary (1× $59.99 + $5.95 ship · 3× $119.98 "$39.99/pouch · GET 1 FREE · free shipping" · 5× $179.97 "$35.99/pouch · GET 2 FREE · free shipping"); sub toggle beneath applies to the single-pouch rung only. Launch flag: "BEST FOR STARTING OUT" on rung 1 or none — no "Most Popular" until data exists (E-030 honesty rule).
- **C-v3 "Unified plan cards" (AG1 BaB grammar):** three plan cards — "SUBSCRIBE $47.99/mo" (default-selected, benefits list) · "TRY ONCE $59.99" · "STOCK UP 3-PACK $119.98" — each card a receipt: line items, per-day/per-pouch, shipping line, guarantee line (E-122).
- **States (all variants):** sub on→off grays benefit checklist items (opacity .45, never display:none), updates every price ≤100ms; 10-ct selection hides sub (trial is one-time) with a one-line explainer; selection echoed verbatim in summary, CTA label, sticky bar, cart.
- **Mobile:** cards stack vertically full-width; ladder never renders as a horizontal scroll strip (handoff collection rule applies here too).
- **Metric:** `dandy:selling_plan_select` rate, `dandy:quantity_select` distribution, AOV.
- **Accept:** displayed total matches cart/checkout total in preview AND live modes for every state permutation; release-scan passes.

### Module D — Guarantee microcopy [S-07 · E-092/093]

**Control (D-v0):** none consistently placed.
- **D-v1:** `[GUARANTEE_SENTENCE]` as a single muted line under EVERY buy CTA (buy box, recap, sticky bar) + FAQ + cart. Identical string from one source (theme setting/locale key — never retyped per section).
- **D-v2:** D-v1 + a named guarantee block in the quality section ("THE DANDY GUARANTEE" kicker; band treatment per the Figma's section style — white ground with brown rule by default, §0-R1) — Ridge/Squatch "branded guarantee" bet.
- **Metric:** ATC rate delta (experiment X2); refund-request rate as guardrail.
- **Accept:** grep finds exactly one source string; policy page text matches it verbatim.

### Module E — Quality / COA proof spine [S-03 · E-065/066/067, E-123]

**Control (E-v0):** current `dandy-quality` section.
- **E-v1 "Specificity band":** high-contrast statement band per the Figma's emphasis treatment (brown-on-white by default; dark band only if a Figma frame documents one, §0-R1): what is tested per batch (identity, potency/mg verification, heavy metals, microbials, adulterants — per actual COA panel), by whom, how often + orange "READ THIS BATCH'S REPORT" pill → /COA. Numbers over adjectives (AG1 grammar).
- **E-v2 "Batch-to-bag":** E-v1 + horizontal 4-step explainer (leaf → test → batch ID → your bag, Cansu asset #6) with the QR/pack tie-in ("the code on every pack opens the same page").
- **E-v3 "COA literacy":** E-v1 + "HOW TO READ A COA" accordion (E-134) — teach the standard, win by it.
- **PDP echo:** all variants add one COA line + link inside the buy-area reassurance row (experiment X4).
- **Metric:** /COA CTR from PDP; conversion rate of COA-viewing sessions.
- **Accept:** every "tested" claim on the page carries the link; zero testing claims without artifacts (F-09).

### Module F — Category education [S-09 · E-128/129/136, E-012]

**Control (F-v0):** current `dandy-kratom-intro` + `dandy-two-gears`.
- **F-v1 "60 seconds":** compressed single band — "WHAT IS KRATOM?" kicker, 3 short mechanism-→-benefit lines, one botanical visual (Cansu #4), CTA "PICK YOUR DANDY". Goli compression bet.
- **F-v2 "Two-gears-led":** education *through* the gear choice — "ONE PLANT. TWO GEARS." as the organizing frame; each gear card ends in benefit line + CTA routed to the matching format/PDP (self-selection doing the education, E-012).
- **Rule (all variants):** every education block ends in a benefit line + CTA — no dead ends (E-136).
- **Metric:** home→PDP progression; section-attributed ATC.

### Module G — Proof bridge (pre-review launch state) [Fork 5 · E-075, E-019-bridge, X9]

**Control (G-v0):** `dandy-review-slots` placeholders (empty at launch — currently the weakest surface).
- **G-v1 "Founder note":** signed short letter ("why we made Dandy, why every batch is tested"), portrait (Cansu #7), editorial band — no card grid.
- **G-v2 "Provable facts ledger":** `dandy-proof-ledger` with only verifiable statements (batch tested + link · mg per serving exact · made in [facility fact] · 16-state honesty note) — "here's what we can prove on day one" framing, honesty AS the proof.
- **G-v3:** G-v1 + G-v2 stacked (founder accountability + facts).
- **Post-launch swap path:** the section slot must accept real tagged reviews (E-071/082) without layout change — design the grid now, fill honestly later.
- **Metric:** scroll-to-ATC correlation through this section (X9).
- **Accept:** zero fabricated or "coming soon" fake proof; no star glyphs anywhere pre-reviews.

### Module H — FAQ objection ordering [S-10 · E-095/096/098/099]

**Control (H-v0):** current FAQ set.
- **H-v1 "Fear-ordered":** exactly the §10.6 order — legality → intensity expectations ("will I feel weird?") → safety/COA → serving guidance → state shipping → subscription/cancel → guarantee. Written from the buyer's fear, not the brand's glossary.
- **H-v2:** H-v1 + category-objection block ABOVE the accordion — two pill-bordered cards: "TASTES LIKE MIXED BERRY. NOT LIKE A HERB SHOP." and "START LOW. EFFECTS VARY." (E-096/098 as visible cards, not buried answers).
- **Metric:** `dandy:faq_engagement` per item — open-rate ranking becomes next iteration's objection research.

### Module I — CTA cadence + recap + sticky bar [S-13 · E-011, E-138–141, E-143]

**Control (I-v0):** current sticky CTA + recap.
- **I-v1 "Crest cadence":** CTA (or in-view sticky) reachable after: buy box, quality/COA, comparison, FAQ, recap. Verb varies by depth: "PICK YOUR DANDY" → "SEE THE TESTS" → "START LOW. FIND YOUR DANDY." (E-141/145). Anchor links return to the offer panel (Resilia #scroll-pro pattern, done tastefully).
- **I-v2:** I-v1 + full recap = duplicated offer summary card (selection preserved) rather than a simple banner (E-011).
- **Sticky bar (all):** echoes exact selection + price; appears only after the buy box exits viewport; 44px; never covers focus targets.
- **Metric:** ATC share by `section_position`.
- **Accept:** cadence = every proof crest, not every viewport — max 6 asks on the PDP (S-13 failure mode).

### Module J — Homepage lineup + per-day framing [E-026/027, E-132]

**Control (J-v0):** current `dandy-lineup`.
- **J-v1:** hero-SKU card adds "$1.60/day subscribed" line; all cards show real one-time price + "10 & 30 count" clarity; format chooser directly below lineup.
- **J-v2:** lineup grouped by gear (energy/ease) instead of format — tests whether experience-first merchandising beats format-first (pairs with F-v2).
- **Metric:** lineup CTR → correct-PDP rate.

---

## 5. MASTER VARIATIONS (combined S-tier compositions)

All three masters implement **every** S-tier card (S-01…S-14); they differ in emphasis, order, and module-variant selection. Build as template alternates; identical offer math everywhere.

### M1 — "PROOF-FIRST PREMIUM" (AG1/IM8 skeleton — recommended default, blueprint §10)
- **Modules:** A-v2 · B-v1 · C-v1 · D-v2 · E-v2 · F-v1 · G-v3 · H-v2 · I-v2 · J-v1.
- **PDP order:** hero → trust triplet → offer (sub-first) → guarantee line → COA specificity band (E-v2) → label/facts panels → condensed two-gears → use guide → founder+facts bridge → format comparison → FAQ (H-v2) → recap. Proof-before-price rhythm: quality band sits immediately after the offer for validators (S-02).
- **Homepage order:** as blueprint §10.2, with E-v2 quality band and G-v1 founder note at positions 10–11.
- **Character:** dark-band quality section as the visual centerpiece; most editorial; slowest scroll.

### M2 — "FORMAT-FIRST FAST LANE" (Goli compression weighting)
- **Modules:** A-v1 · B-v2 · C-v2 · D-v1 · E-v1 · F-v1 · G-v2 · H-v1 · I-v1 · J-v1.
- **PDP order:** hero (format-led) → inline trust sentence → ladder-first offer → guarantee → compressed education (one band) → E-v1 quality → facts ledger → FAQ → recap. Every below-fold section ≤1 viewport tall on desktop; total PDP ≈35% shorter than M1.
- **Character:** the shortest path defensible for category-naive traffic; bets that gummy legibility + honest math carry conversion.

### M3 — "TWO-GEARS EDUCATION-FORWARD" (experience-led)
- **Modules:** A-v3 · B-v1 · C-v3 · D-v1 · E-v3 · F-v2 · G-v1 · H-v2 · I-v1 · J-v2.
- **PDP order:** hero (benefit-led) → trust triplet → unified plan cards → guarantee → two-gears education block (full) → use guide elevated (directly after education) → COA + literacy accordion → founder note → comparison → FAQ → recap.
- **Homepage:** gear-grouped lineup (J-v2); two-gears section promoted above "what is kratom."
- **Character:** bets that experience self-selection ("which gear am I buying?") is the real conversion question once safety is settled.

**Master test plan:** ship M1 as the launch default (matches blueprint recommendation + handoff journey). Run M2 and M3 as template alternates for sequential before/after weeks (traffic won't support parallel splits at launch — blueprint §11 sample-size honesty). Judge on: PDP conversion to `dandy:add_to_cart_intent`, sub attach rate, AOV, /COA engagement, refund/support rate as guardrail metric.

---

## 6. ASSET DEPENDENCIES (Cansu — reference handoff §10 request format)

| Asset | Blocks | Placeholder until delivered |
|---|---|---|
| #1 Capsule renders (50/90mg, 10/30ct, true scale) | A on capsule PDPs, J | existing text/art-direction placeholders |
| #4 "Kratom in 60 seconds" explainer | F-v1 | typographic band, no image |
| #5 Start-low infographic | use guide, H-v2 card | icon + text steps |
| #6 Batch-to-bag/COA explainer (from a real report) | E-v2 | 4-step text strip |
| #7 Founder portrait/story | G-v1/v3 | signed text letter, no portrait |
| #3 US restriction map | B state link target | accessible text list (already required) |
| #8 1/3/5 pack lineup renders | C card art | single-pouch image + count badge |

No variation may ship a baked-in-text image without its text alternative (accessibility + Nobel font swap seam).

---

## 7. DEFINITION OF DONE (per variation)

1. Renders via the token seam only, with values reconciled to the Figma per §0 R1–R3 — zero ad-hoc colors/fonts/radii/literals; passes visual check against the Figma primitives (which win over the currently-live theme).
2. All §2 guardrails pass; `bash scripts/release-scan.sh .` shows no NEW failures introduced by the variation.
3. `shopify theme check` clean; preview-safe CTA behavior verified in `design_preview_mode`.
4. Mobile: ≤1,400px to CTA (PDP), 44px targets, 16px body, no horizontal scroll traps.
5. State matrix exercised: 10↔30ct, sub on↔off, each ladder rung, preview↔live — price display consistent everywhere it echoes (buy box, summary, sticky, cart).
6. `data-dandy-variant` + event payloads emitting; copy carries `data-copy-status`.
7. Accessibility: focus-visible intact, accordions keyboard-operable, alt text on all new media.
8. Screenshot set (desktop 1440 / mobile 390) attached to the PR for David/Cansu review.

---

## APPENDIX A — TOKEN LAYER (mechanism) + FIGMA RECONCILIATION DELTAS (values)

**How to use:** the CSS variables below are the required reference mechanism for every variation (never hardcode a color/font/border literal). The *values* shown are the currently-live theme layer; per §0 R1–R3 the Figma governs, so apply the **delta table** first — deltas win wherever they differ from the raw CSS.

### A.1 Reconciliation deltas (current live value → Figma-governed target)

| Token / role | Currently live | **Figma-governed target (build to this)** |
|---|---|---|
| Page ground (`--dandy-cream` usage as page bg) | `#fff8f1` cream | **`#ffffff` white** |
| Core palette | orange/brown + peach, blue, cream, gray, muted | **orange `#F04B23` / brown `#28110C` / white; green = verification only** |
| `--dandy-peach`, `--dandy-peach-light`, `--dandy-blue`, `--dandy-blue-deep`, `--dandy-gray`, `--dandy-muted` | structural tints in sections | **deprecated as structural tints; photographic/illustrative use only where a Figma frame shows them** |
| `--dandy-border` | `3px solid brown` | **`2px solid brown`** (common stroke) |
| `--dandy-shadow` | `5px 5px 0 brown` | **`4px 4px 0 brown`** standard |
| Primary-CTA shadow | same 5×5 as everything | **5×5 reserved for the primary CTA only** (role-scoped variant; secondary = no shadow; full-width = 4×4) |
| `--dandy-shadow-small` | `3px 3px 0` | keep as the small-element step unless Figma Effects documents otherwise |
| Display/body family | Barlow Condensed / Barlow | **Nobel** (sole typeface) — swaps in at the `--dandy-display`/`--dandy-body` seam when licensed files arrive; Barlow stack remains the interim fallback |
| Type scale | clamp() web ramp below | **Figma 10–72px ramp**, mapped responsively; floors: body/functional ≥16px, controls ≥44px |
| Radii, pill radius, section rhythm | 24/16px, 999px, clamp(72–112px) | unchanged (matches Figma) |
| Button behavior (hover lift, active press) | as in A.2 | keep mechanics; restate offsets in the 4×4 system (hover 6×6, active 2×2, hero hover 7×7) |

### A.2 Current live token CSS (verbatim, for mechanism + everything the deltas don't touch)

```css
:root {
  --dandy-brown: #28110c;
  --dandy-orange: #f04b23;
  --dandy-orange-dark: #d93e18;
  --dandy-peach: #ffc5aa;          /* deprecated structural use — see A.1 */
  --dandy-peach-light: #ffe8dd;    /* deprecated structural use — see A.1 */
  --dandy-blue: #58b9e8;           /* photographic accent only — see A.1 */
  --dandy-blue-deep: #0875ac;      /* focus outline color */
  --dandy-cream: #fff8f1;          /* → #ffffff per A.1 */
  --dandy-white: #fff;
  --dandy-green: #57ba4f;          /* verification/positive only */
  --dandy-green-dark: #064c26;     /* verification/positive only */
  --dandy-gray: #f1efed;           /* deprecated structural use */
  --dandy-muted: #6c5c58;          /* secondary text */
  --dandy-border: 3px solid var(--dandy-brown);   /* → 2px per A.1 */
  --dandy-shadow: 5px 5px 0 var(--dandy-brown);   /* → 4px 4px 0 per A.1 */
  --dandy-shadow-small: 3px 3px 0 var(--dandy-brown);
  --dandy-radius-card: 24px;
  --dandy-radius-card-mobile: 16px;
  --dandy-radius-pill: 999px;
  --dandy-page: min(1320px, calc(100vw - 48px));
  --dandy-page-wide: min(1440px, 100vw);
  --dandy-section: clamp(72px, 7vw, 112px);
  --dandy-display: "Barlow Condensed", "Arial Narrow", sans-serif;  /* Nobel seam */
  --dandy-body: "Barlow", "Work Sans", Arial, sans-serif;           /* Nobel seam */
  --dandy-h1: clamp(4rem, 7.5vw, 7.5rem);
  --dandy-h2: clamp(3.25rem, 5.2vw, 5.75rem);
  --dandy-h3: clamp(2rem, 3vw, 3.5rem);
  --dandy-body-lg: clamp(1.05rem, 1.3vw, 1.3rem);
}
```

Key component grammar (keep; restyle values per A.1): `.dandy-kicker` = bordered pill label, uppercase, 14px/800/.08em (13px mobile) · `.dandy-display/.dandy-heading/.dandy-subheading` = condensed uppercase 900, line-height .88/.94, `text-wrap: balance` · `.dandy-button` = pill, min-height 52px, orange fill, brown stroke + hard shadow, uppercase 18px/900; hover lifts −2px with deeper shadow, active presses +3px with shallow shadow; `--secondary` = white fill, no shadow; `--full` = 100% width · `.dandy-card` = stroke + card radius + hard shadow, white fill · `.dandy-text-link` = uppercase display link, 4px underline offset · focus-visible = 3px `--dandy-blue-deep` outline at 3px offset · mobile (≤749px): page gutter 32px, section 64px, compressed h-scale, 16px radii · `prefers-reduced-motion` collapses all animation.

---

## APPENDIX B — CONFIRMED CATALOG, PRICING & OFFER MATH (binds every price in §4/§5; Figma prices are void per §0-R4)

### B.1 Launch catalog & working prices (owner-approved working set)

| Format | Configuration | One-time | Subscription direction |
|---|---|---:|---|
| Mixed Berry Gummies | 35 mg/gummy, 10 ct | $24.99 | one-time trial only (no sub) |
| **Mixed Berry Gummies (HERO)** | **35 mg/gummy, 30 ct** | **$59.99** | **$47.99 every 30 days · 20% off · free standard shipping** |
| Extract Capsules | 50 mg, 10 ct | $28.99 | one-time trial only |
| Extract Capsules | 50 mg, 30 ct | $64.99 | sub deferred pending economics/processor ($55.24 sensitivity — do not render) |
| Extract Capsules | 90 mg, 10 ct | $44.99 | one-time trial only |
| Extract Capsules | 90 mg, 30 ct | $99.99 | sub deferred ($84.99 sensitivity — do not render) |
| Raw Leaf Powder | 100 g | $34.99 | no launch subscription |
| Raw Leaf Powder | 250 g | $54.99 | deferred |

### B.2 Hero 1/3/5 ladder (30-ct gummies; deterministic — display exactly)

| Rung | Total | Per pouch | Per day | Shipping |
|---|---:|---:|---:|---|
| 1 pouch | $59.99 | $59.99 | $2.00 | $5.95 standard |
| 3 pouches (buy 2 get 1) | $119.98 | $39.99 | — | FREE |
| 5 pouches (buy 3 get 2) | $179.97 | $35.99 | — | FREE |
| Subscription (1 pouch/30 days) | $47.99/renewal | $47.99 | **$1.60** | FREE |

Same buy-2-get-1 / buy-3-get-2 arithmetic for other SKUs if enabled: 10-ct gummies $24.99/$49.98/$74.97 · 50 mg 30-ct $64.99/$129.98/$194.97 · 90 mg 30-ct $99.99/$199.98/$299.97 · powder 100 g $34.99/$69.98/$104.97 · 250 g $54.99/$109.98/$164.97. **Rules:** first charge = renewal charge; every price labeled one-time or subscription; strikethroughs only vs the true one-time price; displayed math must equal cart/checkout math (server-enforced).

### B.3 Shipping & restrictions

$5.95 standard single one-time pack · free on subscriptions and 3/5-packs · **no shipping to 16 states** (AL, AR, CA, CT, IN, KS, LA, MS, NE, ND, RI, TN, UT, VT, WV, WI) — disclosure link within one tap of any shipping mention; checkout enforcement is authoritative, the design layer is informational.

---

## APPENDIX C — SOURCE-OF-TRUTH RULES & HANDOFF EXCERPTS (verbatim where quoted)

### C.1 Hierarchy (owner's handoff §2)

1. David's latest written direction, including the handoff. 2. Final product labels, packaging, COAs, operations rules, and approved pricing records. 3. The Figma design system and Cansu's approved assets. 4. The customer-service manual. 5. Existing theme fixtures and older planning documents. — Plus Jake's 2026-08-16 direction for this brief: *the Figma is the source of truth for the visual system over the currently-live theme layer* (§0). Figma never governs commerce data (level 2) or claims/proof content (level 1).

### C.2 Owner non-negotiables (basis of §2 guardrails and §0-R5)

"Avoid false scarcity, evergreen countdown timers, fake customer counts, unsupported medical badges, fabricated testimonials, or crossed-out prices that do not reflect a genuine offer." · "This does not authorize fake evidence, fake reviews, fake urgency, invented clinical claims, or inaccurate directions." · Claim status is tracked via invisible `data-copy-status` attributes; "the shopper should see confident consumer copy, not internal legal or implementation notes." · Final labels are the source of truth for directions, warnings, and maximum use; "Do not turn serving amounts into a guaranteed effect ladder."

### C.3 Subscription merchandising requirements (handoff §4 — Module C must satisfy all six)

1. Show size/strength and 1/3/5 choices visually. 2. Subscription as a polished, selected-by-default toggle or purchase option. 3. Clear strikethrough comparison, amount charged today, renewal amount, cadence, savings. 4. Directly beneath: subscriber benefits — savings, free standard shipping, never running out, reminder before renewal, easy skip/pause/cancel. 5. Toggle-off updates every price immediately and grays/strikes sub-only benefits without looking broken. 6. Exact selection (variant, quantity, plan, price, cadence) preserved through cart and checkout. Tiebreak: "If the combined quantity/subscription decision cannot be made exceptionally clear and persuasive, David prefers a stronger subscription-first experience over forcing both mechanics into a confusing matrix."

### C.4 Mobile mandates (handoff §7)

First product media, title, key benefits, choices, and CTA appear quickly — ≈1,400 CSS px to the main CTA on the gummy PDP; controls ≥44px; body text ≥16px; homepage merchandising routes category → format → PDP (no full buy box under the homepage hero); collection/ladders must work vertically on mobile (no horizontal strips).

### C.5 Required launch surfaces the modules link into

`/learn` (what is kratom) · `/COA` (permanent — QR codes on packaging point here; must always resolve) · FAQ · About/founder · how-it-works/responsible use · contact · shipping & restrictions (incl. state map/list) · returns/guarantee · subscription policy & cancellation instructions · privacy/terms/accessibility.
