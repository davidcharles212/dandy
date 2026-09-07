(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]dev\b/.test(location.search) || location.hostname === 'localhost' || location.hostname === '127.0.0.1') document.body.classList.add('dev');
  var hasIO = 'IntersectionObserver' in window;

  /* Captions: verbatim cues from the clips' spoken words, keyed by slot id */
  var cues = {};
  try { cues = JSON.parse((document.getElementById('cshop-captions') || {}).textContent || '{}'); } catch (e) { cues = {}; }

  /* UGC slots: autoplay muted when visible, replay, captions, sound toggle, poster fallback, reduced-motion poster */
  var slots = document.querySelectorAll('.ugc');
  slots.forEach(function(slot){
    var v = slot.querySelector('video'), fb = slot.querySelector('.ugc__fallback'), cap = slot.querySelector('.ugc__cap');
    if (!v) return;
    var list = cues[slot.dataset.slot] || [], ccOn = list.length > 0, ccBtn = slot.querySelector('.ugc__cc');
    if (!list.length && ccBtn) ccBtn.hidden = true;
    var play = document.createElement('button');
    play.type = 'button'; play.className = 'ugc__play'; play.setAttribute('aria-label','Play video');
    play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    slot.querySelector('.ugc__frame').appendChild(play);
    function showFallback(){ v.hidden = true; fb.hidden = false; slot.classList.add('is-fallback'); slot.querySelector('.ugc__controls').hidden = true; if (cap) cap.hidden = true; play.remove(); }
    v.addEventListener('error', showFallback);
    var src = v.querySelectorAll('source'); if (src.length) src[src.length-1].addEventListener('error', showFallback);
    if (reduce) { v.removeAttribute('loop'); slot.classList.add('is-paused'); }
    play.addEventListener('click', function(){ slot.classList.remove('is-paused'); v.play(); });
    slot.querySelector('.ugc__replay').addEventListener('click', function(){ v.currentTime = 0; slot.classList.remove('is-paused'); v.play(); });
    var snd = slot.querySelector('.ugc__sound');
    snd.addEventListener('click', function(){
      var on = v.muted; v.muted = !on;
      snd.setAttribute('aria-pressed', on ? 'true' : 'false'); snd.setAttribute('aria-label', on ? 'Mute video' : 'Unmute video');
      if (on) slots.forEach(function(s){ var o = s.querySelector('video'); if (o && o !== v && !o.muted) { o.muted = true; var b = s.querySelector('.ugc__sound'); b.setAttribute('aria-pressed','false'); b.setAttribute('aria-label','Unmute video'); } });
      if (v.paused) v.play();
    });
    if (ccBtn) ccBtn.addEventListener('click', function(){ ccOn = !ccOn; ccBtn.setAttribute('aria-pressed', ccOn ? 'true' : 'false'); ccBtn.setAttribute('aria-label', ccOn ? 'Hide captions' : 'Show captions'); if (!ccOn && cap) { cap.textContent = ''; cap.classList.remove('is-on'); } });
    if (cap && list.length) {
      var last = null;
      v.addEventListener('timeupdate', function(){
        if (!ccOn) return;
        var t = v.currentTime, hit = null;
        for (var i = 0; i < list.length; i++) { if (t >= list[i][0] && t < list[i][1]) { hit = list[i]; break; } }
        if (hit !== last) { last = hit; cap.textContent = hit ? hit[2] : ''; cap.classList.toggle('is-on', !!hit); }
      });
    }
    v.addEventListener('ended', function(){ if (reduce) slot.classList.add('is-paused'); });
    if (!reduce && hasIO) {
      new IntersectionObserver(function(es){ es.forEach(function(e){
        if (e.isIntersecting && e.intersectionRatio > 0.45) { v.play().catch(function(){ slot.classList.add('is-paused'); }); }
        else { v.pause(); if (!v.muted) { v.muted = true; snd.setAttribute('aria-pressed','false'); } }
      }); }, { threshold: [0, .45, .8] }).observe(v);
    }
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
        if (e.isIntersecting && e.intersectionRatio > 0.3) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(still); }
        else if (!fig.classList.contains('is-held')) v.pause();
      }); }, { threshold: [0, .3, .6] }).observe(v);
    } else { v.play().catch(still); }
    v.addEventListener('playing', function(){ fig.classList.add('is-playing'); });
    v.addEventListener('ended', function(){ fig.classList.add('is-held'); });
  });

  /* Mechanism: three states, a loop whose HTML label follows the gummy, swipeable cards on mobile */
  var stage = document.querySelector('.mech__stage');
  if (stage) {
    var states = stage.querySelectorAll('.state'), row = stage.querySelector('.states'), dots = stage.querySelectorAll('.states__dots i'), mv = stage.querySelector('.mech__loop video');
    var names = ['lift','focus','settle'], seek = [0.3, 3.0, 5.4], bounds = [2.5, 4.9], idx = 0, timer, userPicked = false;
    function setState(s, seek){
      stage.dataset.state = s; idx = names.indexOf(s);
      states.forEach(function(b){ b.setAttribute('aria-checked', b.dataset.state === s ? 'true' : 'false'); });
      dots.forEach(function(d, i){ d.classList.toggle('is-on', i === idx); });
      if (seek && mv && mv.duration) { mv.currentTime = Math.min(seek[idx], mv.duration - 0.1); if (mv.paused && !reduce) mv.play().catch(function(){}); }
    }
    states.forEach(function(b){ b.addEventListener('click', function(){ userPicked = true; clearInterval(timer); setState(b.dataset.state, true); if (window.innerWidth <= 700 && row) row.scrollTo({ left: b.offsetLeft - (row.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' }); }); });
    if (mv) mv.addEventListener('timeupdate', function(){
      if (!mv.duration) return;
      var t = mv.currentTime, s = t < bounds[0] ? 'lift' : (t < bounds[1] ? 'focus' : 'settle');
      if (s !== stage.dataset.state && !userPicked) setState(s, false);
      if (userPicked && s !== stage.dataset.state) { userPicked = false; setState(s, false); }
    });
    if (row) row.addEventListener('scroll', function(){
      if (window.innerWidth > 700) return;
      var mid = row.scrollLeft + row.clientWidth / 2, best = 0, bd = Infinity;
      states.forEach(function(c, i){ var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
      if (best !== idx) { userPicked = true; setState(names[best], true); }
    }, { passive: true });
    if (!mv || reduce) {
      if (!reduce && hasIO) new IntersectionObserver(function(es){ es.forEach(function(e){
        if (e.isIntersecting) { clearInterval(timer); timer = setInterval(function(){ setState(names[(idx + 1) % 3], false); }, 3200); } else clearInterval(timer);
      }); }, { threshold: .5 }).observe(stage);
    }
  }

  /* Transparency callouts appear once the pouch is on screen */
  var tp = document.querySelector('.trust__pouch');
  if (tp && hasIO) new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) tp.classList.add('is-inview'); }); }, { threshold: .4 }).observe(tp);
  else if (tp) tp.classList.add('is-inview');

  /* Offer: one-time is the default; the tier visual follows the tier under the pointer or focus */
  var tabs = document.querySelectorAll('.offer__tab'), panels = document.querySelectorAll('.offer__panel'), visual = document.querySelector('.offer__visual');
  tabs.forEach(function(t){ t.addEventListener('click', function(){
    tabs.forEach(function(x){ x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
    panels.forEach(function(p){ p.hidden = p.dataset.mode !== t.dataset.mode; });
    if (visual) { visual.dataset.tier = t.dataset.mode === 'sub' ? '1' : '5'; visual.classList.add('is-held'); }
  }); });
  if (visual) {
    document.querySelectorAll('.pack, .sub').forEach(function(p){
      ['mouseenter','focusin','touchstart'].forEach(function(ev){ p.addEventListener(ev, function(){ visual.dataset.tier = p.dataset.tier; visual.classList.add('is-held'); }, { passive: true }); });
    });
    var packs = document.querySelector('.packs'); if (packs) packs.addEventListener('mouseleave', function(){ visual.dataset.tier = '5'; });
  }

  /* Sticky mobile CTA: on once the hero CTA has scrolled above the viewport, off while the offer is on screen */
  var sticky = document.querySelector('.sticky'), heroCta = document.querySelector('.hero__cta'), offer = document.getElementById('offer');
  if (sticky && heroCta && offer) {
    var ticking = false;
    function update(){
      ticking = false;
      var heroGone = heroCta.getBoundingClientRect().bottom < 0;
      var o = offer.getBoundingClientRect(), vh = window.innerHeight;
      var offerIn = o.top < vh * 0.85 && o.bottom > vh * 0.15;
      var on = heroGone && !offerIn;
      sticky.classList.toggle('is-on', on); sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); update();
  }
})();
