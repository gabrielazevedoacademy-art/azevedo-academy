'use client';

import { useEffect, useRef } from 'react';

/*
  Campo de pontos do hero com efeito lupa.
  Em repouso, os pontos ficam parados e discretos. Onde o cursor (ou o dedo) passa,
  uma lente suave amplia a malha: os pontos se afastam do centro e crescem um pouco.
  A lente segue o ponteiro com leve atraso e aparece/some aos poucos, sem trancos.
*/

const LENS_FOLLOW = 0.2; // quanto a lente se aproxima do ponteiro a cada quadro (0 a 1)
const LENS_FADE = 0.12; // velocidade de entrada e saída da lente
const LENS_PUSH = 0.55; // intensidade da ampliação
const LENS_GROW = 1.1; // quanto os pontos crescem no centro da lente

export default function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let gap = 28;
    let baseRadius = 1.3;
    let lensRadius = 150;
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);

    // Posição do ponteiro (alvo) e da lente (suavizada)
    const target = { x: 0, y: 0, on: false };
    const lens = { x: 0, y: 0, strength: 0 };

    let raf = 0;
    let running = false;
    let visible = true;

    function layout() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      gap = width < 640 ? 22 : width < 1100 ? 26 : 30;
      baseRadius = width < 640 ? 1.1 : 1.3;
      lensRadius = width < 640 ? 110 : 160;

      const cols = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      const ox = (width - (cols - 1) * gap) / 2;
      const oy = (height - (rows - 1) * gap) / 2;
      xs = new Float32Array(cols * rows);
      ys = new Float32Array(cols * rows);
      let k = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          xs[k] = ox + c * gap;
          ys[k] = oy + r * gap;
          k++;
        }
      }
    }

    // Suaviza os pontos atrás do título para manter a leitura confortável
    function drawVeil() {
      const rx = Math.min(width * 0.46, 620);
      const ry = Math.min(height * 0.32, 280);
      ctx!.save();
      ctx!.translate(width / 2, height / 2);
      ctx!.scale(1, ry / rx);
      const g = ctx!.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, 'rgba(255,255,255,0.86)');
      g.addColorStop(0.6, 'rgba(255,255,255,0.6)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx!.fillStyle = g;
      ctx!.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx!.restore();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      const n = xs.length;
      const R = lensRadius;
      const R2 = R * R;
      const s = lens.strength;
      const lensActive = s > 0.01;

      // Pontos fora da lente: uma única passada
      ctx!.fillStyle = 'rgba(0,0,0,0.2)';
      ctx!.beginPath();
      for (let i = 0; i < n; i++) {
        const x = xs[i];
        const y = ys[i];
        if (lensActive) {
          const dx = x - lens.x;
          const dy = y - lens.y;
          if (dx * dx + dy * dy < R2) continue;
        }
        ctx!.moveTo(x + baseRadius, y);
        ctx!.arc(x, y, baseRadius, 0, Math.PI * 2);
      }
      ctx!.fill();

      // Pontos dentro da lente: ampliados, um a um
      if (lensActive) {
        for (let i = 0; i < n; i++) {
          const dx = xs[i] - lens.x;
          const dy = ys[i] - lens.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= R2) continue;
          const t = Math.sqrt(d2) / R; // 0 no centro, 1 na borda
          const falloff = (1 - t) * (1 - t);
          // Afasta o ponto do centro, como uma lente de aumento
          const scale = 1 + LENS_PUSH * falloff * s;
          const x = lens.x + dx * scale;
          const y = lens.y + dy * scale;
          const r = baseRadius * (1 + LENS_GROW * falloff * s);
          const a = 0.2 + 0.5 * falloff * s;
          ctx!.fillStyle = `rgba(0,0,0,${a.toFixed(3)})`;
          ctx!.beginPath();
          ctx!.arc(x, y, r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      drawVeil();
    }

    function tick() {
      lens.x += (target.x - lens.x) * LENS_FOLLOW;
      lens.y += (target.y - lens.y) * LENS_FOLLOW;
      const goal = target.on ? 1 : 0;
      lens.strength += (goal - lens.strength) * LENS_FADE;

      draw();

      const settled =
        Math.abs(target.x - lens.x) < 0.3 &&
        Math.abs(target.y - lens.y) < 0.3 &&
        Math.abs(goal - lens.strength) < 0.005;

      if (!settled && visible) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        if (!target.on) {
          lens.strength = 0;
          draw();
        }
      }
    }

    function start() {
      if (reduceMotion || running || !visible) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function moveTo(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= width && y <= height;
      // Ao entrar, a lente nasce no ponteiro em vez de deslizar de longe
      if (inside && lens.strength < 0.02) {
        lens.x = x;
        lens.y = y;
      }
      target.x = x;
      target.y = y;
      target.on = inside;
      start();
    }

    function leave() {
      target.on = false;
      start();
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      moveTo(e.clientX, e.clientY);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) moveTo(t.clientX, t.clientY);
    };

    layout();
    draw();

    const ro = new ResizeObserver(() => {
      layout();
      draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(host);

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      if (visible) start();
    };

    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('touchstart', onTouch, { passive: true });
    host.addEventListener('touchmove', onTouch, { passive: true });
    host.addEventListener('touchend', leave, { passive: true });
    host.addEventListener('touchcancel', leave, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('touchstart', onTouch);
      host.removeEventListener('touchmove', onTouch);
      host.removeEventListener('touchend', leave);
      host.removeEventListener('touchcancel', leave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="dot-field" aria-hidden="true" />;
}
