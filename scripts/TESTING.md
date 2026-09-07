# Theme regression tests

Run with Node.js 24:

```sh
node --experimental-vm-modules --test scripts/predictive-search.test.cjs
```

No package installation or Shopify credentials are needed. The experimental
VM modules warning is expected.

The suite loads the real predictive-search, utilities, and recently-viewed
modules with browser dependencies stubbed. Four cases cover new and returning
visitors, with and without native `requestIdleCallback`. Returning visitors
must schedule the empty-state loader using the available idle callback or
timeout fallback, and the loader must run only once.

The `Theme regressions` GitHub Actions workflow runs this command on every pull
request and push to `main`, and supports manual runs. Its check is named
`Predictive search regressions`. Requiring that check before merging is a
separate repository branch-protection setting.

These tests cover the reported search initialization failure. They do not
replace browser shopping-journey checks or testing on mobile Safari.

## Gummy purchase regression suite

Run `node --test scripts/gummy-purchase.test.cjs`. These tests load the production custom element and cover the 3/5 bundle IDs and quantities, immediate sold-out feedback, stale-ID removal, single/sampler/subscription switching, unavailable selling plans, and add failures without duplicate native submission. Four tests fail against the pre-repair live asset.

Catalog checks must additionally verify both native bundle component relationships, advertised prices, and successful cart-to-checkout flows. Each release must verify live shipping rates for bundles and the single/subscription paths in a browser without a Shopify preview cookie. Unit tests alone cannot detect stock or shipping configuration changes.
