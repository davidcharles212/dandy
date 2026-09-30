/* Daily Health Dispatch: editorial reveals, reading progress and an accessible two-strength bundle selector. */
(function (window, document) {
  'use strict';
  function fillDates() {
    var today = new Date();
    var date = document.getElementById('current-date');
    var year = document.getElementById('current-year');
    if (date) {
      date.textContent = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      date.setAttribute('datetime', today.toISOString().slice(0, 10));
    }
    if (year) year.textContent = String(today.getFullYear());
  }
  function bundleChoice() {
    var bundle = document.querySelector('[data-bundle]');
    if (!bundle) return;
    var radios = [].slice.call(bundle.querySelectorAll('input[name="dhd-strength"]'));
    var image = bundle.querySelector('[data-bundle-image]');
    var cta = bundle.querySelector('[data-bundle-cta]');
    if (!radios.length || !image || !cta) return;
    function select(radio) {
      if (!radio.checked) return;
      image.src = radio.dataset.image;
      image.alt = radio.dataset.alt;
      cta.href = radio.dataset.href;
      bundle.dataset.strength = radio.value;
      if (radio.dataset.total) {
        [].forEach.call(document.querySelectorAll('[data-bundle-total]'), function (el) { el.textContent = radio.dataset.total; });
      }
    }
    radios.forEach(function (radio) {
      radio.addEventListener('change', function () { select(radio); });
    });
    select(radios.filter(function (radio) { return radio.checked; })[0] || radios[0]);
    bundle.setAttribute('data-ready', '');
  }
  function reveals() {
    var pending = [].slice.call(document.querySelectorAll('[data-reveal],[data-inview]'));
    if (!pending.length) return;
    var show = function (el) { el.classList.add('is-in'); };
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { pending.forEach(show); return; }
    var LEAD = 1200, ro = null, queued = false;
    function sweep() {
      var h = window.innerHeight || document.documentElement.clientHeight;
      for (var i = pending.length - 1; i >= 0; i--) {
        var b = pending[i].getBoundingClientRect();
        if (b.top < h + LEAD && b.bottom > -LEAD) { show(pending[i]); pending.splice(i, 1); }
      }
      return pending.length;
    }
    function detach() {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      if (ro) ro.disconnect();
    }
    function onScroll() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () { queued = false; if (!sweep()) detach(); });
    }
    /* body resizes when a lazy image finally loads, which is what used to push a block into view
       between two observer callbacks and leave it briefly unpainted */
    if ('ResizeObserver' in window) { ro = new ResizeObserver(onScroll); ro.observe(document.body); }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', onScroll);
    sweep();
  }
  /* The two figure loops. Under reduced motion they never play and the reader keeps the poster frame. Otherwise a loop
     plays only while it is on screen, so an article this long is not decoding two videos the whole way down. */
  function loops() {
    var vids = [].slice.call(document.querySelectorAll('.fig__loop'));
    if (!vids.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      vids.forEach(function (v) { v.autoplay = false; v.removeAttribute('autoplay'); v.pause(); });
      return;
    }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); }
        else e.target.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { io.observe(v); });
  }
  /* Reading progress (round 18): a hairline on the top edge that fills with scroll. Desktop only by CSS; measured from
     geometry on a rAF-throttled scroll, and never wired at all under reduced motion. */
  function progress() {
    var bar = document.querySelector('.progress i');
    if (!bar) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var queued = false;
    function paint() {
      queued = false;
      var doc = document.documentElement;
      var max = (doc.scrollHeight || 0) - (window.innerHeight || doc.clientHeight);
      var p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop) / max)) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    function onScroll() { if (!queued) { queued = true; window.requestAnimationFrame(paint); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
  }
  /* Sticky bar (R29): eligible once the mechanism heading has scrolled above the top of the screen (the reader has
     met the science), hidden again while any in-body button is on screen, phones and tablets only by CSS. */
  function sticky() {
    var bar = document.querySelector('[data-dhd-sticky]');
    var gate = document.getElementById('mechanism-title');
    if (!bar || !gate) return;
    document.body.appendChild(bar);
    // any in-body button, the offer block and the footer: the bar has nothing to add while those are in view
    var btns = [].slice.call(document.querySelectorAll('main .btn, #claim-offer, .foot'));
    var queued = false;
    function update() {
      queued = false;
      var h = window.innerHeight || document.documentElement.clientHeight;
      var reached = gate.getBoundingClientRect().top < 0;
      var seen = false;
      for (var i = 0; i < btns.length; i++) {
        var r = btns[i].getBoundingClientRect();
        if (r.width > 0 && r.bottom > 0 && r.top < h) { seen = true; break; }
      }
      var on = reached && !seen;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    function onScroll() { if (!queued) { queued = true; window.requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
  function init() {
    window.__dhdReady = true;
    sticky();
    fillDates();
    bundleChoice();
    reveals();
    loops();
    progress();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
