(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]dev\b/.test(location.search) || location.hostname === 'localhost' || location.hostname === '127.0.0.1') document.body.classList.add('dev');

  /* UGC slots: autoplay muted when visible, replay, sound toggle, poster fallback, reduced-motion poster */
  var slots = document.querySelectorAll('.ugc');
  var soundOn = null;
  slots.forEach(function(slot){
    var v = slot.querySelector('video'), fb = slot.querySelector('.ugc__fallback');
    if (!v) return;
    var play = document.createElement('button');
    play.type = 'button'; play.className = 'ugc__play'; play.setAttribute('aria-label','Play video');
    play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    slot.querySelector('.ugc__frame').appendChild(play);
    function showFallback(){ v.hidden = true; fb.hidden = false; slot.classList.add('is-fallback'); slot.querySelector('.ugc__controls').hidden = true; play.remove(); }
    v.addEventListener('error', showFallback);
    var src = v.querySelectorAll('source'); if (src.length) src[src.length-1].addEventListener('error', showFallback);
    if (reduce) { v.removeAttribute('loop'); slot.classList.add('is-paused'); }
    play.addEventListener('click', function(){ slot.classList.remove('is-paused'); v.play(); });
    slot.querySelector('.ugc__replay').addEventListener('click', function(){ v.currentTime = 0; slot.classList.remove('is-paused'); v.play(); });
    var snd = slot.querySelector('.ugc__sound');
    snd.addEventListener('click', function(){
      var on = v.muted; v.muted = !on;
      snd.setAttribute('aria-pressed', on ? 'true' : 'false'); snd.setAttribute('aria-label', on ? 'Mute video' : 'Unmute video');
      if (on) { soundOn = v; slots.forEach(function(s){ var o = s.querySelector('video'); if (o && o !== v && !o.muted) { o.muted = true; s.querySelector('.ugc__sound').setAttribute('aria-pressed','false'); } }); }
      if (v.paused) v.play();
    });
    v.addEventListener('ended', function(){ if (reduce) slot.classList.add('is-paused'); });
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function(es){ es.forEach(function(e){
        if (e.isIntersecting && e.intersectionRatio > 0.45) { v.play().catch(function(){ slot.classList.add('is-paused'); }); }
        else { v.pause(); if (!v.muted) { v.muted = true; snd.setAttribute('aria-pressed','false'); } }
      }); }, { threshold: [0, .45, .8] }).observe(v);
    }
  });

  /* Mechanism dial */
  var stage = document.querySelector('.mech__stage');
  if (stage) {
    var stops = stage.querySelectorAll('.dial__stop'), idx = 0, timer;
    function setState(s){ stage.dataset.state = s; stops.forEach(function(b){ b.setAttribute('aria-checked', b.dataset.state === s ? 'true' : 'false'); }); }
    stops.forEach(function(b, i){ b.addEventListener('click', function(){ idx = i; setState(b.dataset.state); clearInterval(timer); }); });
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function(es){ es.forEach(function(e){
        if (e.isIntersecting) { clearInterval(timer); timer = setInterval(function(){ idx = (idx + 1) % stops.length; setState(stops[idx].dataset.state); }, 3200); }
        else clearInterval(timer);
      }); }, { threshold: .5 }).observe(stage);
    }
  }

  /* Transparency callouts */
  var tp = document.querySelector('.trust__pouch');
  if (tp && 'IntersectionObserver' in window) new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) tp.classList.add('is-inview'); }); }, { threshold: .4 }).observe(tp);
  else if (tp) tp.classList.add('is-inview');

  /* Offer tabs: one-time is the default; subscription terms are only shown when chosen */
  var tabs = document.querySelectorAll('.offer__tab'), panels = document.querySelectorAll('.offer__panel');
  tabs.forEach(function(t){ t.addEventListener('click', function(){
    tabs.forEach(function(x){ x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
    panels.forEach(function(p){ p.hidden = p.dataset.mode !== t.dataset.mode; });
  }); });

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

  /* Day cards: pagination dots for the mobile snap row */
  var row = document.querySelector('.days__row'), dots = document.querySelectorAll('.days__dots i');
  if (row && dots.length) {
    row.addEventListener('scroll', function(){
      var cards = row.querySelectorAll('.day'), mid = row.scrollLeft + row.clientWidth / 2, best = 0, bd = Infinity;
      cards.forEach(function(c, i){ var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
      dots.forEach(function(d, i){ d.classList.toggle('is-on', i === best); });
    }, { passive: true });
  }
})();
