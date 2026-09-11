/* Dandy paper trail: motion script. Runs after paper-trail.js. One IntersectionObserver of its own and one rAF-throttled scroll listener drive the cutout drift, the counters and the close push-in. Reduced motion leaves every piece at rest: the class that unlocks the CSS start states is never set. */
(function(){
  var d = document, w = window, html = d.documentElement;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in w;
  if (!reduce) html.classList.add('pt-motion');
  function $(s, c){ return (c || d).querySelector(s); }
  function $$(s, c){ return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function raf(f){ w.requestAnimationFrame(f); }
  function clamp(n){ return n < 0 ? 0 : n > 1 ? 1 : n; }

  /* the top bar's height feeds --pt-bar */
  var topbar = $('.topbar');
  function measureBar(){ if (topbar) html.style.setProperty('--pt-bar', topbar.offsetHeight + 'px'); }
  measureBar();

  /* the one observer: each watched element carries its own handler and is released after the first time it is on screen */
  var io = hasIO ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting) { io.unobserve(e.target); e.target._pt(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }) : null;
  function watch(el, fn){ if (!el) return; if (io) { el._pt = fn; io.observe(el); } else fn(el); }

  /* counters: the resting width is fixed before the number starts, then it counts from 0 to the target in 600 ms */
  if (!reduce) $$('.count[data-count]').forEach(function(el){
    var to = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (isNaN(to)) return;
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    el.classList.add('is-counting');
    el.textContent = (0).toFixed(dec);
    watch(el, function(){
      var t0 = null;
      function step(t){
        if (t0 === null) t0 = t;
        var p = clamp((t - t0) / 600); p = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * p).toFixed(dec);
        if (p < 1) raf(step);
      }
      raf(step);
    });
  });

  /* the close linen pushes in once it is on screen */
  if (!reduce) watch($('.close__media'), function(el){ el.classList.add('is-on'); });

  /* the meet Dandy cutouts: once each one has settled its animation is retired and the group drifts 20 px over the next 400 px of scroll (the hero drift, ported) */
  var ready = [], driftBase = null;
  if (!reduce) $$('.meet__plate .cut').forEach(function(c){
    c.addEventListener('animationend', function(){
      c.style.animation = 'none';
      if (driftBase === null) driftBase = w.pageYOffset;
      ready.push(c); drift();
    });
  });
  function drift(){
    if (driftBase === null) return;
    var t = 'translateY(' + (-20 * clamp((w.pageYOffset - driftBase) / 400)) + 'px)';
    ready.forEach(function(c){ c.style.transform = t; });
  }

  /* the test line: one path from the batch number on the pouch (lower left of the macro) to the top of the report. Endpoints come from the two frames' layout boxes inside .test__frames (offset chain, so the reveal transforms never shift them) and are recomputed on resize. Stacked frames: the arc bulges into the lane right of the caption text and lands on the sheet's batch line. Side by side: one S, right along the pouch bottom (under the phone in the photo), a rounded turn up at the photo's right edge, up the gutter and onto the sheet's left edge a third of the way down; every control point stays inside .test__frames and above the macro frame's bottom, so the line never dips beside the caption. Progress runs from the path's start point reaching 85% of the viewport height to its end point reaching 60% (at least 30% of the viewport of scroll), so the reader watches it draw. */
  var frames = $('.test__frames'), lineSvg = frames && $('.test__line', frames), linePath = lineSvg && $('.test__line-path', lineSvg), lineHead = lineSvg && $('.test__line-head', lineSvg);
  var macroImg = frames && $('.test__macro img', frames), paperSheet = frames && $('.paper__sheet', frames), capRow = frames && $('.test__macro .caprow', frames), paperFig = frames && $('.paper', frames);
  var lineOn = !!(frames && linePath && macroImg && paperSheet), lineS = null, lineE = null;
  function box(el){ var x = 0, y = 0, n = el; while (n && n !== frames) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight }; }
  function r1(n){ return Math.round(n * 10) / 10; }
  function seg(a, c1, c2, b){ return 'C' + r1(c1.x) + ' ' + r1(c1.y) + ' ' + r1(c2.x) + ' ' + r1(c2.y) + ' ' + r1(b.x) + ' ' + r1(b.y); }
  function lineGeometry(){
    if (!lineOn) return;
    var W = frames.offsetWidth, H = frames.offsetHeight, m = box(macroImg), p = box(paperSheet), cap = capRow ? box(capRow) : { x: m.x, y: m.y + m.h, w: m.w, h: 0 };
    var edge = cap.x; if (capRow) $$('span', capRow).forEach(function(sp){ var b = box(sp); if (b.x + b.w > edge) edge = b.x + b.w; });
    lineSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var s = { x: m.x + m.w * .42, y: m.y + m.h * .89 }, stacked = p.y >= m.y + m.h - 4, right = stacked ? W : m.x + m.w, a, e, c3, d;
    /* the lane: the clear strip right of the caption words, inside the macro's own width */
    var lane = (right - edge >= 36) ? (edge + right) / 2 : right - 14;
    if (stacked) {
      /* stacked: a quarter sweep right out of the batch label, down through the lane, and onto the top right of the sheet from above */
      a = { x: lane, y: cap.y + cap.h / 2 };
      e = { x: Math.min(p.x + p.w * .85, lane - 30), y: p.y - 3 };
      c3 = { x: e.x + (a.x - e.x) * .35, y: e.y - (e.y - a.y) * .35 };
      d = 'M' + r1(s.x) + ' ' + r1(s.y)
        + seg(s, { x: s.x + (a.x - s.x) * .55, y: s.y }, { x: a.x, y: a.y - (a.y - s.y) * .55 }, a)
        + seg(a, { x: a.x, y: a.y + (e.y - a.y) * .55 }, c3, e);
    } else {
      /* side by side: c1 pulls the line right along the pouch bottom, the turn point sits on the photo's right edge 74% down the frame (right of the phone in the shot, whose bottom is at 82%), and the second segment continues the same tangent up the gutter into a horizontal arrival at the sheet's left edge */
      var floor = m.y + m.h - 8, gapW = Math.max(12, p.x - right);
      var t = { x: right, y: m.y + m.h * .74 };
      e = { x: p.x - 4, y: p.y + p.h * .33 };
      var dir = { x: (e.x - t.x) * .35, y: e.y - t.y };
      var c1 = { x: s.x + (t.x - s.x) * .6, y: s.y }, c2 = { x: t.x - dir.x * .25, y: t.y - dir.y * .25 };
      var c3a = { x: t.x + dir.x * .3, y: t.y + dir.y * .3 };
      c3 = { x: e.x - gapW * .55, y: e.y };
      [c1, c2, c3a, c3].forEach(function(c){ c.x = Math.max(0, Math.min(W, c.x)); c.y = Math.max(0, Math.min(floor, c.y)); });
      d = 'M' + r1(s.x) + ' ' + r1(s.y) + seg(s, c1, c2, t) + seg(t, c3a, c3, e);
    }
    lineS = s; lineE = e;
    linePath.setAttribute('d', d);
    if (lineHead) {
      var ang = Math.atan2(e.y - c3.y, e.x - c3.x) * 180 / Math.PI - 90;
      lineHead.setAttribute('transform', 'translate(' + r1(e.x) + ' ' + r1(e.y) + ') rotate(' + r1(ang) + ')');
    }
  }
  function lineProgress(){
    if (!lineOn || reduce || !lineS) return;
    /* 0 when the start point (the batch area on the pouch) reaches 85% of the viewport height, 1 when the end point (the chevron on the report) reaches 60%; side by side the end is above the start, so the window is never shorter than 30% of the viewport */
    var vh = w.innerHeight, top = frames.getBoundingClientRect().top;
    var from = top + lineS.y - vh * .85, to = top + lineE.y - vh * .6;
    var p = clamp(-from / Math.max(to - from, vh * .3));
    linePath.style.strokeDashoffset = 1 - p;
    if (lineHead) lineHead.classList.toggle('is-on', p > .96);
  }
  if (lineOn) { lineGeometry(); w.addEventListener('load', lineGeometry); }

  var tick = false;
  function update(){ tick = false; drift(); lineProgress(); }
  function onScroll(){ if (!tick) { tick = true; raf(update); } }
  w.addEventListener('scroll', onScroll, { passive: true });
  w.addEventListener('resize', function(){ measureBar(); lineGeometry(); onScroll(); });
  update();
})();
