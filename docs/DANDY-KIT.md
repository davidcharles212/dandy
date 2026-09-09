# Dandy premium page kit

A reusable starting point extracted from the candy-shop landing page (`/pages/cshop`) so every Dandy page starts with the same tokens, components and motion. The rules behind each part live in the Dandy landing page design conventions document in the Dandy brand knowledge folder in HQ; this file is the how-to. It lives under `docs/` so it is never pushed to the theme CDN.

Files

- `assets/dandy-kit.css`: tokens, base type, layout primitives, components, motion, reduced motion. Edit in place; there are no layered override blocks and no `!important`.
- `assets/dandy-kit.js`: `window.DandyKit` with one named initialiser per behaviour, all idempotent. `data-init` on the script tag runs `DandyKit.init()`.
- `snippets/dandy-sparkles.liquid`, `dandy-loop.liquid`, `dandy-clip.liquid`, `dandy-scrawl.liquid`, `dandy-badge.liquid`, `dandy-tick.liquid`.
- `layout/dandy-kit.liquid`: the blank layout (fonts, kit CSS, `content_for_header`, per-page robots and og:image, deferred kit JS).
- `assets/dandy-og.jpg`: the default share image (wordmark on cream, 1200 by 630) a page gets until it sets its own.
- `sections/dandy-kit-demo.liquid` and `templates/page.dandy-kit-demo.json`: every component once, for builders and QA.
- `qa/dandy-kit/run.js`: renders the demo through the layout to a static harness and measures it in Playwright at 390, 360 and 1280, plus a behaviour suite. `qa/dandy-kit/README.md` says how to run it.

## How a new page starts

1. Point the template at the `dandy-kit` layout. The layout reads two page metafields in the `dandy` namespace: `noindex` (boolean; only set it on pages that must not be indexed) and `og_image` (single-line text holding a theme asset filename; falls back to `dandy-og.jpg`). Nothing is deindexed by default; only templates whose suffix contains `demo` carry the robots tag on their own. Copy the layout to `layout/<page>.liquid` only if the page needs head markup the metafields cannot express.
2. Create `templates/page.<handle>.json` with `"layout": "dandy-kit"` and one section. Push the template to the live theme before opening Shopify's Add page form, or the template will be missing from the dropdown.
3. Write `sections/dandy-<page>.liquid`. Start from the demo section: ticker, top bar, `<main>`, sections, footer, sticky bar, captions JSON.
4. Pick a ground per section with the modifier classes (`ground-cream`, `ground-cream-2`, `ground-white`, `ground-brown`, `ground-plum`, `ground-wood`) and alternate dark and light. Give every section one bleed moment and one contained moment.
5. Drop the snippets where media goes. Reference assets by their flat names: `<page>-<section>-<subject>[-poster].<ext>`. With an external `base`, clips and loops are fetched as `<base>/<name>.mov` and `.mp4` under the same names as the theme assets; pass `file:` to a snippet when the external file is named differently.
6. Captions for clips: one JSON script on the page, `<script type="application/json" id="dandy-captions">`, keyed by clip slot, each cue `[start, end, "verbatim text"]`. A clip (or any ancestor) may name a different script with `data-captions="<id>"`. To pass an object from JS instead, call `DandyKit.configure({ captions })` before init. Do not call `DandyKit.clips()` a second time to pass captions; every initialiser skips elements it has already bound.
7. Leave `data-init` on the script tag. A page that uses only some parts can omit it and call `DandyKit.reveal()`, `DandyKit.loops()` and so on itself; calling them again later is safe.
8. Run the QA script against a harness of the new section (copy `qa/dandy-kit/run.js`, change the section path) and fix what fails before a preview link goes out.

## Tokens

Colour: `--brown #28110c` (ink and dark grounds), `--cream #faf5f0`, `--cream-2 #f3e9e1`, `--white`, `--line #e5d8d4` (every hairline), `--berry-2 #7a1f45` (rules, dots, the scrawl), `--plum #2a0f1f` (clip and frame backing), `--blush #f1d5d6`, `--wood #120806` (tasting board), `--accent #f0b7c6` (ticks, belt marker, blush scrawl on dark grounds), `--action #ea4a24` with `--action-hi #d43f1c` (the CTA and nothing else), `--gold #f5b400` (stars), `--yellow #ffde59` (highlighter). Secondary ink is `--ink-2` (.68) and `--ink-3` (.46); on brown use `--cream-86`, `--cream-78`, `--cream-72`, `--cream-6`.

Type: `--display` Barlow Condensed 600/700/800, `--body` Barlow 400/500/600 and 400 italic. h1 `clamp(46px,6.6vw,96px)` (phones `clamp(40px,10.5vw,58px)`), h2 `clamp(38px,5.4vw,72px)`, h3 `clamp(26px,2.6vw,34px)`, `.lede clamp(18px,1.5vw,21px)` at 60ch, `.quote clamp(34px,4.4vw,60px)` at 20ch, `.caprow` 15px display 600 at .06em, `.meta` 15px at .08em. Measures drop to none at 860.

Radii: `--r 20`, `--r-lg 28`, `--r-xl 36` (clip frames), `--r-card 18` (review cards), `--r-pill 999` (buttons and the seal only).

Gutters: `--pad clamp(20px,5vw,56px)`, `--wrap 1180px`, `--bleed calc(-1 * var(--pad))`.

Rhythm: `--gap-s` 24/32, `--gap-m` 44/64, `--gap-l` 52/84 (phone/desktop, switching at 1024). `.sec` pads with `--gap-l`; `.sec--tight` pads both sides with `--gap-m`, `.sec--tight-top` and `.sec--tight-bottom` one side; `.sec--flush-top` and `.sec--flush-bottom` remove a side. `.row` and `.cliprow` step with `--gap-s`. `.head` is 44px above media (28 on phones); `.lede` sits 18px under its heading (10 on phones).

Which pairs are tight, and why: the candy-shop page compressed four seams by hand after a whitespace pass so the page keeps moving where the reader has already decided: the offer's bottom (cshop 36/64), the FAQ's top (44/64), the proof section's top (52/64) and the mechanism stage's top (48/72). The kit rounds those to the one `--gap-m` token (44/64) with the tight modifiers, as the demo does; everything else keeps `--gap-l`. A page that needs a different pair sets it on its own section rule, not on the token.

Easing: `--ease-enter (.2,.8,.2,1)` for entrances and the sticky bar, `--ease-reveal (.2,.7,.2,1)` for reveals, `--ease-draw (.3,0,.2,1)` for the scrawl, `--ease-belt (.4,0,.2,1)` for the marker, `ease` for opacity. Interaction .18 to .25s, state change .35 to .6s, reveal and draw .6 to 1s.

Breakpoints, five in all: 360 (SE-class phone: 18px large buttons, the proof line at 15px and free to wrap, the sticky bar without its image), 480 (narrow phone: one fact per line, the sticky bar's small line dropped), 860 (phone and tablet), 1024 (desktop rhythm), 1440 (wide, reserved).

## The rule per component

- `.btn` (`--lg`, `--sm`, `--block`): full pill, white on `--action`, shadow tinted to the button colour. The CTA colour appears nowhere else. Nothing sits under a CTA. Full width on phones. The large button is 23px everywhere except the hero's on phones (21px) and all of them at 360 (18px), as shipped.
- `.caprow` (`--dark`, `--onphoto`, `--lines`): captions sit in a row under the frame, never over the render. `--onphoto` is only for the filmstrip. `--lines` forces one phrase per line.
- `.facts`: wrapped facts get a drawn 4px dot after every item except the last, so a wrapped line never starts with a dot. One per line on narrow phones, with no dots. Dots, never dashes.
- `.loop` (`--16x9`, `--4x5`, `--4x3`, `--6x5`, `.loop__word`): a real poster img under the video; the video fades in on `playing`; poster stays on error; one-shot loops hold their last frame (`is-held`) until something seeks them. `.mov` first, `.mp4` second, never WebM. `words: 'key:Label,...'` on the snippet renders the `.loop__word` for a stage.
- `.clip` (`--tilt-l`, `--tilt-r`) and `.cliprow`: the phone frame is a box because a phone is an object. One round play button, tap to play with sound, tap again to pause, one clip at a time, tilted 2 degrees and straightening on play. No replay, caption or sound controls. In a clip row a supporting still (`.cliprow__still`) shows only on desktop; a supporting loop (`.cliprow__loop`) bleeds edge to edge on phones.
- `.board`: three gapless full-bleed 4:5 frames on black wood; the big word is a felt benefit landing a beat after the photo; the usage fact goes in the caption row. Once per page.
- `.strip`: the torn filmstrip. The old way is one desaturated strip, its words struck by the scrawl, the full-colour frame rising from under the tear. One tear per page.
- `.stage`, `.belt`, `.states--type`: three big words in a row, not tabs, not cards; selection is opacity only; the belt marker slides to the selected word. For a loop-driven stage every tab carries `data-seek` (seconds): the loop's time drives the selection, switching to a tab at its `data-bound`, or by default at the midpoint between its seek and the previous one; a tap cues the loop to the seek, plays to `data-end` (or the end) and holds the frame until the stage leaves the screen. Without a video the stage cycles every 3.2s while on screen; under reduced motion it is static.
- `.seal`: exactly one per page, a real render with alpha, hanging off the corner of the offer visual. The only pill-shaped non-button.
- `.hi` (`--dark`, `--inline`): a marker band inside the glyph body, at most one per section, always inside a headline, never a chip.
- `.scrawl` (`--underline`, `--strike`, `--signature`, `--blush`): one path everywhere so it reads as one hand, drawn in by the nearest `.is-in` ancestor. Under one word per dark section.
- `.rev` and `.revs`: a box because a review is a card. 18px radius, berry hairline, no shadow, gold stars, sentence-case footer with the `dandy-badge` snippet, three shown then a Read more link.
- `.proof-line`: one rating line in body type, stars first, a 1px separator, never a pill.
- `.faq`: hairlines, sentence-case questions in body type, no card chrome, on a white ground so the dark close lands clean.
- `.sticky`: phones only; shown only once the anchor CTA has scrolled off the top and no other in-page button is on screen. The anchor is `[data-sticky-anchor]`, else `.hero__cta`, else the first in-page button. Off screen the bar is `aria-hidden` and `inert`. One CTA on screen at a time.
- `.ticker` and `.topbar`: the ticker is the one always-moving strip (build its duplicate list from a capture); the top bar button fades while an in-page CTA is visible and is hidden on phones.
- `.hero`: plate, giant cutout that settles in over 1.4s then drifts 22px and 5 degrees over the first 400px of scroll. Two lines of headline, two of lede, one of button at 375 to 430.
- `.band`, `.cutout`, `.cutrow`, `.callout`, `.checklist`, `.split`: a dark band butts straight into the next ground; cutouts get a double drop shadow, a small rotation and must overlap something; callouts are printed label tags stepping in 400ms apart; ticks are the `dandy-tick` snippet in `--accent`.
- `.offer__layout`, `.close`, `.foot`: the offer visual bleeds with the seal on its corner and the price said once; `.offer__copy` may carry `.wrap` as on cshop, and neutralises its width and padding so the copy is never double-gutted; the close is copy over the photo with the signature scrawl; the footer grows only while the sticky bar is up.
- `[data-reveal]`, `[data-inview]`, `.sparkles`: reveals start 14px down and fade up once at 30 percent visible, never re-hide; `data-inview` adds `is-in` without the hidden start (for scrawls and callouts inside copy). Both accept a threshold in the attribute. One reveal transition serves everything, tuned per element with `--rv-y`, `--rv-scale`, `--rv-delay`, `--rv-t` (transform duration) and `--rv-ease`: the board word (16px, .15s late), the callouts (8px, the second .4s late), the filmstrip frame (60px and scale .97 over .8s). Sparkles twinkle at 3.6s; `variant: 'hero', count: 8` gives the counter cluster with the faster spark curve.
- Reduced motion: everything renders in its resting state, sparkles freeze at half opacity, hero sparkles are removed, loops show their poster, the scrawl is drawn, the giant neither settles nor drifts, the stage does not cycle.

## Initialisers

`DandyKit.reveal(root)`, `.loops(root)`, `.clips(root, { captions, captionsId })`, `.sticky({ bar, anchor, ctas })`, `.hero(root)`, `.states(root)`, `.reviews(root)`, `.dev()`, `.configure({ captions, captionsId, sticky })`, `.init(root)` or `.init({ root, clips, sticky })`.

Every initialiser marks what it binds (`data-kit-reveal`, `data-kit-loop`, `data-kit-clip`, `data-kit-states`, `data-kit-reviews`, `data-kit-hero`) and skips it next time, so `init` can run any number of times; `sticky` rebuilds its observer and re-queries the buttons each time. The kit listens for `shopify:section:load` and `shopify:section:reorder` and re-runs `init` on the section, so the theme editor's re-rendered sections are live.

The loop controller owns play and pause and exposes `figure.dandyLoop` (`seek`, `holdAt`, `release`, `play`, `pause`, `inView`); the states controller only seeks and asks for a hold, and never plays a loop that is off screen. The hold watch is a rAF loop that runs only while the video is playing towards a finite hold point and stops on pause, ended or release.

In dev (`?dev` or localhost) the kit warns once about a missing sticky anchor, a stage without `data-seek` on every tab, and captions that do not parse.

## What QA measures

See `qa/dandy-kit/README.md` for the command. Results land in `qa/dandy-kit/results.md` and `results.json` (committed); screenshots in `qa/dandy-kit/shots/` (not committed).

At 390, 360 and 1280:

- No horizontal overflow (`scrollWidth` equals `innerWidth`; offenders listed).
- No U+2013 or U+2014 in rendered text.
- Sparkles animate (computed opacity changes between two samples 700ms apart) and the hero has eight.
- The head comes from the layout: the demo template carries the robots tag, og:image is the default asset.
- A drawn dot never ends a line in any `.facts` row.
- Every `[data-reveal]` and `[data-inview]` reaches `is-in` after an instant scroll through the page.
- The stage loop paints VIDEO at its centre while `is-playing` (or the poster if the source cannot play; the result says which).
- With nobody picking, the stage state and loop word follow the loop's time across the bounds.
- The sticky bar is on screen once the hero CTA is past and no other button is visible, is not inert while up, and yields (and turns inert) while the offer button is on screen. Hidden at 1280. The product name stays on one line beside the button.
- The offer copy's content width equals the hero copy's on phones, and is not constrained to the `.wrap` width on desktop.
- Large buttons: hero 21px and offer and close 23px at 390; all 18px at 360; 23px at 1280.
- The clip row's loop is visible and edge to edge on phones.
- The underline, strike and signature scrawls reach `stroke-dashoffset: 0` in view.
- The hero giant's settle animation is cleared and its transform differs between scroll 0 and 300.
- Clicking the second state word centres the belt marker, updates `aria-selected`, the roving tabindex and the loop word, cues the loop and holds it at `data-end`; leaving the stage releases the hold without playing off screen and coming back plays again.
- A source error on a clip shows the poster and hides the video and the play button without `!important`.
- A card inventory: every rounded bordered element is listed and accounted for; no non-button pills.
- Full-page screenshots with the sticky and top bar unfixed, for a visual pass on gaps over 56px at 390 or 96px at 1280.

Behaviour, at 390 in fresh pages:

- `DandyKit.init(document)` twice, then one tap on a clip: it plays and stays playing.
- With the stage video paused (reduced motion, then an explicit pause after a tap) there are no rAF callbacks over one second.
- The kit loading after the hero's settle has finished still arms the drift.
- `shopify:section:load` on a new section binds its reveal and reviews link and the sticky bar sees the section's button.
