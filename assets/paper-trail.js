(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var html = document.documentElement;
  var angle = html.dataset.angle || 'store', variant = html.dataset.h || 'a';

  /* Agitation ground: only the active angle's still stays in the document, so the other two never download */
  document.querySelectorAll('.agit__ground img[data-angle]').forEach(function(im){ if (im.getAttribute('data-angle') !== angle) im.parentNode.removeChild(im); });

  /* Reveals: the strikes, the words on the frames, the plate rising through the tear, the close */
  var revs = document.querySelectorAll('[data-reveal]');
  if (hasIO && !reduce) { var rio = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } }); }, { threshold: .3 }); revs.forEach(function(el){ rio.observe(el); }); }
  else revs.forEach(function(el){ el.classList.add('is-in'); });

  /* Motion loops: muted, play only while on screen, still under reduced motion or on error */
  document.querySelectorAll('.loop').forEach(function(fig){
    var v = fig.querySelector('video'); if (!v) return;
    function still(){ fig.classList.add('is-still'); v.pause(); v.removeAttribute('autoplay'); }
    v.addEventListener('error', still);
    var src = v.querySelectorAll('source'); if (src.length) src[src.length-1].addEventListener('error', still);
    if (reduce) { still(); return; }
    if (hasIO) {
      new IntersectionObserver(function(es){ es.forEach(function(e){
        if (e.isIntersecting && e.intersectionRatio > 0.3) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(still); }
        else v.pause();
      }); }, { threshold: [0, .3, .6] }).observe(v);
    } else { v.play().catch(still); }
    v.addEventListener('playing', function(){ fig.classList.add('is-playing'); });
  });

  /* Hero: the pouch cutout, when present, drifts up over the first 400 px of scroll once its settle animation has ended */
  var drift = document.querySelector('.hero__drift');
  if (drift && !reduce) {
    var dt = false;
    function moveDrift(){ dt = false; var y = Math.min(window.scrollY, 400) / 400; drift.style.transform = 'translateY(' + (-20 * y) + 'px)'; }
    drift.addEventListener('animationend', function(){ drift.style.animation = 'none'; window.addEventListener('scroll', function(){ if (!dt) { dt = true; requestAnimationFrame(moveDrift); } }, { passive: true }); moveDrift(); }, { once: true });
  }

  /* One CTA at a time. The sticky bar arms once the three-questions headline ([data-arm-sticky]) has crossed the top of the viewport (a rAF-throttled scroll listener on getBoundingClientRect, never an observer on a below-fold element), hides whenever any in-page pill is on screen, and stays quiet inside the FAQ. The top-bar button steps aside the same way. */
  var sticky = document.querySelector('.sticky'), standard = document.querySelector('[data-arm-sticky]') || document.getElementById('standard'), faq = document.getElementById('faq');
  var pageCtas = document.querySelectorAll('main .btn');
  var ticking = false;
  function ctaUpdate(){
    ticking = false;
    var vh = window.innerHeight, seen = false;
    pageCtas.forEach(function(b){ var r = b.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) seen = true; });
    document.body.classList.toggle('cta-on-screen', seen);
    if (!sticky) return;
    var armed = standard ? standard.getBoundingClientRect().top < 0 : window.scrollY > vh;
    var quiet = false;
    if (faq) { var f = faq.getBoundingClientRect(); quiet = f.top < vh * .5 && f.bottom > vh * .5; }
    var on = armed && !seen && !quiet && !document.body.classList.contains('picker-open');
    sticky.classList.toggle('is-on', on); sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
  }
  function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(ctaUpdate); } }
  window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); ctaUpdate();

  /* Review wall: when the cards stack into more than one row, the wall is clipped to the first row plus half of the next (rAF-measured, no observer) and the See more button opens it with a max-height transition. One row, or no script, shows everything and no button. */
  var wall = document.querySelector('[data-wall]'), more = document.querySelector('[data-wall-more]');
  if (wall && more) {
    var cards = wall.querySelectorAll('.rev'), wallOpen = false, wallTick = false;
    function collapsedHeight(){
      if (cards.length < 2) return 0;
      var top0 = cards[0].offsetTop, second = null;
      for (var i = 1; i < cards.length; i++) { if (cards[i].offsetTop > top0 + 4) { second = cards[i]; break; } }
      if (!second) return 0;
      return Math.round(second.offsetTop + second.offsetHeight * .5);
    }
    function layoutWall(){
      wallTick = false;
      if (wallOpen) return;
      var h = collapsedHeight();
      if (h) { wall.style.maxHeight = h + 'px'; wall.classList.add('is-collapsed'); more.hidden = false; }
      else { wall.style.maxHeight = ''; wall.classList.remove('is-collapsed'); more.hidden = true; }
    }
    function queueWall(){ if (!wallTick) { wallTick = true; requestAnimationFrame(layoutWall); } }
    more.addEventListener('click', function(){
      wallOpen = true;
      more.setAttribute('aria-expanded', 'true');
      wall.classList.add('is-opening');
      wall.style.maxHeight = wall.scrollHeight + 'px';
      var done = function(){ wall.classList.remove('is-collapsed', 'is-opening'); wall.style.maxHeight = ''; more.hidden = true; ctaUpdate(); };
      if (reduce) done(); else { var fired = false; var fin = function(e){ if (e && (e.target !== wall || e.propertyName !== 'max-height')) return; if (fired) return; fired = true; wall.removeEventListener('transitionend', fin); done(); }; wall.addEventListener('transitionend', fin); setTimeout(fin, 650); }
    });
    layoutWall();
    window.addEventListener('resize', queueWall);
    window.addEventListener('load', queueWall);
    wall.querySelectorAll('img').forEach(function(im){ if (!im.complete) im.addEventListener('load', queueWall); });
  }

  /* Picker: the bottom sheet with three format rows. Focus is trapped while open, Escape and the backdrop close it, focus returns to the opener. */
  var picker = document.getElementById('picker');
  if (picker) {
    var sheet = picker.querySelector('.picker__sheet'), opener = null;
    function focusables(){ return sheet.querySelectorAll('a[href], button:not([disabled])'); }
    function openPicker(btn){
      opener = btn || document.activeElement; picker.hidden = false;
      requestAnimationFrame(function(){ picker.classList.add('is-open'); });
      document.body.classList.add('picker-open'); ctaUpdate();
      var f = focusables(); if (f.length) f[0].focus(); else sheet.focus();
      document.addEventListener('keydown', onKey);
    }
    function closePicker(){
      picker.classList.remove('is-open'); document.body.classList.remove('picker-open');
      document.removeEventListener('keydown', onKey);
      var done = function(){ picker.hidden = true; ctaUpdate(); };
      if (reduce) done(); else setTimeout(done, 320);
      if (opener && opener.focus) opener.focus();
    }
    function onKey(e){
      if (e.key === 'Escape') { e.preventDefault(); closePicker(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.querySelectorAll('[data-picker-open]').forEach(function(b){ b.addEventListener('click', function(){ openPicker(b); }); });
    picker.querySelectorAll('[data-picker-close]').forEach(function(b){ b.addEventListener('click', closePicker); });
  }

  /* Measurement: format clicks and the diagnostic taps are pushed to the data layer with the format, the section, the ad angle and the h1 variant */
  function push(ev, extra){
    var d = { event: ev, angle: angle, variant: variant };
    for (var k in extra) d[k] = extra[k];
    (window.dataLayer = window.dataLayer || []).push(d);
  }
  function sectionOf(el){ var s = el.closest('section, .sticky, .picker'); return s ? (s.id || s.className.split(' ')[0]) : ''; }
  document.querySelectorAll('a[href*="/products/"]').forEach(function(a){
    a.addEventListener('click', function(){
      var h = a.getAttribute('href') || '', f = /gumm/i.test(h) ? 'gummies' : (/capsule/i.test(h) ? 'capsules' : (/powder/i.test(h) ? 'powder' : 'other'));
      push('lp_trust_format_click', { format: f, section: sectionOf(a) });
    });
  });
  document.querySelectorAll('.hero__cta a.btn, .cue, .quest__foot .btn, .make__foot .btn, .proof .btn[data-picker-open]').forEach(function(a){ a.addEventListener('click', function(){ push('lp_trust_scroll_cta', { target: a.getAttribute('href'), section: sectionOf(a) }); }); });
  if (more) more.addEventListener('click', function(){ push('lp_trust_reviews_expand', {}); });
  document.querySelectorAll('[data-picker-open]').forEach(function(b){ b.addEventListener('click', function(){ push('lp_trust_sticky_open', { section: sectionOf(b) }); }); });
  var coa = document.querySelector('.test__foot .btn'); if (coa) coa.addEventListener('click', function(){ push('lp_trust_coa_click', {}); });
  document.querySelectorAll('.faq details').forEach(function(d, i){ d.addEventListener('toggle', function(){ if (d.open) push('lp_trust_faq_open', { question: i + 1 }); }); });
  if (hasIO) {
    var marks = [['standard', standard], ['comparison', document.querySelector('.compare')]];
    marks.forEach(function(m){ if (!m[1]) return; var o = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { push('lp_trust_reach', { point: m[0] }); o.disconnect(); } }); }, { threshold: 0 }); o.observe(m[1]); });
  }
})();
