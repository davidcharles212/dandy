/* Dandy capsule offer. One-time jar bundles; never substitutes a differently priced variant.
   Prices and variant ids are rendered by Liquid from real product data for BOTH strengths;
   this keeps the button, dispatch line and cart submit in sync with the chosen tier, and
   turns the strength links into an in-page switch when the other strength's tiers are
   present in the DOM (the links still work as plain navigation without JS). */
(() => {
  const money = (cents) => '$' + (cents / 100).toFixed(2);

  class DandyCapsuleOffer extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.form = this.querySelector('[data-co-form]');
      this.message = this.querySelector('[data-co-message]');
      this.button = this.querySelector('[data-co-cta]');
      this.fieldsets = [...this.querySelectorAll('[data-co-tiers]')];
      if (!this.form || !this.button || this.fieldsets.length === 0) return;

      this.strength = this.dataset.strength || '50';
      this.collectInputs();
      if (this.inputs.length === 0) return;
      this.applyDefault();

      this.addEventListener('change', (event) => {
        if (event.target.matches('[data-co-tier]')) this.sync();
      });
      this.form.addEventListener('submit', (event) => { event.preventDefault(); this.add(); });

      this.querySelectorAll('[data-co-strength]').forEach((link) => {
        link.addEventListener('click', (event) => {
          const next = link.dataset.coStrength;
          if (next === this.strength) { event.preventDefault(); return; }
          if (!this.fieldsetFor(next)) return; // sibling not rendered: let the link navigate
          event.preventDefault();
          this.switchStrength(next);
        });
      });

      this.tick = () => {
        const cutoff = Number(this.dataset.cutoffHour) || 14;
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', hourCycle: 'h23'
        }).formatToParts(new Date()).map((p) => [p.type, p.value]));
        const today = parts.weekday !== 'Sun' && parts.weekday !== 'Sat' && Number(parts.hour) < cutoff;
        const next = parts.weekday === 'Sat' || parts.weekday === 'Sun' || (parts.weekday === 'Fri' && !today) ? 'MONDAY' : 'TOMORROW';
        const when = today ? 'TODAY' : next;
        const head = this.querySelector('[data-co-dispatch]');
        if (head) head.textContent = head.textContent.replace(/TODAY|TOMORROW|MONDAY/, when);
        const proof = this.querySelector('[data-co-proof-dispatch]');
        if (proof) proof.textContent = 'Ships ' + when.charAt(0) + when.slice(1).toLowerCase();
      };
      this.tick();
      this.timer = setInterval(this.tick, 30000);
      this.sync();
    }

    disconnectedCallback() {
      clearInterval(this.timer);
      this.initialized = false;
    }

    fieldsetFor(strength) {
      return this.fieldsets.find((f) => f.dataset.coTiers === strength) || null;
    }

    collectInputs() {
      const active = this.fieldsetFor(this.strength) || this.fieldsets[0];
      this.inputs = active ? [...active.querySelectorAll('[data-co-tier]')] : [];
    }

    applyDefault() {
      // The configured default wins over stale campaign URLs.
      const wanted = this.dataset.defaultTier;
      if (wanted && this.inputs.some((i) => i.value === wanted)) {
        this.inputs.forEach((i) => { i.checked = i.value === wanted; });
      } else if (!this.inputs.some((i) => i.checked)) {
        this.inputs[this.inputs.length - 1].checked = true;
      }
    }

    switchStrength(next) {
      const target = this.fieldsetFor(next);
      if (!target) return;
      this.fieldsets.forEach((f) => {
        const on = f === target;
        f.hidden = !on;
        f.querySelectorAll('[data-co-tier]').forEach((i) => { i.disabled = !on; });
      });
      this.strength = next;
      this.dataset.strength = next;
      this.collectInputs();
      this.applyDefault();

      // data-*-90 keeps its hyphen in dataset (digits do not camel-case), so read attributes directly.
      const attr = (name) => this.getAttribute('data-' + name + '-' + next) || '';
      const url = attr('url') || attr('product-url');
      if (attr('product-url')) this.dataset.productUrl = attr('product-url');

      this.querySelectorAll('[data-co-strength]').forEach((link) => {
        const on = link.dataset.coStrength === next;
        link.classList.toggle('is-current', on);
        if (on) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });

      const title = attr('title');
      if (title) {
        document.querySelectorAll('.dandy-product-header__title').forEach((h) => { h.textContent = title; });
        const prev = this.getAttribute('data-title-' + (next === '90' ? '50' : '90'));
        if (prev && document.title.includes(prev)) document.title = document.title.replace(prev, title);
      }

      if (url && window.history && history.replaceState) {
        try {
          const u = new URL(url, location.origin);
          // Keep preview/session params (preview_theme_id etc.) the shopper arrived with.
          new URLSearchParams(location.search).forEach((v, k) => { if (!u.searchParams.has(k)) u.searchParams.set(k, v); });
          history.replaceState(history.state, '', u.pathname + u.search + location.hash);
        } catch (error) {
          console.error('Dandy capsule offer: could not update the URL', error);
        }
      }

      this.sync();
      document.dispatchEvent(new CustomEvent('dandy:strength-change', { bubbles: true, detail: { strength: next, title, url } }));
    }

    get selected() {
      return this.inputs.find((i) => i.checked) || this.inputs[this.inputs.length - 1];
    }

    sync() {
      const input = this.selected;
      if (!input) return;
      const id = this.querySelector('[data-co-id]');
      id.value = input.dataset.variantId || '';
      this.querySelector('[data-co-cta-text]').textContent = input.dataset.cta || 'ADD TO CART';
      this.querySelector('[data-co-cta-price]').textContent = ' • ' + money(Number(input.dataset.price) || 0);
      this.querySelectorAll('[data-co-tier-card]').forEach((card) => {
        card.toggleAttribute('data-selected', card.contains(input));
      });
      this.message.hidden = true;
      this.dispatchEvent(new CustomEvent('dandy:capsule-offer-change', {
        bubbles: true,
        detail: { variantId: id.value, price: Number(input.dataset.price) || 0, label: input.dataset.label, strength: this.strength }
      }));
    }

    async add() {
      if (this.pending) return;
      const input = this.selected;
      const variantId = Number(input && input.dataset.variantId);
      const price = Number(input && input.dataset.price);
      if (!variantId) {
        this.message.textContent = 'This bundle is not available yet. Please choose another option.';
        this.message.hidden = false;
        return;
      }
      this.pending = true;
      this.button.disabled = true;
      this.inputs.forEach((i) => { i.disabled = true; });
      this.form.setAttribute('aria-busy', 'true');
      try {
        // Refresh server price and stock before adding; theme prices are not checkout prices.
        const fresh = await fetch(this.dataset.productUrl.split('?')[0] + '.js', { headers: { Accept: 'application/json' } });
        if (!fresh.ok) throw new Error('Product refresh failed: ' + fresh.status);
        const product = await fresh.json();
        const variant = product.variants.find((v) => v.id === variantId);
        if (!variant || !variant.available || variant.price !== price) throw new Error('Selected offer price or availability changed');
        const response = await fetch(this.form.action.replace(/\/add\/?$/, '/add.js'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: variant.id, quantity: 1 }] })
        });
        if (!response.ok) throw new Error('Cart add failed: ' + response.status);
        await response.json();
        window.location.href = this.dataset.cartUrl || '/cart';
      } catch (error) {
        console.error('Dandy capsule add to cart failed', error);
        this.message.textContent = 'We couldn’t add this bundle. Please refresh and try again.';
        this.message.hidden = false;
      } finally {
        this.pending = false;
        this.button.disabled = false;
        this.inputs.forEach((i) => { i.disabled = false; });
        this.form.removeAttribute('aria-busy');
      }
    }
  }

  if (!customElements.get('dandy-capsule-offer')) customElements.define('dandy-capsule-offer', DandyCapsuleOffer);
})();
