/* Image-first product lightbox, following the approved IM8 mobile reference. */
(() => {
  if (window.dandyImageViewerReady) return;
  window.dandyImageViewerReady = true;
  let viewer;
  let opener;
  let scrollStyles;
  let closeTimer;

  function close() {
    if (!viewer?.open || viewer.classList.contains('is-closing')) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return viewer.close();
    viewer.classList.add('is-closing');
    closeTimer = setTimeout(() => viewer.close(), 180);
  }

  function buildViewer() {
    viewer = document.createElement('dialog');
    viewer.className = 'dandy-image-viewer';
    viewer.setAttribute('aria-label', 'Product image');
    viewer.innerHTML = `
      <div class="dandy-image-viewer__photo">
        <img data-image alt="" draggable="false">
        <button type="button" data-close autofocus aria-label="Close product image">
          <svg viewBox="0 0 48 48" width="48" height="48" fill="none" aria-hidden="true">
            <path d="M24 1 40.3 7.7 47 24 40.3 40.3 24 47 7.7 40.3 1 24 7.7 7.7Z" fill="white" fill-opacity=".8" stroke="currentColor"/>
            <path d="m17 17 14 14m0-14L17 31" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <p data-error role="status" hidden>Image could not load. Close and try again.</p>
      </div>`;
    document.body.append(viewer);
    viewer.querySelector('[data-close]').addEventListener('click', close);
    viewer.querySelector('[data-image]').addEventListener('error', () => { viewer.querySelector('[data-error]').hidden = false; });
    viewer.querySelector('[data-image]').addEventListener('load', (event) => {
      viewer.style.setProperty('--image-ratio', event.target.naturalWidth / event.target.naturalHeight);
      viewer.querySelector('[data-error]').hidden = true;
    });
    // A press begun on the photo must not dismiss when it ends on the backdrop.
    let backdropPress = false;
    viewer.addEventListener('pointerdown', (event) => { backdropPress = event.target === viewer; });
    viewer.addEventListener('click', (event) => { if (event.target === viewer && backdropPress) close(); });
    viewer.addEventListener('keydown', () => { viewer.dataset.keyboard = 'true'; });
    viewer.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
    viewer.addEventListener('close', () => {
      clearTimeout(closeTimer);
      viewer.classList.remove('is-closing');
      scrollStyles.forEach(({ element, value, priority }) => {
        if (value) element.style.setProperty('overflow', value, priority);
        else element.style.removeProperty('overflow');
      });
      opener?.focus({ preventScroll: true });
    });
  }

  function open(gallery, trigger, keyboard) {
    if (!viewer) buildViewer();
    if (viewer.open) return;
    opener = trigger;
    viewer.dataset.keyboard = String(keyboard);
    const source = gallery.querySelector('.gallery__main img');
    const image = viewer.querySelector('[data-image]');
    image.src = source.src;
    image.alt = source.alt;
    viewer.style.setProperty('--image-ratio', (source.naturalWidth || 1) / (source.naturalHeight || 1));
    viewer.querySelector('[data-error]').hidden = true;
    scrollStyles = [...new Set([document.documentElement, document.body, document.querySelector('.page-wrapper')].filter(Boolean))]
      .map((element) => ({ element, value: element.style.getPropertyValue('overflow'), priority: element.style.getPropertyPriority('overflow') }));
    viewer.showModal();
    scrollStyles.forEach(({ element }) => element.style.setProperty('overflow', 'hidden'));
  }

  function initialize(root = document) {
    root.querySelectorAll('.gallery').forEach((gallery) => {
      const main = gallery.querySelector('.gallery__main');
      if (!main || !main.querySelector('img') || main.querySelector('[data-image-open]')) return;
      main.classList.add('dandy-image-stage');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dandy-image-open';
      button.dataset.imageOpen = '';
      button.setAttribute('aria-label', 'Enlarge product image');
      button.setAttribute('aria-haspopup', 'dialog');
      main.append(button);
      const thumbs = [...gallery.querySelectorAll('.gallery__thumb')];
      // Keep the page scrollable vertically; a horizontal swipe selects a photo.
      let start;
      let suppressClick = false;
      button.addEventListener('pointerdown', (event) => {
        suppressClick = false;
        if (!event.isPrimary || event.pointerType === 'mouse') { start = null; return; }
        start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      });
      button.addEventListener('pointercancel', () => { start = null; });
      button.addEventListener('pointerup', (event) => {
        if (!start || start.id !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        start = null;
        if (!thumbs.length || Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        const current = Math.max(0, thumbs.findIndex((thumb) => thumb.getAttribute('aria-current') === 'true'));
        thumbs[(current + (dx < 0 ? 1 : -1) + thumbs.length) % thumbs.length].click();
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 400);
      });
      button.addEventListener('click', (event) => {
        if (suppressClick && event.detail > 0) { suppressClick = false; return; }
        open(gallery, button, event.detail === 0);
      });
      thumbs.forEach((thumb, index) => {
        if (!thumb.getAttribute('aria-label')) thumb.setAttribute('aria-label', `Show product image ${index + 1}`);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initialize(), { once: true });
  else initialize();
  document.addEventListener('shopify:section:load', (event) => initialize(event.target));
})();
