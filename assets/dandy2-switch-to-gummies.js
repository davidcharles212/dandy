/* Sticky mobile CTA: appears once the hero CTA has scrolled out of view,
   hides again when it is back. CSS limits the bar to viewports <= 860px. */
(() => {
  const bar = document.querySelector('[data-sticky]');
  const anchor = document.getElementById('hero-cta');
  if (!bar || !anchor) return;
  const link = bar.querySelector('a');
  const set = (on) => {
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', String(!on));
    if (link) link.tabIndex = on ? 0 : -1;
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => set(!en.isIntersecting && en.boundingClientRect.top < 0), { threshold: 0 }).observe(anchor);
  } else {
    const check = () => set(anchor.getBoundingClientRect().bottom < 0);
    window.addEventListener('scroll', check, { passive: true });
    check();
  }
})();

/* Only one FAQ answer open at a time. */
(() => {
  const items = Array.from(document.querySelectorAll('.faq details'));
  items.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
