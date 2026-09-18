const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTracker, install } = require('../assets/dandy-jack-tracking.js');

function fixture(options = {}) {
  let consent = options.consent ?? true;
  let now = 1_000_000;
  const events = [], writes = [], warnings = [];
  const values = options.values || new Map();
  const tracker = createTracker({
    url: options.url || 'https://foreverdandy.com/pages/jack',
    consent: () => consent,
    now: () => now,
    storage: {
      getItem: key => values.get(key) || null,
      setItem: (key, value) => { writes.push(key); values.set(key, value); },
      removeItem: key => values.delete(key),
    },
    send: (name, params) => { events.push({ name, params }); return true; },
    warn: message => warnings.push(message),
    ...options.env,
  });
  return { tracker, events, values, writes, warnings,
    consent: value => { consent = value; },
    advance: value => { now += value; } };
}

test('entry is recorded once after analytics consent; denied visits never write attribution', () => {
  const f = fixture({ consent: false });
  f.tracker.start();
  assert.deepEqual(f.events, []);
  assert.deepEqual(f.writes, []);
  f.consent(true);
  f.tracker.start();
  f.tracker.start();
  assert.equal(f.events.length, 1);
  assert.equal(f.events[0].name, 'dandy_funnel_entry');
  assert.equal(f.events[0].params.funnel_page, 'jack');
});

test('Jack cohort and paid campaign survive the discount redirect without decorating internal URLs', () => {
  const jack = fixture({ url: 'https://foreverdandy.com/pages/jack?utm_source=whop&utm_campaign=DND_260918_CAP_SONG_ABO&utm_content=ad_123&email=private@example.com' });
  jack.tracker.start();
  jack.tracker.click('https://foreverdandy.com/discount/DISPATCH10?redirect=%2Fproducts%2Fextract-capsules%3Fstrength%3D90%26bundle%3D3', 'offer');
  assert.equal(jack.events[1].name, 'dandy_product_click');
  assert.equal(jack.events[1].params.cta_id, 'offer');
  assert.equal(jack.events[1].params.destination_path, '/products/extract-capsules');
  const pdp = fixture({ url: 'https://foreverdandy.com/products/extract-capsules?strength=90&bundle=3', values: jack.values });
  pdp.tracker.start();
  assert.equal(pdp.events[0].params.funnel_origin, 'jack');
  assert.equal(pdp.events[0].params.jack_campaign, 'DND_260918_CAP_SONG_ABO');
  assert.equal(pdp.events[0].params.jack_content, 'ad_123');
  assert.equal(pdp.events[0].params.jack_cta, 'offer');
  assert.ok(!JSON.stringify([...jack.values]).includes('private@'));
});

test('in-page offer jumps are separate; unrelated/external/malformed destinations are ignored', () => {
  const f = fixture();
  f.tracker.start();
  f.tracker.click('#claim-offer', 'mechanism');
  f.tracker.click('https://other.example/products/extract-capsules', 'external');
  f.tracker.click('/discount/DISPATCH10?redirect=https://other.example/products/extract-capsules', 'external');
  f.tracker.click('/pages/contact', 'footer');
  f.tracker.click('http://[', 'invalid');
  assert.deepEqual(f.events.map(e => e.name), ['dandy_funnel_entry', 'dandy_offer_jump']);
});

test('direct PDP and expired Jack visits are not attributed to Jack', () => {
  const jack = fixture();
  jack.tracker.start();
  const expired = fixture({ url: 'https://foreverdandy.com/products/extract-capsules', values: jack.values });
  expired.advance(31 * 60_000);
  expired.tracker.start();
  assert.equal(expired.events[0].params.funnel_origin, 'direct_pdp');
  const direct = fixture({ url: 'https://foreverdandy.com/products/extract-capsules' });
  direct.tracker.start();
  assert.equal(direct.events[0].params.funnel_origin, 'direct_pdp');
});

test('QA URLs and previews emit no customer events, including after navigation', () => {
  for (const suffix of ['?dandy_qa=1', '?utm_source=internal_qa', '?preview_theme_id=123']) {
    const jack = fixture({ url: 'https://foreverdandy.com/pages/jack' + suffix });
    jack.tracker.start();
    jack.tracker.click('/products/extract-capsules', 'offer');
    assert.deepEqual(jack.events, []);
    const pdp = fixture({ url: 'https://foreverdandy.com/products/extract-capsules', values: jack.values });
    pdp.tracker.start();
    assert.deepEqual(pdp.events, []);
  }
});

test('scroll thresholds fire once per page, not while denied or hidden', () => {
  const f = fixture({ consent: false });
  f.tracker.depth(95);
  assert.deepEqual(f.events, []);
  f.consent(true);
  f.tracker.start();
  f.tracker.depth(51);
  f.tracker.depth(30);
  f.tracker.visibility(false);
  f.tracker.depth(99);
  f.tracker.visibility(true);
  f.tracker.depth(95);
  assert.deepEqual(f.events.filter(e => e.name === 'dandy_scroll_depth').map(e => e.params.percent_scrolled), [25, 50, 75, 90]);
});

test('active time excludes hidden, denied and idle time, and resumes after interaction', () => {
  const f = fixture({ consent: false });
  f.advance(90_000);
  f.tracker.tick();
  f.consent(true);
  f.tracker.start();
  f.advance(15_000);
  f.tracker.tick();
  assert.deepEqual(f.events.filter(e => e.name === 'dandy_active_time').map(e => e.params.active_seconds), [15]);
  f.tracker.visibility(false);
  f.advance(120_000);
  f.tracker.tick();
  f.tracker.visibility(true);
  f.tracker.activity();
  f.advance(15_000);
  f.tracker.tick();
  assert.deepEqual(f.events.filter(e => e.name === 'dandy_active_time').map(e => e.params.active_seconds), [15, 30]);
  f.advance(120_000);
  f.tracker.tick();
  assert.deepEqual(f.events.filter(e => e.name === 'dandy_active_time').map(e => e.params.active_seconds), [15, 30, 60]);
  f.tracker.activity();
  f.advance(45_000);
  f.tracker.tick();
  assert.deepEqual(f.events.filter(e => e.name === 'dandy_active_time').map(e => e.params.active_seconds), [15, 30, 60, 120]);
});

test('consent withdrawal clears attribution and suppresses later events', () => {
  const f = fixture();
  f.tracker.start();
  f.consent(false);
  f.tracker.depth(90);
  f.tracker.click('/products/extract-capsules', 'offer');
  f.advance(120_000);
  f.tracker.tick();
  assert.equal(f.values.size, 0);
  assert.equal(f.events.length, 1);
});

test('blocked storage is reported without breaking navigation or first-page measurement', () => {
  const f = fixture({ env: { storage: { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } } } });
  f.tracker.start();
  f.tracker.click('/products/extract-capsules', 'offer');
  assert.equal(f.events.length, 2);
  assert.ok(f.warnings.some(w => w.includes('denied')));
});

function browserFixture(options = {}) {
  const listeners = {}, intervals = [], ga = [], clarity = [], logs = [];
  const values = options.values || new Map();
  const scroller = { scrollTop: 0, scrollHeight: 2000, clientHeight: 500 };
  const wrapper = { scrollTop: 1100, scrollHeight: 2000, clientHeight: 500 };
  const document = {
    visibilityState: 'visible', scrollingElement: scroller,
    addEventListener: (name, fn) => { listeners[name] = fn; },
    querySelector: sel => sel === '.page-wrapper' && options.desktop ? wrapper : null,
    querySelectorAll: () => [],
  };
  const window = {
    document, location: { href: options.url || 'https://foreverdandy.com/pages/jack' },
    Shopify: { customerPrivacy: { analyticsProcessingAllowed: () => options.consent !== false } },
    sessionStorage: { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) },
    gtag: (...args) => ga.push(args), clarity: (...args) => clarity.push(args),
    console: { info: (...args) => logs.push(args), warn: (...args) => logs.push(args) },
    addEventListener: (name, fn) => { listeners[name] = fn; },
    setInterval: fn => { intervals.push(fn); return 1; },
    clearInterval: () => {},
    getComputedStyle: () => ({ overflowY: 'auto' }),
    ...options.window,
  };
  return { window, document, listeners, intervals, ga, clarity, logs, values, scroller, wrapper };
}

test('browser adapter uses only existing GA4 event transport and Clarity, with desktop container scroll', () => {
  const b = browserFixture({ desktop: true, url: 'https://foreverdandy.com/products/extract-capsules' });
  install(b.window);
  assert.equal(b.ga[0][0], 'event');
  assert.equal(b.ga[0][1], 'dandy_funnel_entry');
  assert.equal(b.ga[0][2].send_to, 'G-YJKXWL2V3Y');
  assert.ok(b.ga.every(e => e[0] === 'event'));
  b.listeners.scroll({ isTrusted: true });
  assert.deepEqual(b.ga.filter(e => e[1] === 'dandy_scroll_depth').map(e => e[2].percent_scrolled), [25, 50, 75]);
  assert.ok(b.clarity.some(e => e[0] === 'set' && e[1] === 'funnel_page' && e[2] === 'capsule_pdp'));
  install(b.window);
  assert.equal(b.ga.filter(e => e[1] === 'dandy_funnel_entry').length, 1);
});

test('browser adapter captures nested CTA targets without preventing navigation', () => {
  const b = browserFixture();
  install(b.window);
  const anchor = { href: 'https://foreverdandy.com/discount/DISPATCH10?redirect=%2Fproducts%2Fextract-capsules',
    getAttribute: () => 'offer', closest: () => null };
  b.listeners.click({ isTrusted: true, target: { closest: () => anchor } });
  assert.equal(b.ga.at(-1)[1], 'dandy_product_click');
});

test('late Google tag retries entry, unknown consent fails closed, unrelated pages stay untouched', () => {
  const late = browserFixture({ window: { gtag: undefined } });
  install(late.window);
  assert.deepEqual(late.ga, []);
  late.window.gtag = (...args) => late.ga.push(args);
  late.intervals[0]();
  assert.equal(late.ga[0][1], 'dandy_funnel_entry');
  const unknown = browserFixture({ window: { Shopify: {} } });
  install(unknown.window);
  assert.deepEqual(unknown.ga, []);
  assert.equal(unknown.values.size, 0);
  const unrelated = browserFixture({ url: 'https://foreverdandy.com/pages/cshop' });
  install(unrelated.window);
  assert.equal(unrelated.intervals.length, 0);
  assert.deepEqual(unrelated.ga, []);
});

test('QA collection mode sends only labeled probes and remains isolated on the PDP', () => {
  const jack = browserFixture({ url: 'https://foreverdandy.com/pages/jack?dandy_qa=collect&utm_source=internal_qa' });
  install(jack.window);
  assert.equal(jack.ga[0][1], 'dandy_qa_probe');
  assert.equal(jack.ga[0][2].probe_event, 'dandy_funnel_entry');
  assert.equal(jack.ga[0][2].traffic_type, 'internal');
  assert.equal(jack.ga[0][2].debug_mode, true);
  const pdp = browserFixture({ url: 'https://foreverdandy.com/products/extract-capsules', values: jack.values });
  install(pdp.window);
  assert.equal(pdp.ga[0][1], 'dandy_qa_probe');
  assert.equal(pdp.ga[0][2].funnel_origin, 'jack');
  assert.equal(pdp.ga[0][2].funnel_page, 'capsule_pdp');
});

test('dry QA logs diagnostic events only; mobile scroll and page lifecycle are supported', () => {
  const b = browserFixture({ url: 'https://foreverdandy.com/pages/jack?dandy_qa=1' });
  install(b.window);
  b.scroller.scrollTop = 1300;
  b.listeners.scroll({ isTrusted: true });
  b.document.visibilityState = 'hidden';
  b.listeners.visibilitychange();
  b.listeners.pagehide();
  b.document.visibilityState = 'visible';
  b.listeners.pageshow({ persisted: true });
  b.listeners.visitorConsentCollected();
  b.listeners.pointerdown({ isTrusted: true });
  b.listeners.auxclick({ button: 2 });
  b.listeners.click({ isTrusted: false });
  assert.deepEqual(b.ga, []);
  assert.deepEqual(b.clarity, []);
  assert.ok(b.logs.some(log => log[1] === 'dandy_scroll_depth' && JSON.parse(log[2]).percent_scrolled === 90));
});

test('privacy API load failure is logged and never bypassed', () => {
  const failed = browserFixture({ window: { Shopify: { loadFeatures: (features, fn) => fn(Error('load failure')) } } });
  install(failed.window);
  assert.deepEqual(failed.ga, []);
  assert.ok(failed.logs.some(log => log[0].includes('privacy API failed')));
  const late = browserFixture({ window: { Shopify: {} } });
  late.window.Shopify.loadFeatures = (features, fn) => {
    late.window.Shopify.customerPrivacy = { analyticsProcessingAllowed: () => true }; fn();
  };
  install(late.window);
  assert.equal(late.ga.length, 1);
});

test('fresh paid PDP entry does not inherit an older Jack campaign', () => {
  const jack = fixture(); jack.tracker.start();
  const pdp = fixture({ url: 'https://foreverdandy.com/products/extract-capsules?utm_campaign=other', values: jack.values });
  pdp.tracker.start();
  assert.equal(pdp.events[0].params.funnel_origin, 'direct_pdp');
});

test('consent denied on the next page deletes this collector’s stored attribution', () => {
  const jack = fixture(); jack.tracker.start();
  const denied = fixture({ consent: false, values: jack.values });
  denied.tracker.start();
  assert.equal(denied.values.size, 0);
});

test('same-tab attribution expires even if the Jack page remains open', () => {
  const jack = fixture(); jack.tracker.start();
  jack.advance(31 * 60_000);
  jack.tracker.click('/products/extract-capsules', 'offer');
  assert.equal(jack.events.at(-1).params.jack_campaign, '');
  // Jack itself is still the origin of this fresh click, but no stale paid attribution.
  const paid = fixture({ url: 'https://foreverdandy.com/pages/jack?utm_campaign=old' });
  paid.tracker.start(); paid.advance(31 * 60_000);
  paid.tracker.click('/products/extract-capsules', 'offer');
  assert.equal(paid.events.at(-1).params.jack_campaign, '');
});

test('stable Whop IDs and placement survive Jack to PDP for per-ad analysis', () => {
  const jack = fixture({ url: 'https://foreverdandy.com/pages/jack?utm_campaign=test&waid=ad_QA&wasid=adgrp_QA&wacid=adcamp_QA&utm_placement=feed' });
  jack.tracker.start();
  const pdp = fixture({ url: 'https://foreverdandy.com/products/extract-capsules', values: jack.values });
  pdp.tracker.start();
  assert.equal(pdp.events[0].params.jack_ad_id, 'ad_QA');
  assert.equal(pdp.events[0].params.jack_adset_id, 'adgrp_QA');
  assert.equal(pdp.events[0].params.jack_campaign_id, 'adcamp_QA');
  assert.equal(pdp.events[0].params.jack_placement, 'feed');
});
