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

  var PRODUCTS = {
    gummies: {
      name: "Mixed Berry Kratom Gummies",
      strength: "35mg mitragynine per gummy",
      url: "product-gummies.html",
      variants: [
        { id: "gummies-10", label: "10-count", price: 19.99 },
        { id: "gummies-30", label: "30-count", price: 49.99 }
      ]
    },
    powder: {
      name: "Kratom Leaf Powder",
      strength: "Finely ground raw leaf",
      url: "product-powder.html",
      variants: [
        { id: "powder-250", label: "250g", price: 24.99 },
        { id: "powder-500", label: "500g", price: 39.99 },
        { id: "powder-750", label: "750g", price: 54.99 },
        { id: "powder-1000", label: "1kg", price: 69.99 }
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
      }) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* localStorage unavailable (private mode); cart lives in memory only */
    }
    updateCartCount();
  }

  function addToCart(variantId, qty) {
    var cart = getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].variantId === variantId) existing = cart[i];
    }
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ variantId: variantId, qty: qty });
    }
    saveCart(cart);
  }

  function setQty(variantId, qty) {
    var cart = getCart();
    var next = [];
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].variantId === variantId) {
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
      var found = findVariant(item.variantId);
      return found ? sum + found.variant.price * item.qty : sum;
    }, 0);
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

    function refreshPrice() {
      var found = selectedVariant();
      if (found && priceEl) priceEl.textContent = formatPrice(found.variant.price);
    }

    var radios = form.querySelectorAll('input[name="variant"]');
    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener("change", refreshPrice);
    }
    refreshPrice();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var found = selectedVariant();
      if (!found) return;
      var qtyInput = form.querySelector('input[name="qty"]');
      var qty = Math.max(1, Math.min(20, parseInt(qtyInput && qtyInput.value, 10) || 1));
      addToCart(found.variant.id, qty);
      if (confirmEl) {
        confirmEl.innerHTML =
          "Added " + qty + " × " + product.name + " (" + found.variant.label + ") to your cart. " +
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
        rows +=
          "<tr>" +
          '<td><span class="cart-item-name"><a href="' + found.product.url + '">' + found.product.name + "</a></span><br>" +
          '<span class="cart-item-variant">' + found.variant.label + " · " + found.product.strength + "</span></td>" +
          "<td>" + formatPrice(found.variant.price) + "</td>" +
          '<td><label class="visually-hidden" for="qty-' + found.variant.id + '">Quantity for ' + found.product.name + " " + found.variant.label + "</label>" +
          '<input class="cart-qty" id="qty-' + found.variant.id + '" type="number" min="0" max="20" value="' + cart[i].qty + '" data-qty="' + found.variant.id + '"></td>' +
          "<td>" + formatPrice(found.variant.price * cart[i].qty) + "</td>" +
          '<td><button type="button" class="link-btn" data-remove="' + found.variant.id + '">Remove</button></td>' +
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
    for (var i = 0; i < cart.length; i++) {
      var found = findVariant(cart[i].variantId);
      if (!found) continue;
      lines +=
        "<li><span>" + found.product.name + " (" + found.variant.label + ") × " + cart[i].qty + "</span>" +
        "<span>" + formatPrice(found.variant.price * cart[i].qty) + "</span></li>";
    }

    summary.innerHTML =
      "<h2>Order summary</h2>" +
      '<ul class="summary-lines">' + lines + "</ul>" +
      '<ul class="summary-lines">' +
      "<li><span>Shipping</span><span>FREE (orders $50+) or $6.95</span></li>" +
      "</ul>" +
      '<div class="summary-total"><span>Order total</span><span>' +
      formatPrice(cartSubtotal() + (cartSubtotal() >= 50 ? 0 : 6.95)) +
      "</span></div>";
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
  });
})();
