'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type NavLink = { href: string; label: string };

/*
  Navegação do desktop com uma "pílula" branca que marca a seção ativa.
  Ao trocar de item, a pílula acelera até o destino (ease-in) e, ao parar,
  faz um "freio de soco": a ponta superior da frente tomba para a frente e volta.
  Uma cópia dos rótulos em preto, recortada pela pílula, mantém o texto legível
  durante todo o trajeto.
*/

const TRAVEL_EASING = 'cubic-bezier(0.6, 0, 0.95, 0.45)';

export default function GlassNav({ links }: { links: NavLink[] }) {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const pillRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, w: 0, placed: false });
  const anims = useRef<Animation[]>([]);
  const lockUntil = useRef(0);

  const place = useCallback((index: number, animate: boolean) => {
    const el = linkRefs.current[index];
    const pill = pillRef.current;
    const bg = bgRef.current;
    const copy = copyRef.current;
    if (!el || !pill || !bg || !copy) return;

    const x = el.offsetLeft;
    const w = el.offsetWidth;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Se a pílula estiver no meio de um trajeto, parte de onde ela está agora
    let fromX = pos.current.x;
    let fromW = pos.current.w;
    if (anims.current.length) {
      const m = new DOMMatrixReadOnly(getComputedStyle(pill).transform);
      fromX = m.m41;
      fromW = parseFloat(getComputedStyle(pill).width) || fromW;
      anims.current.forEach((a) => a.cancel());
      anims.current = [];
    }

    pos.current = { x, w, placed: true };
    pill.style.transform = `translateX(${x}px)`;
    pill.style.width = `${w}px`;
    copy.style.transform = `translateX(${-x}px)`;

    if (!animate || reduce || Math.abs(x - fromX) < 1) return;

    const dir = x > fromX ? 1 : -1;
    const distance = Math.abs(x - fromX);
    const duration = Math.min(520, Math.max(300, 220 + distance * 0.6));
    const timing = { duration, easing: TRAVEL_EASING };

    const travel = pill.animate(
      [
        { transform: `translateX(${fromX}px)`, width: `${fromW}px` },
        { transform: `translateX(${x}px)`, width: `${w}px` }
      ],
      timing
    );
    const follow = copy.animate(
      [{ transform: `translateX(${-fromX}px)` }, { transform: `translateX(${-x}px)` }],
      timing
    );
    anims.current = [travel, follow];

    travel.onfinish = () => {
      anims.current = [];
      // Freio de soco: a frente mergulha para a frente e o corpo assenta com um leve balanço
      const lean = -dir; // skew negativo inclina o topo para a direita
      bg.animate(
        [
          { transform: 'skewX(0deg) scaleY(1)' },
          { transform: `skewX(${lean * 11}deg) scaleY(0.94)`, offset: 0.26 },
          { transform: `skewX(${-lean * 3.5}deg) scaleY(1.02)`, offset: 0.58 },
          { transform: `skewX(${lean * 1}deg) scaleY(1)`, offset: 0.8 },
          { transform: 'skewX(0deg) scaleY(1)' }
        ],
        { duration: 560, easing: 'ease-out' }
      );
    };
  }, []);

  const select = useCallback(
    (index: number, animate = true) => {
      if (index === activeRef.current && pos.current.placed) return;
      activeRef.current = index;
      setActive(index);
      place(index, animate);
    },
    [place]
  );

  // Posição inicial (depois das fontes) e ao redimensionar
  useEffect(() => {
    const reposition = () => place(activeRef.current, false);
    document.fonts?.ready.then(reposition);
    reposition();
    const row = linkRefs.current[0]?.parentElement;
    const ro = new ResizeObserver(reposition);
    if (row) ro.observe(row);
    return () => ro.disconnect();
  }, [place]);

  // Acompanha a rolagem da página, exceto durante a rolagem disparada por um clique
  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    let ticking = false;
    const update = () => {
      ticking = false;
      if (performance.now() < lockUntil.current) return;
      const line = window.innerHeight * 0.35;
      let current = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      // No fim da página, a última seção fica ativa
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = ids.length - 1;
      select(current);
    };
    const onScroll = () => {
      if (performance.now() < lockUntil.current) lockUntil.current = Math.max(lockUntil.current, performance.now() + 160);
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onScrollEnd = () => {
      lockUntil.current = 0;
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', onScrollEnd);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
    };
  }, [links, select]);

  return (
    <nav className="glass-nav" aria-label="Navegação principal">
      <div className="glass-links">
        {links.map((l, i) => (
          <a
            key={l.href}
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            href={l.href}
            aria-current={i === active ? 'location' : undefined}
            onClick={() => {
              lockUntil.current = performance.now() + 1200;
              select(i);
            }}
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="glass-pill" ref={pillRef} aria-hidden="true">
        <div className="glass-pill-bg" ref={bgRef} />
        <div className="glass-pill-clip">
          <div className="glass-pill-labels" ref={copyRef}>
            {links.map((l) => (
              <span key={l.href}>{l.label}</span>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
