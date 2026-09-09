/* Dandy kit QA. Renders sections/dandy-kit-demo.liquid inside layout/dandy-kit.liquid to a static harness (harness.html) with a small
   Liquid subset, then measures it in Playwright at 390, 360 and 1280, plus a behaviour suite (double init, idle rAF, late script,
   section reload). See README.md beside this file for how to run it. Writes harness.html, results.json and results.md beside itself and
   full-page screenshots to shots/ (or $KIT_SHOTS), which are not committed. */
'use strict';
const fs = require('fs');
const path = require('path');

const here = __dirname;
const root = path.resolve(here, '..', '..');
const assetsRel = '../../assets/';
const shotsDir = process.env.KIT_SHOTS || path.join(here, 'shots');

/* ---------- Liquid subset: output with filters, assign, capture, if/elsif/else/unless, for (ranges and arrays), render, comment, schema ---------- */
function loadSnippet(name) { return fs.readFileSync(path.join(root, 'snippets', name + '.liquid'), 'utf8'); }

function tokenize(src) {
  const re = /(\{\{-?[\s\S]*?-?\}\}|\{%-?[\s\S]*?-?%\})/g;
  const out = []; let last = 0, m;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ type: 'text', value: src.slice(last, m.index) });
    const raw = m[0];
    const isTag = raw.startsWith('{%');
    const trimL = raw[2] === '-', trimR = raw[raw.length - 3] === '-';
    const inner = raw.slice(trimL ? 3 : 2, raw.length - (trimR ? 3 : 2)).trim();
    out.push({ type: isTag ? 'tag' : 'out', value: inner, trimL, trimR });
    last = m.index + raw.length;
  }
  if (last < src.length) out.push({ type: 'text', value: src.slice(last) });
  for (let i = 0; i < out.length; i++) {
    if (out[i].type === 'text') continue;
    if (out[i].trimL && i > 0 && out[i - 1].type === 'text') out[i - 1].value = out[i - 1].value.replace(/\s+$/, '');
    if (out[i].trimR && i + 1 < out.length && out[i + 1].type === 'text') out[i + 1].value = out[i + 1].value.replace(/^\s+/, '');
  }
  return out;
}

function lookup(pathExpr, ctx) {
  const parts = pathExpr.match(/[^.[\]]+/g) || [];
  return parts.reduce((o, k) => (o == null ? undefined : o[/^\d+$/.test(k) ? Number(k) : k]), ctx);
}

function parseValue(s, ctx) {
  s = s.trim();
  if (/^'.*'$/s.test(s) || /^".*"$/s.test(s)) return s.slice(1, -1);
  if (s === 'true') return true; if (s === 'false') return false; if (s === 'blank' || s === 'nil' || s === 'empty') return '';
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return lookup(s, ctx);
}

function truthy(v) { return !(v === undefined || v === null || v === false || v === ''); }

function applyFilters(expr, ctx) {
  const parts = expr.split(/\|(?=(?:[^']*'[^']*')*[^']*$)/).map(p => p.trim());
  let v = parseValue(parts[0], ctx);
  for (let i = 1; i < parts.length; i++) {
    const m = parts[i].match(/^(\w+)(?::\s*(.*))?$/s);
    if (!m) continue;
    const name = m[1], args = m[2] ? m[2].split(/,(?=(?:[^']*'[^']*')*[^']*$)/).map(a => parseValue(a, ctx)) : [];
    if (name === 'asset_url') v = assetsRel + String(v);
    else if (name === 'append') v = String(v == null ? '' : v) + String(args[0] == null ? '' : args[0]);
    else if (name === 'default') v = truthy(v) ? v : args[0];
    else if (name === 'escape') v = String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    else if (name === 'stylesheet_tag') v = '<link rel="stylesheet" href="' + v + '">';
    else if (name === 'split') v = String(v == null ? '' : v).split(String(args[0]));
    else if (name === 'strip') v = String(v == null ? '' : v).trim();
    /* unknown filters return the value unchanged */
  }
  return v;
}

function evalCond(expr, ctx) {
  let m = expr.match(/^(.+?)\s*(==|!=|contains)\s*(.+)$/);
  if (m) {
    const a = parseValue(m[1], ctx), b = parseValue(m[3], ctx);
    if (m[2] === 'contains') return truthy(a) && String(a).includes(String(b));
    const eq = (a == null ? '' : a) === (b == null ? '' : b) || (!truthy(a) && !truthy(b));
    return m[2] === '==' ? eq : !eq;
  }
  return truthy(parseValue(expr, ctx));
}

function render(src, ctx) {
  const toks = tokenize(src);
  let i = 0;
  function skipTo(endWord) { while (i < toks.length && !(toks[i].type === 'tag' && toks[i].value.split(/\s+/)[0] === endWord)) i++; i++; }
  function block(stopAt) {
    let out = '';
    while (i < toks.length) {
      const t = toks[i];
      if (t.type === 'text') { out += t.value; i++; continue; }
      if (t.type === 'out') { const v = applyFilters(t.value, ctx); out += v == null ? '' : String(v); i++; continue; }
      const tag = t.value;
      const word = tag.split(/\s+/)[0];
      if (stopAt && stopAt.includes(word)) return out;
      i++;
      if (word === 'comment' || word === 'schema') { skipTo('end' + word); continue; }
      if (word === 'liquid') {
        tag.split('\n').slice(1).map(l => l.trim()).filter(Boolean).forEach(line => { const a = line.match(/^assign\s+(\w+)\s*=\s*(.+)$/); if (a) ctx[a[1]] = applyFilters(a[2], ctx); });
        continue;
      }
      if (word === 'assign') { const a = tag.match(/^assign\s+(\w+)\s*=\s*(.+)$/s); if (a) ctx[a[1]] = applyFilters(a[2], ctx); continue; }
      if (word === 'capture') { const name = tag.split(/\s+/)[1]; const body = block(['endcapture']); i++; ctx[name] = body; continue; }
      if (word === 'render') {
        const m = tag.match(/^render\s+'([^']+)'\s*,?\s*(.*)$/s);
        const args = {};
        if (m[2]) m[2].split(/,(?=(?:[^']*'[^']*')*[^']*$)(?=\s*\w+\s*:)/).forEach(p => { const kv = p.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/s); if (kv) args[kv[1]] = parseValue(kv[2], ctx); });
        out += render(loadSnippet(m[1]), args);
        continue;
      }
      if (word === 'for') {
        const m = tag.match(/^for\s+(\w+)\s+in\s+(.+)$/s);
        let items = [];
        const range = m[2].trim().match(/^\((.+?)\.\.(.+?)\)$/);
        if (range) { const a = Number(parseValue(range[1], ctx)), b = Number(parseValue(range[2], ctx)); for (let k = a; k <= b; k++) items.push(k); }
        else { const v = parseValue(m[2], ctx); items = Array.isArray(v) ? v : (truthy(v) ? [v] : []); }
        const start = i;
        let res = '';
        if (!items.length) { block(['endfor']); i++; continue; }
        items.forEach(item => { i = start; ctx[m[1]] = item; res += block(['endfor']); });
        i++;
        out += res; continue;
      }
      if (word === 'if' || word === 'unless') {
        let taken = false, cond = evalCond(tag.replace(/^(if|unless)\s+/, ''), ctx);
        if (word === 'unless') cond = !cond;
        let res = '';
        let body = block(['elsif', 'else', 'endif', 'endunless']);
        if (cond) { res = body; taken = true; }
        while (i < toks.length) {
          const tt = toks[i].value, w = tt.split(/\s+/)[0]; i++;
          if (w === 'endif' || w === 'endunless') break;
          if (w === 'elsif') { const c = evalCond(tt.replace(/^elsif\s+/, ''), ctx); body = block(['elsif', 'else', 'endif']); if (!taken && c) { res = body; taken = true; } }
          else if (w === 'else') { body = block(['endif', 'endunless']); if (!taken) { res = body; taken = true; } }
        }
        out += res; continue;
      }
      /* unknown tag: drop it */
    }
    return out;
  }
  return block(null);
}

function buildHarness() {
  const section = fs.readFileSync(path.join(root, 'sections', 'dandy-kit-demo.liquid'), 'utf8');
  const body = render(section, { section: { settings: { cta_url: '#offer', video_base: '' } } });
  const layout = fs.readFileSync(path.join(root, 'layout', 'dandy-kit.liquid'), 'utf8');
  const html = render(layout, {
    request: { locale: { iso_code: 'en' } },
    page_title: 'Dandy kit demo harness', page_description: '', canonical_url: 'harness.html',
    template: { suffix: 'dandy-kit-demo' }, page: { metafields: { dandy: {} } },
    content_for_header: '', content_for_layout: body
  });
  fs.writeFileSync(path.join(here, 'harness.html'), html);
  return path.join(here, 'harness.html');
}

/* ---------- Playwright ---------- */
async function launch() {
  const { chromium } = require('playwright');
  try { return { browser: await chromium.launch({ channel: 'chrome' }), channel: 'chrome' }; }
  catch (e) { return { browser: await chromium.launch(), channel: 'chromium' }; }
}

function scrollToSel(page, sel, offset) {
  return page.evaluate(([s, o]) => { const el = document.querySelector(s); document.documentElement.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + o, behavior: 'instant' }); }, [sel, offset]);
}

async function measureViewport(browser, harness, width) {
  const height = width >= 1024 ? 800 : (width === 360 ? 780 : 844);
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 860, hasTouch: width < 860 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + harness, { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const r = { width, height, errors, checks: {} };
  const phone = width <= 860;

  /* 1. No horizontal overflow */
  r.checks.overflow = await page.evaluate(() => {
    const de = document.documentElement;
    const wide = [];
    const clipped = el => { for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'clip') return true; } return false; };
    document.querySelectorAll('body *').forEach(el => { const b = el.getBoundingClientRect(); if (b.width > 0 && (b.right > window.innerWidth + 1 || b.left < -1) && getComputedStyle(el).position !== 'fixed' && !clipped(el)) wide.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') + ' ' + Math.round(b.left) + '..' + Math.round(b.right)); });
    return { scrollWidth: de.scrollWidth, innerWidth: window.innerWidth, pass: de.scrollWidth <= window.innerWidth, offenders: wide.slice(0, 12) };
  });

  /* 2. Dashes in rendered text */
  r.checks.dashes = await page.evaluate(() => { const t = document.body.innerText; const n = (t.match(/[–—]/g) || []).length; return { count: n, pass: n === 0 }; });

  /* 3. Sparkles animate: computed opacity changes between two samples */
  const s1 = await page.evaluate(() => Array.from(document.querySelectorAll('.sparkles i')).map(i => getComputedStyle(i).opacity));
  await page.waitForTimeout(700);
  const s2 = await page.evaluate(() => Array.from(document.querySelectorAll('.sparkles i')).map(i => getComputedStyle(i).opacity));
  const changed = s1.filter((v, k) => v !== s2[k]).length;
  const heroCount = await page.evaluate(() => document.querySelectorAll('.sparkles--hero i').length);
  r.checks.sparkles = { count: s1.length, hero: heroCount, changed, pass: s1.length > 0 && changed > 0 && heroCount === 8 };

  /* 4. Head from the layout: no robots tag unless the page asks for it (the demo template does), og:image from the default asset */
  r.checks.head = await page.evaluate(() => {
    const robots = document.querySelector('meta[name="robots"]'); const og = document.querySelector('meta[property="og:image"]');
    return { robots: robots ? robots.content : null, ogImage: og ? og.content : null, pass: !!robots && !!og && /dandy-og\.jpg$/.test(og.content) };
  });

  /* 5. Facts: a drawn dot never ends a line. Group items by line; the last item on each line has no ::after content. */
  r.checks.factsDots = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('.facts').forEach(f => {
      const items = Array.from(f.children);
      items.forEach((li, k) => {
        const next = items[k + 1];
        const lastOnLine = !next || Math.round(next.getBoundingClientRect().top) > Math.round(li.getBoundingClientRect().top);
        const c = getComputedStyle(li, '::after').content;
        if (lastOnLine && c !== 'none') bad.push(li.textContent.trim());
      });
    });
    return { lists: document.querySelectorAll('.facts').length, lineEndDots: bad, pass: bad.length === 0 };
  });

  /* 6. Instant scroll through the page; every [data-reveal] and [data-inview] reaches is-in */
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= total; y += Math.round(height * 0.6)) {
    await page.evaluate(yy => document.documentElement.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(140);
  }
  await page.evaluate(() => document.documentElement.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(400);
  r.checks.reveal = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('[data-reveal]'));
    const missing = all.filter(el => !el.classList.contains('is-in')).map(el => el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).join('.'));
    const inview = Array.from(document.querySelectorAll('[data-inview]')).filter(el => !el.classList.contains('is-in')).length;
    return { total: all.length, missing, inviewMissing: inview, pass: missing.length === 0 && inview === 0 };
  });

  /* 7. Loop paints VIDEO at centre (or the poster if the source cannot play) */
  await scrollToSel(page, '.stage .loop', -80);
  await page.waitForTimeout(2500);
  r.checks.loop = await page.evaluate(() => {
    const fig = document.querySelector('.stage .loop'); const b = fig.getBoundingClientRect();
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    const hitEl = document.elementFromPoint(cx, cy); const hit = hitEl ? hitEl.tagName : null;
    const v = fig.querySelector('video');
    const boards = Array.from(document.querySelectorAll('.loop')).map(f => ({ name: f.getAttribute('data-loop'), playing: f.classList.contains('is-playing'), still: f.classList.contains('is-still'), held: f.classList.contains('is-held'), preload: f.querySelector('video').preload }));
    return { hit: hit, playing: fig.classList.contains('is-playing'), still: fig.classList.contains('is-still'), readyState: v.readyState, paused: v.paused, error: v.error ? v.error.code : null, loops: boards, pass: (hit === 'VIDEO' && fig.classList.contains('is-playing')) || (hit === 'IMG' && (fig.classList.contains('is-still') || v.readyState < 3)), paintsVideo: hit === 'VIDEO' };
  });

  /* 8. Loop-driven label: with nobody picking, the stage state follows the loop's time at the bounds (2.5 and 4.9 on the demo) and the loop word swaps */
  r.checks.statesDriven = await page.evaluate(async () => {
    const st = document.querySelector('.stage'); const v = st.querySelector('.loop video');
    const at = async t => { v.currentTime = t; await new Promise(r => setTimeout(r, 250)); return st.getAttribute('data-state') + '/' + (st.querySelector('.loop__word b.is-on') || {}).getAttribute?.('data-for'); };
    if (v.paused || !isFinite(v.duration)) return { skipped: 'loop not playing', pass: true };
    const a = await at(2.0), b = await at(2.6), c = await at(5.0);
    return { at2: a, at2_6: b, at5: c, held: st.querySelector('.loop').classList.contains('is-held'), pass: a === 'lift/lift' && b === 'focus/focus' && c === 'settle/settle' };
  });

  /* 9. Sticky bar appears once the hero CTA is past and no other button is on screen (phones only; hidden on desktop), and is inert while off */
  await scrollToSel(page, '.board', 40);
  await page.waitForTimeout(600);
  r.checks.sticky = await page.evaluate(() => {
    const s = document.querySelector('.sticky'); const cs = getComputedStyle(s); const b = s.getBoundingClientRect();
    const btns = Array.from(document.querySelectorAll('main .btn')).filter(el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; }).length;
    const heroGone = document.querySelector('[data-sticky-anchor]').getBoundingClientRect().bottom < 0;
    const phone = innerWidth <= 860;
    const shown = s.classList.contains('is-on') && cs.display !== 'none' && b.bottom <= innerHeight + 1 && b.top < innerHeight;
    return { phone, isOn: s.classList.contains('is-on'), display: cs.display, top: Math.round(b.top), bottom: Math.round(b.bottom), innerHeight, buttonsOnScreen: btns, heroGone, ariaHidden: s.getAttribute('aria-hidden'), inert: s.inert, pass: phone ? (shown && btns === 0 && heroGone && s.inert === false) : cs.display === 'none' };
  });
  /* the product name stays on one line while the bar is up */
  r.checks.stickyName = await page.evaluate(() => {
    const b = document.querySelector('.sticky__info b'); const cs = getComputedStyle(b);
    const lines = b.getClientRects().length; const h = b.getBoundingClientRect().height; const fs = parseFloat(cs.fontSize);
    const bar = document.querySelector('.sticky'); const btn = bar.querySelector('.btn').getBoundingClientRect(); const info = bar.querySelector('.sticky__info').getBoundingClientRect();
    return { text: b.textContent, fontSize: fs, height: Math.round(h), overlap: Math.round(info.right - btn.left), pass: innerWidth > 860 || (h <= fs * 1.3 && lines <= 1 && info.right <= btn.left + 1) };
  });
  /* sticky hides again while the offer button is on screen */
  await page.evaluate(() => { const el = document.querySelector('.offer__cta'); document.documentElement.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - innerHeight / 2, behavior: 'instant' }); });
  await page.waitForTimeout(500);
  r.checks.stickyYields = await page.evaluate(() => { const s = document.querySelector('.sticky'); return { isOn: s.classList.contains('is-on'), ctaOnScreen: document.body.classList.contains('cta-on-screen'), inert: s.inert, pass: !s.classList.contains('is-on') && document.body.classList.contains('cta-on-screen') && s.inert === true }; });

  /* 10. Offer copy is not double-gutted: on phones its content width equals the hero copy's; on desktop it fills its grid column */
  r.checks.offerWidth = await page.evaluate(() => {
    const content = el => { const cs = getComputedStyle(el); return el.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); };
    const offer = document.querySelector('.offer__copy'), hero = document.querySelector('.hero__copy'), layout = document.querySelector('.offer__layout');
    const col = parseFloat(getComputedStyle(layout).gridTemplateColumns.split(' ').pop());
    const o = content(offer), h = content(hero), box = offer.getBoundingClientRect().width;
    /* desktop: cshop's copy is shrink-to-fit and centred in its column by .wrap's auto margins; the bug was .wrap's width formula (column minus two gutters) constraining it */
    const pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad')) || (innerWidth * 0.05);
    const wrapWidth = Math.min(1180, col - 2 * pad);
    return innerWidth <= 860 ? { offerContent: o, heroContent: h, pass: Math.abs(o - h) < 1 } : { offerBox: box, column: col, wrapWidth, pass: box > wrapWidth + 1 && box <= col + 1 };
  });

  /* 11. Large button sizes: phones keep 23px on the offer and close buttons and 21px on the hero button (cshop); 18px on all three at 360; 23px on desktop */
  r.checks.btnLg = await page.evaluate(() => {
    const fs = sel => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
    const hero = fs('.hero__cta .btn--lg'), offer = fs('.offer__cta'), close = fs('.close .btn--lg');
    const w = innerWidth;
    const want = w <= 360 ? [18, 18, 18] : (w <= 860 ? [21, 23, 23] : [23, 23, 23]);
    return { hero, offer, close, want, pass: hero === want[0] && offer === want[1] && close === want[2] };
  });

  /* 12. The clip row's loop: visible and full-bleed on phones, in the aside on desktop */
  r.checks.cliprowLoop = await page.evaluate(() => {
    const el = document.querySelector('.cliprow__loop'); if (!el) return { pass: false, missing: true };
    const cs = getComputedStyle(el); const b = el.getBoundingClientRect();
    const phone = innerWidth <= 860;
    return { display: cs.display, left: Math.round(b.left), width: Math.round(b.width), pass: cs.display !== 'none' && (phone ? (Math.abs(b.left) < 1 && Math.abs(b.width - innerWidth) < 1) : b.width > 0) };
  });

  /* 13. Scrawl draws to stroke-dashoffset 0 in view (underline in the offer, strikes on the strip, signature in the close) */
  async function scrawlAt(sel, ctxSel) {
    await page.evaluate(s => { const el = document.querySelector(s); document.documentElement.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - innerHeight / 3, behavior: 'instant' }); }, ctxSel);
    await page.waitForTimeout(1900);
    return page.evaluate(s => { const p = document.querySelector(s + ' path'); const v = getComputedStyle(p).strokeDashoffset; return { value: v, pass: parseFloat(v) === 0 }; }, sel);
  }
  r.checks.scrawlUnderline = await scrawlAt('.offer__copy .scrawl', '.offer__copy');
  r.checks.scrawlStrike = await scrawlAt('.strip__word .scrawl--strike', '.strip__old');
  r.checks.scrawlSignature = await scrawlAt('.close .scrawl--signature', '.close__copy');

  /* 14. Hero drift: the settle animation is cleared and the transform follows scroll */
  await page.evaluate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  const g0 = await page.evaluate(() => { const g = document.querySelector('.hero__giant'); return { anim: getComputedStyle(g).animationName, t: getComputedStyle(g).transform }; });
  await page.evaluate(() => document.documentElement.scrollTo({ top: 300, behavior: 'instant' }));
  await page.waitForTimeout(250);
  const g1 = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__giant')).transform);
  r.checks.heroDrift = { animationCleared: g0.anim === 'none', at0: g0.t, at300: g1, pass: g0.anim === 'none' && g0.t !== g1 };

  /* 15. States: click the second word, belt marker moves, loop word swaps, the loop is cued and held at data-end */
  await scrollToSel(page, '.stage', -40);
  await page.waitForTimeout(300);
  const m0 = await page.evaluate(() => { const st = document.querySelector('.stage'); return { left: document.querySelector('.belt__marker').getBoundingClientRect().left, state: st.getAttribute('data-state') }; });
  await page.click('.state[data-state="focus"]');
  await page.waitForTimeout(2600);
  r.checks.states = await page.evaluate(m => {
    const st = document.querySelector('.stage'); const m1 = document.querySelector('.belt__marker').getBoundingClientRect().left;
    const sel = Array.from(document.querySelectorAll('.state')).map(s => s.getAttribute('aria-selected') + '/' + s.tabIndex);
    const on = Array.from(st.querySelectorAll('.loop__word b')).filter(b => b.classList.contains('is-on')).map(b => b.getAttribute('data-for'));
    const v = st.querySelector('.loop video'); const fig = st.querySelector('.loop');
    const playable = isFinite(v.duration) && !fig.classList.contains('is-still');
    const heldRight = !playable || (fig.classList.contains('is-held') && v.paused && v.currentTime >= 4.7 && v.currentTime <= 4.85 && v.loop === false);
    const belt = document.querySelector('.belt').getBoundingClientRect(), mk = document.querySelector('.belt__marker').getBoundingClientRect();
    const centred = Math.abs((mk.left + mk.width / 2) - (belt.left + belt.width / 2)) < 2; /* the marker sits under the middle word */
    return { state: st.getAttribute('data-state'), before: m, markerAfter: Math.round(m1), markerCentred: centred, tabs: sel, loopWord: on, held: fig.classList.contains('is-held'), time: Math.round(v.currentTime * 100) / 100, pass: st.getAttribute('data-state') === 'focus' && m1 !== m.left && centred && sel.join(',') === 'false/-1,true/0,false/-1' && on.join() === 'focus' && heldRight };
  }, m0);
  /* leaving the stage releases the hold without playing off screen; coming back plays again */
  await page.evaluate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(500);
  const away = await page.evaluate(() => { const fig = document.querySelector('.stage .loop'); const v = fig.querySelector('video'); return { held: fig.classList.contains('is-held'), paused: v.paused, loop: v.loop }; });
  await scrollToSel(page, '.stage', -40);
  await page.waitForTimeout(1200);
  r.checks.statesRelease = await page.evaluate(a => { const fig = document.querySelector('.stage .loop'); const v = fig.querySelector('video'); const playable = isFinite(v.duration) && !fig.classList.contains('is-still'); return { away: a, backPlaying: !v.paused, pass: !a.held && a.paused && a.loop === true && (!playable || !v.paused) }; }, away);

  /* 16. Clip fallback: an error on the last source shows the poster, hides the video and the play button, without !important */
  r.checks.clipFallback = await page.evaluate(() => {
    const slot = document.querySelector('#clip-05'); const v = slot.querySelector('video'); const src = v.querySelectorAll('source'); src[src.length - 1].dispatchEvent(new Event('error'));
    const d = el => getComputedStyle(el).display;
    return { video: d(v), fallback: d(slot.querySelector('.clip__fallback')), play: d(slot.querySelector('.clip__play')), pass: d(v) === 'none' && d(slot.querySelector('.clip__fallback')) === 'block' && d(slot.querySelector('.clip__play')) === 'none' };
  });

  /* 17. Card and pill inventory for the QA record */
  r.checks.inventory = await page.evaluate(() => {
    const rounded = Array.from(document.querySelectorAll('body *')).filter(el => { const cs = getComputedStyle(el); return parseFloat(cs.borderTopLeftRadius) > 0 && (parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none') && el.getBoundingClientRect().width > 0; }).map(el => el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.'));
    const pills = Array.from(document.querySelectorAll('body *')).filter(el => parseFloat(getComputedStyle(el).borderTopLeftRadius) >= 999 && el.getBoundingClientRect().width > 0 && !el.classList.contains('btn')).map(el => el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.'));
    return { roundedBordered: rounded, nonButtonPills: pills, pass: pills.length === 0 };
  });

  /* Screenshots: full page with fixed elements unfixed, instant scroll only */
  await page.addStyleTag({ content: '.sticky,.topbar{position:static!important}' });
  await page.evaluate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  fs.mkdirSync(shotsDir, { recursive: true });
  await page.screenshot({ path: path.join(shotsDir, `harness-${width}.png`), fullPage: true });
  await context.close();
  return r;
}

/* Behaviour suite at 390: things a viewport pass cannot see */
async function behaviour(browser, harness) {
  const out = {};
  const kitJs = path.join(root, 'assets', 'dandy-kit.js');
  async function fresh(opts, before) {
    const context = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, opts || {}));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    if (before) await before(page);
    await page.goto('file://' + harness, { waitUntil: 'load' });
    return { page, context, errors };
  }

  /* a. Double init: DandyKit.init(document) twice, then one tap on a clip plays it and it stays playing (no second handler pausing it) */
  {
    const { page, context, errors } = await fresh();
    await page.waitForTimeout(800);
    const marks = await page.evaluate(() => { DandyKit.init(document); DandyKit.init(document); return { clipMarks: document.querySelectorAll('.clip[data-kit-clip]').length, clips: document.querySelectorAll('.clip').length }; });
    await scrollToSel(page, '#clip-01', -120);
    await page.waitForTimeout(400);
    await page.click('#clip-01 .clip__frame');
    await page.waitForTimeout(900);
    const st = await page.evaluate(() => { const v = document.querySelector('#clip-01 video'); return { paused: v.paused, playing: document.querySelector('#clip-01').classList.contains('is-playing'), muted: v.muted, error: v.error ? v.error.code : null }; });
    out.doubleInit = Object.assign(marks, st, { errors, pass: marks.clipMarks === marks.clips && (st.error !== null || (!st.paused && st.playing)) && errors.length === 0 });
    await context.close();
  }

  /* b. No perpetual rAF: after tapping a state with the stage video paused (reduced motion, then an explicit pause), rAF callbacks over one second are 0 */
  for (const variant of ['reduce', 'paused']) {
    const { page, context } = await fresh(variant === 'reduce' ? { reducedMotion: 'reduce' } : {});
    await page.waitForTimeout(600);
    await scrollToSel(page, '.stage', -40);
    await page.waitForTimeout(variant === 'reduce' ? 400 : 2000);
    await page.click('.state[data-state="focus"]');
    await page.waitForTimeout(300);
    const res = await page.evaluate(async v => {
      const video = document.querySelector('.stage .loop video');
      if (v === 'paused') { video.pause(); await new Promise(r => setTimeout(r, 120)); }
      let n = 0; const orig = window.requestAnimationFrame;
      window.requestAnimationFrame = function (cb) { n++; return orig.call(window, cb); };
      await new Promise(r => setTimeout(r, 1000));
      window.requestAnimationFrame = orig;
      return { rafCalls: n, paused: video.paused, still: document.querySelector('.stage .loop').classList.contains('is-still'), state: document.querySelector('.stage').getAttribute('data-state') };
    }, variant);
    out['rafIdle_' + variant] = Object.assign(res, { pass: res.rafCalls === 0 && res.paused && res.state === 'focus' });
    await context.close();
  }

  /* c. Late script: the kit loads after the hero's settle has finished, and the drift is still armed */
  {
    const { page, context } = await fresh({}, async p => { await p.route('**/dandy-kit.js', r => r.abort()); });
    await page.waitForTimeout(1700);
    const before = await page.evaluate(() => ({ kit: typeof window.DandyKit, anim: getComputedStyle(document.querySelector('.hero__giant')).animationName, running: document.querySelector('.hero__giant').getAnimations().filter(a => a.playState === 'running').length }));
    await page.addScriptTag({ path: kitJs });
    await page.evaluate(() => DandyKit.init());
    await page.waitForTimeout(200);
    const g0 = await page.evaluate(() => { const g = document.querySelector('.hero__giant'); return { anim: getComputedStyle(g).animationName, t: getComputedStyle(g).transform }; });
    await page.evaluate(() => document.documentElement.scrollTo({ top: 300, behavior: 'instant' }));
    await page.waitForTimeout(250);
    const t300 = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__giant')).transform);
    out.heroLate = { before, animationCleared: g0.anim === 'none', at0: g0.t, at300: t300, pass: before.kit === 'undefined' && before.running === 0 && g0.anim === 'none' && g0.t !== t300 };
    await context.close();
  }

  /* d. Theme editor: shopify:section:load on a new section binds its nodes (reveal marks, reviews link) and the sticky bar re-queries its buttons */
  {
    const { page, context, errors } = await fresh();
    await page.waitForTimeout(600);
    const res = await page.evaluate(async () => {
      const sec = document.createElement('div'); sec.className = 'shopify-section';
      sec.innerHTML = '<section class="sec" id="late"><p data-reveal>late</p><div class="revs" id="revs-late"></div><button class="revs__more" type="button" aria-controls="revs-late">more</button><a class="btn" href="#offer">Late button</a></section>';
      document.querySelector('main').appendChild(sec);
      const beforeMark = !!sec.querySelector('[data-reveal]').dataset.kitReveal;
      sec.dispatchEvent(new Event('shopify:section:load', { bubbles: true }));
      sec.querySelector('.revs__more').click();
      await new Promise(r => setTimeout(r, 50));
      const btn = sec.querySelector('.btn');
      btn.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise(r => setTimeout(r, 400));
      return { beforeMark, revealMark: sec.querySelector('[data-reveal]').dataset.kitReveal === '1', reviewsOpen: document.getElementById('revs-late').classList.contains('is-open'), ctaOnScreen: document.body.classList.contains('cta-on-screen'), stickyOn: document.querySelector('.sticky').classList.contains('is-on') };
    });
    out.sectionLoad = Object.assign(res, { errors, pass: !res.beforeMark && res.revealMark && res.reviewsOpen && res.ctaOnScreen && !res.stickyOn && errors.length === 0 });
    await context.close();
  }
  return out;
}

function summarize(results) {
  const lines = ['# Dandy kit QA results', '', `Browser: ${results.channel}. Harness: qa/dandy-kit/harness.html rendered from layout/dandy-kit.liquid and sections/dandy-kit-demo.liquid. Screenshots are written to qa/dandy-kit/shots/ and are not committed.`, ''];
  let allPass = true;
  const table = (checks) => {
    const rows = ['| Check | Result | Detail |', '|---|---|---|'];
    for (const [name, c] of Object.entries(checks)) {
      const detail = Object.entries(c).filter(([k]) => k !== 'pass').map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('; ').replace(/\|/g, '\\|');
      rows.push(`| ${name} | ${c.pass ? 'pass' : 'FAIL'} | ${detail.slice(0, 600)} |`);
      if (!c.pass) allPass = false;
    }
    return rows;
  };
  for (const w of Object.keys(results.viewports)) {
    const r = results.viewports[w];
    lines.push(`## ${w}px`, '', ...table(r.checks), '', `Page errors: ${r.errors.length ? r.errors.join(' / ') : 'none'}`, '');
  }
  lines.push('## Behaviour (390px)', '', ...table(results.behaviour), '');
  lines.push(allPass ? 'All checks passed.' : 'Some checks failed.');
  return lines.join('\n');
}

(async () => {
  const harness = buildHarness();
  console.log('harness written:', harness);
  if (process.argv.includes('--harness-only')) return;
  const { browser, channel } = await launch();
  const results = { channel, viewports: {}, behaviour: {} };
  for (const width of [390, 360, 1280]) results.viewports[width] = await measureViewport(browser, harness, width);
  results.behaviour = await behaviour(browser, harness);
  await browser.close();
  fs.writeFileSync(path.join(here, 'results.json'), JSON.stringify(results, null, 2));
  const md = summarize(results);
  fs.writeFileSync(path.join(here, 'results.md'), md);
  console.log(md);
  if (md.endsWith('Some checks failed.')) process.exitCode = 2;
})().catch(e => { console.error(e); process.exit(1); });
