/* Dandy homepage (v3) and reviews hub chrome: reveal, header drawer, customer clips, FAQ accordion, welcome form, analytics.
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

  /* Reveal: [data-reveal] gains is-in as soon as 5 percent of it is on screen (or anything at all for blocks taller than the viewport), once, then is unobserved. Blocks already on screen at load are shown at once. */
  function reveal(root) {
    var els = all('[data-reveal]', root).filter(function (el) { return once(el, 'hmReveal'); });
    if (!els.length) return;
    if (!hasIO || reduce) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && (e.intersectionRatio >= 0.05 || e.intersectionRect.height >= 40)) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: [0, 0.05, 0.2], rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < w.innerHeight && r.bottom > 0) { el.classList.add('is-in'); return; }
      io.observe(el);
    });
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

  /* Customer clips: poster with one play button; a tap plays with sound, a tap on the frame pauses; the poster comes back when the clip ends;
     only one clip plays at a time; a clip leaving the viewport pauses; verbatim captions (from #hm-captions) render inside the frame while it plays;
     if every source errors the poster stays and the frame is inert. The first play of each clip is tracked once. */
  function clips(root) {
    var cues = {};
    try { cues = JSON.parse((d.getElementById('hm-captions') || {}).textContent || '{}'); } catch (e) { cues = {}; }
    var slots = all('.ugc', root).filter(function (s) { return once(s, 'hmBound'); });
    if (!slots.length) return;
    function pauseOthers(keep) { all('.ugc video').forEach(function (o) { if (o !== keep && !o.paused) o.pause(); }); }
    slots.forEach(function (slot) {
      var v = slot.querySelector('video'), fb = slot.querySelector('.ugc__fallback'), cap = slot.querySelector('.ugc__cap'), play = slot.querySelector('.ugc__play'), frame = slot.querySelector('.ugc__frame');
      if (!v || !play || !frame) return;
      var list = cues[slot.getAttribute('data-slot')] || [], played = false;
      function showFallback() { v.hidden = true; if (fb) fb.hidden = false; slot.classList.add('is-fallback'); slot.classList.remove('is-playing'); if (cap) cap.hidden = true; }
      v.addEventListener('error', showFallback);
      var src = v.querySelectorAll('source'); if (src.length) src[src.length - 1].addEventListener('error', showFallback);
      function start() {
        if (slot.classList.contains('is-fallback')) return;
        pauseOthers(v); v.muted = false; v.volume = 1;
        var p = v.play();
        if (p && p.catch) p.catch(function (err) { if (err && err.name === 'NotSupportedError') showFallback(); });
      }
      function toggle() { if (v.paused || v.ended) start(); else v.pause(); }
      frame.addEventListener('click', function (e) { if (e.target.closest('.ugc__play')) return; e.preventDefault(); toggle(); });
      play.addEventListener('click', function (e) { e.preventDefault(); toggle(); });
      v.addEventListener('play', function () { slot.classList.add('is-playing'); play.setAttribute('aria-label', 'Pause video'); if (!played) { played = true; } });
      v.addEventListener('playing', function () { slot.classList.add('is-playing'); });
      v.addEventListener('pause', function () { slot.classList.remove('is-playing'); play.setAttribute('aria-label', 'Play video'); });
      v.addEventListener('ended', function () { slot.classList.remove('is-playing'); v.currentTime = 0; if (cap) { cap.textContent = ''; cap.classList.remove('is-on'); } });
      if (cap && list.length) {
        var last = null;
        v.addEventListener('timeupdate', function () {
          var t = v.currentTime, hit = null;
          for (var i = 0; i < list.length; i++) { if (t >= list[i][0] && t < list[i][1]) { hit = list[i]; break; } }
          if (hit !== last) { last = hit; cap.textContent = hit ? hit[2] : ''; cap.classList.toggle('is-on', !!hit); }
        });
      }
      if (hasIO) new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting && !v.paused) v.pause(); }); }, { threshold: 0 }).observe(v);
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

  function init(root) { analytics(); reveal(root); header(root); clips(root); faq(root); welcome(root); }

  w.DandyHome = { track: track, init: init, reveal: reveal, reduce: reduce };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
  d.addEventListener('shopify:section:load', function (e) { init(e.target); });
})(window, document);
