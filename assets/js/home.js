(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const hero = document.querySelector('.hero');
  const creativePath = document.querySelector('[data-creative-path]');
  const destinations = document.querySelector('[data-destinations]');
  const cardGrid = document.querySelector('.card-grid');
  const cards = document.querySelectorAll('.access-card');
  const youtubeSection = document.querySelector('[data-youtube-section]');
  const youtubeGrid = document.querySelector('[data-youtube-grid]');
  const youtubeStatus = document.querySelector('[data-youtube-status]');
  const year = document.querySelector('[data-year]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (year) year.textContent = new Date().getFullYear();

  if (header) {
    const finishHeaderIntro = () => {
      header.classList.add('is-intro-complete');
      const desktop = window.matchMedia('(min-width: 861px)').matches;
      header.classList.toggle('is-away', desktop && window.scrollY > 64);
      header.removeEventListener('animationend', handleHeaderIntroEnd);
    };

    const handleHeaderIntroEnd = (event) => {
      if (event.target === header && event.animationName === 'header-in') {
        finishHeaderIntro();
      }
    };

    if (reduceMotion.matches) {
      finishHeaderIntro();
    } else {
      header.addEventListener('animationend', handleHeaderIntroEnd);
      window.setTimeout(finishHeaderIntro, 1000);
    }
  }

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

  if (youtubeSection) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      youtubeSection.classList.add('is-video-visible');
    } else {
      youtubeSection.classList.add('has-video-reveal');
      const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          youtubeSection.classList.add('is-video-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
      videoObserver.observe(youtubeSection);
    }
  }

  const YOUTUBE_UPLOADS_PLAYLIST = 'UUal4KF4mgJCUrFXu4Qw5aog';
  const youtubeProbe = document.querySelector('[data-youtube-probe]');

  const renderYoutubeVideos = (videoIds) => {
    if (!youtubeGrid) return;
    youtubeGrid.replaceChildren();

    videoIds.slice(0, 3).forEach((videoId, index) => {
      const card = document.createElement('a');
      card.className = 'video-card';
      card.href = `https://www.youtube.com/watch?v=${videoId}`;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.setAttribute('aria-label', `Assistir vídeo recente no YouTube`);
      card.style.setProperty('--video-delay', `${140 + (index * 110)}ms`);

      const media = document.createElement('span');
      media.className = 'video-card-media';

      const image = document.createElement('img');
      image.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      image.alt = 'Thumbnail de vídeo recente do Azevedo Academy';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => {
        if (image.dataset.fallback === 'true') return;
        image.dataset.fallback = 'true';
        image.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      }, { once: true });

      const play = document.createElement('span');
      play.className = 'video-card-play';
      play.setAttribute('aria-hidden', 'true');
      play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';

      const body = document.createElement('span');
      body.className = 'video-card-body';

      const label = document.createElement('span');
      label.className = 'video-card-meta';
      label.textContent = 'Vídeo recente';

      const title = document.createElement('strong');
      title.className = 'video-card-title';
      title.textContent = 'Assistir no YouTube';

      media.append(image, play);
      body.append(label, title);
      card.append(media, body);
      youtubeGrid.append(card);
    });

    youtubeGrid.setAttribute('aria-busy', 'false');
  };

  const showYoutubeFallback = () => {
    if (!youtubeGrid) return;
    youtubeGrid.setAttribute('aria-busy', 'false');
    if (youtubeStatus) {
      youtubeStatus.textContent = 'Abra o canal para ver os vídeos mais recentes.';
    }
  };

  const loadYoutubeIframeApi = () => new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    const existing = document.querySelector('script[data-youtube-iframe-api]');
    const previousReady = window.onYouTubeIframeAPIReady;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(window.YT);
    };

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === 'function') previousReady();
      finish();
    };

    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.youtubeIframeApi = 'true';
      script.addEventListener('error', () => reject(new Error('YouTube IFrame API failed to load')), { once: true });
      document.head.append(script);
    }

    window.setTimeout(() => {
      if (window.YT?.Player) finish();
      else reject(new Error('YouTube IFrame API timed out'));
    }, 8000);
  });

  if (youtubeGrid && youtubeProbe) {
    loadYoutubeIframeApi()
      .then(() => {
        let rendered = false;
        let retries = 0;

        const tryRenderPlaylist = (player) => {
          if (rendered) return;
          const playlist = player.getPlaylist?.();

          if (Array.isArray(playlist) && playlist.length) {
            rendered = true;
            renderYoutubeVideos(playlist);
            window.setTimeout(() => player.destroy?.(), 0);
            return;
          }

          retries += 1;
          if (retries <= 12) {
            window.setTimeout(() => tryRenderPlaylist(player), 250);
          } else {
            showYoutubeFallback();
            player.destroy?.();
          }
        };

        const player = new window.YT.Player(youtubeProbe, {
          width: 200,
          height: 200,
          playerVars: {
            listType: 'playlist',
            list: YOUTUBE_UPLOADS_PLAYLIST,
            autoplay: 0,
            controls: 0,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              event.target.cuePlaylist({
                listType: 'playlist',
                list: YOUTUBE_UPLOADS_PLAYLIST,
                index: 0
              });
              tryRenderPlaylist(event.target);
            },
            onStateChange: (event) => {
              if (window.YT?.PlayerState && event.data === window.YT.PlayerState.CUED) {
                tryRenderPlaylist(event.target);
              }
            },
            onError: () => showYoutubeFallback()
          }
        });
      })
      .catch((error) => {
        showYoutubeFallback();
        console.warn('Latest YouTube videos unavailable.', error);
      });
  }

  let scheduled = false;
  const updateScrollEffects = () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollY > 24);
    if (header) {
      const desktop = window.matchMedia('(min-width: 861px)').matches;
      const introComplete = header.classList.contains('is-intro-complete') || reduceMotion.matches;
      header.classList.toggle('is-away', desktop && introComplete && scrollY > 64);
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
