(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const hero = document.querySelector('.hero');
  const creativePath = document.querySelector('[data-creative-path]');
  const destinations = document.querySelector('[data-destinations]');
  const cardGrid = document.querySelector('.card-grid');
  const cards = document.querySelectorAll('.access-card');
  const year = document.querySelector('[data-year]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (year) year.textContent = new Date().getFullYear();

  const closeMenu = (restoreFocus = false) => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Abrir menu';
    menu.classList.remove('is-open');
    if (restoreFocus) toggle.focus();
  };

  toggle?.addEventListener('click', () => {
    const shouldOpen = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(shouldOpen));
    toggle.querySelector('.sr-only').textContent = shouldOpen ? 'Fechar menu' : 'Abrir menu';
    menu.classList.toggle('is-open', shouldOpen);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.classList.contains('is-open')) closeMenu(true);
  });

  if (creativePath) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      creativePath.classList.add('is-path-visible');
    } else {
      const pathObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-path-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.28 });
      pathObserver.observe(creativePath);
    }
  }

  if (destinations && cardGrid && cards.length) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      destinations.classList.add('is-destination-visible');
      cards.forEach((card) => card.classList.add('is-visible', 'is-interactive'));
    } else {
      try {
        destinations.classList.add('has-destination-reveal');
        cardGrid.classList.add('has-card-reveal');

        const firstCardDelay = 140;
        const cardStep = 110;
        cards.forEach((card, index) => {
          card.style.setProperty('--card-delay', `${firstCardDelay + (index * cardStep)}ms`);
        });

        const destinationObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            destinations.classList.add('is-destination-visible');
            cards.forEach((card) => card.classList.add('is-visible'));

            const interactiveDelay = firstCardDelay + ((cards.length - 1) * cardStep) + 950;
            window.setTimeout(() => {
              cards.forEach((card) => card.classList.add('is-interactive'));
            }, interactiveDelay);

            observer.unobserve(entry.target);
          });
        }, { threshold: 0.16, rootMargin: '0px 0px -4% 0px' });

        destinationObserver.observe(destinations);
      } catch (error) {
        destinations.classList.remove('has-destination-reveal');
        cardGrid.classList.remove('has-card-reveal');
        cards.forEach((card) => card.classList.add('is-visible', 'is-interactive'));
        console.warn('Destination reveal disabled; showing static cards.', error);
      }
    }
  }

  let scheduled = false;
  const updateScrollEffects = () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollY > 24);
    if (header) {
      const desktop = window.matchMedia('(min-width: 861px)').matches;
      header.classList.toggle('is-away', desktop && scrollY > 64);
    }
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
