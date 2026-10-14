/*
  Página de vendas Influencer com IA.
  - Revela blocos marcados com [data-reveal] ao entrarem na tela.
  - Carrosséis infinitos (looks e comentários): duplica os itens o suficiente para cobrir a tela
    e anima uma volta exata, sem emenda visível.
*/
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SPEED = 42; // pixels por segundo: lento o bastante para ver cada look

  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length && 'IntersectionObserver' in window && !reduceMotion.matches) {
    document.documentElement.classList.add('ic-js-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    reveals.forEach((el) => observer.observe(el));
  }

  // Cada [data-marquee] é um carrossel independente (looks, comentários...).
  function setupMarquee(marquee) {
    const track = marquee.querySelector('[data-marquee-track]');
    const originals = track ? Array.from(track.children) : [];
    if (!originals.length) return null;

    function cloneSet() {
      originals.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('data-clone', '');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('img').forEach((img) => { img.alt = ''; });
        track.appendChild(clone);
      });
    }

    function reset() {
      track.querySelectorAll('[data-clone]').forEach((node) => node.remove());
      marquee.classList.remove('is-running');
    }

    return function build() {
      reset();
      if (reduceMotion.matches) return;

      marquee.classList.add('is-running');
      cloneSet();
      // Distância de uma volta = do primeiro item até a primeira cópia dele (inclui o espaçamento).
      const loop = track.children[originals.length].offsetLeft - originals[0].offsetLeft;
      if (loop <= 0) {
        reset();
        return;
      }
      const copiesNeeded = Math.ceil(marquee.clientWidth / loop);
      for (let i = 1; i < copiesNeeded; i += 1) cloneSet();

      track.style.setProperty('--ic-loop', loop + 'px');
      track.style.setProperty('--ic-loop-duration', (loop / SPEED).toFixed(2) + 's');
    };
  }

  const builders = Array.from(document.querySelectorAll('[data-marquee]'))
    .map(setupMarquee)
    .filter(Boolean);
  if (!builders.length) return;

  const buildAll = () => builders.forEach((build) => build());
  buildAll();

  let lastWidth = window.innerWidth;
  let resizeTimer;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return; // ignora a barra de endereço do celular
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildAll, 200);
  });
  reduceMotion.addEventListener('change', buildAll);
})();
