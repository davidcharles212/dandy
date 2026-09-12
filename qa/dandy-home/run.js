/* Dandy homepage QA. Renders sections/dandy-home.liquid inside layout/dandy-home.liquid to a static harness (harness.html)
   with a small Liquid subset (adapted from qa/dandy-kit/run.js), then measures the blueprint's section 11 gates that a static
   harness can see, at 390, 430, 768 and 1280 (plus 375 for the hero composition), in Playwright. Writes harness.html,
   results.json and results.md beside itself and full-page screenshots to shots/ (or $HOME_SHOTS), which are not committed.
   See README.md beside this file. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const here = __dirname;
const root = path.resolve(here, '..', '..');
const assetsRel = '../../assets/';
const shotsDir = process.env.HOME_SHOTS || path.join(here, 'shots');
const WIDTHS = [390, 430, 768, 1280];
const HERO_WIDTHS = [375, 390, 430];

/* ---------- Liquid subset ---------- */
const stubs = {
  /* the shared cart drawer's inner snippet uses liquid blocks the subset cannot run; it is hidden on load, so a stub stands in */
  'dandy2-cart-drawer': '<div class="dcart" data-d2-cart hidden aria-hidden="true"><div class="dcart__panel" role="dialog"></div></div>'
};
function loadSnippet(name) { if (stubs[name]) return stubs[name]; return fs.readFileSync(path.join(root, 'snippets', name + '.liquid'), 'utf8'); }

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
  return parts.reduce((o, k) => {
    if (o == null) return undefined;
    if (k === 'size' && (Array.isArray(o) || typeof o === 'string')) return o.length;
    return o[/^\d+$/.test(k) ? Number(k) : k];
  }, ctx);
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
    else if (name === 'date') v = String(args[0]).replace('%Y', String(new Date().getFullYear()));
    /* unknown filters return the value unchanged */
  }
  return v;
}

function evalOne(expr, ctx) {
  let m = expr.match(/^(.+?)\s*(==|!=|contains|>=|<=|>|<)\s*(.+)$/);
  if (m) {
    const a = parseValue(m[1], ctx), b = parseValue(m[3], ctx);
    if (m[2] === 'contains') return truthy(a) && String(a).includes(String(b));
    if (m[2] === '>') return Number(a) > Number(b);
    if (m[2] === '<') return Number(a) < Number(b);
    if (m[2] === '>=') return Number(a) >= Number(b);
    if (m[2] === '<=') return Number(a) <= Number(b);
    const eq = (a == null ? '' : a) === (b == null ? '' : b) || (!truthy(a) && !truthy(b));
    return m[2] === '==' ? eq : !eq;
  }
  return truthy(parseValue(expr, ctx));
}
function evalCond(expr, ctx) {
  if (/\s+or\s+/.test(expr)) return expr.split(/\s+or\s+/).some(e => evalCond(e, ctx));
  if (/\s+and\s+/.test(expr)) return expr.split(/\s+and\s+/).every(e => evalCond(e, ctx));
  return evalOne(expr, ctx);
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
        const args = Object.assign({}, ctx.__globals || {});
        if (m[2]) m[2].split(/,(?=(?:[^']*'[^']*')*[^']*$)(?=\s*\w+\s*:)/).forEach(p => { const kv = p.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/s); if (kv) args[kv[1]] = parseValue(kv[2], ctx); });
        args.__globals = ctx.__globals;
        out += render(loadSnippet(m[1]), args);
        continue;
      }
      if (word === 'form') {
        const m = tag.match(/^form\s+'(\w+)'\s*,?\s*(.*)$/s);
        const a = {};
        if (m[2]) m[2].split(',').forEach(p => { const kv = p.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/s); if (kv) a[kv[1]] = parseValue(kv[2], ctx); });
        const id = a.id || 'contact_form';
        ctx.form = {};
        out += `<form method="post" action="/contact#${id}" id="${id}" accept-charset="UTF-8"${a.class ? ' class="' + a.class + '"' : ''}><input type="hidden" name="form_type" value="${m[1]}"><input type="hidden" name="utf8" value="&#x2713;">`;
        out += block(['endform']); i++;
        out += '</form>';
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
      /* unknown tag (continue, break, section): dropped */
    }
    return out;
  }
  return block(null);
}

function buildHarness() {
  const globals = { request: { locale: { iso_code: 'en' }, design_mode: false }, routes: { root_url: '/', cart_url: '/cart', cart_change_url: '/cart/change', cart_add_url: '/cart/add' }, cart: { item_count: 0 }, shop: { enabled_payment_types: [] }, template: { name: 'index', suffix: '' } };
  const sectionSrc = fs.readFileSync(path.join(root, 'sections', 'dandy-home.liquid'), 'utf8');
  const body = '<div id="shopify-section-main" class="shopify-section">' + render(sectionSrc, Object.assign({ section: { id: 'main', settings: {} }, __globals: globals }, globals)) + '</div>';
  const layout = fs.readFileSync(path.join(root, 'layout', 'dandy-home.liquid'), 'utf8');
  const html = render(layout, Object.assign({
    page_title: 'Dandy homepage harness', page_description: 'Harness', canonical_url: 'harness.html',
    content_for_header: '', content_for_layout: body, __globals: globals
  }, globals));
  fs.writeFileSync(path.join(here, 'harness.html'), html);
  return path.join(here, 'harness.html');
}

/* ---------- Playwright ---------- */
async function launch() {
  const { chromium } = require('playwright');
  const args = ['--allow-file-access-from-files'];
  try { return { browser: await chromium.launch({ channel: 'chrome', args }), channel: 'chrome' }; }
  catch (e) { return { browser: await chromium.launch({ args }), channel: 'chromium' }; }
}

async function newPage(browser, width, extra) {
  const height = width >= 1024 ? 800 : (width === 768 ? 1024 : 844);
  const context = await browser.newContext(Object.assign({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 861, hasTouch: width < 861 }, extra || {}));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    window.__cls = 0; window.__clsAfterGate = 0; window.__gateGone = false;
    try {
      new PerformanceObserver(list => { list.getEntries().forEach(e => { if (!e.hadRecentInput) { window.__cls += e.value; if (window.__gateGone) window.__clsAfterGate += e.value; } }); }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  });
  return { page, context, errors, height };
}

async function scrollThrough(page, height) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= total; y += Math.round(height * 0.6)) {
    await page.evaluate(yy => document.documentElement.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(160);
  }
  await page.evaluate(() => document.documentElement.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(400);
  await page.evaluate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
}

async function dismissGate(page) {
  await page.evaluate(() => { const b = document.querySelector('[data-hage-yes]'); if (b) b.click(); window.__gateGone = true; });
  await page.waitForTimeout(200);
}

/* in-page helpers, injected once per page */
const helpers = `
window.__q = {
  sel(el) { return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.') : ''); },
  visible(el) { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false; const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return false; for (let a = el; a; a = a.parentElement) { if (a.hidden) return false; } return true; },
  textEls() { const out = []; const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = walker.nextNode())) { if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue; if (!this.visible(el)) continue; const range = document.createRange(); range.selectNodeContents(n); const rects = Array.from(range.getClientRects()).filter(r => r.width > 0 && r.height > 0); if (!rects.length) continue; out.push({ el, node: n, rects }); } return out; }
};`;

async function measureViewport(browser, harness, width) {
  const { page, context, errors, height } = await newPage(browser, width);
  await page.goto('file://' + harness, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await page.evaluate(helpers);
  const r = { width, height, errors, checks: {} };

  /* Gate 4 inventory is taken with the age gate still up so its dialog is in the record. */
  r.checks.g4_inventory = await page.evaluate(() => {
    const q = window.__q;
    const allowed = ['.rev', '.hero__inset', '.welcome__input', '.hage__box', '.dcart__panel'];
    const box = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return false; for (let a = el; a; a = a.parentElement) { if (a.hidden) return false; } return true; };
    const els = Array.from(document.querySelectorAll('body *')).filter(el => box(el));
    const cards = els.filter(el => { const cs = getComputedStyle(el); return parseFloat(cs.borderTopLeftRadius) > 8 && (parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none') && !el.classList.contains('btn'); }).map(el => q.sel(el));
    const bad = cards.filter(s => !allowed.some(a => s.includes(a.slice(1))));
    const pills = els.filter(el => { if (el.classList.contains('btn')) return false; const cs = getComputedStyle(el); const rad = cs.borderTopLeftRadius; const r = el.getBoundingClientRect(); const px = rad.endsWith('%') ? Math.min(r.width, r.height) * parseFloat(rad) / 100 : parseFloat(rad); const painted = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none'; return painted && r.width > r.height * 1.2 && px >= r.height / 2 - 0.5; }).map(el => q.sel(el));
    const reviewCards = cards.filter(s => s.includes('.rev')).length;
    return { cards, reviewCards, offenders: bad, nonButtonPills: pills, pass: bad.length === 0 && pills.length === 0 && reviewCards === 3 };
  });

  /* Gate 9: only the age gate is fixed and dialog-like; the nav is the one sticky element. */
  r.checks.g9_fixedBeforeDismiss = await page.evaluate(() => {
    const q = window.__q;
    const fixed = Array.from(document.querySelectorAll('body *')).filter(el => q.visible(el) && ['fixed', 'sticky'].includes(getComputedStyle(el).position)).map(el => q.sel(el) + ':' + getComputedStyle(el).position);
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"]')).filter(el => q.visible(el)).map(el => q.sel(el));
    return { fixed, dialogs, pass: dialogs.length === 1 && dialogs[0].includes('hage') && fixed.every(s => s.includes('hage') || s.includes('hh__nav')) };
  });

  const clsWithGate = await page.evaluate(() => window.__cls);
  await dismissGate(page);
  await page.waitForTimeout(600);
  await scrollThrough(page, height);
  await page.waitForTimeout(1500);
  const clsTotal = await page.evaluate(() => window.__cls);
  r.checks.g8_cls = { withGate: +clsWithGate.toFixed(4), total: +clsTotal.toFixed(4), preload: await page.evaluate(() => { const l = document.querySelector('link[rel="preload"][as="image"]'); const img = document.querySelector('.hero__frame img'); if (!l || !img) return { present: false }; const cands = s => (s || '').split(',').map(x => x.trim().split(/\s+/)[0]).filter(Boolean).map(u => u.split('/').pop()).sort(); return { present: true, sameSet: JSON.stringify(cands(l.getAttribute('imagesrcset'))) === JSON.stringify(cands(img.getAttribute('srcset'))), rendered: (img.currentSrc || img.src).split('/').pop(), sizesMatch: l.getAttribute('imagesizes') === img.getAttribute('sizes') }; }), pass: clsTotal < 0.05 };
  r.checks.g8_cls.pass = r.checks.g8_cls.pass && r.checks.g8_cls.preload.present && r.checks.g8_cls.preload.sameSet && r.checks.g8_cls.preload.sizesMatch;

  /* Gate 9 after dismissal, after an idle wait: no popup, modal, timer or ticker appeared. */
  await page.waitForTimeout(2500);
  r.checks.g9_afterDismiss = await page.evaluate(() => {
    const q = window.__q;
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [aria-modal="true"]')).filter(el => q.visible(el)).map(el => q.sel(el));
    const fixed = Array.from(document.querySelectorAll('body *')).filter(el => q.visible(el) && ['fixed', 'sticky'].includes(getComputedStyle(el).position)).map(el => q.sel(el) + ':' + getComputedStyle(el).position);
    const infinite = Array.from(document.querySelectorAll('body *')).filter(el => q.visible(el) && getComputedStyle(el).animationIterationCount.split(',').some(v => v.trim() === 'infinite')).map(el => q.sel(el));
    const tickers = Array.from(document.querySelectorAll('.ticker, .marquee, .sticky, .stickybar, [data-sticky]')).map(el => q.sel(el));
    return { dialogs, fixed, infiniteAnimations: infinite, tickerLike: tickers, pass: dialogs.length === 0 && fixed.length === 1 && fixed[0].includes('hh__nav') && infinite.length === 0 && tickers.length === 0 };
  });

  /* Gate 1: no horizontal overflow */
  r.checks.g1_overflow = await page.evaluate(() => {
    const de = document.documentElement; const q = window.__q;
    const wide = [];
    const clipped = el => { for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'clip') return true; } return false; };
    document.querySelectorAll('body *').forEach(el => { if (!q.visible(el)) return; const b = el.getBoundingClientRect(); if (b.width > 0 && (b.right > window.innerWidth + 1 || b.left < -1) && getComputedStyle(el).position !== 'fixed' && !clipped(el)) wide.push(q.sel(el) + ' ' + Math.round(b.left) + '..' + Math.round(b.right)); });
    return { scrollWidth: de.scrollWidth, innerWidth: window.innerWidth, pass: de.scrollWidth <= window.innerWidth && wide.length === 0, offenders: wide.slice(0, 12) };
  });

  /* Gate 2: type floor: nothing under 13px, no body paragraph under 16px */
  r.checks.g2_typeFloor = await page.evaluate(() => {
    const q = window.__q;
    const metaP = ['welcome__fine', 'hf__legal', 'gear__range', 'moment__alt', 'hf__contact', 'hh__ann', 'dose__zone'];
    let min = 999, minSel = null, under16 = [];
    const seen = new Set();
    q.textEls().forEach(t => {
      const el = t.el; if (seen.has(el)) return; seen.add(el);
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < min) { min = fs; minSel = q.sel(el); }
      const p = el.closest('p');
      if (p && fs < 16 && !metaP.some(c => p.classList.contains(c) || (p.parentElement && p.parentElement.classList.contains(c)) || p.closest('.' + c))) under16.push(q.sel(el) + ' ' + fs + 'px');
    });
    const body = parseFloat(getComputedStyle(document.body).fontSize);
    return { minFontSize: min, minAt: minSel, bodySize: body, bodyParagraphsUnder16: under16.slice(0, 12), metaParagraphClasses: metaP, pass: min >= 13 && under16.length === 0 && body >= 16 };
  });

  /* Gate 3: no en or em dash in rendered text */
  r.checks.g3_dashes = await page.evaluate(() => { const t = document.body.innerText; const n = (t.match(/[–—]/g) || []).length; return { count: n, pass: n === 0 }; });

  /* Gate 4 eyebrows: no small uppercase or letterspaced text directly above a heading */
  r.checks.g4_eyebrows = await page.evaluate(() => {
    const q = window.__q; const bad = [];
    const texts = q.textEls();
    document.querySelectorAll('h1, h2, h3, .h1, .h2, .h3').forEach(h => {
      if (!q.visible(h)) return;
      const hb = h.getBoundingClientRect();
      texts.forEach(t => {
        if (h.contains(t.el)) return;
        const r = t.rects[t.rects.length - 1];
        if (r.bottom <= hb.top + 1 && hb.top - r.bottom < 40 && r.left < hb.right && r.right > hb.left) {
          const cs = getComputedStyle(t.el); const fs = parseFloat(cs.fontSize); const ls = parseFloat(cs.letterSpacing) || 0;
          const upper = cs.textTransform === 'uppercase' || (t.node.nodeValue.trim().length > 3 && t.node.nodeValue.trim() === t.node.nodeValue.trim().toUpperCase() && /[A-Z]/.test(t.node.nodeValue));
          if (fs < 15 && (upper || ls > fs * 0.04)) bad.push(q.sel(t.el) + ' above ' + q.sel(h));
        }
      });
    });
    return { offenders: bad, pass: bad.length === 0 };
  });

  /* Gate 5: whitespace between consecutive painted nodes (text, images, icons, inputs, ground edges, hairlines) in DOM order */
  r.checks.g5_whitespace = await page.evaluate((limit) => {
    const q = window.__q;
    const nodes = [];
    const sy = window.scrollY;
    q.textEls().forEach(t => { if (t.el.closest('.btn')) return; const top = Math.min(...t.rects.map(r => r.top)), bottom = Math.max(...t.rects.map(r => r.bottom)); const left = Math.min(...t.rects.map(r => r.left)), right = Math.max(...t.rects.map(r => r.right)); nodes.push({ el: t.el, kind: 'text', top: top + sy, bottom: bottom + sy, left, right }); });
    document.querySelectorAll('img, svg, input, .btn, .dose__track, .hero__inset').forEach(el => { if (!q.visible(el)) return; const b = el.getBoundingClientRect(); nodes.push({ el, kind: el.tagName.toLowerCase(), top: b.top + sy, bottom: b.bottom + sy, left: b.left, right: b.right }); });
    const bg = el => getComputedStyle(el).backgroundColor;
    document.querySelectorAll('body *').forEach(el => {
      if (!q.visible(el)) return; const cs = getComputedStyle(el); const b = el.getBoundingClientRect();
      const parentBg = el.parentElement ? bg(el.parentElement) : '';
      const ground = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== parentBg && b.height > 40;
      if (ground) { nodes.push({ el, kind: 'ground-top', top: b.top + sy, bottom: b.top + sy, left: b.left, right: b.right }); nodes.push({ el, kind: 'ground-bottom', top: b.bottom + sy, bottom: b.bottom + sy, left: b.left, right: b.right }); }
      if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') nodes.push({ el, kind: 'border-top', top: b.top + sy, bottom: b.top + sy, left: b.left, right: b.right });
      if (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none') nodes.push({ el, kind: 'border-bottom', top: b.bottom + sy, bottom: b.bottom + sy, left: b.left, right: b.right });
    });
    /* DOM order, ground-tops before their content, ground-bottoms after */
    const order = new Map(); let k = 0; document.querySelectorAll('body, body *').forEach(el => order.set(el, k++));
    nodes.forEach(n => { n.o = order.get(n.el) * 3 + (n.kind === 'ground-top' || n.kind === 'border-top' ? 0 : n.kind === 'ground-bottom' || n.kind === 'border-bottom' ? 2 : 1); });
    nodes.sort((a, b) => a.o - b.o || a.top - b.top);
    /* ground-bottom markers belong after every descendant: re-key them by the last descendant's order */
    nodes.forEach(n => { if (n.kind === 'ground-bottom' || n.kind === 'border-bottom') { let last = n.el; const d = n.el.querySelectorAll('*'); if (d.length) last = d[d.length - 1]; n.o = order.get(last) * 3 + 2.5; } });
    /* visual order (top edge, DOM order as the tiebreak): the hero buttons precede the benefit rows in the DOM but sit below them on desktop */
    nodes.sort((a, b) => a.top - b.top || a.o - b.o);
    const gaps = [];
    const rule = (a, b) => {
      let best = null;
      const consider = (el, prop) => { const v = parseFloat(getComputedStyle(el)[prop]) || 0; if (v > 0 && (!best || v > best.v)) best = { v, s: q.sel(el) + ' ' + prop + ' ' + Math.round(v) + 'px' }; };
      for (let el = a.el; el && el !== document.body; el = el.parentElement) { consider(el, 'marginBottom'); consider(el, 'paddingBottom'); if (el.contains(b.el)) break; }
      for (let el = b.el; el && el !== document.body; el = el.parentElement) { consider(el, 'marginTop'); consider(el, 'paddingTop'); if (el.contains(a.el)) break; }
      return best ? best.s : 'unknown';
    };
    /* the gap is measured from the lowest painted pixel seen so far, so a tall photo beside a short copy column counts as painted */
    let prev = null;
    for (const n of nodes) {
      if (prev) {
        const gap = n.top - prev.bottom;
        const cardA = prev.el.closest('.rev'), cardB = n.el.closest('.rev');
        if (gap > limit && cardA === cardB) gaps.push({ from: q.sel(prev.el) + '/' + prev.kind, to: q.sel(n.el) + '/' + n.kind, gap: Math.round(gap), rule: rule(prev, n) });
      }
      if (!prev || n.bottom >= prev.bottom) prev = n;
    }
    return { limit, nodes: nodes.length, gaps: gaps.slice(0, 20), pass: gaps.length === 0 };
  }, width >= 1024 ? 96 : 56);

  /* Gate 6 (informational): text over photography */
  r.checks.g6_textOverPhoto = await page.evaluate(() => {
    const q = window.__q; const imgs = Array.from(document.querySelectorAll('img')).filter(el => q.visible(el)).map(el => ({ el, b: el.getBoundingClientRect() }));
    const hits = [];
    q.textEls().forEach(t => { t.rects.forEach(r => { imgs.forEach(i => { if (i.el.contains(t.el)) return; if (r.left < i.b.right && r.right > i.b.left && r.top < i.b.bottom && r.bottom > i.b.top) hits.push(q.sel(t.el) + ' over ' + (i.el.getAttribute('src') || '').split('/').pop()); }); }); });
    return { overlaps: Array.from(new Set(hits)), pass: hits.length === 0 };
  });

  /* Gate 7 (attributes): every img complete with naturalWidth > 0 after the scroll; width and height equal the real pixels of src; srcset candidates share the aspect */
  r.checks.g7_images = await page.evaluate(async () => {
    const q = window.__q;
    const out = []; let pass = true;
    const size = url => new Promise(res => { const i = new Image(); i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => res(null); i.src = url; });
    for (const img of Array.from(document.querySelectorAll('img'))) {
      const rec = { src: (img.getAttribute('src') || '').split('/').pop(), complete: img.complete, natural: img.naturalWidth + 'x' + img.naturalHeight, attrs: img.getAttribute('width') + 'x' + img.getAttribute('height'), lazy: img.loading, visible: q.visible(img) };
      const real = await size(img.src);
      rec.real = real ? real.w + 'x' + real.h : null;
      rec.attrsMatch = !!real && String(real.w) === img.getAttribute('width') && String(real.h) === img.getAttribute('height');
      if (/\.svg$/.test(rec.src)) rec.attrsMatch = true; /* the wordmark is vector; its attributes set the box */
      const ss = img.getAttribute('srcset');
      if (ss) { rec.candidates = []; for (const c of ss.split(',')) { const u = c.trim().split(/\s+/)[0]; const s = await size(u); rec.candidates.push(u.split('/').pop() + ':' + (s ? s.w + 'x' + s.h : 'missing')); if (!s || Math.abs(s.w / s.h - real.w / real.h) > 0.01) rec.attrsMatch = false; } }
      if (!(img.complete && img.naturalWidth > 0) || !rec.attrsMatch) { pass = false; if (rec.visible || !rec.lazy) pass = false; }
      out.push(rec);
    }
    return { images: out, pass };
  });
  r.checks.g7_images.pass = r.checks.g7_images.images.every(i => i.attrsMatch && ((i.complete && i.natural !== '0x0') || !i.visible));

  /* Gate 11: hero composition */
  r.checks.g11_hero = await page.evaluate(() => {
    const h1 = document.querySelector('.hero .h1'), lede = document.querySelector('.hero__lede'), btn = document.querySelector('.hero__cta .btn'), wrap = document.querySelector('.hero__grid'), img = document.querySelector('.hero__frame img'), inset = document.querySelector('.hero__inset');
    const lines = el => { const cs = getComputedStyle(el); return Math.round(el.getBoundingClientRect().height / parseFloat(cs.lineHeight)); };
    const wb = wrap.getBoundingClientRect(), bb = btn.getBoundingClientRect(), ib = img.getBoundingClientRect();
    const natural = img.naturalWidth / img.naturalHeight, box = ib.width / ib.height;
    const btnBottom = Math.round(bb.bottom + window.scrollY);
    return { h1Lines: lines(h1), h1Size: parseFloat(getComputedStyle(h1).fontSize), ledeLines: lines(lede), buttonWidth: Math.round(bb.width), contentWidth: Math.round(wb.width), primaryButtonBottom: btnBottom, firstScreen: innerWidth >= 861 || btnBottom <= innerHeight, photoWidth: Math.round(ib.width), photoHeight: Math.round(ib.height), photoUncropped: Math.abs(natural - box) < 0.02, photoEdgeToEdge: innerWidth < 861 ? Math.abs(ib.left) < 1 && Math.abs(ib.width - innerWidth) < 1 : null, insetSize: Math.round(inset.getBoundingClientRect().width), pass: lines(h1) <= 3 && (innerWidth >= 861 || (Math.abs(bb.width - wb.width) < 1 && btnBottom <= innerHeight)) && Math.abs(natural - box) < 0.02 };
  });

  /* Gate 12: analytics: every data-track element pushes its event */
  r.checks.g12_analytics = await page.evaluate(async () => {
    window.dataLayer = [];
    document.addEventListener('click', e => { const a = e.target.closest('a'); if (a) e.preventDefault(); }, true);
    const els = Array.from(document.querySelectorAll('[data-track]'));
    const missing = [];
    for (const el of els) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      const before = window.dataLayer.length;
      el.click();
      await new Promise(r => setTimeout(r, 30));
      const pushed = window.dataLayer.slice(before).find(d => d.event === el.getAttribute('data-track'));
      if (!pushed) missing.push(el.getAttribute('data-track') + ' ' + (el.getAttribute('data-track-label') || ''));
    }
    const events = {}; window.dataLayer.forEach(d => { events[d.event] = (events[d.event] || 0) + 1; });
    const expected = ['homepage_hero_cta_click', 'homepage_hero_reviews_click', 'format_card_click', 'dosage_guide_interaction', 'faq_accordion_toggle', 'reviews_gateway_click'];
    const absent = expected.filter(e => !events[e]);
    return { tracked: els.length, events, missing, absentEvents: absent, pass: missing.length === 0 && absent.length === 0 };
  });
  /* restore the FAQ and gears to their load state after the click sweep */
  await page.evaluate(() => { document.querySelectorAll('.faq__q button').forEach((b, i) => { const on = b.getAttribute('aria-expanded') === 'true'; if (on !== (i === 0)) b.click(); }); const g = document.querySelector('[data-gear-btn="1"]'); if (g) g.click(); });
  await page.waitForTimeout(700);

  /* Gate 10 (list only): every href on the page for the preview-theme link check */
  r.checks.g10_links = await page.evaluate(() => { const hrefs = Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href')); return { unique: Array.from(new Set(hrefs)).sort(), pass: true, note: 'resolve on the preview theme; not measurable on the static harness' }; });

  /* Screenshot: full page at rest, nav unfixed, hero sweep off, instant scroll */
  await page.addStyleTag({ content: '.hh__nav{position:static!important}.hero__frame::after{display:none!important}' });
  await page.evaluate(() => Promise.all(Array.from(document.images).map(i => i.decode().catch(() => null))));
  await page.evaluate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
  fs.mkdirSync(shotsDir, { recursive: true });
  const shot = path.join(shotsDir, `home-${width}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  r.shot = shot;
  r.pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await context.close();

  /* Gate 13: reduced motion renders pixel-identical to the animated resting state. Two fresh contexts run the same sequence
     (the measurement context above has preloaded every srcset candidate for gate 7, which lets Chrome pick a different hero
     candidate on relayout, so it is not used for the comparison). Photo pixels are hidden (img opacity 0, boxes and grounds
     stay) because a photo that was composited during a reveal resamples a few interior pixels differently from one that never
     moved; instead every image rect must be numerically identical between the two contexts. */
  {
    async function rest(extra, file) {
      const c = await newPage(browser, width, extra);
      await c.page.goto('file://' + harness, { waitUntil: 'load' });
      await c.page.evaluate(() => document.fonts.ready);
      await c.page.waitForTimeout(800);
      await dismissGate(c.page);
      await c.page.waitForTimeout(600);
      await scrollThrough(c.page, c.height);
      await c.page.waitForTimeout(1500);
      await c.page.addStyleTag({ content: '.hh__nav{position:static!important}.hero__frame::after{display:none!important}' });
      await c.page.evaluate(() => Promise.all(Array.from(document.images).map(i => i.decode().catch(() => null))));
      await c.page.evaluate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }));
      await c.page.waitForTimeout(400);
      const heroSrc = await c.page.evaluate(() => (document.querySelector('.hero__frame img').currentSrc || '').split('/').pop());
      const imgRects = await c.page.evaluate(() => Array.from(document.images).map(i => { const b = i.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)].join(','); }));
      await c.page.addStyleTag({ content: 'img{opacity:0!important}' });
      await c.page.waitForTimeout(150);
      await c.page.screenshot({ path: file, fullPage: true });
      return { context: c.context, heroSrc, imgRects };
    }
    const normalShot = path.join(shotsDir, `home-${width}-rest.png`), rmShot = path.join(shotsDir, `home-${width}-reduced.png`);
    const n = await rest({}, normalShot); await n.context.close();
    const m = await rest({ reducedMotion: 'reduce' }, rmShot);
    const a = fs.readFileSync(normalShot), b = fs.readFileSync(rmShot);
    const rectsSame = JSON.stringify(n.imgRects) === JSON.stringify(m.imgRects);
    let diff = { identicalBytes: a.equals(b), imageRectsIdentical: rectsSame, images: n.imgRects.length, heroSrcAnimated: n.heroSrc, heroSrcReduced: m.heroSrc };
    if (!diff.identicalBytes) {
      const cmp = await m.context.newPage();
      diff = Object.assign(diff, await cmp.evaluate(async ([da, db]) => {
        const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = src; });
        const ia = await load(da), ib = await load(db);
        if (ia.width !== ib.width || ia.height !== ib.height) return { sizeA: ia.width + 'x' + ia.height, sizeB: ib.width + 'x' + ib.height, differing: -1 };
        const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height; const ctx = c.getContext('2d');
        ctx.drawImage(ia, 0, 0); const A = ctx.getImageData(0, 0, c.width, c.height).data;
        ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(ib, 0, 0); const B = ctx.getImageData(0, 0, c.width, c.height).data;
        let n = 0, minY = 1e9, maxY = 0; for (let i = 0; i < A.length; i += 4) { if (Math.abs(A[i] - B[i]) > 8 || Math.abs(A[i + 1] - B[i + 1]) > 8 || Math.abs(A[i + 2] - B[i + 2]) > 8) { n++; const y = (i / 4 / c.width) | 0; if (y < minY) minY = y; if (y > maxY) maxY = y; } }
        return { differing: n, total: A.length / 4, firstRow: n ? minY : null, lastRow: n ? maxY : null };
      }, ['data:image/png;base64,' + a.toString('base64'), 'data:image/png;base64,' + b.toString('base64')]));
    }
    r.checks.g13_reducedMotion = Object.assign(diff, { pass: (diff.identicalBytes || diff.differing === 0) && rectsSame });
    await m.context.close();
  }
  return r;
}

/* Hero composition at 375 too (gate 11 names 375, 390 and 430) */
async function heroAt(browser, harness, width) {
  const { page, context } = await newPage(browser, width);
  await page.goto('file://' + harness, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await dismissGate(page);
  const res = await page.evaluate(() => {
    const h1 = document.querySelector('.hero .h1'), lede = document.querySelector('.hero__lede'), btn = document.querySelector('.hero__cta .btn'), wrap = document.querySelector('.hero__grid'), img = document.querySelector('.hero__frame img');
    const lines = el => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    const ib = img.getBoundingClientRect();
    return { h1Lines: lines(h1), ledeLines: lines(lede), buttonWidth: Math.round(btn.getBoundingClientRect().width), contentWidth: Math.round(wrap.getBoundingClientRect().width), primaryButtonBottom: Math.round(btn.getBoundingClientRect().bottom + window.scrollY), viewport: innerHeight, photoHeight: Math.round(ib.height), photoUncropped: Math.abs(img.naturalWidth / img.naturalHeight - ib.width / ib.height) < 0.02 };
  });
  await context.close();
  return Object.assign({ width }, res, { pass: res.h1Lines <= 3 && Math.abs(res.buttonWidth - res.contentWidth) < 1 && res.photoUncropped && res.primaryButtonBottom <= res.viewport });
}

function summarize(results) {
  const lines = ['# Dandy homepage QA results', '', `Browser: ${results.channel}. Harness: qa/dandy-home/harness.html rendered from layout/dandy-home.liquid and sections/dandy-home.liquid (cart drawer stubbed). Screenshots in qa/dandy-home/shots/ (not committed). Gates 6, 8 and 10 are informational here: 6 reports overlaps only, 8 measures CLS on the static harness, 10 lists hrefs for the preview-theme check.`, ''];
  let allPass = true;
  const table = (checks) => {
    const rows = ['| Gate | Result | Detail |', '|---|---|---|'];
    for (const [name, c] of Object.entries(checks)) {
      const detail = Object.entries(c).filter(([k]) => k !== 'pass').map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('; ').replace(/\|/g, '\\|');
      rows.push(`| ${name} | ${c.pass ? 'pass' : 'FAIL'} | ${detail.slice(0, 700)} |`);
      if (!c.pass && !/^g(6|8|10)_/.test(name)) allPass = false;
    }
    return rows;
  };
  for (const w of Object.keys(results.viewports)) {
    const r = results.viewports[w];
    lines.push(`## ${w}px (page height ${r.pageHeight})`, '', ...table(r.checks), '', `Page errors: ${r.errors.length ? r.errors.join(' / ') : 'none'}`, '');
  }
  lines.push('## Hero composition (gate 11)', '', '| Width | H1 lines | Lede lines | Button width | Content width | Primary button bottom (viewport) | Photo height | Uncropped | Result |', '|---|---|---|---|---|---|---|---|---|');
  results.hero.forEach(h => { lines.push(`| ${h.width} | ${h.h1Lines} | ${h.ledeLines} | ${h.buttonWidth} | ${h.contentWidth} | ${h.primaryButtonBottom} (${h.viewport}) | ${h.photoHeight} | ${h.photoUncropped} | ${h.pass ? 'pass' : 'FAIL'} |`); if (!h.pass) allPass = false; });
  lines.push('', `Screenshot duplicates: ${results.duplicates.length ? results.duplicates.join(', ') : 'none'}`, '');
  lines.push(allPass ? 'All gates passed.' : 'Some gates failed.');
  return lines.join('\n');
}

(async () => {
  const harness = buildHarness();
  console.log('harness written:', harness);
  if (process.argv.includes('--harness-only')) return;
  const { browser, channel } = await launch();
  const results = { channel, viewports: {}, hero: [], duplicates: [] };
  for (const width of WIDTHS) results.viewports[width] = await measureViewport(browser, harness, width);
  for (const width of HERO_WIDTHS) results.hero.push(await heroAt(browser, harness, width));
  await browser.close();
  /* byte-identical screenshot check */
  const sums = {};
  for (const w of WIDTHS) { const f = path.join(shotsDir, `home-${w}.png`); if (fs.existsSync(f)) { const h = crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex'); (sums[h] = sums[h] || []).push(w); } }
  results.duplicates = Object.values(sums).filter(v => v.length > 1).map(v => v.join('='));
  fs.writeFileSync(path.join(here, 'results.json'), JSON.stringify(results, null, 2));
  const md = summarize(results);
  fs.writeFileSync(path.join(here, 'results.md'), md);
  console.log(md);
  if (md.endsWith('Some gates failed.')) process.exitCode = 2;
})().catch(e => { console.error(e); process.exit(1); });
