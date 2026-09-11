/* Dandy premium page kit: motion and media controllers extracted from cshop.js.
   Every initialiser is a named method on window.DandyKit and takes an optional root, so a page calls only what it uses.
   DandyKit.init() runs them all. Nothing here re-hides, adds controls, or autoplays with sound. */
(function (window, document) {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function one(sel, root) { return (root || document).querySelector(sel); }
  function lastSource(video) { var s = video.querySelectorAll('source'); return s.length ? s[s.length - 1] : null; }

  var Kit = { reduce: reduce, hasIO: hasIO };

  /* Reveal: [data-reveal] gains is-in once at 30 percent visible and is unobserved; under reduced motion or without IO everything is in place. */
  Kit.reveal = function (root) {
    var els = all('[data-reveal]', root);
    if (!els.length) return;
    if (!hasIO || reduce) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.3 });
    els.forEach(function (el) { io.observe(el); });
  };

  /* In view: [data-inview] gains is-in when on screen without the hidden start; drives scrawls and callouts inside copy that must stay readable. data-inview="0.4" sets the threshold. */
  Kit.inview = function (root) {
    var els = all('[data-inview]', root);
    if (!els.length) return;
    els.forEach(function (el) {
      if (!hasIO) { el.classList.add('is-in'); return; }
      var t = parseFloat(el.getAttribute('data-inview'));
      if (isNaN(t)) t = 0.3;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { el.classList.add('is-in'); io.unobserve(el); } });
      }, { threshold: t });
      io.observe(el);
    });
  };

  /* Loops: play at 30 percent visible, pause off screen, preload upgraded from none to auto on approach, error shows the poster, ended holds the last frame. */
  Kit.loops = function (root) {
    all('.loop', root).forEach(function (fig) {
      var v = one('video', fig);
      if (!v) return;
      function still() { fig.classList.add('is-still'); fig.classList.remove('is-playing'); v.pause(); v.removeAttribute('autoplay'); }
      /* a pause() that interrupts a pending play() rejects with AbortError; that is not a broken source, so only a real failure shows the poster */
      function failed(err) { if (err && err.name === 'AbortError') return; still(); }
      v.addEventListener('error', still);
      var src = lastSource(v); if (src) src.addEventListener('error', still);
      v.addEventListener('playing', function () { fig.classList.add('is-playing'); });
      v.addEventListener('ended', function () { fig.classList.add('is-held'); });
      if (reduce) { still(); return; }
      if (!hasIO) { v.play().catch(failed); return; }
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (fig.classList.contains('is-held')) return;
          if (e.isIntersecting && e.intersectionRatio > 0.3) {
            if (v.preload === 'none') v.preload = 'auto';
            v.play().catch(failed);
          } else if (e.intersectionRatio === 0) {
            v.pause();
          }
        });
      }, { threshold: [0, 0.3, 0.6] }).observe(v);
    });
  };

  /* Clips: one play button per phone; tap plays with sound, tap again pauses, poster returns at the end, one clip at a time, any clip leaving the viewport pauses.
     Captions are optional: a JSON script (#dandy-captions by default) keyed by data-slot, each cue [start, end, text], verbatim. */
  Kit.clips = function (root, opts) {
    opts = opts || {};
    var cues = opts.captions || {};
    if (!opts.captions) {
      try { cues = JSON.parse((document.getElementById(opts.captionsId || 'dandy-captions') || {}).textContent || '{}'); } catch (e) { cues = {}; }
    }
    var slots = all('.clip', root);
    function pauseOthers(keep) { slots.forEach(function (s) { var o = one('video', s); if (o && o !== keep && !o.paused) o.pause(); }); }
    slots.forEach(function (slot) {
      var v = one('video', slot), fb = one('.clip__fallback', slot), cap = one('.clip__cap', slot), play = one('.clip__play', slot), frame = one('.clip__frame', slot);
      if (!v || !play || !frame) return;
      var list = cues[slot.getAttribute('data-slot')] || [];
      function showFallback() {
        v.hidden = true; if (fb) fb.hidden = false;
        slot.classList.add('is-fallback'); slot.classList.remove('is-playing');
        if (cap) cap.hidden = true; play.hidden = true;
      }
      v.addEventListener('error', showFallback);
      var src = lastSource(v); if (src) src.addEventListener('error', showFallback);
      function start() {
        pauseOthers(v); v.muted = false; v.volume = 1;
        var p = v.play();
        if (p && p.catch) p.catch(function (err) { if (err && err.name === 'NotSupportedError') showFallback(); });
      }
      function toggle() { if (v.paused || v.ended) start(); else v.pause(); }
      frame.addEventListener('click', function (e) { e.preventDefault(); toggle(); });
      v.addEventListener('play', function () { slot.classList.add('is-playing'); play.setAttribute('aria-label', 'Pause video'); });
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
      if (hasIO) new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (!e.isIntersecting && !v.paused) v.pause(); });
      }, { threshold: 0 }).observe(v);
    });
  };

  /* Sticky bar: one rAF-throttled pass on scroll and resize. While any in-page button is on screen the top bar button fades; the bar shows only once the anchor CTA has scrolled off the top and no other button is visible. */
  Kit.sticky = function (opts) {
    opts = opts || {};
    var bar = one(opts.bar || '.sticky');
    var anchor = one(opts.anchor || '[data-sticky-anchor], .hero__cta');
    var ctas = all(opts.ctas || 'main .btn');
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight, seen = false;
      ctas.forEach(function (b) { var r = b.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh && r.width > 0) seen = true; });
      document.body.classList.toggle('cta-on-screen', seen);
      if (bar && anchor) {
        var gone = anchor.getBoundingClientRect().bottom < 0;
        var on = gone && !seen;
        bar.classList.toggle('is-on', on);
        bar.setAttribute('aria-hidden', on ? 'false' : 'true');
      }
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return update;
  };

  /* Hero: the giant cutout settles in over 1.4s, then drifts 22px up and from -8 to -3 degrees over the first 400px of scroll.
     The finished settle animation is cleared inline on animationend, otherwise its fill mode outranks the drift transform. */
  Kit.hero = function (root) {
    var giant = one('.hero__giant', root);
    if (!giant || reduce) return;
    var queued = false;
    function drift() {
      queued = false;
      var y = Math.min(window.scrollY, 400) / 400;
      giant.style.transform = 'translateY(' + (-22 * y) + 'px) rotate(' + (-8 + 5 * y) + 'deg)';
    }
    function arm() {
      giant.style.animation = 'none';
      window.addEventListener('scroll', function () { if (!queued) { queued = true; window.requestAnimationFrame(drift); } }, { passive: true });
      drift();
    }
    giant.addEventListener('animationend', arm, { once: true });
  };

  /* States: big words as tabs with a roving tabindex, the belt marker sliding to the selected word, the loop word swapping.
     Tabs may carry data-seek and data-end (seconds) to cue and hold the stage's loop; the loop's time drives the selection until someone picks.
     Without a video the stage cycles every 3.2s while on screen. */
  Kit.states = function (stage) {
    var stages = stage ? [stage] : all('.stage');
    stages.forEach(function (st) {
      var tabs = all('.state', st), belt = one('.belt', st), word = one('.loop__word', st), mv = one('.loop video', st);
      if (!tabs.length) return;
      var n = tabs.length, idx = 0, picked = false, timer = 0, raf = 0;
      var names = tabs.map(function (t) { return t.getAttribute('data-state') || ''; });
      var seeks = tabs.map(function (t) { return parseFloat(t.getAttribute('data-seek')); });
      var ends = tabs.map(function (t) { var e = parseFloat(t.getAttribute('data-end')); return isNaN(e) ? Infinity : e; });
      function select(i, doSeek) {
        idx = i;
        st.setAttribute('data-state', names[i]);
        tabs.forEach(function (t, k) { var on = k === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
        if (belt) belt.style.setProperty('--belt-x', ((i + 0.5) / n * 100).toFixed(2) + '%');
        if (word) all('b', word).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-for') === names[i]); });
        if (doSeek && mv && mv.duration && !isNaN(seeks[i])) {
          mv.currentTime = Math.min(seeks[i], mv.duration - 0.1);
          if (!reduce) mv.play().catch(function () {});
        }
      }
      function watchHold() {
        window.cancelAnimationFrame(raf);
        var end = Math.min(ends[idx], (mv.duration || Infinity) - 0.04);
        function tick() { if (!picked) return; if (mv.currentTime >= end) { mv.pause(); return; } raf = window.requestAnimationFrame(tick); }
        raf = window.requestAnimationFrame(tick);
      }
      function release() { picked = false; window.cancelAnimationFrame(raf); if (mv) { mv.loop = true; if (!reduce) mv.play().catch(function () {}); } }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { picked = true; window.clearInterval(timer); if (mv) mv.loop = false; select(i, true); if (mv) watchHold(); });
        t.addEventListener('keydown', function (e) {
          var next = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i + n - 1) % n;
          else if (e.key === 'Home') next = 0;
          else if (e.key === 'End') next = n - 1;
          if (next !== null) { e.preventDefault(); tabs[next].focus(); tabs[next].click(); }
        });
      });
      var initial = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
      select(initial < 0 ? 0 : initial, false);
      if (mv && seeks.some(function (s) { return !isNaN(s); })) {
        mv.addEventListener('timeupdate', function () {
          if (!mv.duration || picked) return;
          var t = mv.currentTime, s = 0;
          for (var k = 0; k < n; k++) { if (!isNaN(seeks[k]) && t >= seeks[k]) s = k; }
          if (s !== idx) select(s, false);
        });
        mv.addEventListener('ended', function () { if (!picked) { mv.loop = true; mv.play().catch(function () {}); } });
        if (hasIO) new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (!e.isIntersecting && picked) release(); });
        }, { threshold: 0 }).observe(st);
      } else if (!reduce && hasIO) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            window.clearInterval(timer);
            if (e.isIntersecting) timer = window.setInterval(function () { if (!picked) select((idx + 1) % n, false); }, 3200);
          });
        }, { threshold: 0.5 }).observe(st);
      }
    });
  };

  /* Reviews: three shown, one link reveals the rest, then the link goes away. */
  Kit.reviews = function (root) {
    all('.revs__more', root).forEach(function (more) {
      var id = more.getAttribute('aria-controls'), revs = id ? document.getElementById(id) : more.previousElementSibling;
      if (!revs) return;
      more.addEventListener('click', function () { revs.classList.add('is-open'); more.setAttribute('aria-expanded', 'true'); });
    });
  };

  /* Dev flag: ?dev or localhost shows the clip meta labels. */
  Kit.dev = function () {
    if (/[?&]dev\b/.test(window.location.search) || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') document.body.classList.add('dev');
  };

  Kit.init = function (opts) {
    opts = opts || {};
    Kit.dev();
    Kit.reveal(opts.root);
    Kit.inview(opts.root);
    Kit.loops(opts.root);
    Kit.clips(opts.root, opts.clips);
    Kit.states();
    Kit.reviews(opts.root);
    Kit.hero(opts.root);
    Kit.sticky(opts.sticky);
  };

  window.DandyKit = Kit;
  if (document.currentScript && document.currentScript.hasAttribute('data-init')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { Kit.init(); });
    else Kit.init();
  }
})(window, document);
