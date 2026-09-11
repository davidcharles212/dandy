/* Dandy capsule offer. One-time jar bundles; never substitutes a differently priced variant.
   Prices and variant ids are rendered by Liquid from real product data; this only
   keeps the button, dispatch line and cart submit in sync with the chosen tier. */
(() => {
  const money = (cents) => '$' + (cents / 100).toFixed(2);

  class DandyCapsuleOffer extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.form = this.querySelector('[data-co-form]');
      this.message = this.querySelector('[data-co-message]');
      this.inputs = [...this.querySelectorAll('[data-co-tier]')];
      this.button = this.querySelector('[data-co-cta]');
      if (!this.form || !this.button || this.inputs.length === 0) return;

      // The configured default wins over stale campaign URLs.
      const wanted = this.dataset.defaultTier;
      if (wanted && this.inputs.some((i) => i.value === wanted)) {
        this.inputs.forEach((i) => { i.checked = i.value === wanted; });
      } else if (!this.inputs.some((i) => i.checked)) {
        this.inputs[this.inputs.length - 1].checked = true;
      }

      this.inputs.forEach((input) => input.addEventListener('change', () => this.sync()));
      this.form.addEventListener('submit', (event) => { event.preventDefault(); this.add(); });

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

    get selected() {
      return this.inputs.find((i) => i.checked) || this.inputs[this.inputs.length - 1];
    }

    sync() {
      const input = this.selected;
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
        detail: { variantId: id.value, price: Number(input.dataset.price) || 0, label: input.dataset.label }
      }));
    }

    async add() {
      if (this.pending) return;
      const input = this.selected;
      const variantId = Number(input.dataset.variantId);
      const price = Number(input.dataset.price);
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
