'use client';

import { useEffect, useRef } from 'react';

/*
  Campo de pontos do hero.
  Em repouso, os pontos ficam parados e discretos. Ao mover o mouse (ou o dedo),
  ondas circulares partem do ponteiro e deslocam os pontos por onde passam.
  Pontos mais agitados crescem, escurecem e, no pico, ganham o laranja da marca.
*/

type Ripple = { x: number; y: number; t: number; s: number };

const WAVE_SPEED = 0.55; // px por ms
const WAVE_WIDTH = 36; // largura da frente de onda, em px
const WAVE_LIFE = 1700; // ms
const WAVE_AMP = 6; // deslocamento máximo, em px
const HOVER_RADIUS = 110;
const MAX_RIPPLES = 16;
const LEVELS = 6;

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
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let levelOf = new Uint8Array(0);
    let offX = new Float32Array(0);
    let offY = new Float32Array(0);

    const ripples: Ripple[] = [];
    const pointer = { x: -1e5, y: -1e5, inside: false, lastX: -1e5, lastY: -1e5, lastT: 0 };

    let raf = 0;
    let running = false;
    let visible = true;
    let lastMoveAt = 0;

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

      const cols = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      const ox = (width - (cols - 1) * gap) / 2;
      const oy = (height - (rows - 1) * gap) / 2;
      const n = cols * rows;
      xs = new Float32Array(n);
      ys = new Float32Array(n);
      offX = new Float32Array(n);
      offY = new Float32Array(n);
      levelOf = new Uint8Array(n);
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
      const cx = width / 2;
      const cy = height / 2;
      const rx = Math.min(width * 0.46, 620);
      const ry = Math.min(height * 0.32, 280);
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.scale(1, ry / rx);
      const g = ctx!.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, 'rgba(255,255,255,0.86)');
      g.addColorStop(0.6, 'rgba(255,255,255,0.6)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx!.fillStyle = g;
      ctx!.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx!.restore();
    }

    function compute(now: number) {
      const n = xs.length;
      const hoverR2 = HOVER_RADIUS * HOVER_RADIUS;
      for (let i = 0; i < n; i++) {
        const x = xs[i];
        const y = ys[i];
        let dx = 0;
        let dy = 0;
        let energy = 0;

        for (let j = 0; j < ripples.length; j++) {
          const rp = ripples[j];
          const age = now - rp.t;
          const vx = x - rp.x;
          const vy = y - rp.y;
          const d = Math.sqrt(vx * vx + vy * vy) || 1;
          const diff = d - age * WAVE_SPEED;
          if (diff > WAVE_WIDTH * 2.6 || diff < -WAVE_WIDTH * 2.6) continue;
          const envelope = Math.exp(-(diff * diff) / (2 * WAVE_WIDTH * WAVE_WIDTH));
          const fade = 1 - age / WAVE_LIFE;
          const k = envelope * fade * fade * rp.s;
          const push = Math.sin(diff * 0.11) * WAVE_AMP * k;
          dx += (vx / d) * push;
          dy += (vy / d) * push;
          // A intensidade usa a onda mais forte (e não a soma), para o rastro não saturar
          if (k > energy) energy = k;
        }

        if (pointer.inside) {
          const vx = x - pointer.x;
          const vy = y - pointer.y;
          const d2 = vx * vx + vy * vy;
          if (d2 < hoverR2) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / HOVER_RADIUS;
            const push = f * f * 8;
            dx += (vx / d) * push;
            dy += (vy / d) * push;
            energy = Math.max(energy, f * f * 0.62);
          }
        }

        offX[i] = dx;
        offY[i] = dy;
        const lvl = Math.min(LEVELS - 1, Math.floor(Math.pow(energy, 1.5) * LEVELS));
        levelOf[i] = lvl < 0 ? 0 : lvl;
      }
    }

    function colorFor(level: number) {
      if (level === 0) return 'rgba(0,0,0,0.2)';
      if (level >= LEVELS - 1) return 'rgba(255,122,0,0.9)';
      const a = 0.24 + (level / (LEVELS - 1)) * 0.5;
      return `rgba(0,0,0,${a.toFixed(2)})`;
    }

    function draw(now: number, animate: boolean) {
      ctx!.clearRect(0, 0, width, height);
      if (animate) compute(now);

      const n = xs.length;
      // Camada base
      ctx!.fillStyle = colorFor(0);
      ctx!.beginPath();
      for (let i = 0; i < n; i++) {
        if (levelOf[i] !== 0) continue;
        const x = xs[i] + offX[i];
        const y = ys[i] + offY[i];
        ctx!.moveTo(x + baseRadius, y);
        ctx!.arc(x, y, baseRadius, 0, Math.PI * 2);
      }
      ctx!.fill();

      // Pontos em movimento, por intensidade
      for (let lvl = 1; lvl < LEVELS; lvl++) {
        const r = baseRadius * (1 + lvl * 0.28);
        ctx!.fillStyle = colorFor(lvl);
        ctx!.beginPath();
        let any = false;
        for (let i = 0; i < n; i++) {
          if (levelOf[i] !== lvl) continue;
          any = true;
          const x = xs[i] + offX[i];
          const y = ys[i] + offY[i];
          ctx!.moveTo(x + r, y);
          ctx!.arc(x, y, r, 0, Math.PI * 2);
        }
        if (any) ctx!.fill();
      }

      drawVeil();
    }

    function tick(now: number) {
      while (ripples.length && now - ripples[0].t > WAVE_LIFE) ripples.shift();
      draw(now, true);
      const pointerMoving = pointer.inside && now - lastMoveAt < 120;
      if ((ripples.length || pointerMoving) && visible) {
        raf = requestAnimationFrame(tick);
      } else {
        // Sem ondas ativas: desenha um quadro final e para o loop até o próximo movimento
        running = false;
        if (!pointer.inside) {
          offX.fill(0);
          offY.fill(0);
          levelOf.fill(0);
          draw(now, false);
        }
      }
    }

    function start() {
      if (reduceMotion || running || !visible) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function spawn(x: number, y: number, strength: number) {
      if (reduceMotion) return;
      ripples.push({ x, y, t: performance.now(), s: strength });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
      start();
    }

    function local(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function onMove(clientX: number, clientY: number) {
      const p = local(clientX, clientY);
      const now = performance.now();
      lastMoveAt = now;
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.inside = p.x >= 0 && p.y >= 0 && p.x <= width && p.y <= height;
      const dist = Math.hypot(p.x - pointer.lastX, p.y - pointer.lastY);
      if (dist > 34) {
        const dt = Math.max(16, now - pointer.lastT);
        const speed = dist / dt; // px por ms
        const strength = Math.min(1, Math.max(0.5, speed * 0.9));
        if (pointer.lastT && dist < 400) spawn(p.x, p.y, strength);
        pointer.lastX = p.x;
        pointer.lastY = p.y;
        pointer.lastT = now;
      }
      start();
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      onMove(e.clientX, e.clientY);
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      pointer.lastT = 0;
      start();
    };
    const onPointerDown = (e: PointerEvent) => {
      const p = local(e.clientX, e.clientY);
      spawn(p.x, p.y, 1);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      pointer.inside = false;
      pointer.lastT = 0;
    };

    layout();
    draw(performance.now(), false);

    const ro = new ResizeObserver(() => {
      layout();
      draw(performance.now(), running);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && (ripples.length || pointer.inside)) start();
    });
    io.observe(host);

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      if (visible) start();
    };

    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', onPointerLeave);
    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('touchmove', onTouchMove, { passive: true });
    host.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    // Uma onda de abertura, partindo do centro, junto com a entrada do título
    const intro = window.setTimeout(() => spawn(width / 2, height / 2, 1), 450);

    return () => {
      window.clearTimeout(intro);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('touchmove', onTouchMove);
      host.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="dot-field" aria-hidden="true" />;
}
