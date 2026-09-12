/* Dandy review hub QA. Renders sections/dandy-reviews.liquid into a static harness (harness.html) with the shared header and footer
   snippets stubbed as plain bars and a minimal layout (Google Fonts Barlow pair, dandy-reviews.css), serves the worktree over a local
   HTTP server so fetch() can read assets/dandy-reviews.json, and measures it in Playwright at 390, 430, 768 and 1280 plus a behaviour
   suite at 390 (filters, search, sort, URL state, keyboard, analytics, Show more, no-JS and fetch-failure fallbacks) and a parse
   plus first-render timing at 390 under 4x CPU throttling. Expectations are derived from assets/dandy-reviews.json itself. Writes harness.html,
   results.json and results.md beside itself and full-page screenshots to shots/ (or $RVH_SHOTS), which are not committed. */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const here = __dirname;
const root = path.resolve(here, '..', '..');
const shotsDir = process.env.RVH_SHOTS || path.join(here, 'shots');
const seed = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'dandy-reviews.json'), 'utf8'));
const PAGE = 20;
const FALLBACK = 3; /* Liquid-rendered cards for no-JS and fetch failure */
const text = r => (r.headline + ' ' + r.body).toLowerCase();
const byDate = (a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
const byHelpful = (a, b) => (b.helpful || 0) - (a.helpful || 0) || byDate(a, b);
const ids = list => list.map(r => String(r.id));

/* ---------- harness: a small Liquid subset (render stubs, asset_url, comment, schema) ---------- */
function buildHarness() {
  let s = fs.readFileSync(path.join(root, 'sections', 'dandy-reviews.liquid'), 'utf8');
  s = s.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '');
  s = s.replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, '');
  s = s.replace(/\{%-?\s*render\s+'dandy-home-header'\s*-?%\}/g, '<div class="stub stub--head" style="background:#28110c;color:#faf5f0;padding:18px var(--pad,20px);font:500 14px/1.4 Barlow,Arial,sans-serif">Header stub (dandy-home-header)</div>');
  s = s.replace(/\{%-?\s*render\s+'dandy-home-footer'\s*-?%\}/g, '<div class="stub stub--foot" style="background:#28110c;color:#faf5f0;padding:40px var(--pad,20px);font:500 14px/1.4 Barlow,Arial,sans-serif">Footer stub (dandy-home-footer)</div>');
  s = s.replace(/\{\{\s*'([^']+)'\s*\|\s*asset_url\s*\}\}/g, (m, f) => '/assets/' + f);
  s = s.replace(/\{%-?[\s\S]*?-?%\}/g, '').replace(/\{\{[\s\S]*?\}\}/g, '');
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Dandy reviews harness</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/dandy-reviews.css">
<style>html,body{margin:0;background:#faf5f0}</style>
</head>
<body>
${s}
</body>
</html>`;
  fs.writeFileSync(path.join(here, 'harness.html'), html);
}

/* ---------- static server over the worktree ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(root, p);
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, base: 'http://127.0.0.1:' + server.address().port }));
  });
}

async function launch() {
  const { chromium } = require('playwright');
  return chromium.launch();
}

const HARNESS = '/qa/dandy-reviews/harness.html';
const expect = {
  total: seed.length, pageOne: Math.min(PAGE, seed.length),
  byFormat: Object.fromEntries(['gummies', 'capsules', 'powder'].map(f => [f, seed.filter(r => r.product === f).length])),
  byBenefit: Object.fromEntries(['focus-stamina', 'joint-body-comfort', 'coffee-alternative', 'taste-flavor', 'evening-unwind', 'first-time-user'].map(b => [b, seed.filter(r => (r.benefits || []).includes(b)).length])),
  avg: (Math.round(seed.reduce((s, r) => s + r.rating, 0) / seed.length * 10) / 10).toFixed(1),
  verifiedPct: Math.round(seed.filter(r => r.verified).length / seed.length * 100),
  hasRecommend: seed.some(r => typeof r.recommend === 'boolean'),
  /* the hub's default order blends rating (dominant), helpful votes capped at 30 and a recency bonus, then newest first; mirrors assets/dandy-reviews.js */
  relevant: ids(seed.slice().sort((a, b) => (relevance(b) - relevance(a)) || byDate(a, b))).slice(0, PAGE)
};
function relevance(r) { return Number(r.rating) * 10 + Math.min(Number(r.helpful) || 0, 30) + (String(r.date) >= '2025-06-01' ? 5 : 0); }

async function open(browser, width, opts, url) {
  const height = width >= 1024 ? 800 : 844;
  const context = await browser.newContext(Object.assign({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 860, hasTouch: width < 860 }, opts || {}));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  return { page, context, errors };
}

async function waitReady(page) {
  await page.waitForFunction(() => document.querySelector('.rvh').classList.contains('is-ready') || document.querySelector('.rvh').classList.contains('is-static'), null, { timeout: 8000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

/* ---------- viewport pass ---------- */
async function measure(browser, base, width) {
  const { page, context, errors } = await open(browser, width, null, base + HARNESS);
  await waitReady(page);
  const r = { width, errors, checks: {} };

  r.checks.overflow = await page.evaluate(() => {
    const de = document.documentElement; const wide = [];
    const clipped = el => { for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'clip') return true; } return false; };
    document.querySelectorAll('body *').forEach(el => { const b = el.getBoundingClientRect(); if (b.width > 0 && (b.right > innerWidth + 1 || b.left < -1) && getComputedStyle(el).position !== 'fixed' && !clipped(el)) wide.push(el.tagName.toLowerCase() + '.' + String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').trim().split(/\s+/).slice(0, 2).join('.') + ' ' + Math.round(b.left) + '..' + Math.round(b.right)); });
    return { scrollWidth: de.scrollWidth, innerWidth, offenders: wide.slice(0, 12), pass: de.scrollWidth <= innerWidth && wide.length === 0 };
  });

  r.checks.typeFloor = await page.evaluate(() => {
    const small = [], bodySmall = [];
    const walker = document.createTreeWalker(document.querySelector('.rvh'), NodeFilter.SHOW_TEXT);
    let n; const seen = new Set();
    while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue; const el = n.parentElement; if (seen.has(el)) continue; seen.add(el);
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]') || el.classList.contains('rvh-vh')) continue;
      const fs = parseFloat(cs.fontSize);
      const tag = el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.');
      if (fs < 13) small.push(tag + ' ' + fs);
      if ((el.tagName === 'P' && !el.classList.contains('rvh__count') && !el.classList.contains('rvh-card__who') && !el.classList.contains('rvh-card__helpful')) && fs < 16) bodySmall.push(tag + ' ' + fs); /* count, who and helpful are 15px meta lines, not body copy */
    }
    const cardBody = parseFloat(getComputedStyle(document.querySelector('.rvh-card__body')).fontSize);
    const h1 = parseFloat(getComputedStyle(document.querySelector('.rvh__h1')).fontSize);
    return { under13: small, bodyUnder16: bodySmall, cardBody, h1, pass: small.length === 0 && bodySmall.length === 0 && cardBody === 17 };
  });

  r.checks.dashes = await page.evaluate(() => { const t = document.body.innerText; const n = (t.match(/[–—]/g) || []).length; return { count: n, pass: n === 0 }; });

  r.checks.eyebrows = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('.rvh *').forEach(el => {
      const cs = getComputedStyle(el); if (!el.textContent.trim() || cs.display === 'none') return;
      const fs = parseFloat(cs.fontSize), ls = parseFloat(cs.letterSpacing) || 0;
      if (fs < 15 && (cs.textTransform === 'uppercase' || ls > 0)) { const next = el.nextElementSibling; if (next && /^H[1-6]$/.test(next.tagName)) bad.push(el.className); }
    });
    return { offenders: bad, pass: bad.length === 0 };
  });

  r.checks.inventory = await page.evaluate(() => {
    const name = el => el.tagName.toLowerCase() + '.' + String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').trim().split(/\s+/).slice(0, 2).join('.');
    const vis = el => el.getBoundingClientRect().width > 0 && !el.closest('[hidden]');
    const els = Array.from(document.querySelectorAll('body *')).filter(vis);
    const rounded = els.filter(el => { const cs = getComputedStyle(el); return parseFloat(cs.borderTopLeftRadius) > 8 && (parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none'); });
    const allowed = el => el.classList.contains('rvh-card') || el.classList.contains('rvh__search') || el.classList.contains('rvh__sort') || el.classList.contains('btn');
    const disallowed = rounded.filter(el => !allowed(el)).map(name);
    const pills = els.filter(el => parseFloat(getComputedStyle(el).borderTopLeftRadius) >= 999 && !el.classList.contains('btn')).map(name);
    const cards = rounded.filter(el => el.classList.contains('rvh-card')).length;
    return { roundedBordered: rounded.map(name), disallowed, nonButtonPills: pills, cards, pass: disallowed.length === 0 && pills.length === 0 && cards === document.querySelectorAll('.rvh-card').length };
  });

  r.checks.buttons = await page.evaluate(() => {
    const out = Array.from(document.querySelectorAll('.rvh .btn')).filter(b => !b.closest('[hidden]') && !b.hidden).map(b => { const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); const box = (b.closest('.rvh-card__cta') || b.parentElement).getBoundingClientRect(); return { text: b.textContent.trim(), h: Math.round(r.height), fs: parseFloat(cs.fontSize), radius: cs.borderTopLeftRadius, w: Math.round(r.width), full: Math.abs(r.width - box.width) < 1 }; });
    const phone = innerWidth <= 860;
    const ok = out.every(b => b.h >= 42 && b.fs >= 16 && parseFloat(b.radius) >= 21) && (!phone || out.every(b => b.full));
    const summary = {}; out.forEach(b => { const k = b.text + ' ' + b.h + 'px ' + b.fs + 'px' + (b.full ? ' full' : ''); summary[k] = (summary[k] || 0) + 1; });
    return { summary, phone, pass: ok };
  });

  r.checks.factsDots = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('.rvh-facts').forEach(f => {
      const items = Array.from(f.children); const left = f.getBoundingClientRect().left + parseFloat(getComputedStyle(f).paddingLeft);
      const textRect = li => { const rg = document.createRange(); rg.selectNodeContents(li); const rects = rg.getClientRects(); return rects.length ? rects[0] : li.getBoundingClientRect(); };
      items.filter(li => !li.hidden && li.getBoundingClientRect().width > 0).forEach((li, k, vis) => {
        const prev = vis[k - 1];
        const t = textRect(li);
        const firstOnLine = !prev || Math.round(textRect(prev).top) < Math.round(t.top);
        if (firstOnLine && Math.abs(t.left - left) > 1) bad.push(li.textContent.trim() + ' ' + Math.round(t.left - left));
        const dot = getComputedStyle(li, '::before').content !== 'none';
        if (k === 0 && dot) bad.push('dot on first item: ' + li.textContent.trim());
      });
    });
    return { lists: document.querySelectorAll('.rvh-facts').length, misaligned: bad, pass: bad.length === 0 };
  });

  r.checks.layout = await page.evaluate(() => {
    const cols = getComputedStyle(document.querySelector('.rvh__grid')).gridTemplateColumns.split(' ').length;
    const h1 = document.querySelector('.rvh__h1'); const h1Lines = Math.round(h1.getBoundingClientRect().height / (parseFloat(getComputedStyle(h1).fontSize) * 1.02));
    const fmt = document.querySelector('.rvh__formats').getBoundingClientRect(); const fmtLines = Math.round(fmt.height / document.querySelector('.rvh__format').getBoundingClientRect().height);
    const want = innerWidth >= 1024 ? 3 : innerWidth >= 641 ? 2 : 1;
    return { gridColumns: cols, h1Lines, formatRows: fmtLines, pass: cols === want };
  });

  r.checks.contrast = await page.evaluate(() => {
    /* text on the cream ground: every visible text element's colour against its nearest painted background */
    const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const a = m.length > 3 ? m[3] : 1; return { r: m[0], g: m[1], b: m[2], a }; };
    const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) });
    const L = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
    const bgOf = el => { for (let a = el; a; a = a.parentElement) { const c = lum(getComputedStyle(a).backgroundColor); if (c.a > 0) return c; } return { r: 250, g: 245, b: 240, a: 1 }; };
    const bad = [];
    document.querySelectorAll('.rvh p, .rvh h1, .rvh h2, .rvh li, .rvh button, .rvh span, .rvh option').forEach(el => {
      if (!el.textContent.trim() || el.closest('[hidden]') || el.classList.contains('rvh-vh') || el.tagName === 'OPTION') return;
      const cs = getComputedStyle(el); if (cs.display === 'none') return;
      const bg = bgOf(el); const fg = blend(lum(cs.color), bg);
      const ratio = (Math.max(L(fg), L(bg)) + .05) / (Math.min(L(fg), L(bg)) + .05);
      const fs = parseFloat(cs.fontSize); const large = fs >= 24 || (fs >= 18.66 && parseInt(cs.fontWeight) >= 700);
      if (ratio < (large ? 3 : 4.5)) bad.push(el.className + ' ' + ratio.toFixed(2));
    });
    return { offenders: bad, pass: bad.length === 0 };
  });

  fs.mkdirSync(shotsDir, { recursive: true });
  await page.evaluate(() => document.documentElement.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: path.join(shotsDir, `hub-${width}.png`), fullPage: true });
  await context.close();
  return r;
}

/* ---------- behaviour suite at 390 ---------- */
async function behaviour(browser, base) {
  const out = {};
  const cards = page => page.evaluate(() => Array.from(document.querySelectorAll('.rvh-card')).map(c => c.getAttribute('data-id')));
  const counts = page => page.evaluate(() => ({
    formats: Object.fromEntries(Array.from(document.querySelectorAll('[data-format-n]')).map(s => [s.getAttribute('data-format-n'), Number(s.textContent.replace(/,/g, ''))])),
    benefits: Object.fromEntries(Array.from(document.querySelectorAll('[data-benefit]')).map(b => [b.getAttribute('data-benefit'), { n: Number(b.querySelector('[data-benefit-n]').textContent.replace(/,/g, '')), hidden: b.hidden, pressed: b.getAttribute('aria-pressed') }])),
    selected: document.querySelector('[data-format][aria-selected="true"]').getAttribute('data-format'),
    count: document.querySelector('[data-rvh-count]').textContent, n: Number((document.querySelector('[data-rvh-count]').textContent.match(/of ([\d,]+)/) || [0, '0'])[1].replace(/,/g, '')), empty: document.querySelector('[data-rvh-empty]').hidden === false, more: document.querySelector('[data-rvh-more]').hidden === false,
    url: location.search
  }));

  /* a. scorecard is computed from the data */
  {
    const { page, context, errors } = await open(browser, 390, null, base + HARNESS);
    await waitReady(page);
    const s = await page.evaluate(() => ({
      avg: document.querySelector('[data-rvh-avg]').textContent, sub: document.querySelector('[data-rvh-avg-sub]').textContent,
      bars: Object.fromEntries(Array.from(document.querySelectorAll('[data-star-pct]')).map(e => [e.getAttribute('data-star-pct'), e.textContent])),
      fills: Object.fromEntries(Array.from(document.querySelectorAll('[data-star]')).map(e => [e.getAttribute('data-star'), e.style.width])),
      recommendHidden: !document.querySelector('[data-rvh-recommend]') || document.querySelector('[data-rvh-recommend]').hidden, verified: document.querySelector('[data-rvh-verified]').textContent,
      stars: document.querySelectorAll('[data-rvh-avg-stars] .rvh-star--on').length, busy: document.querySelector('[data-rvh-score]').getAttribute('aria-busy')
    }));
    const barsWant = {}; for (let k = 1; k <= 5; k++) barsWant[k] = Math.round(seed.filter(r => r.rating === k).length / seed.length * 100) + '%';
    out.scorecard = Object.assign(s, { want: { avg: expect.avg, bars: barsWant }, errors, pass: s.avg === expect.avg && JSON.stringify(s.bars) === JSON.stringify(barsWant) && s.recommendHidden === !expect.hasRecommend && s.verified === expect.verifiedPct + '% verified purchases' && s.busy === null && s.sub.indexOf(seed.length.toLocaleString('en-US')) >= 0 });

    /* b. initial counts and cards */
    const c0 = await counts(page); const ids0 = await cards(page);
    out.initial = { counts: c0, cards: ids0, pass: c0.formats.all === expect.total && ['gummies', 'capsules', 'powder'].every(f => c0.formats[f] === expect.byFormat[f]) && Object.keys(expect.byBenefit).every(b => c0.benefits[b].n === expect.byBenefit[b] && c0.benefits[b].hidden === (expect.byBenefit[b] === 0)) && ids0.length === expect.pageOne && c0.n === expect.total && ids0.join() === expect.relevant.join() && !c0.empty && c0.more === (seed.length > PAGE) };

    /* c. each format filter yields the right cards and the URL follows; format clicks are tracked */
    await page.evaluate(() => { window.dataLayer = []; });
    const perFormat = {};
    for (const f of ['gummies', 'capsules', 'powder', 'all']) {
      await page.click(`[data-format="${f}"]`); await page.waitForTimeout(100);
      const ids = await cards(page); const c = await counts(page);
      const want = f === 'all' ? seed : seed.filter(r => r.product === f);
      perFormat[f] = { cards: ids.length, n: c.n, want: want.length, selected: c.selected, url: c.url, pass: ids.length === Math.min(PAGE, want.length) && c.n === want.length && ids.every(id => want.some(r => String(r.id) === id)) && c.selected === f && (f === 'all' ? !/fmt=/.test(c.url) : c.url.includes('fmt=' + f)) };
    }
    const dl = await page.evaluate(() => window.dataLayer.filter(e => e.event === 'review_hub_format_filter').map(e => e.label));
    out.formats = { perFormat, tracked: dl, pass: Object.values(perFormat).every(x => x.pass) && dl.join() === 'gummies,capsules,powder,all' };

    /* d. each benefit toggle */
    const perBenefit = {};
    for (const b of Object.keys(expect.byBenefit)) {
      if (expect.byBenefit[b] === 0) continue;
      await page.click(`[data-benefit="${b}"]`); await page.waitForTimeout(100);
      const ids = await cards(page); const c = await counts(page);
      const want = seed.filter(r => (r.benefits || []).includes(b));
      perBenefit[b] = { cards: ids.length, n: c.n, want: want.length, pressed: c.benefits[b].pressed, url: c.url, pass: ids.length === Math.min(PAGE, want.length) && c.n === want.length && ids.every(id => want.some(r => String(r.id) === id)) && c.benefits[b].pressed === 'true' && c.url.includes('benefit=' + b) };
      await page.click(`[data-benefit="${b}"]`); await page.waitForTimeout(100);
    }
    const cAfter = await counts(page);
    out.benefits = { perBenefit, urlCleared: !/benefit=/.test(cAfter.url), pass: Object.values(perBenefit).every(x => x.pass) && !/benefit=/.test(cAfter.url) };

    /* e. search: case-insensitive on headline and body, debounced, relevance order, empty state and clear */
    await page.fill('[data-rvh-search]', 'COFFEE'); await page.waitForTimeout(40);
    const immediate = await counts(page);
    await page.waitForTimeout(300);
    const afterCoffee = await cards(page); const cCoffee = await counts(page);
    const wantCoffee = seed.filter(r => text(r).includes('coffee'));
    await page.fill('[data-rvh-search]', 'garden'); await page.waitForTimeout(300);
    const afterGarden = await counts(page);
    await page.fill('[data-rvh-search]', 'zzzz nothing'); await page.waitForTimeout(300);
    const cEmpty = await counts(page); const emptyCards = await cards(page);
    await page.click('[data-rvh-clear]'); await page.waitForTimeout(150);
    const cCleared = await counts(page); const clearedCards = await cards(page);
    const wantGarden = seed.filter(r => text(r).includes('garden')).length;
    out.search = { immediateN: immediate.n, coffeeN: cCoffee.n, wantCoffee: wantCoffee.length, firstPage: afterCoffee.length, url: cCoffee.url, gardenN: afterGarden.n, wantGarden, empty: cEmpty.empty, emptyCards: emptyCards.length, cleared: cCleared.n, clearedCards: clearedCards.length,
      pass: immediate.n === seed.length && cCoffee.n === wantCoffee.length && afterCoffee.length === Math.min(PAGE, wantCoffee.length) && afterCoffee.every(id => wantCoffee.some(r => String(r.id) === id)) && cCoffee.url.includes('q=COFFEE') && afterGarden.n === wantGarden && cEmpty.empty && emptyCards.length === 0 && !cCleared.empty && cCleared.n === seed.length && clearedCards.length === expect.pageOne && cCleared.url === '' };

    /* f. sort */
    await page.selectOption('[data-rvh-sort]', 'recent'); await page.waitForTimeout(100);
    const recent = await cards(page);
    const wantRecent = ids(seed.slice().sort(byDate)).slice(0, PAGE);
    await page.selectOption('[data-rvh-sort]', 'rating'); await page.waitForTimeout(100);
    const rated = await cards(page);
    const wantRated = ids(seed.slice().sort((a, b) => b.rating - a.rating || byHelpful(a, b))).slice(0, PAGE);
    await page.selectOption('[data-rvh-sort]', 'relevant'); await page.waitForTimeout(100);
    const rel = await cards(page);
    out.sort = { recent: recent.slice(0, 5), wantRecent: wantRecent.slice(0, 5), rated: rated.slice(0, 5), wantRated: wantRated.slice(0, 5), relevant: rel.slice(0, 5), wantRelevant: expect.relevant.slice(0, 5), pass: recent.join() === wantRecent.join() && rated.join() === wantRated.join() && rel.join() === expect.relevant.join() };

    /* g. keyboard: Tab reaches the selected format word, arrows move the selection, Tab then reaches search, sort and the benefit toggles; Space toggles a benefit */
    await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
    await page.focus('[data-format="all"]');
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    const k1 = await page.evaluate(() => ({ active: document.activeElement.getAttribute('data-format'), selected: document.querySelector('[data-format][aria-selected="true"]').getAttribute('data-format'), cards: document.querySelectorAll('.rvh-card').length }));
    await page.keyboard.press('End'); await page.waitForTimeout(80);
    const k2 = await page.evaluate(() => ({ active: document.activeElement.getAttribute('data-format'), selected: document.querySelector('[data-format][aria-selected="true"]').getAttribute('data-format') }));
    await page.keyboard.press('Home'); await page.waitForTimeout(80);
    await page.keyboard.press('Tab');
    const k3 = await page.evaluate(() => document.activeElement.id);
    await page.keyboard.press('Tab');
    const k4 = await page.evaluate(() => document.activeElement.id);
    await page.keyboard.press('Tab');
    const k5 = await page.evaluate(() => document.activeElement.getAttribute('data-benefit'));
    await page.keyboard.press('Space'); await page.waitForTimeout(100);
    const k6 = await page.evaluate(() => ({ pressed: document.activeElement.getAttribute('aria-pressed'), cards: document.querySelectorAll('.rvh-card').length, benefit: document.activeElement.getAttribute('data-benefit') }));
    await page.keyboard.press('Space'); await page.waitForTimeout(100);
    const k7 = await page.evaluate(() => document.querySelectorAll('.rvh-card').length);
    const tabbable = await page.evaluate(() => document.querySelectorAll('[data-format][tabindex="0"]').length);
    out.keyboard = { arrow: k1, end: k2, afterTab: k3, afterTab2: k4, firstBenefit: k5, spaceToggle: k6, untoggled: k7, tabbableFormats: tabbable,
      pass: k1.active === 'gummies' && k1.selected === 'gummies' && k1.cards === Math.min(PAGE, expect.byFormat.gummies) && k2.selected === 'powder' && k3 === 'rvh-search' && k4 === 'rvh-sort' && !!k5 && k6.pressed === 'true' && k6.cards === Math.min(PAGE, expect.byBenefit[k6.benefit]) && k7 === expect.pageOne && tabbable === 1 };

    /* h. PDP button: tracked with the product label (navigation prevented) */
    await page.evaluate(() => { window.dataLayer = []; document.addEventListener('click', e => { if (e.target.closest('a')) e.preventDefault(); }, true); });
    await page.click('.rvh-card [data-track="review_card_pdp_click"]');
    const pdp = await page.evaluate(() => window.dataLayer);
    const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('.rvh-card .btn')).map(a => a.getAttribute('href') + ' ' + a.textContent.trim()));
    out.pdp = { events: pdp, hrefs, pass: pdp.length === 1 && pdp[0].event === 'review_card_pdp_click' && pdp[0].label === seed.find(r => String(r.id) === expect.relevant[0]).product && hrefs.every(h => /^\/products\//.test(h)) };

    /* i. first card's stars rest at full opacity after the sequence, and the noscript style is not active */
    await page.waitForTimeout(700);
    out.stars = await page.evaluate(() => { const s = Array.from(document.querySelectorAll('.rvh__grid > li:first-child .rvh-star')); return { count: s.length, opacities: s.map(x => getComputedStyle(x).opacity), pass: s.length === 5 && s.every(x => getComputedStyle(x).opacity === '1') }; });
    out.errors = { list: errors, pass: errors.length === 0 };
    await context.close();
  }

  /* j. deep link opens filtered */
  {
    const { page, context } = await open(browser, 390, null, base + HARNESS + '?fmt=capsules&benefit=joint-body-comfort&q=garden');
    await waitReady(page);
    const c = await counts(page); const ids = await cards(page);
    const want = seed.filter(r => r.product === 'capsules' && (r.benefits || []).includes('joint-body-comfort') && text(r).includes('garden'));
    const q = await page.inputValue('[data-rvh-search]');
    out.deepLink = { selected: c.selected, pressed: c.benefits['joint-body-comfort'].pressed, q, n: c.n, want: want.length, firstPage: ids.length, pass: c.selected === 'capsules' && c.benefits['joint-body-comfort'].pressed === 'true' && q === 'garden' && c.n === want.length && ids.length === Math.min(PAGE, want.length) };
    await context.close();
  }

  /* k. preview params survive URL writes */
  {
    const { page, context } = await open(browser, 390, null, base + HARNESS + '?view=reviews&preview_theme_id=123');
    await waitReady(page);
    await page.click('[data-format="gummies"]'); await page.waitForTimeout(100);
    const url = await page.evaluate(() => location.search);
    out.preserveParams = { url, pass: url.includes('view=reviews') && url.includes('preview_theme_id=123') && url.includes('fmt=gummies') };
    await context.close();
  }

  /* l. show more: with 45 synthetic reviews, 20 render, Show more reveals 20 then 5 */
  {
    const many = []; for (let i = 0; i < 45; i++) { const s = seed[i % seed.length]; many.push(Object.assign({}, s, { id: 'syn-' + i, date: '2026-01-' + String(1 + (i % 28)).padStart(2, '0') })); }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await context.route('**/assets/dandy-reviews.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(many) }));
    const page = await context.newPage();
    await page.goto(base + HARNESS, { waitUntil: 'load' }); await waitReady(page);
    const n0 = (await cards(page)).length; const c0 = await counts(page);
    await page.click('[data-rvh-more]'); await page.waitForTimeout(100);
    const n1 = (await cards(page)).length; const c1 = await counts(page);
    await page.click('[data-rvh-more]'); await page.waitForTimeout(100);
    const n2 = (await cards(page)).length; const c2 = await counts(page);
    out.showMore = { first: n0, second: n1, third: n2, counts: [c0.count, c1.count, c2.count], moreVisible: [c0.more, c1.more, c2.more], pass: n0 === 20 && n1 === 40 && n2 === 45 && c0.more && c1.more && !c2.more };
    await context.close();
  }

  /* m. no JS: the three seed cards render and the controls hide */
  {
    const { page, context } = await open(browser, 390, { javaScriptEnabled: false }, base + HARNESS);
    await page.waitForTimeout(400);
    out.noJs = await page.evaluate(() => ({ cards: document.querySelectorAll('.rvh-card').length, controls: getComputedStyle(document.querySelector('.rvh__controls')).display, score: getComputedStyle(document.querySelector('.rvh__score')).display, pass: document.querySelectorAll('.rvh-card').length === 3 /* FALLBACK */ && getComputedStyle(document.querySelector('.rvh__controls')).display === 'none' && getComputedStyle(document.querySelector('.rvh__score')).display === 'none' }));
    await context.close();
  }

  /* n. fetch failure: seed cards stay, scorecard and controls hide, no page error */
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await context.route('**/assets/dandy-reviews.json', route => route.fulfill({ status: 500, body: 'nope' }));
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(base + HARNESS, { waitUntil: 'load' }); await waitReady(page);
    out.fetchFail = await page.evaluate(() => ({ cards: document.querySelectorAll('.rvh-card').length, controlsHidden: document.querySelector('.rvh__controls').hidden, scoreHidden: document.querySelector('[data-rvh-score]').hidden, isStatic: document.querySelector('.rvh').classList.contains('is-static') }));
    out.fetchFail.errors = errors; out.fetchFail.pass = out.fetchFail.cards === FALLBACK && out.fetchFail.controlsHidden && out.fetchFail.scoreHidden && errors.length === 0;
    await context.close();
  }

  /* o. reduced motion: card grid and scorecard geometry identical to the animated resting state */
  {
    const geo = async (opts) => { const { page, context } = await open(browser, 390, opts, base + HARNESS); await waitReady(page); await page.waitForTimeout(900); const g = await page.evaluate(() => Array.from(document.querySelectorAll('.rvh-card, .rvh__score, .rvh__bar-fill, .rvh-star')).map(el => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)].join(','); })); await context.close(); return g; };
    const a = await geo(null), b = await geo({ reducedMotion: 'reduce' });
    out.reducedMotion = { nodes: a.length, identical: a.join('|') === b.join('|'), pass: a.length > 0 && a.join('|') === b.join('|') };
  }
  /* p. helpful: plain text, only when over 0, never a control */
  {
    const { page, context } = await open(browser, 390, null, base + HARNESS);
    await waitReady(page);
    out.helpful = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.rvh-card'));
      const rows = cards.map(c => { const h = c.querySelector('.rvh-card__helpful'); return { id: c.getAttribute('data-id'), text: h ? h.textContent : null, tag: h ? h.tagName : null, controls: h ? h.querySelectorAll('button,a,input').length : 0 }; });
      return { rows: rows.slice(0, 3), all: rows };
    });
    const bad = out.helpful.all.filter(r => { const s = seed.find(x => String(x.id) === r.id); const h = s && s.helpful > 0; return h ? !(r.tag === 'P' && r.controls === 0 && r.text === s.helpful.toLocaleString('en-US') + (s.helpful === 1 ? ' person' : ' people') + ' found this helpful') : r.text !== null; });
    out.helpful = { sample: out.helpful.rows, checked: out.helpful.all.length, bad, pass: out.helpful.all.length > 0 && bad.length === 0 };
    await context.close();
  }

  /* q. parse and first render at 390 with the CPU throttled 4x (a mid phone); budget 300ms for parse plus render */
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto(base + HARNESS, { waitUntil: 'load' }); await waitReady(page);
    const t = await page.evaluate(() => { const r = document.querySelector('.rvh'); return { parseMs: Number(r.getAttribute('data-rvh-parse-ms')), renderMs: Number(r.getAttribute('data-rvh-render-ms')) }; });
    const bytes = fs.statSync(path.join(root, 'assets', 'dandy-reviews.json')).size;
    /* an interaction: typing a query re-filters the full set */
    await page.fill('[data-rvh-search]', 'coffee');
    await page.waitForTimeout(400);
    const filterMs = await page.evaluate(() => { const t0 = performance.now(); const b = document.querySelector('[data-format="capsules"]'); b.click(); const t1 = performance.now(); document.querySelector('[data-format="all"]').click(); return Math.round((t1 - t0) * 10) / 10; });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    out.timing = { records: seed.length, jsonBytes: bytes, cpuThrottle: 4, parseMs: t.parseMs, renderMs: t.renderMs, totalMs: t.parseMs + t.renderMs, formatClickMs: filterMs, pass: t.parseMs + t.renderMs < 300 };
    await context.close();
  }
  return out;
}

/* ---------- main ---------- */
(async () => {
  buildHarness();
  if (process.argv.includes('--harness-only')) { console.log('harness written'); return; }
  const { server, base } = await serve();
  const browser = await launch();
  const results = { ran: new Date().toISOString(), seed: expect, viewports: [], behaviour: null };
  try {
    for (const w of [390, 430, 768, 1280]) results.viewports.push(await measure(browser, base, w));
    results.behaviour = await behaviour(browser, base);
  } finally { await browser.close(); server.close(); }

  let fails = 0; const lines = ['# Dandy review hub QA', '', 'Ran ' + results.ran + '. Seed: ' + expect.total + ' reviews. Screenshots in `' + path.relative(root, shotsDir) + '/`.', '', '| Check | 390 | 430 | 768 | 1280 |', '|---|---|---|---|---|'];
  const names = Object.keys(results.viewports[0].checks);
  for (const n of names) { const row = results.viewports.map(v => { const c = v.checks[n]; if (!c.pass) fails++; return c.pass ? 'pass' : 'FAIL'; }); lines.push('| ' + n + ' | ' + row.join(' | ') + ' |'); }
  lines.push('| console errors | ' + results.viewports.map(v => { if (v.errors.length) fails++; return v.errors.length ? 'FAIL' : 'pass'; }).join(' | ') + ' |');
  lines.push('', '## Behaviour (390)', '', '| Check | Result |', '|---|---|');
  for (const [k, v] of Object.entries(results.behaviour)) { if (!v.pass) fails++; lines.push('| ' + k + ' | ' + (v.pass ? 'pass' : 'FAIL') + ' |'); }
  lines.push('', '## Details', '');
  for (const v of results.viewports) { lines.push('### ' + v.width, ''); lines.push('- h1 ' + v.checks.typeFloor.h1 + 'px, ' + v.checks.layout.h1Lines + ' lines; format row ' + v.checks.layout.formatRows + ' rows; grid ' + v.checks.layout.gridColumns + ' columns'); const inv = {}; v.checks.inventory.roundedBordered.forEach(n => { inv[n] = (inv[n] || 0) + 1; }); lines.push('- rounded bordered: ' + Object.entries(inv).map(([k, n]) => k + ' x' + n).join(', ')); if (!v.checks.overflow.pass) lines.push('- overflow: ' + JSON.stringify(v.checks.overflow.offenders)); if (!v.checks.typeFloor.pass) lines.push('- type: ' + JSON.stringify(v.checks.typeFloor)); if (!v.checks.contrast.pass) lines.push('- contrast: ' + JSON.stringify(v.checks.contrast.offenders)); if (!v.checks.factsDots.pass) lines.push('- facts: ' + JSON.stringify(v.checks.factsDots.misaligned)); if (v.errors.length) lines.push('- errors: ' + JSON.stringify(v.errors)); lines.push(''); }
  const tm = results.behaviour.timing; lines.push('- timing at 390, CPU 4x: parse ' + tm.parseMs + 'ms, first render ' + tm.renderMs + 'ms, total ' + tm.totalMs + 'ms for ' + tm.records + ' records (' + Math.round(tm.jsonBytes / 1024) + ' KB raw); format click ' + tm.formatClickMs + 'ms');
  for (const [k, v] of Object.entries(results.behaviour)) if (!v.pass) lines.push('- ' + k + ': ' + JSON.stringify(v));
  fs.writeFileSync(path.join(here, 'results.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(here, 'results.md'), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  process.exit(fails ? 2 : 0);
})().catch(e => { console.error(e); process.exit(1); });
