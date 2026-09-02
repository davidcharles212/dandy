/* DANDY 2026 REDESIGN, offer logic (V2 "two doors"). Single price source mirroring
   the approved pricing (test doc Appendix B). Honest rules: subscription applies only
   to the single 30-count pouch; multi-pouch packs and the 10-count trial = one-time;
   anchors are one-time × quantity; when shipping changes the total, the page says so.
   2026-09-01: mascot removed from the CTA, sticky/recap buttons submit the real form.
   2026-09-01 round 2: charged-today line only when shipping applies, live ship-by
   countdown (2 PM Central, ships Mon–Sat), scroll-based sticky bar, confetti on the
   5-pouch pick (once per page view, off under Reduce Motion). */
(() => {
  const SHIP = 5.95;
  const $ = (n) => '$' + n.toFixed(2);
  // Every offer is a complete, self-contained decision, no cross-state collisions.
  const OFFERS = {
    sub:     { cta: 'Start monthly',  label: 'Monthly supply, 30 gummies', product: 47.99,  ship: 0,    renews: true },
    '1':     { cta: 'Get 1 pouch',    label: '1 pouch, one-time',          product: 59.99,  ship: SHIP },
    '3':     { cta: 'Get 3 pouches',  label: '3 pouches, one-time',        product: 119.98, ship: 0 },
    '5':     { cta: 'Get 5 pouches',  label: '5 pouches, one-time',        product: 179.97, ship: 0 },
    'trial': { cta: 'Get the sampler', label: 'Sampler, 10 gummies',        product: 24.99,  ship: SHIP }
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
            document.getElementById('DandyOffer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            form.dispatchEvent(new Event('submit', { cancelable: true }));
            return;
          }
          if (typeof form.requestSubmit === 'function') form.requestSubmit(); else form.submit();
        }));
      }
      // Live ship-by line. Dandy ships Monday to Saturday; orders in by 2 PM Central
      // ship the same day. Before the cutoff: a ticking countdown with a live dot.
      // After it: "ships tomorrow", except Saturday afternoon and Sunday, which is Monday.
      const cut = this.querySelector('[data-d2-cutoff]');
      const dot = this.querySelector('[data-d2-cutoff-dot]');
      if (cut) {
        const pad = (n) => String(n).padStart(2, '0');
        const tick = () => {
          const ct = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
          const day = ct.getDay(); // 0 = Sunday
          const dl = new Date(ct); dl.setHours(14, 0, 0, 0);
          const shipsToday = day !== 0 && ct < dl;
          if (shipsToday) {
            const s = Math.max(0, Math.floor((dl - ct) / 1000));
            const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
            cut.innerHTML = 'Order in the next <b>' + (h ? h + 'h ' : '') + m + 'm ' + pad(sec) + 's</b>, <span class="keep">ships today</span>';
          } else {
            const next = (day === 6 || day === 0) ? 'Monday' : 'tomorrow';
            cut.innerHTML = 'Order now, <b>ships ' + next + '</b>';
          }
          if (dot) dot.hidden = !shipsToday;
        };
        tick(); setInterval(tick, 1000);
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
      // Sticky bar: shows once the main buy button has scrolled off the top, hides
      // again while the recap's own button is on screen. Driven by scroll position
      // (not IntersectionObserver) so it behaves the same in every phone browser.
      const cta = this.querySelector('[data-d2-cta]');
      const bar = this.querySelector('[data-d2-sticky]');
      const recapCta = this.querySelector('[data-d2-recap-cta]');
      if (cta && bar) {
        let raf = 0;
        const update = () => {
          raf = 0;
          const c = cta.getBoundingClientRect();
          const r = recapCta ? recapCta.getBoundingClientRect() : null;
          const pastCta = c.bottom < 0;
          const recapOnScreen = !!r && r.top < window.innerHeight && r.bottom > 0;
          bar.hidden = !pastCta || recapOnScreen;
        };
        const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        window.addEventListener('load', update);
        update();
      }
      // Confetti when the 5-pouch (best value) row is picked: once per page view,
      // never for shoppers who have asked their phone for less motion.
      if (this.dataset.confetti === 'true' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let fired = false;
        this.addEventListener('change', (e) => {
          const inp = e.target;
          if (fired || !(inp instanceof HTMLInputElement) || !inp.matches('[data-d2-one]') || inp.value !== '5' || !inp.checked) return;
          fired = true;
          this.confetti(inp.closest('label') || inp);
        });
      }
      // initial state, now that the buy form (incl. the selling_plan field) is wired
      this.sync();
    }
    confetti(from) {
      const rect = from.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const cv = document.createElement('canvas');
      cv.className = 'd2confetti';
      cv.width = Math.round(window.innerWidth * dpr); cv.height = Math.round(window.innerHeight * dpr);
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90';
      document.body.appendChild(cv);
      const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
      const colors = ['#F04B23', '#28110C', '#57BA4F', '#FFFFFF', '#F9EBD8'];
      const ox = rect.left + rect.width / 2, oy = rect.top + rect.height / 2;
      const P = Array.from({ length: 56 }, () => {
        const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * .95;
        const v = 7 + Math.random() * 8;
        return { x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 6 + Math.random() * 5, h: 4 + Math.random() * 4,
                 r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3, c: colors[Math.floor(Math.random() * colors.length)] };
      });
      const t0 = performance.now(), DUR = 900;
      const frame = (t) => {
        const k = (t - t0) / DUR;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalAlpha = k > .7 ? Math.max(0, 1 - (k - .7) / .3) : 1;
        P.forEach(p => {
          p.vy += .38; p.x += p.vx; p.y += p.vy; p.vx *= .985; p.r += p.vr;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
        });
        if (k < 1) requestAnimationFrame(frame); else cv.remove();
      };
      requestAnimationFrame(frame);
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
      set('[data-d2-recap-cta]', this.ctaText(o));
      // charged-today line: only when shipping makes the total differ from the button
      const charge = this.querySelector('[data-d2-chargeline]');
      if (charge) {
        charge.hidden = !(o.ship > 0);
        charge.textContent = o.ship > 0 ? 'Charged today ' + $(total) + ', includes ' + $(o.ship) + ' shipping' : '';
      }
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
