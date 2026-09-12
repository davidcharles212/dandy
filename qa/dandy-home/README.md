# Dandy homepage QA

`run.js` renders `sections/dandy-home.liquid` inside `layout/dandy-home.liquid` to `harness.html` with a small Liquid subset (the kit runner's subset plus `form`, `date`, comparison operators, `or`/`and`, `.size`, and a stub for the shared `dandy2-cart-drawer` snippet, which is hidden on load), then measures the blueprint's section 11 gates that a static harness can see, in Playwright at 390, 430, 768 and 1280, plus the hero composition at 375, 390 and 430. The theme has no `node_modules`, so resolve `require('playwright')` through `NODE_PATH`:

```
NODE_PATH=/path/to/dir-with-node_modules/node_modules node qa/dandy-home/run.js
```

`--harness-only` writes `harness.html` and stops. Results go to `results.md` and `results.json` beside the script (committed after a run); full-page screenshots go to `shots/` (or `$HOME_SHOTS`) and are not committed. The process exits 2 when a gate fails. Chrome is used when installed, Chromium otherwise, with `--allow-file-access-from-files` so the harness can read its own images.

## What each gate measures

| Gate | Check | Pass condition |
|---|---|---|
| g1_overflow | `scrollWidth` vs `innerWidth`, plus every visible element that leaves the viewport without a clipping ancestor | equal, no offenders |
| g2_typeFloor | smallest rendered font size across every visible text node; every `p` not in the listed meta classes | min >= 13px, no body paragraph under 16px, body >= 16px |
| g3_dashes | U+2013 and U+2014 in `innerText` | none |
| g4_eyebrows | text under 15px that is uppercase or letterspaced within 40px above a heading | none |
| g4_inventory | every element with radius over 8px and a border or shadow (buttons excluded, opacity ignored so reveals do not hide cards); pill-shaped non-buttons | only the three review cards, the round gummy inset, the email input, the age gate dialog, the cart drawer; no pills |
| g5_whitespace | gaps between consecutive painted nodes in DOM order (text, images, icons, inputs, buttons, ground edges, hairlines), measured from the lowest painted pixel so far, with the responsible margin or padding rule | no gap over 56px at phone widths or 96px at 1280 |
| g6_textOverPhoto | text rects intersecting image rects | informational; none expected |
| g7_images | every `img` complete with `naturalWidth > 0` after an instant scroll of the full height; `width`/`height` equal the real pixels of `src`; srcset candidates share the aspect | all match |
| g8_cls | layout shift with the gate shown and after dismissal; preload `imagesrcset`/`imagesizes` equal the hero `srcset`/`sizes` | informational on the harness; CLS under 0.05 |
| g9_fixedBeforeDismiss / g9_afterDismiss | fixed and sticky elements, visible dialogs, infinite animations, ticker-like elements | only the age gate and the sticky nav; nothing after dismissal and a 2.5s idle |
| g10_links | unique hrefs | listed for the preview-theme 200 check |
| g11_hero and the hero table | H1 line count, lede lines, button width vs content width, photo size, uncropped 16:9 | H1 <= 3 lines, button equals content width on phones, photo uncropped |
| g12_analytics | clicks every `data-track` element with navigation prevented | each pushes its event to `dataLayer`; all six homepage events seen |
| g13_reducedMotion | two fresh contexts (animated at rest with the hero light sweep hidden, and `prefers-reduced-motion: reduce`) after the same scroll-through | byte-identical full-page screenshots, else a pixel diff count |
| duplicates | md5 of the four full-page screenshots | none identical |

## Latest results

See `results.md` for the full tables. Summary of the last run (2026-09-12):

- 390, 430, 768, 1280: every measured gate passes; no page errors.
- Hero: H1 3 lines at 375, 390, 430 (40px); lede 5, 5, 4 lines; button width equals content width; photo edge to edge and uncropped at 16:9 (211, 219, 242px tall). At 1280 the H1 is 3 lines at 66px.
- Card inventory: `div.hage__box`, `span.hero__inset`, three `article.rev`, `input#HomeWelcomeEmail.welcome__input`. No non-button pills.
- Whitespace: no gaps over the limits at any width.
- Reduced motion: byte-identical to the animated rest state at every width; the hero rendered `home-hero-hands-900.webp` in both contexts at every width (DPR 1).
- CLS on the harness: 0 at phone widths, 0.027 at 1280 (font swap), under 0.05.
