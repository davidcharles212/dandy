/* Dandy homepage and reviews hub chrome: reveal, header drawer, dose gears, FAQ accordion, welcome form, analytics.
   window.DandyHome.track(event, payload) pushes {event, ...payload} to window.dataLayer and to Shopify.analytics.publish
   when present. Elements carry data-track="<event>" and optional data-track-label. Every initialiser is idempotent. */
(function (w, d) {
  'use strict';
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in w;
  function all(sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); }
  function once(el, key) { if (el.dataset[key]) return false; el.dataset[key] = '1'; return true; }

  function track(event, payload) {
    var data = { event: event };
    if (payload) for (var k in payload) if (Object.prototype.hasOwnProperty.call(payload, k)) data[k] = payload[k];
    (w.dataLayer = w.dataLayer || []).push(data);
    try {
      if (w.Shopify && w.Shopify.analytics && typeof w.Shopify.analytics.publish === 'function') w.Shopify.analytics.publish(event, payload || {});
    } catch (e) {}
    return data;
  }

  /* Reveal: [data-reveal] gains is-in once at 30 percent visible (or half the viewport for tall blocks) and is unobserved. */
  function reveal(root) {
    var els = all('[data-reveal]', root).filter(function (el) { return once(el, 'hmReveal'); });
    if (!els.length) return;
    if (!hasIO || reduce) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && (e.intersectionRatio >= 0.3 || e.intersectionRect.height >= w.innerHeight * 0.5)) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: [0, 0.3, 0.6] });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Header: phone drawer. */
  function header(root) {
    var open = (root || d).querySelector('[data-hh-open]'), drawer = (root || d).querySelector('[data-hh-drawer]');
    if (!open || !drawer || !once(drawer, 'hmBound')) return;
    var close = drawer.querySelector('[data-hh-close]');
    function set(on) {
      drawer.hidden = !on;
      open.setAttribute('aria-expanded', String(on));
      d.documentElement.classList.toggle('hh-open', on);
      if (on) (close || drawer).focus(); else open.focus();
    }
    open.addEventListener('click', function () { set(true); });
    if (close) close.addEventListener('click', function () { set(false); });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) set(false); });
  }

  /* Dose: three gear titles; pressing one raises its zone and dims the others; the marker slides to the zone. */
  function dose(root) {
    all('[data-dose]', root).forEach(function (sec) {
      if (!once(sec, 'hmBound')) return;
      var gears = all('.gear', sec), btns = all('[data-gear-btn]', sec), marker = sec.querySelector('.dose__marker');
      var centres = { '1': '13.3%', '2': '36.7%', '3': '73.3%' };
      function place() {
        var n = sec.getAttribute('data-gear') || '1', g = sec.querySelector('[data-gear-zone="' + n + '"]');
        if (!marker) return;
        marker.style.setProperty('--mx', centres[n] || centres['1']);
        if (g) marker.style.setProperty('--my', (g.offsetTop + 13) + 'px');
      }
      function select(n) {
        sec.setAttribute('data-gear', n);
        gears.forEach(function (g) { g.classList.toggle('is-on', g.getAttribute('data-gear-zone') === n); });
        btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-gear-btn') === n)); });
        place();
      }
      btns.forEach(function (b) { b.addEventListener('click', function () { sec.setAttribute('data-picked', ''); select(b.getAttribute('data-gear-btn')); }); });
      select(sec.getAttribute('data-gear') || '1');
      w.addEventListener('resize', place);
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(place);
    });
  }

  /* FAQ: buttons toggle aria-expanded; the panel animates its grid row. First item open on load (from the markup). */
  function faq(root) {
    all('[data-faq]', root).forEach(function (list) {
      if (!once(list, 'hmBound')) return;
      all('.faq__q button', list).forEach(function (b) {
        var panel = d.getElementById(b.getAttribute('aria-controls'));
        if (!panel) return;
        panel.classList.toggle('is-open', b.getAttribute('aria-expanded') === 'true');
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-expanded') !== 'true';
          b.setAttribute('aria-expanded', String(on));
          panel.classList.toggle('is-open', on);
        });
      });
    });
  }

  /* Welcome: Klaviyo client subscribe with the Shopify customer form as the fallback; success replaces the form. */
  function welcome(root) {
    all('[data-klaviyo]', root).forEach(function (scope) {
      var company = scope.getAttribute('data-company'), list = scope.getAttribute('data-list'), form = scope.querySelector('form');
      if (!form || !company || !list || !once(form, 'hmBound')) return;
      var native = false;
      form.addEventListener('submit', function (e) {
        if (native) return;
        e.preventDefault();
        var input = form.querySelector('input[type="email"]'), email = input ? input.value.trim() : '';
        if (!email) return;
        var btn = form.querySelector('.btn');
        if (btn) btn.disabled = true;
        fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + encodeURIComponent(company), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'revision': '2024-10-15' },
          body: JSON.stringify({ data: { type: 'subscription',
            attributes: { custom_source: 'dandy2-band', profile: { data: { type: 'profile', attributes: { email: email, properties: { dandy_signup_source: 'dandy2-band' } } } } },
            relationships: { list: { data: { type: 'list', id: list } } } } })
        }).then(function (r) {
          if (!r.ok && r.status !== 202) throw new Error('klaviyo ' + r.status);
          var ok = d.createElement('p');
          ok.className = 'welcome__ok';
          ok.textContent = 'Check your inbox. Your code is on its way.';
          form.setAttribute('aria-live', 'polite');
          while (form.firstChild) form.removeChild(form.firstChild);
          form.appendChild(ok);
          try { localStorage.setItem('d2capture', String(Date.now())); } catch (err) {}
        }).catch(function () {
          native = true;
          if (btn) btn.disabled = false;
          form.submit();
        });
      });
    });
  }

  /* Click tracking: data-track elements push their event; label, href and the new expanded or pressed state ride along. */
  function analytics() {
    if (!once(d.documentElement, 'hmTrack')) return;
    d.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-track]') : null;
      if (!el) return;
      var p = {};
      if (el.hasAttribute('data-track-label')) p.label = el.getAttribute('data-track-label');
      if (el.hasAttribute('href')) p.href = el.getAttribute('href');
      if (el.hasAttribute('aria-expanded')) p.open = el.getAttribute('aria-expanded') === 'true';
      if (el.hasAttribute('aria-pressed')) p.pressed = el.getAttribute('aria-pressed') === 'true';
      track(el.getAttribute('data-track'), p);
    });
  }

  function init(root) { analytics(); reveal(root); header(root); dose(root); faq(root); welcome(root); }

  w.DandyHome = { track: track, init: init, reveal: reveal, reduce: reduce };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
  d.addEventListener('shopify:section:load', function (e) { init(e.target); });
})(window, document);
