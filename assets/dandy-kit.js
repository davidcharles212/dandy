/* Dandy premium page kit: motion and media controllers extracted from cshop.js.
   Every initialiser is a named method on window.DandyKit and takes an optional root, so a page calls only what it uses.
   Each one is idempotent: an element it has bound carries data-kit-<name> and is skipped next time, so DandyKit.init can run
   again (a second script tag, the theme editor's section reload) without double-binding a single handler.
   Nothing here re-hides, adds controls, or autoplays with sound. */
(function (window, document) {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var isDev = /[?&]dev\b/.test(window.location.search) || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function one(sel, root) { return (root || document).querySelector(sel); }
  function lastSource(video) { var s = video.querySelectorAll('source'); return s.length ? s[s.length - 1] : null; }
  /* claim: true the first time an initialiser sees an element, false after. The data-kit-<name> mark is what makes init idempotent. */
  function claim(el, name) { var k = 'kit' + name; if (el.dataset[k]) return false; el.dataset[k] = '1'; return true; }
  var warned = {};
  function warn(msg) { if (isDev && window.console && !warned[msg]) { warned[msg] = true; console.warn('DandyKit: ' + msg); } }

  /* Kit-wide options, set with DandyKit.configure({...}) before init: captions (object keyed by clip slot), captionsId (script id, default dandy-captions), sticky ({ bar, anchor, ctas }). */
  var config = { captions: null, captionsId: 'dandy-captions', sticky: null };
  var Kit = { reduce: reduce, hasIO: hasIO };
  Kit.configure = function (opts) { Object.keys(opts || {}).forEach(function (k) { config[k] = opts[k]; }); return Kit; };

  /* Reveal: [data-reveal] (hidden start, rises into place) and [data-inview] (no hidden start; drives scrawls and callouts inside copy that must stay
     readable) both gain is-in once at the threshold in the attribute (default 0.3) and are unobserved; one observer per threshold.
     Under reduced motion or without IO everything is in place at once. */
  var revealObservers = {};
  function revealObserver(t) {
    if (!revealObservers[t]) revealObservers[t] = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); revealObservers[t].unobserve(e.target); } });
    }, { threshold: t });
    return revealObservers[t];
  }
  Kit.reveal = function (root) {
    all('[data-reveal],[data-inview]', root).forEach(function (el) {
      if (!claim(el, 'Reveal')) return;
      if (!hasIO || reduce) { el.classList.add('is-in'); return; }
      var t = parseFloat(el.getAttribute('data-inview') || el.getAttribute('data-reveal'));
      if (isNaN(t) || t < 0 || t > 1) t = 0.3;
      revealObserver(t).observe(el);
    });
  };

  /* Loops: the loop controller owns play and pause. A loop plays while 30 percent of it is on screen and pauses whenever less is (cshop's rule),
     preload steps from none to auto on approach, an error shows the poster, ended holds the last frame (is-held). A held loop stays paused until
     something seeks it; a seek clears the hold. fig.dandyLoop exposes seek, holdAt, release, play and pause for the states controller, which
     never touches play or pause itself. The hold watch is a rAF loop that runs only while the video is playing towards a finite hold point. */
  Kit.loops = function (root) {
    all('.loop', root).forEach(function (fig) {
      if (!claim(fig, 'Loop')) return;
      var v = one('video', fig);
      if (!v) return;
      var inView = !hasIO, holdEnd = null, raf = 0;
      function held() { return fig.classList.contains('is-held'); }
      function still() { fig.classList.add('is-still'); fig.classList.remove('is-playing'); v.pause(); v.removeAttribute('autoplay'); }
      /* a pause() that interrupts a pending play() rejects with AbortError; that is not a broken source, so only a real failure shows the poster */
      function failed(err) { if (err && err.name === 'AbortError') return; still(); }
      function play() {
        if (reduce || !inView || held() || fig.classList.contains('is-still')) return;
        if (v.preload === 'none') v.preload = 'auto';
        var p = v.play(); if (p && p.catch) p.catch(failed);
      }
      function pause() { if (!v.paused) v.pause(); }
      function stopWatch() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } }
      function watch() {
        stopWatch();
        if (holdEnd === null || v.paused || !isFinite(v.duration)) return;
        var end = Math.min(holdEnd, v.duration - 0.04);
        (function tick() {
          if (holdEnd === null || v.paused) { raf = 0; return; }
          if (v.currentTime >= end) { raf = 0; fig.classList.add('is-held'); v.pause(); return; }
          raf = window.requestAnimationFrame(tick);
        })();
      }
      v.addEventListener('error', still);
      var src = lastSource(v); if (src) src.addEventListener('error', still);
      v.addEventListener('playing', function () { fig.classList.add('is-playing'); watch(); });
      v.addEventListener('pause', stopWatch);
      v.addEventListener('ended', function () { stopWatch(); fig.classList.add('is-held'); });
      v.addEventListener('seeking', function () { fig.classList.remove('is-held'); });
      fig.dandyLoop = {
        video: v,
        inView: function () { return inView; },
        play: play,
        pause: pause,
        seek: function (t) { fig.classList.remove('is-held'); v.currentTime = t; },
        holdAt: function (end) { holdEnd = (typeof end === 'number' && isFinite(end)) ? end : Infinity; watch(); },
        release: function () { holdEnd = null; stopWatch(); fig.classList.remove('is-held'); }
      };
      if (reduce) { still(); return; }
      if (!hasIO) { play(); return; }
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          inView = e.isIntersecting && e.intersectionRatio > 0.3;
          if (inView) play(); else pause();
        });
      }, { threshold: [0, 0.3, 0.6] }).observe(v);
    });
  };

  /* Clips: one play button per phone; tap plays with sound, tap again pauses, poster returns at the end, one clip at a time on the whole page,
     any clip leaving the viewport pauses. Captions are optional and verbatim: a JSON script keyed by data-slot, each cue [start, end, text].
     The script is #dandy-captions, or the id named by data-captions on the clip or any ancestor; DandyKit.configure({ captions }) passes an object instead. */
  var cueCache = {};
  function cuesFor(slot, opts) {
    if (opts.captions) return opts.captions;
    if (config.captions) return config.captions;
    var holder = slot.closest ? slot.closest('[data-captions]') : null;
    var id = opts.captionsId || (holder && holder.getAttribute('data-captions')) || config.captionsId;
    if (!cueCache[id]) {
      var el = document.getElementById(id);
      try { cueCache[id] = (el && JSON.parse(el.textContent || '{}')) || {}; } catch (e) { cueCache[id] = {}; warn('captions #' + id + ' is not valid JSON'); }
    }
    return cueCache[id];
  }
  function pauseOtherClips(keep) { all('.clip video').forEach(function (o) { if (o !== keep && !o.paused) o.pause(); }); }
  Kit.clips = function (root, opts) {
    opts = opts || {};
    all('.clip', root).forEach(function (slot) {
      if (!claim(slot, 'Clip')) return;
      var v = one('video', slot), fb = one('.clip__fallback', slot), cap = one('.clip__cap', slot), play = one('.clip__play', slot), frame = one('.clip__frame', slot);
      if (!v || !play || !frame) return;
      var list = cuesFor(slot, opts)[slot.getAttribute('data-slot')] || [];
      function showFallback() {
        v.hidden = true; if (fb) fb.hidden = false;
        slot.classList.add('is-fallback'); slot.classList.remove('is-playing');
        if (cap) cap.hidden = true; play.hidden = true;
      }
      v.addEventListener('error', showFallback);
      var src = lastSource(v); if (src) src.addEventListener('error', showFallback);
      function start() {
        pauseOtherClips(v); v.muted = false; v.volume = 1;
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

  /* Sticky bar: one CTA on screen at a time. One IntersectionObserver over the anchor and every in-page button keeps the set of visible buttons;
     while any is on screen the top bar button fades, and the bar shows only once the anchor has scrolled off the top and no button is visible.
     Anchor: [data-sticky-anchor], else .hero__cta, else the first in-page button. Off screen the bar is aria-hidden and inert.
     update() measures synchronously (used at init, on resize and by tests). Calling Kit.sticky again re-queries the buttons and drops the old observer. */
  var stickyCtl = null;
  Kit.sticky = function (opts) {
    opts = opts || config.sticky || {};
    if (stickyCtl) stickyCtl.destroy();
    var bar = one(opts.bar || '.sticky');
    var ctas = all(opts.ctas || 'main .btn');
    var named = one(opts.anchor || '[data-sticky-anchor], .hero__cta');
    var anchor = named || ctas[0] || null;
    if (bar && !named) warn('sticky: no [data-sticky-anchor] or .hero__cta on the page; using the first in-page .btn as the anchor');
    var visible = [], gone = false, io = null, ticking = false;
    function see(b, on) { var i = visible.indexOf(b); if (on && i < 0) visible.push(b); if (!on && i >= 0) visible.splice(i, 1); }
    function apply() {
      var seen = visible.length > 0;
      document.body.classList.toggle('cta-on-screen', seen);
      if (!bar) return;
      var on = gone && !seen;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', on ? 'false' : 'true');
      bar.inert = !on;
    }
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      ctas.forEach(function (b) { var r = b.getBoundingClientRect(); see(b, r.bottom > 0 && r.top < vh && r.width > 0); });
      gone = !!anchor && anchor.getBoundingClientRect().bottom < 0;
      apply();
    }
    function queue() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
    if (hasIO) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.target === anchor) gone = !e.isIntersecting && e.boundingClientRect.bottom < 0;
          if (ctas.indexOf(e.target) >= 0) see(e.target, e.isIntersecting && e.boundingClientRect.width > 0);
        });
        apply();
      }, { threshold: 0 });
      ctas.forEach(function (b) { io.observe(b); });
      if (anchor && ctas.indexOf(anchor) < 0) io.observe(anchor);
    } else {
      window.addEventListener('scroll', queue, { passive: true });
    }
    window.addEventListener('resize', queue);
    update();
    stickyCtl = { update: update, destroy: function () { if (io) io.disconnect(); window.removeEventListener('scroll', queue); window.removeEventListener('resize', queue); } };
    return update;
  };

  /* Hero: the giant cutout settles in over 1.4s, then drifts 22px up and from -8 to -3 degrees over the first 400px of scroll.
     The finished settle animation is cleared inline, otherwise its fill mode outranks the drift transform. If the settle has already
     finished (or never ran) by the time this runs, the drift is armed at once; otherwise on animationend. */
  Kit.hero = function (root) {
    var giant = one('.hero__giant', root);
    if (!giant || reduce || !claim(giant, 'Hero')) return;
    var queued = false, armed = false;
    function drift() {
      queued = false;
      var y = Math.min(window.scrollY, 400) / 400;
      giant.style.transform = 'translateY(' + (-22 * y) + 'px) rotate(' + (-8 + 5 * y) + 'deg)';
    }
    function arm() {
      if (armed) return; armed = true;
      giant.style.animation = 'none';
      window.addEventListener('scroll', function () { if (!queued) { queued = true; window.requestAnimationFrame(drift); } }, { passive: true });
      drift();
    }
    var settling = giant.getAnimations ? giant.getAnimations().some(function (a) { return a.playState === 'running' || a.playState === 'pending'; }) : null;
    if (settling === false) { arm(); return; }
    giant.addEventListener('animationend', arm, { once: true });
    if (settling === null) window.setTimeout(arm, 1600); /* no getAnimations: arm after the settle's length at the latest */
  };

  /* States: big words as tabs with a roving tabindex, the belt marker sliding to the selected word, the loop word swapping.
     Loop-driven stage: every tab carries data-seek (seconds) and the loop's time drives the selection, switching to a tab at its data-bound,
     or by default at the midpoint between its seek and the previous one. A tap cues the loop to that tab's seek, lets it play to data-end
     (or the end) and holds the frame; the choice stays until the stage leaves the screen, and release never plays an off-screen loop.
     The loop controller owns play and pause; this controller only seeks and asks for a hold. Without a video the stage cycles every 3.2s
     while on screen; under reduced motion it is static and the tabs still select. */
  Kit.states = function (root) {
    var stages = root && root.matches && root.matches('.stage') ? [root] : all('.stage', root);
    stages.forEach(function (st) {
      if (!claim(st, 'States')) return;
      var tabs = all('.state', st), belt = one('.belt', st), word = one('.loop__word', st), fig = one('.loop', st);
      if (!tabs.length) return;
      if (fig && !fig.dandyLoop) Kit.loops(st);
      var ctl = fig && fig.dandyLoop, mv = ctl && ctl.video;
      var n = tabs.length, idx = 0, picked = false, timer = 0;
      var names = tabs.map(function (t) { return t.getAttribute('data-state') || ''; });
      var seeks = tabs.map(function (t) { return parseFloat(t.getAttribute('data-seek')); });
      var ends = tabs.map(function (t) { var e = parseFloat(t.getAttribute('data-end')); return isNaN(e) ? Infinity : e; });
      var seekable = seeks.every(function (s) { return !isNaN(s); });
      var bounds = tabs.map(function (t, k) { if (!k) return -Infinity; var b = parseFloat(t.getAttribute('data-bound')); return isNaN(b) ? (seeks[k - 1] + seeks[k]) / 2 : b; });
      function select(i) {
        idx = i;
        st.setAttribute('data-state', names[i]);
        tabs.forEach(function (t, k) { var on = k === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
        if (belt) belt.style.setProperty('--belt-x', ((i + 0.5) / n * 100).toFixed(2) + '%');
        if (word) all('b', word).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-for') === names[i]); });
      }
      function cue(i) {
        if (!mv || reduce || isNaN(seeks[i])) return;
        mv.loop = false;
        var t = seeks[i]; if (isFinite(mv.duration)) t = Math.min(t, mv.duration - 0.1);
        ctl.seek(t); ctl.holdAt(ends[i]); ctl.play();
      }
      function release() { picked = false; if (ctl) { ctl.release(); mv.loop = true; } }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { picked = true; window.clearInterval(timer); select(i); cue(i); });
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
      select(initial < 0 ? 0 : initial);
      if (mv && !reduce) {
        if (!seekable) { warn('stage: every .state needs data-seek (seconds) for the loop to drive the selection'); return; }
        mv.addEventListener('timeupdate', function () {
          if (picked || !isFinite(mv.duration)) return;
          var t = mv.currentTime, s = 0;
          for (var k = 1; k < n; k++) { if (t >= bounds[k]) s = k; }
          if (s !== idx) select(s);
        });
        mv.addEventListener('ended', function () { if (!picked) { mv.loop = true; ctl.play(); } });
        if (hasIO) new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (!e.isIntersecting && picked) release(); });
        }, { threshold: 0 }).observe(st);
      } else if (!mv && !reduce && hasIO) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            window.clearInterval(timer);
            if (e.isIntersecting) timer = window.setInterval(function () { if (!picked) select((idx + 1) % n); }, 3200);
          });
        }, { threshold: 0.5 }).observe(st);
      }
    });
  };

  /* Reviews: three shown, one link reveals the rest, then the link goes away. */
  Kit.reviews = function (root) {
    all('.revs__more', root).forEach(function (more) {
      if (!claim(more, 'Reviews')) return;
      var id = more.getAttribute('aria-controls'), revs = id ? document.getElementById(id) : more.previousElementSibling;
      if (!revs) return;
      more.addEventListener('click', function () { revs.classList.add('is-open'); more.setAttribute('aria-expanded', 'true'); });
    });
  };

  /* Dev flag: ?dev or localhost shows the clip meta labels and the kit's warnings. */
  Kit.dev = function () { if (isDev) document.body.classList.add('dev'); };

  /* init(root) or init({ root, clips: { captions, captionsId }, sticky: { bar, anchor, ctas } }); safe to call any number of times. */
  Kit.init = function (opts) {
    if (opts && opts.nodeType) opts = { root: opts };
    opts = opts || {};
    var root = opts.root && opts.root.nodeType ? opts.root : document;
    Kit.dev();
    Kit.reveal(root);
    Kit.loops(root);
    Kit.clips(root, opts.clips);
    Kit.states(root);
    Kit.reviews(root);
    Kit.hero(root);
    Kit.sticky(opts.sticky);
  };

  var script = document.currentScript, autoInit = !!(script && script.hasAttribute('data-init'));
  if (window.DandyKit && window.DandyKit.init) { if (autoInit) window.DandyKit.init(); return; } /* the script is on the page twice: one kit, one init */
  window.DandyKit = Kit;
  /* Theme editor: a re-rendered or moved section arrives inert, so bind its new nodes and re-query the sticky bar's buttons */
  ['shopify:section:load', 'shopify:section:reorder'].forEach(function (name) {
    document.addEventListener(name, function (e) { Kit.init({ root: e.target && e.target.nodeType === 1 ? e.target : document }); });
  });
  if (autoInit) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { Kit.init(); });
    else Kit.init();
  }
})(window, document);
