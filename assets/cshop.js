(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]dev\b/.test(location.search) || location.hostname === 'localhost' || location.hostname === '127.0.0.1') document.body.classList.add('dev');
  var hasIO = 'IntersectionObserver' in window;

  /* Captions: verbatim cues from the clips' spoken words, keyed by slot id */
  var cues = {};
  try { cues = JSON.parse((document.getElementById('cshop-captions') || {}).textContent || '{}'); } catch (e) { cues = {}; }

  /* Customer clips: poster with one play button; tap plays with sound, tap again pauses; the poster comes back when the clip ends */
  var slots = document.querySelectorAll('.ugc');
  function pauseOthers(keep){ slots.forEach(function(s){ var o = s.querySelector('video'); if (o && o !== keep && !o.paused) o.pause(); }); }
  slots.forEach(function(slot){
    var v = slot.querySelector('video'), fb = slot.querySelector('.ugc__fallback'), cap = slot.querySelector('.ugc__cap'), play = slot.querySelector('.ugc__play');
    if (!v || !play) return;
    var list = cues[slot.dataset.slot] || [];
    function showFallback(){ v.hidden = true; if (fb) fb.hidden = false; slot.classList.add('is-fallback'); slot.classList.remove('is-playing'); if (cap) cap.hidden = true; play.hidden = true; }
    v.addEventListener('error', showFallback);
    var src = v.querySelectorAll('source'); if (src.length) src[src.length-1].addEventListener('error', showFallback);
    function start(){ pauseOthers(v); v.muted = false; v.volume = 1; var p = v.play(); if (p && p.catch) p.catch(function(err){ if (err && err.name === 'NotSupportedError') showFallback(); }); }
    function toggle(){ if (v.paused || v.ended) start(); else v.pause(); }
    slot.querySelector('.ugc__frame').addEventListener('click', function(e){ e.preventDefault(); toggle(); });
    v.addEventListener('play', function(){ slot.classList.add('is-playing'); play.setAttribute('aria-label', 'Pause video'); });
    v.addEventListener('playing', function(){ slot.classList.add('is-playing'); });
    v.addEventListener('pause', function(){ slot.classList.remove('is-playing'); play.setAttribute('aria-label', 'Play video'); });
    v.addEventListener('ended', function(){ slot.classList.remove('is-playing'); v.currentTime = 0; if (cap) { cap.textContent = ''; cap.classList.remove('is-on'); } });
    if (cap && list.length) {
      var last = null;
      v.addEventListener('timeupdate', function(){
        var t = v.currentTime, hit = null;
        for (var i = 0; i < list.length; i++) { if (t >= list[i][0] && t < list[i][1]) { hit = list[i]; break; } }
        if (hit !== last) { last = hit; cap.textContent = hit ? hit[2] : ''; cap.classList.toggle('is-on', !!hit); }
      });
    }
    if (hasIO) new IntersectionObserver(function(es){ es.forEach(function(e){ if (!e.isIntersecting && !v.paused) v.pause(); }); }, { threshold: 0 }).observe(v);
  });

  /* Motion loops: quiet, muted, play only while on screen; poster under reduced motion or on error */
  var loops = document.querySelectorAll('.loop');
  loops.forEach(function(fig){
    var v = fig.querySelector('video'); if (!v) return;
    function still(){ fig.classList.add('is-still'); v.pause(); v.removeAttribute('autoplay'); }
    v.addEventListener('error', still);
    var src = v.querySelectorAll('source'); if (src.length) src[src.length-1].addEventListener('error', still);
    if (reduce) { still(); return; }
    if (hasIO) {
      new IntersectionObserver(function(es){ es.forEach(function(e){
        if (e.isIntersecting && e.intersectionRatio > 0.3) { if (fig.classList.contains('is-held')) return; if (v.preload === 'none') v.preload = 'auto'; v.play().catch(still); }
        else if (!fig.classList.contains('is-held')) v.pause();
      }); }, { threshold: [0, .3, .6] }).observe(v);
    } else { v.play().catch(still); }
    v.addEventListener('playing', function(){ fig.classList.add('is-playing'); });
    v.addEventListener('ended', function(){ fig.classList.add('is-held'); });
  });

  /* Mechanism: three tabs. A tap selects a state, cues the loop to that part of the day, plays that plate through and holds on its last frame. The choice stays until the section leaves the screen. Nobody picked: the loop drives the label. */
  var stage = document.querySelector('.mech__stage');
  if (stage) {
    var states = stage.querySelectorAll('.state'), mv = stage.querySelector('.mech__loop video');
    var names = ['lift','focus','settle'], seek = [0.3, 3.0, 5.4], ends = [2.35, 4.75, 99], bounds = [2.5, 4.9], idx = 0, timer, userPicked = false, raf = 0;
    function setState(s, doSeek){
      stage.dataset.state = s; idx = names.indexOf(s);
      states.forEach(function(b){ var on = b.dataset.state === s; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
      if (doSeek && mv && mv.duration) { mv.currentTime = Math.min(seek[idx], mv.duration - 0.1); if (!reduce) mv.play().catch(function(){}); }
    }
    function watchHold(){
      cancelAnimationFrame(raf);
      var end = Math.min(ends[idx], (mv.duration || 99) - 0.04);
      function tick(){ if (!userPicked) return; if (mv.currentTime >= end) { mv.pause(); return; } raf = requestAnimationFrame(tick); }
      raf = requestAnimationFrame(tick);
    }
    function release(){ userPicked = false; cancelAnimationFrame(raf); if (mv) { mv.loop = true; if (!reduce) mv.play().catch(function(){}); } }
    states.forEach(function(b){
      b.addEventListener('click', function(){ userPicked = true; clearInterval(timer); if (mv) mv.loop = false; setState(b.dataset.state, true); if (mv) watchHold(); });
      b.addEventListener('keydown', function(e){
        var i = Array.prototype.indexOf.call(states, b), n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % 3; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i + 2) % 3;
        if (n !== null) { e.preventDefault(); states[n].focus(); states[n].click(); }
      });
    });
    if (mv) {
      mv.addEventListener('timeupdate', function(){
        if (!mv.duration || userPicked) return;
        var t = mv.currentTime, s = t < bounds[0] ? 'lift' : (t < bounds[1] ? 'focus' : 'settle');
        if (s !== stage.dataset.state) setState(s, false);
      });
      mv.addEventListener('ended', function(){ if (!userPicked) { mv.loop = true; mv.play().catch(function(){}); } });
      if (hasIO) new IntersectionObserver(function(es){ es.forEach(function(e){ if (!e.isIntersecting && userPicked) release(); }); }, { threshold: 0 }).observe(stage);
    }
    if (!mv || reduce) {
      if (!reduce && hasIO) new IntersectionObserver(function(es){ es.forEach(function(e){
        if (e.isIntersecting) { clearInterval(timer); timer = setInterval(function(){ if (!userPicked) setState(names[(idx + 1) % 3], false); }, 3200); } else clearInterval(timer);
      }); }, { threshold: .5 }).observe(stage);
    }
  }

  /* The drawn underline on the offer price line starts once the offer copy is on screen */
  var oc = document.querySelector('.offer__copy');
  if (oc && hasIO) new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) oc.classList.add('is-inview'); }); }, { threshold: .3 }).observe(oc);
  else if (oc) oc.classList.add('is-inview');

  /* Reveals: words on the tasting board, the strikes on the filmstrip, the gummy rising under the tear, the scrawl in the close */
  var revs = document.querySelectorAll('[data-reveal]');
  if (hasIO && !reduce) { var rio = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } }); }, { threshold: .3 }); revs.forEach(function(el){ rio.observe(el); }); }
  else revs.forEach(function(el){ el.classList.add('is-in'); });

  /* Hero: the giant gummy drifts up and straightens over the first 400 px of scroll */
  var giant = document.querySelector('.hero__giant');
  if (giant && !reduce) {
    var gt = false;
    function drift(){ gt = false; var y = Math.min(window.scrollY, 400) / 400; giant.style.transform = 'translateY(' + (-22 * y) + 'px) rotate(' + (-8 + 5 * y) + 'deg)'; }
    /* The finished settle animation (fill-mode both) would outrank the inline transform, so switch it off once it has ended; its end state equals the base state, so nothing jumps */
    giant.addEventListener('animationend', function(){ giant.style.animation = 'none'; window.addEventListener('scroll', function(){ if (!gt) { gt = true; requestAnimationFrame(drift); } }, { passive: true }); drift(); }, { once: true });
  }

  /* Transparency callouts appear once the pouch is on screen */
  var tp = document.querySelector('.trust__pouch');
  if (tp && hasIO) new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) tp.classList.add('is-inview'); }); }, { threshold: .4 }).observe(tp);
  else if (tp) tp.classList.add('is-inview');

  /* One CTA at a time: while any in-page button is on screen, the top bar button and the sticky bar step aside */
  var sticky = document.querySelector('.sticky'), heroCta = document.querySelector('.hero__cta'), pageCtas = document.querySelectorAll('main a.btn');
  var ticking = false;
  function ctaUpdate(){
    ticking = false;
    var vh = window.innerHeight, seen = false;
    pageCtas.forEach(function(b){ var r = b.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) seen = true; });
    document.body.classList.toggle('cta-on-screen', seen);
    if (sticky && heroCta) {
      var heroGone = heroCta.getBoundingClientRect().bottom < 0;
      var on = heroGone && !seen;
      sticky.classList.toggle('is-on', on); sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
    }
  }
  function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(ctaUpdate); } }
  window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); ctaUpdate();

  /* Reviews: three shown, the link reveals the rest */
  var revs = document.getElementById('revs'), more = document.querySelector('.revs__more');
  if (revs && more) more.addEventListener('click', function(){ revs.classList.add('is-open'); more.setAttribute('aria-expanded', 'true'); });
})();
