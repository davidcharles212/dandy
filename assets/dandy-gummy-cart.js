/* Keep two full-price, one-time gummy singles on the three-pouch offer.
   Prices are read from the live product data, never hardcoded: the swap runs only while the
   three-pouch pack costs no more than two singles, and any failure lets checkout continue. */
(function (scope) {
  'use strict';
  const SINGLE = 47958359965874;
  const BUNDLE = 48043999068338;
  const plain = item => !item.selling_plan_allocation && !item.parent_relationship &&
    !item.item_components?.length && !Object.keys(item.properties || {}).length;
  // price is the single's catalog price in cents; when omitted, only the cheap structural checks run.
  const singles = (cart, price) => (cart.items || []).filter(item => Number(item.id) === SINGLE &&
    plain(item) && (price == null || item.final_price === price) && !item.line_level_discount_allocations?.length);

  function plan(cart, product) {
    const single = product.variants.find(variant => variant.id === SINGLE);
    const bundle = product.variants.find(variant => variant.id === BUNDLE);
    // No swap unless the pack is in stock and costs no more than the two singles it replaces.
    if (cart.currency !== 'USD' || !single || !bundle || !bundle.available ||
        !(single.price > 0) || !(bundle.price > 0) || bundle.price > single.price * 2) return null;
    const eligible = singles(cart, single.price);
    const pairs = Math.floor(eligible.reduce((sum, item) => sum + item.quantity, 0) / 2);
    if (!pairs) return null;
    const existing = cart.items.filter(item => Number(item.id) === BUNDLE);
    // A discounted, subscribed or duplicated pack line is left alone rather than merged into.
    if (existing.length > 1 || existing.some(item => !plain(item) || item.final_price !== bundle.price)) return null;
    let remove = pairs * 2;
    const updates = {};
    for (const item of eligible) {
      const count = Math.min(remove, item.quantity);
      if (count) updates[item.key] = item.quantity - count;
      remove -= count;
    }
    updates[existing[0]?.key || BUNDLE] = (existing[0]?.quantity || 0) + pairs;
    return { updates, pairs, singlePrice: single.price };
  }

  function createService(fetcher, root = '/') {
    let tail = Promise.resolve();
    async function request(path, body) {
      const response = await fetcher(root + path, body ? {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      } : { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Cart request failed (' + response.status + ').');
      return response.json();
    }
    async function normalize(cart) {
      if (singles(cart).reduce((sum, item) => sum + item.quantity, 0) < 2) return { cart, changed: false };
      const product = await request('products/feel-good-gummies.js');
      const conversion = plan(cart, product);
      if (!conversion) return { cart, changed: false };
      const beforeTotal = cart.total_price;
      const beforeBundles = cart.items.filter(item => Number(item.id) === BUNDLE).reduce((n, item) => n + item.quantity, 0);
      // One request replaces the paid singles and adds their bundle. Never remove first.
      await request('cart/update.js', { updates: conversion.updates });
      const verified = await request('cart.js');
      const afterBundles = verified.items.filter(item => Number(item.id) === BUNDLE).reduce((n, item) => n + item.quantity, 0);
      if (verified.total_price > beforeTotal || afterBundles !== beforeBundles + conversion.pairs ||
          singles(verified, conversion.singlePrice).reduce((sum, item) => sum + item.quantity, 0) >= 2) {
        throw new Error('The free-pouch offer could not be verified. Please review your bag.');
      }
      return { cart: verified, changed: true };
    }
    function run(operation) {
      const result = tail.then(operation);
      tail = result.catch(error => console.error('Dandy gummy cart operation failed', error));
      return result;
    }
    return {
      ensure: () => run(async () => normalize(await request('cart.js'))),
      change: (id, quantity) => run(async () => normalize(await request('cart/change.js', { id, quantity }))),
      update: updates => run(async () => normalize(await request('cart/update.js', { updates })))
    };
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { plan, createService };
    return;
  }
  const service = createService(scope.fetch.bind(scope), scope.Shopify?.routes?.root || '/');
  scope.DandyGummyCart = service;
  let checkingOut = false;
  let disabledButtons = [];
  const releaseCheckout = () => {
    checkingOut = false;
    disabledButtons.forEach(button => { button.disabled = false; });
    disabledButtons = [];
    document.querySelectorAll('input[data-gummy-cart-checkout]').forEach(input => input.remove());
  };
  async function checkout(host, proceed) {
    if (checkingOut) return;
    checkingOut = true;
    disabledButtons = [...host.querySelectorAll('button')];
    disabledButtons.forEach(button => { button.disabled = true; });
    try {
      await service.ensure();
      proceed();
    } catch (error) {
      // The offer is a courtesy. A failed check is logged and the shopper still reaches checkout.
      console.error('Dandy checkout offer check failed', error);
      proceed();
    }
  }
  // Chrome restores this page from the back-forward cache when the shopper presses Back
  // from checkout, with checkingOut still true. Release the guard so Checkout works again.
  scope.addEventListener('pageshow', event => { if (event.persisted) releaseCheckout(); });
  scope.addEventListener('pagehide', () => { if (checkingOut) releaseCheckout(); });
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (event.submitter?.name !== 'checkout') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    checkout(form, () => {
      // Preserve Shopify's native checkout submission after the cart is verified.
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = 'checkout'; input.value = 'Checkout';
      input.dataset.gummyCartCheckout = '';
      form.append(input);
      HTMLFormElement.prototype.submit.call(form);
    });
  }, true);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?checkout\/?$/.test(url.pathname)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    checkout(link.parentElement, () => { location.href = url.href; });
  }, true);
})(typeof window === 'undefined' ? globalThis : window);
