
(() => {
  const root = document.querySelector('[data-d2-cart]');
  if (!root || root.dataset.dcartReady) return;
  root.dataset.dcartReady = 'true';

  document.querySelectorAll('[data-d2-cart]').forEach((node) => { if (node !== root) node.remove(); });
  if (root.parentElement !== document.body) document.body.appendChild(root);

  const isDemo = new URLSearchParams(location.search).get('cartdemo') === '1';
  const SECTION = isDemo ? 'dandy2-cart-drawer-demo' : 'dandy2-cart-drawer';
  const CLOSE_MS = 320;
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  const panel = root.querySelector('[data-dcart-panel]');
  const status = root.querySelector('[data-dcart-status]');
  const changeUrl = root.dataset.changeUrl || '/cart/change.js';
  const cartUrl = root.dataset.cartUrl || '/cart.js';
  const openOnAdd = root.dataset.openOnAdd !== 'false';
  const addUrl = root.dataset.addUrl || '/cart/add.js';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nativeFetch = window.fetch.bind(window);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let lastFocus = null;
  let closeTimer = 0;
  let busy = false;
  let refreshSeq = 0;


  const sectionUrl = () => {
    const url = new URL(location.href);
    url.hash = '';
    url.searchParams.set('section_id', SECTION);
    url.searchParams.set('_dcart', String(Date.now()));
    return url.toString();
  };

  const parseInner = (html) => html && new DOMParser().parseFromString(html, 'text/html').querySelector('[data-dcart-inner]');


  const pageUrl = () => {
    const url = new URL(location.href);
    url.hash = '';
    url.searchParams.delete('section_id');
    url.searchParams.set('_dcart', String(Date.now()));
    return url.toString();
  };
  let sectionUnavailable = false;

  const fetchDrawerHtml = async () => {
    if (!sectionUnavailable) {
      try {
        const response = await nativeFetch(sectionUrl(), { cache: 'no-store', headers: { Accept: 'text/html' } });
        if (response.ok) {
          const html = await response.text();
          if (parseInner(html)) return html;
          console.warn('Dandy cart: the section response had no drawer in it. Using the page instead.');
        } else {
          console.warn(`Dandy cart: Shopify returned ${response.status} for section "${SECTION}". Check that sections/${SECTION}.liquid is uploaded to this theme (Sections folder). Using the page instead.`);
        }
      } catch (error) {
        console.warn('Dandy cart: section request failed. Using the page instead.', error);
      }
      sectionUnavailable = true;
    }
    const response = await nativeFetch(pageUrl(), { cache: 'no-store', headers: { Accept: 'text/html' } });
    if (!response.ok) throw new Error(`page ${response.status}`);
    return response.text();
  };


  const CART_WRITE = /\/cart\/(add|change|update|clear)(\.js)?(\?|$)/;
  const pendingWrites = new Set();
  let externalTimer = 0;
  window.fetch = function dcartFetch(input, init) {
    const request = nativeFetch(input, init);
    try {
      const url = input instanceof Request ? input.url : String(input);
      const method = String((init && init.method) || (input instanceof Request && input.method) || 'GET').toUpperCase();
      if (method === 'POST' && CART_WRITE.test(url)) {
        const isAdd = /\/cart\/add/.test(url);
        const settled = request.then((response) => response.ok, () => false);
        pendingWrites.add(settled);
        settled.then((ok) => {
          pendingWrites.delete(settled);
          if (ok && isAdd && openOnAdd) {
            openFresh();
            return;
          }
          clearTimeout(externalTimer);
          externalTimer = setTimeout(() => refresh(), 60); 
        });
      }
    } catch (error) { /* never break the caller's request */ }
    return request;
  };
  const writesSettled = () => (pendingWrites.size
    ? Promise.race([Promise.all([...pendingWrites]), sleep(8000)])
    : Promise.resolve());
  const inner = () => root.querySelector('[data-dcart-inner]');
  const isOpen = () => root.classList.contains('is-open');
  const announce = (message) => { if (status) status.textContent = message; };

  let lastCount = null;
  const updateCounts = (value) => {
    const count = Number(value) || 0;
    document.querySelectorAll('cart-icon').forEach((icon) => {
      if (typeof icon.renderCartBubble === 'function') {
        icon.renderCartBubble(count, lastCount !== null && count > lastCount);
      } else {
        const text = icon.querySelector('.cart-bubble__text-count');
        const bubble = icon.querySelector('.cart-bubble');
        if (text) {
          text.textContent = count < 100 ? String(count) : '';
          text.classList.toggle('hidden', count === 0);
        }
        if (bubble) bubble.classList.toggle('visually-hidden', count === 0);
        icon.classList.toggle('header-actions__cart-icon--has-cart', count > 0);
      }
    });
    lastCount = count;
    document.querySelectorAll('[data-d2-cart-count]').forEach((node) => {
      node.textContent = String(count);
      node.hidden = count === 0;
    });
    document.querySelectorAll('[data-d2-cart-link]').forEach((link) => {
      link.setAttribute('aria-label', count ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart');
    });
  };

  const showError = (message) => {
    const box = root.querySelector('[data-dcart-error]');
    if (!box) return;
    box.textContent = message || '';
    box.hidden = !message;
  };

  const swap = (html) => {
    const next = parseInner(html);
    const current = inner();
    if (!next || !current) return false;

    const hadFocus = current.contains(document.activeElement);
    const focusId = hadFocus ? document.activeElement.dataset.dcartFocus : null;
    const scrollTop = current.querySelector('[data-dcart-scroll]')?.scrollTop ?? 0;

    current.replaceWith(next);

    const scroller = next.querySelector('[data-dcart-scroll]');
    if (scroller) scroller.scrollTop = scrollTop;
    if (hadFocus) {
      const target = (focusId && next.querySelector(`[data-dcart-focus="${CSS.escape(focusId)}"]`)) || next.querySelector('.dcart__close');
      target?.focus({ preventScroll: true });
    }
    updateCounts(next.dataset.itemCount);
    return true;
  };

  const refresh = async (attempt = 0) => {
    const seq = ++refreshSeq;
    try {
      const [html, cart] = await Promise.all([
        fetchDrawerHtml(),
        isDemo ? null : nativeFetch(cartUrl, { cache: 'no-store', headers: { Accept: 'application/json' } })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      ]);
      if (seq !== refreshSeq) return; 

      const rendered = Number(parseInner(html)?.dataset.itemCount);
      if (cart && rendered !== cart.item_count && attempt < 2) {
        await sleep(300);
        if (seq === refreshSeq) await refresh(attempt + 1);
        return;
      }
      swap(html);
    } catch (error) {
      console.error('Dandy cart refresh failed', error);
      if (seq === refreshSeq) showError('We couldn’t load your latest cart. Please check your connection and try again.');
    }
  };

  const postJson = async (url, body) => {
    const response = await nativeFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.description || data.message || 'That didn’t work. Please try again.');
      error.userFacing = true;
      throw error;
    }
    return data;
  };
  const withSections = (body) => (sectionUnavailable ? body : { ...body, sections: SECTION, sections_url: location.pathname });

  // Shared wrapper for every drawer action: busy state, re-render, header count, errors.
  const cartOp = async (steps) => {
    if (busy) return;
    if (isDemo) {
      showError('Preview mode: cart changes are switched off.');
      return;
    }
    busy = true;
    root.setAttribute('aria-busy', 'true');
    showError('');
    refreshSeq += 1; // any refresh already in flight is now older than this change
    try {
      const data = await steps();
      if (!swap(data.sections && data.sections[SECTION])) await refresh();
      if (typeof data.item_count === 'number') updateCounts(data.item_count);
      announce('Cart updated');
      document.dispatchEvent(new CustomEvent('d2:cart-updated', { detail: { cart: data } }));
    } catch (error) {
      console.error('Dandy cart change failed', error);
      showError(error.userFacing ? error.message : 'That didn’t work. Please check your connection and try again.');
    } finally {
      busy = false;
      root.removeAttribute('aria-busy');
    }
  };

  const change = (payload) => cartOp(() => postJson(changeUrl, withSections(payload)));
  const switchToSubscription = ({ mode, key, variant, plan, quantity }) => {
    const qty = Number(quantity) || 1;
    const sellingPlan = Number(plan);
    if (mode !== 'swap') return change({ id: key, quantity: qty, selling_plan: sellingPlan });
    return cartOp(async () => {
      await postJson(addUrl, { items: [{ id: Number(variant), quantity: qty, selling_plan: sellingPlan }] });
      try {
        return await postJson(changeUrl, withSections({ id: key, quantity: 0 }));
      } catch (error) {
        await refresh();
        throw error;
      }
    });
  };

  const open = () => {
    clearTimeout(closeTimer);
    if (isOpen()) return;
    lastFocus = document.activeElement;
    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('dcart-lock');
    void root.offsetWidth;
    root.classList.add('is-open');
    root.querySelector('.dcart__close')?.focus({ preventScroll: true });
  };

  const close = () => {
    if (!isOpen()) return;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('dcart-lock');
    closeTimer = setTimeout(() => { root.hidden = true; }, reduceMotion.matches ? 0 : CLOSE_MS);
  };

  let opening = null;
  const openFresh = () => {
    if (!opening) {
      opening = (async () => {
        await sleep(0);
        await writesSettled();
        await Promise.race([refresh(), sleep(600)]);
        open();
      })().finally(() => { opening = null; });
    }
    return opening;
  };

  root.addEventListener('click', (event) => {
    const target = event.target;
    if (target.closest('[data-d2-cart-close]')) {
      close();
      return;
    }
    const qtyButton = target.closest('[data-dcart-qty]');
    if (qtyButton) {
      const key = qtyButton.closest('[data-line-key]')?.dataset.lineKey;
      const quantity = Math.max(0, Number(qtyButton.dataset.dcartQty) || 0);
      if (key) change({ id: key, quantity });
      return;
    }
    const switchButton = target.closest('[data-dcart-switch]');
    if (switchButton) switchToSubscription(switchButton.dataset);
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const nodes = [...panel.querySelectorAll(FOCUSABLE)].filter((node) => !node.closest('[hidden]') && node.getClientRects().length);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.d2head__cart, [data-d2-cart-open]');
    if (!trigger || root.contains(trigger) || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    open();
    refresh();
  });

  document.addEventListener('d2:cart-open', openFresh);
  document.addEventListener('d2:cart-refresh', refresh);
  window.addEventListener('pageshow', (event) => { if (event.persisted && !isDemo) refresh(); });

  if (isDemo) openFresh();
})();
