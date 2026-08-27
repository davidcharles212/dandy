# DTC Conversion Teardown → Ranked Element Registry → Dandy Implementation Blueprint

**Prepared:** August 16, 2026 · **For:** Dandy (foreverdandy.com) · **Method:** live web capture of 14 corpus brands + synthesis against the Dandy launch handoff and the current Shopify theme build (`jakebtr/luxembourg-v3`).

**Evidence note.** This teardown was produced with live text-level web capture (full-page fetches + search verification), not screenshots. Every evidence entry therefore carries **URL + capture date + verbatim micro-excerpt** in place of the screenshot IDs the original spec requested. Where JavaScript-rendered content could not be observed, it is recorded as a gap in §12, not guessed at. Evidence tags: `OBSERVED` (directly visible in fetched content), `INFERRED` (reasoned from observation, reasoning stated), `UNVERIFIED` (assumed, needs confirmation).

---

## PART 0 — VARIABLES (as resolved from the Dandy handoff and repo)

```
BRAND_TO_BUILD:        Dandy — modern, premium consumer kratom brand ("joyful, trustworthy CPG/wellness,
                       not a smoke-shop product with cleaner packaging")
CATEGORY:              Kratom consumables — gummies (35 mg, 10/30 ct), extract capsules (50/90 mg, 10/30 ct),
                       raw leaf powder (100/250 g). New/unfamiliar category for most cold traffic.
PRICE_POINT:           $24.99–$99.99 one-time. Hero offer: 30-ct gummies $59.99 one-time /
                       $47.99 subscription (20% off, free shipping). Target AOV lifted via 1/3/5 ladder
                       (3-pack $119.98, 5-pack $179.97 on hero SKU).
PRIMARY_OFFER:         Hybrid, subscription-first on 30-ct SKUs (selected-by-default toggle) +
                       1/3/5 quantity ladder (buy 2 get 1 / buy 3 get 2). 10-ct SKUs = one-time trial rungs.
MARGIN_HEADROOM:       [UNVERIFIED] — not stated in handoff. The approved ladder already concedes up to 40%
                       (5-for-3) plus free shipping, and a 20% recurring discount, implying substantial
                       gross-margin headroom typical of the category. Final economics owner-confirmed per SKU
                       before enabling (handoff §4).
TRAFFIC_MIX:           [UNVERIFIED/INFERRED] — kratom is prohibited or restricted on Meta, Google, and TikTok
                       ad platforms, so the paid-social playbook that funds most corpus brands is largely
                       unavailable. Working assumption: organic social, SEO/education, affiliate/creator,
                       email/SMS, retail QR (pack → /COA), word of mouth. This materially changes which
                       corpus elements transfer (see §7 forks, §12).
DEVICE_SPLIT:          Mobile-primary (handoff mandates mobile as the primary surface; gummy PDP target
                       ≈1,400 CSS px to main CTA).
BRAND_POSITIONING:     Premium + joyful/accessible tone. Editorial, authored scroll; Figma is binding.
STAGE:                 Pre-launch. Zero real reviews, zero customer count, no press, no clinical assets.
                       Real COAs exist; /COA is a permanent QR-code destination.
CONSTRAINTS:           Solo builder + designer (Cansu) on request; Shopify OS 2.0 Horizon-based theme,
                       Grow plan (no Plus checkout customization); payment: Argyle MID + Authorize.net,
                       recurring-billing support for kratom still unconfirmed; 16 no-ship states must be
                       enforced at checkout; all claims routed through legal before publication.
NON-NEGOTIABLES:       No fake scarcity/countdowns, fake reviews, invented customer counts, unsupported
                       medical badges, fabricated testimonials, dishonest strikethroughs, hidden
                       subscription terms, or disease claims. Subscription cancellation must be prominent
                       and honest. (Handoff §5; these mirror PART 9 guardrails.)
```

**Dandy ground truth the scoring leans on** (from `JAKE_DANDY_SITE_HANDOFF.md` and the theme):

- The theme already implements: announcement bar, hero, value strip, lineup, category education (`dandy-kratom-intro`), two-gears experience story, split stories, use guide, quality/COA section, FAQ, final CTA, PDP with 10/30 selector + visual 1/3/5 cards + subscription-default toggle + dynamic summary + sticky mobile CTA, recap, format chooser, proof ledger, review slots, timeline, catalog. Registry "Cost" scores account for this — many S/A elements are partially built.
- Homepage deliberately does **not** put a buy box under the hero; it routes category → format → PDP (handoff §7).
- Analytics events (`dandy:*`) exist but no vendor is attached yet; "Success metric" fields in §9 name these events where applicable.

---

*Sections §1–§13 below follow the master output spec. Registry IDs are `E-###`; S-tier spec cards are `S-##`.*

<!-- SYNTHESIS IN PROGRESS — populated from live captures of: Grüns, Goli, Resilia, IM8, AG1 (Tier 1); Auri, MUD/WTR, Everyday Dose, Nutrafol, Dr. Squatch, PetLab Co., Jones Road Beauty, Ridge, BioRoot Labs (Tier 2). -->

## §1. EXECUTIVE SUMMARY

**Thesis.** Dandy's conversion page should be a **premium education-forward hybrid**: AG1's proof-before-price sequencing and repeated conversion moments, executed with Goli's per-module brevity and format-first legibility, wrapped around the subscription-default + honest 1/3/5 ladder already designed — with one Dandy-specific inversion: in kratom, **verifiable testing proof (COA/batch identity) is the primary conversion asset, not a footer credential**, because the category's trust deficit is the #1 objection and none of the corpus faces it as acutely. Dandy can beat the category by being the brand whose numbers always reconcile — the single most common leak found across all 14 brands is self-contradicting math and proof.

**The 10 findings that matter most:**

1. **Subscription-first with a degraded one-time is universal.** All 5 Tier-1 brands present subscribe as default/first with benefits attached only to it; the one-time is a deliberate decoy (AG1 charges +25% with zero gifts; Grüns strips free shipping; PetLab prices it as a penalty). Dandy's selected-by-default toggle is correct; the design question is only how honestly the contrast is drawn.
2. **Per-day/per-serving reframing appears on every winner's buy box** (Grüns "$1.78/day" on *both* plans; AG1 "less than $3 a day"; IM8's sticky "Start from $2.61/day" CTA; Everyday Dose "$0.82/cup"). Dandy's 30-ct sub at $47.99 = **$1.60/day** — cheaper than the corpus and beggingly quotable *(rendered on-site as $1.60/gummy per the F-D supersession, `DANDY_DR_DESIGN_PROPOSAL.md` §3.4.5)*.
3. **The best brands never discount; they gift-stack and anchor.** AG1 has held $79 since 2023 — all offer energy goes into channel-varied free-gift stacks, a decoy one-time, and per-day math. Grüns, by contrast, runs four mutually contradictory discount anchors at once and it reads as its weakest surface. Discount incoherence is the category's most repeated self-inflicted wound (Grüns, Goli, Resilia, IM8, BioRoot all exhibit it).
4. **Guarantee microcopy welded under every buy button** (AG1's "90-day money back guarantee / Update or cancel anytime" beneath each CTA) is the cheapest high-leverage pattern in the corpus — and the most commonly betrayed one: 6 of 14 brands show guarantee terms on the PDP that shrink in the policy fine print. An honest, identical guarantee sentence everywhere is a differentiator by itself.
5. **Proof sequencing beats proof volume.** AG1 and IM8 load credibility *before* first price exposure and put verification depth (trial IDs, COAs, bios) *after* the ask; economic proof (replacement-value math) sits immediately before the offer. Grüns puts quantitative proof before emotional. The order is the craft; Dandy has few proof assets but full control of order.
6. **Expectation-setting timelines double as retention infrastructure.** Nutrafol's "1-3 months / 6+ months," AG1's /90-days ladder mapped exactly onto the guarantee window, Grüns's 30/60/90 aligned to renewal cycles. For Dandy this becomes the compliant "start low, find your Dandy" onboarding arc — usage guidance, not an effect ladder.
7. **Repeated conversion moments, ~every two scroll modules** (AG1: 9 purchase CTAs on one homepage; Resilia duplicates the entire buy box top and bottom). Long pages convert when every proof block resolves into an ask.
8. **Retention is engineered at acquisition time.** IM8 disclosed a 6-month gift ladder on the PDP; Everyday Dose schedules gifts for months 2–5; AG1 vests rewards at 90 days (past both churn peak and guarantee window). The corpus treats "what you get later" as a selling asset, not a lifecycle afterthought.
9. **Restraint is a premium signal.** Dr. Squatch (sub not preselected, zero urgency) and Jones Road (honest 4.23★ across 85k reviews, no promo pressure) show that the *absence* of dark patterns is itself conversion-positive for trust-sensitive purchases — and a kratom purchase is maximally trust-sensitive.
10. **Every fake-urgency device found in the corpus was detectably fake** (MUD/WTR's timer stuck at 00:00:00, Resilia's countdown pinned at 02:00:00 with a stale Spanish July-4th banner in August, Auri's "87% Sold" on an evergreen SKU, BioRoot's "sold every 28 seconds"). For a legally-scrutinized category these aren't just trust leaks, they're regulatory exposure. Dandy's handoff already prohibits them; the corpus proves the prohibition costs nothing.

**The strategic forks** (full treatment in §7): long-form vs. short-form → *hybrid: long page, short modules*; discount-led vs. value-led → *value-led with one honest anchor*; quiz-gated vs. direct → *direct, with a 30-second selector module*; founder-led vs. brand-led → *founder-led bridge until real reviews exist*; subscription-first vs. one-time-first → *already correctly decided hybrid*; premium vs. accessible design → *already decided premium-joyful (Figma binding)*.

---

## §2. CORPUS OVERVIEW

| Brand | Positioning | Price point | Offer model | Page archetype | Dominant conversion mechanism | Best-in-class at | Hypothesis verdict |
|---|---|---|---|---|---|---|---|
| **Grüns** | Playful mass-premium greens-as-gummies | $49.99 sub / $66.65 OTP (28 packs) | Sub-first recurring; 1–2 qty; no prepaid | Ad-angle LP matrix + conventional PDP | Per-day framing + decoy one-time + avatar-matched LPs | Angle-segmented LP architecture at scale; behavioral guarantee proof ("<1% use it") | **Confirmed, refined**: prepaid framing absent; pricing presentation is actually its weakest surface |
| **Goli** | Mass-market accessible gummy vitamins | $14.88/bottle framing; $44.63 3-pack | Hybrid; modest 10% sub | Short, compressed PDP; repetition of proof | Format legibility + taste hook + values halo | Compression; broad-market accessibility; cause-marketing as objection-neutralizer | **Confirmed, refined**: architecture best-in-class, execution decayed (dead offers, contradictions) |
| **Resilia** | DR botanical funnel ("ancient herbs") | $29.99 sub vs $59.99 OTP | Sub-default, 50% spread; 3-rung ladder | Meta-ads-style hard funnel, duplicated buy box | Quantity ladder + gift-unlock gamification | Ladder structure (rungs, flags, locked gifts, free-ship top rung) | **Confirmed for ladder only**; proof unverifiable, retention UX indefensible (Trustpilot 4.2, 18% 1★) |
| **IM8** | Ultra-premium celebrity+clinical | $89/mo or $235/12wk; stack to $548 | Sub-first, quarterly-steered (4 levers) | Premium proof-stacked PDP | Proof-before-price + disclosed 6-month gift ladder | Proof architecture (registered RCTs on-page, SAB, NSF); welcome/member value | **Confirmed**; soft spots: perception-survey data in RCT clothing, metric inconsistencies |
| **AG1** | Premium category-creator ("Foundational Nutrition") | $79/mo held since 2023; $99 OTP decoy; $799 annual | Sub-only in practice; gift-stacking, never discounts | Modular lander factory + long education-conversion pages | Industrialized proof sequencing + repeated conversion moments | Trust architecture; price integrity; conversion-moment cadence | **Confirmed + refined**: the moat is industrial (module library, /ctr twins, lander attribution), not editorial |

Tier 2 verdicts in one line each (details §4): Auri (format-pleasure positioning; urgency theater to avoid) · MUD/WTR (category-replacement + voice; dead timer to avoid) · Everyday Dose (months-2–5 gift ladder — the standout transferable retention mechanic; renewal step-up to avoid) · Nutrafol (results-timeline + program-not-product) · Dr. Squatch (voice + restraint-as-trust + bundle ladders) · PetLab (pre-sell craft; penalty-price ambiguity to avoid) · Jones Road (fit-risk removal + honest imperfect ratings) · Ridge (99-day trial memorability; warranty-as-product; buy-box bundle toggle) · BioRoot (the complete anti-pattern map: pre-checked hidden-price subscription, shrinking guarantee, irreconcilable numbers).

---

## §3. BRAND TEARDOWNS (Tier 1)

### 3.1 Grüns

**Scroll map (PDP, primary conversion page).** (1) Triple rotating announcement bar — price-drop event, flavor scarcity, "FREE SHIPPING + 30-DAY GUARANTEE" — three DR levers pre-loaded before content. (2) Benefit-bulleted title ("60+ potent ingredients to revive whole body vitality") — outcomes before ingredients. (3) Rating line "4.8/5.0… 100,000 reviews, 1M+ customers" — mass proof at the decision point. (4) Configurator: flavor → sugar level → quantity — an engagement ladder that invests the shopper before price. (5) Plan selector — "Subscribe & Save (Most Popular)" $49.99 was $66.65 at "$1.78/day," with Free Shipping Today / Pause Or Cancel Any Time / 30-Day Money-Back Guarantee attached *only* to the sub; one-time $66.65 at "$2.38/day" with none — the one-time exists to be worse. (6) CTA "Start Now" + "Discount auto-applied, no code needed." (7) Guarantee trio incl. HSA/FSA. (8) Education accordions. (9) Problem stat ("90% of U.S. adults don't meet recommended daily nutrient intake"). (10) Survey outcomes ("67% experienced better, more regular digestion," 3k+ users, honestly sourced). (11) ~18-name testimonial wall salted with competitor-switch quotes ("I was taking AG1… half the price"). (12) Shaun White — "Paid spokesperson and investor" disclosed. (13) Us-vs-Them table. (14) Reason-why discount story ("It's our third birthday… lowering prices… indefinitely"). (15) Flavor scarcity ("Going fast. No restocks planned."). (16) Cross-sell. (17) FAQ. (18) SMS capture ("Sign Up for 55% Off").

**Five things Grüns does better than anyone in the corpus.** (1) **Per-day framing on both plans** so the delta reads as ~$0.60/day, not $17/month. (2) **Behavioral guarantee proof**: "Less than 1% of customers use our Money-Back Guarantee" — a satisfaction stat disguised as a policy note; beats any star rating. (3) **Avatar-segmented LP architecture** (~99 live /pages/ LPs: GLP-1, perimenopause, fiber, male fertility — each with segment-mirroring headlines like "Perimenopause Changed Your Body. Your Multivitamin Didn't Notice."). (4) **Proof with legal armor**: FTC-disclosed paid spokesperson, compensated-testimonial disclosure, own 12-week n=120 RCT, testing specificity ("70 different pesticides… 4 types of heavy metals"). (5) **Keep-the-product refund** ("You do not need to send the product back") — zero-effort risk reversal.

**Offer architecture.** 28 daily packs = 4-week supply. $49.99 sub vs $66.65 one-time (~25% spread); marketed elastically as "Save 55%"/"61% off" against stacked LP anchors. Free shipping sub-only ("$8 value"). 1–2 pouch quantity ("Buy 2 Save $5"). No prepaid tier on the PDP. Guarantee 30-day, first order, keep the product, self-serve-only cancellation. LP gift stacks itemized to ~$130 value. "Golden Gummy" subscriber status with VIP partner perks (Caraway, Hyperice). Referral $20. HSA/FSA. No BNPL anywhere — notable deliberate omission at a <$60 ticket.

**Proof sequence.** Rating/counts → guarantee-usage stat → tested badges → nutrition labels → RCT → lot-testing specificity → problem stats → survey outcomes → testimonial wall → disclosed celebrity → comparison table → scarcity → FAQ guarantee restatement. Quantitative before emotional throughout.

**Notable omissions.** No BNPL; no prepaid plan; no exit-intent in rendered content; competitor names kept off the PDP proper (only in testimonials — plausible deniability).

**Weaknesses/leaks.** Discount-math incoherence is severe ($29.99 "starts at" vs $49.99 widget vs 55% vs 61% vs 25% actual — reference-price/FTC exposure); concurrent conflicting promos ("Birthday" + "Early Summer Sale" + rolling "Order by August 16th" deadlines); banner guarantee wider than policy (first order only, excludes sale items); help center invisible to SEO so "cancel Grüns" queries resolve to hostile third-party pages; sugar objection price-punished (+$5 sugar-free).

**Transferable to Dandy:** per-day framing on both plans; benefits checklist inside the buy box; keep-the-product guarantee posture (worth pricing out); behavioral guarantee stat (once true data exists); reason-why for any discount; testing-specificity copy; ritual mnemonic ("Rip. Tip. Enjoy." → Dandy's format story); avatar-segmented education pages (as SEO, since kratom can't buy the ads). **Brand-locked:** celebrity investor; 55%-gated SMS bribes; the elastic multi-anchor discount storytelling (a liability anyway); Minions-style licensed flavor drops.

### 3.2 Goli

**Scroll map (ACV PDP).** (1) Double announcement bar — charity pledge ("donate a 6-month supply… to a child in need") then "FREE SHIPPING ACROSS THE US!" — values and cost objections killed pre-scroll. (2) Hero "WORLD'S FIRST Apple Cider Vinegar Gummies" — primacy claim. (3) "Taste the Apple. Not the Vinegar.®" — the #1 category objection, killed in six trademarked words. (4) Buy box: "Subscribe & Save — 10% OFF & Cancel Anytime," "$14.88 each… Total $44.63… Regular price $57.00," 5/3/1-pack tiers, CTA "CHECKOUT NOW." (5) 7-bullet benefit stack. (6) Supplement facts. (7) 13-item allergen exclusion list. (8) "3 Reasons" USP recap. (9) Taste-led testimonials. (10) "TRY IT, RISK-FREE!" guarantee. (11) Press logos. (12) Charity bookend. (13) FDA-disclaimer footer.

**Five best-in-corpus elements.** (1) **Format legibility** — the gummy is the argument; education is one sentence per concept, everything else is compression. (2) **Trademarked objection kill** ("Taste the Apple. Not the Vinegar.®"). (3) **Benefit-triad taglines** ("Relax. Restore. Unwind.†") — scannable three-beat rhythm reused across the catalog. (4) **Values-as-conversion-device** — the charity pledge occupies position #1 on every page plus B-Corp; cause-marketing run as a top-of-page objection neutralizer, not a footer afterthought. (5) **Allergen negative list** — 13 exclusions answering every dietary objection in one block; nobody self-excludes.

**Offer architecture.** ~$19 list/bottle; 3-pack default at $44.63 vs $57 anchor (~22%); modest 10% sub discount (deliberate margin restraint vs the category's 15–25%); unconditional free US shipping, no threshold games; 30-day guarantee that honestly covers *opened* bottles (but the PDP omits the 30-day limit and return-shipping cost stated in the FAQ); Afterpay in FAQ but not merchandised at the buy box; retail wall (Walmart/Target/CVS) as distribution proof.

**Proof sequence.** Charity → free shipping → retailer wall → "1,000,000+ Reviews" → guarantee → press → B-Corp → "WORLD'S FIRST" → patented formula → supplement facts → allergen list → testimonials → guarantee repeat → press repeat → charity bookend. Every proof type repeats ~2×; the ad-landing BOGO path runs a denser number-led version (30M bottles → 5.4M customers → platform stars → comparison table).

**Notable omissions.** No urgency or scarcity anywhere; no long-form science on the conversion path (deliberate — format and taste do the persuasion); no review widget at the buy box despite the seven-figure claim.

**Weaknesses/leaks.** Live worse-deal legacy pages (a $57 flat 3-pack coexists with the $44.63 3-pack); the flagship BOGO offer page is stranded "Out of stock"; sub-discount ambiguity (static totals identical for both toggles); three unreconciled proof magnitudes (1M reviews / 5.4M customers / 30M bottles); guarantee scope differs across PDP, FAQ, and Terms; dosage inconsistency (1–2 gummies 3× daily vs 1–2 daily); advisory board 3/4 off-category (radiology/health-informatics execs). The meta-lesson: **compression architecture survives; unmaintained offer surfaces rot into contradiction.**

**Transferable to Dandy:** benefit-triad compression (Dandy already has "CLEAR. UPBEAT. SWITCHED ON."); one-sentence-per-concept education; allergen/exclusion block; unconditional free-shipping *clarity* (Dandy's version: flat $5.95 or free, stated identically everywhere); repetition-of-proof cadence. **Brand-locked:** "World's First" primacy; mass-retail logo wall; 10% shallow sub discount (Dandy's economics differ); charity halo (don't bolt on a cause for conversion).

### 3.3 Resilia

**Scroll map (oregano PDP).** (1) "SUMMER SALE… Up To 70% Off" + countdown pinned at 02:00:00 (+ a stale Spanish "OFERTA DEL 4 DE JULIO" variant in August). (2) Symptom-led hero "A Calmer Gut Starts Here." (3) Six-icon benefit row. (4) "Rated 4.9 • Thousands of 5-Star Reviews" + reviewer photos. (5) **The ladder**: Buy One $29.99 / Buy 2 Get 1 Free Gift $59.99 / Buy 3 Get 2 Free Gifts $89.99 "(Most Popular)" — subscribe tab default, savings numbers inflated by gift retail values. (6) Locked-gift ladder ("$24.99: FREE Bamboo Glass Jar… (Locked)"). (7) "Refills Ship Every 30 Days | Stop or Cancel Anytime." (8) Delivery estimator "Ships from US 🇺🇸." (9–13) Education accordions with "noticeable improvements in 7–14 days." (14) Animated stat counters (render "0" without JS). (15) Mid-page CTA anchoring back to the buy box. (16) 4-compound ingredient science ("20:1 extract… equivalent of 6,000mg"). (17) Tagged testimonials. (18–19) Benefits grid + "82 studies" (uncited). (20) Week 1 → Week 4+ results timeline. (21) "5 Reasons Different." (22) ✓/✗ comparison table vs "Other Brands." (23) Guarantee block. (24) UGC screenshot carousel. (25) Stock-up rationalization. (26) **Duplicated full buy box** + "93% Sold." (27+) Footer.

**Five best-in-corpus elements.** (1) **Ladder structure** — 3 rungs, per-rung savings math, flag, free-shipping top rung: the visual grammar Dandy's 1/3/5 cards should match (minus the dishonest anchors). (2) **Locked-gift gamification** — gifts shown "(Locked)" until a tier is reached; loss aversion made visible. (3) **Duplicated buy box** after education — the second conversion moment captures readers the first box couldn't. (4) **Basket-replacement value stack** ("What people typically buy separately… $135/mo… You save $105/mo"). (5) **Trust-badge triplet at first CTA** ("30-Day Risk-Free Trial / Third-Party Tested / Ships from USA").

**Offer architecture.** Uniform $29.99 sub entry across SKUs vs $59.99 one-time + $4.95 shipping — an extreme 50% subscribe spread that makes one-time look irrational; compare-ats inflated with accessory retail values ($219.98 anchor on an $89.99 rung); 30-day "no questions asked" guarantee that fine-prints into "returns are not required and not accepted," non-refundable shipping, and a 24-hour pre-billing cancellation deadline; multi-domain funnel sprawl with *different* prices per domain (resilia.shop vs get.resilia.shop vs resiila.us).

**Proof sequence.** Aggregate rating → reviewer photos beside price → origin/logistics → guarantee → animated stats → ingredient science → tagged testimonials → tradition claim → week-by-week timeline → listicle → comparison table → guarantee block → UGC carousel → **ends on scarcity ("93% Sold"), not proof** — the tell of a pressure funnel.

**Notable omissions.** No third-party review widget (self-declared 4.9 vs external Trustpilot 4.2 with 18% one-star); no citations, no COAs despite "Third-Party Tested" claims; no founder, no faces, no press; no BNPL at an $89.99 rung.

**Weaknesses/leaks.** The whole trust layer is synthetic: pinned countdown, static "93% Sold," stale holiday banner, "VERIFIED CUSTOMER" badges with no mechanism, uncited "82 clinical trials," billing-complaint pattern externally documented. Structure ≠ trust: Resilia proves ladder mechanics convert *and* that executing them dishonestly compounds into a public reputation gap.

**Transferable to Dandy:** the ladder's visual grammar (rung cards, per-rung math, flag, free-ship top rung); the duplicated buy box / recap conversion moment (Dandy's `dandy-recap` section is exactly this); symptom/benefit-led hero for problem-aware traffic; trust triplet at first CTA; "no aftertaste/burn"-style category-objection block (Dandy analog: taste/bitterness of kratom, solved by gummy). **Brand-locked (and prohibited for Dandy):** every urgency device, gift-value-inflated anchors, 50% sub spread with penalty one-time, multi-domain price inconsistency.

### 3.4 IM8

**Scroll map (Essentials Pro PDP).** (1) NASA-scientist quote bar *above* the buy box. (2) 18-image gallery incl. ingredient macros. (3) "4.8… 22,104 reviews | 470k+ purchases | 48M+ servings." (4) "90 ingredients… Co-founded by David Beckham." (5) Benefit bullets: replaces 16 supplements / NSF / 90-day guarantee. (6) **Registered RCT inside the buy area** ("12-WEEK RANDOMIZED CONTROLLED TRIAL… ClinicalTrials.gov ID NCT06655597"). (7) Flavor selector with per-serving price on every variant. (8) Partner blood-test perk. (9) Plan selector: 90-day "SAVE 30% + FREE GIFTS **BEST VALUE**" vs 30-day "SAVE 20% **MOST POPULAR**." (10) Welcome-kit accordion disclosing **month-by-month future gifts** ("Month 3: Signature Red Bottle ($28), White Hat ($15)"). (11) CTA. (12) Vitamin Angels impact line. (13) HSA/FSA. (14) Guarantee icon row. (15) "What You'll Feel" tiles ("More Energy — 95% felt a noticeable daily boost"). (16) Quarterly-only Transformation Program. (17) Education tabs incl. wine-language tasting notes. (18) "What's in it and what's not" exclusion list. (19) Ambassador testimonials.

**Five best-in-corpus elements.** (1) **Proof-before-price sequencing** — celebrity, NASA, clinical stats, NSF, and ambassadors all land before the first price; verification depth (trial IDs, bios, third-party results) after the ask; risk reversal last. (2) **Disclosed 6-month gift ladder** — retention engineered into the acquisition pitch. (3) **Stat→feeling bridge** ("The Clinical Trial said 95% felt more energy. Here's what that actually feels like") — the signature copy move, converting clinical proof into imagined lived outcome. (4) **Four-lever plan steering** to quarterly (deeper discount, longer guarantee, bigger kit, better perks) without ever saying "commit." (5) **Celebrity-as-co-founder framing** — ownership, never endorsement, and never asked to carry proof alone (always captioned with NSF/clinical companions).

**Offer architecture.** $89/4wk (20% off $112) or $235/12wk (30%); one-time $112 listed last with no benefits; welcome kit itemized $71–97 + months-2–6 gift calendar; guarantee length tied to plan (90-day quarterly / 30-day monthly); price-lock promise; pause + one-click cancel; 15/15 referral; HSA/FSA framed as "Save an average of 30%"; no BNPL for a $235+ charge (soft spot); scarcity confined to a subscriber-only upsell page (72-hour founding-member "$75 for life") — restraint on core surfaces, pressure only off the main path.

**Proof sequence.** See §3.4 scroll map; the pattern is credibility → ask → verification → intimacy (founder letter) → risk reversal.

**Notable omissions.** No coupon culture on core surfaces; no countdowns on PDP/homepage; newsletter offers "insights" not a discount (price integrity); no browsable review feed (aggregate + curated only).

**Weaknesses/leaks.** Metric drift (48M vs 50M servings; 470k vs 700k purchases); the same 22,104 review count displayed on every product (brand-level proof borrowed by newer SKUs); perception-survey outcomes (n=60) dressed in RCT language and reused across products; "$78/mo" headline vs "$235 billed every 12 weeks" sticker-shock risk; 404'd footer paths and a staging-looking help subdomain. Premium brand polish, mid-tier operational polish.

**Transferable to Dandy:** proof-before-price ordering; per-serving price on every variant card; exclusion list ("what's not in it" — for kratom: no 7-OH isolates if true per COA, no synthetic adulterants, etc., per legal); tasting-notes-style sensory copy for the gummy; stat→feeling bridge *structure* (Dandy's version bridges COA/testing facts → "what that means in the bag"); guarantee-length-by-plan concept if economics allow. **Brand-locked:** celebrity co-founder; ClinicalTrials.gov IDs; NASA/ISS proof; blood-test partner perks; the $97 luxe welcome kit (margin filter until proven).

### 3.5 AG1

**Scroll map (homepage, 20 modules; CMS-confirmed order).** Promo banner → mega-nav with claims inside the menu → 3-slide hero rotating proof *types* (celebrity pun "Better Mornings, No Matter Hugh You Are." / product claim / "Trusted by Dr. Andrew Huberman") with a "50,000+ verified 5-star reviews" ribbon welded under every hero CTA → 4-badge trust grid (NSF) → video reviews with a formulation-change honesty line → persona checklist ("It's a match if you:… Are on GLP-1s…") → clinical claim with RCT footnotes ¹⁻⁴ → 75+ ingredient education carousel → Mix/Drink/Thrive ritual → 10-quote endorser wall with tenure stamps ("AG1 DRINKER SINCE 2021") → **replacement-value chart ($79 vs $225, itemized)** → dated text reviews → **receipt-format offer table** with struck gift values and "Upgrade My Health" CTA → dedicated guarantee hero ("Feel the Difference or It's On Us") → AGZ cross-sell → FAQ ("Is this another greens powder?") → science blog carousel → footer carrying five full clinical-trial design descriptions. Conversion path continues to a **2-step build-a-bundle configurator** (format → plan) with footer disabled, "Most Popular"/"Best Value" badges, and — remarkably — the $149 double subscription pre-selected as default.

**Five best-in-corpus elements.** (1) **The modular conversion factory** — a named module library assembled into thousands of numbered landers (module stacks literally encoded in URLs), /ctr conversion-tuned twins of every education page, versioned shop flows, lander-ID attribution threaded into checkout. (2) **Price integrity via gift-stacking** — $79 untouched since 2023; discounts replaced by channel-laddered gift stacks, a $99 one-time decoy, per-day math, and HSA/FSA framing. (3) **Conversion-moment cadence** — 9 purchase CTAs on one page, guarantee microcopy under every one. (4) **Quantified-testing trust spine** — NSF everywhere, "500 pesticides… 280 banned substances… 950 contaminants," *published* routine/annual test reports. (5) **Proprietary category language** ("Foundational Nutrition," "Daily Health Drink") — you cannot price-shop a category of one.

**Offer architecture.** $79/mo single (anchor $99 † "value of one-time purchase"), $149 double (default!), $223.50 family, $99 one-time decoy, $799 prepaid annual with milestone-gift ladder and hard no-skip terms; welcome kit varies by traffic source ($47–$155 stated value) — offer laddering by channel without touching base price; 90-day guarantee (marketing: "we'll make it right"; T&C: return required, 6-week refund, shipping non-refundable); membership rebrand with rewards vesting at 90 days — past both the churn peak and the guarantee window.

**Proof sequence.** Aspirational → institutional → scientific → economic (immediately pre-offer) → risk reversal (immediately post). The research page runs it *reversed* for skeptics. This conditional ordering is the sequencing lesson.

**Notable omissions.** No coupons; no urgency anywhere on owned surfaces; no browsable review feed.

**Weaknesses/leaks.** Guarantee marketing/T&C mismatch; offer fragmentation (homepage kit visibly weaker than lander kits); stale study stats coexisting with new ones; annual plan contradicting the "pause, skip, or cancel anytime" flagship claim; recycled review quotes; self-constructed anchors ($99 †, $225 chart) walking a reference-price tightrope; a bot wall that makes the site invisible to agentic shoppers.

**Transferable to Dandy:** guarantee microcopy under every CTA; receipt-format offer presentation; replacement/value math done honestly (Dandy's version: vs. bar tab / other unwind spends — legal permitting); repeated conversion moments; category language Dandy already owns ("KRATOM, MADE EASY," "ONE PLANT. TWO GEARS."); quantified-testing proof spine backed by real COAs (Dandy's strongest inheritable asset); education-terminates-in-benefit module grammar; persona checklist ("It's a match if you…"). **Brand-locked:** the lander factory (needs paid-traffic scale kratom can't buy), celebrity/expert roster, ClinicalTrials.gov registrations, $799 annual (processor + trust stage prohibit).

---

## §4. TIER 2 QUICK-HITS

**Auri Nutrition** — *Format-pleasure positioning.* "Skip bitter powders and hard-to-swallow capsules… Tastes like a treat"; the enemy is the category's dominant *friction*, not a competitor brand. Works because it converts compliance (the reason supplement subs churn) into indulgence. **Transferable: yes, directly** — Dandy's gummy-vs-smoke-shop-powder story is the same move ("THE GUMMY THAT MAKES KRATOM EASY"). Avoid its urgency theater ("87% Sold" + countdown on an evergreen SKU) and its renewal step-up ($31.99 first order → $39.99 refill).

**MUD/WTR** — *Category-replacement + voice-as-moat.* Sells an exit from an incumbent daily habit ("dreamt up to reduce my coffee dependence") with precise dose math (35mg vs 90–100mg caffeine) and a self-aware tribe voice. Works because the budget and the ritual slot already exist in the buyer's life. **Transferable: the replacement frame** — Dandy's "A BETTER WAY TO TAKE THE EDGE OFF" is the alcohol-occasion version; quantified serving transparency is the dose-math analog. The voice moat requires editorial commitment Dandy shouldn't fake. Avoid: its literally dead countdown (00:00:00) and inflated gift-value anchors.

**Everyday Dose** — *The months-2–5 loyalty gift ladder* ("Month 3: FREE Yeti-Inspired 16oz Tumbler (worth $25)"… "More surprise gifts!"). The standout transferable retention mechanic in the whole corpus: converts the churn-peak months into anticipated unboxings, disclosed at acquisition time. **Transferable: yes, once margin is verified** (Dandy version: branded jar, travel case, merch at months 2–4). Avoid: first-order $49 → renews $66 (a 35% step-up), and the fake "CONGRATS YOU'VE UNLOCKED FREE SHIPPING!" milestone for a standing policy.

**Nutrafol** — *Program, not product.* Named-physician wall, "#1 Dermatologist-Recommended" flag, and a results timeline ("1-3 Months… 6+ Months") that converts the churn window into a compliance window, with the guarantee gated to completing the protocol. **Transferable: the expectation-setting timeline**, rebuilt for Dandy as a responsible-use/onboarding arc (find-your-serving guidance — never an effect ladder). The MD-endorsement stack is unavailable and, for kratom, a prohibited "medical badge" risk.

**Dr. Squatch** — *Restraint as trust + humor as objection-handling.* Subscription **not** preselected, zero urgency, jokes carrying the ingredient claims ("Sudisfaction Guarantee"), and monetization moved to self-built bundle ladders and an 8×-unit-price shipping threshold. **Transferable: the proof that honest defaults don't cost conversion when offer architecture does the lifting** — and the branded-guarantee idea (a named, ownable guarantee). Dandy keeps its sub default-on (David's call, corpus-supported) but borrows the no-pressure surface.

**PetLab Co.** — *Pre-sell craft.* Vet-authored advertorial → proof-stacking quiz interstitial → subscription offer; a masterclass in narrative funnels. **Transferable: the structure, as SEO/education pre-sell** (kratom can't buy the ads that feed it). Avoid: "stock is flying off the shelves" evergreen scarcity, "Check Availability" curiosity-gap CTA, and headline prices that quietly require a subscription.

**Jones Road Beauty** — *Fit-risk removal + honest imperfect proof.* A quiz claiming "90% shade match accuracy," free exchanges framed as a service, and — the gem — "4.23 Based on 85441 Reviews" displayed un-gated. Works because a non-perfect average at scale reads more credible than any 4.9. **Transferable: the honesty posture** — when Dandy has reviews, show the real distribution; frame the guarantee as a service ("find your Dandy or your money back"), not a defensive policy.

**Ridge** — *Risk reversal with personality + PDP engineering.* "99-DAY RISK-FREE TRIAL | LIFETIME GUARANTEE" in a persistent header (odd number = memorable), warranty covering loss/theft (warranty-as-product), buy-box bundle toggle ("FULL KIT — SAVE 26%"), and 7-of-12 gallery slots used for infographics. **Transferable: the infographic-first gallery** (mobile users swipe images, not scroll text — Cansu asset request) and a memorable, specific guarantee number. Avoid: perpetual 40–48%-off promo stacking that trains customers never to pay list.

**BioRoot Labs** — *The complete anti-pattern map.* `"subscribeByDefault":true, "showPrices":false` in the page source — pre-checked subscription with hidden recurring pricing; 60-day guarantee on the PDP that shrinks to 30-day/first-sub-only in the ToS; four irreconcilable customer counts on one funnel; uncited outcome percentages. Its one genuinely smart move: **fusing the results window to the refund window** ("Feel the difference in 60 days or your money back"). **Transferable: only that one move — and the entire rest as a checklist of what Dandy's release scan should make impossible.**

---

## §5. THE MASTER ELEMENT REGISTRY

**How to read.** Every distinct element found in the corpus, grouped by domain D1–D14 (the second required view); the tier-grouped view follows as an index. Scores are 1–10 per the PART 6 rubric — **I**mpact ×.30, **F**it ×.20, **E**vidence ×.15, **C**ost-inverse ×.15, **M**oat ×.10, **R**isk-inverse ×.10. Fit/Cost/Risk are scored *for Dandy specifically* (pre-launch premium kratom, mobile-first, no paid social, legal-gated claims, partially-built theme — a pattern already implemented in `sections/dandy-*` scores Cost 9–10). Anti-patterns carry Tier **F** and no scores; they are specified in §8. Brands: G=Grüns, Go=Goli, R=Resilia, I8=IM8, A1=AG1, T2:x=Tier-2 brand. Full evidence (surface, position, verbatim excerpt, OBSERVED/INFERRED/UNVERIFIED tag) for every row lives in the per-brand capture files listed in §13.

### D1 — Funnel & page architecture

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-001 | Minimal nav / single commercial path | G, Go, A1 | Fewer exits; one dominant "Shop" route | 7·9·9·10·3·9 | 7.95 | A | #universal #quick-win |
| E-002 | Education-led homepage routing to PDP (no hero buy box) | A1; Dandy mandate | Category translation before the ask for cold traffic | 7·10·7·10·4·9 | 7.95 | A | — |
| E-003 | Avatar/angle-segmented LP matrix | G (~99 LPs), A1, I8 | Message-to-visitor congruence at scale | 8·6·9·4·6·7 | 6.85 | B | #compounding |
| E-004 | Conversion-tuned twins of education pages (/ctr) | A1 | Same content, CRO-hardened for high-intent traffic | 7·4·5·4·5·8 | 5.55 | B | — |
| E-005 | Two-step configurator before price exposure | A1 BaB, T2:ED | Micro-commitment; choice before sticker | 7·6·7·5·4·8 | 6.30 | B | — |
| E-006 | Exit-path removal on money pages (no footer) | A1 | Decision-point distraction removal | 5·6·6·8·2·7 | 5.70 | B | — |
| E-007 | Quiz-as-presell funnel | G, T2:Nutrafol/Squatch/PetLab | Diagnosis-before-product; problem ownership | 7·5·8·3·5·7 | 5.95 | B | — |
| E-008 | Advertorial/listicle presell pages | G, R, T2:PetLab/Ridge | Editorial frame lowers ad-guard; sells problem first | 8·4·8·4·3·4 | 5.70 | B | #risky |
| E-009 | Dedicated reviews page/wall | G, I8, A1 | Deep-proof surface for validators + SEO | 6·7·9·7·4·8 | 6.80 | B | needs real reviews |
| E-010 | Comparison/conquest SEO pages | I8 (vs AG1), A1 | Ambush comparison-shopping intent | 7·7·7·6·6·6 | 6.65 | B | #compounding |
| E-011 | Duplicated buy box / offer recap at page end | R, A1; Dandy `dandy-recap` | Second conversion moment after full education | 8·10·8·10·3·9 | 8.30 | A | #universal #quick-win |
| E-012 | Self-selection module ("It's a match if you…" / format chooser) | A1, R; Dandy `dandy-format-chooser` | Choice-paralysis removal; visitor self-segments | 7·9·7·9·4·9 | 7.60 | A | — |
| E-013 | Multi-domain funnel sprawl w/ divergent offers | R | (Ad-account redundancy) — creates contradictory realities | — | — | **F** | see F-15 |

### D2 — Above-the-fold / hero system

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-014 | Offer + risk-reversal announcement bar (one true message) | all T1 | Objections neutralized pre-scroll | 7·9·10·10·2·9 | 8.00 | A | #universal #quick-win |
| E-015 | Rotating multi-message announcement stack | G (×3) | More levers pre-loaded — but dilutes the one true offer | 5·4·6·9·2·7 | 5.45 | C | conflicts w/ handoff |
| E-016 | <3-second format legibility in hero | Go, G; Dandy gummy hero | "What is this thing?" answered instantly | 9·10·9·9·5·10 | 8.90 | **S** | #universal #mobile-critical |
| E-017 | Category-translating headline | A1 "Daily Health Drink"; Dandy "KRATOM, MADE EASY." | Owns the frame; converts unfamiliarity into a category of one | 9·10·8·10·7·9 | 9.00 | **S** | #compounding |
| E-018 | Benefit-bulleted PDP hero (outcomes before format facts) | G, I8 | Sells the felt outcome, not the SKU spec | 8·9·9·10·3·7 | 8.05 | A | legal-gated copy |
| E-019 | Rating + count adjacent to title | all T1 | Mass proof at the exact decision point | 8·6·10·6·3·8 | 7.10 | A | bridge: absent until real |
| E-020 | Trust triplet at first CTA (tested / shipping / guarantee) | R, A1, I8 | Top-3 objections pre-killed at the click | 8·10·10·9·4·9 | 8.55 | **S** | #universal #quick-win |
| E-021 | Rotating proof-type hero (celebrity/product/expert) | A1 | One hero serves three buyer psychologies | 6·7·6·7·3·8 | 6.25 | B | — |
| E-022 | Proof ribbon welded under hero CTA | A1 | Social proof physically adjacent to the click | 7·6·7·8·3·8 | 6.65 | B | bridge until reviews |
| E-023 | Price visible above the fold on PDP | all T1 | No price-hunting friction; qualifies traffic | 8·10·10·10·2·10 | 8.60 | **S** | #universal #mobile-critical |
| E-024 | Mobile fold budget (media→benefits→choices→CTA fast) | corpus mobile-first; Dandy ≈1,400px target | The fold is the funnel on mobile | 9·10·9·8·3·10 | 8.55 | **S** | #mobile-critical |
| E-025 | Hero video/motion | limited corpus evidence | Demonstration beats description (unproven here) | 5·6·4·4·3·8 | 5.00 | C | — |

### D3 — Offer architecture & pricing psychology

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-026 | Per-day price reframing on BOTH plans | G ($1.78 vs $2.38/day), A1, I8, T2:ED | Shrinks price to coffee money; makes the sub delta read as cents | 9·10·9·10·4·9 | 8.85 | **S** | #universal #quick-win #subscription-critical |
| E-027 | Per-unit price on every ladder rung | Go, R, T2:JR | "$35.99/pouch" makes rung 3 self-evidently smarter | 8·10·9·10·3·10 | 8.55 | **S** | #quick-win |
| E-028 | Single honest reference price; anchor discipline | A1 († = "value of one-time purchase") | One coherent anchor everywhere; savings claims survive scrutiny | 9·10·7·9·6·10 | 8.70 | **S** | #compounding |
| E-029 | Visible 1/3/5 quantity ladder w/ per-rung savings math | R (structure), Go, T2:ED/Auri/JR | AOV ladder; the next rung always looks cheap per unit | 9·10·9·10·4·8 | 8.75 | **S** | built; #subscription-critical |
| E-030 | "Most Popular"/"Best Value" tier flags | A1, I8, R, T2:JR/ED | Social default; decision shortcut | 8·9·10·10·2·8 | 8.20 | A | must be true post-data |
| E-031 | Reason-why for any discount | G (birthday, "indefinitely") | Discounts without cheapening; preserves price integrity | 6·8·6·10·3·9 | 7.00 | A | — |
| E-032 | Itemized free-gift value stack | A1 receipt, I8, T2:MUD/ED | Reciprocity + concrete arithmetic beats "% off" | 8·6·9·6·4·7 | 6.95 | B | margin-gated; bridge: guide/stickers |
| E-033 | Free shipping as subscription benefit | all T1 | Recurring perk that never touches unit price | 8·10·10·10·3·9 | 8.60 | **S** | built; #subscription-critical |
| E-034 | Free-shipping threshold on one-time (ladder/3-pack) | T2:Squatch ($55 at $7 unit), JR | Structurally forces basket-building | 7·9·8·9·3·9 | 7.65 | A | in model ($5.95 vs free) |
| E-035 | Auto-applied discount, no code hunt | G | Kills code-hunt abandonment | 6·9·7·9·2·9 | 7.10 | A | #quick-win |
| E-036 | Honestly-degraded one-time (contrast, not trap) | A1 ($99 decoy), G | Asymmetric dominance toward sub without deception | 8·7·9·9·4·6 | 7.50 | A | #subscription-critical |
| E-037 | Replacement-value / basket math | A1 ($79 vs $225), R ($135) | Re-anchors vs a constructed alternative spend | 7·6·8·7·4·5 | 6.45 | B | #risky (self-built anchor) |
| E-038 | BNPL | Go (Afterpay), T2:MUD | Payment-pain splitting | 5·3·6·5·2·5 | 4.45 | C | processor-gated (§12) |
| E-039 | HSA/FSA payment framing | G, A1, I8 | Pre-tax reframe ≈30% off without discounting | 6·1·8·4·4·6 | 4.80 | C | not eligible — kratom |
| E-040 | Prepaid multi-month tier | I8 quarterly, A1 annual, T2:Nutrafol | Cash up front + churn insurance | 7·4·8·5·6·4 | 5.85 | B | processor + trust stage |
| E-041 | Trial/entry SKU rung (10-ct) | Dandy catalog; T2:Squatch mini, JR mini | Low-risk first taste; feeds the ladder | 8·10·7·10·4·9 | 8.25 | A | built |
| E-042 | Kids/household line extension | G ($19.99 entry) | Household expansion | — | — | **D** | **rejected: 21+ category** |
| E-043 | Price-lock promise on renewals | I8 ("auto-renews at the same price") | Removes future-price anxiety at signup | 6·9·6·10·3·9 | 7.20 | A | #quick-win #subscription-critical |
| E-044 | Sweepstakes-entry commerce | T2:Ridge | Purchases as lottery tickets | 5·3·5·3·3·3 | 3.90 | **D** | compliance burden, off-brand |
| E-045 | Gift-value-inflated compare-at anchors | R ($219.98 incl. gift retail) | Savings theater | — | — | **F** | F-07 |
| E-046 | First-order price lower than renewal price | T2:Auri, ED | Bait pricing; churn + chargeback engine | — | — | **F** | F-03 |
| E-047 | Perpetual strikethrough "sale" | T2:Auri, Ridge, BioRoot | Trains customers to never pay list | — | — | **F** | F-06 |

### D4 — Subscription mechanics & retention design

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-048 | Subscription listed first w/ benefits attached only to it | all T1 | Default-position bias + benefit asymmetry | 9·10·10·10·3·8 | 8.80 | **S** | built; #universal #subscription-critical |
| E-049 | Subscription selected by default (terms fully visible) | R, T2:PetLab/MUD/Auri; A1 defaults to *double* | Default bias captures recurring revenue | 8·9·9·10·2·6 | 7.85 | A | transparency is the guardrail |
| E-050 | Benefits checklist inside the buy box | G, A1, I8 | Reassurance at the exact decision moment | 8·10·10·10·3·9 | 8.60 | **S** | built; #universal |
| E-051 | Honest skip/pause/cancel-anytime messaging at decision point | all T1 (variously betrayed) | Neutralizes commitment anxiety pre-click | 8·10·10·10·3·9 | 8.60 | **S** | #subscription-critical |
| E-052 | Renewal reminder before every charge | Dandy handoff; corpus implied | Anti-surprise billing; churn quality over quantity | 7·10·5·8·4·10 | 7.45 | A | processor goodwill too |
| E-053 | Membership framing/naming | A1 membership, G "Golden Gummy", T2:MUD "members" | Recurring billing reframed as belonging | 6·7·8·7·6·7 | 6.75 | B | — |
| E-054 | Time-released loyalty gift ladder (months 2–6) | I8, T2:ED, A1 annual milestones | Churn-peak months become anticipated unboxings | 8·6·8·4·7·7 | 6.80 | B | margin-gated; phase 2 |
| E-055 | Rewards vesting past the churn/guarantee window | A1 (90-day) | Loyalty cliff engineered past danger zone | 6·6·6·5·6·7 | 5.95 | B | — |
| E-056 | Subscriber-gated content/program | I8 masterclasses | Non-discount retention value | 5·6·6·4·6·7 | 5.50 | B | Dandy: keep safety education FREE |
| E-057 | Partner-perk stack | G VIP Pass, I8 Superpower | Perceived value without margin cost | 5·4·7·4·5·6 | 5.05 | C | — |
| E-058 | Swap/add/cadence flexibility in portal | G, A1 | Engagement instead of churn | 7·9·8·6·4·9 | 7.30 | A | app-dependent |
| E-059 | Double-sided referral flywheel | A1 15/15, G $20, I8 | CAC recycling into retention credit | 7·8·9·6·6·7 | 7.25 | A | phase 2; compliance check |
| E-060 | Self-serve-ONLY cancellation (support refuses) | G ("we do not cancel subscriptions for customers") | Support deflection — reads as trap | — | — | **D** | Dandy: self-serve + human |
| E-061 | Cancellation deadline (24h before billing) | Go, R | Friction favoring renewal; contradicts "anytime" | — | — | **F** | F-04 |
| E-062 | Pre-checked subscription w/ hidden recurring price | T2:BioRoot (`showPrices:false`) | Negative-option enrollment | — | — | **F** | F-02 |
| E-063 | Reactivation/win-back surfaces | A1 /members/reactivate | Cheapest re-acquisition | 5·7·5·6·4·9 | 5.85 | B | post-launch |
| E-064 | Cancellation instructions publicly indexed (SEO-crawlable) | anti-pattern lesson from G; Dandy handoff requires | Owns the "how to cancel" query; trust + support savings | 6·10·5·10·4·10 | 7.45 | A | #quick-win |

### D5 — Proof & credibility architecture

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-065 | Quantified testing specificity | A1 ("500 pesticides… 280 banned substances"), G ("70 pesticides, 4 heavy metals") | Numbers persuade where adjectives can't; safety made concrete | 9·10·8·8·6·8 | 8.50 | **S** | Dandy's #1 objection |
| E-066 | Published COAs / test reports linked on the conversion path | A1 ("SEE THE RESULTS"); Dandy /COA live | Verifiability offer — "don't trust us, check" | 9·10·6·9·7·9 | 8.55 | **S** | #compounding; QR-backed |
| E-067 | Batch-identity / batch-to-bag traceability | Dandy QR→/COA; A1 routine reports | Proof attached to the *exact* unit in hand | 8·10·5·7·8·9 | 7.90 | A | Cansu asset #6 |
| E-068 | Named manufacturer/facility transparency | I8 (Vitaquest), Go (cGMP) | Supply-chain de-anonymization | 6·8·7·8·4·8 | 6.85 | B | owner decision |
| E-069 | Certification badges | A1/I8 NSF; G GMP | Borrowed institutional trust | 8·5·9·5·6·6 | 6.70 | B | kratom analog: AKA GMP (§12) |
| E-070 | Review count + stars at the buy box | all T1 | Mass proof at decision | 8·6·10·6·3·7 | 7.00 | A | bridge → S once real |
| E-071 | Third-party/auditable review platform (not self-declared) | T2:Ridge (histogram + Q&A); R as negative example | Verifiable > claimed; earns the display | 8·9·8·7·4·9 | 7.75 | A | pick app pre-launch |
| E-072 | Honest imperfect rating display | T2:JR (4.23/85k), Ridge (1★ visible) | Imperfection at scale reads truer than curated 4.9 | 7·9·6·9·5·10 | 7.65 | A | policy, costs nothing |
| E-073 | Verified-buyer marking | Go, R (badge-only) | Authenticity signal — only with real verification | 6·8·8·8·3·8 | 6.90 | B | — |
| E-074 | Behavioral guarantee stat ("<1% use it") | G | Revealed-preference satisfaction proof | 8·8·6·8·5·7 | 7.30 | A | needs 6mo real data |
| E-075 | Founder story/letter | I8 (Beckham note), T2:JR/MUD/ED | Parasocial trust; someone accountable stands behind it | 7·9·8·7·6·9 | 7.65 | A | Cansu asset #7 |
| E-076 | Expert/practitioner endorsement | T2:Nutrafol MDs, G clinicians, I8 SAB | White-coat authority | 8·4·9·3·6·4 | 6.00 | B | #risky — "medical badge" line |
| E-077 | Celebrity association | A1, I8, G | Aspirational identity + reach | 7·2·8·2·5·4 | 4.90 | C | not at stage |
| E-078 | Press logos ("as seen in") | all T1 | Editorial borrowing | 6·3·9·3·3·6 | 5.10 | C | only when earned |
| E-079 | Customer count / units sold | Go (30M bottles), T2:MUD (240M cups), I8 | Bandwagon at scale | 6·3·9·8·3·6 | 5.85 | B | later, only true numbers |
| E-080 | Tenure-stamped endorsements ("since 2012") | A1 | Longevity converts endorsement into habit-proof | 6·5·6·7·5·8 | 6.05 | B | later |
| E-081 | UGC photo/video modules | R, G, I8 | Peer realism; format matches social feeds | 7·7·9·5·4·7 | 6.70 | B | permissioned only; asset #9 |
| E-082 | Outcome-specific, tagged testimonials | R (benefit tags), T2:Nutrafol (time-stamps) | Proof mapped to the reader's exact desired outcome | 7·8·8·8·3·7 | 7.10 | A | `dandy-review-slots` ready |
| E-083 | Compensation/incentive disclosure on testimonials | G | Legal armor that reads as confidence | 4·9·6·10·2·10 | 6.60 | B | policy hygiene |
| E-084 | Competitor-switch testimonials | G (AG1 switchers) | Steals authority from the incumbent | 6·6·6·7·4·6 | 5.95 | B | smoke-shop switchers, later |
| E-085 | Product-change honesty notes | A1 (formulation disclaimer) | Honesty signal doubling as "continuously improved" | 4·8·5·9·3·10 | 6.20 | B | — |
| E-086 | Proof sequencing: credibility→ask→verification→risk-reversal | A1, I8 | Order of proof is the craft; free to control | 9·10·8·9·5·9 | 8.65 | **S** | #universal |
| E-087 | Survey-outcome stats w/ honest sourcing | G ("67%… 3k+ users") | Quantified outcomes below the clinical bar | 7·6·8·5·4·5 | 6.15 | B | legal-gated, needs data |
| E-088 | Charity/values halo | Go (position #1 sitewide), A1, I8 | Moral licensing; values-based trust | 5·4·8·5·4·7 | 5.35 | C | don't bolt on |
| E-089 | Uncited clinical-study claims | R ("82 studies"), T2:BioRoot | Science theater | — | — | **F** | F-09 |
| E-090 | Off-category authority board | Go (radiology execs) | Authority that collapses under scrutiny | — | — | **F** | F-10 |
| E-091 | Brand-level proof borrowed across products | I8 (same 22,104 count everywhere) | Misattributed proof | — | — | **F** | F-08 |

### D6 — Objection handling & risk reversal

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-092 | Money-back guarantee with terms identical on every surface | all T1 claim one; 6/14 betray it | Risk reversal that survives the fine-print check | 9·9·10·8·4·9 | 8.50 | **S** | owner must set terms |
| E-093 | Guarantee + cancel microcopy under every buy CTA | A1 | Risk reversal at the exact click moment, every time | 8·10·9·10·3·10 | 8.55 | **S** | #universal #quick-win |
| E-094 | Keep-the-product / no-return refund | G, Go (opened bottles), R | Zero-effort refund = zero perceived risk | 7·8·8·9·4·8 | 7.45 | A | cap by $ value |
| E-095 | Objection-led FAQ near the decision | all T1 | Self-serve objection clearing | 8·10·10·10·3·9 | 8.60 | **S** | built; #universal |
| E-096 | Category-objection block (taste/burn/"will I feel weird?") | R ("No Aftertaste, No Burn"), Go taste hook | Kills the category-specific fear by name | 8·10·8·9·5·7 | 8.15 | A | Dandy: taste + intensity fear |
| E-097 | Exclusion list ("what's not in it / does not contain") | I8, Go (13 items), A1 grid | Negative-space proof; nobody self-excludes | 8·9·9·9·4·7 | 8.00 | A | per real labels + legal |
| E-098 | Expectation-setting on variability & time-to-effect | G, R ("7–14 days"), T2:Nutrafol | Honest calibration prevents refunds and churn | 8·10·9·9·4·8 | 8.30 | A | usage guidance, never an effect ladder |
| E-099 | "Who this is NOT for" honesty play | rare in corpus (implicit at MUD) | Exclusion builds credibility for everything else said | 7·10·4·9·6·10 | 7.65 | A | 21+, pregnancy, meds, 16 states |
| E-100 | Comparison vs status-quo formats | T2:ED (vs coffee), A1 (vs pills); Dandy format table | Positions against the incumbent, not a brand | 7·9·8·8·5·6 | 7.40 | A | built (format comparison) |
| E-101 | Comparison vs competitors (✓/✗ table) | G "Us vs Them", R, I8 conquest pages | Category-killer framing | 6·5·8·7·3·5 | 5.85 | B | unnamed-generic only |
| E-102 | Shipping/restriction clarity repeated at decision points | Dandy state map mandate; corpus shipping lines | Prevents doomed orders, refunds, CS load | 8·10·7·8·4·10 | 8.05 | A | #mobile-critical |
| E-103 | Counterfeit/channel-authenticity defense | A1 (/product-authentication), R | Channels demand to owned store | 5·7·6·8·4·8 | 6.20 | B | QR/COA covers this |
| E-104 | Guarantee that shrinks in the fine print | Go, A1, R, T2:BioRoot/Nutrafol | Betrayed risk reversal — worse than none | — | — | **F** | F-05 |

### D7 — Copy & direct-response mechanics

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-105 | Owned category language | A1 ("Foundational Nutrition"); Dandy ("ONE PLANT. TWO GEARS.") | A category of one can't be price-shopped | 8·10·8·10·8·9 | 8.80 | **S** | #compounding; exists — compound it |
| E-106 | Three-beat benefit compression | Go triads, G "Rip. Tip. Enjoy."; Dandy slogans | Rhythm = memorability = scannability | 7·10·9·10·5·9 | 8.35 | A | #quick-win |
| E-107 | Ritual mnemonic for usage | G ("Rip. Tip. Enjoy.") | Habit script in three beats | 6·9·7·10·6·9 | 7.65 | A | — |
| E-108 | Benefit-first bullets over format facts | G, I8; Dandy handoff mandate | Outcomes sell; specs reassure | 8·10·9·10·3·6 | 8.15 | A | legal-gated |
| E-109 | Specificity (numbers, mg, counts, timeframes) | all | Concrete claims read as honest claims | 8·9·9·9·4·7 | 8.00 | A | — |
| E-110 | Second-person felt-state framing ("What You'll Feel") | I8 | Imagined experience pre-purchase | 7·7·7·9·4·5 | 6.80 | B | #risky — legal review |
| E-111 | Stat→feeling bridge copy | I8 (signature) | Translates evidence into lived outcome | 7·6·6·8·5·6 | 6.50 | B | needs data first |
| E-112 | Problem-agitation lead-ins | T2:BioRoot/MUD | Names the felt problem before the pitch | 7·6·8·9·3·6 | 6.75 | B | light touch only |
| E-113 | Identity/first-person CTAs | A1 ("Upgrade My Health"); Dandy ("Find your Dandy") | Commitment language beats commerce language | 6·9·8·10·4·9 | 7.60 | A | #quick-win |
| E-114 | Future pacing tied to guarantee window | A1 (/90-days) | The guarantee period becomes the results period | 7·6·7·8·4·6 | 6.55 | B | careful — no effect promises |
| E-115 | Vernacular pattern interrupts | G ("Besides the Poops"), T2:Squatch | Category-breaking voice earns attention | 6·7·8·9·5·7 | 6.95 | B | joyful yes, crude no |
| E-116 | Compliance-clean claim style (†, structure/function) | all T1 | Claims that survive regulators and skeptics | 5·10·10·9·2·10 | 7.55 | A | `data-copy-status` system built |
| E-117 | Repetition/callback slogan system | Go (® hook), Dandy slogan set | Compounding memorability across surfaces | 6·9·8·9·6·9 | 7.65 | A | — |
| E-118 | Microcopy craft (buttons, cart lines, states) | A1 ("Update or cancel anytime") | Trust is won in 6-word increments | 7·10·8·9·3·9 | 7.85 | A | #quick-win |

### D8 — Visual design system & craft

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-119 | CTA color monopoly (one accent owns "buy") | corpus-wide; Dandy orange | Attention routing by reserved color | 7·10·8·10·3·10 | 8.10 | A | tokens built |
| E-120 | Dark/light sectioning to segment narrative | A1 numbered editorial; Dandy editorial scroll | Scroll rhythm = comprehension pacing | 6·10·7·9·4·10 | 7.60 | A | Figma-governed |
| E-121 | Badging system (Best Seller / New / flags) | G, all | Choice shortcuts | 6·9·9·10·2·8 | 7.45 | A | only true badges |
| E-122 | Receipt-table offer UI (struck gift values, Total row) | A1 | Shopping-cart mental model pre-cart | 7·9·7·9·3·9 | 7.50 | A | pairs w/ E-032 |
| E-123 | Label-panel transparency as design asset | G (4 full panels) | The label IS the proof artifact | 7·10·8·8·4·9 | 7.80 | A | final labels = truth |
| E-124 | Infographic-first PDP gallery | T2:Ridge (7/12 slots) | Education inside the swipe surface | 7·9·7·6·4·9 | 7.15 | A | Cansu assets #2/#4/#5 |
| E-125 | Premium object naming ("Luxe", "Forever Jar") | I8 | Luxury lexicon on physical goods | 4·6·5·9·4·8 | 5.70 | B | — |
| E-126 | Numbered sections / ALL-CAPS kickers | A1 | Editorial scan rails | 5·9·7·10·3·10 | 7.15 | A | matches display system |
| E-127 | Logo-off distinctiveness (recognizable system) | T2:MUD voice; Dandy Figma system | Brand asset that compounds | 7·10·7·7·8·9 | 7.90 | A | #compounding |

### D9 — Product education & mechanism

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-128 | Category-education module before the ask ("What is X?") | A1, T2:MUD; Dandy `dandy-kratom-intro` | Cold traffic can't buy what it can't place | 9·10·8·9·6·7 | 8.55 | **S** | built; core for kratom |
| E-129 | Mechanism-per-concept, ending in a benefit | A1 (ingredient classes) | Education always terminates in "so you feel X" | 7·9·8·9·4·7 | 7.55 | A | legal-gated endings |
| E-130 | Dosage/strength transparency (mg per unit) | corpus; Dandy 35/50/90 mg | Exactness = safety = premium | 8·10·8·9·5·8 | 8.25 | A | — |
| E-131 | Responsible-use / start-low guide | Dandy mandate; corpus analogs (expectation setting) | Safety-forward onboarding; trust moat in this category | 8·10·5·8·8·10 | 8.15 | A | #compounding |
| E-132 | Format-legibility explainer (gummy vs capsule vs powder) | Go; Dandy `dandy-format-chooser` | Removes which-one paralysis across 8 configs | 8·10·7·9·4·9 | 8.10 | A | built |
| E-133 | Provenance/sourcing storytelling | A1 ("Farm to Label… Fresno") | Origin de-commoditizes | 6·8·7·6·6·7 | 6.65 | B | leaf-origin story |
| E-134 | Evidence-literacy pedagogy ("how to read a COA") | A1 research-hierarchy analog | Teach the standard, then win by it | 5·9·5·7·5·7 | 6.30 | B | strong Dandy variant |
| E-135 | Incumbent-swap framing | T2:MUD/ED ("replace your coffee"); Dandy "alcohol-free unwind" | Steals an existing budget + ritual slot | 8·9·8·9·6·6 | 7.95 | A | legal on alcohol comparisons |
| E-136 | Education-to-conversion linkage (CTA closes every block) | A1 | Never educate into a dead end | 8·10·8·10·3·9 | 8.30 | A | #quick-win |
| E-137 | Quantified content transparency (mg per serving vs equivalents) | T2:MUD (35mg vs 90mg) | Precise numbers make "strong but controlled" credible | 7·9·7·8·5·8 | 7.45 | A | — |

### D10 — CTA & conversion-moment design

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-138 | CTA after every proof block (~every 2 modules) | A1 (9/page), Go, G, R, I8 | Each proof crest gets an ask; readers convert where convinced | 8·10·10·9·3·9 | 8.60 | **S** | #universal |
| E-139 | Sticky mobile ATC bar | Dandy built; I8 sticky per-day CTA | The ask travels with the thumb | 8·10·8·10·2·9 | 8.20 | A | #mobile-critical; built |
| E-140 | Price + selected-offer summary adjacent to CTA | G, Dandy dynamic summary | No surprise at the click | 8·10·9·10·2·9 | 8.35 | A | built |
| E-141 | Verb-of-onset CTA ("Start" not "Buy") | G ("Start Now"), A1 | Frames a journey, lowers purchase salience | 6·9·8·10·3·9 | 7.50 | A | #quick-win |
| E-142 | Post-click feedback (drawer confirm w/ selection echoed) | standard | Confirms the right thing happened | 6·9·7·8·2·9 | 6.95 | B | — |
| E-143 | Final full-bleed conversion section | Dandy built; A1 guarantee hero | Closes the page with the offer, not a footer | 6·10·8·10·2·9 | 7.60 | A | built |
| E-144 | Curiosity-gap CTA ("Check Availability") | T2:PetLab | Misleading availability theater | — | — | **D** | reject |
| E-145 | CTA copy varies by scroll depth | A1 (curiosity→identity→action) | Matches ask intensity to reader readiness | 6·8·6·9·3·9 | 6.85 | B | — |

### D11 — Cart, checkout & AOV mechanics

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-146 | Cart/checkout selection integrity (variant/plan/price preserved) | Dandy mandate; corpus leaks | Displayed math always matches charged math | 8·10·6·8·3·10 | 7.80 | A | server-authoritative |
| E-147 | Free-shipping progress bar in cart | T2:Squatch-type | Threshold gamification (honest version) | 6·7·5·7·2·8 | 6.00 | B | — |
| E-148 | Subscription-upgrade prompt in cart | T2:PetLab | Second chance at the sub | 6·7·5·6·3·6 | 5.75 | B | — |
| E-149 | Cart cross-sell (trial/accessory add) | corpus | AOV at low decision cost | 6·8·6·7·3·8 | 6.45 | B | 10-ct as add-on |
| E-150 | Buy-box bundle toggle ("Full Kit — Save X%") | T2:Ridge | AOV lift at the commitment moment | 7·7·6·7·4·8 | 6.65 | B | mixed-format kit later |
| E-151 | Express pay (Shop Pay / Apple Pay) | corpus standard | Checkout friction removal | 7·5·8·5·2·7 | 5.95 | B | processor-gated (§12) |
| E-152 | Trust seals + restriction note in cart | corpus | Last-mile reassurance | 6·9·7·9·2·9 | 7.10 | A | #quick-win |
| E-153 | Post-purchase one-click upsell | G (UNVERIFIED) | Zero-risk AOV after commitment | 6·5·4·5·3·6 | 5.05 | C | app/processor-gated |

### D12 — Post-purchase, lifecycle & LTV

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-154 | Thank-you page next action (education/referral) | G (UNVERIFIED), corpus | Momentum capture post-purchase | 6·8·5·8·4·9 | 6.65 | B | — |
| E-155 | Onboarding education sequence (usage, start-low) | corpus nurture analogs | Activation drives outcomes drives retention | 8·10·7·7·5·9 | 7.90 | A | Klaviyo present |
| E-156 | Review solicitation timed to experience | corpus standard | Bootstraps the proof engine honestly | 7·10·7·8·4·9 | 7.65 | A | unlocks E-019/070 |
| E-157 | Inserts/unboxing as ritual objects | T2:ED gifts, A1 kit content | The brand colonizes the counter | 6·7·7·6·6·9 | 6.65 | B | — |
| E-158 | Win-back offers | A1 reactivate routes | Cheapest re-acquisition | 5·7·5·7·3·8 | 5.80 | B | — |
| E-159 | SMS program | G (SMS-first capture) | Highest-open owned channel | 6·6·8·6·4·4 | 5.90 | B | #risky — carrier filtering |
| E-160 | Community layer (events, clubs) | A1, T2:MUD | Belonging as retention | 5·6·7·4·7·7 | 5.75 | B | — |
| E-161 | Account portal UX quality | G, A1 | Retention lives in the portal | 7·9·7·6·3·9 | 7.05 | A | app choice matters |

### D13 — Technical UX & performance

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-162 | Mobile-first performance (LCP, image pipeline) | corpus; Dandy AVIF/WebP built | Speed is the first trust signal | 8·10·8·8·2·10 | 8.00 | A | #mobile-critical |
| E-163 | Tap targets ≥44px, body ≥16px | Dandy mandate | Fat-finger-proof commerce | 6·10·7·10·1·10 | 7.45 | A | built |
| E-164 | Accessibility (contrast/alt/focus) | I8 statement; Dandy mandate | Inclusion + legal + SEO | 5·10·6·8·2·10 | 6.80 | B | mandated regardless |
| E-165 | Variant-switch state integrity (URL/price/label sync) | Dandy mandate; corpus leaks (IM8 stockouts) | Desync = instant distrust | 8·10·6·7·2·10 | 7.55 | A | built; test hard |
| E-166 | Compliance placement without conversion damage | G (Prop 65 footer) | Required text, designed placement | 6·10·7·8·2·10 | 7.25 | A | warnings per final labels |
| E-167 | SEO-crawlable support/help content | anti-G lesson (JS help widget leak) | Own your own "cancel/refund" queries | 6·9·6·8·3·10 | 7.00 | A | native pages, not virtual router |
| E-168 | Bot walls that block agentic shoppers | A1, T2:ED/Ridge | Blocks emerging agent-commerce channel | — | — | **D** | avoid |

### D14 — Traffic congruence & acquisition design

| ID | Element | Brands | Mechanism | I·F·E·C·M·R | Wt | Tier | Tags |
|---|---|---|---|---|---|---|---|
| E-169 | SEO education → conversion path (/learn → PDP) | A1 search-intent landers | For an ad-banned category, education IS acquisition | 9·10·8·8·7·8 | 8.60 | **S** | #compounding |
| E-170 | Affiliate/creator LPs w/ personalized offer | A1 partner pages, I8 podcast LPs | Voice-matched landing continues the referral's trust | 7·8·9·6·5·7 | 7.15 | A | phase 2 |
| E-171 | Discount-code landing experiences | I8 ("GREATNESS") | Code = attribution + welcome | 6·7·8·7·3·7 | 6.45 | B | — |
| E-172 | Ad→LP congruence mapping | G (GLP-1 ads→LP) | Message match preserves scent | 8·3·9·5·4·7 | 6.20 | B | N/A until ads possible |
| E-173 | Retargeting offer differentiation | corpus | Warmer traffic, warmer offer | 5·3·6·5·3·6 | 4.65 | C | platform-gated |
| E-174 | Pack-QR → permanent proof page congruence | Dandy /COA mandate; no corpus equivalent | Physical→digital trust loop; offline congruence | 7·10·4·9·6·10 | 7.65 | A | /COA permanence |
| E-175 | UGC-style creative → UGC-module congruence | corpus | Feed-native scent continuity | 5·6·6·6·3·7 | 5.50 | B | later |

### Registry index by tier

- **S (build into v1, 20):** E-016, E-017, E-020, E-023, E-024, E-026, E-027, E-028, E-029, E-033, E-048, E-050, E-051, E-065, E-066, E-086, E-092, E-093, E-095, E-105, E-128, E-138, E-169 *(23 IDs — consolidated into 14 spec cards in §9)*
- **A (build v1/v2, 52):** E-001, E-002, E-011, E-012, E-014, E-018, E-019, E-022*, E-030, E-031, E-034, E-035, E-036, E-041, E-043, E-049, E-052, E-058, E-059, E-064, E-067, E-070, E-071, E-072, E-074, E-075, E-082, E-096, E-097, E-098, E-099, E-100, E-102, E-106, E-107, E-108, E-109, E-113, E-116, E-117, E-118, E-119, E-120, E-121, E-122, E-123, E-124, E-126, E-127, E-129, E-130, E-131, E-132, E-135, E-136, E-137, E-139, E-140, E-141, E-143, E-146, E-152, E-155, E-156, E-161, E-162, E-163, E-165, E-166, E-167, E-170, E-174 *(A-tier includes bridge-gated items marked in rows)*
- **B (backlog/test):** E-003, E-004, E-005, E-006, E-007, E-008, E-009, E-010, E-021, E-032, E-037, E-040, E-053, E-054, E-055, E-056, E-063, E-068, E-069, E-073, E-079, E-080, E-081, E-083, E-084, E-085, E-087, E-101, E-103, E-110, E-111, E-112, E-114, E-115, E-125, E-133, E-134, E-142, E-145, E-147, E-148, E-149, E-150, E-151, E-154, E-157, E-158, E-159, E-160, E-164, E-171, E-172, E-175
- **C (monitor only):** E-015, E-025, E-038, E-039, E-057, E-077, E-078, E-088, E-153, E-173
- **D (explicitly reject):** E-042 (kids/household line — 21+ category), E-044 (sweepstakes commerce), E-060 (support-refusal cancellation), E-144 (curiosity-gap availability CTA), E-168 (agent-blocking bot walls)
- **F (anti-patterns — full cards in §8):** E-013/F-15, E-045/F-07, E-046/F-03, E-047/F-06, E-061/F-04, E-062/F-02, E-089/F-09, E-090/F-10, E-091/F-08, E-104/F-05, plus F-01, F-11, F-12, F-13, F-14 defined in §8

*Count: 175 registry entries (155 scored + 20 D/F-tier documented). The exhaustiveness bar (150+) is met.*

---

## §6. CONVERGENCE ANALYSIS

**What all five Tier-1 brands do identically — table stakes (ship all of these or explain why not):**
- Subscription presented first/default with benefits attached only to it, one-time honestly available but structurally worse (E-048, E-036).
- Price above the fold; per-day or per-unit reframing somewhere in the buy box (E-023, E-026/027).
- A money-back guarantee marketed at the decision point (30/60/90 days) (E-092/093).
- "Cancel anytime"-class flexibility messaging inside the buy area (E-051).
- Rating + review-count near the title (E-019) — the only table-stake Dandy cannot honestly ship at launch; the §9 bridge covers it.
- Free shipping used as a subscription lever, not a given (E-033).
- An objection-led FAQ on the conversion page (E-095); a benefit-bulleted hero (E-018); repeated CTAs down the page (E-138); structure/function claim hygiene with † daggers (E-116).

**What only the premium brands do (AG1, IM8 — and Dandy should):**
- Hold list price constant; move offer energy into gifts, tiers, and payment framing instead of discounts (E-028, E-032). IM8/AG1 never show a countdown on core surfaces.
- Sequence credibility *before* the first price exposure and verification depth *after* the ask (E-086).
- Publish verifiable proof artifacts — COAs, trial registrations, named manufacturers (E-066, E-068).
- Editorial design grammar: numbered sections, kickers, restrained badging (E-120, E-126).
- Weld guarantee microcopy to every CTA (E-093).

**What only the mass-market/DR brands do (Goli, Resilia, and the aggressive Tier-2 funnels):**
- Steep visible discounts (50%+ spreads), gift-value-inflated anchors, urgency devices, duplicated hard-sell buy boxes. Of these, only the *structural* pieces (ladder grammar, duplicate buy box) survive the integrity filter; every pressure piece lands in §8.
- Radical compression (Goli) — which premium brands would do well to steal per-module even while running longer pages.

**What the highest performers do that nobody else does:**
- **AG1:** the industrialized module library + numbered landers + /ctr twins + attribution threading; and total price integrity ($79 untouched for 3 years).
- **IM8:** the disclosed month-by-month gift ladder inside the acquisition PDP; guarantee length tied to plan tier.
- **Grüns:** behavioral guarantee stat ("<1% use it") and avatar-mirroring headlines at LP scale.
- **Everyday Dose (T2):** scheduled months-2–5 loyalty gifts — the single most stealable retention mechanic in the corpus.
- **Jones Road (T2):** honest 4.23 average at 85k reviews — proof that displayed imperfection converts.

---

## §7. STRATEGIC FORKS

**Fork 1 — Long-form education vs. short-form compression.** *A: AG1/IM8* — 20-module pages, education-as-conversion, works with brand equity, high AOV, and cold traffic needing category translation. *B: Goli* — radical compression, works when the format itself is the pitch and the price is impulse-range. **Conditions:** unfamiliar category and considered purchase favor A; familiar format and low ticket favor B. **Dandy: hybrid, weighted A.** Kratom needs category translation (A), but Dandy's gummy inherits Goli's format legibility (B). Run the long, authored scroll the handoff already specifies — but hold every individual module to Goli's compression standard (one idea, one excerpt, one CTA). The homepage answers "what is kratom?" before it asks for money; the PDP answers "which Dandy?" fast, then educates below the fold.

**Fork 2 — Discount-led vs. value-led offers.** *A: discount-led* (Resilia 50% spreads, Grüns 55/61% narratives) converts colder traffic faster and buys AOV, at the cost of anchor incoherence, FTC reference-price exposure, and trained-in discount dependence. *B: value-led* (AG1: constant price, gift stacks, per-day math) protects margin and premium trust, but needs proof assets to carry conversion. **Dandy: B, strictly.** One honest anchor (the real one-time price), one subscription discount (20%), ladder savings stated as exact per-pouch math, any future gift framed as an itemized kit — never an inflated compare-at. In a scrutinized category, Dandy cannot afford a single dishonest number; §8 shows what it costs the brands that try.

**Fork 3 — Subscription-first vs. one-time-first.** *A: subscription-only/first* (Nutrafol, AG1-in-practice) maximizes LTV but gates trial and invites regulator attention. *B: one-time-first* (Jones Road: no subscription at all; repeat purchase via fit-confidence) maximizes trust, sacrifices predictable revenue. **Dandy: the already-decided hybrid is corpus-optimal** — sub-default on 30-ct with fully visible terms and renewal reminders; 10-ct one-time trial rungs as the Jones-Road-style confidence path; 1/3/5 one-time ladder for commitment-averse stock-uppers. One caveat from the corpus: if the processor cannot support recurring kratom billing (§12), Ridge/Jones Road prove a no-subscription premium brand still monetizes via ladders + thresholds + guarantee-led repeat purchase.

**Fork 4 — Quiz-gated vs. direct-to-offer.** *A: quiz* (Nutrafol, PetLab, Squatch) pre-sells via personalization and captures email, at the cost of a build, drop-off, and — for kratom — creating a record of symptom-targeted recommendations legal may hate. *B: direct* with a lightweight selector (AG1 persona checklist, Resilia "Not sure where to start?"). **Dandy: B at launch.** The two-gears frame plus the format chooser already does the quiz's segmentation job in one screen with zero drop-off and zero compliance surface. Revisit a full quiz (as "find your format," never "diagnose your symptoms") in phase 3.

**Fork 5 — Founder-led vs. brand-led trust.** *A: founder-led* (Jones Road/Bobbi Brown, ED's founder note, MUD's founder story) — cheapest credible proof when you have zero reviews; a person accountable beats an anonymous label. *B: brand/proof-led* (AG1 institutional stack) — scales beyond the founder, but needs assets Dandy won't have for quarters. **Dandy: A as the launch bridge, engineered to hand off to B.** Founder story on About + a homepage/PDP trust block ("why we made Dandy, why every batch is tested") now; as real reviews, COA history, and any certifications accrue, proof weight shifts to the verifiable stack. This is also the §9 bridge for the missing review table stake.

**Fork 6 — Premium vs. accessible design language.** *A: premium-editorial* (IM8, AG1, Jones Road) supports $60–100 price points; *B: accessible-playful* (Goli, Grüns candy language) maximizes mass reach but caps price tolerance. **Dandy: decided — premium-joyful per the binding Figma.** The corpus adds one instruction: premium is signaled as much by *restraint* (no promo stacking, no urgency, held prices — Squatch/Jones Road evidence) as by typography. The release scan should treat a countdown timer as a design-system violation, not just a policy one.

**Fork 7 (Dandy-specific) — Paid-funnel craft vs. owned-audience craft.** The corpus's advertorial/LP machinery (Grüns ~99 LPs, PetLab funnels) presumes ad platforms kratom cannot use. **Dandy: reallocate that entire discipline to SEO education (/learn cluster, E-169), affiliate/creator LPs (E-170), email/SMS lifecycle (E-155, carrier-compliance-checked), and pack-QR congruence (E-174).** The LP-matrix *skill* transfers; the traffic source changes.

---

## §8. ANTI-PATTERNS (F-TIER) — observed in corpus, prohibited for Dandy

Each entry: what was observed (verbatim) → why it leaks → the Dandy guardrail. These align with the handoff's non-negotiables; several should be enforced by `scripts/release-scan.sh`.

- **F-01 · Evergreen/dead countdown timers.** MUD/WTR displayed "00 DAY : 00 HRS : 00 MIN : 00 SEC"; Resilia's timer pinned at "02 Hrs : 00 Mins : 00 Secs" on every fetch; Auri ran a countdown on an evergreen SKU. Detectably fake → trust collapse + FTC deception exposure. *Guardrail: no countdown component exists in the theme; keep it that way.*
- **F-02 · Pre-checked subscription with hidden recurring price.** BioRoot's PDP source: `"subscribeByDefault":true … "showPrices":false`; its Trustpilot complaint pattern (unauthorized charges) is the measured cost. *Guardrail: Dandy's default-on toggle must always display amount charged today, renewal amount, cadence, and cancel path — already specified in handoff §4; treat as release-blocking.*
- **F-03 · First-order price below renewal price.** Auri "$31.99" headline → "Auto-refill every 4 weeks at $39.99" small print; Everyday Dose "$49" → "Renews at $66/mo." Negative-option bait; churn/chargeback engine. *Guardrail: first charge = renewal charge ($47.99 = $47.99), stated twice.*
- **F-04 · Cancellation deadlines and support-refusal.** Goli/Resilia require notice "24 hours before" billing; Grüns: "we do not cancel subscriptions for customers." Contradicts "cancel anytime" and feeds hostile third-party SEO. *Guardrail: cancel effective immediately for future orders, self-serve AND via support; publish the instructions (E-064).*
- **F-05 · Guarantee that shrinks in the fine print.** Goli PDP "full, 100% hassle-free refund" vs FAQ 30-day + return shipping; AG1 "we'll make it right" vs return-required/6-week/no-shipping T&C; BioRoot 60-day headline vs 30-day first-sub-only ToS; Nutrafol's headline vs ~$422-spend qualification. *Guardrail: one guarantee sentence, identical on PDP, FAQ, policy, and cart; legal signs the sentence once.*
- **F-06 · Perpetual strikethrough sale.** Auri "42% OFF TODAY" permanently sitewide; Ridge stacking "PRIME TIME" + "LIMITED TIME" + holiday scaffolding year-round. Reference-price deception; trains customers never to pay list. *Guardrail: strikethroughs only against the real one-time price (already the handoff rule).*
- **F-07 · Gift-value-inflated savings math.** Resilia's "$219.98 → Save $129.99" anchors include accessory retail values. *Guardrail: savings claims computed from product prices only; the release scan's deterministic ladder table (handoff §4) is the source of truth.*
- **F-08 · Proof borrowed across products.** IM8 shows the same "22,104 reviews" on every SKU; Essentials trial stats appear under Longevity. *Guardrail: per-product review counts only; capsule PDPs never inherit gummy proof.*
- **F-09 · Uncited outcome claims.** Resilia "82 clinical trials and more than 5,000 participants" (no links); BioRoot "80% reduction in inflammation markers" (no source). In kratom this is not just trust erosion — it is exactly the claim conduct FDA letters cite. *Guardrail: `data-copy-status` claim tracking + legal review already in the build; no stat ships without a source Dandy can produce.*
- **F-10 · Off-category/misleading authority.** Goli's advisory board: 3 of 4 are radiology/health-informatics executives; unsupported medical badges generally. *Guardrail: handoff prohibits unsupported medical badges; any future expert must be category-credible and disclosed.*
- **F-11 · Static scarcity meters.** Resilia "93% Sold" (identical across sessions/products); Auri "Low Stock 87% Sold"; BioRoot "1 bottle sold every 28 seconds"; PetLab "stock is flying off the shelves." *Guardrail: inventory statements only when literally true and product-specific (a real limited batch qualifies; nothing else does).*
- **F-12 · Fake milestone/achievement popups.** Everyday Dose "CONGRATS YOU'VE UNLOCKED FREE SHIPPING!" for a standing sitewide policy. *Guardrail: only announce thresholds the shopper actually crossed.*
- **F-13 · Irreconcilable proof numbers.** Goli (1M reviews / 5.4M customers / 30M bottles unsourced); IM8 (48M vs 50M servings, 470k vs 700k purchases); BioRoot (four contradictory counts on one funnel). *Guardrail: one metrics source of truth; every public number reconciles or doesn't ship.*
- **F-14 · Dead/contradictory offer surfaces.** Goli's out-of-stock BOGO LP and live worse-price legacy 3-pack; Grüns's simultaneous contradictory promos; IM8's 404'd footer links; Resilia's 404 FAQ. Rot converts into distrust and stranded traffic. *Guardrail: release scan should fail on placeholder/legacy offer pages; quarterly link+price audit of every indexed page.*
- **F-15 · Multi-domain offers that contradict each other.** Resilia's three live domains sell the same SKU at three prices/structures. *Guardrail: foreverdandy.com is the only commerce domain; any future LP subdomain inherits identical pricing.*
- **F-16 · Penalty-price ambiguity.** PetLab's "From $29.95 ~~$37.44~~" where the headline price silently requires a subscription. *Guardrail: every displayed price labeled one-time or subscription, always (handoff §4 already mandates the dual display).*

---

## §9. S-TIER CHERRY-PICK — the cut list for Dandy

The 23 S-tier registry IDs consolidate into 14 build specs. Every card passed all six PART 8 filters (universality · positioning · margin · traffic · resource · integrity). **High-scorers filtered out** are listed at the end of this section with reasons.

```
S-01  Category-owning hero system                                  [E-016, E-017]
Job to be done:     Answer "what is this and why do I care?" in under 3 seconds for
                    kratom-naive traffic.
Why it's S-tier:    Highest-weighted elements in the registry (8.9/9.0). Goli proves format
                    legibility carries conversion; AG1 proves owned category language
                    ("Daily Health Drink") removes price comparison. Dandy has both assets
                    written: "KRATOM, MADE EASY." + the gummy as hero object.
Corpus evidence:    Goli "WORLD'S FIRST Apple Cider Vinegar Gummies" + "Taste the Apple. Not
                    the Vinegar.®"; AG1 category reframe; Auri "tastes like a treat."
Dandy implementation: Keep hero = gummy pouch photography + "KRATOM, MADE EASY." + one
                    subline translating the category ("Plant-powered energy or ease —
                    in a gummy"→legal). CTA routes to lineup, not a buy box (handoff rule).
Placement:          Homepage hero (dandy-hero); PDP hero repeats format-first framing.
Dependencies:       Existing hero imagery (in Git); legal pass on subline.
Success metric:     Hero CTA click-through; scroll-past rate; dandy:add_to_cart_intent
                    downstream. Expect direction: ↑ engaged sessions to PDP.
Failure mode:       Hero gets clever instead of clear → category confusion returns.
                    Guardrail: 5-second test with kratom-naive readers.
Effort:             S (already built; copy polish only)
```

```
S-02  Proof-before-price sequencing                                [E-086]
Job to be done:     Load credibility before the first price exposure; hold verification
                    depth for after the ask.
Why it's S-tier:    The premium brands' shared craft (AG1, IM8). Free — it is an ordering
                    decision, and Dandy controls the order even with few proof assets.
Corpus evidence:    IM8: NASA quote pre-hero, RCT in buy box, SAB bios after the ask;
                    AG1: aspirational→institutional→scientific→economic→offer→guarantee.
Dandy implementation: PDP order: benefit hero → trust triplet → offer → COA/testing depth
                    → founder note → FAQ → recap. Homepage: facts strip and "KNOW WHAT'S
                    IN THE BAG" quality section BEFORE the final CTA section.
Placement:          Template section order (templates/product.json, index.json) — see §10.
Dependencies:       None (reordering + copy).
Success metric:     Scroll-depth vs dandy:add_to_cart_intent correlation; recap-CTA share
                    of ATC events.
Failure mode:       Proof stacked so deep the ask never comes → keep AG1's cadence (S-13).
Effort:             S
```

```
S-03  COA/testing proof spine                                      [E-065, E-066]
Job to be done:     Kill the category's #1 objection — "is this safe/pure/legit?" — with
                    verifiable, specific evidence.
Why it's S-tier:    Dandy's strongest real asset (actual COAs + permanent /COA QR route) in
                    the category that needs it most. AG1 shows the pattern at its best:
                    numbers + published reports beat adjectives.
Corpus evidence:    AG1 "tested for over 500 pesticides… 280 banned substances" + "SEE THE
                    RESULTS" report links; Grüns "70 different pesticides… 4 types of heavy
                    metals"; Resilia/BioRoot show the cost of claiming "tested" without
                    artifacts.
Dandy implementation: Quality section states the specific panel (what is tested, per batch,
                    by whom) with a "See this batch's report" link to /COA. PDP reassurance
                    row includes "Every batch third-party tested — read the COA." Never
                    say "tested" anywhere without the link.
Placement:          dandy-quality (home + PDP), PDP reassurance row, footer, FAQ; /COA page.
Dependencies:       Real COA for launch batches; Cansu asset #6 (batch-to-bag explainer);
                    durable /COA redirect (handoff §7).
Success metric:     /COA visits from PDP; dandy:faq_engagement on safety items; conversion
                    rate of COA-viewing sessions vs not.
Failure mode:       COA page breaks or lags batches → the proof becomes the leak. Guardrail:
                    QR-destination test in release checklist (already in handoff).
Effort:             M (content + one Cansu asset; routing exists)
```

```
S-04  Honest offer mathematics                                     [E-026, E-027, E-028]
Job to be done:     Make the subscription and the ladder feel obviously smart — with
                    numbers that survive any scrutiny.
Why it's S-tier:    Per-day framing is on every winner's buy box; anchor discipline is what
                    separates AG1 from the Grüns/Resilia mess. Dandy's math is genuinely
                    good: it just needs to be SHOWN.
Corpus evidence:    Grüns "$1.78/day" vs "$2.38/day" on both plans; AG1 "less than $3 a
                    day" + † reference-price discipline; Resilia's inflated anchors as the
                    negative print.
Dandy implementation: 30-ct gummy buy box shows: one-time $59.99 ($2.00/gummy) vs
                    subscription $47.99 ($1.60/gummy) — both plans get per-gummy (F-D
                    supersession, DANDY_DR_DESIGN_PROPOSAL.md §3.4.5). Ladder rungs
                    show per-pouch: 1× $59.99 · 3× $119.98 ($39.99/pouch) · 5× $179.97
                    ($35.99/pouch). The ONLY strikethrough anywhere is the true one-time
                    price. Same numbers in cart, checkout, email.
Placement:          dandy-buy-box + dandy-recap + cart; all surfaces.
Dependencies:       Server-authoritative pricing (Shopify Function/app per handoff §4).
Success metric:     dandy:quantity_select distribution (share choosing 3/5); sub attach
                    rate; zero support tickets about price mismatch.
Failure mode:       Displayed math drifts from checkout math → release-blocking test.
Effort:             S (display) / M (server-side discount enforcement — already planned)
```

```
S-05  Subscription-first buy box done honestly                     [E-048, E-050, E-051, E-033]
Job to be done:     Capture recurring revenue by default without a single dark pattern.
Why it's S-tier:    Universal among Tier-1; Dandy's handoff already specifies the honest
                    version (visible renewal terms, instant price updates on toggle-off).
Corpus evidence:    Grüns benefits-in-buy-box ("Free Shipping Today / Pause Or Cancel Any
                    Time / 30-Day Money-Back Guarantee"); AG1 "Update or cancel anytime"
                    under every CTA; BioRoot as the felony version to never approach.
Dandy implementation: Sub toggle default-ON for 30-ct: strike-through vs one-time, amount
                    charged today, renewal amount + cadence, then benefits: 20% savings ·
                    free shipping · never run out · reminder before renewal · skip/pause/
                    cancel anytime. Toggle-off updates every price instantly and grays
                    (not breaks) sub benefits. First charge equals renewal charge, stated.
Placement:          snippets/dandy-buy-box.liquid (built as prototype; wire to real
                    selling plans).
Dependencies:       Selling plan groups in Shopify; processor confirmation for recurring
                    kratom billing (§12 — THE launch dependency).
Success metric:     dandy:selling_plan_select rate; sub share of orders; renewal-period
                    chargeback rate ≈ 0.
Failure mode:       Processor rejects recurring → fall back to Fork-3 no-sub model
                    (ladder + threshold + guarantee) without redesign.
Effort:             M (integration; UI built)
```

```
S-06  The 1/3/5 ladder, Resilia's grammar minus Resilia's lies     [E-029]
Job to be done:     Lift AOV by making the middle/top rung self-evidently smarter.
Why it's S-tier:    Ladder mechanics are proven across Resilia/Goli/ED/Auri; Dandy's
                    buy-2-get-1 / buy-3-get-2 arithmetic is real and deterministic.
Corpus evidence:    Resilia's 3-rung card structure w/ per-rung savings, flag, free-ship
                    top rung (structure confirmed best-in-class; anchors condemned);
                    Jones Road's quiet 1/3/6 with per-unit prices.
Dandy implementation: Three visual cards (built): 1 pouch $59.99 + $5.95 shipping ·
                    3 pouches $119.98, $39.99/pouch, FREE shipping · 5 pouches $179.97,
                    $35.99/pouch, FREE shipping. Savings stated as "get 1 free"/"get 2
                    free" — never against invented anchors. Flag the 3-pack "Most chosen"
                    only after data says so; at launch: "Best for starting out" honesty.
Placement:          PDP offer panel (built); recap repeats it.
Dependencies:       Shopify Function for exact ladder math (handoff §4).
Success metric:     AOV; rung distribution; dandy:quantity_select.
Failure mode:       Ladder × subscription matrix confuses → per handoff, prefer
                    subscription-first clarity over forcing both (David's stated tiebreak).
Effort:             S (UI built) / M (server math)
```

```
S-07  Guarantee, one sentence, everywhere                          [E-092, E-093]
Job to be done:     Remove purchase risk at every click; never contradict yourself.
Why it's S-tier:    Universal pattern + the most betrayed one (6/14 brands shrink terms in
                    fine print). For kratom, a clean guarantee is also processor hygiene.
Corpus evidence:    AG1 guarantee microcopy under every CTA; Grüns keep-the-product 30-day
                    + "<1% use it"; the F-05 hall of shame.
Dandy implementation: Owner sets terms (recommend: 30-day money-back on first order, no
                    return required below a $ cap, refund minus shipping only if stated).
                    Then ONE sentence — e.g. "30-day guarantee: not for you? We'll refund
                    your first order." — rendered under every buy CTA, in FAQ, cart,
                    policy page, identical.
Placement:          Under all CTAs (buy box, recap, sticky bar), FAQ, /policies, cart.
Dependencies:       David's approval of terms + legal wording (§12).
Success metric:     Refund-request rate (expect low single digits); conversion lift on
                    CTA-adjacent guarantee (A/B post-launch).
Failure mode:       Terms written aspirationally then narrowed → F-05. The sentence ships
                    only after the policy matches it.
Effort:             S
```

```
S-08  Trust triplet at first CTA                                   [E-020]
Job to be done:     Pre-kill the top three objections at the exact first decision moment.
Why it's S-tier:    Present at the first CTA of every Tier-1 brand in some form; nearly
                    free; mobile-critical real estate.
Corpus evidence:    Resilia "30-Day Risk-Free Trial · Third-Party Tested · Ships from USA";
                    AG1 badge grid below hero; IM8 checkmark trio.
Dandy implementation: Under the PDP primary CTA and hero CTA: "✓ Every batch lab-tested
                    (COA) ✓ 30-day guarantee ✓ Ships fast — check your state." Third slot
                    doubles as the restricted-state disclosure (E-102) — honesty that
                    saves refunds.
Placement:          PDP offer panel + sticky bar tooltip; homepage value strip
                    (dandy-value-strip, built).
Dependencies:       Guarantee terms (S-07); state-restriction link target.
Success metric:     CTR on first CTA; restricted-state bounce vs checkout-block rate
                    (want the bounce EARLY, not at checkout).
Failure mode:       Triplet becomes six badges → noise. Cap at three.
Effort:             S
```

```
S-09  Category education module that closes                        [E-128, E-169-part]
Job to be done:     Convert kratom-naive visitors by teaching just enough, then asking.
Why it's S-tier:    For an ad-restricted category, education is both the acquisition
                    channel and the conversion unlock; AG1 proves education pages can be
                    conversion pages.
Corpus evidence:    AG1 ingredient-class education each ending in a benefit + CTA; MUD's
                    category-replacement education; Dandy's own handoff sequence
                    (What is kratom? → experiences → formats).
Dandy implementation: Keep dandy-kratom-intro on home + condensed version on PDPs; every
                    education block ends in a benefit line + CTA (E-136). "Kratom in 60
                    seconds" explainer (Cansu asset #4) anchors /learn.
Placement:          Homepage §5 (built); PDP below-fold §3; /learn page.
Dependencies:       Cansu assets #4/#5; legal pass.
Success metric:     dandy:faq_engagement; /learn → PDP progression rate; time-on-education
                    vs conversion correlation.
Failure mode:       Education without an ask (dead end) or ask without education (cold
                    bounce) — the linkage IS the element.
Effort:             M
```

```
S-10  Objection-led FAQ near the decision                          [E-095]
Job to be done:     Clear the objections the page hasn't already killed — by name.
Why it's S-tier:    Universal; built; in kratom the FAQ is also the compliance surface.
Corpus evidence:    AG1 "Is this another greens powder?"; Grüns effort/taste FAQs; Goli's
                    objection inventory.
Dandy implementation: Order FAQ by objection frequency: Is this legal? / Will I feel
                    weird? (intensity expectations) / Is it safe — what's in it? (→COA) /
                    How much do I take? (→start low) / Can you ship to me? (→state list) /
                    How does the subscription work — how do I cancel? / What if I don't
                    like it? (→guarantee).
Placement:          dandy-faq on home + PDP (built), full FAQ page.
Dependencies:       Legal-approved answers; customer-care manual (from David).
Success metric:     dandy:faq_engagement by item — the open-rate ranking IS the objection
                    research for the next iteration.
Failure mode:       FAQ written from the inside ("What is mitragynine?") instead of from
                    fear ("Will I fail a drug test?" — answer honestly per legal).
Effort:             S
```

```
S-11  Above-the-fold discipline on mobile                          [E-023, E-024]
Job to be done:     Media, title, benefits, choices, price, CTA reachable fast on the
                    primary device.
Why it's S-tier:    Mobile is the store; every corpus winner puts price above the fold;
                    Dandy's ≈1,400px-to-CTA target is already the right budget.
Corpus evidence:    Corpus-universal price-above-fold; IM8's persistent per-day sticky
                    CTA; handoff mobile mandates.
Dandy implementation: Enforce the 1,400 CSS px budget on every PDP (not just gummies);
                    sticky ATC appears after the buy box scrolls off; 44px targets, 16px
                    body (built). Audit capsule/powder templates to the same budget.
Placement:          All product templates.
Dependencies:       Capsule renders (Cansu #1) to avoid tall placeholder blocks.
Success metric:     Mobile time-to-first-ATC; sticky-bar share of dandy:add_to_cart_intent.
Failure mode:       New sections creep above the buy box over time — add a px-budget check
                    to the release scan.
Effort:             S (gummy done; port to other PDPs)
```

```
S-12  Owned language, compounded                                   [E-105]
Job to be done:     Make Dandy un-price-shoppable by owning the words the category is
                    understood through.
Why it's S-tier:    AG1's most durable moat is linguistic; Dandy's slogan system already
                    exists ("ONE PLANT. TWO GEARS." / "START LOW. FIND YOUR DANDY." /
                    "KNOW WHAT'S IN THE BAG.") — the work is disciplined repetition.
Corpus evidence:    AG1 "Foundational Nutrition"/"Daily Health Drink"; Goli's ® taste
                    hook; MUD's voice moat.
Dandy implementation: Assign each slogan a fixed job and surface: TWO GEARS = experience
                    education; START LOW = responsible use + onboarding; KNOW WHAT'S IN
                    THE BAG = quality/COA. Repeat verbatim across site, packaging, email.
                    Never introduce synonyms.
Placement:          Section headers sitewide; email subject architecture.
Dependencies:       None.
Success metric:     Branded-search volume for slogan phrases over time (compounding).
Failure mode:       Slogan drift/synonym creep dilutes ownership — copy style guide line.
Effort:             S
```

```
S-13  Conversion moment after every proof crest                    [E-138, E-011]
Job to be done:     Let readers convert at the exact point they become convinced.
Why it's S-tier:    Universal cadence among winners (AG1: 9 CTAs/page; Resilia duplicates
                    the whole buy box); Dandy's recap section is the bottom bracket.
Corpus evidence:    AG1 CTA-every-~2-modules with depth-varied copy; Resilia's second buy
                    box; Grüns "Start Now" repetition.
Dandy implementation: On PDP: CTA (or sticky bar) reachable after buy box, after quality/
                    COA, after comparison, after FAQ, and the full recap (built) at page
                    end. On homepage: section CTAs route to lineup/PDP (never a hero buy
                    box, per handoff). Vary verb by depth: "Pick your Dandy" → "See the
                    tests" → "Start low. Find your Dandy."
Placement:          Existing sections; mostly copy + anchor links.
Dependencies:       None.
Success metric:     ATC attribution by page position (instrument section id into
                    dandy:add_to_cart_intent).
Failure mode:       CTA spam on a premium page — cadence is every proof CREST, not every
                    scroll unit.
Effort:             S
```

```
S-14  SEO education→conversion architecture                        [E-169]
Job to be done:     Own the queries that replace the ads kratom can't buy.
Why it's S-tier:    Traffic filter: with paid social closed, "what is kratom / kratom
                    gummies / is kratom legal in X" queries are the scalable cold channel,
                    and AG1 proves the education→conversion linkage pattern.
Corpus evidence:    AG1 /best-green-powder and /ag1-reviews search-intent landers + /ctr
                    twins; Grüns's angle-page skill (retargeted to SEO here).
Dandy implementation: Native Shopify pages (not the preview virtual router): /learn
                    cluster (what is kratom, gummies vs powder vs capsules, state
                    legality, how to read a COA), each with benefit-ending sections and a
                    lineup CTA block. Permanent /COA. State-legality page doubles as the
                    restriction disclosure.
Placement:          /learn + /pages/*; internal links from FAQ/PDP.
Dependencies:       Real page records + redirects before launch (handoff §9); legal pass.
Success metric:     Organic sessions to /learn cluster; /learn → PDP progression;
                    assisted conversions.
Failure mode:       Education cluster written like a head shop or like a pharma insert —
                    the two-gears voice is the needle to thread.
Effort:             M–L (content program; templates exist)
```

**High-scoring elements filtered OUT of S-tier, and why:**
- **E-049 Sub selected-by-default (7.85 A)** — kept A not S deliberately: it ships, but its integrity depends entirely on S-05's visible-terms execution; scoring it S separately risks celebrating the pattern without the guardrail.
- **E-032 Itemized gift stack (6.95 B)** — margin filter: unfunded until David confirms economics; bridge = zero-COGS kit (guide, stickers, COA card) if desired.
- **E-054 Loyalty gift ladder (6.80 B)** — margin + resource filter; the corpus's best retention idea, queued for phase 2 with real margin data.
- **E-076 Expert endorsement (6.00 B)** — integrity/positioning filter: kratom + white coats = the "unsupported medical badge" the handoff bans; revisit only with genuinely credentialed, disclosed, legal-approved voices.
- **E-037 Replacement-value chart (6.45 B)** — risk filter: self-constructed anchors (AG1's $225) are a reference-price tightrope; Dandy's version (vs. bar tab) also walks into alcohol-comparison claims. Needs legal design first.
- **E-008 Advertorials (5.70 B)** — traffic + risk filter: no ad channel to feed them; the craft reroutes to §S-14.
- **E-159 SMS program (5.90 B)** — carrier-filtering risk for kratom keywords; pilot carefully post-launch (§12).

---

## §10. DANDY BLUEPRINT

### 10.1 Page archetype & rationale

**Archetype: premium education-forward conversion page** — AG1's skeleton (long, authored, proof-sequenced, CTA-cadenced) with Goli's per-module compression and a COA-centered trust spine no corpus brand needed as badly. Homepage is a **category-translation router** (not a buy page); the PDP is the conversion page. This matches the handoff's already-specified journey and the fork decisions in §7. Rejected archetypes: hard DR funnel (Resilia — integrity + positioning fail), pure-compression page (Goli — insufficient for category-naive traffic), quiz-gated funnel (compliance surface + build cost).

### 10.2 Homepage wireframe (maps to `templates/index.json`, mostly built)

| # | Section (theme section) | Job | Powered by |
|---|---|---|---|
| 1 | Announcement bar (`dandy-announcement`) | One true offer/service message ("Free shipping on subscriptions & 3-packs · 30-day guarantee") | E-014 |
| 2 | Header (`dandy-header`) | Minimal nav; Shop dominant | E-001 |
| 3 | Hero (`dandy-hero`) | "KRATOM, MADE EASY." + gummy hero; route to lineup | S-01 (E-016/017) |
| 4 | Value strip (`dandy-value-strip`) | Trust triplet: lab-tested/COA · guarantee · ships-fast/state check | S-08 (E-020) |
| 5 | Pick Your Dandy lineup (`dandy-lineup`) | All 3 formats, real prices, per-gummy framing on hero SKU *(superseded 2026-08-16 by ruling F-D in `DANDY_DR_DESIGN_PROPOSAL.md` §3.4.5: per-gummy primary, per-day legal-gated alternate)* | E-026/027, E-132 |
| 6 | What is kratom? (`dandy-kratom-intro`) | Category education, ends in benefit + CTA | S-09 (E-128, E-136) |
| 7 | Two gears story (`dandy-two-gears`) | Experience education: energy/focus vs comfort/unwind; self-selection | E-012, E-105 |
| 8 | Gummy story (`dandy-split-story`) | Format-pleasure positioning vs smoke-shop friction | E-016, T2:Auri lesson |
| 9 | Responsible use (`dandy-use-guide`) | "START LOW. FIND YOUR DANDY." — expectation setting, safety-forward | E-131, E-098, E-099 |
| 10 | Quality & COA (`dandy-quality`) | "KNOW WHAT'S IN THE BAG." — testing specificity + See-the-report link | S-03 (E-065/066/067) |
| 11 | Proof slots (`dandy-review-slots` / `dandy-proof-ledger`) | At launch: founder note + testing facts (honest bridge); later: real reviews | E-075, E-070-bridge |
| 12 | Format comparison (`dandy-format-chooser`) | Which Dandy for me? (quiz replacement) | E-100, E-132, Fork 4 |
| 13 | FAQ (`dandy-faq`) | Objection clearing incl. legality, states, cancellation | S-10 (E-095) |
| 14 | Final CTA (`dandy-image-banner`/`dandy-final-cta`) | Full-bleed close: "Start low. Find your Dandy." | E-143, E-113 |
| 15 | Footer (`dandy-footer`) | Policies, cancellation instructions, state list, /COA | E-064, E-102, E-166 |

### 10.3 PDP wireframe (maps to `templates/product.json`)

Above the fold (desktop two-column; mobile ≤1,400px to CTA — S-11):
1. Gallery (`dandy-product-gallery`) — slots 2–4 become infographics: strength/count explainer, what's-inside, COA pointer (E-124, Cansu assets).
2. Title + format + benefit-led bullets (E-018, legal-gated).
3. Trust line (bridge for missing reviews): "Every batch tested · 30-day guarantee" (E-019-bridge, S-08).
4. Size/strength selector → 1/3/5 ladder cards with per-pouch math (S-06) → subscription toggle default-on with full terms (S-05) → dynamic selected-offer summary + per-gummy price (S-04, F-D supersession) → CTA "Start with [selection]" (E-141) → guarantee microcopy sentence (S-07) → reassurance row: shipping/state link, 21+, secure checkout, COA (E-102, E-152).

Below the fold, in proof-sequence order (S-02): 5. Benefit/format story → CTA. 6. Product facts, ingredients, directions, warnings from final labels (E-123, E-130). 7. Two-gears education condensed (E-128). 8. Responsible-use guide (E-131) — "which serving is for me" + start-low. 9. Quality/COA deep block with batch link (S-03) → CTA. 10. Review slots — launch: founder note + "reviews coming; here's what we can prove today" honesty (Fork 5 bridge); post-launch: tagged, verified reviews (E-071/072/082). 11. Format comparison table (E-100). 12. FAQ (S-10). 13. Recap buy box (E-011) + sticky mobile CTA (E-139).

### 10.4 Offer architecture spec

- **Tiers (hero 30-ct gummy):** 1 pouch $59.99 (+$5.95 ship) · 3 pouches $119.98, $39.99/pouch, free ship · 5 pouches $179.97, $35.99/pouch, free ship. Subscription (single pouch): $47.99 every 30 days, 20% off, free shipping, $1.60/gummy. 10-ct = $24.99 one-time trial rung. Capsule/powder subs deferred per handoff until economics/processor confirm.
- **Display rules:** every price labeled one-time or subscription (F-16 guardrail); only real one-time prices as strikethroughs (F-06); first charge = renewal charge (F-03); per-gummy on both plans *(F-D supersession of E-026's per-day default — see `DANDY_DR_DESIGN_PROPOSAL.md` §3.4.5)*; savings expressed as "get 1/2 free" + per-pouch math (E-027/028).
- **Subscription framing:** benefits checklist inside the buy box (E-050); renewal reminder promised and delivered (E-052); price-lock sentence (E-043); cancellation self-serve + human, instructions indexed (E-064); if the recurring-billing rail fails → Fork-3 fallback (ladder + threshold + guarantee, Ridge/Jones-Road model) with no layout change.
- **Guarantee:** one owner-approved sentence everywhere (S-07). **Shipping:** $5.95 flat / free at sub & 3+; restricted-state link at every shipping mention (E-102).

### 10.5 Proof architecture spec (launch state — honest bridges, no fabrications)

Order on conversion path: (1) format/category clarity → (2) trust triplet → (3) offer → (4) testing specificity + COA artifact link → (5) label transparency → (6) founder accountability note → (7) expectation-setting (start low, effects vary) → (8) FAQ → (9) recap. Explicitly absent at launch (honesty as strategy): review counts, customer counts, press, expert endorsements — each has a defined unlock (E-156 review engine; E-079/078 only when true). This ordering follows §6's premium-brand convergence; the bridge follows Fork 5.

### 10.6 Objection map

| Objection | Where handled | How |
|---|---|---|
| What even is kratom? | Home §6, PDP §7, /learn | S-09 education, two-gears frame |
| Is it legal / can I get it? | FAQ top item, shipping rows, state map page | E-099/102; early disclosure beats checkout heartbreak |
| Is it safe? What's actually in it? | Quality sections, COA link, label panels | S-03, E-123, E-130 |
| Will I feel weird / too much? | Use guide, serving guidance, "not for you if…" | E-131, E-098, E-099 (never an effect ladder) |
| Which format/strength do I pick? | Lineup, format chooser, comparison table | E-132, E-100, E-012 |
| Is this a subscription trap? | Buy box terms, renewal reminder, cancel instructions | S-05, E-052, E-064 |
| What if I don't like it? | Guarantee sentence at every CTA | S-07 |
| Why is it $60? | Per-gummy math, per-pouch ladder math | S-04 |
| Is this brand legit? | Founder note, COA artifacts, coherent numbers everywhere | E-075, S-03, F-13 guardrail |

### 10.7 Design-system direction

Premium-joyful per binding Figma: orange #F04B23 reserved as the CTA/action monopoly (E-119); dark-brown/pale-peach sectioning for narrative rhythm (E-120); condensed uppercase display for slogans-as-headers (E-126, S-12); editorial authored scroll, no repeated bordered-card monotony (handoff §6); restraint as premium signal — no countdowns, no promo stacking, honest badges only (Fork 6, F-01/06/11). Photography: real product/lifestyle (in Git) + infographic gallery slots (Cansu).

### 10.8 Mobile spec

≤1,400 CSS px to primary CTA on every PDP; sticky ATC bar after buy box exits viewport, echoing exact selection + price (E-139/140); tap targets ≥44px, body ≥16px (E-163); trust triplet compressed to one line under CTA; FAQ accordions and gallery swipe as primary interactions; AVIF/WebP responsive images, LCP budget on hero (E-162); state-restriction access within one tap of any shipping mention.

---

## §11. BUILD SEQUENCE & TEST ROADMAP

**Phase 1 — launch-critical (S-tier; largely wiring what's built):**
1. Real catalog + selling plans + server-authoritative ladder pricing (S-04/05/06 dependencies) — blocks everything.
2. Processor confirmation for recurring billing (S-05; fallback pre-decided).
3. Guarantee terms decided → one sentence propagated (S-07).
4. COA spine: /COA permanence test, batch link on PDP/quality, testing-specificity copy (S-03).
5. Native page records for /learn, /COA, FAQ, About + redirects (S-14 foundation; replaces virtual router).
6. PDP fold budget ported to capsule/powder templates (S-11); trust triplet (S-08); FAQ objection ordering (S-10); CTA cadence + recap anchors (S-13); slogan job assignments (S-12).
7. Analytics: attach GA4 listeners to dandy:* events with section-position params (measurement for everything below).

**Phase 2 — A-tier (first 60 days):**
Review engine (app selection E-071, solicitation timing E-156, tagged display E-082, honest distribution E-072) · founder story block + About (E-075) · onboarding email sequence (E-155) · cancellation-instructions SEO page (E-064) · infographic gallery slots as Cansu delivers (E-124) · batch-to-bag explainer (E-067) · cart trust seals + state note (E-152) · renewal reminder flow (E-052) · price-lock + auto-applied microcopy (E-043/035) · /learn content cluster expansion (S-14).

**Phase 3 — B-tier tests (data-gated):**
Loyalty gift ladder (E-054, needs margin) · affiliate/creator LPs (E-170) · membership naming (E-053) · mixed-format "find your gear" kit (E-150) · behavioral guarantee stat (E-074, needs 6 months of true data) · comparison-vs-status-quo chart with legal (E-037/100) · SMS pilot with carrier-compliance check (E-159) · win-back + reactivation (E-063/158).

**Experiment backlog (ICE 1–10; sample logic: at launch traffic, prioritize high-Impact/high-Ease; anything needing >2k sessions/variant waits for traffic reality — see §12):**

| # | Hypothesis | Variant vs control | Primary metric | I | C | E | ICE |
|---|---|---|---|---|---|---|---|
| X1 | Per-day framing on both plans lifts sub attach | Buy box ± "$1.60/day vs $2.00/day" | dandy:selling_plan_select rate | 8 | 8 | 9 | 8.3 |
| X2 | Guarantee microcopy under CTA lifts ATC | CTA ± guarantee sentence | dandy:add_to_cart_intent | 7 | 8 | 9 | 8.0 |
| X3 | "Best for starting out" flag on 3-pack shifts rung mix | Flag on/off | rung distribution, AOV | 7 | 7 | 9 | 7.7 |
| X4 | COA link visible in buy area lifts conversion for new visitors | Reassurance row ± "read the COA" | ATC rate, /COA CTR | 7 | 7 | 8 | 7.3 |
| X5 | Sticky-bar selection echo beats generic "Add to cart" | Echo vs generic label | sticky-bar ATC share | 6 | 7 | 9 | 7.3 |
| X6 | Two-gears self-selection above lineup lifts PDP progression | Home section order swap (§7 vs §5) | home→PDP rate | 6 | 6 | 8 | 6.7 |
| X7 | Recap buy box captures education-readers | Recap on/off (or position) | ATC by page position | 6 | 7 | 7 | 6.7 |
| X8 | Trial 10-ct as cart add-on lifts AOV without cannibalizing 30-ct | Cart cross-sell on/off | AOV, 30-ct share | 5 | 6 | 8 | 6.3 |
| X9 | Founder note outperforms empty review area at launch | Founder block vs quality-fact block | scroll-to-ATC correlation | 5 | 5 | 8 | 6.0 |
| X10 | Serving-guidance placement above ladder reduces refunds | Use-guide position | refund rate, support tickets | 6 | 5 | 6 | 5.7 |

Minimum-sample honesty: at pre-launch traffic none of these reach significance quickly; run X1–X5 as sequential (before/after with guardrail metrics) rather than parallel A/B until sessions justify splits.

*Supersession note (2026-08-16): X1 and X3 predate rulings F-D and the flag-honesty spec (`DANDY_DR_DESIGN_PROPOSAL.md` §3.4.5/§3.4.6). X1 runs per-gummy — the per-day arm is an inert locale key while F-D stands. X3's launch flag is `BEST FOR STARTING OUT` on rung 1 (never "Most Popular" or a 3-pack flag until data makes a claim true).*

---

## §12. GAP REGISTER — what could change these recommendations

1. **Margin headroom [UNVERIFIED]** — gates gift stacks (E-032), loyalty ladder (E-054), keep-the-product guarantee cap (E-094), free-shipping economics. *Resolve: per-SKU landed-cost sheet from David before enabling any gifted offer.*
2. **Recurring billing for kratom via Argyle/Authorize.net [UNVERIFIED]** — gates S-05/06 stacking, prepaid tiers (E-040), post-purchase upsells (E-153). *Resolve: end-to-end live transaction test incl. renewal; fallback model pre-specified (Fork 3).*
3. **Traffic mix [INFERRED]** — SEO/affiliate/QR assumption drives S-14's weight and demotes ad-congruence elements (E-172). *Resolve: 90 days of GA4 acquisition data; if a compliant paid channel emerges, promote E-003/008 from B.*
4. **Guarantee terms** — S-07 blocked on owner decision; corpus recommends 30-day/first-order/no-return-under-cap. *Resolve: David + legal sign the single sentence.*
5. **Review infrastructure** — platform choice (E-071) and solicitation compliance (incentivized-review disclosure, E-083) undecided; until real reviews exist, E-019/022/070 run on the founder bridge. *Resolve: pick app pre-launch so day-1 orders get asked.*
6. **AKA GMP qualification status [UNVERIFIED]** — if Dandy's manufacturer is (or can be) American Kratom Association GMP-qualified, E-069 jumps to A-tier as the category's only credible certification badge. *Resolve: ask the manufacturer.*
7. **SMS carrier filtering for kratom content [UNVERIFIED risk]** — gates E-159. *Resolve: pilot with compliance vendor guidance.*
8. **Express-pay availability under Authorize.net (E-151) and BNPL (E-038)** — likely unavailable for kratom; confirm rather than assume.
9. **Corpus observation gaps** — carts, checkouts, post-purchase flows, email/SMS lifecycles, and popup layers of all 14 brands were JS/session-gated and unobservable; AG1 data is from May-2026 archive snapshots; Everyday Dose and Ridge were fetched via proxy/archive. Third-party analytics claims (Grüns ad counts, AOV figures) are UNVERIFIED and marked so in the raw files. A live-browser (or purchase-based) audit of Grüns + AG1 checkout and post-purchase flows is the highest-value follow-up capture.
10. **No screenshot evidence** — per the method note; if pixel-level design reference is needed for Cansu, re-capture named URLs in a browser.
11. **Legal review of all recommended copy** — every benefit-ending education line (E-129/136), felt-state framing (E-110), and alcohol-comparison framing (E-135) ships only through the `data-copy-status` → legal pipeline. A legal "no" on benefit language materially weakens E-018/108 and shifts weight further onto proof (S-03) and offer math (S-04).

---

## §13. EVIDENCE APPENDIX

**Raw capture files (full scroll maps, element inventories with verbatim excerpts, per-URL capture logs, evidence tags):**
- `.context/teardown-research/tier1-gruns.md` — 17 URLs fetched live 2026-08-16; quiz (403), help center (JS) unobservable
- `.context/teardown-research/tier1-goli.md` — 17 URLs fetched live 2026-08-16; JS buy-box states unobservable
- `.context/teardown-research/tier1-resilia.md` — 19 URLs across 4 live domains 2026-08-16; Trustpilot 403 (search-snippet data marked secondary)
- `.context/teardown-research/tier1-im8.md` — 18 URLs fetched live 2026-08-16; checkout/popups unobservable
- `.context/teardown-research/tier1-ag1.md` — live site bot-walled (429); 18 Wayback snapshots Oct-2025–May-2026 incl. CMS JSON payloads + ~250-URL CDX site map
- `.context/teardown-research/tier2-auri-mudwtr-everydaydose.md` — Everyday Dose via text-render proxy (site 403s crawlers)
- `.context/teardown-research/tier2-nutrafol-squatch-petlab.md` — quiz internals JS-gated
- `.context/teardown-research/tier2-jonesroad-ridge-bioroot.md` — Ridge via Wayback (Cloudflare 403) + live products.json; BioRoot incl. page-source subscription config

**Capture dates:** all live fetches 2026-08-16; AG1 snapshot dates per its capture log. **Verbatim excerpt log:** all ≤15-word excerpts quoted in §§1–10 appear with full context in the files above; excerpts passed through a fetch-extraction layer and are near-verbatim (highest-stakes numbers double-fetched where noted). **Screenshot index:** none — see method note (page 1); URL + date + excerpt substitutes throughout.

*— End of master document.*
