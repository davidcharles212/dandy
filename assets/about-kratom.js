/* Progressive enhancement: native links/details remain functional without JS. */
(() => {
  const root = document.getElementById('AboutKratom');
  if (!root || root.dataset.akReady) return;
  root.dataset.akReady = 'true';
  root.querySelectorAll('a[href^="#ak-section-"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = root.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
      const heading = target.querySelector('h2');
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    });
  });
  root.querySelectorAll('[data-format-select]').forEach((link) => {
    link.addEventListener('click', () => {
      root.dispatchEvent(new CustomEvent('dandy:format-select', { bubbles: true, detail: { format: link.dataset.formatSelect } }));
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'format_select', format: link.dataset.formatSelect, source: 'about_kratom' });
    });
  });
  // Only use an address already captured by Shopify; never infer location.
  const addressData = document.querySelector('[data-ak-shipping-address]');
  const status = root.querySelector('[data-shipping-status]');
  if (addressData && status) {
    try {
      const address = JSON.parse(addressData.textContent);
      if (!address.country || !address.province) return;
      const excluded = new Set(['AL', 'AR', 'CA', 'CT', 'IN', 'KS', 'LA', 'MA', 'MS', 'ND', 'NE', 'RI', 'TN', 'UT', 'VT', 'WV', 'WI']);
      if (address.country !== 'US' || excluded.has(address.province)) {
        status.textContent = 'SHIPPING RESTRICTIONS: We do not ship to AL, AR, CA, CT, IN, KS, LA, MA, MS, ND, NE, RI, TN, UT, VT, WV, or WI. Void where prohibited by law.';
        status.hidden = false;
      }
    } catch (_) { /* An invalid optional address must not block the page. */ }
  }
})();
