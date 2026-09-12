/* Dandy review hub. Fetches assets/dandy-reviews.json (schema: qa/dandy-reviews/README.md), computes every number on the page
   (average, star breakdown, per-format and per-benefit counts, verified and recommend percentages), renders twenty cards at a
   time, and runs the format words, search (150ms debounce), benefit toggles, sort, Show more, the empty state and URL state
   (format, benefit, q via history.replaceState). Built for a few thousand records: lowercase text is precomputed once, every
   render is one pass over the data, and only the visible page touches the DOM. Analytics go through window.track when the
   homepage script defines it, else a local track() that pushes to window.dataLayer. If the fetch fails the Liquid-rendered
   fallback cards stay and the controls hide. Timing: data-rvh-parse-ms and data-rvh-render-ms on the root, and the rvh:ready event. */
(function () {
  'use strict';
  var root = document.querySelector('[data-rvh]');
  if (!root || root.hasAttribute('data-rvh-bound')) return;
  root.setAttribute('data-rvh-bound', '');

  var PAGE = 20;
  var FORMATS = ['all', 'gummies', 'capsules', 'powder'];
  var PDP = { gummies: '/products/mixed-berry-kratom-gummies', capsules: '/products/extract-capsules-50mg', powder: '/products/premium-kratom-leaf-powder' };
  var PDP90 = '/products/extract-capsules-90mg';
  var SHOP = { gummies: 'Shop gummies', capsules: 'Shop capsules', powder: 'Shop raw leaf powder' };
  var BENEFITS = ['focus-stamina', 'joint-body-comfort', 'coffee-alternative', 'taste-flavor', 'evening-unwind', 'first-time-user'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var $ = function (sel, el) { return (el || root).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var now = function () { return window.performance && performance.now ? performance.now() : Date.now(); };

  function track(ev, payload) {
    if (typeof window.track === 'function') return window.track(ev, payload);
    var d = window.dataLayer = window.dataLayer || [];
    var o = { event: ev };
    for (var k in (payload || {})) o[k] = payload[k];
    d.push(o);
    try { if (window.Shopify && window.Shopify.analytics && window.Shopify.analytics.publish) window.Shopify.analytics.publish(ev, payload || {}); } catch (e) {}
  }
  /* PDP buttons carry data-track; the homepage script owns that delegate when it is present (blueprint section 9), so this one only fires without it */
  root.addEventListener('click', function (e) {
    if (typeof window.track === 'function') return;
    var el = e.target.closest('[data-track]');
    if (!el || !root.contains(el)) return;
    track(el.getAttribute('data-track'), el.getAttribute('data-track-label') ? { label: el.getAttribute('data-track-label') } : {});
  });

  var els = {
    score: $('[data-rvh-score]'), avg: $('[data-rvh-avg]'), avgStars: $('[data-rvh-avg-stars]'), avgSub: $('[data-rvh-avg-sub]'),
    recommend: $('[data-rvh-recommend]'), verified: $('[data-rvh-verified]'),
    formats: $$('[data-rvh-formats] [data-format]'), search: $('[data-rvh-search]'), sort: $('[data-rvh-sort]'),
    benefits: $$('[data-rvh-benefits] [data-benefit]'), count: $('[data-rvh-count]'), grid: $('[data-rvh-grid]'),
    empty: $('[data-rvh-empty]'), clear: $('[data-rvh-clear]'), more: $('[data-rvh-more]'), controls: $('.rvh__controls')
  };
  var formatN = {}, benefitN = {};
  els.formats.forEach(function (b) { formatN[b.getAttribute('data-format')] = b.querySelector('[data-format-n]'); });
  els.benefits.forEach(function (b) { benefitN[b.getAttribute('data-benefit')] = b.querySelector('[data-benefit-n]'); });

  var all = [];
  var state = { format: 'all', benefits: [], q: '', terms: [], sort: 'relevant', shown: PAGE };
  var current = []; /* the filtered, sorted list behind the grid */

  /* ---------- data ---------- */
  function clean(r, i) {
    var product = String(r.product || '').toLowerCase();
    if (FORMATS.indexOf(product) < 1) product = '';
    var benefits = Array.isArray(r.benefits) ? r.benefits.map(function (b) { return String(b).toLowerCase(); }).filter(function (b) { return BENEFITS.indexOf(b) >= 0; }) : [];
    var rating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
    var headline = String(r.headline || '').trim().replace(/^["“”]+|["“”]+$/g, '');
    var body = String(r.body || '').trim();
    return {
      id: String(r.id == null ? 'rv-' + (i + 1) : r.id), name: String(r.name || ''), age: r.age == null || r.age === '' ? '' : String(r.age), location: String(r.location || ''),
      product: product, productLabel: String(r.productLabel || ''), variant: String(r.variant || ''), rating: rating, date: String(r.date || ''),
      headline: headline, body: body, benefits: benefits, verified: r.verified === true,
      recommend: typeof r.recommend === 'boolean' ? r.recommend : null, helpful: Math.max(0, Math.round(Number(r.helpful) || 0)), order: i,
      hl: headline.toLowerCase(), bl: body.toLowerCase()
    };
  }
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return iso;
    return MONTHS[Number(m[2]) - 1] + ' ' + Number(m[3]) + ', ' + m[1];
  }
  function terms(q) { return q.toLowerCase().replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(Boolean); }
  function occurrences(s, t) { var n = 0, at = 0; while ((at = s.indexOf(t, at)) >= 0) { n++; at += t.length; } return n; }
  /* -1 when a term is missing; otherwise headline hits weigh three times body hits */
  function score(r, ts) {
    var s = 0;
    for (var i = 0; i < ts.length; i++) {
      var h = occurrences(r.hl, ts[i]), b = occurrences(r.bl, ts[i]);
      if (!h && !b) return -1;
      s += h * 3 + b;
    }
    return s;
  }
  var byDate = function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : a.order - b.order; };
  var byHelpful = function (a, b) { return b.helpful - a.helpful || byDate(a, b); };
  /* Relevance blends rating, helpful votes (capped so a few outliers cannot dominate) and recency, so the default
     order reads like the scorecard above it instead of leading with whichever reviews collected the most votes. */
  var relevance = function (r) { return r.rating * 10 + Math.min(r.helpful, 30) + (r.date >= '2025-06-01' ? 5 : 0); };
  var byRelevance = function (a, b) { return relevance(b) - relevance(a) || byDate(a, b); };
  function comparator() {
    if (state.sort === 'recent') return byDate;
    if (state.sort === 'rating') return function (a, b) { return b.rating - a.rating || byHelpful(a, b); };
    if (state.terms.length) return function (a, b) { return b._s - a._s || byRelevance(a, b); };
    return byRelevance;
  }

  /* ---------- one pass: filtered list plus the count every control would yield if chosen ---------- */
  function compute() {
    var fc = { all: 0, gummies: 0, capsules: 0, powder: 0 }, bc = {};
    BENEFITS.forEach(function (b) { bc[b] = 0; });
    var list = [], ts = state.terms, bens = state.benefits, fmt = state.format;
    for (var i = 0; i < all.length; i++) {
      var r = all[i];
      var q = true;
      if (ts.length) { r._s = score(r, ts); q = r._s >= 0; }
      if (!q) continue;
      var f = fmt === 'all' || r.product === fmt;
      var bn = !bens.length;
      for (var k = 0; !bn && k < bens.length; k++) if (r.benefits.indexOf(bens[k]) >= 0) bn = true;
      if (bn) { fc.all++; if (fc.hasOwnProperty(r.product)) fc[r.product]++; }
      if (f) for (var j = 0; j < r.benefits.length; j++) bc[r.benefits[j]]++;
      if (f && bn) list.push(r);
    }
    list.sort(comparator());
    return { list: list, formats: fc, benefits: bc };
  }

  /* ---------- render ---------- */
  function stars(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) out += '<svg class="rvh-star ' + (i <= n ? 'rvh-star--on' : 'rvh-star--off') + '" aria-hidden="true"><use href="#rvh-star"/></svg>';
    return out;
  }
  function facts(items) { return items.length ? '<ul class="rvh-facts">' + items.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' : ''; }
  function card(r) {
    var who = [r.name, r.age, r.location].filter(Boolean).join(', ');
    var meta = [];
    if (r.verified) meta.push('Verified buyer');
    if (r.date) meta.push(fmtDate(r.date));
    var bought = [];
    if (r.productLabel) bought.push('Purchased: ' + r.productLabel);
    if (r.variant) bought.push(r.variant);
    var href = r.product === 'capsules' && /\b90\b/.test(r.variant) ? PDP90 : PDP[r.product];
    return '<li><article class="rvh-card" data-id="' + esc(r.id) + '">' +
      '<span class="rvh-stars rvh-card__stars" role="img" aria-label="' + r.rating + ' out of 5 stars">' + stars(r.rating) + '</span>' +
      '<h2 class="rvh-card__h">“' + esc(r.headline) + '”</h2>' +
      '<p class="rvh-card__body">' + esc(r.body) + '</p>' +
      '<footer class="rvh-card__foot">' +
        (who ? '<p class="rvh-card__who">' + esc(who) + '</p>' : '') + facts(meta) + facts(bought) +
        (r.helpful > 0 ? '<p class="rvh-card__helpful">' + r.helpful.toLocaleString('en-US') + (r.helpful === 1 ? ' person' : ' people') + ' found this helpful</p>' : '') +
      '</footer>' +
      (href ? '<div class="rvh-card__cta"><a class="btn btn--secondary btn--sm" href="' + href + '" data-track="review_card_pdp_click" data-track-label="' + r.product + '">' + SHOP[r.product] + '</a></div>' : '') +
      '</article></li>';
  }
  function renderScore() {
    var n = all.length, sum = 0, byStar = [0, 0, 0, 0, 0, 0], verified = 0, withRec = 0, rec = 0;
    for (var i = 0; i < n; i++) { var r = all[i]; sum += r.rating; byStar[r.rating]++; if (r.verified) verified++; if (r.recommend !== null) { withRec++; if (r.recommend) rec++; } }
    var avg = n ? Math.round(sum / n * 10) / 10 : 0;
    els.avg.textContent = n ? avg.toFixed(1) : '';
    els.avgStars.innerHTML = stars(Math.round(avg));
    els.avgStars.setAttribute('aria-label', avg.toFixed(1) + ' out of 5 stars');
    els.avgSub.textContent = n === 1 ? 'Based on 1 verified review' : 'Based on ' + n.toLocaleString('en-US') + ' verified reviews';
    for (var s = 1; s <= 5; s++) {
      var pct = n ? Math.round(byStar[s] / n * 100) : 0;
      $('[data-star="' + s + '"]').style.width = pct + '%';
      $('[data-star-pct="' + s + '"]').textContent = pct + '%';
    }
    if (withRec) { els.recommend.textContent = Math.round(rec / withRec * 100) + '% would recommend'; els.recommend.hidden = false; }
    else if (els.recommend.parentNode) els.recommend.parentNode.removeChild(els.recommend); /* gone, not hidden, so the facts row's first visible item carries no dot */
    els.verified.textContent = (n ? Math.round(verified / n * 100) : 0) + '% verified purchases';
    els.score.removeAttribute('aria-busy');
  }
  function renderControls(c) {
    els.formats.forEach(function (b) {
      var f = b.getAttribute('data-format'), on = f === state.format;
      formatN[f].textContent = c.formats[f].toLocaleString('en-US');
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    els.benefits.forEach(function (b) {
      var k = b.getAttribute('data-benefit'), on = state.benefits.indexOf(k) >= 0, n = c.benefits[k] || 0;
      benefitN[k].textContent = n.toLocaleString('en-US');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.hidden = !on && n === 0;
    });
    if (els.search.value !== state.q) els.search.value = state.q;
    els.sort.value = state.sort;
  }
  function renderList(append) {
    var list = current, shown = Math.min(state.shown, list.length);
    if (append) { var html = ''; for (var i = append; i < shown; i++) html += card(list[i]); els.grid.insertAdjacentHTML('beforeend', html); }
    else { var out = ''; for (var j = 0; j < shown; j++) out += card(list[j]); els.grid.innerHTML = out; }
    els.empty.hidden = list.length > 0;
    els.more.hidden = shown >= list.length;
    els.count.textContent = list.length ? 'Showing ' + shown.toLocaleString('en-US') + ' of ' + list.length.toLocaleString('en-US') + (list.length === 1 ? ' review' : ' reviews') : '';
  }
  function render() {
    var c = compute();
    current = c.list;
    renderControls(c);
    renderList(0);
    writeUrl();
  }

  /* ---------- URL state ---------- */
  function setQuery(q) { state.q = q; state.terms = q ? terms(q) : []; }
  function readUrl() {
    var p = new URLSearchParams(location.search);
    var f = (p.get('format') || '').toLowerCase();
    if (FORMATS.indexOf(f) > 0) state.format = f;
    state.benefits = (p.get('benefit') || '').toLowerCase().split(',').filter(function (b) { return BENEFITS.indexOf(b) >= 0; });
    setQuery((p.get('q') || '').slice(0, 120));
  }
  function writeUrl() {
    if (!window.history || !history.replaceState) return;
    var u = new URL(location.href);
    var set = function (k, v) { if (v) u.searchParams.set(k, v); else u.searchParams.delete(k); };
    set('format', state.format === 'all' ? '' : state.format);
    set('benefit', state.benefits.join(','));
    set('q', state.q.trim());
    var next = u.pathname + u.search + u.hash;
    if (next !== location.pathname + location.search + location.hash) history.replaceState(history.state, '', next);
  }

  /* ---------- controls ---------- */
  function selectFormat(f, focus) {
    if (state.format !== f) {
      state.format = f; state.shown = PAGE;
      track('review_hub_format_filter', { label: f });
      render();
    }
    if (focus) { var b = els.formats.filter(function (x) { return x.getAttribute('data-format') === f; })[0]; if (b) b.focus(); }
  }
  els.formats.forEach(function (b, i) {
    b.addEventListener('click', function () { selectFormat(b.getAttribute('data-format')); });
    b.addEventListener('keydown', function (e) {
      var n = els.formats.length, j = i;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      else return;
      e.preventDefault();
      selectFormat(els.formats[j].getAttribute('data-format'), true);
    });
  });
  els.benefits.forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-benefit'), at = state.benefits.indexOf(k);
      if (at >= 0) state.benefits.splice(at, 1); else state.benefits.push(k);
      state.shown = PAGE;
      render();
    });
  });
  var timer;
  els.search.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { setQuery(els.search.value); state.shown = PAGE; render(); }, 150);
  });
  els.search.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
  els.sort.addEventListener('change', function () { state.sort = els.sort.value; state.shown = PAGE; render(); });
  els.clear.addEventListener('click', function () {
    state.format = 'all'; state.benefits = []; setQuery(''); state.shown = PAGE;
    render();
    els.search.focus();
  });
  els.more.addEventListener('click', function () {
    var first = els.grid.children.length;
    state.shown += PAGE;
    renderList(first);
    var next = els.grid.children[first];
    if (next) { var h = next.querySelector('h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  });

  /* ---------- boot ---------- */
  function fail(why) {
    if (window.console && console.warn) console.warn('dandy-reviews: ' + why + '; showing the fallback cards');
    els.score.hidden = true; els.controls.hidden = true; els.count.hidden = true;
    root.classList.add('is-static');
  }
  var t0;
  fetch(root.getAttribute('data-src'), { credentials: 'same-origin' })
    .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.text(); })
    .then(function (text) {
      t0 = now();
      var data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('not an array');
      all = data.map(clean);
      var t1 = now();
      readUrl();
      renderScore();
      render();
      var t2 = now();
      root.setAttribute('data-rvh-parse-ms', String(Math.round(t1 - t0)));
      root.setAttribute('data-rvh-render-ms', String(Math.round(t2 - t1)));
      root.classList.add('is-ready');
      root.dispatchEvent(new CustomEvent('rvh:ready', { detail: { count: all.length, parseMs: t1 - t0, renderMs: t2 - t1 } }));
    })
    .catch(function (e) { fail(e && e.message ? e.message : String(e)); });
})();

/* Under 480px the long search placeholder truncates, so the short form from data-rvh-placeholder-short is used there. */
(function () {
  var input = document.querySelector('[data-rvh-search][data-rvh-placeholder-short]');
  if (!input || input.hasAttribute('data-rvh-ph-bound')) return;
  input.setAttribute('data-rvh-ph-bound', '');
  var full = input.getAttribute('placeholder'), mq = window.matchMedia('(max-width: 479px)');
  function set() { input.setAttribute('placeholder', mq.matches ? input.getAttribute('data-rvh-placeholder-short') : full); }
  set();
  if (mq.addEventListener) mq.addEventListener('change', set); else mq.addListener(set);
})();
