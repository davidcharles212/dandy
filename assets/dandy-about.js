(() => {
  'use strict';
  document.querySelectorAll('.dandy-about').forEach((page) => {
    const menu = page.querySelector('.about-menu');
    const navigation = page.querySelector('#AboutNavigation');
    const closeMenu = () => {
      menu.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    };
    if (menu && navigation) {
      menu.addEventListener('click', () => {
        const open = menu.getAttribute('aria-expanded') !== 'true';
        menu.setAttribute('aria-expanded', String(open));
        navigation.classList.toggle('is-open', open);
      });
      navigation.addEventListener('click', (event) => {
        if (event.target.closest('a')) closeMenu();
      });
      page.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
          closeMenu();
          menu.focus();
        }
      });
      window.matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);
    }
    const ticker = page.querySelector('.about-ticker');
    const toggle = page.querySelector('.about-ticker-toggle');
    if (ticker && toggle) {
      toggle.addEventListener('click', () => {
        const paused = ticker.classList.toggle('is-paused');
        toggle.setAttribute('aria-label', paused ? 'Play ticker' : 'Pause ticker');
        toggle.setAttribute('aria-pressed', String(paused));
      });
    }
    // Public Dandy report directory, verified September 12, 2026.
    const reports = [
  {
    "id": "N11271",
    "category": "gummies",
    "measured": "36.6 mg / gummy",
    "date": "2026-08-26",
    "pdf": "https://foreverdandy.com/cdn/shop/t/7/assets/N11271.pdf?v=29715819199452169271789183346"
  },
  {
    "id": "N11272",
    "category": "gummies",
    "measured": "36.5 mg / gummy",
    "date": "2026-08-18",
    "pdf": "https://foreverdandy.com/cdn/shop/t/7/assets/N11272.pdf?v=19368640223715635951789183345"
  },
  {
    "id": "N11270",
    "category": "powder",
    "measured": "34.4 mg / serving",
    "date": "2026-08-28",
    "pdf": "https://foreverdandy.com/cdn/shop/t/7/assets/N11270.pdf?v=27277768588420412531789183344"
  },
  {
    "id": "N11273",
    "category": "capsules",
    "measured": "48.8 mg / capsule",
    "date": "2026-08-31",
    "pdf": "https://foreverdandy.com/cdn/shop/t/7/assets/N11273.pdf?v=182593632971235518991789183345"
  },
  {
    "id": "N11395",
    "category": "capsules",
    "measured": "50.8 mg / capsule",
    "date": "2026-08-31",
    "pdf": "https://foreverdandy.com/cdn/shop/t/7/assets/N11395.pdf?v=31171563734798268661789183346"
  },
  {
    "id": "N11275",
    "category": "capsules",
    "measured": "89.5 mg / capsule",
    "date": "2026-08-31",
    "pdf": "https://foreverdandy.com/cdn/shop/t/7/assets/N11275.pdf?v=167432518297043947681789183346"
  },
  {
    "id": "N11396",
    "category": "capsules",
    "measured": "91.3 mg / capsule",
    "date": "2026-08-31",
    "pdf": "https://foreverdandy.com/cdn/shop/t/7/assets/N11396.pdf?v=28185604832206630151789183344"
  }
];
    const batchForm = page.querySelector('.about-batch-form');
    if (batchForm) {
      const batchInput = batchForm.querySelector('[name="batch"]');
      const result = batchForm.querySelector('.about-batch-result');
      batchInput.addEventListener('input', () => {
        result.replaceChildren();
        result.hidden = true;
      });
      batchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = batchInput.value.trim().replace(/\s+/g, '').toUpperCase();
        const report = reports.find((item) => item.id === id);
        result.replaceChildren();
        result.hidden = false;
        const message = document.createElement('p');
        if (report) {
          message.textContent = `${report.id}: ${report.measured}. Report date: ${report.date}.`;
          const link = document.createElement('a');
          link.href = report.pdf;
          link.target = '_blank';
          link.rel = 'noopener';
          link.textContent = `Open report ${report.id} (PDF) ↗`;
          result.append(message, link);
        } else {
          message.textContent = "We couldn't find that batch. Check the number or view all lab reports below.";
          result.append(message);
        }
      });
    }
    page.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', () => {
        const destination = new URL(link.href, location.href);
        if (!destination.pathname.startsWith('/products/') && destination.pathname !== '/collections/all') return;
        const event = {
          event: 'about_catalog_click',
          page_type: 'about',
          destination: destination.pathname,
          module: link.closest('[data-module]')?.dataset.module || 'navigation',
          format: destination.pathname.includes('gumm') ? 'gummies' : destination.pathname.includes('capsule') ? 'capsules' : destination.pathname.includes('powder') ? 'powder' : 'all'
        };
        if (window.dataLayer && typeof window.dataLayer.push === 'function') {
          window.dataLayer.push(event);
        }
      });
    });
  });
})();
