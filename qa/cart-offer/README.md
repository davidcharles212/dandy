# Gummy cart offer protection

DY1046 contained two $59.99 single 30-count pouches instead of the $119.98 three-pack. The product selector sold the correct bundle, but changing a single's quantity in the cart did not select it.

The shared cart service converts each pair of full-price USD singles into one existing three-pack. It reads current bundle pricing and availability, uses one cart update, and verifies the result before checkout. Drawer updates are serialized. The full cart refreshes its rendered lines after conversion. The $99.98 two-pack, subscriptions, discounted singles, customized lines, and other products retain their existing behavior.

## Verification

- `node --test qa/cart-offer/cart-offer.test.cjs`: original failure, bundle preservation, quantity pairs, excluded lines, availability and price changes, concurrent reads, idempotency, failed updates, and total verification.
- `node --experimental-vm-modules --test scripts/predictive-search.test.cjs`: existing theme tests.
- `node qa/cart-offer/browser.cjs`: actual phone and desktop selector/cart interactions, full-cart repair, and native checkout. Uses an isolated `agent-browser` session and creates no order. Shopify's preview bar must be dismissed; the test uses its own Hide bar control and waits for scrolling to finish.
- Set `CART_QA_SESSION`, `CART_QA_URL`, and `CART_QA_OUTPUT` to check production in a fresh session.
- `node qa/cart-offer/checkout-back.cjs`: Checkout must still reach checkout after the shopper presses Back from checkout (Chrome restores the page from the back-forward cache with `checkingOut` still set; the guard releases itself on `pageshow`). Set `CART_QA_ROUTE_SCRIPT=assets/dandy-gummy-cart.js` to test a local copy of the script against the live store before pushing it. The case reports itself inconclusive when the browser reloads instead of restoring.

The production files are `assets/dandy-gummy-cart.js`, `layout/theme.liquid`, `snippets/dandy2-cart-drawer.liquid`, and `sections/dandy2-cart.liquid`. Their base was read from the live theme to preserve previously published work. Publish only these files. The shared CI workflow also runs the new regression suite.

This protects the theme's cart and checkout controls. It is not a server-side Shopify Function; direct checkout integrations that bypass the theme are outside this change. Shopify fulfillment uses the existing native bundle's three tracked single-pouch components.

Theme Check reports no findings in the four production files changed here. The wider repository has pre-existing findings in unrelated files and missing local assets from a separately published PDP. No package-level typecheck or lint command is configured.
