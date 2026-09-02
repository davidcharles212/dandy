/* DANDY 2026 REDESIGN, offer logic (V2 "two doors"). Single price source mirroring
   the approved pricing (test doc Appendix B). Honest rules: subscription applies only
   to the single 30-count pouch; multi-pouch packs and the 10-count trial = one-time;
   anchors are one-time × quantity; CHARGED TODAY always includes shipping.
   2026-09-01: mascot removed from the CTA, charged-today line, sticky/recap buttons
   submit the real form, shipping cutoff is 2 PM Central (same-day ship). */
(() => {
  const SHIP = 5.95;
  const $ = (n) => '$' + n.toFixed(2);
  // Every offer is a complete, self-contained decision, no cross-state collisions.
  const OFFERS = {
    sub:     { cta: 'Start monthly',  label: 'Monthly supply · 30-count', product: 47.99, ship: 0, renews: true,
               charge: 'Charged today $47.99 · free shipping · renews every 30 days' },
    '1':     { cta: 'Get 1 pouch',    label: '1 pouch · one-time',        product: 59.99, ship: SHIP,
               charge: 'Charged today $65.94, includes $5.95 shipping' },
    '3':     { cta: 'Get 3 pouches',  label: '3 pouches · one-time',      product: 119.98, ship: 0,
               charge: 'Charged today $119.98 · free shipping · save $59.99' },
    '5':     { cta: 'Get 5 pouches',  label: '5 pouches · one-time',      product: 179.97, ship: 0,
               charge: 'Charged today $179.97 · free shipping · save $119.98' },
    'trial': { cta: 'Get the trial',  label: '10-count trial · one-time', product: 24.99, ship: SHIP,
               charge: 'Charged today $30.94, includes $5.95 shipping' }
  };

  class Dandy2Pdp extends HTMLElement {
    connectedCallback() {
      this.door = 'sub';
      this.ctaStyle = this.dataset.ctaStyle === 'plain' ? 'plain' : 'offer';
      this.doorBtns = [...this.querySelectorAll('[data-d2-door]')];
      this.oneInputs = [...this.querySelectorAll('[data-d2-one]')];
      this.doorBtns.forEach(btn => btn.addEventListener('click', () => {
        this.door = btn.dataset.d2Door;
        this.doorBtns.forEach(b => {
          const on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', String(on));
        });
        this.querySelectorAll('[data-d2-pane]').forEach(p => { p.hidden = p.dataset.d2Pane !== this.door; });
        this.sync();
      }));
      this.addEventListener('change', () => this.sync());
      // gallery: thumbs swap the main image
      const gmain = this.querySelector('.gallery__main img');
      const gthumbs = [...this.querySelectorAll('.gallery__thumb')];
      gthumbs.forEach(t => t.addEventListener('click', () => {
        gthumbs.forEach(x => x.setAttribute('aria-current', String(x === t)));
        if (!gmain) return;
        gmain.src = t.dataset.full || t.querySelector('img').src;
        gmain.alt = t.dataset.alt || '';
        if (t.dataset.fit) gmain.setAttribute('data-fit', t.dataset.fit);
        else gmain.removeAttribute('data-fit');
      }));
      // deep link: #just-once opens the one-time door
      if (location.hash === '#just-once') this.doorBtns.find(b => b.dataset.d2Door === 'one')?.click();
      // Add to cart: submits for real the moment Shopify has a purchasable variant.
      // Until then the button explains itself instead of silently doing nothing.
      const form = this.querySelector('[data-d2-buyform]');
      if (form) {
        const note = form.querySelector('[data-d2-previewnote]');
        const planField = form.querySelector('[data-d2-planfield]');
        const qtyField = form.querySelector('[data-d2-qtyfield]');
        const idField = form.querySelector('[data-d2-idfield]');
        let vmap = [];
        try { vmap = JSON.parse(this.querySelector('[data-d2-variantmap]')?.textContent || '[]'); } catch {}
        // find a variant whose title carries the tokens we need, e.g. "30-count / 3-pack"
        const findV = (...tokens) => vmap.find(v => tokens.every(t => v.title.toLowerCase().includes(t)) && v.available && v.price > 0);
        this.buyform = { form, note, planField, qtyField, idField, findV };
        form.addEventListener('submit', (e) => {
          if (form.dataset.buyable === 'true') return; // real add to cart
          e.preventDefault();
          if (!note) return;
          note.hidden = false;
          note.textContent = this.door === 'sub' && !form.dataset.plan
            ? 'Preview only, no subscription plan exists in Shopify yet, so there is nothing to start. This button will check out for real once the SKUs and selling plans are created.'
            : 'Preview only, this product has no purchasable variant in Shopify yet. This button will check out for real once the SKUs are created.';
        });
        // sticky bar + recap buttons submit the same form (they used to only scroll up)
        this.querySelectorAll('[data-d2-submit]').forEach(btn => btn.addEventListener('click', () => {
          if (form.dataset.buyable !== 'true') {
            document.getElementById('DandyBuyBox')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            form.dispatchEvent(new Event('submit', { cancelable: true }));
            return;
          }
          if (typeof form.requestSubmit === 'function') form.requestSubmit(); else form.submit();
        }));
      }
      // Live shipping cutoff: orders in by 2 PM Central on a weekday ship the same day.
      const cut = this.querySelector('[data-d2-cutoff]');
      if (cut) {
        const tick = () => {
          const ct = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
          const dl = new Date(ct); dl.setHours(14, 0, 0, 0);
          const weekday = ct.getDay() >= 1 && ct.getDay() <= 5;
          if (weekday && ct < dl) {
            const mins = Math.floor((dl - ct) / 60000);
            const h = Math.floor(mins / 60), m = mins % 60;
            cut.innerHTML = 'Order within <b>' + (h ? h + 'h ' : '') + m + 'm</b>, ships today';
          } else {
            cut.innerHTML = 'Order now, <b>ships next business day</b>';
          }
        };
        tick(); setInterval(tick, 30000);
      }
      // Order bump: when checked, the add must carry TWO lines (main + 10-count
      // one-time), which a native single-id form post cannot do — so intercept
      // and use the AJAX cart, falling back to the plain post (main line only).
      const bump = this.querySelector('[data-d2-bump]');
      if (bump && form) {
        form.addEventListener('submit', (e) => {
          if (form.dataset.buyable !== 'true' || !bump.checked) return;
          if (bump.closest('.bump')?.hidden) return; // trial door: bump not offered
          const bf = this.buyform;
          const trial = bf.findV('10-count', 'single');
          if (!trial || !bf.idField) return;
          e.preventDefault();
          const main = { id: Number(bf.idField.value), quantity: Number(bf.qtyField?.value || 1) };
          if (bf.planField && !bf.planField.disabled && bf.planField.value) main.selling_plan = Number(bf.planField.value);
          fetch(form.action.replace(/\/add\/?$/, '/add.js'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [main, { id: trial.id, quantity: 1 }] }),
          }).then((r) => {
            if (!r.ok) throw new Error('add ' + r.status);
            window.location.href = form.action.replace(/\/add\/?$/, '');
          }).catch(() => form.submit());
        });
      }
      // sticky bar: show once the buy box scrolls out of view (mobile only via CSS)
      const grid = this.querySelector('.dandy2-pdp__grid');
      const bar = this.querySelector('[data-d2-sticky]');
      if (grid && bar && 'IntersectionObserver' in window) {
        new IntersectionObserver(([en]) => { bar.hidden = en.isIntersecting; }, { rootMargin: '-120px 0px 0px 0px' }).observe(grid);
      }
      // initial state, now that the buy form (incl. the selling_plan field) is wired
      this.sync();
    }
    ctaText(o) {
      return (this.ctaStyle === 'plain' ? 'Add to cart' : o.cta) + ' · ' + $(o.product);
    }
    sync() {
      const key = this.door === 'sub' ? 'sub' : (this.oneInputs.find(i => i.checked)?.value || '3');
      const o = OFFERS[key];
      const total = o.product + o.ship;

      const set = (sel, txt) => { const n = this.querySelector(sel); if (n) n.textContent = txt; };
      set('[data-d2-cta]', this.ctaText(o));
      set('[data-d2-chargeline]', o.charge);
      set('[data-d2-recap-cta]', this.ctaText(o));
      // recap + sticky echoes always carry the true charged-today total
      set('[data-d2-recap-label]', o.label);
      set('[data-d2-recap-total]', $(total));
      set('[data-d2-sticky-label]', o.label);
      set('[data-d2-sticky-total]', $(total));
      // keep the real cart payload in sync with the visible selection
      // the trial IS the bump product, so never offer both at once
      const bumpWrap = this.querySelector('.bump');
      if (bumpWrap) bumpWrap.hidden = (key === 'trial');
      const bf = this.buyform;
      if (bf) {
        // prefer a real pack variant (script-created); fall back to qty of the single
        const WANT = {
          sub:   ['30-count', 'single'], '1': ['30-count', 'single'],
          '3':   ['30-count', '3-pack'], '5': ['30-count', '5-pack'],
          trial: ['10-count', 'single'],
        };
        const v = bf.findV ? bf.findV(...(WANT[key] || [])) : null;
        // the sub door is only buyable once a selling plan exists; otherwise a
        // click would add a one-time single at a different price than the CTA shows
        const usable = v && !(key === 'sub' && !bf.form.dataset.plan);
        if (usable && bf.idField) {
          bf.idField.value = v.id;
          bf.form.dataset.buyable = 'true';
          if (bf.qtyField) bf.qtyField.value = 1;         // packs are one line item
        } else {
          bf.form.dataset.buyable = 'false';
          if (bf.qtyField) bf.qtyField.value = key === 'sub' || key === 'trial' ? 1 : (Number(key) || 1);
        }
        if (bf.planField) {
          const usePlan = o.renews && bf.form.dataset.plan;
          bf.planField.disabled = !usePlan;
          bf.planField.value = usePlan ? bf.form.dataset.plan : '';
        }
        if (bf.note) bf.note.hidden = true;
      }
    }
  }
  if (!customElements.get('dandy2-pdp')) customElements.define('dandy2-pdp', Dandy2Pdp);
})();
