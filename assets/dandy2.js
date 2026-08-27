/* DANDY 2026 REDESIGN, offer logic (V2 "two doors"). Single price source mirroring
   the approved pricing (test doc Appendix B). Honest rules: subscription applies only
   to the single 30-count pouch; multi-pouch packs and the 10-count trial = one-time;
   anchors are one-time × quantity; CHARGED TODAY always includes shipping.
   Preview-safe: never submits. */
(() => {
  const SHIP = 5.95;
  // Every offer is a complete, self-contained decision, no cross-state collisions.
  const OFFERS = {
    sub:     { cta: 'START SUBSCRIPTION', label: '1 pouch · 30-count · subscription', product: 47.99, ship: 0, renews: true },
    '1':     { cta: 'ADD 1 POUCH', label: 'Single pouch · one-time', product: 59.99, ship: SHIP },
    '3':     { cta: 'ADD 3-PACK', label: '3-pack · one-time', product: 119.98, ship: 0 },
    '5':     { cta: 'ADD 5-PACK', label: '5-pack · one-time', product: 179.97, ship: 0 },
    'trial': { cta: 'ADD 10-COUNT TRIAL', label: '10-count trial · one-time', product: 24.99, ship: SHIP }
  };
  const $ = (n) => '$' + n.toFixed(2);

  class Dandy2Pdp extends HTMLElement {
    connectedCallback() {
      this.door = 'sub';
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
      this.sync();
      // Rocky lunges for the CTA once the shopper scrolls to it, holds, then leaves
      const rocky = this.querySelector('[data-d2-ctarocky]');
      const ctaBtn = this.querySelector('[data-d2-cta]');
      if (rocky && ctaBtn && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let scrolled = false, done = false;
        addEventListener('scroll', () => { scrolled = true; }, { once: true, passive: true });
        const io = new IntersectionObserver(([en]) => {
          if (done || !scrolled || !en.isIntersecting) return;
          done = true; io.disconnect();
          rocky.classList.add('is-in');
          setTimeout(() => rocky.classList.remove('is-in'), 4200);
        }, { threshold: 0.9 });
        io.observe(ctaBtn);
        // ...and any time the button is hovered
        ctaBtn.addEventListener('mouseenter', () => rocky.classList.add('is-in'));
        ctaBtn.addEventListener('mouseleave', () => rocky.classList.remove('is-in'));
      }
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
      }
      // Live shipping cutoff, real 1 PM ET weekday deadline, never a fake timer
      const cut = this.querySelector('[data-d2-cutoff]');
      if (cut) {
        const tick = () => {
          const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
          const dl = new Date(et); dl.setHours(13, 0, 0, 0);
          const weekday = et.getDay() >= 1 && et.getDay() <= 5;
          if (weekday && et < dl) {
            const mins = Math.floor((dl - et) / 60000);
            const h = Math.floor(mins / 60), m = mins % 60;
            cut.innerHTML = 'Order within <b>' + (h ? h + 'h ' : '') + m + 'm</b>, ships today';
          } else {
            cut.innerHTML = 'Order now, <b>ships next business day</b>';
          }
        };
        tick(); setInterval(tick, 30000);
      }
      // Order bump: adds the 10-count trial alongside the main line
      const bump = this.querySelector('[data-d2-bump]');
      if (bump && form) {
        form.addEventListener('submit', () => {
          if (form.dataset.buyable !== 'true') return;
          form.dataset.bump = bump.checked ? '1' : '';
        });
      }
      // sticky bar: show once the buy box scrolls out of view (mobile only via CSS)
      const grid = this.querySelector('.dandy2-pdp__grid');
      const bar = this.querySelector('[data-d2-sticky]');
      if (grid && bar && 'IntersectionObserver' in window) {
        new IntersectionObserver(([en]) => { bar.hidden = en.isIntersecting; }, { rootMargin: '-120px 0px 0px 0px' }).observe(grid);
      }
    }
    sync() {
      const key = this.door === 'sub' ? 'sub' : (this.oneInputs.find(i => i.checked)?.value || '3');
      const o = OFFERS[key];
      const total = o.product + o.ship;

      const set = (sel, txt) => { const n = this.querySelector(sel); if (n) n.textContent = txt; };
      const cta = this.querySelector('[data-d2-cta]');
      if (cta) cta.textContent = `${o.cta} · ${$(o.product)}`;
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
