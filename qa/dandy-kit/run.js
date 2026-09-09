/* Dandy kit QA. Renders sections/dandy-kit-demo.liquid to a static harness (harness.html) with a small Liquid subset,
   then measures it in Playwright at 390 and 1280. Run from a directory that has Playwright installed:
   node /abs/path/to/qa/dandy-kit/run.js  (writes harness.html, results.json, results.md and screenshots beside itself). */
'use strict';
const fs = require('fs');
const path = require('path');

const here = __dirname;
const root = path.resolve(here, '..', '..');
const assetsRel = '../../assets/';

/* ---------- Liquid subset ---------- */
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

function parseValue(s, ctx) {
  s = s.trim();
  if (/^'.*'$/.test(s) || /^".*"$/.test(s)) return s.slice(1, -1);
  if (s === 'true') return true; if (s === 'false') return false; if (s === 'blank' || s === 'nil' || s === 'empty') return '';
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ctx);
}

function applyFilters(expr, ctx) {
  const parts = expr.split('|').map(p => p.trim());
  let v = parseValue(parts[0], ctx);
  for (let i = 1; i < parts.length; i++) {
    const m = parts[i].match(/^(\w+)(?::\s*(.*))?$/);
    if (!m) continue;
    const name = m[1], args = m[2] ? m[2].split(',').map(a => parseValue(a, ctx)) : [];
    if (name === 'asset_url') v = assetsRel + String(v);
    else if (name === 'append') v = String(v == null ? '' : v) + String(args[0] == null ? '' : args[0]);
    else if (name === 'default') v = (v == null || v === '' || v === false) ? args[0] : v;
    else if (name === 'escape') v = String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    else if (name === 'stylesheet_tag') v = '<link rel="stylesheet" href="' + v + '">';
    /* unknown filters return the value unchanged */
  }
  return v;
}

function truthy(v) { return !(v === undefined || v === null || v === false || v === ''); }

function evalCond(expr, ctx) {
  let m = expr.match(/^(.+?)\s*(==|!=)\s*(.+)$/);
  if (m) {
    const a = parseValue(m[1], ctx), b = parseValue(m[3], ctx);
    const eq = (a == null ? '' : a) === (b == null ? '' : b) || (!truthy(a) && !truthy(b));
    return m[2] === '==' ? eq : !eq;
  }
  return truthy(parseValue(expr, ctx));
}

function render(src, ctx) {
  const toks = tokenize(src);
  let i = 0;
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
      if (word === 'comment' || word === 'schema') { while (i < toks.length && !(toks[i].type === 'tag' && toks[i].value.startsWith('end' + word))) i++; i++; continue; }
      if (word === 'liquid') {
        tag.split('\n').slice(1).map(l => l.trim()).filter(Boolean).forEach(line => { const a = line.match(/^assign\s+(\w+)\s*=\s*(.+)$/); if (a) ctx[a[1]] = applyFilters(a[2], ctx); });
        continue;
      }
      if (word === 'assign') { const a = tag.match(/^assign\s+(\w+)\s*=\s*(.+)$/); if (a) ctx[a[1]] = applyFilters(a[2], ctx); continue; }
      if (word === 'render') {
        const m = tag.match(/^render\s+'([^']+)'\s*,?\s*(.*)$/s);
        const args = {};
        if (m[2]) m[2].split(/,(?=\s*\w+\s*:)/).forEach(p => { const kv = p.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/s); if (kv) args[kv[1]] = parseValue(kv[2], ctx); });
        out += render(loadSnippet(m[1]), args);
        continue;
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
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Dandy kit demo harness</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${assetsRel}dandy-kit.css">
</head>
<body class="dandy-kit-body">
${body}
<script src="${assetsRel}dandy-kit.js" defer data-init></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(here, 'harness.html'), html);
  return path.join(here, 'harness.html');
}

/* ---------- Playwright ---------- */
async function measure(harness) {
  const { chromium } = require('playwright');
  let browser, channel = 'chrome';
  try { browser = await chromium.launch({ channel: 'chrome' }); } catch (e) { channel = 'chromium'; browser = await chromium.launch(); }
  const results = { channel, viewports: {} };
  for (const width of [390, 1280]) {
    const height = width === 390 ? 844 : 800;
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 860, hasTouch: width < 860 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + harness, { waitUntil: 'load' });
    await page.waitForTimeout(1600);
    const r = { width, height, errors, checks: {} };

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
    const s1 = await page.evaluate(() => Array.from(document.querySelectorAll('.sparkles i, .hero-sparkles i')).map(i => getComputedStyle(i).opacity));
    await page.waitForTimeout(700);
    const s2 = await page.evaluate(() => Array.from(document.querySelectorAll('.sparkles i, .hero-sparkles i')).map(i => getComputedStyle(i).opacity));
    const changed = s1.filter((v, k) => v !== s2[k]).length;
    r.checks.sparkles = { count: s1.length, changed, pass: s1.length > 0 && changed > 0 };

    /* 4. Instant scroll through the page; every [data-reveal] reaches is-in */
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

    /* 5. Loop paints VIDEO at centre (or the poster if the source cannot play) */
    await page.evaluate(() => { const el = document.querySelector('.stage .loop'); const y = el.getBoundingClientRect().top + window.scrollY - 80; document.documentElement.scrollTo({ top: y, behavior: 'instant' }); });
    await page.waitForTimeout(2500);
    r.checks.loop = await page.evaluate(() => {
      const fig = document.querySelector('.stage .loop'); const b = fig.getBoundingClientRect();
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const hitEl = document.elementFromPoint(cx, cy); const hit = hitEl ? hitEl.tagName : null;
      const v = fig.querySelector('video');
      const boards = Array.from(document.querySelectorAll('.loop')).map(f => ({ name: f.getAttribute('data-loop'), playing: f.classList.contains('is-playing'), still: f.classList.contains('is-still'), held: f.classList.contains('is-held'), preload: f.querySelector('video').preload }));
      return { hit: hit, playing: fig.classList.contains('is-playing'), still: fig.classList.contains('is-still'), readyState: v.readyState, paused: v.paused, error: v.error ? v.error.code : null, loops: boards, pass: (hit === 'VIDEO' && fig.classList.contains('is-playing')) || (hit === 'IMG' && (fig.classList.contains('is-still') || v.readyState < 3)), paintsVideo: hit === 'VIDEO' };
    });

    /* 6. Sticky bar appears once the hero CTA is past and no other button is on screen (phones only; hidden on desktop) */
    await page.evaluate(() => { const el = document.querySelector('.board'); document.documentElement.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 40, behavior: 'instant' }); });
    await page.waitForTimeout(600);
    r.checks.sticky = await page.evaluate(() => {
      const s = document.querySelector('.sticky'); const cs = getComputedStyle(s); const b = s.getBoundingClientRect();
      const btns = Array.from(document.querySelectorAll('main .btn')).filter(el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; }).length;
      const heroGone = document.querySelector('[data-sticky-anchor]').getBoundingClientRect().bottom < 0;
      const phone = innerWidth <= 860;
      const shown = s.classList.contains('is-on') && cs.display !== 'none' && b.bottom <= innerHeight + 1 && b.top < innerHeight;
      return { phone, isOn: s.classList.contains('is-on'), display: cs.display, top: Math.round(b.top), bottom: Math.round(b.bottom), innerHeight, buttonsOnScreen: btns, heroGone, ariaHidden: s.getAttribute('aria-hidden'), pass: phone ? (shown && btns === 0 && heroGone) : cs.display === 'none' };
    });
    /* sticky hides again while the offer button is on screen */
    await page.evaluate(() => { const el = document.querySelector('.offer__cta'); document.documentElement.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - innerHeight / 2, behavior: 'instant' }); });
    await page.waitForTimeout(500);
    r.checks.stickyYields = await page.evaluate(() => { const s = document.querySelector('.sticky'); return { isOn: s.classList.contains('is-on'), ctaOnScreen: document.body.classList.contains('cta-on-screen'), pass: !s.classList.contains('is-on') && document.body.classList.contains('cta-on-screen') }; });

    /* 7. Scrawl draws to stroke-dashoffset 0 in view (underline in the offer, strikes on the strip, signature in the close) */
    async function scrawlAt(sel, ctxSel) {
      await page.evaluate(s => { const el = document.querySelector(s); document.documentElement.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - innerHeight / 3, behavior: 'instant' }); }, ctxSel);
      await page.waitForTimeout(1900);
      return page.evaluate(s => { const p = document.querySelector(s + ' path'); const v = getComputedStyle(p).strokeDashoffset; return { value: v, pass: parseFloat(v) === 0 }; }, sel);
    }
    r.checks.scrawlUnderline = await scrawlAt('.offer__copy .scrawl', '.offer__copy');
    r.checks.scrawlStrike = await scrawlAt('.strip__word .scrawl--strike', '.strip__old');
    r.checks.scrawlSignature = await scrawlAt('.close .scrawl--signature', '.close__copy');

    /* 8. Hero drift: the settle animation is cleared and the transform follows scroll */
    await page.evaluate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    const g0 = await page.evaluate(() => { const g = document.querySelector('.hero__giant'); return { anim: getComputedStyle(g).animationName, t: getComputedStyle(g).transform }; });
    await page.evaluate(() => document.documentElement.scrollTo({ top: 300, behavior: 'instant' }));
    await page.waitForTimeout(250);
    const g1 = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__giant')).transform);
    r.checks.heroDrift = { animationCleared: g0.anim === 'none', at0: g0.t, at300: g1, pass: g0.anim === 'none' && g0.t !== g1 };

    /* 9. States: click the second word, belt marker moves and loop word swaps */
    await page.evaluate(() => { const el = document.querySelector('.stage'); document.documentElement.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'instant' }); });
    await page.waitForTimeout(300);
    const m0 = await page.evaluate(() => document.querySelector('.belt__marker').getBoundingClientRect().left);
    await page.click('.state[data-state="focus"]');
    await page.waitForTimeout(800);
    r.checks.states = await page.evaluate(m => { const st = document.querySelector('.stage'); const m1 = document.querySelector('.belt__marker').getBoundingClientRect().left; const sel = Array.from(document.querySelectorAll('.state')).map(s => s.getAttribute('aria-selected') + '/' + s.tabIndex); return { state: st.getAttribute('data-state'), markerBefore: Math.round(m), markerAfter: Math.round(m1), tabs: sel, pass: st.getAttribute('data-state') === 'focus' && m1 > m + 20 && sel.join(',') === 'false/-1,true/0,false/-1' }; }, m0);

    /* 10. Card and pill inventory for the QA record */
    r.checks.inventory = await page.evaluate(() => {
      const rounded = Array.from(document.querySelectorAll('body *')).filter(el => { const cs = getComputedStyle(el); return parseFloat(cs.borderTopLeftRadius) > 0 && (parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none') && el.getBoundingClientRect().width > 0; }).map(el => el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.'));
      const pills = Array.from(document.querySelectorAll('body *')).filter(el => parseFloat(getComputedStyle(el).borderTopLeftRadius) >= 999 && el.getBoundingClientRect().width > 0 && !el.classList.contains('btn')).map(el => el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.'));
      return { roundedBordered: rounded, nonButtonPills: pills, pass: pills.length === 0 };
    });

    /* Screenshots: full page with fixed elements hidden, instant scroll only */
    await page.addStyleTag({ content: '.sticky,.topbar{position:static!important}' });
    await page.evaluate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(here, `harness-${width}.jpg`), fullPage: true, type: 'jpeg', quality: 72 });
    results.viewports[width] = r;
    await context.close();
  }
  await browser.close();
  return results;
}

function summarize(results) {
  const lines = ['# Dandy kit QA results', '', `Browser: ${results.channel}. Harness: qa/dandy-kit/harness.html rendered from sections/dandy-kit-demo.liquid.`, ''];
  let allPass = true;
  for (const w of Object.keys(results.viewports)) {
    const r = results.viewports[w];
    lines.push(`## ${w}px`, '', '| Check | Result | Detail |', '|---|---|---|');
    for (const [name, c] of Object.entries(r.checks)) {
      const detail = Object.entries(c).filter(([k]) => k !== 'pass').map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('; ').replace(/\|/g, '\\|');
      lines.push(`| ${name} | ${c.pass ? 'pass' : 'FAIL'} | ${detail.slice(0, 600)} |`);
      if (!c.pass) allPass = false;
    }
    lines.push('', `Page errors: ${r.errors.length ? r.errors.join(' / ') : 'none'}`, '');
  }
  lines.push(allPass ? 'All checks passed.' : 'Some checks failed.');
  return lines.join('\n');
}

(async () => {
  const harness = buildHarness();
  console.log('harness written:', harness);
  if (process.argv.includes('--harness-only')) return;
  const results = await measure(harness);
  fs.writeFileSync(path.join(here, 'results.json'), JSON.stringify(results, null, 2));
  const md = summarize(results);
  fs.writeFileSync(path.join(here, 'results.md'), md);
  console.log(md);
})().catch(e => { console.error(e); process.exit(1); });
