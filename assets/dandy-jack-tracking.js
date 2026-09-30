/* Dandy Jack funnel instrumentation. Existing vendor tags own collection. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if (!root.DandyJackTracking) {
    root.DandyJackTracking = factory();
    root.DandyJackTracking.install(root);
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  var KEY = 'dandy_jack_funnel_v1';
  var TTL = 30 * 60 * 1000;
  function clean(value) {
    return typeof value === 'string' && /^[a-zA-Z0-9_. -]{1,100}$/.test(value) ? value : '';
  }
  function createTracker(env) {
    var url = new URL(env.url);
    var path = url.pathname.replace(/\/$/, '');
    var page = path === '/pages/jack' ? 'jack' : path === '/products/extract-capsules' ? 'capsule_pdp' : '';
    var started = false, rejected = false;
    var state = null;
    var visible = true, lastTick = env.now(), lastActivity = env.now(), active = 0;
    var depths = new Set(), times = new Set();
    var qa = url.searchParams.has('dandy_qa') || url.searchParams.has('preview_theme_id') ||
      url.searchParams.get('utm_source') === 'internal_qa' || env.preview === true;
    var collectQA = url.searchParams.get('dandy_qa') === 'collect';
    function storage(method, value) {
      try { return env.storage[method](KEY, value); }
      catch (error) { env.warn('Dandy funnel storage unavailable: ' + error.message); }
    }
    function allowed() {
      var permission = env.consent();
      if (permission === true) { rejected = false; return true; }
      if (permission === false && !rejected) { storage('removeItem'); rejected = true; }
      state = null;
      started = false;
      active = 0;
      lastTick = env.now();
      lastActivity = env.now();
      return false;
    }
    function persist() { if (state) storage('setItem', JSON.stringify(state)); }
    function initialize() {
      if (state) {
        if (env.now() - state.updated >= TTL) {
          state = { origin: page === 'jack' ? 'jack' : 'direct_pdp', updated: env.now(), qa: qa, collectQA: collectQA };
          persist();
        }
        return;
      }
      try { state = JSON.parse(storage('getItem') || 'null'); }
      catch (error) { env.warn('Dandy funnel invalid stored state: ' + error.message); }
      if (!state || !Number.isFinite(state.updated) || env.now() - state.updated >= TTL || state.updated > env.now()) state = {};
      qa = qa || state.qa === true;
      collectQA = collectQA || state.collectQA === true;
      if (page === 'jack') {
        if (url.searchParams.has('utm_campaign') || state.origin !== 'jack') {
          state = { origin: 'jack', source: clean(url.searchParams.get('utm_source')),
            medium: clean(url.searchParams.get('utm_medium')), campaign: clean(url.searchParams.get('utm_campaign')),
            content: clean(url.searchParams.get('utm_content')), adId: clean(url.searchParams.get('waid')),
            adsetId: clean(url.searchParams.get('wasid')), campaignId: clean(url.searchParams.get('wacid')),
            placement: clean(url.searchParams.get('utm_placement')), cta: '' };
        }
      } else if (url.searchParams.has('utm_campaign')) {
        // A fresh acquisition directly onto the PDP is not a continuation of Jack.
        state = {};
      }
      state.qa = qa;
      state.collectQA = collectQA;
      state.updated = env.now();
      persist();
    }
    function emit(name, extra) {
      if (!page || !allowed()) return false;
      initialize();
      var params = Object.assign({ funnel_page: page, funnel_origin: state.origin || 'direct_pdp',
        jack_source: clean(state.source), jack_medium: clean(state.medium), jack_campaign: clean(state.campaign),
        jack_content: clean(state.content), jack_cta: clean(state.cta), page_version: page + '_20260918',
        jack_ad_id: clean(state.adId), jack_adset_id: clean(state.adsetId),
        jack_campaign_id: clean(state.campaignId), jack_placement: clean(state.placement),
        tracking_version: '1', traffic_type: 'customer' }, extra);
      if (qa) {
        return !env.diagnose || env.diagnose(name, Object.assign({}, params, { traffic_type: 'internal' }), collectQA) === true;
      }
      return env.send(name, params) === true;
    }
    function start() {
      if (started) { allowed(); return; }
      started = emit('dandy_funnel_entry');
      lastTick = env.now();
      lastActivity = env.now();
    }
    function click(href, cta) {
      if (!allowed() || page !== 'jack') return;
      start();
      var target;
      try {
        target = new URL(href, url);
        if (target.origin !== url.origin) return;
        if (target.pathname.indexOf('/discount/') === 0) target = new URL(target.searchParams.get('redirect') || '/', url);
      } catch (error) { env.warn('Dandy funnel invalid link: ' + error.message); return; }
      if (target.origin !== url.origin) return;
      if (target.pathname.replace(/\/$/, '') === '/products/extract-capsules') {
        initialize();
        state.cta = clean(cta);
        state.updated = env.now();
        persist();
        emit('dandy_product_click', { cta_id: clean(cta), destination_path: '/products/extract-capsules' });
      } else if (target.pathname === url.pathname && target.hash === '#claim-offer') {
        emit('dandy_offer_jump', { cta_id: clean(cta) });
      }
    }
    function depth(percent) {
      if (!allowed() || !visible || !Number.isFinite(percent)) return;
      start();
      [25, 50, 75, 90].forEach(function (threshold) {
        if (percent >= threshold && !depths.has(threshold) && emit('dandy_scroll_depth', { percent_scrolled: threshold })) depths.add(threshold);
      });
    }
    function tick() {
      var now = env.now();
      if (!allowed()) return;
      if (!started) { start(); return; }
      if (visible) active += Math.max(0, Math.min(now, lastActivity + 60000) - lastTick);
      lastTick = now;
      [15, 30, 60, 120, 180, 300].forEach(function (seconds) {
        if (active >= seconds * 1000 && !times.has(seconds) && emit('dandy_active_time', { active_seconds: seconds })) times.add(seconds);
      });
    }
    function visibility(value) { tick(); visible = value; }
    function activity() {
      tick();
      lastActivity = env.now();
      if (state && allowed()) { initialize(); state.updated = env.now(); persist(); }
    }
    return { start: start, click: click, depth: depth, tick: tick, visibility: visibility, activity: activity };
  }
  function install(w) {
    var path = new URL(w.location.href).pathname.replace(/\/$/, '');
    if (w.__dandyJackInstalled || (path !== '/pages/jack' && path !== '/products/extract-capsules')) return;
    w.__dandyJackInstalled = true;
    var d = w.document, warned = new Set();
    function warn(message) {
      if (!warned.has(message)) { warned.add(message); w.console.warn(message); }
    }
    function clarity(name, params) {
      if (typeof w.clarity !== 'function') return;
      ['funnel_page', 'funnel_origin', 'jack_source', 'jack_campaign', 'jack_content', 'jack_ad_id', 'jack_placement', 'traffic_type', 'tracking_version'].forEach(function (key) {
        if (params[key]) w.clarity('set', key, params[key]);
      });
      w.clarity('event', name + (params.percent_scrolled ? '_' + params.percent_scrolled : params.active_seconds ? '_' + params.active_seconds : ''));
    }
    function dispatch(name, params) {
      if (typeof w.gtag !== 'function') { warn('Dandy funnel waiting for existing Google tag'); return false; }
      try {
        w.gtag('event', name, Object.assign({ send_to: 'G-YJKXWL2V3Y' }, params));
      } catch (error) { warn('Dandy funnel Google dispatch failed: ' + error.message); return false; }
      try { clarity(name, params); }
      catch (error) { warn('Dandy funnel Clarity dispatch failed: ' + error.message); }
      return true;
    }
    var tracker = createTracker({
      url: w.location.href,
      preview: !!(w.Shopify && (w.Shopify.designMode || (w.Shopify.theme && w.Shopify.theme.role !== 'main'))),
      consent: function () {
        if (!w.Shopify || !w.Shopify.customerPrivacy) return undefined;
        return w.Shopify.customerPrivacy.analyticsProcessingAllowed() === true;
      },
      now: Date.now,
      storage: {
        getItem: function (key) { return w.sessionStorage.getItem(key); },
        setItem: function (key, value) { return w.sessionStorage.setItem(key, value); },
        removeItem: function (key) { return w.sessionStorage.removeItem(key); }
      },
      warn: warn,
      diagnose: function (name, params, collect) {
        w.console.info('[Dandy funnel QA]', name, JSON.stringify(params));
        return !collect || dispatch('dandy_qa_probe', Object.assign({}, params, { probe_event: name, debug_mode: true }));
      },
      send: dispatch
    });
    function measure() {
      var scroller = d.scrollingElement;
      var wrapper = d.querySelector('.page-wrapper');
      if (wrapper && /auto|scroll/.test(w.getComputedStyle(wrapper).overflowY) && wrapper.scrollHeight > wrapper.clientHeight) scroller = wrapper;
      if (scroller && scroller.scrollHeight > scroller.clientHeight) {
        tracker.depth(100 * (scroller.scrollTop + scroller.clientHeight) / scroller.scrollHeight);
      }
    }
    function onClick(event) {
      if (event.isTrusted === false) return;
      var anchor = event.target && event.target.closest && event.target.closest('a[href]');
      if (!anchor) return;
      var id = anchor.getAttribute('data-funnel-cta');
      if (!id) id = anchor.closest('[data-bundle]') ? 'offer' : anchor.closest('[data-dhd-sticky]') ? 'sticky' : 'article_link';
      tracker.activity();
      tracker.click(anchor.href, id);
    }
    d.addEventListener('click', onClick, true);
    d.addEventListener('auxclick', function (event) { if (event.button === 1) onClick(event); }, true);
    w.addEventListener('scroll', function (event) {
      if (event.isTrusted === false) return;
      tracker.activity();
      measure();
    }, { passive: true, capture: true });
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (name) {
      d.addEventListener(name, function (event) { if (event.isTrusted !== false) tracker.activity(); }, { passive: true });
    });
    d.addEventListener('visibilitychange', function () { tracker.visibility(d.visibilityState === 'visible'); });
    d.addEventListener('visitorConsentCollected', function () { tracker.start(); });
    tracker.visibility(d.visibilityState === 'visible');
    var timer = w.setInterval(function () { tracker.tick(); }, 1000);
    w.addEventListener('pagehide', function () { tracker.visibility(false); w.clearInterval(timer); });
    w.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        tracker.visibility(d.visibilityState === 'visible');
        timer = w.setInterval(function () { tracker.tick(); }, 1000);
      }
    });
    if (w.Shopify && !w.Shopify.customerPrivacy && typeof w.Shopify.loadFeatures === 'function') {
      w.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], function (error) {
        if (error) { warn('Dandy funnel privacy API failed: ' + String(error)); return; }
        tracker.start();
      });
    }
  }
  return { createTracker: createTracker, install: install };
});
