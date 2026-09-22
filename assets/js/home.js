(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const navbar = document.querySelector('.navbar');
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

  navbar?.addEventListener('pointermove', (event) => {
    const bounds = navbar.getBoundingClientRect();
    navbar.style.setProperty('--glass-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    navbar.style.setProperty('--glass-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  }, { passive: true });

  navbar?.addEventListener('pointerleave', () => {
    navbar.style.setProperty('--glass-x', '50%');
    navbar.style.setProperty('--glass-y', '0%');
  });

  let scheduled = false;
  const updateScrollEffects = () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollY > 24);
    if (!reduceMotion.matches && scrollY < window.innerHeight * 1.15) {
      document.documentElement.style.setProperty('--hero-shift', `${Math.min(scrollY * 0.045, 38)}px`);
      document.documentElement.style.setProperty('--content-shift', `${Math.min(scrollY * -0.018, 0)}px`);
      document.documentElement.style.setProperty('--decor-shift', `${Math.max(8 - scrollY * 0.035, -18)}px`);
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

  const cards = [...document.querySelectorAll('.access-card')];
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    cards.forEach((card, index) => {
      card.classList.add('reveal-ready');
      card.style.setProperty('--reveal-delay', `${index * 85}ms`);
    });

    const cardObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

    cards.forEach((card) => cardObserver.observe(card));
  }
})();
