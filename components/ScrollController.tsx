'use client';

import { useEffect } from 'react';

/*
  Controle de rolagem da página.

  1. Transição hero ↔ conteúdo: ao rolar para baixo no hero (roda, trackpad, toque,
     teclado, "Começar agora" ou links do menu), o bloco preto sobe e cobre o hero,
     acelerando como a pílula do menu e terminando com um "freio de soco".
     Ao rolar para cima no topo do conteúdo, o caminho é o inverso.
     Enquanto isso, o hero encolhe por trás (variável CSS --cover, de 0 a 1).

  2. Roda do mouse suave dentro do conteúdo, com resposta curta (~150 ms).
     Trackpad e toque seguem nativos.
*/

const TRAVEL = bezier(0.6, 0, 0.95, 0.45); // mesmo ease-in da pílula do menu
const WHEEL_RESPONSE = 0.28;

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(t) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}

function looksLikeMouseWheel(e: WheelEvent) {
  if (e.deltaMode !== 0) return true;
  return Math.abs(e.deltaY) >= 50 && Number.isInteger(e.deltaY) && Math.abs(e.deltaX) < 1;
}

export default function ScrollController() {
  useEffect(() => {
    const root = document.documentElement;
    const hero = document.getElementById('inicio');
    const panel = document.getElementById('conteudo');
    const stage = hero?.querySelector<HTMLElement>('.hero-stage') ?? null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const boundary = () => (hero ? hero.offsetHeight : 0);
    const maxScroll = () => root.scrollHeight - window.innerHeight;

    // ---- Progresso de cobertura do hero (0 = hero inteiro, 1 = coberto)
    let progressQueued = false;
    const writeProgress = () => {
      progressQueued = false;
      const H = boundary();
      const p = H ? Math.min(1, Math.max(0, window.scrollY / H)) : 0;
      root.style.setProperty('--cover', p.toFixed(4));
    };
    const queueProgress = () => {
      if (!progressQueued) {
        progressQueued = true;
        requestAnimationFrame(writeProgress);
      }
    };
    writeProgress();

    // ---- Transição animada entre hero e conteúdo
    let transitioning = false;
    let cooldownUntil = 0;
    let transitionRaf = 0;

    function brake(direction: 1 | -1) {
      if (reduceMotion) return;
      if (direction === 1 && panel) {
        // Bloco subindo: a borda passa do ponto e a ponta superior direita tomba para a frente
        panel.animate(
          [
            { transform: 'none' },
            { transform: 'translateY(-18px) skewY(-0.7deg)', offset: 0.26 },
            { transform: 'translateY(6px) skewY(0.22deg)', offset: 0.58 },
            { transform: 'translateY(-2px) skewY(-0.07deg)', offset: 0.8 },
            { transform: 'none' }
          ],
          { duration: 600, easing: 'ease-out' }
        );
      } else if (direction === -1 && stage) {
        // Bloco descendo: o hero sente o tranco da parada e assenta
        stage.animate(
          [
            { translate: '0 0', rotate: '0deg' },
            { translate: '0 14px', rotate: '0.35deg', offset: 0.26 },
            { translate: '0 -5px', rotate: '-0.1deg', offset: 0.58 },
            { translate: '0 2px', rotate: '0.03deg', offset: 0.8 },
            { translate: '0 0', rotate: '0deg' }
          ],
          { duration: 600, easing: 'ease-out' }
        );
      }
    }

    function transitionTo(targetY: number) {
      const startY = window.scrollY;
      const target = Math.max(0, Math.min(maxScroll(), targetY));
      const distance = target - startY;
      if (Math.abs(distance) < 1) return;
      cancelSmooth();
      cancelAnimationFrame(transitionRaf);

      if (reduceMotion) {
        window.scrollTo({ top: target, behavior: 'instant' });
        return;
      }

      transitioning = true;
      const duration = Math.min(950, Math.max(600, 520 + Math.abs(distance) * 0.15));
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        window.scrollTo({ top: startY + distance * TRAVEL(t), behavior: 'instant' });
        if (t < 1) {
          transitionRaf = requestAnimationFrame(step);
        } else {
          transitioning = false;
          // Absorve o resto do gesto (inércia do trackpad) antes de aceitar outro
          cooldownUntil = performance.now() + 450;
          const H = boundary();
          if (startY < H - 1 && target >= H - 1) brake(1);
          else if (startY > 0 && target <= 0) brake(-1);
        }
      };
      transitionRaf = requestAnimationFrame(step);
    }

    const cover = () => transitionTo(boundary());
    const uncover = () => transitionTo(0);

    // Decide o que fazer com um gesto vertical. Retorna true se a transição tratou o gesto.
    function handleIntent(dir: 1 | -1, amount = 0) {
      if (!hero) return false;
      if (transitioning || performance.now() < cooldownUntil) return true;
      const y = window.scrollY;
      const H = boundary();
      if (dir === 1 && y < H - 1) {
        cover();
        return true;
      }
      if (dir === -1 && y > 0 && (y <= H + 1 || y - amount < H)) {
        uncover();
        return true;
      }
      return false;
    }

    // ---- Roda do mouse suave dentro do conteúdo
    let smoothTarget = window.scrollY;
    let smoothCurrent = window.scrollY;
    let smoothing = false;
    let smoothRaf = 0;
    let lastFrame = 0;

    function cancelSmooth() {
      cancelAnimationFrame(smoothRaf);
      smoothing = false;
    }

    function smoothStep(now: number) {
      const dt = lastFrame ? Math.min(now - lastFrame, 50) : 16.7;
      lastFrame = now;
      const k = 1 - Math.pow(1 - WHEEL_RESPONSE, dt / 16.7);
      smoothCurrent += (smoothTarget - smoothCurrent) * k;
      if (Math.abs(smoothTarget - smoothCurrent) < 0.5) smoothCurrent = smoothTarget;
      window.scrollTo({ top: smoothCurrent, behavior: 'instant' });
      if (smoothCurrent !== smoothTarget) smoothRaf = requestAnimationFrame(smoothStep);
      else smoothing = false;
    }

    function onWheel(e: WheelEvent) {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if (document.body.style.overflow === 'hidden') return; // menu do celular aberto
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = e.deltaY * unit;
      if (!delta) return;

      if (handleIntent(delta > 0 ? 1 : -1, Math.abs(delta))) {
        e.preventDefault();
        return;
      }

      if (reduceMotion || !looksLikeMouseWheel(e)) return; // trackpad: nativo
      e.preventDefault();
      if (!smoothing) {
        smoothTarget = smoothCurrent = window.scrollY;
        lastFrame = 0;
      }
      const floor = hero && window.scrollY >= boundary() - 1 ? boundary() : 0;
      smoothTarget = Math.max(floor, Math.min(maxScroll(), smoothTarget + delta));
      if (!smoothing) {
        smoothing = true;
        smoothRaf = requestAnimationFrame(smoothStep);
      }
    }

    // ---- Toque (celular)
    let touchY = 0;
    let touchHandled = false;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
      touchHandled = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!hero || document.body.style.overflow === 'hidden') return;
      const y = e.touches[0]?.clientY ?? touchY;
      const moved = touchY - y; // positivo = dedo subindo = página descendo
      if (touchHandled) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (Math.abs(moved) < 10) return;
      if (handleIntent(moved > 0 ? 1 : -1, Math.abs(moved))) {
        touchHandled = true;
        if (e.cancelable) e.preventDefault();
      }
    };

    // ---- Teclado
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const down = ['ArrowDown', 'PageDown', ' '].includes(e.key) && !(e.key === ' ' && e.shiftKey);
      const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
      if (e.key === 'Home' && window.scrollY > 0 && window.scrollY <= boundary() + 1) {
        e.preventDefault();
        uncover();
        return;
      }
      if ((down || up) && handleIntent(down ? 1 : -1, window.innerHeight * 0.1)) e.preventDefault();
    };

    // ---- Links internos (#cursos, #inicio...) que cruzam a fronteira usam a mesma transição
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a || !hero) return;
      const id = a.getAttribute('href')!.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      const H = boundary();
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      const targetY = el === hero ? 0 : Math.max(H, el.getBoundingClientRect().top + window.scrollY - margin);
      const y = window.scrollY;
      if (targetY === 0 ? y > 0 && y <= H + 1 : y < H - 1) {
        e.preventDefault();
        transitionTo(targetY);
      } else if (targetY === 0 && y > H + 1) {
        // Do meio do conteúdo para o início: rola nativo até o topo do conteúdo e então descobre o hero
        e.preventDefault();
        transitionTo(0);
      }
    };

    // ---- Se a rolagem parar no meio do hero (barra de rolagem, inércia), completa a transição
    let lastY = window.scrollY;
    let lastDir: 1 | -1 = 1;
    let settleTimer = 0;
    const onScroll = () => {
      queueProgress();
      const y = window.scrollY;
      if (y !== lastY) lastDir = y > lastY ? 1 : -1;
      lastY = y;
      if (!smoothing) smoothTarget = smoothCurrent = y;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (transitioning || !hero) return;
        const H = boundary();
        const yy = window.scrollY;
        if (yy > 1 && yy < H - 1) (lastDir === 1 ? cover : uncover)();
      }, 160);
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', queueProgress);

    return () => {
      // Ao sair da página inicial, o hero não pode ficar "coberto" para a próxima visita
      root.style.removeProperty('--cover');
      cancelAnimationFrame(transitionRaf);
      cancelAnimationFrame(smoothRaf);
      window.clearTimeout(settleTimer);
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', queueProgress);
    };
  }, []);

  return null;
}
