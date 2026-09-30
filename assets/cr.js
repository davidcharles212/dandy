(function(){
  window.__ready=true;
  
  var els=[].slice.call(document.querySelectorAll('[data-reveal]'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{threshold:.15});
    els.forEach(function(el){io.observe(el)});
  }else{els.forEach(function(el){el.classList.add('is-in')})}
  // fallback so a jump scroll never leaves content hidden
  var reveal=function(){var h=innerHeight;els.forEach(function(el){if(!el.classList.contains('is-in')&&el.getBoundingClientRect().top<h*.95)el.classList.add('is-in')})};
  // truck loop: poster underneath, video fades in while on screen, never under reduced motion
  var vids=[].slice.call(document.querySelectorAll('.loop video'));
  if(vids.length&&'IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    vids.forEach(function(v){
      v.addEventListener('playing',function(){v.classList.add('is-playing')});
      v.addEventListener('error',function(){v.style.display='none'},true);
    });
    var vio=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
      if(e.isIntersecting){if(!v.src){v.src=v.getAttribute('data-src');v.preload='auto'}var p=v.play();if(p&&p.catch)p.catch(function(){})}else{v.pause()}
    })},{threshold:.3,rootMargin:'200px 0px'});
    vids.forEach(function(v){vio.observe(v)});
  }
  var sticky=document.getElementById('sticky'),hero=document.querySelector('.open'),btns=[].slice.call(document.querySelectorAll('main .btn')),t=0;
  function upd(){t=0;reveal();
    var past=hero.getBoundingClientRect().bottom<0,h=innerHeight;
    var btnOn=btns.some(function(b){var r=b.getBoundingClientRect();return r.bottom>0&&r.top<h});
    var on=past&&!btnOn;sticky.classList.toggle('is-on',on);sticky.setAttribute('aria-hidden',on?'false':'true');
  }
  addEventListener('scroll',function(){if(!t)t=requestAnimationFrame(upd)},{passive:true});
  addEventListener('resize',upd);upd();
})();
