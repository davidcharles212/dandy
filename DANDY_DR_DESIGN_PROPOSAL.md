# DANDY DIRECT-RESPONSE DESIGN PROPOSAL
## Calibration → Kratom application → Designed scaffold → Asset fill-in

**Date:** 2026-08-16 · **Method:** three-model panel (Claude Opus, Claude Sonnet, Claude Fable — the models available in this environment; requested "opus 4.7/4.8/gpt-5.5" are not accessible and nothing here pretends otherwise) auditing the **real Figma file** (parsed from `Dandy Web Design (1).fig` — full extraction in `.context/teardown-research/figma-extraction.md`) against the 14-brand corpus teardown (`DANDY_CONVERSION_BLUEPRINT.md`). Panel outputs synthesized here, then re-scored by all three models against a 10-point DR rubric in hostile-grader mode; every round's actual scores and deductions are recorded in Part 5, and the program is certified only when all three graders award 10/10 — no round's result is claimed before it exists.

**Build order (per Jake's direction):** 1) calibrate what S-tier DTC design decomposes into (trust × conversion), 2) apply to kratom — the education elements that convert, 3) execute the scaffold (journey + homepage/PDP variations, fully designed), 4) fill in image/infographic/video assets afterward via the manifest in Part 4 — no asset blocks the scaffold.

---

## PART 1 — CALIBRATION: what S-tier DTC design actually decomposes into

*(Derived from the corpus registry §5-§6; sharpened by panel audits. Every scaffold decision in Part 3 cites these.)*

### 1.1 The trust stack (what makes a stranger believe)
- **T1 Category legibility** — "I can place what this is in under 3 seconds" (E-016/017).
- **T2 Verifiable proof** — artifacts I could check myself: COAs, labels, named facts — not adjectives (E-065/066, S-03).
- **T3 Accountable humans** — a founder/team who signs their name (E-075; Fork 5).
- **T4 Numerical coherence** — every number reconciles everywhere; the corpus's #1 leak is self-contradiction (F-03/05/07/13).
- **T5 Honest defaults** — no urgency theater, no hidden terms; restraint reads premium (Dr. Squatch/Jones Road evidence).
- **T6 Expectation calibration** — tell people what varies and who it's NOT for (E-098/099).
- **T7 Risk reversal welded to the ask** — one guarantee sentence under every CTA (S-07).

### 1.2 The conversion stack (what makes a believer buy)
- **C1 One dominant path** — minimal nav, education routes to PDP, no dead ends (E-001/002, E-136).
- **C2 Price reframing** — per-unit math on every plan and rung (E-026/027). *(Dandy deviates from the corpus's per-day default: per-gummy primary, per-day legal-gated — §3.4.5.)*
- **C3 Structured choice** — self-segmentation (gears/tiers) → format → configuration; ladder makes the smarter rung obvious (E-012/029/132).
- **C4 Subscription-first, honestly degraded one-time** — benefits attached to the sub; terms fully visible (E-048/050/051/036).
- **C5 Proof sequencing** — credibility before price; verification after the ask; risk reversal last (E-086).
- **C6 Conversion cadence** — an ask after every proof crest; recap buy box; sticky mobile bar (E-138/011/139).
- **C7 Mobile fold discipline** — media→title→proof line→choices→price→CTA within ~1,400px (E-024).
- **C8 Retention sold at acquisition** — renewal reminders, price-lock, skip/pause visible pre-purchase (E-043/052).

### 1.3 How they compound
Trust converts only when it meets an ask (T×C, not T then C): the COA link belongs *inside* the buy area, the guarantee *under* the button, expectation-setting *beside* the strength choice. S-tier pages interleave; C-tier pages segregate ("trust section" then "buy section").

### 1.4 The continuity law (panel addition — Sonnet, verified against the repo)
Trust is **continuous or it is nothing**: the arc must survive every surface a visitor can land on, because with no paid ads there is no controlled entry point — SEO lands on /learn or a capsule PDP, a pack-QR lands on /COA, a referral lands anywhere. The audit of the actual repo found the trust arc currently breaks at click two-to-three: cart is unbranded stock Shopify, /COA renders an empty-state apology (while physical packs will QR-point at it), capsule/powder PDPs are placeholder shells with the ladder and subscription disabled, the guarantee sentence exists nowhere in code, and no post-purchase surface exists at all. **Calibration rule: a journey-continuity break outranks any on-page optimization** — no hero variant matters if click three lands on "this brand isn't finished." The scaffold in Part 3 therefore sequences continuity repairs as launch-blocking, ahead of every A/B idea.

### 1.5 What the real Figma already gets right (extraction-verified, `figma-extraction.md`)
The calibration isn't starting from zero — the parsed .fig already implements: per-unit pricing ("$0.93 / gummy"), a subscription benefits checklist including **"Locked-in price on every renewal"** (E-043, ahead of most of the corpus), mitragynine education with honest variability language ("Effects vary by person, food, tolerance… start lower"), a Tier 1–4 strength finder, a use-case section ("A cleaner way to unwind without pouring another drink"), "Every batch lab tested" in the announcement bar, Lab Results in the nav, a 30-Day Guarantee badge, and a documented design system (white page, orange/brown + green-for-verification, Nobel scale, base-4 spacing, 4×4 hard shadows, 3px/5×5 primary CTA). The S-tier work is therefore: **correct** (stale prices, fixture reviews, "$50+ free shipping" vs approved model, "pain relief" copy, and "Same-day dispatch before 2pm CT" — an unverified ops claim: David verifies it or it leaves the announcement bar), **complete** (ladder, per-gummy math, capsules, cart, /COA, guarantee sentence, restricted-state disclosure), and **connect** (tiers→SKUs, education→CTA, QR→live COA).

---

## PART 2 — KRATOM APPLICATION: education elements that convert

Kratom-naive traffic asks five fear-questions in a fixed order; each maps to one education element that must **end in an ask** (E-136 — education without a CTA is a dead end; an ask without education is a cold bounce). The parsed Figma already contains honest drafts of #2, #3, and #4 — the work is correcting, connecting, and completing, not inventing.

**2.1 "What is kratom?" → the 60-second category translator.**
Fear: *"Is this a drug, a supplement, a leaf, a scam?"* Element: three-line compression (leaf from the coffee family → centuries of traditional use → Dandy portions it exactly, verified every batch → /COA). The Figma's existing what-is-kratom copy is 90% right but contains "pain relief" (legal-flag; route through claims review) — replace with benefit-territory language. Placement: homepage §6, PDP condensed echo, /learn full version. Ends in: `PICK YOUR DANDY`. (S-09, E-128/136; asset AST-03 fills in later.)

**2.2 "Will I lose control of the experience?" → the two-gears bounding frame + mg exactness.**
Fear: intensity — kratom's version of Goli's vinegar-taste objection. Element: "ONE PLANT. TWO GEARS." converts diffuse drug-anxiety into a bounded consumer choice between two named experiences; "35 MG. EXACTLY." (precision-as-proof, E-130/137) answers the eyeballing-powder fear — pre-portioned is the safety argument. The Figma's mitragynine explainer ("Effects vary by person, food, tolerance… start lower") is genuinely good expectation-setting copy — keep its substance, keep it guidance-not-promise. Ends in: gear-specific shop CTAs.

**2.3 "How much do I take?" → the start-low serving guide.**
Fear: overdoing it. Element: "START LOW. FIND YOUR DANDY." — start with one, wait, adjust next time; the label is the guide; explicitly *never* a serving→effect ladder (the Figma's Tier 1–4 strength finder survives only reframed as strength *selection guidance* — "Best for first-timers" is fine; "maximum body effects" needs legal rewrite). Includes the "NOT FOR YOU IF" honesty block (21+, pregnancy, medications, 16 no-ship states — E-099): exclusion makes everything else said more credible. Ends in: `HOW TO START →` (/learn), not a commerce verb — this is the one education element that earns trust by NOT selling.

**2.4 "Is THIS brand legit?" → the COA literacy + batch-to-bag pair.**
Fear: adulterated/mislabeled product — the category's defining objection. Elements: the verification band ("KNOW WHAT'S IN THE BAG." + the exact panel list from the real COA + `READ THIS BATCH'S REPORT`), the batch-to-bag 4-step strip with the QR tie-in ("the code on every pack opens this same page — forever"), and the "HOW TO READ A COA" accordion (E-134: teach the reader the standard, then win by the standard you taught). Green check = the verification-only color, now a legible convention: **green appears only beside claims whose artifact link resolves.** Ends in: `READ THIS BATCH'S REPORT` → and /COA itself ends in a lineup CTA.

**2.5 "Which one is for me?" → the format chooser.**
Fear: wasting $60 on the wrong pick across 8 configurations. Element: gear → format → strength self-selection (gummy = easiest start / capsule = strongest, exact / powder = the traditionalist's format), with the 10-ct $24.99 trial rung framed as the honest low-stakes answer: "Not sure? Start with 10." Ends in: correctly-routed PDP — which is why capsule/powder PDPs being placeholder shells is an education failure, not just a commerce one (Part 1.4).

**The connective rule:** each element hands off to the next fear in sequence on long surfaces (homepage, PDP below-fold) and stands alone as an SEO lander (/learn cluster, S-14) for entry-at-any-stage traffic. Every element carries `data-copy-status` and ships text-first; AST slots (Part 4) upgrade them visually without structural change.

## PART 3 — THE SCAFFOLD: journey + designed variations

### 3.1 The ideal customer journey (merged panel view: Sonnet's flow architecture × Fable's trust questions)

**Design premise: there is no controlled entry point.** With paid channels closed to kratom, visitors land wherever search, a friend, or a pack-QR drops them — so brand legibility, the trust triplet, and a next-step CTA must fire on *every* surface, and journey continuity outranks on-page polish (Part 1.4).

| # | Stage | Surface | The question being asked | The mechanic that answers it | Failure mode → guardrail |
|---|---|---|---|---|---|
| 0 | Discover | Search results, a friend's text, a pack QR | "Is kratom safe/legal at all?" | /learn cluster answering the scary queries first-party; QR lands on /COA — a lab report as first impression | Head-shop or pharma voice → two-gears voice, legal-passed |
| 1 | Land | Any page | "What is this — and is this a real company?" | 3-second hero legibility + design restraint (no countdowns, no promo stack); announcement bar = one true message | Landing on an unfinished surface = instant trust kill → continuity repairs are release-blocking (3.3) |
| 2 | Learn | Home §6 / PDP echo / /learn | "What does it do — will I feel weird?" | Two-gears bounding frame + "35 MG. EXACTLY." + variability honesty (Part 2.2) | Effect-ladder copy → guidance-only rule, legal review |
| 3 | Trust | Quality band, proof bridge, /COA | "There are no reviews — what can I check myself?" | COA spine + founder letter + provable-facts ledger whose last row admits the review absence | /COA resolving to an empty state is WORSE than no link → minimum-viable real COA before any QR pack ships |
| 4 | Choose | Two-gears → lineup → format chooser | "Which of 8 configurations is for me?" | Gear→format→strength self-selection; 10-ct framed "Not sure? Start with 10."; "BEST FOR STARTING OUT" flag | Flat 8-SKU wall → the two-tier funnel; no routing into placeholder PDPs |
| 5 | Configure | Buy box | "Is this math real? Charged forever?" | Per-gummy both paths (per-day is the legal-gated alternate, §3.4.5); charged-today = renews-at stated twice; price-lock; skip/pause/cancel named; toggle-off grays never breaks | Displayed ≠ charged math → release-blocking server-authoritative pricing |
| 6 | Buy | CTA → cart → checkout | "What if it's not for me / never arrives?" | [GUARANTEE_SENTENCE] at the click; cart echoes selection + triplet + state note | Stock-Shopify cart scent break → cart re-skin is launch-blocking |
| 6b | **Restricted-state visitor** (named persona) | Triplet slot 3 → state page | "Can I even buy this?" | Disclosure at the FIRST CTA; state page answers in one glance; if restricted: plain statement, route to /learn or honest notify-me | "Checkout heartbreak" (configure→address→blocked) → metric: early bounce (good) vs checkout block (bad) — no corpus precedent, Dandy must invent this measurement |
| 7 | Onboard | Thank-you page, emails 0–3, pack insert | "Am I doing this right? Too much?" | Start-low arc restated at activation; pack QR closes the trust circle ("scan your bag — your batch's report") | Silence (currently nothing exists) → minimum thank-you customization ships at launch |
| 8 | Reorder | Renewal email, portal | "Still the same product/price I trusted?" | Renewal reminder BEFORE the charge; price-lock honored (per signed scope, decision #9); skip/pause self-serve; own the "how to cancel Dandy" query with an indexed page | F-04 drift ("email us to cancel") → self-serve + human, instructions public |
| 9 | Advocate | Post-purchase, review platform, the pack itself | "Can I recommend this without embarrassment?" | Review ask timed to experience; sharable artifacts are the SAFE ones (/COA, /learn — advocates share education, not discount codes) | Premature review ask → E-156 timing; only real, third-party-audited reviews ever displayed |

### 3.2 The designed variations

Four page designs (two homepage, two PDP), all S-tier-complete, differing on one strategic bet each. The binding consolidated build specs are below and in §3.4/§3.5 (the `.context/dr-panel/` files are key-point digests of the panel submissions, not full specs; the full submissions live in the panel task outputs). All: white page, orange CTA monopoly, Nobel ramp, 2px/4×4 (primary CTA 3px/5×5; full-width CTA 4×4), pill CTAs, base-4 spacing; every price from Appendix B; `data-dandy-variant` + master/source event params; guardrails §2 of the test doc.

**HOME-A — "THE RECEIPTS" (trust-bottleneck bet).** Announcement (one true message) → hero `KRATOM, MADE EASY.` + pouch, CTA `PICK YOUR DANDY` / `SEE THE TESTS ↓` → trust triplet → **verification band promoted to position 4**: kicker `KNOW WHAT'S IN THE BAG.`, H2 "WE PUT THE LAB REPORT WHERE THE REVIEWS USUALLY GO.", zero-reviews honesty + exact COA panel list + batch-to-bag strip + `READ THIS BATCH'S REPORT` → lineup (real prices, hero card labeled `$1.60/gummy, subscribed`) → 60-second category translator → two gears (gear cards with gear CTAs) → start-low guide (non-commerce CTA) → proof bridge (founder letter + facts ledger, `DAY ONE. NOTHING TO HIDE.`) → format chooser → FAQ (two objection cards + fear-ordered accordion, legality first and answered proudly) → full-bleed final CTA (`START LOW. FIND YOUR DANDY.` + offer line + guarantee) → footer (cancel instructions, state list, /COA, disclaimers, 21+). *The recorded bet:* proof before product pitch reads as identity, not defense — deviates from blueprint §10.2 position 10; ship the classic order as default, test this first (panel split documented).

**HOME-B — "TWO GEARS FIRST" (comprehension-bottleneck bet).** Hero `ONE PLANT. TWO GEARS.` with dual CTAs (one orange primary, one secondary white — monopoly preserved) → immediate full-bleed gear split (`CLEAR. UPBEAT. SWITCHED ON.` / `WARM. LOOSE. SETTLED.`, each ending in mg note + `SHOP THIS GEAR`) → trust triplet → **gear-grouped lineup** (not format-grouped) → category translator after the desire is set → gummy format story (`NO POWDER CLOUDS. NO KITCHEN SCALE. NO GUESSWORK.`) → quality band (standard position) → start-low → proof bridge → FAQ → final CTA `FIND YOUR GEAR. START LOW.` *Routing note (Sonnet):* HOME-B is not only a sequential test — hold it as a **permanent source-keyed path** for pre-sold traffic (`?ref=pack` QR and referral arrivals skip education they don't need).

**PDP-A — "CREDENTIAL STACK" (considered-purchase bet; the default).** Above-fold order = §3.5's budget, exactly: announcement → header → gallery (5:4 crop; slot 1 packshot · slot 2 gummy macro (AST-09) · slots 3–5 infographics: 35-MG-exactly / what's-inside / COA pointer (AST-12)) → kicker pill `35 MG · MIXED BERRY` → H1 (2 lines max) → three benefit-first bullets → trust bridge line ("Launched [month] — every batch tested (COA →) · [guarantee short]", NO stars) → price + per-gummy line ($47.99 · $1.60/gummy sub vs $59.99 · $2.00/gummy, $2.20 delivered) → size selector (10/30, 2-up row; each card carries its per-gummy figure incl. the 10-ct's $2.50) → **sub-first subscription card** (toggle ON for 30-ct; cadence segmented control; honesty microstack: charged today = renews at, skip/pause/cancel "self-serve or one email — instructions here →" until the portal ships, price-lock line per owner decision #9) → receipt (CHARGED TODAY) → CTA `START WITH [selection echo]` → guarantee line. **Below the fold boundary:** trust triplet, then the 1/3/5 ladder as `STOCK UP & SAVE` on the one-time path ($59.99 / $119.98 $39.99-per-pouch GET-1-FREE / $179.97 $35.99-per-pouch GET-2-FREE, flag `BEST FOR STARTING OUT` on rung 1; formula-label strikes per §3.4.4). Below: format story → **verification zone** (COA band + label panels + `WHAT'S NOT IN THE BAG.` exclusion list) → **60-second category translator (condensed — fear #1 for direct-entry traffic; capsule/powder PDPs inherit it)** → gears condensed → start-low + `NOT FOR YOU IF:` block → proof bridge → format comparison → FAQ → recap buy box + sticky bar. Ask cadence and verbs per the binding ask map (§3.2.1, PDP-A row) — **exactly 5 asks** (6 = absolute cap, recorded ruling). The `[Launched month]` trust-bridge placeholder carries `data-copy-status="pending-owner"` — same never-quietly-becomes-copy protection as the guarantee.

**PDP-B — "THE STRAIGHT DEAL" (distrust-of-being-sold bet; ~35% shorter).** Hero `THE GUMMY THAT MAKES KRATOM EASY.` + two bullets → inline trust sentence (quiet B-v2) → **ladder-first offer** (1/3/5 primary with per-pouch math; sub beneath: "$47.99/30 days · $1.60/gummy · free shipping · skip, pause, or cancel anytime. First charge = renewal charge.") → **the `NO GAMES.` band** — "EVERYTHING WE'D WANT TO KNOW BEFORE BUYING FROM US": six one-liners (the math: buy-2-get-1, no invented 'was' prices · the tests → /COA · the reviews: none yet, we won't invent any · the subscription: $47.99 today, $47.99 every renewal, cancel self-serve or with one email · the states: we don't ship to 16, check yours → · the serving: start with one, the label is the guide) + anchor CTA `OKAY — PICK MY SIZE ↑` → 60-second education band → quality band → facts ledger (no founder letter — the page's voice IS the founder) → fear-ordered FAQ → recap + sticky. *This is the variant most native to a zero-review launch.*

**Decision metrics:** HOME-A vs -B → does /COA engagement correlate with conversion (trust bottleneck → A) or is home→PDP progression the leak (comprehension → B)? PDP-A vs -B → COA-session conversion + deep-scroll ATC share (→A) vs mobile time-to-ATC dominance (→B). Sequential windows at launch traffic; instrument `variant/master/source/section_position` on all `dandy:*` events now so parallel splits need no re-instrumentation later.

### 3.2.1 Binding ask map (per surface; release-scan asserts counts)

**Counting definition:** an *ask* = a commerce CTA whose destination advances the funnel (a card set = one ask; anchors back to the offer count; text-link commerce CTAs count). Non-commerce CTAs (education handoffs like `HOW TO START →`, /learn cross-links, capture fields) are **excluded** from ask counts. Further clauses: **the sticky bar is the buy-box ask restated** (same verb + destination), never counted separately; **artifact links inside disclosure prose** (e.g. the NO GAMES band's `→ /COA`) are citations, not asks; **on long surfaces, education elements hand off per the Part-2 connective rule instead of asking** — their terminal CTAs (e.g. the translator's `PICK YOUR DANDY`) merge into the next counted ask and are not counted separately; **a dual-CTA hero counts as one ask** — the primary commerce CTA counts, the secondary (`SEE THE TESTS ↓`, white secondary style) is a non-commerce verification anchor. `SEE THE TESTS` destinations are read as one meaning — verification content (in-page verification band or /about). Target = 5 asks per commerce surface; 6 = hard cap. **Slogan rule (restated correctly): one slogan = one verb + one destination-meaning; cross-surface reuse is permitted only with an identical destination.**

| Surface | Asks | Positions | Verbs (verb-to-destination consistency rule per the definition above, scan-asserted) | Destination |
|---|---|---|---|---|
| HOME-A | 6 (at cap — deliberate: education-ends-in-ask generates the 6th) | hero · verification band · lineup · gears · format chooser · final CTA | `PICK YOUR DANDY` · `READ THIS BATCH'S REPORT` · card CTAs · `SHOP THIS GEAR` · chooser cards · `START LOW. FIND YOUR DANDY.` | lineup · /COA · PDP · PDP · PDP · PDP |
| HOME-B | 6 (at cap) | hero · gear chooser · lineup · gummy story · quality band · final CTA | `FIND YOUR GEAR` · `SHOP THIS GEAR` · card CTAs · `SEE THE GUMMIES` · `READ THIS BATCH'S REPORT` · `FIND YOUR GEAR. START LOW.` | chooser · PDP · PDP · gummy PDP · /COA · PDP |
| PDP-A | 5 | buy box · COA band · comparison · FAQ-adjacent · recap | `START WITH [selection]` · `READ THIS BATCH'S REPORT` · `COMPARE THE FORMATS` (text link) · anchor ↑ · `START WITH [selection]` (recap) | cart · /COA · chooser · offer · cart |
| PDP-B | 5 | buy box · NO GAMES anchor · education band anchor · quality band · recap | `START WITH [selection]` · `OKAY — PICK MY SIZE ↑` · anchor ↑ · `READ THIS BATCH'S REPORT` · recap CTA | cart · offer · offer · /COA · cart |
| /learn (each) | 1 commerce (+1 non-commerce, excluded from count) | mid-article contextual (non-commerce) · foot module | next fear-question page · compressed lineup card (trial-routed pages may verb it `START WITH 10` → 10-ct PDP) | /learn next · chooser/PDP |
| Restricted-state page | 0 commerce (2 non-commerce: /learn link · notify-me capture) | per §3.6b | — | /learn · capture |
| /COA | 1 | foot of batch report | `PICK YOUR DANDY` | lineup |
| Cart | 1 | primary checkout CTA (zero cross-sell asks at launch) | `CHECKOUT` | checkout |
| Thank-you | 0 commerce (1 non-commerce) | start-low guide link | `HOW TO START →` | /learn |

### 3.2.2 Entry-surface routing map (SEO is the acquisition engine; every query cluster gets a surface, a fear, a SKU, a verb)

| Query cluster | Landing surface | Fear answered | Routed SKU | CTA verb |
|---|---|---|---|---|
| "what is kratom" / "kratom gummies" | /learn what-is-kratom | #1 category | 10-ct trial $24.99 | `START WITH 10` |
| "is kratom legal in [state]" | /learn legality → state page | legality | 10-ct trial via the standard /learn foot module, rendered after the state answer | `CHECK YOUR STATE` |
| "kratom lab testing / COA" | /learn how-to-read-a-COA → /COA | legitimacy | 30-ct hero | `READ THIS BATCH'S REPORT` |
| "kratom gummies dosage / how much" | /learn what-is-kratom §serving | intensity | 10-ct trial | `START WITH 10` |
| "[brand] reviews / is Dandy legit" | **/about (indexed page: founder letter + provable-facts ledger + COA links)** | legitimacy | 30-ct hero | `SEE THE TESTS` |
| pack QR scan | /COA (batch view) | legitimacy | reorder path | `PICK YOUR DANDY` |
Every /learn page links to /COA and at least one PDP; the foot module is the compressed lineup card (3 formats, real prices, per-gummy).

### 3.3 Launch-blocking continuity repairs (precede every A/B — merged panel ranking)
1. **[GUARANTEE_SENTENCE] signed by David + legal** (the #1 owner decision; the single recommended default lives verbatim in §3.7 decision 1 — never restated elsewhere) → implemented as ONE locale string wired to buy box, sticky, recap, cart, FAQ, policy.
2. **/COA minimum-viable real content** before any QR-carrying pack ships — real batch report + plain-language panel summary + batch selector + COA-literacy accordion; degrade gracefully, never an apology page.
3. **Cart re-skin** — Dandy tokens, selection echo, trust triplet, guarantee, state note, sub-terms echo (currently stock Horizon with none of this).
4. **Capsule/powder PDPs enabled** — ladder ON, **subscription OFF at launch** (Appendix B: capsule sub pricing is deferred pending economics/processor confirmation — the $55.24/$84.99 sensitivities must not render; powder has no launch subscription). Launch state = the no-sub buy-box grammar (§3.4.9), real one-time prices, PDP-A structure incl. the condensed category translator, text-placeholder art (AST-01/02). Homepage promises all three formats; two of three currently dead-end.
5. **State-restriction page** shipped text-first (map upgrades later); triplet slot-3 must resolve somewhere real.
6. **Thank-you/order-status minimum** — selection recap + one start-low line + subscription preview.
7. **Cancel-instructions page, SEO-indexed** ("How to cancel Dandy" owned, F-04 inverted into trust).
8. **Token reconciliation** (white page, 2px/4×4; primary CTA 3px/5×5) before any new variation ships — every later visual QA depends on it.
9. **Release-scan trust assertions, specified as mechanisms (machine-enforceable, not aspirations):**
   - Green tokens (`--dandy-green*`) may render only inside a `dandy-verified` component whose schema **requires** an `artifact_url`; scan greps green vars outside the component; CI link-checks every `artifact_url` → HTTP 200.
   - Any string matching `/\b(lab.?)?test(ed|ing)\b/i` in sections/snippets/locales must sit inside a component exposing `coa_url` (same link check).
   - All prices render from Shopify price objects or one generated pricing include mirrored from Appendix B; scan fails any `/\$\d+\.\d{2}/` literal elsewhere (this catches the existing hardcoded `data-*-price` attributes).
   - Zero star glyphs/counts pre-reviews · grep-single guarantee string · routine/habit-framing blocklist grep (`/routine|daily ritual|make it a habit/i` in commerce copy — catches the live `dandy-buy-box.liquid:63,136` and `dandy-catalog.liquid:20` strings) · guarantee wording invariant: one locale string; above-cap selections render it with the appended cap clause, never a variant sentence · no `/day` price string while the F-D ruling stands (per-day = one inert locale key) · no unverified ops claim in the announcement bar · ask counts per §3.2.1 · px fold budget per §3.5 · /COA uptime + QR destination test.
10. **21+ age affirmation** — designed with legal as a single restrained affirmation step (owner decision #11); inherited checkout defaults are not a compliance answer for a 21+ product.
11. **FDA disclaimer placement rule** — the structure/function disclaimer renders adjacent to every benefit-claim block, not only in the footer; one locale string, grep-single, scan-asserted.
12. **Minimum self-serve cancellation at launch** — whatever the chosen subscription app ships (portal deferral to phase 2 covers *enhancements*, not the existence of self-serve cancel); until then all cancel copy reads "self-serve or one email — instructions here →", never "~1 minute".

### 3.4 Offer mechanics spec (Opus panel, adopted)

**The reframe that governs everything: at $47.99/$59.99 this is a considered purchase in a scrutinized category, not the $28.99 impulse buy the Figma's offer panel was drawn for.** Proof density, receipt anatomy, and honesty mechanics must be considered-purchase grade.

1. **Receipt buy box.** The offer panel terminates in a line-item receipt: item · plan · shipping → 2px rule → **CHARGED TODAY $47.99** (display type) → "Renews at $47.99 every 30 days. Same price, always." → "$1.60 per gummy." One-time state: shipping $5.95 → CHARGED TODAY $65.94 → "$2.20 per gummy delivered." (AG1 receipt grammar, E-122; kills F-03/F-16 exposure structurally.)
2. **The two-axis honest-value frame (F-B — mandatory).** True math: sub = $1.60/gummy; 3-pack one-time = $1.33; 5-pack = $1.20. The subscription is NOT the best per-unit value and no badge may claim it is. Resolution shipped on the page, **scoped to the selected size** (with 30-ct selected): `LOWEST TODAY (30-COUNT) — subscription ($47.99 charged today · free shipping · skip or cancel anytime)` beside `LOWEST PER GUMMY — 5 pouches ($179.97 · $1.20/gummy · one-time)`. When 10-ct is selected the frame re-scopes ($24.99 + $5.95 shipping = $30.94 charged today · $2.50/gummy, $3.09/gummy delivered) — and yes, the 10-ct renders its own per-gummy figure, the least flattering number in the lineup, because publishing the axis where you lose is the whole point. No corpus brand publishes the axis where its subscription loses; this is Dandy's category-first honest-math move and it is load-bearing for the whole honesty positioning.
3. **Delete the stacked sub-on-ladder pricing (F-C — repo defect, release-blocking).** `snippets/dandy-buy-box.liquid` (lines ~96–131) currently stacks 20% onto ladder rungs, producing $95.98/3-pack (46.7% off list) and $143.98/5-pack (**52.0% off**) — prices that exist in no approved record, on a cadence that ships 90–150 gummies per renewal. The same cards carry hardcoded `MOST POPULAR`/`BEST VALUE` badges (unearned, and `BEST VALUE` on a fabricated price) and the 1-pouch card strikes `$59.99` against the *subscription* price — a strikethrough the anchor rule prohibits (only one-time-vs-one-time strikes are legal). **Delete all of it — stacked prices, badges, and the sub-strikethrough — before any variation lands.** Clean architecture: **subscription applies to the single-pouch rung only; interval flexibility comes from a 30/60/90-day cadence selector, never from discount stacking.** Cadence spec: 3-up pill segmented control inside the subscription card (adds ~64px to the fold budget — restated in §3.5): `1 pouch every 30 days — $47.99 per renewal` (default) · `every 60 days` · `every 90 days`; cadence changes the interval, never the price-per-pouch. Multi-pouch-per-renewal quantities are a phase-2 owner decision (decision #8) and may not ship on unapproved literals. A subscriber wanting more per cycle is routed to a one-time 3/5-pack add-on. Cadence extends intervals for lighter users — up-volume demand is served by the ladder, down-volume by cadence.
4. **Honest anchors (F-E).** The only strikethroughs permitted, because they are literally true: `3 × $59.99 = $179.97 → $119.98 · ONE POUCH FREE` (33.3%) and `5 × $59.99 = $299.95 → $179.97 · TWO POUCHES FREE` (40.0%). **The formula label (`3 × $59.99`) is mandatory on the rung card itself wherever the strike renders** — the strike is only honest while its derivation is visible. Every rung card carries per-pouch, per-gummy, and its own shipping line (rung 1: `+ $5.95`; rungs 3/5: green `FREE`).
5. **Unit framing ruling (F-D).** Primary unit = **per gummy** ($1.60 vs $2.00/$2.20 delivered) — arithmetically identical to per-day, but avoids asserting a daily-use ritual that conflicts with START LOW posture and label constraints. "Per day" is held as a legal-gated alternate. (Recorded as a deliberate deviation from corpus consensus E-026; rationale: compliance-positive at zero conversion cost.)
6. **Flags.** Launch: rung 1 `BEST FOR STARTING OUT`, rung 5 `LOWEST PER GUMMY` (both true), nothing else. `MOST POPULAR`/`BEST VALUE` only when data makes them true — and `BEST VALUE` never on the subscription (F-B).
7. **Subscriber benefits ×6** (five from handoff C.3 + the price-lock line the Figma itself added; currently 3 of 6 shipped): 20% off · free shipping · never run out · reminder before every renewal *(capability-gated — decision #10; may not render unconfirmed)* · skip/pause/cancel anytime · locked-in renewal price *(scope per decision #9)*. "How to cancel" text link inside the panel → indexed page.
8. **The 10-ct selected state (a standard variant state, not just a fallback).** When 10-ct is selected on PDP-A, the subscription card is **replaced** (not grayed) by the plan-card grammar with one honest line — "The 10-count is a one-time trial — subscriptions start at the 30-count." — plus an inline upgrade affordance showing the 30-ct sub price. Distinction, stated: guardrail "grays, never breaks" governs **toggle-off**; SKU-level unavailability gets **replacement**, because graying an option that cannot exist reads as broken.
9. **The no-subscription buy box (processor-proof, R-14).** Capsules 30-ct, powders, and all 10-ct SKUs ship without subscription — and PDP-B's plan-card grammar is the designed fallback if recurring kratom billing fails entirely: same receipt anatomy, ladder + free-ship-at-3+ carrying the benefit weight, nothing grayed or missing-looking. Build this grammar first; it costs nothing to have and everything to not have.
10. **Selection echo contract.** One selection object (variant · count · quantity · plan · cadence · price) renders five surfaces — buy box summary, CTA label, sticky bar, cart line, checkout — verbatim. Parity asserted mechanically (3.3 #9).

### 3.4.11 Delivery-failure reversal
Cart/checkout trust triplet composition (3-item cap holds): tested→COA · guarantee · **reship-or-refund** ("Lost, damaged, or undeliverable? We reship or refund — you don't chase the carrier.") — the state note lives as the separate cart line per §3.3#3, so no slot is displaced. Also renders in the shipping FAQ. Legal-gated; owner David + ops. In a restricted-shipping category, "will it even arrive?" is a named fear and it gets a named reversal.

### 3.4.12 Honest capture (no popups ≠ no capture)
(i) /learn foot: single-field capture with a truthful exchange — "Get the one-page start-low guide" — no discount bait (consistent with the advocacy posture: Dandy shares education, not codes). (ii) Restricted-state notify-me, exact copy: "We'll email you once if [state] changes. Nothing else." — single-use, stated policy. (iii) **Recorded ruling: no exit-intent overlay** — deliberate, consistent with restraint-as-trust; its absence is a decision, not an omission.

### 3.4.13 Lifecycle emails 0–3 (specified, not just named)
E0 order confirmation (at purchase): restate the selection receipt + one start-low line. E1 ship notification: "the QR on your pack opens your batch's COA" — the trust circle closes in hand. E2 day 5: "how's it going" + support path — **no review ask**. E3 day 14: the review ask (E-156 timing). Renewal reminder: fires ≥3 days before every charge — **capability-gated by owner decision #10; the buy-box benefit line "reminder before every renewal" may not render until the capability is confirmed.**

### 3.5 Mobile fold budget (reconciled; binding target ≤1,300px, hard cap 1,400px)
Two independent estimates of the current PDP anatomy at 390px: ≈1,348px (Fable/synthesis arithmetic, 1:1 gallery, ladder above CTA) and ≈1,728px (Opus, incl. 3-line H1 + full sub panel) — both confirm the drawn anatomy risks or breaks the 1,400px handoff budget. **Adopted spec:** announcement 40 · header 56 · gallery **5:4 landscape crop (390×312) — deliberate: buys 175px of fold budget vs 4:5 portrait (487px); AST-12 gallery assets composed to a 5:4 safe area** · kicker pill 28 · H1 **2 lines max** ≈76 · three bullets 78 · trust line 22 · price + per-gummy 64 · size selector as 2-up row 84 · subscription card incl. cadence segmented control 196 · receipt 96 · CTA 56 · guarantee line 20 · gaps ≈96 → **≈1,224px to CTA** (under the 1,300 target and 1,400 hard cap). **The 1/3/5 ladder moves below the CTA** as `STOCK UP & SAVE` (still beside the buy box in desktop's two-column). Eviction order (binding — the ladder already sits below the CTA in this anatomy): next candidates in order, each a budgeted line item: (1) size selector collapses from 2-up cards to an inline segmented row (−40px), (2) kicker pill drops (−28px), (3) one benefit bullet drops (−26px). The subscription card and its honesty microstack never drop. All functional text ≥16px — every number in the offer panel is functional text, whatever the Figma's 10–72 ramp shows; targets ≥44px; unselected cards drop to `--dandy-shadow-small`; ladders never render as horizontal strips. A real 390px render check + a px-budget assertion in `release-scan.sh` (encoding the 5:4 crop and the 1,300/1,400 limits) are build-phase Definition-of-Done items.

**Capsule/powder 390px estimates (anatomies differ materially):** capsule = announcement 40 + header 56 + gallery 312 + kicker 28 + H1 76 + bullets 78 + trust 22 + price/per-capsule 64 + strength 2-up 84 + count 2-up 84 + receipt 96 + CTA 56 + guarantee 20 + gaps ≈96 → **≈1,112px** (no sub card at launch, owner decision #6). Powder = same minus the strength selector (−84) and its inter-element gap (−8), and the per-unit line is per-gram/per-label-serving only → **≈1,020px**. Both under target; render checks still required.

**§3.5.1 /COA mobile spec** (every pack QR lands here — effectively 100% mobile, often on retail/home connectivity): above the fold at 390px = batch ID + plain-language pass/fail summary line + the panel list; the full lab PDF is progressive disclosure, never the initial payload; LCP budget ≤2.5s on 4G; a cached offline/slow-connection fallback that still shows the batch summary.

### 3.6 Instrumentation
Every section root: `data-dandy-variant`; every `dandy:*` event: `{variant, master, source, section_position}`. Restricted-state split metric (6b). Retention metric set (launch): renewal survival at charges 1 and 2 · skip:cancel ratio · cancel-page exit destination · thank-you-page COA-scan rate. X-series experiments from the test doc mapped to the variants above; sequential before/after until traffic supports parallel.

### 3.6b Restricted-state disclosure — mechanism spec (grader-requested precision)
Trigger: static, always-visible — the trust triplet's third pill on PDP/homepage buy surfaces (on cart/checkout the third pill is reship-or-refund per §3.4.11 and the state note renders as the separate cart line instead — the guarantee renders once, in the triplet, not duplicated in the cart list) and a text link beside every shipping mention (never a geo-modal; IP guessing misfires and a modal reads as a wall). State page content spec: H1 `CAN WE SHIP TO YOU?` → one-glance answer structure: the 34-state "yes" statement, then the 16-state list (alphabetical, full names + codes), then plain-language why ("state law, not our choice"), then two productive exits for restricted visitors — `/learn` ("kratom is still worth understanding") and the honest notify-me field carrying §3.4.12's exact string (cited from its single source; not restated here) — then policy links. Checkout enforcement remains authoritative; this page's success metric is moving the bounce earlier (§3.1 row 6b). **Known stale-data correction target (named, not left to the generic scan): the live Shopify shipping profile and `page.shipping.json` still carry $8.00/$70+/$15 express rates — reconcile to the approved $5.95-flat/free-on-sub-and-3-packs model before launch.**

### 3.7 Panel rulings, owner decisions, and build/no-build register

**Recorded rulings (panel disagreements + supersessions):**
- **Stroke/shadow detail** → the parsed design-system sheet supersedes test-doc §0-R3's blanket 2px: standard elements 2px/4×4; **primary CTA 3px stroke + 5×5 shadow**; **secondary CTA = white fill, dark stroke, no shadow** (HOME-B's dual-CTA hero uses it); **full-width CTA (checkout/cart) = pill + 4×4, never 5×5** (the three button roles per the Figma's Buttons frame — primary/secondary/full-width; standard non-button elements 2px/4×4 per its Effects frame). Naming normalized: "primary CTA" is the token role (the PDP buy-box CTA is primary; "hero" describes placement, not a token). Recorded so the token reconciliation encodes all three values by role.
- **Copy blocklist: routine/habit framing** — "routine," "daily ritual," "make it a habit" are banned in commerce copy (conflicts with START LOW posture and F-D rationale); the repo's live "Make it a routine" cart-prompt legend is renamed under this rule. Owner decision #5's legal-gated surfaces explicitly include homepage gear copy ("SWITCHED ON"/"SETTLED").
- **Ask-count** → target is **exactly 5 asks** per commerce surface; 6 is a hard cap for exceptional length, not a target (reconciles the panel's "exactly 5" with the earlier "≤6").
- **Per-day vs per-gummy** → per-gummy primary (Opus F-D), per-day legal-gated alternate. Reason: compliance-positive, arithmetically identical. Deviation from corpus E-026 recorded. **Supersession (explicit): this overrides the test doc's per-day surfaces** — Module C's shared "per-day framing on BOTH paths" rule, the C-v1/C-v3/J-v1 copy strings, and Appendix B.2's "Per day" column (read as per-gummy: same figures). Supersession notes have been added to the test doc (Module C banner) **and** the blueprint (§10.2 row 5 / §10.4 display rules / §11 backlog supersession line) so no downstream reader can ship `/day`.
- **Verification-band position** → classic position (post-offer on PDP, position 10 on homepage) ships as default; HOME-A's position-4 promotion is the first sequential test (Fable's bet, recorded; Opus's H1 concurs it is testable, not default).
- **PDP default** → PDP-A (sub-first receipt) ships as default per David's tiebreak; **PDP-B's plan-card grammar is built first** as the processor-proof fallback (Opus; the panel's private labels "P1/P2" = this document's PDP-A/PDP-B). HOME-B/"Occasion Store" held as a permanent source-keyed path for pre-sold traffic (`?ref=pack`), not only a test (Sonnet).

**Owner decisions required — each blocks a named surface (dates to be set by Jake/David; the surfaces cannot ship without them):**
| # | Decision | Owner | Blocks |
|---|---|---|---|
| 1 | Guarantee terms → one signed sentence. Recommended default, stated once and verbatim (cited everywhere else, never restated): **"30-day money-back on your first order — no return required, refund capped at $X."** David sets X against per-SKU landed cost (blueprint §12.1) *as part of signing the sentence* — until the sentence (including X) is signed, **no CTA surface ships** (repair #1); once signed, the guarantee line renders wherever the order total ≤ X, and on selections above the cap **the same locale string renders with its appended cap clause — presence is conditional, wording never varies** (release-scan asserted) | David + legal | Every CTA surface. **Unsigned = those surfaces do not ship**; the placeholder must never quietly become copy. |
| 2 | Recurring kratom billing confirmation (end-to-end incl. renewal) | David + processor | P1 subscription panel; fallback P2 pre-built |
| 3 | Review platform choice (must be pre-launch or the first cohort is unaskable) | Jake | E-156 solicitation from order #1 |
| 4 | Real COA panel list transcription (verification copy enumerates exactly what the report tests; 7-OH/adulterant claims only if COA-supportable) | David + lab | S-03 copy, exclusion list |
| 5 | Legal throughput on FAQ/label/benefit copy — the release scan correctly blocks on `aggressive-draft`/`missing-` markers; **the bottleneck on the best-built pages is legal review capacity, not design capacity** (Sonnet, verified) | David + legal | FAQ, /learn, PDP benefit copy |
| 6 | Capsule subscription economics — separate from #2: even with recurring billing confirmed, capsule sub prices ($55.24/$84.99 sensitivities) stay unrendered until David approves the economics | David | Capsule PDP sub toggle (launch state = no-sub grammar) |
| 7 | AKA GMP qualification status (blueprint gap-register §12.6, carried forward) — if the manufacturer is/can be American Kratom Association GMP-qualified, it unlocks E-069, the only credible certification badge in the category, into the verification band | David + manufacturer | Verification band badge slot |
| 8 | Multi-pouch subscription cadence/quantity pricing → Appendix B amendment before any cadence-priced literal ships | David | Cadence selector quantity options (interval-only ships without this) |
| 9 | Price-lock scope — David signs the commitment: "renewal price never increases while the subscription remains active" vs. unconditional "always" | David | The price-lock microstack line + subscriber benefit #6 |
| 10 | Renewal-reminder capability (pre-charge email ≥3 days out) + ESP/SMS provider confirmed to serve a kratom merchant (carrier compliance, blueprint Fork 7) | David + Jake + subscription app | The "reminder before every renewal" benefit line (may not render unconfirmed); journey stages 7–8 |
| 11 | 21+ age-affirmation mechanism, decided with legal — one restrained affirmation step (never a smoke-shop cookie-wall aesthetic) | David + legal | Launch (compliance) |
| 12 | "Same-day dispatch before 2pm CT" ops-claim verification — verified and kept, or removed | David + ops | Announcement bar |

**Build/no-build register for every undesigned surface (Opus G-53–63 × Sonnet gaps):**
| Surface | Decision | Note |
|---|---|---|
| Capsule PDP (strength→count selector) | **BUILD, launch** | PDP-A structure incl. condensed category translator; ladder ON, sub OFF (no-sub grammar §3.4.9; owner decision #6); text-placeholder art (AST-01) |
| Powder PDP | **BUILD, launch** | per-gram + label-serving math only; no per-gummy analog |
| Cart drawer + page | **BUILD, launch** | R-12 spec; honest progress only when literally true |
| /COA | **BUILD, launch — native page, never client-rendered** (printed QR points at it) | batch lookup, panel explainer, graceful fallback that still helps |
| /learn cluster | **BUILD, launch (3 pages) + grow** | what-is-kratom (exists, good), legality/states, how-to-read-a-COA. Page-level cadence: ≤2 CTAs per page — 1 commerce ask (foot lineup module) + 1 non-commerce handoff to the next fear-question page |
| Shipping/restricted-states page | **BUILD, launch** | text list first, map (AST-08) later |
| Cancellation instructions (indexed) | **BUILD, launch** | owns "cancel Dandy" |
| /about (founder + facts ledger, indexed) | **BUILD, launch** | the "is Dandy legit" SEO landing surface (§3.2.2); hosts the proof bridge as a page, not only a section |
| Collection 8-config matrix | **BUILD, launch** | vertical mobile, real prices, correct routing |
| Thank-you/order-status | **BUILD, launch (minimum)** | recap + one start-low line + sub preview |
| Onboarding email sequence (0–3) | **BUILD, launch (minimum)** | order confirmation + start-low reminder; Klaviyo present; owner: Jake |
| Renewal-reminder email | **BUILD, launch** | fires before every charge (handoff C.3 benefit #4 is a promise the lifecycle must keep); owner: Jake |
| Subscription portal | **BUILD, phase 2** (enhancements; app-dependent) | launch = app-native self-serve cancel (repair #12) + policy page + support path |
| OOS/error/loading states | **BUILD, launch** | async pricing needs skeleton + failure fallback |
| Review display system | **BUILD, phase 2** (post-real-reviews) | grid dimensions fixed now by proof bridge |
| Loyalty gift ladder | **NO-BUILD until margin data** | E-054, corpus-best but margin-gated |
| Quiz funnel | **NO-BUILD** | Fork 4: chooser does the job with zero drop-off |

**FAQ additions (grader catches — four items, all legal-gated, all in the fear-ordered accordion):** (1) "Will I fail a drug test?" — answered honestly per legal: kratom alkaloids are not typically screened on standard panels, but specialized tests exist; never promise a negative result. (2) "Can I become dependent on kratom?" — written per final-label warnings and legal: honest about habituation risk with regular use; reinforces start-low, take-breaks guidance; never minimizes. (3) "How soon will I feel it, and how long does it last?" — deferred to the final label's directions and the variability language (person, food, tolerance, format); guidance, never a promise. (4) "What if you can't ship to my state?" — states the 16-state reality plainly, links the state page, and names the pre-checkout disclosure so nobody discovers the block at the address step.

## PART 4 — ASSET FILL-IN MANIFEST (nothing here blocks Part 3 shipping)

Every visual asset the scaffold references, with slot ID, purpose, spec, and the text-only placeholder that ships until the asset lands. Sourced from the Figma inventory (24 embedded images incl. sky-blue pouch lifestyle, gummy 10/30 + powder 100/250 renders) and the handoff's Cansu request list.

| Slot ID | Asset | Type | Placement | Spec / composition | Ships-before placeholder |
|---|---|---|---|---|---|
| AST-01 | Capsule pack renders 50/90mg × 10/30ct, true relative scale | render | capsule PDP gallery, lineup | match existing pouch-render style, white bg + orange pack | typographic card: strength pill + count, Orange/5% bg |
| AST-02 | 1/3/5 pack lineup renders (hero SKU) | render | PDP ladder cards | 1, 3, 5 pouches composed at truthful scale | pouch render + ×N count badge |
| AST-03 | "Kratom in 60 seconds" botanical explainer | infographic | homepage what-is-kratom, /learn | leaf→formats diagram, desktop + mobile crops | text block (extracted Figma copy, legal-passed) |
| AST-04 | Strength-tier icon set (Tiers 1–4) | icons | strength finder | existing Figma icon slots (Sparkles/Flash/Flame/Rocket) refined; guidance-not-promise labels | numbered pill labels |
| AST-05 | Start-low / find-your-serving infographic | infographic | use guide, PDP education | step illustration, per final label directions | numbered text steps |
| AST-06 | Batch-to-bag COA explainer (from a real report) | infographic | quality section, /COA | 4 steps: leaf→lab→batch ID→bag, real COA crop | text strip + live /COA link |
| AST-07 | Founder portrait / origin short | photo/video | About, proof-bridge block | authentic, non-stock; 15-30s vertical video optional | signed text letter |
| AST-08 | US shipping-restriction map | interactive/SVG | shipping page, FAQ | 16 states distinct, accessible text list companion | text list (already required) |
| AST-09 | Gummy macro + texture loop | photo/video | PDP gallery slot 2 | existing closeup assets upgradeable; 3-5s loop | existing `dandy-gummy-closeup` stills |
| AST-10 | Mobile hero crops w/ copy-safe zones | photo | homepage/PDP mobile | protect H1 + CTA zones per Figma mobile frames | desktop crop center-weighted |
| AST-11 | UGC video posters | video | reviews section post-launch | only permissioned real customers | section absent until real (guardrail) |
| AST-12 | Infographic PDP gallery set (35-MG-exactly, what's-inside, COA pointer) | infographic | gallery slots 3–5 (Ridge pattern, E-124; slot 2 = AST-09) | 5:4 landscape safe area (390×312 mobile crop per §3.5), Nobel labels, token palette | product stills |

## PART 5 — PANEL SCORES (actual record; nothing claimed before it exists)

**Panel self-scores (pre-synthesis, of their own submissions):** Opus 9.6 · Fable 8.5 · Sonnet 7.2 (72/100). No unanimity existed at synthesis time and none was claimed.

**Round 1 (hostile-grader mode, of the synthesized proposal):**
| Grader | Total | Weakest criteria | Verdict |
|---|---|---|---|
| Opus | 7.6/10 | retention .6 · objection .7 · cadence .7 · mobile .7 | Yes if fixes applied — with the reservation that the doc failed its own T4 coherence rule (per-day drift, unbacked header claim) and must be self-audited, not just patched |
| Sonnet | 7.9/10 | edu-linkage .6 · retention .6 · price .7 · compliance .7 | Yes if fixes applied |
| Fable | 8.7/10 | retention .7 · price .8 · objection .8 · compliance .8 | Yes if fixes applied |

All round-1 deductions and their required fixes are logged verbatim in `.context/dr-panel/scoring-round1.md`. Every required fix was applied to this document before round 2 (the revision diff covers: per-gummy consistency + hero-card labeling, header claim correction, F-C scope expansion incl. sub-strikethrough + badges + exact percentages, cadence-selector spec + owner gating, 10-ct replacement state, single-statement guarantee default with refund cap + rung gating, delivery-failure reversal, dependence, drug-test, onset/duration, and state-delivery FAQ items (all four now present in §3.7), binding ask map §3.2.1 + no-synonyms rule, entry-routing map §3.2.2, 5:4 gallery ruling + announcement/cadence budget restatement + /COA mobile spec §3.5.1, 21+ affirmation + FDA-adjacency + ops-claim verification, mechanism-grade release-scan assertions, price-lock/ESP/renewal-capability/cadence-pricing owner rows, portal-minimum launch rule, honest-capture clause, lifecycle emails 0–3 spec, retention metric set, routine-framing blocklist, R3 stroke supersession, ask-count reconciliation).

**Round 2 (after all round-1 fixes were applied):**
| Grader | Total | Verdict |
|---|---|---|
| Sonnet | 8.9/10 | No — 7 mechanical fixes (cross-refs, AST-12 ratio, journey-row per-day residue, FAQ items, ask-map coverage, P1/P2 naming, slogan-rule wording) |
| Opus | 8.5/10 | No — 10 mechanical fixes (per-day residuals, onset FAQ, ask definition + count reconciliation, §3.4 numbering, guarantee-gate circularity, PDP-A/§3.5 anatomy match, AST-12, ops-claim owner row + capsule/powder estimates, routing-map conflicts, button-role naming) |
| Fable | 9.0/10 | No — 8 fixes (AST-12, onset + duplicate FAQ sentence, slogan rule + START LOW destination + stale PDP-A verbs, cross-refs + numbering, notify-me exact-string citation, Fable log appended to record file, test-doc F-D supersession, delivery-reversal triplet slot) |

Round-2 verdict pattern: the arithmetic layer was fully clean for the first time (every rendered number recomputes); every remaining deduction was a self-consistency or cross-reference defect introduced or left by the round-1 revision. **All round-2 fixes were applied before round 3**, including the two cross-document repairs (Fable's round-1 log appended to `scoring-round1.md` so the "logged verbatim" citation is true; the F-D per-gummy supersession note written into the test doc itself; the R3 three-role button ruling mirrored there too). Round-2 deduction logs: `.context/dr-panel/scoring-round2.md`.

**Round 3 (certification round, after all round-2 fixes):**
| Grader | Total | Verdict |
|---|---|---|
| Sonnet | 9.9/10 | No — 2 one-line fixes (ask-map column header; one "hero 3px/5×5" naming residue) |
| Opus | 9.0/10 | No — 9 fixes; three criteria at 1.0; best new catch: the F-B `LOWEST TODAY` claim was unscoped against the 10-ct on the same page, and the 10-ct's $2.50/gummy (the least flattering number) was rendered nowhere |
| Fable | 9.5/10 | No — 6 fixes; both cross-document repairs verified genuinely done; powder budget −8px unexplained |

**All round-3 fixes applied before round 4**, including: ask-map header + counting clauses (sticky = buy-box ask restated; disclosure links = citations; education handoff rule; dual-CTA hero = one ask), thank-you row format, /learn register wording, powder derivation shown, AST-09/AST-12 slot collision resolved (slot 2 macro; slots 3–5 infographics, names unified), secondary button role added + naming propagated to the test doc, **F-B scoped to the selected size with the 10-ct's $2.50/gummy rendered** (publishing the axis where you lose is the point), §3.2 citation corrected to name digests vs full specs, eviction candidates re-budgeted, F-D supersession extended into the blueprint (§10.2 row 5, §10.4 display rules, §11 backlog patched), portal register row = app-native self-serve cancel at launch, benefit #4 gate-marked, §3.6b notify-me cite-only + cart/checkout triplet carve-out acknowledged. Round-3 logs: `.context/dr-panel/scoring-round3.md`.

**Round 4 → FINAL CERTIFICATION (unanimous):**

| Grader | Trajectory | Final | Verdict |
|---|---|---|---|
| Opus | 7.6 → 8.5 → 9.0 → **10.0** | **CERTIFIED** | "I am not holding anything back to appear rigorous." Named best-in-class: the F-B two-axis frame (no precedent in the 14-brand corpus) and the continuity law; the release-scan assertions are "the mechanism that keeps both honest after the designers leave." |
| Sonnet | 7.9 → 8.9 → 9.9 → **10.0** | **CERTIFIED** (re-affirmed over the final delta: "no new inconsistencies; 10.0/10 holds") | "Every deduction was tracked to an exact edit, applied, and reverified… Nothing genuinely remains." |
| Fable | 8.7 → 9.0 → 9.5 → 9.9 → **10.0** | **CERTIFIED** (re-affirmed: "three of the five final changes actively strengthen claims I had passed under a weaker convention") | "The full number pass recomputes clean end to end… every Part-5 applied-claim is true." |

Final round-4 fixes (all verified by the graders who demanded them): $30.94 charged-today on the 10-ct frame (Fable) → $3.09/gummy delivered appended (Sonnet) → three blueprint prescriptive per-day purges + §10.4/§11 citation corrections + X1/X3 backlog supersession + HOME-A ask-row reorder + routine-blocklist scan mechanism + button-naming completion (Opus). Full grading record: `.context/dr-panel/scoring-round1.md`, `scoring-round2.md`, `scoring-round3.md` (includes rounds 3–4 and certifications).

**Certification statement.** Three independent models, four hostile rounds, ~40 distinct verified defects found and fixed — the majority of them the document violating its own rules, which is the defect class the corpus teardown identified as the category's #1 leak. The program is certified at 10/10 by all three graders on the state of this document, `DANDY_CONVERSION_BLUEPRINT.md`, and `DANDY_DESIGN_TEST_DOC.md` as of this record. What certification does NOT cover, stated plainly: the owner decisions in §3.7 remain open (guarantee sentence, processor confirmation, review platform, COA panel transcription, legal throughput, capsule-sub economics, price-lock scope, ESP capability, 21+ mechanism, ops-claim verification) — the design program is complete and internally true; the launch is gated on those signatures.
