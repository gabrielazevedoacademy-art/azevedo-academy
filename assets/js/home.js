(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const hero = document.querySelector('.hero');
  const cardGrid = document.querySelector('.card-grid');
  const cards = document.querySelectorAll('.access-card');
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

  if (cardGrid && cards.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    try {
      const revealAllCards = () => cards.forEach((card) => card.classList.add('is-visible'));
      const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px 8% 0px' });

      cards.forEach((card, index) => {
        card.style.setProperty('--card-delay', `${index * 90}ms`);
        cardObserver.observe(card);
      });

      // The hidden reveal state only exists after every card is being observed.
      cardGrid.classList.add('has-card-reveal');
      window.setTimeout(revealAllCards, 2400);
    } catch (error) {
      cardGrid.classList.remove('has-card-reveal');
      console.warn('Card reveal disabled; showing static cards.', error);
    }
  }

  let scheduled = false;
  const updateScrollEffects = () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollY > 24);
    if (!reduceMotion.matches && hero && scrollY < hero.offsetHeight * 1.15) {
      const progress = Math.min(scrollY, hero.offsetHeight * 1.15);
      document.documentElement.style.setProperty('--hero-image-shift', `${progress * 0.16}px`);
      document.documentElement.style.setProperty('--hero-content-shift', `${progress * 0.07}px`);
      document.documentElement.style.setProperty('--hero-explore-shift', `${progress * -0.11}px`);
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
