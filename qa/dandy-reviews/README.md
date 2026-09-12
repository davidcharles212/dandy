# Dandy review hub QA

`run.js` renders `sections/dandy-reviews.liquid` into `harness.html` (the shared `dandy-home-header` and `dandy-home-footer` snippets are stubbed as plain bars; a minimal layout supplies the Google Fonts Barlow pair and `assets/dandy-reviews.css`), serves the worktree over a local HTTP server so `fetch()` can read `assets/dandy-reviews.json`, and measures the page in Playwright at 390, 430, 768 and 1280 plus a behaviour suite at 390. Every expectation is derived from the JSON file itself, so the runner keeps working when the founder swaps the export.

```
NODE_PATH=/path/to/dir-with-node_modules/node_modules node qa/dandy-reviews/run.js
```

`--harness-only` writes `harness.html` and stops. Results go to `results.md` and `results.json` beside the script (committed); `harness.html` and full-page screenshots in `shots/` (or `$RVH_SHOTS`) are not committed. The process exits 2 when a check fails.

## What it measures

Per width: no horizontal overflow (offenders listed); type floor (no rendered text under 13px, no body paragraph under 16px, card body exactly 17px); no U+2013 or U+2014; no eyebrow (no uppercase or letterspaced text under 15px directly above a heading); card inventory (every element with a radius over 8px and a border or shadow, allowed only the review cards, the search input, the sort select and `.btn`); no non-button pill; button construction (42px plus, 16px plus, full width on phones); facts rows (no line starts with a dot, no first item carries one); grid columns (1, 2, 3); text contrast against its ground (4.5:1, 3:1 for large type).

Behaviour at 390: scorecard numbers equal the file's (average, star percentages, verified percentage, recommend line only when the field exists); initial counts and first page; each format word (cards, count line, `aria-selected`, URL, `review_hub_format_filter` in `dataLayer`); each benefit toggle (cards, count, `aria-pressed`, URL); search (case-insensitive on headline and body, 150ms debounce, URL `q`, empty state, Clear filters); sort (Most recent by date, Highest rated by rating then helpful then date, Most relevant by helpful then date); keyboard (Tab reaches the selected format word, arrows and Home/End move the selection, Tab reaches search, sort and the toggles, Space toggles); PDP button tracked as `review_card_pdp_click` with the product label; first-card stars rest at full opacity; deep link `?format=&benefit=&q=` opens filtered; `view` and `preview_theme_id` survive URL writes; Show more pages twenty at a time (45 synthetic records); no-JS fallback (three Liquid cards, controls hidden); fetch failure (fallback cards, controls hidden, no page error); reduced motion geometry identical; helpful line is plain text only when over 0; parse plus first render under 300ms with the CPU throttled 4x.

## `assets/dandy-reviews.json` schema

A JSON array. One object per review:

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string or number | yes | Unique. Rendered as `data-id` on the card. |
| `name` | string | yes | As shown: `Robert M.` |
| `age` | number or string | no | Shown after the name when present. |
| `location` | string | no | `Columbus, OH` |
| `product` | `"gummies"`, `"capsules"` or `"powder"` | yes | Drives the format filter and the `Shop <product>` button. Any other value renders the card with no button and outside every format count except All. |
| `productLabel` | string | no | `Mixed Berry Gummies`; rendered as `Purchased: <productLabel>`. |
| `variant` | string | no | `35 mg`, `50 mg`, `90 mg`, `250 g`. A capsules review whose variant contains `90` links to the 90 mg PDP. |
| `rating` | integer 1 to 5 | yes | Clamped and rounded. |
| `date` | `YYYY-MM-DD` | yes | Sorts Most recent; rendered as `March 14, 2026`. |
| `headline` | string | yes | Rendered in typographic quotes; surrounding quote characters in the data are stripped. |
| `body` | string | yes | Plain text, no HTML. |
| `benefits` | array of slugs | no | Any of `focus-stamina`, `joint-body-comfort`, `coffee-alternative`, `taste-flavor`, `evening-unwind`, `first-time-user`. Unknown slugs are ignored. |
| `verified` | boolean | yes | `true` renders `Verified buyer` and counts towards the verified percentage. |
| `recommend` | boolean | no | When any review carries it, the scorecard shows `<n>% would recommend` over the reviews that have it. Absent on the current export, so the line is not rendered. |
| `helpful` | integer | no | Rendered as plain text, `22 people found this helpful`, only when over 0. Most relevant sorts by it. |
| `state`, `unhelpful` | any | no | Present on the founder's export; ignored. |

Everything on the page is computed from this file at render time: average, star breakdown, per-format and per-benefit counts, verified percentage, the recommend line, the count line. Nothing is typed into the Liquid except the three fallback cards shown without JavaScript or when the fetch fails. Keep the file minified (`JSON.stringify(data)`); the current 2,050-record export is 1.4 MB raw and 260 KB gzipped.

Converting a new export: map its columns to the fields above, keep `product` to the three slugs, `date` to ISO, and `benefits` to the six slugs; write it minified over `assets/dandy-reviews.json`; run this QA; the expectations follow the file.

## Analytics

`review_hub_format_filter` fires with `{label: <format>}` on every format change through `window.track` when `assets/dandy-home.js` defines it, else a local `track()` that pushes `{event, ...payload}` to `window.dataLayer` and mirrors to `Shopify.analytics.publish`. The `Shop <product>` buttons carry `data-track="review_card_pdp_click"` and `data-track-label="<product>"`; when `window.track` exists the homepage script's `[data-track]` delegate owns those clicks (blueprint section 9), otherwise the hub's own delegate fires them.
