(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const year = document.querySelector('[data-year]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (year) year.textContent = new Date().getFullYear();

  const closeMenu = () => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Abrir menu';
    menu.classList.remove('is-open');
  };

  toggle?.addEventListener('click', () => {
    const shouldOpen = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(shouldOpen));
    toggle.querySelector('.sr-only').textContent = shouldOpen ? 'Fechar menu' : 'Abrir menu';
    menu.classList.toggle('is-open', shouldOpen);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  let scheduled = false;
  const updateScrollEffects = () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollY > 24);
    if (!reduceMotion.matches && scrollY < window.innerHeight * 1.15) {
      document.documentElement.style.setProperty('--hero-shift', `${Math.min(scrollY * 0.045, 38)}px`);
    }
    scheduled = false;
  };

  window.addEventListener('scroll', () => {
    if (!scheduled) {
      window.requestAnimationFrame(updateScrollEffects);
      scheduled = true;
    }
  }, { passive: true });

  updateScrollEffects();
})();
