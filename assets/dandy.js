const emitDandyEvent = (name, detail = {}) => {
  document.dispatchEvent(new CustomEvent(`dandy:${name}`, { bubbles: true, detail }));
};

class DandyGallery extends HTMLElement {
  connectedCallback() {
    this.buttons = [...this.querySelectorAll('[data-gallery-target]')];
    this.slides = [...this.querySelectorAll('[data-gallery-slide]')];
    this.buttons.forEach((button) => {
      button.addEventListener('click', () => this.activate(button.dataset.galleryTarget));
    });
  }

  activate(target) {
    this.slides.forEach((slide) => { slide.hidden = slide.dataset.gallerySlide !== target; });
    this.buttons.forEach((button) => {
      button.setAttribute('aria-current', String(button.dataset.galleryTarget === target));
    });
    emitDandyEvent('media_select', { target });
  }
}

class DandyPurchase extends HTMLElement {
  connectedCallback() {
    this.previewMode = this.dataset.previewMode === 'true';
    this.purchaseInputs = [...this.querySelectorAll('[data-purchase-type]')];
    this.offerInputs = [...this.querySelectorAll('[data-offer-option]')];
    this.quantityInputs = [...this.querySelectorAll('[data-quantity-option]')];
    this.sizeInputs = [...this.querySelectorAll('[data-size-option]')];
    this.planInputs = [...this.querySelectorAll('[data-selling-plan]')];
    this.offerPanels = [...this.querySelectorAll('[data-offer-panel]')];
    this.quantityInput = this.querySelector('[data-form-quantity]');
    this.planInput = this.querySelector('[data-form-selling-plan]');
    this.variantInput = this.querySelector('[data-form-variant]');
    this.variantSelect = this.querySelector('[data-variant-select]');
    this.summaryLabel = this.querySelector('[data-selection-summary-label]');
    this.summaryPrice = this.querySelector('[data-selection-price]');
    this.primaryButton = this.querySelector('[data-primary-submit]');
    this.primaryButtonText = this.querySelector('[data-primary-submit-text]');
    this.previewNotice = this.querySelector('[data-preview-notice]');
    this.sticky = this.querySelector('[data-sticky-purchase]');
    this.stickyButton = this.querySelector('[data-sticky-submit]');
    this.stickyLabel = this.querySelector('[data-sticky-label]');
    this.stickyPrice = this.querySelector('[data-sticky-price]');
    this.formArea = this.querySelector('.dandy-buybox__form-area');
    this.subscriptionToggle = this.querySelector('[data-subscription-toggle]');
    this.subscriptionPanel = this.querySelector('[data-subscription-panel]');
    this.subscriptionMode = this.querySelector('[data-subscription-mode]');
    this.subscriptionPrice = this.querySelector('[data-subscription-price]');
    this.subscriptionMulti = this.querySelector('[data-subscription-multi]');
    this.subscriptionUnavailable = this.querySelector('[data-subscription-unavailable]');
    this.unifiedPreview = this.previewMode && Boolean(this.subscriptionToggle);

    if (this.unifiedPreview) {
      this.subscriptionPreference = this.subscriptionToggle.checked;
      this.sizeInputs.forEach((input) => input.addEventListener('change', () => {
        if (input.value === '10') {
          this.subscriptionPreference = this.subscriptionToggle.checked;
          this.subscriptionToggle.checked = false;
        } else {
          this.subscriptionToggle.checked = this.subscriptionPreference;
        }
        this.syncUnifiedPreview();
        emitDandyEvent('variant_select', { count: Number(input.value), preview: true });
      }));
      this.subscriptionToggle.addEventListener('change', () => {
        this.subscriptionPreference = this.subscriptionToggle.checked;
        this.syncUnifiedPreview();
        emitDandyEvent('selling_plan_select', { purchaseType: this.selectedPurchaseType(), preview: true });
      });
      this.quantityInputs.forEach((input) => input.addEventListener('change', () => {
        this.syncUnifiedPreview();
        emitDandyEvent('quantity_select', { quantity: Number(input.value) });
      }));
    } else {
      this.purchaseInputs.forEach((input) => input.addEventListener('change', () => {
        this.syncPurchaseType(input.value);
        emitDandyEvent('selling_plan_select', { purchaseType: input.value });
      }));

      this.offerInputs.forEach((input) => input.addEventListener('change', () => {
        const purchaseType = input.dataset.offerPurchase;
        if (purchaseType) {
          const purchaseInput = this.purchaseInputs.find((candidate) => candidate.value === purchaseType);
          if (purchaseInput) purchaseInput.checked = true;
        }
        this.sync();
        if (input.matches('[data-quantity-option]')) {
          emitDandyEvent('quantity_select', { quantity: Number(input.value) });
        }
        if (input.matches('[data-selling-plan]')) {
          emitDandyEvent('selling_plan_select', { sellingPlanId: input.value });
        }
      }));
    }

    this.variantSelect?.addEventListener('change', () => this.syncVariant());
    this.primaryButton?.addEventListener('click', (event) => this.handlePrimaryClick(event));
    this.stickyButton?.addEventListener('click', () => this.handleStickyClick());
    if (this.unifiedPreview) this.syncUnifiedPreview();
    else this.syncPurchaseType(this.selectedPurchaseType());
    this.setupStickyObserver();
  }

  selectedPurchaseType() {
    if (this.unifiedPreview) {
      const size = this.sizeInputs.find((input) => input.checked)?.value;
      const quantity = Number(this.quantityInputs.find((input) => input.checked)?.value || 1);
      return size === '30' && quantity === 1 && this.subscriptionToggle.checked ? 'subscription' : 'one-time';
    }
    return this.purchaseInputs.find((input) => input.checked)?.value || 'one-time';
  }

  syncUnifiedPreview() {
    const size = this.sizeInputs.find((input) => input.checked)?.value || '30';
    const selectedQuantity = this.quantityInputs.find((input) => input.checked) || this.quantityInputs[0];
    const quantity = Number(selectedQuantity?.value || 1);
    // Subscription applies to the single-pouch 30-count rung only; multi-pouch packs are one-time.
    const toggleAvailable = size === '30';
    const subscribed = toggleAvailable && quantity === 1 && this.subscriptionToggle.checked;
    const multiSelected = toggleAvailable && quantity > 1;

    this.subscriptionToggle.disabled = !toggleAvailable;
    this.subscriptionPanel?.setAttribute('data-subscription-active', String(subscribed));
    this.subscriptionPanel?.toggleAttribute('data-subscription-unavailable-state', !toggleAvailable);
    if (this.subscriptionUnavailable) this.subscriptionUnavailable.hidden = toggleAvailable;
    if (this.subscriptionMulti) this.subscriptionMulti.hidden = !multiSelected;
    if (this.subscriptionMode) {
      this.subscriptionMode.textContent = !toggleAvailable
        ? 'Available with the 30-count pouch'
        : multiSelected
          ? 'Applies to the single-pouch option'
          : subscribed ? '$47.99 today · renews at $47.99 every 30 days' : 'Turn on to save every 30 days';
    }

    this.quantityInputs.forEach((input) => {
      const card = input.closest('.dandy-offer-card');
      const cardQuantity = Number(input.value);
      const cardMode = subscribed && cardQuantity === 1 ? 'sub' : 'one';
      const price = input.getAttribute(`data-${cardMode}-${size}-price`) || input.getAttribute(`data-one-${size}-price`) || '';
      const unit = input.getAttribute(`data-${cardMode}-${size}-unit`) || input.getAttribute(`data-one-${size}-unit`) || '';
      // Anchors are one-time-vs-one-time only, sourced from their own attributes.
      const compareValue = input.getAttribute(`data-one-${size}-compare`) || '';
      const compare = card?.querySelector('[data-offer-compare]');
      const priceNode = card?.querySelector('[data-offer-price]');
      const unitNode = card?.querySelector('[data-offer-unit]');
      const countNode = card?.querySelector('[data-offer-count]');
      if (compare) {
        compare.textContent = compareValue;
        compare.hidden = compareValue === '';
      }
      if (priceNode) priceNode.textContent = price;
      if (unitNode) unitNode.textContent = unit;
      if (countNode) countNode.textContent = `${cardQuantity * Number(size)} gummies`;
    });

    const mode = subscribed ? 'sub' : 'one';
    const price = selectedQuantity?.getAttribute(`data-${mode}-${size}-price`) || selectedQuantity?.getAttribute(`data-one-${size}-price`) || '';
    const pouchWord = quantity === 1 ? 'pouch' : 'pouches';
    const label = `${quantity} ${pouchWord} · ${size}-count · ${subscribed ? 'subscription' : 'one-time'}`;
    const ctaVerb = subscribed ? 'SUBSCRIBE' : 'ADD TO CART';

    if (this.quantityInput) this.quantityInput.value = String(quantity);
    if (this.summaryLabel) this.summaryLabel.textContent = label;
    if (this.summaryPrice) this.summaryPrice.textContent = price;
    if (this.stickyLabel) this.stickyLabel.textContent = `Mixed Berry · ${size}-count · ${quantity} ${pouchWord}`;
    if (this.stickyPrice) this.stickyPrice.textContent = price;
    if (this.primaryButtonText) this.primaryButtonText.textContent = `${ctaVerb} — ${price}`;
    if (this.subscriptionPrice) this.subscriptionPrice.textContent = toggleAvailable ? '$47.99' : '30-count only';
  }

  selectedOffer() {
    const purchaseType = this.selectedPurchaseType();
    const panel = this.offerPanels.find((candidate) => candidate.dataset.offerPanel === purchaseType);
    return panel?.querySelector('[data-offer-option]:checked') || panel?.querySelector('[data-offer-option]');
  }

  syncPurchaseType(type) {
    this.offerPanels.forEach((panel) => { panel.hidden = panel.dataset.offerPanel !== type; });
    this.sync();
  }

  sync() {
    const purchaseType = this.selectedPurchaseType();
    const offer = this.selectedOffer();
    const quantity = purchaseType === 'one-time' ? offer?.value || '1' : '1';

    if (this.quantityInput) this.quantityInput.value = quantity;
    if (this.planInput) {
      const plan = purchaseType === 'subscription' ? offer : null;
      this.planInput.disabled = !plan;
      this.planInput.value = plan?.value || '';
    }

    const label = offer?.dataset.selectionLabel || '1 pack';
    const price = offer?.dataset.priceLabel || '';
    const cta = offer?.dataset.ctaLabel || 'ADD TO CART';
    if (this.summaryLabel) this.summaryLabel.textContent = label;
    if (this.summaryPrice) this.summaryPrice.textContent = price;
    if (this.stickyPrice) this.stickyPrice.textContent = price;
    if (this.primaryButtonText && this.primaryButton?.dataset.canAdd === 'true') this.primaryButtonText.textContent = cta;
  }

  syncVariant() {
    const option = this.variantSelect?.selectedOptions[0];
    if (!option || !this.variantInput) return;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('variant', option.value);
    emitDandyEvent('variant_select', { variantId: option.value });
    window.location.assign(nextUrl);
  }

  handlePrimaryClick(event) {
    emitDandyEvent('add_to_cart_intent', this.selectionDetail());
    if (!this.previewMode) return;
    event.preventDefault();
    if (!this.previewNotice) return;
    this.previewNotice.hidden = false;
    this.previewNotice.focus({ preventScroll: true });
    emitDandyEvent('preview_offer_intent', this.selectionDetail());
  }

  handleStickyClick() {
    this.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => this.primaryButton?.focus({ preventScroll: true }), 450);
  }

  setupStickyObserver() {
    if (!this.formArea || !this.sticky) return;
    this.updateStickyVisibility = () => {
      const hasPassed = this.formArea.getBoundingClientRect().bottom < 0;
      this.sticky.toggleAttribute('data-visible', hasPassed);
    };
    this.stickyScrollTargets = [...new Set([
      window,
      document,
      document.scrollingElement,
      document.querySelector('.page-wrapper'),
    ].filter(Boolean))];
    this.stickyScrollTargets.forEach((target) => {
      target.addEventListener('scroll', this.updateStickyVisibility, { passive: true });
    });
    if ('IntersectionObserver' in window) {
      this.stickyObserver = new IntersectionObserver(() => this.updateStickyVisibility(), { threshold: 0 });
      this.stickyObserver.observe(this.formArea);
    }
    this.updateStickyVisibility();
    this.stickyInitialFrame = requestAnimationFrame(() => this.updateStickyVisibility());
    this.stickyInitialTimer = window.setTimeout(() => this.updateStickyVisibility(), 350);
  }

  selectionDetail() {
    return {
      productId: this.dataset.productId,
      variantId: this.variantInput?.value || null,
      purchaseType: this.selectedPurchaseType(),
      quantity: Number(this.quantityInput?.value || 1),
      count: Number(this.sizeInputs.find((input) => input.checked)?.value || 0) || null,
      sellingPlanId: this.planInput?.disabled ? null : this.planInput?.value,
      preview: this.previewMode,
    };
  }

  disconnectedCallback() {
    this.stickyObserver?.disconnect();
    this.stickyScrollTargets?.forEach((target) => {
      target.removeEventListener('scroll', this.updateStickyVisibility);
    });
    cancelAnimationFrame(this.stickyInitialFrame);
    window.clearTimeout(this.stickyInitialTimer);
  }
}

class DandyHeader extends HTMLElement {
  connectedCallback() {
    this.menu = this.querySelector('details');
    this.boundOutsideClick = (event) => {
      if (this.menu?.open && !this.menu.contains(event.target)) this.menu.removeAttribute('open');
    };
    this.boundEscape = (event) => {
      if (event.key !== 'Escape' || !this.menu?.open) return;
      this.menu.removeAttribute('open');
      this.menu.querySelector('summary')?.focus();
    };
    document.addEventListener('pointerdown', this.boundOutsideClick);
    document.addEventListener('keydown', this.boundEscape);
    this.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => this.menu?.removeAttribute('open')));
  }

  disconnectedCallback() {
    document.removeEventListener('pointerdown', this.boundOutsideClick);
    document.removeEventListener('keydown', this.boundEscape);
  }
}

class DandyFaq extends HTMLElement {
  connectedCallback() {
    this.querySelectorAll('details').forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) emitDandyEvent('faq_engagement', { question: item.querySelector('summary')?.textContent?.trim() });
      });
    });
  }
}

class DandyVirtualRouter extends HTMLElement {
  connectedCallback() {
    const path = window.location.pathname.toLowerCase();
    const routes = new Map([
      ['/learn', 'learn'],
      ['/what-is-kratom', 'learn'],
      ['/pages/what-is-kratom', 'learn'],
      ['/coa', 'coa'],
      ['/quality', 'coa'],
      ['/pages/quality-and-testing', 'coa'],
      ['/pages/batch-reports', 'coa'],
      ['/faq', 'faq'],
      ['/pages/faq', 'faq'],
      ['/about', 'about'],
      ['/pages/about-dandy', 'about'],
    ]);
    const route = routes.get(path);
    const page = route ? this.querySelector(`[data-virtual-page="${route}"]`) : null;
    const fallback = this.querySelector('[data-virtual-fallback]');
    if (page) {
      page.hidden = false;
      if (fallback) fallback.hidden = true;
      const title = page.dataset.pageTitle;
      if (title) document.title = `${title} – ForeverDandy - Production`;
      const description = document.querySelector('meta[name="description"]');
      if (description && page.dataset.pageDescription) description.content = page.dataset.pageDescription;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = `${window.location.origin}${window.location.pathname}`;
    }
    this.dataset.ready = 'true';
  }
}

/* FAQ groups behave as an accordion: opening one question closes the rest of its
   group, and both directions animate. Covers the dandy2 `.faq` groups and the
   legacy `.dandy-faq-list` groups, which share the details/summary shape.
   The `toggle` listeners elsewhere keep firing, so faq_engagement is unaffected. */
const FAQ_GROUP_SELECTOR = '.faq, .dandy-faq-list';
const FAQ_DURATION = 260;
const FAQ_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

const faqAnimations = new WeakMap();
const wiredFaqGroups = new WeakSet();

const faqReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animateFaqItem = (item, from, to, onFinish) => {
  faqAnimations.get(item)?.cancel();
  faqAnimations.delete(item);

  if (faqReducedMotion() || typeof item.animate !== 'function') {
    onFinish?.();
    return;
  }

  // border-box keeps the measured offsetHeight and the animated height the same
  item.style.overflow = 'hidden';
  item.style.boxSizing = 'border-box';

  const animation = item.animate(
    { height: [`${from}px`, `${to}px`] },
    { duration: FAQ_DURATION, easing: FAQ_EASING }
  );
  faqAnimations.set(item, animation);

  const reset = () => {
    item.style.overflow = '';
    item.style.boxSizing = '';
    faqAnimations.delete(item);
  };
  animation.addEventListener('finish', () => { reset(); onFinish?.(); });
  animation.addEventListener('cancel', reset);
};

/* The animated height is border-box, so both ends need the item's own frame added
   back: offsetHeight of the summary carries neither the details' padding nor its
   border, and scrollHeight carries the padding but not the border. Without this the
   animation lands a few pixels short and snaps on the last frame. */
const faqFrame = (item) => {
  const styles = window.getComputedStyle(item);
  const border = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
  const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
  return { border, padding };
};

const collapseFaqItem = (item) => {
  if (!item.open) return;
  const summary = item.querySelector('summary');
  const { border, padding } = faqFrame(item);
  const collapsed = (summary ? summary.offsetHeight : 0) + border + padding;
  animateFaqItem(item, item.offsetHeight, collapsed, () => {
    item.open = false;
  });
};

const expandFaqItem = (item) => {
  if (item.open) return;
  const start = item.offsetHeight;
  item.open = true;
  animateFaqItem(item, start, item.scrollHeight + faqFrame(item).border);
};

const wireFaqGroup = (group) => {
  if (wiredFaqGroups.has(group) || !group.querySelector('details')) return;
  wiredFaqGroups.add(group);

  group.addEventListener('click', (event) => {
    const summary = event.target.closest('summary');
    if (!summary) return;

    const item = summary.closest('details');
    // ignore nested groups: each group only drives its own questions
    if (!item || item.closest(FAQ_GROUP_SELECTOR) !== group) return;

    event.preventDefault();
    if (item.open) {
      collapseFaqItem(item);
      return;
    }
    group.querySelectorAll('details[open]').forEach((other) => {
      if (other !== item) collapseFaqItem(other);
    });
    expandFaqItem(item);
  });
};

const wireFaqGroups = (root = document) => {
  root.querySelectorAll?.(FAQ_GROUP_SELECTOR).forEach(wireFaqGroup);
};

wireFaqGroups();
document.addEventListener('shopify:section:load', (event) => wireFaqGroups(event.target));

if (!customElements.get('dandy-gallery')) customElements.define('dandy-gallery', DandyGallery);
if (!customElements.get('dandy-purchase')) customElements.define('dandy-purchase', DandyPurchase);
if (!customElements.get('dandy-header')) customElements.define('dandy-header', DandyHeader);
if (!customElements.get('dandy-faq')) customElements.define('dandy-faq', DandyFaq);
if (!customElements.get('dandy-virtual-router')) customElements.define('dandy-virtual-router', DandyVirtualRouter);
