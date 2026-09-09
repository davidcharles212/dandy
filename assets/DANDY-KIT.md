# Dandy premium page kit

A reusable starting point extracted from the candy-shop landing page (`/pages/cshop`) so every Dandy page starts with the same tokens, components and motion. The rules behind each part live in `companies/dandy/knowledge/brand/dandy-landing-page-design-conventions.md`; this file is the how-to.

Files

- `assets/dandy-kit.css`: tokens, base type, layout primitives, components, motion, reduced motion. Edit in place; there are no layered override blocks.
- `assets/dandy-kit.js`: `window.DandyKit` with one named initialiser per behaviour. `data-init` on the script tag runs `DandyKit.init()`.
- `snippets/dandy-sparkles.liquid`, `dandy-hero-sparkles.liquid`, `dandy-loop.liquid`, `dandy-clip.liquid`, `dandy-scrawl.liquid`.
- `layout/dandy-kit.liquid`: the blank layout (fonts, kit CSS, `content_for_header`, noindex, deferred kit JS).
- `sections/dandy-kit-demo.liquid` and `templates/page.dandy-kit-demo.json`: every component once, for builders and QA.
- `qa/dandy-kit/run.js`: renders the demo to a static harness and measures it in Playwright at 390 and 1280.

## How a new page starts

1. Copy `layout/dandy-kit.liquid` to `layout/<page>.liquid` if the page needs its own head (og image, title rules); otherwise point the template at `dandy-kit` directly.
2. Create `templates/page.<handle>.json` with `"layout": "<layout name>"` and one section. Push the template to the live theme before opening Shopify's Add page form, or the template will be missing from the dropdown.
3. Write `sections/dandy-<page>.liquid`. Start from the demo section: ticker, top bar, `<main>`, sections, footer, sticky bar, captions JSON.
4. Pick a ground per section with the modifier classes (`ground-cream`, `ground-cream-2`, `ground-white`, `ground-brown`, `ground-plum`, `ground-wood`) and alternate dark and light. Give every section one bleed moment and one contained moment.
5. Drop the snippets where media goes. Reference assets by their flat names: `<page>-<section>-<subject>[-poster].<ext>`.
6. Call the initialisers. `data-init` on the script runs everything; a page that uses only some parts can omit `data-init` and call `DandyKit.reveal()`, `DandyKit.loops()` and so on itself.
7. Run the QA script against a harness of the new section (copy `qa/dandy-kit/run.js`, change the section path) and fix what fails before a preview link goes out.

## Tokens

Colour: `--brown #28110c` (ink and dark grounds), `--cream #faf5f0`, `--cream-2 #f3e9e1`, `--white`, `--line #e5d8d4` (every hairline), `--berry-2 #7a1f45` (rules, dots, the scrawl), `--plum #2a0f1f` (clip and frame backing), `--blush #f1d5d6`, `--wood #120806` (tasting board), `--accent #f0b7c6` (ticks, belt marker, blush scrawl on dark grounds), `--action #ea4a24` with `--action-hi #d43f1c` (the CTA and nothing else), `--gold #f5b400` (stars), `--yellow #ffde59` (highlighter). Secondary ink is `--ink-2` (.68) and `--ink-3` (.46); on brown use `--cream-86`, `--cream-78`, `--cream-72`, `--cream-6`.

Type: `--display` Barlow Condensed 600/700/800, `--body` Barlow 400/500/600 and 400 italic. h1 `clamp(46px,6.6vw,96px)` (phones `clamp(40px,10.5vw,58px)`), h2 `clamp(38px,5.4vw,72px)`, h3 `clamp(26px,2.6vw,34px)`, `.lede clamp(18px,1.5vw,21px)` at 60ch, `.quote clamp(34px,4.4vw,60px)` at 20ch, `.caprow` 15px display 600 at .06em, `.meta` 15px at .08em. Measures drop to none at 860.

Radii: `--r 20`, `--r-lg 28`, `--r-xl 36` (clip frames), `--r-card 18` (review cards), `--r-pill 999` (buttons and the seal only).

Gutters: `--pad clamp(20px,5vw,56px)`, `--wrap 1180px`, `--bleed calc(-1 * var(--pad))`.

Rhythm: `--gap-s` 24/32, `--gap-m` 44/64, `--gap-l` 52/84 (phone/desktop, switching at 1024). `.sec` pads with `--gap-l`, `.sec--tight` with `--gap-m`, `.row` and `.cliprow` step with `--gap-s`. `.head` is 44px above media (28 on phones); `.lede` sits 18px under its heading (10 on phones).

Easing: `--ease-enter (.2,.8,.2,1)` for entrances and the sticky bar, `--ease-reveal (.2,.7,.2,1)` for reveals, `--ease-draw (.3,0,.2,1)` for the scrawl, `--ease-belt (.4,0,.2,1)` for the marker, `ease` for opacity. Interaction .18 to .25s, state change .35 to .6s, reveal and draw .6 to 1s.

Breakpoints: 480 (narrow phone), 860 (phone and tablet), 1024 (desktop rhythm), 1440 (wide).

## The rule per component

- `.btn` (`--lg`, `--sm`, `--block`): full pill, white on `--action`, shadow tinted to the button colour. The CTA colour appears nowhere else. Nothing sits under a CTA. Full width on phones.
- `.caprow` (`--dark`, `--onphoto`, `--lines`): captions sit in a row under the frame, never over the render. `--onphoto` is only for the filmstrip. `--lines` forces one phrase per line.
- `.facts`: wrapped facts get a drawn 4px dot after every item except the last, so a wrapped line never starts with a dot. One per line on narrow phones. Dots, never dashes.
- `.loop` (`--16x9`, `--4x5`, `--4x3`, `--6x5`, `.loop__word`): a real poster img under the video; the video fades in on `playing`; poster stays on error; one-shot loops hold their last frame (`is-held`). `.mov` first, `.mp4` second, never WebM.
- `.clip` (`--tilt-l`, `--tilt-r`) and `.cliprow`: the phone frame is a box because a phone is an object. One round play button, tap to play with sound, tap again to pause, one clip at a time, tilted 2 degrees and straightening on play. No replay, caption or sound controls.
- `.board`: three gapless full-bleed 4:5 frames on black wood; the big word is a felt benefit landing a beat after the photo; the usage fact goes in the caption row. Once per page.
- `.strip`: the torn filmstrip. The old way is one desaturated strip, its words struck by the scrawl, the full-colour frame rising from under the tear. One tear per page.
- `.stage`, `.belt`, `.states--type`: three big words in a row, not tabs, not cards; selection is opacity only; the belt marker slides to the selected word. Tabs may carry `data-seek` and `data-end` to cue the loop.
- `.seal`: exactly one per page, a real render with alpha, hanging off the corner of the offer visual. The only pill-shaped non-button.
- `.hi` (`--dark`, `--inline`): a marker band inside the glyph body, at most one per section, always inside a headline, never a chip.
- `.scrawl` (`--underline`, `--strike`, `--signature`, `--blush`): one path everywhere so it reads as one hand, drawn in by the nearest `.is-in` ancestor. Under one word per dark section.
- `.rev` and `.revs`: a box because a review is a card. 18px radius, berry hairline, no shadow, gold stars, sentence-case footer, three shown then a Read more link.
- `.proof-line`: one rating line in body type, stars first, a 1px separator, never a pill.
- `.faq`: hairlines, sentence-case questions in body type, no card chrome, on a white ground so the dark close lands clean.
- `.sticky`: phones only; shown only once the anchor CTA (`[data-sticky-anchor]`) has scrolled off the top and no other in-page button is on screen. One CTA on screen at a time.
- `.ticker` and `.topbar`: the ticker is the one always-moving strip; the top bar button fades while an in-page CTA is visible and is hidden on phones.
- `.hero`: plate, giant cutout that settles in over 1.4s then drifts 22px and 5 degrees over the first 400px of scroll. Two lines of headline, two of lede, one of button at 375 to 430.
- `.band`, `.cutout`, `.cutrow`, `.callout`, `.checklist`, `.split`: a dark band butts straight into the next ground; cutouts get a double drop shadow, a small rotation and must overlap something; callouts are printed label tags stepping in 400ms apart; ticks are `--accent`.
- `.offer__layout`, `.close`, `.foot`: the offer visual bleeds with the seal on its corner and the price said once; the close is copy over the photo with the signature scrawl; the footer grows only while the sticky bar is up.
- `[data-reveal]`, `[data-inview]`, `.sparkles`, `.hero-sparkles`: reveals start 14px down and fade up once at 30 percent visible, never re-hide; `data-inview` adds `is-in` without the hidden start (for scrawls and callouts inside copy). Sparkles twinkle at 3.6s; the hero's eight use the faster spark curve.
- Reduced motion: everything renders in its resting state, sparkles freeze at half opacity, hero sparkles are removed, loops show their poster, the scrawl is drawn, the giant neither settles nor drifts.

## Initialisers

`DandyKit.reveal(root)`, `.inview(root)`, `.loops(root)`, `.clips(root, { captions, captionsId })`, `.sticky({ bar, anchor, ctas })`, `.hero(root)`, `.states(stage)`, `.reviews(root)`, `.dev()`, `.init({ root, clips, sticky })`. Captions are a JSON script `#dandy-captions` keyed by clip slot, each cue `[start, end, "verbatim text"]`.

## What QA measures

Run `NODE_PATH=<dir with playwright>/node_modules node qa/dandy-kit/run.js` and read `qa/dandy-kit/results.md`.

- No horizontal overflow at 390 and 1280 (`scrollWidth` equals `innerWidth`; offenders listed).
- No U+2013 or U+2014 in rendered text.
- Sparkles animate: computed opacity changes between two samples 700ms apart.
- Every `[data-reveal]` and `[data-inview]` reaches `is-in` after an instant scroll through the page.
- The stage loop paints VIDEO at its centre while `is-playing` (or the poster if the source cannot play; the result says which).
- The sticky bar is on screen once the hero CTA is past and no other button is visible, and yields while the offer button is on screen. Hidden at 1280.
- The underline, strike and signature scrawls reach `stroke-dashoffset: 0` in view.
- The hero giant's settle animation is cleared and its transform differs between scroll 0 and 300.
- Clicking the second state word moves the belt marker and updates `aria-selected` and the roving tabindex.
- A card inventory: every rounded bordered element is listed and accounted for; no non-button pills.
- Full-page screenshots at both widths with the sticky and top bar unfixed, for a visual pass on gaps over 56px at 390 or 96px at 1280.
