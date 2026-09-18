# Jack funnel tracking

`assets/dandy-jack-tracking.js` supplements the existing Google & YouTube integration. It never initializes a second Google tag or emits standard pageview/commerce events.

Run regression coverage with Node's built-in runner:

```
node --test --experimental-test-coverage scripts/jack-funnel.test.cjs
```

## Installation

Use fresh copies of the live theme, not an arbitrary repository checkout. The live theme can contain unrelated changes absent from this branch. Install the asset and add only these scoped includes before `</body>`:

In `layout/dhd.liquid`:

```liquid
{% if request.path == '/pages/jack' %}
  <script src="{{ 'dandy-jack-tracking.js' | asset_url }}" defer></script>
{% endif %}
```

In `layout/theme.liquid`:

```liquid
{% if request.path == '/products/extract-capsules' %}
  <script src="{{ 'dandy-jack-tracking.js' | asset_url }}" defer></script>
{% endif %}
```

Use the company's guarded, file-scoped Shopify deployment flow. Do not publish a different theme. Roll back by removing only these two includes from freshly pulled layouts; leaving the unused asset is harmless. Do not overwrite either layout wholesale with an old checkout.

## Behavior

Shopify analytics permission gates storage and dispatch. The collector emits custom entry, product CTA, offer-jump, scroll-threshold and active-time events. Same-tab attribution expires after 30 minutes of inactivity. It retains campaign labels, Whop IDs and placement without rewriting internal links. Active time excludes hidden intervals and pauses after 60 seconds without interaction. Scroll uses the desktop scroll wrapper when applicable.

Use `dandy_qa=1` for local console diagnostics or `dandy_qa=collect` for vendor `dandy_qa_probe` events. Include `utm_source=internal_qa&utm_medium=qa&utm_campaign=jack_tracking_qa` on QA entries. QA mode persists on the PDP. It does not suppress pre-existing third-party automatic collection; exclude the QA acquisition cohort when reporting standard events.

Verify a clean published page, internal CTA navigation, preserved cohort and vendor receipt. A console dispatch is insufficient. No order or add-to-cart is necessary for this instrumentation's release check.

The company's Jack funnel tracking project holds the event contract, reporting definitions, deployment IDs and verification record. GA4 owns funnel reporting; Clarity owns behavioral recordings; Intelligems is for actual randomized tests.
