'use client';

import { Fragment, useEffect, useRef } from 'react';

/*
  Título do hero com a mesma lupa do fundo.
  Depois da entrada animada, as letras perto do cursor (ou do dedo) crescem e se
  afastam levemente do centro da lente. Na segunda linha, elas também escurecem.
*/

const LENS_FOLLOW = 0.2;
const LENS_FADE = 0.12;
const LENS_PUSH = 0.16; // afastamento a partir do centro da lente
const LENS_GROW = 0.2; // crescimento máximo da letra
const GRAY = [110, 110, 115];

type Line = { text: string; className: string; tone: 'ink' | 'gray' };

export default function HeroTitle({ lines }: { lines: Line[] }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const host = title?.closest('section');
    if (!title || !host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      title.classList.add('is-ready');
      return;
    }

    const chars = Array.from(title.querySelectorAll<HTMLSpanElement>('.char'));
    const gray = chars.map((c) => c.dataset.tone === 'gray');
    let cx = new Float32Array(chars.length);
    let cy = new Float32Array(chars.length);
    let radius = 150;
    let ready = false;

    const target = { x: 0, y: 0, on: false };
    const lens = { x: 0, y: 0, strength: 0 };
    let raf = 0;
    let running = false;

    // Mede o centro de cada letra sem a lente aplicada
    function measure() {
      chars.forEach((c) => (c.style.transform = ''));
      const base = host!.getBoundingClientRect();
      cx = new Float32Array(chars.length);
      cy = new Float32Array(chars.length);
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        cx[i] = r.left - base.left + r.width / 2;
        cy[i] = r.top - base.top + r.height / 2;
      });
      // A lente acompanha o tamanho do título
      const size = parseFloat(getComputedStyle(title!.querySelector('.hero-line-1')!).fontSize) || 100;
      radius = Math.max(90, Math.min(190, size * 1.6));
      apply();
    }

    function apply() {
      const s = lens.strength;
      const R = radius;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (s < 0.01) {
          if (c.style.transform) {
            c.style.transform = '';
            c.style.color = '';
          }
          continue;
        }
        const dx = cx[i] - lens.x;
        const dy = cy[i] - lens.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d >= R) {
          if (c.style.transform) {
            c.style.transform = '';
            c.style.color = '';
          }
          continue;
        }
        const t = d / R;
        const f = (1 - t) * (1 - t) * s;
        c.style.transform = `translate(${(dx * LENS_PUSH * f).toFixed(2)}px, ${(dy * LENS_PUSH * f).toFixed(2)}px) scale(${(1 + LENS_GROW * f).toFixed(3)})`;
        if (gray[i]) {
          const k = Math.min(1, f * 1.4);
          const [r, g, b] = GRAY.map((v) => Math.round(v * (1 - k)));
          c.style.color = `rgb(${r},${g},${b})`;
        }
      }
    }

    function tick() {
      lens.x += (target.x - lens.x) * LENS_FOLLOW;
      lens.y += (target.y - lens.y) * LENS_FOLLOW;
      const goal = target.on ? 1 : 0;
      lens.strength += (goal - lens.strength) * LENS_FADE;
      apply();
      const settled =
        Math.abs(target.x - lens.x) < 0.3 && Math.abs(target.y - lens.y) < 0.3 && Math.abs(goal - lens.strength) < 0.005;
      if (!settled) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        if (!target.on) {
          lens.strength = 0;
          apply();
        }
      }
    }

    function start() {
      if (!ready || running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function moveTo(clientX: number, clientY: number) {
      const rect = host!.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (lens.strength < 0.02) {
        lens.x = x;
        lens.y = y;
      }
      target.x = x;
      target.y = y;
      target.on = true;
      start();
    }

    function leave() {
      target.on = false;
      start();
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') moveTo(e.clientX, e.clientY);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) moveTo(t.clientX, t.clientY);
    };

    // A lupa só começa depois que todas as palavras terminam de entrar
    const words = title.querySelectorAll('.word-inner');
    const lastWord = words[words.length - 1];
    const becomeReady = () => {
      if (ready) return;
      ready = true;
      title.classList.add('is-ready');
      measure();
      if (target.on) start();
    };
    lastWord?.addEventListener('animationend', becomeReady, { once: true });
    const fallback = window.setTimeout(becomeReady, 2500);

    const ro = new ResizeObserver(() => ready && measure());
    ro.observe(host);
    document.fonts?.ready.then(() => ready && measure());

    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('touchstart', onTouch, { passive: true });
    host.addEventListener('touchmove', onTouch, { passive: true });
    host.addEventListener('touchend', leave, { passive: true });
    host.addEventListener('touchcancel', leave, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      lastWord?.removeEventListener('animationend', becomeReady);
      ro.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('touchstart', onTouch);
      host.removeEventListener('touchmove', onTouch);
      host.removeEventListener('touchend', leave);
      host.removeEventListener('touchcancel', leave);
    };
  }, []);

  let wordIndex = 0;

  return (
    <h1 ref={titleRef} className="hero-title" aria-label={lines.map((l) => l.text).join(' ')}>
      {lines.map((line, li) => {
        const words = line.text.split(' ');
        const node = (
          <span className={`hero-line ${line.className}`}>
            {words.map((word, wi) => {
              const i = wordIndex++;
              return (
                <span key={wi}>
                  <span className="word" aria-hidden="true">
                    <span className="word-inner" style={{ '--i': i } as React.CSSProperties}>
                      {Array.from(word).map((ch, ci) => (
                        <span key={ci} className="char" data-tone={line.tone}>{ch}</span>
                      ))}
                    </span>
                  </span>
                  {wi < words.length - 1 ? ' ' : null}
                </span>
              );
            })}
          </span>
        );
        wordIndex++; // pausa entre as linhas na entrada
        return (
          <Fragment key={li}>
            {node}
            {li < lines.length - 1 ? ' ' : null}
          </Fragment>
        );
      })}
    </h1>
  );
}
