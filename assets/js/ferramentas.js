(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const overlay = document.querySelector('[data-menu-overlay]');
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.tool-card'));
  const count = document.querySelector('[data-count]');
  const catalog = document.querySelector('[data-catalog]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const setMenuState = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    const label = toggle.querySelector('.sr-only');
    if (label) label.textContent = open ? 'Fechar menu' : 'Abrir menu';
    menu.classList.toggle('is-open', open);
    overlay?.classList.toggle('is-open', open);
    document.body.classList.toggle('mobile-menu-open', open);
  };

  const closeMenu = (restoreFocus = false) => {
    setMenuState(false);
    if (restoreFocus) toggle?.focus({ preventScroll: true });
  };

  toggle?.addEventListener('click', () => {
    setMenuState(toggle.getAttribute('aria-expanded') !== 'true');
  });

  overlay?.addEventListener('click', () => closeMenu());
  menu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.classList.contains('is-open')) {
      closeMenu(true);
    }
  });

  const mobileMenuMedia = window.matchMedia('(max-width: 860px)');
  mobileMenuMedia.addEventListener?.('change', (event) => {
    if (!event.matches) closeMenu();
  });

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const updateCount = (visible) => {
    if (!count) return;
    count.textContent = `${visible} ${visible === 1 ? 'ferramenta' : 'ferramentas'}`;
  };

  let filterTimer;

  const applyFilter = (filter) => {
    window.clearTimeout(filterTimer);

    filters.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const visibleCards = cards.filter((card) => {
      if (filter === 'all') return true;
      return card.dataset.tags?.split(/\s+/).includes(filter);
    });

    cards.forEach((card) => {
      const shouldShow = visibleCards.includes(card);

      if (!shouldShow) {
        card.classList.remove('is-filtering-in');
        card.classList.add('is-filtering-out');
      } else if (card.classList.contains('is-hidden')) {
        card.classList.remove('is-hidden', 'is-filtering-out');
        void card.offsetWidth;
        card.classList.add('is-filtering-in');
      } else {
        card.classList.remove('is-filtering-out');
      }
    });

    filterTimer = window.setTimeout(() => {
      cards.forEach((card) => {
        const shouldShow = visibleCards.includes(card);
        card.classList.toggle('is-hidden', !shouldShow);
        card.classList.remove('is-filtering-out');
      });
      updateCount(visibleCards.length);
    }, reduceMotion.matches ? 0 : 280);
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.filter || 'all'));
  });

  cards.forEach((card, index) => {
    card.style.setProperty('--card-delay', `${Math.min(index * 65, 520)}ms`);

    card.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });

  const revealCards = () => {
    cards.forEach((card) => card.classList.add('is-visible'));
  };

  if (!catalog || reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealCards();
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealCards();
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    observer.observe(catalog);
  }

  document.querySelectorAll('.tool-logo').forEach((image) => {
    image.addEventListener('error', () => {
      const fallback = image.dataset.fallback;
      if (fallback && image.dataset.fallbackUsed !== 'true') {
        image.dataset.fallbackUsed = 'true';
        image.src = fallback;
        return;
      }

      image.closest('.tool-logo-shell')?.classList.add('is-logo-fallback');
    });
  });

  updateCount(cards.length);
})();
