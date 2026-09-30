/* One-time gummy bundles. Never substitute a differently priced Shopify variant. */
(() => {
  const OFFERS = {
    '1': { cents: 5999, title: '30-count / Single', label: '1 Pouch', cta: 'ADD TO CART' },
    '2': { cents: 9998, title: '30-count / 2-pack', label: '2 Pouches', cta: 'ADD TO CART' },
    '3': { cents: 11998, title: '30-count / 3-pack', label: '3 Pouches', cta: 'CLAIM MY FREE POUCH' }
  };
  const money = cents => '$' + (cents / 100).toFixed(2);
  class GummyOffer extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.form = this.querySelector('[data-go-form]');
      this.message = this.querySelector('[data-go-message]');
      this.inputs = [...this.querySelectorAll('[data-go-tier]')];
      this.buttons = [...this.querySelectorAll('[data-go-cta], [data-d2-submit]')];
      this.variants = [];
      try { this.variants = JSON.parse(this.querySelector('[data-go-variants]').textContent); }
      catch (error) { console.error('Dandy gummy variant data could not be read', error); }
      // The approved default wins over old subscription and sampler campaign URLs.
      // A tier the shopper tapped before this script loaded stays selected.
      if (!this.inputs.some(input => input.checked && !input.defaultChecked)) {
        this.inputs.forEach(input => { input.checked = input.value === '3'; });
      }
      this.inputs.forEach(input => input.addEventListener('change', () => this.sync()));
      this.form.addEventListener('submit', event => { event.preventDefault(); this.add(); });
      this.querySelectorAll('[data-d2-submit]').forEach(button => button.addEventListener('click', () => {
        if (!this.pending) this.form.requestSubmit();
        if (!this.variant) this.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }));
      const main = this.querySelector('.gallery__main img');
      const thumbs = [...this.querySelectorAll('.gallery__thumb')];
      thumbs.forEach(thumb => thumb.addEventListener('click', () => {
        thumbs.forEach(item => item.setAttribute('aria-current', String(item === thumb)));
        main.src = thumb.dataset.full;
        main.alt = thumb.dataset.alt || '';
        if (thumb.dataset.fit) main.dataset.fit = thumb.dataset.fit;
        else main.removeAttribute('data-fit');
      }));
      this.tick = () => {
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', hourCycle: 'h23'
        }).formatToParts(new Date()).map(part => [part.type, part.value]));
        const today = parts.weekday !== 'Sun' && Number(parts.hour) < 14;
        const next = parts.weekday === 'Sun' || parts.weekday === 'Sat' ? 'MONDAY' : 'TOMORROW';
        this.querySelector('[data-go-dispatch]').textContent = 'ORDER NOW — SHIPS ' + (today ? 'TODAY' : next);
        this.querySelector('[data-go-proof-dispatch]').textContent = 'Ships ' + (today ? 'Today' : next === 'MONDAY' ? 'Monday' : 'Tomorrow');
      };
      this.tick();
      this.timer = setInterval(this.tick, 30000);
      this.scrollHandler = () => {
        const primary = this.querySelector('[data-go-cta]').getBoundingClientRect();
        const recap = this.querySelector('[data-d2-recap-cta]').getBoundingClientRect();
        this.querySelector('[data-d2-sticky]').hidden = primary.bottom >= 0 || (recap.top < innerHeight && recap.bottom > 0);
      };
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      window.addEventListener('resize', this.scrollHandler);
      this.sync();
      this.scrollHandler();
    }
    disconnectedCallback() {
      clearInterval(this.timer);
      window.removeEventListener('scroll', this.scrollHandler);
      window.removeEventListener('resize', this.scrollHandler);
      this.initialized = false;
    }
    sync() {
      this.key = this.inputs.find(input => input.checked)?.value || '3';
      this.offer = OFFERS[this.key];
      this.variant = this.variants.find(v => v.title === this.offer.title && v.available && v.price === this.offer.cents);
      const id = this.querySelector('[data-go-id]');
      id.value = this.variant?.id || '';
      id.disabled = !this.variant;
      this.form.dataset.buyable = String(Boolean(this.variant));
      this.buttons.forEach(button => { button.disabled = Boolean(this.pending); });
      const button = this.querySelector('[data-go-cta]');
      button.replaceChildren(Object.assign(document.createElement('span'), { textContent: this.offer.cta }), Object.assign(document.createElement('span'), { textContent: ' • ' + money(this.offer.cents) }));
      const set = (selector, text) => this.querySelectorAll(selector).forEach(node => { node.textContent = text; });
      set('[data-d2-recap-label], [data-d2-sticky-label]', this.offer.label);
      set('[data-d2-recap-total], [data-d2-sticky-total]', money(this.offer.cents));
      set('[data-d2-recap-cta]', this.offer.cta + ' • ' + money(this.offer.cents));
      set('.stickybar__btn', this.offer.cta);
      this.message.hidden = true;
    }
    async add() {
      if (this.pending) return;
      if (!this.variant) {
        this.message.textContent = 'This bundle is not available at the displayed price yet. Please choose another option.';
        this.message.hidden = false;
        return;
      }
      this.pending = true;
      this.buttons.forEach(button => { button.disabled = true; });
      this.inputs.forEach(input => { input.disabled = true; });
      this.form.setAttribute('aria-busy', 'true');
      try {
        // Refresh server price and stock before adding; theme prices are not checkout prices.
        const fresh = await fetch(location.pathname + '.js');
        if (!fresh.ok) throw new Error('Product refresh failed: ' + fresh.status);
        const product = await fresh.json();
        const variant = product.variants.find(v => v.id === this.variant.id);
        if (!variant?.available || variant.price !== this.offer.cents) throw new Error('Selected offer price or availability changed');
        const response = await fetch(this.form.action.replace(/\/add\/?$/, '/add.js'), {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: variant.id, quantity: 1 }] })
        });
        if (!response.ok) throw new Error('Cart add failed: ' + response.status);
        await response.json();
        document.dispatchEvent(new CustomEvent('d2:cart-open'));
      } catch (error) {
        console.error('Dandy gummy add to cart failed', error);
        this.message.textContent = 'We couldn’t add this bundle. Please refresh and try again.';
        this.message.hidden = false;
      } finally {
        this.pending = false;
        this.buttons.forEach(button => { button.disabled = false; });
        this.inputs.forEach(input => { input.disabled = false; });
        this.form.removeAttribute('aria-busy');
      }
    }
  }
  if (!customElements.get('dandy-gummy-offer')) customElements.define('dandy-gummy-offer', GummyOffer);
})();
