'use client';

import { useEffect } from 'react';

/*
  Rolagem suave só para a roda do mouse, que normalmente pula em "degraus".
  Trackpad e toque no celular continuam nativos: já são suaves e respondem na hora.
  A animação é curta (cerca de 150 ms) para a página nunca parecer atrasada.
*/

const RESPONSE = 0.28; // fração da distância restante percorrida a cada quadro de 60 Hz

function looksLikeMouseWheel(e: WheelEvent) {
  if (e.deltaMode !== 0) return true; // rolagem por linhas ou páginas
  const dy = Math.abs(e.deltaY);
  // Rodas de mouse enviam saltos grandes e inteiros; trackpads enviam valores pequenos e contínuos
  return dy >= 50 && Number.isInteger(e.deltaY) && Math.abs(e.deltaX) < 1;
}

export default function SmoothWheel() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let target = window.scrollY;
    let current = window.scrollY;
    let animating = false;
    let raf = 0;
    let last = 0;

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    function step(now: number) {
      const dt = last ? Math.min(now - last, 50) : 16.7;
      last = now;
      const k = 1 - Math.pow(1 - RESPONSE, dt / 16.7);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.5) current = target;
      window.scrollTo({ top: current, behavior: 'instant' });
      if (current !== target) {
        raf = requestAnimationFrame(step);
      } else {
        animating = false;
      }
    }

    function onWheel(e: WheelEvent) {
      if (e.defaultPrevented || e.ctrlKey || e.shiftKey || !looksLikeMouseWheel(e)) return;
      if (document.body.style.overflow === 'hidden') return; // menu aberto
      e.preventDefault();

      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
      if (!animating) {
        target = current = window.scrollY;
        last = 0;
      }
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * unit));
      if (!animating) {
        animating = true;
        raf = requestAnimationFrame(step);
      }
    }

    // Se a página rolar por outro meio (teclado, barra, link), acompanha sem brigar
    function onScroll() {
      if (!animating) target = current = window.scrollY;
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}
