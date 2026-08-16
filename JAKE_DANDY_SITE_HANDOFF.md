# Dandy Shopify launch handoff for Jake

**Prepared:** August 16, 2026

**Repository:** `https://github.com/davidcharles212/dandy`

**Working branch:** `build-dandy-shopify-store`

**Target branch:** `main`

**Store:** `hwicxd-qf.myshopify.com`

**Public domain:** `foreverdandy.com`

## 1. Your mission

Take the current unpublished Dandy Shopify build through launch. The finished site should:

- Look unmistakably premium, polished, and faithful to the supplied Dandy Figma system.
- Explain an unfamiliar category clearly enough for cold traffic.
- Use serious direct-response structure and merchandising inspired by Grüns, Goli, Resilia, IM8, and AG1.
- Sell the full launch catalog, with especially compelling subscription merchandising.
- Be complete on mobile, fast, accessible, and operational from product selection through checkout, renewal, cancellation, and support.

The Figma is the visual source of truth. Direct-response mechanics should be composed inside Dandy's design language, not pasted on as a generic supplement theme.

David will send you two key files separately because they are not stored in Git:

1. `Dandy Web Design (1).fig` — the original Figma design system and page designs.
2. `Dandy-Customer-Care-Training-Manual.pdf` — product, policy, usage, and support context.

David is also putting you on an email thread with Cansu, Dandy's designer. She can produce custom photography, product renders, diagrams, and other assets you specify.

## 2. Safety and source-of-truth rules

There are two Shopify themes with very different roles:

| Theme | ID | Role |
|---|---:|---|
| Horizon | `156783706290` | Current live/password-protected theme. Do not use this for iterative work. |
| Dandy — Development | `157641572530` | Unpublished development theme. All implementation and review iterations go here. |

Development preview:

`https://hwicxd-qf.myshopify.com?preview_theme_id=157641572530`

Do not publish or overwrite the live theme while iterating. Publish only the accepted launch snapshot after owner approval, final legal review, real commerce data, and end-to-end order testing.

The source-of-truth hierarchy is:

1. David's latest written direction, including this handoff.
2. Final product labels, packaging, COAs, operations rules, and approved pricing records.
3. The Figma design system and Cansu's approved assets.
4. The customer-service manual.
5. Existing theme fixtures and older planning documents.

If a theme fixture disagrees with a final label or Shopify record, the fixture loses.

## 3. Dandy in one page

Dandy is a modern, premium consumer kratom brand. It should feel like a joyful, trustworthy CPG/wellness brand, not a smoke-shop product with cleaner packaging.

The primary consumer territories are:

- **Energy + focus + euphoria:** a brighter, switched-on, upbeat experience for moving through the day, work, creativity, and social occasions.
- **Pain/body relief + euphoria:** a warmer, looser, more comfortable experience for taking the edge off and unwinding.

David's direction for draft website copy is to put the strongest credible foot forward. Do not pre-water down the central reasons people buy kratom. Draft direct, persuasive benefit language—including energy, focus, euphoria, pain relief/body comfort, and alcohol-free unwind concepts—then give legal a strong candidate to review. Legal will make the final claim decisions before publication.

This does not authorize fake evidence, fake reviews, fake urgency, invented clinical claims, or inaccurate directions. Keep claim status trackable in code/content data, use final labels for directions and warnings, and route final production copy through legal.

The current copy system uses invisible `data-copy-status` and claim identifiers for that workflow. Preserve that separation: the shopper should see confident consumer copy, not internal legal or implementation notes.

## 4. Confirmed launch catalog and pricing

The corrected catalog is **10/30-count gummies** and **50/90 mg capsules**. Earlier references to 20-count gummies or 95 mg capsules were typos.

These are the current working launch prices supplied to the build:

| Format | Configuration | One-time price | Current subscription direction |
|---|---|---:|---|
| Mixed Berry Gummies | 35 mg per gummy, 10 count | `$24.99` | Trial configuration; currently modeled as one-time only |
| Mixed Berry Gummies | 35 mg per gummy, 30 count | `$59.99` | `$47.99` every 30 days, 20% off, free standard shipping |
| Extract Capsules | 50 mg, 10 count | `$28.99` | Current model keeps 10-count as one-time trial |
| Extract Capsules | 50 mg, 30 count | `$64.99` | 15% subscription sensitivity is `$55.24`; configure only after final economics and processor/app approval |
| Extract Capsules | 90 mg, 10 count | `$44.99` | Current model keeps 10-count as one-time trial |
| Extract Capsules | 90 mg, 30 count | `$99.99` | 15% subscription sensitivity is `$84.99`; configure only after final economics and processor/app approval |
| Raw Leaf Powder | 100 g | `$34.99` | No launch subscription decision is configured |
| Raw Leaf Powder | 250 g | `$54.99` | Subscription test was deferred pending final costs and reorder data |

The Shopify backend does not yet contain this real catalog. At the last store audit it contained one active `$0.00`, zero-inventory placeholder product named Mixed Berry Kratom Gummies, with no real media, selling plans, discounts, or complete content.

### 1 / 3 / 5 offer architecture

The desired PDP quantity ladder is:

- 1 pack: regular one-time price.
- 3 packs: buy 2, get 1 free.
- 5 packs: buy 3, get 2 free.

For the 30-count gummy hero offer, the approved working presentation is:

| Tier | Total | Effective price per pouch | Shipping direction |
|---|---:|---:|---|
| 1 pouch | `$59.99` | `$59.99` | Working model: `$5.95` standard |
| 3 pouches | `$119.98` | `$39.99` | Free standard shipping |
| 5 pouches | `$179.97` | `$35.99` | Free standard shipping |

If the same buy-two/get-one and buy-three/get-two arithmetic is enabled for another selected SKU, the totals are deterministic:

| Selected SKU | 1 pack | 3 packs, pay for 2 | 5 packs, pay for 3 |
|---|---:|---:|---:|
| Gummies, 10 count | `$24.99` | `$49.98` | `$74.97` |
| Gummies, 30 count | `$59.99` | `$119.98` | `$179.97` |
| 50 mg capsules, 10 count | `$28.99` | `$57.98` | `$86.97` |
| 50 mg capsules, 30 count | `$64.99` | `$129.98` | `$194.97` |
| 90 mg capsules, 10 count | `$44.99` | `$89.98` | `$134.97` |
| 90 mg capsules, 30 count | `$99.99` | `$199.98` | `$299.97` |
| Powder, 100 g | `$34.99` | `$69.98` | `$104.97` |
| Powder, 250 g | `$54.99` | `$109.98` | `$164.97` |

Use the tiers David wants exposed for each format and confirm their economics before launch. The displayed math must always match the cart and checkout. Implement the discount through Shopify's server-authoritative pricing—a Shopify Function or a thoroughly tested compatible app—not visual JavaScript alone.

### Subscription merchandising

The intended experience is:

1. Show the size/strength and 1/3/5 choices visually.
2. Present subscription as a polished, selected-by-default toggle or purchase option.
3. Show a clear strike-through comparison, amount charged today, renewal amount, cadence, and savings.
4. Directly under it, show concrete subscriber benefits: savings, free standard shipping, never running out, reminder before renewal, and easy skip/pause/cancel.
5. When subscription is turned off, update every price immediately and gray or strike the subscription-only benefits without making the UI look broken.
6. Preserve the exact selection—variant, quantity, plan, price, cadence—through cart and checkout.

The current design-preview gummy PDP already prototypes this interaction and stacks the 20% subscription rate on the visual quantity ladder. Its preview CTA is intentionally nontransactional. Decide the live stacking policy from approved economics, then make Shopify enforce it exactly.

If the combined quantity/subscription decision cannot be made exceptionally clear and persuasive, David prefers a stronger subscription-first experience over forcing both mechanics into a confusing matrix.

## 5. Message and persuasion architecture

The page should answer these cold-traffic questions in order:

1. What is kratom?
2. What can it do for me / what might it feel like?
3. Which Dandy format and configuration should I choose?
4. Why should I trust Dandy?
5. What is the smartest offer to buy now?
6. What happens if it is not for me, or Dandy cannot ship to me?

Core working copy territory already present in the theme includes:

- `KRATOM, MADE EASY.`
- `BRIGHT ENERGY. EASY UNWINDING.`
- `ONE PLANT. TWO GEARS.`
- `CLEAR. UPBEAT. SWITCHED ON.`
- `WARM. LOOSE. SETTLED.`
- `THE GUMMY THAT MAKES KRATOM EASY.`
- `A BETTER WAY TO TAKE THE EDGE OFF.`
- `START LOW. FIND YOUR DANDY.`
- `KNOW WHAT'S IN THE BAG.`

Use stronger benefit-first bullets on PDPs. Generic format facts are secondary. A good hierarchy is:

- Benefit/outcome: energy, focus, mood/euphoria, physical relief/body ease, unwind.
- Product mechanism/format: pre-portioned, no mixing, portable, exact strength/count.
- Proof: accurate labels, batch identity, real finished-product COA, manufacturing/testing facts.
- Risk reversal and convenience: approved guarantee, shipping clarity, subscription control, support.

Do not turn serving amounts into a guaranteed effect ladder. Amount, product, food, sensitivity, and context vary. Use the final label as the source of truth for directions, warnings, and maximum use.

### Direct-response benchmarks

Re-scan the current versions of these sites when you begin; their implementations change. Borrow conversion patterns, not their brand look:

- **Grüns:** subscription-first hierarchy, per-day value, recurring versus prepaid framing, free shipping, guarantee, and simple plan comparison.
- **Goli:** immediately understandable gummy format, concise benefit stack, repetition of proof and CTA, and broad-market accessibility.
- **Resilia:** visible quantity ladder, subscribe-and-save framing, comparison, and UGC/social-proof modules.
- **IM8:** premium proof architecture, welcome/member value, subscription benefits, transformation framing, and strong visual polish.
- **AG1:** premium long-form education, trust, expert/proof sequencing, objections, and repeated conversion moments.

Also useful references recorded in the original strategy work are Auri Nutrition, MUD/WTR, Everyday Dose, Nutrafol, Dr. Squatch, PetLab Co., Jones Road Beauty, Ridge, and BioRoot Labs.

Avoid false scarcity, evergreen countdown timers, fake customer counts, unsupported medical badges, fabricated testimonials, or crossed-out prices that do not reflect a genuine offer.

## 6. Brand and visual system

The Figma is binding for the wordmark, typography hierarchy, palette, controls, radii, strokes, shadows, photography, composition, and section rhythm.

Current implemented visual primitives:

- Actual Dandy vector wordmark at `assets/dandy-wordmark.svg`.
- Dandy orange `#F04B23`, dark brown `#28110C`, white, green accents, pale peach, and photographic blue.
- Condensed, uppercase display hierarchy. Nobel is the final brand typeface.
- Centralized temporary fallback: Barlow Condensed for display and Barlow for body because licensed Nobel webfont files were not supplied.
- Pill CTAs with 3 px dark strokes and selective hard offset shadows.
- Approximately 24 px desktop and 16 px mobile card radii.
- Responsive AVIF/WebP/JPEG hero and PDP assets.

The main theme tokens live in `assets/dandy-tokens.css`, with Dandy styling in `assets/dandy.css`. Keep the font replacement centralized so Nobel can be swapped in once David supplies authorized web delivery files or an approved hosted project.

The site should feel editorial and authored as it scrolls. Avoid repeating the same bordered card or icon grid for every idea.

## 7. Required customer journey

### Homepage

The intended flow is:

1. One true offer/service message in the announcement bar.
2. Dandy header and category-translating hero.
3. Compact facts/value strip.
4. `Pick Your Dandy` lineup showing all three formats: gummies, powder, and extract capsules.
5. `What is kratom?` education.
6. Energy/focus/euphoria and comfort/unwind/euphoria experience story.
7. Hero gummy-format story.
8. Responsible-use/amount guidance with visual explanation.
9. Quality, batch, and COA proof.
10. Genuine customer proof when it exists.
11. Format comparison and selection help.
12. Objection-led FAQ.
13. Full-bleed final conversion section.
14. Complete support/policy footer.

Do not place a full PDP buy box immediately below the homepage hero. Homepage merchandising should move people through the category and formats, then into the correct PDP.

### Product pages

Above the fold on desktop:

- Gallery and offer panel in a balanced two-column layout.
- Product/format, strength, count/weight, flavor, and benefit-led copy.
- Size/strength selector.
- 1/3/5 quantity/value selection.
- Subscription option with terms and benefits.
- Dynamic selected-offer summary and primary CTA.
- Shipping, age, secure checkout, guarantee, and COA reassurance when accurate.

On mobile, the first product media, title, key benefits, choices, and CTA should appear quickly; the current gummy target was approximately 1,400 CSS pixels to the main CTA. Keep controls at least 44 px and body text at least 16 px.

Below the fold:

1. Benefit-led format story.
2. Product facts, ingredients, directions, and warnings from final labels.
3. Energy/focus and comfort/unwind education.
4. Responsible-use guide.
5. Lifestyle/occasion story.
6. Quality and batch proof with real COA access.
7. Genuine reviews/UGC.
8. Format comparison.
9. Objection FAQ.
10. Final offer recap and compact sticky mobile purchase action.

Gummies must offer 10- and 30-count choices on the same shopper-facing PDP. Capsules should provide a coherent strength-then-count selection experience for 50/90 mg and 10/30 count, even if Shopify uses multiple underlying product records. A selector must never leave the displayed label, price, inventory, warnings, URL, or cart variant out of sync.

### Shop/collection

The collection should show the full eight-configuration matrix clearly, grouped by format. It must work vertically on mobile, show real prices and images, and lead to the correct configured PDP—not a horizontal broken strip or `Price pending` state.

### Education and company pages

Required launch paths include:

- `/learn` or a stable equivalent for `What is kratom?`
- `/COA` for quality and batch reports
- FAQ
- About Dandy/founder story
- How it works / format and responsible-use guide
- Contact
- Shipping and restrictions
- Returns/guarantee
- Subscription policy and cancellation instructions
- Privacy, terms, accessibility, and required product/legal policies

`https://foreverdandy.com/COA` is permanent. QR codes on packaging point there. It must always resolve, even if the underlying Shopify page or batch-report system changes. Use a durable redirect or routing layer and test the exact QR destination before launch.

## 8. Shipping restrictions

Dandy must not ship to the following owner-supplied states:

| State | Code | State | Code |
|---|---|---|---|
| Alabama | AL | Arkansas | AR |
| California | CA | Connecticut | CT |
| Indiana | IN | Kansas | KS |
| Louisiana | LA | Mississippi | MS |
| Nebraska | NE | North Dakota | ND |
| Rhode Island | RI | Tennessee | TN |
| Utah | UT | Vermont | VT |
| West Virginia | WV | Wisconsin | WI |

Create a premium, mobile-readable US state map with restricted states visually distinct, plus an accessible text list. The map is informational; checkout enforcement is authoritative. Repeat a concise restriction link in PDP reassurance, cart, FAQ, shipping policy, and footer as appropriate.

At the last audit, Shopify still had:

- `$8.00` domestic standard shipping.
- Free standard shipping at `$70+`.
- `$15.00` express.
- Carrier-calculated shipping to 27 international countries.

The working offer model instead assumes `$5.95` for a single one-time pack and free standard shipping for subscriptions and 3/5-pack offers. Reconcile the shipping profile, turn off unintended international destinations, and enforce the restricted-state matrix before accepting orders. Do not rely on theme copy or JavaScript to block an order.

## 9. Current repository implementation

This branch replaces the old static HTML storefront with a Shopify Online Store 2.0 theme based on Horizon 4.1.1. The old root HTML/CSS/JS pages are intentionally removed in the branch; Git history remains intact.

Important files:

| Path | Purpose |
|---|---|
| `assets/dandy-tokens.css` | Central brand tokens, including typography seams |
| `assets/dandy.css` | Main Dandy responsive visual layer |
| `assets/dandy.js` | Gallery, offer UI, sticky CTA, menu, FAQ, virtual routes, and frontend events |
| `assets/dandy-wordmark.svg` | Shared header/footer wordmark |
| `sections/dandy-*.liquid` | Dandy homepage, PDP, editorial, quality, FAQ, catalog, header/footer modules |
| `snippets/dandy-buy-box.liquid` | Preview-safe and real Shopify purchase branches |
| `snippets/dandy-product-gallery.liquid` | Product gallery |
| `snippets/dandy-catalog-card.liquid` | Development catalog cards |
| `templates/index.json` | Homepage sequence |
| `templates/product.json` | Main 35 mg gummy PDP |
| `templates/product.gummy-trial.json` | Gummy trial template |
| `templates/product.powder.json` | Powder PDP |
| `templates/product.capsules.json` | Capsule catalog/fallback template |
| `templates/product.capsule-50mg.json` | 50 mg capsule PDP template |
| `templates/product.capsule-90mg.json` | 90 mg capsule PDP template |
| `templates/collection.json` | Shop/collection template |
| `templates/page.*.json` | Education, quality, FAQ, company, and policy templates |
| `sections/dandy-virtual-router.liquid` | Preview-only top-level route fallback for missing page records |
| `scripts/release-scan.sh` | Fails release while preview fixtures, missing approvals, or placeholders remain |
| `.shopifyignore` | Keeps source-only files out of theme deployment |

The custom frontend emits document-level events without installing an analytics vendor:

- `dandy:media_select`
- `dandy:variant_select`
- `dandy:selling_plan_select`
- `dandy:quantity_select`
- `dandy:add_to_cart_intent`
- `dandy:preview_offer_intent`
- `dandy:faq_engagement`

Attach GA4/pixel listeners only after consent behavior and account ownership are configured. Shopify purchase/revenue records remain the commercial source of truth.

### Current rendered state

The unpublished theme currently contains:

- A Dandy-branded homepage with hero, full lineup, category education, experience story, gummy story, responsible-use shell, quality section, FAQ, and final CTA.
- A responsive 35 mg gummy PDP with 10/30-count choice, visual 1/3/5 cards, selected-by-default subscription toggle for the 30-count option, dynamic prices/summary, gallery, education, quality, comparison, FAQ, recap, and sticky mobile CTA.
- Powder and 50/90 mg capsule PDP templates.
- A shop collection fixture with all eight current configurations and prices.
- What-is-kratom, `/COA`, FAQ, About, contact, and policy templates.
- Product and lifestyle photography for gummies and powder.
- Intentional text/art-direction placeholders where capsule renders, founder imagery, infographics, or final proof are missing.

The current gummy `design_preview_mode` is visually interactive but safe: its CTA does not submit fixture product IDs or prices to Shopify. Outside preview mode the theme submits only genuine Shopify variant IDs, integer quantities, and genuine selling-plan IDs.

### Backend/content state

The frontend was built without creating or changing Shopify products, variants, inventory, discounts, selling plans, pages, policies, shipping, payments, apps, or markets. These still need authorized integration.

At the August 14 audit:

- Shopify plan: Grow, not Plus.
- Currency/locale/time zone: USD, English, America/Chicago.
- One `$0`, unavailable placeholder product; no launch catalog.
- No selling plan groups or discounts.
- Only Contact and Your Privacy Choices pages, plus Privacy Policy.
- Default navigation and collection structure.
- No Shopify Files, metaobject definitions, or metaobjects.
- Klaviyo onsite embed visible in theme data.
- Intended gateway: Argyle MID + Authorize.net; recurring kratom support and all-in fees still require end-to-end confirmation.

Because the real Shopify page records do not exist, `/learn`, `/COA`, `/pages/faq`, and `/about` currently render through a JavaScript-enhanced 404 template in the development theme. This prevents visible preview 404s but is not the final SEO/content architecture. Create native page records/templates and permanent redirects before launch.

## 10. Asset status and Cansu requests

Already in Git:

- Responsive homepage hero/lifestyle imagery.
- Gummy pouch and PDP photography.
- Powder pouch/product photography.
- Transparent gummy and powder pack renders.
- A small curated SVG icon set.
- The Dandy wordmark.

Not in Git:

- Original 86.8 MB Figma source.
- Unoptimized master image pack.
- Large internal audit/screenshot archive under `.context/`.
- Customer-service manual.
- Licensed Nobel webfont delivery files.

High-priority asset requests for Cansu:

1. Final capsule packaging renders for 50 mg and 90 mg, each in 10- and 30-count configurations, at truthful relative scale.
2. Capsule lifestyle/use photography and a strength/count choice explainer.
3. A responsive US shipping-restriction map with editable state layers and an accessible text companion.
4. `Kratom in 60 seconds` botanical/category explainer—desktop and mobile compositions.
5. Responsible-use/start-low infographic and supporting step illustrations/icons.
6. Finished-product batch-to-bag/COA explainer based on a real report.
7. Founder/team portrait or short origin-story video for About.
8. Accurate 1/3/5 pack lineup renders for the key PDP offers.
9. Real customer/UGC video posters once permissioned content exists.
10. Mobile-specific hero crops with protected copy and product safe zones.

For each request, send Cansu: asset ID/name, conversion job, page/module, required desktop/mobile ratios, exact product/SKU, copy-safe zone, composition, whether text is baked in, alt-text intent, source facts, and deadline. Keep editable masters separate from optimized theme exports.

## 11. Git and Shopify workflow

### Clone and switch to the build

```bash
git clone https://github.com/davidcharles212/dandy.git
cd dandy
git fetch origin
git switch --track origin/build-dandy-shopify-store
```

If the branch already exists locally:

```bash
git switch build-dandy-shopify-store
git pull --ff-only
```

### Validate locally

From the theme root:

```bash
shopify theme check
bash scripts/release-scan.sh .
```

`theme check` should pass. The release scan is expected to fail during development while design fixtures, aggressive-draft copy, missing final labels/proof, or production placeholders remain. It must pass before publication.

### Confirm theme identities

```bash
shopify theme list --store hwicxd-qf.myshopify.com
```

Authenticate through Shopify's browser flow with your own authorized account. Do not share passwords or API tokens in chat, source files, or commits.

### Push only to the unpublished development theme

```bash
shopify theme push \
  --store hwicxd-qf.myshopify.com \
  --theme 157641572530 \
  --nodelete
```

Do not add `--publish`. Do not target theme `156783706290`. Do not use `--unpublished`, which can create another theme instead of updating the established development theme.

Use the preview URL after every material visual iteration and capture desktop/mobile screenshots yourself. Git push and Shopify theme push are separate operations: pushing this branch to GitHub does not modify the storefront.

## 12. Last recorded frontend QA

The most recent development-theme checks recorded:

- Shopify Theme Check: 378 theme files, zero offenses.
- Shopify Liquid/schema validation: 41 custom files passed.
- Browser QA at 320 px and 390 px: no horizontal overflow, no undersized controls, no missing form labels, and no broken eager images.
- Gummy mobile primary CTA: approximately 1,409 CSS px from the top at 390 px viewport width.
- Recorded cold-cache mobile FCP/LCP: about 776 ms on home and 656 ms on gummy PDP; recorded CLS was 0.
- Preview CTA: nontransactional by design.
- Live theme: not modified or published by this frontend work.

The screenshot archive used for the last comparison is local-only under `.context/dandy-build/screenshots/` and is intentionally ignored by Git. Regenerate screenshots from the remote development preview after cloning; do not treat the old images as final acceptance.

## 13. Launch integration work

The following work turns the current frontend prototype into a live store:

### Catalog and product data

- Create the eight confirmed sellable SKU configurations with final titles, handles, SKU/UPC, inventory, weight, price, media, SEO, and publication state.
- Use final labels for strength terminology, amount basis, ingredients, directions, warnings, servings, and facts panels.
- Assign templates and verify every selector/cart combination.
- Create collections/navigation for Gummies, Powder, Capsules, Shop All, Learn, COA, FAQ, and About.

### Offers and subscriptions

- Implement the selected 1/3/5 tiers with server-side discount enforcement.
- Select an Authorize.net-compatible Shopify subscription app.
- Confirm the acquirer/gateway approves the exact kratom catalog and recurring transactions.
- Configure selling plans, cadence, charge today, renewal amount, free shipping, skip/pause/cancel, reminder, dunning, and account portal.
- Test discount stacking rules explicitly.
- Make the cart expose selected SKU, count/strength, quantity tier, plan, cadence, discount, shipping status, and edit controls.

### Shipping and checkout

- Restrict the 16 owner-supplied states at the authoritative checkout/shipping layer.
- Disable unintended international shipping.
- Reconcile `$5.95`, free-subscription, multi-pack, and `$70` threshold rules.
- Verify taxes, inventory, age language, restricted-address errors, and customer support paths.
- Shopify Grow does not permit arbitrary custom UI on the information/shipping/payment checkout steps; put persuasion and proof in PDP/cart and use supported checkout branding.

### Content, proof, and policy

- Create real Shopify page records and durable redirects, especially `/COA`.
- Add final, batch-linked finished-product COAs and a usable batch lookup/library.
- Replace every visual placeholder or disable its module.
- Add genuine permissioned reviews/UGC; never fabricate names, ratings, avatars, or claims.
- Complete founder/About content.
- Finalize guarantee/returns, shipping, subscription cancellation, privacy, terms, accessibility, age, safety, and required product policies.
- Send the strong draft claim set through legal and apply final dispositions without flattening the page hierarchy.

### Measurement and lifecycle

- Connect Shopify analytics, GA4, ad pixels, and consent-aware events.
- Validate Klaviyo capture and lifecycle flows.
- Measure conversion rate, add-to-cart rate, checkout completion, AOV, subscription attach rate, tier mix, refund/chargeback rate, retention, and revenue by landing page/device/channel.
- Establish a clean baseline before testing headline, offer default, quantity preselection, hero creative, social proof, or module order.

### Operational test matrix

- Successful one-time order for every SKU/configuration.
- Successful 1-, 3-, and 5-pack pricing and inventory decrement.
- Successful subscription signup and renewal.
- Customer skip, pause, cadence change, payment update, and cancellation.
- Failed payment/dunning and cancellation notifications.
- Allowed-state and restricted-state addresses.
- Shipping price/threshold edge cases.
- Discount and affiliate-code stacking.
- Tax, refund, partial refund, cancellation, replacement, and chargeback workflows.
- Email/SMS receipts and support handoff.
- Mobile Safari/Chrome and desktop Safari/Chrome/Firefox.

## 14. Production release gates

Before publishing:

- Owner accepts the desktop and mobile visual result against Figma.
- All eight configurations use real Shopify product/variant records and correct prices.
- No `$0`, `Price pending`, development fixture, preview notice, bracketed marker, internal legal note, fake review, or placeholder asset is customer-visible.
- `design_preview_mode` and development catalog fixtures are off.
- `bash scripts/release-scan.sh .` passes.
- `shopify theme check` passes.
- Every PDP selection maps to the correct variant, quantity, price, discount, selling plan, inventory, label content, and cart line.
- Subscription and 1/3/5 pricing are enforced server-side and tested end to end.
- Restricted states and unintended international destinations are blocked at checkout.
- `/COA` works from the exact packaging QR destination.
- Real finished-product reports, policies, support contacts, and approved guarantees are live.
- Final claims and required warnings have legal disposition.
- Genuine reviews/UGC have permission and claim review.
- Analytics/consent events and lifecycle messages are tested.
- Accessibility, responsive behavior, performance, SEO, metadata, redirects, and broken-link crawl pass.
- A backup/rollback theme exists and the publish target has been independently verified.
- David gives explicit approval to publish the accepted theme snapshot.

## 15. Recommended first takeover session

1. Clone the repo and open this branch.
2. Obtain the Figma, customer-service manual, Shopify collaborator access, and Cansu email thread from David.
3. Verify the two theme IDs before any Shopify push.
4. Open the current remote development preview at desktop and mobile widths.
5. Run Theme Check and the intentionally failing release scan.
6. Review the current product/variant/shipping/payment/app state in Shopify Admin.
7. Lock the final label data, price table, subscription economics, shipping offer, and Cansu asset queue.
8. Continue visual/CRO work on theme `157641572530`, then integrate real commerce data behind it.

## 16. Contacts and decision ownership

- **David:** cofounder/owner; product, brand, commercial, and final launch decisions. He is handing off because he just had a baby, so consolidate questions and bring decisions in batches.
- **Jake:** implementation and launch owner for this handoff.
- **Cansu:** designer; custom visual assets, product renders, diagrams, image crops, and design-system support.
- **Legal:** final claim, warning, policy, and jurisdiction review. Give legal the strong version first.

Keep one written decision log for prices, claims, offer rules, shipping restrictions, app choices, asset approvals, and launch acceptance. That will let David review the few decisions that actually require him without having to reconstruct the project.
