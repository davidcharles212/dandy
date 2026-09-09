# Dandy kit QA

`run.js` renders `sections/dandy-kit-demo.liquid` inside `layout/dandy-kit.liquid` to `harness.html` with a small Liquid subset, then measures it in Playwright at 390, 360 and 1280 and runs a behaviour suite (double init, idle rAF, late script, section reload). It needs Node and a directory with Playwright installed (the Chrome channel is used when present, Chromium otherwise); the theme itself has no `node_modules`, so resolve `require('playwright')` through `NODE_PATH`:

```
PLAYWRIGHT_DIR=/path/to/dir-with-node_modules
NODE_PATH="$PLAYWRIGHT_DIR/node_modules" node qa/dandy-kit/run.js
```

`--harness-only` writes `harness.html` and stops. Results go to `results.md` and `results.json` beside the script (commit both after a run); full-page screenshots go to `shots/` (or `$KIT_SHOTS`) and are not committed. The process exits 2 when a check fails. `docs/DANDY-KIT.md` lists what every check measures.
