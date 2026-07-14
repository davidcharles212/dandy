/* ==========================================================================
   Dandy — shared script
   Ollie Botanical Group LLC
   Handles: age gate, mobile nav, cart (localStorage), product pages,
   cart page, checkout (with restricted-state enforcement), contact form,
   and the lab-results batch lookup.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Product catalog
     ------------------------------------------------------------------ */

  /* Subscription pricing: 20% off retail, free shipping on every delivery. */
  var SUB_DISCOUNT = 0.2;
  var SHIPPING_FLAT = 5.95;
  var FREE_SHIPPING_MIN = 50;

  var PRODUCTS = {
    gummies: {
      name: "Mixed Berry Kratom Gummies",
      strength: "35mg mitragynine per gummy",
      url: "product-gummies.html",
      subscribable: true,
      variants: [
        { id: "gummies-10", label: "10-count", price: 28.99, subPrice: 23.19 },
        { id: "gummies-30", label: "30-count", price: 64.99, subPrice: 51.99 }
      ]
    },
    powder: {
      name: "Kratom Leaf Powder",
      strength: "Finely ground raw leaf",
      url: "product-powder.html",
      variants: [
        { id: "powder-100", label: "100g", price: 12.99 },
        { id: "powder-250", label: "250g", price: 24.99 }
      ]
    }
  };

  /* States where Dandy does not ship (current as of July 2026). */
  var RESTRICTED_STATES = {
    AL: "Alabama",
    AR: "Arkansas",
    CA: "California",
    CT: "Connecticut",
    IN: "Indiana",
    KS: "Kansas",
    LA: "Louisiana",
    TN: "Tennessee",
    VT: "Vermont",
    WI: "Wisconsin",
    DC: "Washington, D.C."
  };

  var CART_KEY = "dandy_cart_v1";
  var AGE_KEY = "dandy_age_verified";

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */

  function formatPrice(n) {
    return "$" + n.toFixed(2);
  }

  function findVariant(variantId) {
    var keys = Object.keys(PRODUCTS);
    for (var i = 0; i < keys.length; i++) {
      var product = PRODUCTS[keys[i]];
      for (var j = 0; j < product.variants.length; j++) {
        if (product.variants[j].id === variantId) {
          return { productKey: keys[i], product: product, variant: product.variants[j] };
        }
      }
    }
    return null;
  }

  /* ------------------------------------------------------------------
     Cart storage
     ------------------------------------------------------------------ */

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart.filter(function (item) {
        return item && findVariant(item.variantId) && item.qty > 0;
      }).map(function (item) {
        item.sub = !!item.sub;
        return item;
      }) : [];
    } catch (e) {
      return [];
    }
  }

  function itemPrice(item) {
    var found = findVariant(item.variantId);
    if (!found) return 0;
    return item.sub && found.variant.subPrice ? found.variant.subPrice : found.variant.price;
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* localStorage unavailable (private mode); cart lives in memory only */
    }
    updateCartCount();
  }

  function addToCart(variantId, qty, sub) {
    var cart = getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].variantId === variantId && cart[i].sub === !!sub) existing = cart[i];
    }
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ variantId: variantId, qty: qty, sub: !!sub });
    }
    saveCart(cart);
  }

  function lineKey(item) {
    return item.variantId + (item.sub ? ":sub" : "");
  }

  function setQty(key, qty) {
    var cart = getCart();
    var next = [];
    for (var i = 0; i < cart.length; i++) {
      if (lineKey(cart[i]) === key) {
        if (qty > 0) {
          cart[i].qty = qty;
          next.push(cart[i]);
        }
      } else {
        next.push(cart[i]);
      }
    }
    saveCart(next);
  }

  function cartCount() {
    return getCart().reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function cartSubtotal() {
    return getCart().reduce(function (sum, item) {
      return sum + itemPrice(item) * item.qty;
    }, 0);
  }

  /* Subscriptions always ship free; one-time portions ship free at $50+. */
  function cartShipping() {
    var oneTime = getCart().reduce(function (sum, item) {
      return item.sub ? sum : sum + itemPrice(item) * item.qty;
    }, 0);
    if (oneTime === 0 || oneTime >= FREE_SHIPPING_MIN) return 0;
    return SHIPPING_FLAT;
  }

  function updateCartCount() {
    var count = cartCount();
    var nodes = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = String(count);
    }
  }

  /* ------------------------------------------------------------------
     Age gate
     ------------------------------------------------------------------ */

  function initAgeGate() {
    var verified = null;
    try {
      verified = localStorage.getItem(AGE_KEY);
    } catch (e) {
      /* fall through: show the gate each visit */
    }
    if (verified === "yes") return;

    var overlay = document.createElement("div");
    overlay.className = "age-gate-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "age-gate-title");
    overlay.innerHTML =
      '<div class="age-gate-modal">' +
      '<h2 id="age-gate-title">Are you 21 or older?</h2>' +
      "<p>You must be 21 or older to enter this site. Please confirm your age.</p>" +
      '<div class="age-gate-actions">' +
      '<button type="button" class="btn" data-age-yes>Yes, I am 21+</button>' +
      '<button type="button" class="btn btn--outline" data-age-no>No</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(overlay);
    document.body.classList.add("age-gate-locked");
    overlay.querySelector("[data-age-yes]").focus();

    overlay.querySelector("[data-age-yes]").addEventListener("click", function () {
      try {
        localStorage.setItem(AGE_KEY, "yes");
      } catch (e) {
        /* ignore */
      }
      overlay.remove();
      document.body.classList.remove("age-gate-locked");
    });

    overlay.querySelector("[data-age-no]").addEventListener("click", function () {
      overlay.querySelector(".age-gate-modal").innerHTML =
        '<h2 id="age-gate-title">Sorry, you can’t come in</h2>' +
        "<p>This site sells products intended only for adults 21 and older. " +
        "Please come back when you’re of age.</p>" +
        '<a class="btn" href="https://www.google.com">Leave this site</a>';
    });
  }

  /* ------------------------------------------------------------------
     Mobile nav
     ------------------------------------------------------------------ */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ------------------------------------------------------------------
     Product detail page
     ------------------------------------------------------------------ */

  function initProductPage() {
    var form = document.querySelector("[data-product-form]");
    if (!form) return;

    var productKey = form.getAttribute("data-product-form");
    var product = PRODUCTS[productKey];
    if (!product) return;

    var priceEl = document.querySelector("[data-product-price]");
    var confirmEl = document.querySelector("[data-add-confirm]");

    function selectedVariant() {
      var checked = form.querySelector('input[name="variant"]:checked');
      return checked ? findVariant(checked.value) : null;
    }

    function isSubscription() {
      var checked = form.querySelector('input[name="purchase-type"]:checked');
      return !!(checked && checked.value === "subscribe");
    }

    function refreshPrice() {
      var found = selectedVariant();
      if (!found) return;
      var sub = isSubscription() && found.variant.subPrice;
      if (priceEl) {
        priceEl.textContent = sub
          ? formatPrice(found.variant.subPrice) + " / delivery"
          : formatPrice(found.variant.price);
      }
      var oneTimeEl = form.querySelector("[data-price-onetime]");
      var subPriceEl = form.querySelector("[data-price-sub]");
      if (oneTimeEl) oneTimeEl.textContent = formatPrice(found.variant.price);
      if (subPriceEl && found.variant.subPrice) {
        subPriceEl.textContent = formatPrice(found.variant.subPrice) + " / delivery";
      }
    }

    var inputs = form.querySelectorAll('input[name="variant"], input[name="purchase-type"]');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("change", refreshPrice);
    }
    refreshPrice();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var found = selectedVariant();
      if (!found) return;
      var sub = isSubscription() && !!found.variant.subPrice;
      var qtyInput = form.querySelector('input[name="qty"]');
      var qty = Math.max(1, Math.min(20, parseInt(qtyInput && qtyInput.value, 10) || 1));
      addToCart(found.variant.id, qty, sub);
      if (confirmEl) {
        confirmEl.innerHTML = sub
          ? "Added " + qty + " × " + product.name + " (" + found.variant.label + ") as a subscription — " +
            "20% off, free shipping, delivered every 30 days, cancel anytime. " +
            '<a href="cart.html">View cart</a>'
          : "Added " + qty + " × " + product.name + " (" + found.variant.label + ") to your cart. " +
            '<a href="cart.html">View cart</a>';
        confirmEl.hidden = false;
      }
    });
  }

  /* ------------------------------------------------------------------
     Cart page
     ------------------------------------------------------------------ */

  function initCartPage() {
    var root = document.querySelector("[data-cart-root]");
    if (!root) return;

    function render() {
      var cart = getCart();

      if (cart.length === 0) {
        root.innerHTML =
          '<div class="cart-empty">' +
          "<p>Your cart is empty.</p>" +
          '<a class="btn" href="shop.html">Browse the shop</a>' +
          "</div>";
        return;
      }

      var rows = "";
      for (var i = 0; i < cart.length; i++) {
        var found = findVariant(cart[i].variantId);
        if (!found) continue;
        var key = lineKey(cart[i]);
        var domId = key.replace(":", "-");
        var price = itemPrice(cart[i]);
        var subNote = cart[i].sub
          ? '<span class="cart-sub-note">Subscribe &amp; Save · 20% off · free shipping · every 30 days · cancel anytime</span>'
          : "";
        rows +=
          "<tr>" +
          '<td><span class="cart-item-name"><a href="' + found.product.url + '">' + found.product.name + "</a></span><br>" +
          '<span class="cart-item-variant">' + found.variant.label + " · " + found.product.strength + "</span>" + subNote + "</td>" +
          "<td>" + formatPrice(price) + "</td>" +
          '<td><label class="visually-hidden" for="qty-' + domId + '">Quantity for ' + found.product.name + " " + found.variant.label + "</label>" +
          '<input class="cart-qty" id="qty-' + domId + '" type="number" min="0" max="20" value="' + cart[i].qty + '" data-qty="' + key + '"></td>' +
          "<td>" + formatPrice(price * cart[i].qty) + "</td>" +
          '<td><button type="button" class="link-btn" data-remove="' + key + '">Remove</button></td>' +
          "</tr>";
      }

      root.innerHTML =
        '<table class="cart-table">' +
        "<thead><tr><th scope=\"col\">Product</th><th scope=\"col\">Price</th><th scope=\"col\">Qty</th><th scope=\"col\">Total</th><th scope=\"col\"><span class=\"visually-hidden\">Remove</span></th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table>" +
        '<div class="cart-summary">' +
        '<p class="cart-subtotal">Subtotal: ' + formatPrice(cartSubtotal()) + "</p>" +
        "<p>Shipping and any applicable taxes are calculated at checkout.</p>" +
        '<a class="btn" href="checkout.html">Proceed to checkout</a>' +
        "</div>";

      var qtyInputs = root.querySelectorAll("[data-qty]");
      for (var q = 0; q < qtyInputs.length; q++) {
        qtyInputs[q].addEventListener("change", function () {
          var qty = Math.max(0, Math.min(20, parseInt(this.value, 10) || 0));
          setQty(this.getAttribute("data-qty"), qty);
          render();
        });
      }

      var removeBtns = root.querySelectorAll("[data-remove]");
      for (var r = 0; r < removeBtns.length; r++) {
        removeBtns[r].addEventListener("click", function () {
          setQty(this.getAttribute("data-remove"), 0);
          render();
        });
      }
    }

    render();
  }

  /* ------------------------------------------------------------------
     Checkout page
     ------------------------------------------------------------------ */

  function renderOrderSummary() {
    var summary = document.querySelector("[data-order-summary]");
    if (!summary) return;

    var cart = getCart();
    if (cart.length === 0) {
      summary.innerHTML =
        "<h2>Order summary</h2>" +
        '<p>Your cart is empty. <a href="shop.html">Browse the shop</a> to add products.</p>';
      var placeBtn = document.querySelector("[data-place-order]");
      if (placeBtn) placeBtn.disabled = true;
      return;
    }

    var lines = "";
    var hasSub = false;
    for (var i = 0; i < cart.length; i++) {
      var found = findVariant(cart[i].variantId);
      if (!found) continue;
      if (cart[i].sub) hasSub = true;
      var label = found.product.name + " (" + found.variant.label + ")" +
        (cart[i].sub ? " — Subscription" : "") + " × " + cart[i].qty;
      lines +=
        "<li><span>" + label + "</span>" +
        "<span>" + formatPrice(itemPrice(cart[i]) * cart[i].qty) + "</span></li>";
    }

    var shipping = cartShipping();
    summary.innerHTML =
      "<h2>Order summary</h2>" +
      '<ul class="summary-lines">' + lines + "</ul>" +
      '<ul class="summary-lines">' +
      "<li><span>Shipping</span><span>" + (shipping === 0 ? "FREE" : formatPrice(shipping)) + "</span></li>" +
      "</ul>" +
      '<div class="summary-total"><span>Order total</span><span>' +
      formatPrice(cartSubtotal() + shipping) +
      "</span></div>" +
      (hasSub
        ? '<p class="secure-note">Subscription items renew every 30 days at the same price with free shipping. Pause, skip, or cancel anytime.</p>'
        : "");
  }

  function initCheckoutPage() {
    var form = document.querySelector("[data-checkout-form]");
    if (!form) return;

    renderOrderSummary();

    var stateSelect = form.querySelector('select[name="state"]');
    var stateAlert = document.querySelector("[data-state-alert]");
    var errorAlert = document.querySelector("[data-checkout-error]");

    function restrictedName(code) {
      return Object.prototype.hasOwnProperty.call(RESTRICTED_STATES, code)
        ? RESTRICTED_STATES[code]
        : null;
    }

    if (stateSelect && stateAlert) {
      stateSelect.addEventListener("change", function () {
        var name = restrictedName(stateSelect.value);
        if (name) {
          stateAlert.textContent =
            "We’re sorry — Dandy cannot ship kratom products to " + name +
            ". Kratom is restricted in this jurisdiction, and orders shipping there cannot be placed. " +
            "See our Shipping Policy for the full list of restricted states.";
          stateAlert.hidden = false;
        } else {
          stateAlert.hidden = true;
        }
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (errorAlert) errorAlert.hidden = true;

      if (getCart().length === 0) {
        if (errorAlert) {
          errorAlert.textContent = "Your cart is empty. Add a product before placing an order.";
          errorAlert.hidden = false;
          errorAlert.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      /* Native validation for required fields / formats */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      /* Restricted-state enforcement */
      var name = restrictedName(stateSelect ? stateSelect.value : "");
      if (name) {
        if (errorAlert) {
          errorAlert.textContent =
            "We cannot complete this order: Dandy does not ship kratom products to " + name +
            ". Please see our Shipping Policy for the full list of restricted jurisdictions.";
          errorAlert.hidden = false;
          errorAlert.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      /* "Place" the order: clear cart, show confirmation */
      var hadSubscription = getCart().some(function (item) { return item.sub; });
      var orderNumber =
        "DND-" +
        new Date().getFullYear() +
        "-" +
        String(Math.floor(100000 + Math.random() * 900000));

      saveCart([]);

      var page = document.querySelector("[data-checkout-page]");
      if (page) {
        page.innerHTML =
          '<div class="order-confirmation">' +
          "<h1>Thank you — your order is confirmed</h1>" +
          '<p class="order-number">Order ' + orderNumber + "</p>" +
          "<p>We’ve received your order and sent a confirmation to the email address you provided. " +
          "Orders placed before 2pm CT ship the same business day; otherwise they ship the next business day. " +
          "You’ll receive tracking as soon as your package is on its way.</p>" +
          (hadSubscription
            ? "<p>Your subscription is active: the same order ships every 30 days with free shipping. " +
              "Pause, skip, or cancel anytime by emailing <a href=\"mailto:hello@foreverdandy.com\">hello@foreverdandy.com</a> — no fees, no questions.</p>"
            : "") +
          '<p><a class="btn" href="shop.html">Continue shopping</a></p>' +
          "</div>";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  /* ------------------------------------------------------------------
     Contact form (non-functional demo submit)
     ------------------------------------------------------------------ */

  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var confirm = document.querySelector("[data-contact-confirm]");
      if (confirm) {
        confirm.hidden = false;
        form.hidden = true;
        confirm.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  /* ------------------------------------------------------------------
     Lab results: batch lookup (demo — acknowledges the request)
     ------------------------------------------------------------------ */

  function initLabResults() {
    var lookup = document.querySelector("[data-batch-lookup]");
    if (lookup) {
      lookup.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = lookup.querySelector('input[name="batch"]');
        var result = document.querySelector("[data-batch-result]");
        if (result) {
          var value = input && input.value ? input.value.trim() : "";
          result.textContent = value
            ? "Thanks — we’ve received your request for the Certificate of Analysis for batch “" +
              value +
              "”. Our team will email it to you, usually within one business day."
            : "Please enter the batch number printed on your product label.";
          result.hidden = false;
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     Product image gallery (thumbnail swap)
     ------------------------------------------------------------------ */

  function initGallery() {
    var main = document.querySelector("[data-gallery-main]");
    var thumbs = document.querySelectorAll("[data-gallery-thumb]");
    if (!main || thumbs.length === 0) return;
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].addEventListener("click", function () {
        main.src = this.getAttribute("data-gallery-thumb");
        main.alt = this.getAttribute("data-gallery-alt") || main.alt;
        var all = document.querySelectorAll("[data-gallery-thumb]");
        for (var j = 0; j < all.length; j++) all[j].classList.remove("is-active");
        this.classList.add("is-active");
      });
    }
  }

  /* ------------------------------------------------------------------
     Footer newsletter (demo — acknowledges the signup)
     ------------------------------------------------------------------ */

  function initNewsletter() {
    var forms = document.querySelectorAll("[data-newsletter-form]");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", function (event) {
        event.preventDefault();
        if (!this.checkValidity()) {
          this.reportValidity();
          return;
        }
        var thanks = document.createElement("p");
        thanks.className = "newsletter-thanks";
        thanks.textContent = "You're on the list — welcome to Dandy.";
        this.replaceWith(thanks);
      });
    }
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", function () {
    initAgeGate();
    initNav();
    updateCartCount();
    initProductPage();
    initCartPage();
    initCheckoutPage();
    initContactForm();
    initLabResults();
    initGallery();
    initNewsletter();
  });
})();
