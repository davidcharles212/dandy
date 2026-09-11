/* Dandy switch-to-gummies recut: page controllers on top of DandyKit (which self-initialises from its data-init script).
   1. Close dims toward the button and runs one slow zoom while in view.
   2. Sticky bar sparkle burst on tap.
   3. Reviews: two and a half cards on phones, See more opens the rest.
   4. FAQ: the tested and 7-OH answers open by default on desktop. */
(function (window, document) {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Close: zoom while in view, dim as the button approaches the centre */
  (function () {
    var close = document.querySelector('[data-dim]');
    if (!close || reduce) return;
    var btn = close.querySelector('.btn');
    var queued = false;
    function update() {
      queued = false;
      var r = close.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      close.classList.add('is-zoom');
      if (btn) {
        var b = btn.getBoundingClientRect();
        /* dim ramps from 0 when the button enters at the bottom to .1 when it sits at 65% of the viewport */
        var p = (vh - b.top) / (vh * 0.35);
        var dim = Math.max(0, Math.min(1, p)) * 0.1;
        close.style.setProperty('--dim', dim.toFixed(3));
      }
    }
    var onScroll = function () { if (!queued) { queued = true; window.requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    var scroller = close.closest('.page-wrapper');
    if (scroller) scroller.addEventListener('scroll', onScroll, { passive: true });
    update();
  })();

  /* 2. Sparkle burst on the sticky button */
  (function () {
    var btn = document.querySelector('[data-burst]');
    if (!btn || reduce) return;
    btn.addEventListener('click', function (e) {
      var wrap = document.createElement('div');
      wrap.className = 'burst';
      var x = e.clientX || (btn.getBoundingClientRect().left + btn.offsetWidth / 2);
      var y = e.clientY || (btn.getBoundingClientRect().top + btn.offsetHeight / 2);
      wrap.style.left = (x - 4) + 'px'; wrap.style.top = (y - 4) + 'px';
      for (var i = 0; i < 6; i++) { var s = document.createElement('i'); s.style.setProperty('--a', (i * 60) + 'deg'); wrap.appendChild(s); }
      document.body.appendChild(wrap);
      window.setTimeout(function () { wrap.remove(); }, 700);
    });
  })();
  /* 3. Reviews clip */
  (function () {
    var clip = document.getElementById('revs-clip');
    var btn = document.querySelector('[data-revs-toggle]');
    var all = document.querySelector('.proof__more--all');
    if (!clip || !btn) return;
    var mq = window.matchMedia('(max-width: 860px)');
    function measure() {
      if (!mq.matches || clip.classList.contains('is-open')) { clip.classList.remove('is-clipped'); return; }
      var cards = clip.querySelectorAll('.rev');
      if (cards.length < 3) return;
      var top = clip.getBoundingClientRect().top;
      var c3 = cards[2].getBoundingClientRect();
      clip.style.setProperty('--clip', Math.round(c3.top - top + c3.height * 0.45) + 'px');
      clip.classList.add('is-clipped');
    }
    btn.addEventListener('click', function () {
      clip.classList.add('is-open');
      clip.classList.remove('is-clipped');
      btn.setAttribute('aria-expanded', 'true');
      btn.hidden = true;
      if (all) all.hidden = false;
    });
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
  })();
  /* 4. FAQ defaults on desktop */
  (function () {
    if (!window.matchMedia('(min-width: 861px)').matches) return;
    var items = document.querySelectorAll('[data-open-desktop]');
    for (var i = 0; i < items.length; i++) items[i].open = true;
  })();
})(window, document);
