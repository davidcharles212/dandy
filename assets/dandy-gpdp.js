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

// Same-day cutoff state. Pure so QA can call it with any instant: window.DandyDelivery.cutoffState(date, 14, 'America/Chicago').
// A 'today': Monday to Saturday before the cutoff. B 'tomorrow': Monday to Friday from the cutoff. C 'monday': Saturday from the cutoff and all Sunday.
function cutoffState(now, cutoffHour, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const weekday = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[get('weekday')] ?? 1;
  const minutes = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
  const cutoff = cutoffHour * 60;
  const remaining = Math.max(0, cutoff - minutes);
  let state = 'monday';
  if (weekday <= 6 && minutes < cutoff) state = 'today';
  else if (weekday <= 5) state = 'tomorrow';
  const h = Math.floor(remaining / 60);
  const m = remaining % 60;
  const countdown = (h > 0 ? `${h} hr${h === 1 ? '' : 's'} ` : '') + `${m} min${m === 1 ? '' : 's'}`;
  return { state, remaining, countdown, weekday, minutes };
}

function cutoffMarkup(template, countdown) {
  const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const clause = (text) =>
    text
      .split('*')
      .map((part, i) => {
        const piece = escape(part).replace('[countdown]', `<span class="dandy-delivery__countdown" data-cutoff-countdown>${escape(countdown)}</span>`);
        return i % 2 === 1 ? `<strong>${piece}</strong>` : piece;
      })
      .join('');
  const clauses = template.split(': ');
  return clauses.map((c, i) => `<span class="dandy-delivery__clause">${clause(c)}${i < clauses.length - 1 ? ':' : ''}</span>`).join(' ');
}

class DandyDeliveryEstimate extends HTMLElement {
  #cleanup = () => {};
  #timer = 0;

  connectedCallback() {
    this.#render();
    this.#cleanup = onProductSelect(this, (html) => {
      const next = html.querySelector(`dandy-delivery-estimate[data-dandy-block="${this.dataset.dandyBlock}"]`);
      if (next instanceof HTMLElement) this.replaceWith(document.importNode(next, true));
    });
  }

  disconnectedCallback() {
    this.#cleanup();
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = 0;
  }

  #render() {
    if (this.dataset.mode === 'cutoff') {
      this.#renderCutoff();
      if (!this.#timer) this.#timer = setInterval(() => this.#renderCutoff(), 15000);
      return;
    }
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

  #renderCutoff() {
    const line = this.querySelector('[data-cutoff-line]');
    if (!line) return;
    let result;
    try {
      result = cutoffState(new Date(), Number(this.dataset.cutoffHour) || 14, this.dataset.cutoffTimezone || 'America/Chicago');
    } catch (error) {
      console.warn('[dandy] delivery cutoff could not resolve store time; keeping the server-rendered line:', error);
      return;
    }
    const templates = { today: this.dataset.cutoffToday, tomorrow: this.dataset.cutoffTomorrow, monday: this.dataset.cutoffMonday };
    const template = templates[result.state] || '';
    if (line.dataset.cutoffState === result.state) {
      const countdown = line.querySelector('[data-cutoff-countdown]');
      if (countdown) countdown.textContent = result.countdown;
      return;
    }
    line.dataset.cutoffState = result.state;
    line.innerHTML = cutoffMarkup(template, result.countdown);
  }
}

window.DandyDelivery = { cutoffState, cutoffMarkup };

if (!customElements.get('dandy-purchase-options')) customElements.define('dandy-purchase-options', DandyPurchaseOptions);
if (!customElements.get('dandy-delivery-estimate')) customElements.define('dandy-delivery-estimate', DandyDeliveryEstimate);