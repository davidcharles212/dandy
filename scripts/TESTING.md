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
