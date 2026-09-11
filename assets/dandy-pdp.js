const eventsReady = import('@shopify/events')
  .then((module) => module.StandardEvents)
  .catch(() => null);

function onProductSelect(element, update) {
  const target = element.closest('.shopify-section, dialog');
  if (!target) return () => {};

  let eventName = null;
  let active = true;

  const handler = (event) => {
    if (!(event.target instanceof Element) || event.target.closest('product-card')) return;
    event.promise
      ?.then(({ detail }) => {
        if (detail?.html) update(detail.html);
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') console.warn('[dandy] product select failed:', error);
      });
  };

  eventsReady.then((events) => {
    if (!active || !events?.productSelect) return;
    eventName = events.productSelect;
    target.addEventListener(eventName, handler);
  });

  return () => {
    active = false;
    if (eventName) target.removeEventListener(eventName, handler);
  };
}

class DandyPurchaseOptions extends HTMLElement {
  #cleanup = () => {};

  connectedCallback() {
    this.addEventListener('change', this.#sync);
    this.addEventListener('click', this.#onCardClick);

    const restore = this.dataset.restoreSelection;
    if (restore !== undefined) {
      const radio = this.#radios().find((r) => r.value === restore);
      if (radio) radio.checked = true;
      delete this.dataset.restoreSelection;
    }
    this.#sync();

    this.#cleanup = onProductSelect(this, (html) => {
      const next = html.querySelector(`dandy-purchase-options[data-dandy-block="${this.dataset.dandyBlock}"]`);
      if (!(next instanceof HTMLElement)) return;
      next.dataset.restoreSelection = this.#radios().find((r) => r.checked)?.value ?? '';
      this.replaceWith(document.importNode(next, true));
    });
  }

  disconnectedCallback() {
    this.#cleanup();
  }

  #radios() {
    return [...this.querySelectorAll('.dandy-plan__input')];
  }

  #onCardClick = (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest('input, label, a, button')) return;
    const radio = target.closest('[data-plan-card]')?.querySelector('.dandy-plan__input');
    if (radio instanceof HTMLInputElement && !radio.checked) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  #sync = () => {
    const input = this.querySelector('[data-selling-plan-input]');
    const checked = this.#radios().find((r) => r.checked);
    const value = checked?.value ?? '';

    if (input instanceof HTMLInputElement) {
      input.value = value;
      input.disabled = value === '';
    }
    this.querySelectorAll('[data-plan-card]').forEach((card) => {
      card.toggleAttribute('data-selected', Boolean(checked) && card.contains(checked));
    });
    this.dispatchEvent(
      new CustomEvent('dandy:selling-plan-change', { bubbles: true, detail: { sellingPlanId: value || null } })
    );
  };
}

class DandyDeliveryEstimate extends HTMLElement {
  #cleanup = () => {};

  connectedCallback() {
    this.#render();
    this.#cleanup = onProductSelect(this, (html) => {
      const next = html.querySelector(`dandy-delivery-estimate[data-dandy-block="${this.dataset.dandyBlock}"]`);
      if (next instanceof HTMLElement) this.replaceWith(document.importNode(next, true));
    });
  }

  disconnectedCallback() {
    this.#cleanup();
  }

  #render() {
    const output = this.querySelector('[data-delivery-date]');
    if (!output) return;

    const days = Math.max(0, Number(this.dataset.businessDays) || 0);
    const skipWeekends = this.dataset.skipWeekends === 'true';
    const date = new Date();
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (skipWeekends && (day === 0 || day === 6)) continue;
      added += 1;
    }

    const formats = {
      short: { weekday: 'long', month: 'short', day: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric' },
      month_day: { month: 'long', day: 'numeric' },
    };
    const format = formats[this.dataset.dateFormat] || formats.short;

    try {
      output.textContent = new Intl.DateTimeFormat(this.dataset.locale || undefined, format).format(date);
    } catch {
      output.textContent = new Intl.DateTimeFormat(undefined, format).format(date);
    }
  }
}

if (!customElements.get('dandy-purchase-options')) customElements.define('dandy-purchase-options', DandyPurchaseOptions);
if (!customElements.get('dandy-delivery-estimate')) customElements.define('dandy-delivery-estimate', DandyDeliveryEstimate);