// Campo de pontos interativo do hero: o cursor empurra os pontos e deixa ondas que se espalham.
type Onda = { x: number; y: number; t: number; forca: number };

export function iniciarPontos(canvas: HTMLCanvasElement) {
  const area = canvas.parentElement as HTMLElement;
  const ctx = canvas.getContext('2d');
  if (!ctx || !area) return;
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1, esp = 22;
  let base = new Float32Array(0);
  let desl = new Float32Array(0);
  const ondas: Onda[] = [];
  const ponteiro = { x: -1e4, y: -1e4, ativo: false };
  let ultimaOnda = { x: -1e4, y: -1e4, t: 0 };
  let rodando = false;
  let visivel = true;

  const CINZA = [190, 190, 197];
  const MARCA = [255, 122, 26];

  function montar() {
    const r = area.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(r.width); H = Math.round(r.height);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    esp = W < 640 ? 20 : 24;
    const cols = Math.ceil(W / esp) + 1, lins = Math.ceil(H / esp) + 1;
    const ox = (W - (cols - 1) * esp) / 2, oy = (H - (lins - 1) * esp) / 2;
    base = new Float32Array(cols * lins * 2);
    desl = new Float32Array(cols * lins * 2);
    let i = 0;
    for (let rr = 0; rr < lins; rr++) for (let c = 0; c < cols; c++) { base[i++] = ox + c * esp; base[i++] = oy + rr * esp; }
    desenhar(performance.now());
  }

  function desenhar(t: number) {
    ctx!.clearRect(0, 0, W, H);
    let energia = 0;
    for (let k = ondas.length - 1; k >= 0; k--) if (t - ondas[k].t > 2600) ondas.splice(k, 1);

    const inativos = new Path2D();
    const ativos: number[] = [];
    for (let i = 0; i < base.length; i += 2) {
      const bx = base[i], by = base[i + 1];
      let vx = 0, vy = 0;
      if (ponteiro.ativo) {
        const dx = bx - ponteiro.x, dy = by - ponteiro.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 32000) {
          const d = Math.sqrt(d2) || 1;
          const f = 11 * Math.exp(-d2 / 9000);
          vx += (dx / d) * f; vy += (dy / d) * f;
        }
      }
      for (let k = 0; k < ondas.length; k++) {
        const o = ondas[k];
        const idade = (t - o.t) / 1000;
        const raio = idade * 380;
        const dx = bx - o.x, dy = by - o.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const faixa = d - raio;
        if (faixa > 90 || faixa < -90) continue;
        const env = Math.exp(-(faixa * faixa) / 1500) * Math.exp(-idade * 1.5) * o.forca;
        const a = Math.sin(faixa / 12) * 9 * env;
        vx += (dx / d) * a; vy += (dy / d) * a;
      }
      desl[i] += (vx - desl[i]) * 0.2;
      desl[i + 1] += (vy - desl[i + 1]) * 0.2;
      const m = Math.abs(desl[i]) + Math.abs(desl[i + 1]);
      if (m > energia) energia = m;
      const x = bx + desl[i], y = by + desl[i + 1];
      if (m < 0.25) { inativos.moveTo(x + 1, y); inativos.arc(x, y, 1, 0, Math.PI * 2); }
      else ativos.push(x, y, m);
    }
    ctx!.fillStyle = `rgb(${CINZA.join(',')})`;
    ctx!.fill(inativos);
    for (let j = 0; j < ativos.length; j += 3) {
      const k = Math.min(1, ativos[j + 2] / 9);
      const cor = CINZA.map((c, n) => Math.round(c + (MARCA[n] - c) * k * 0.85));
      ctx!.fillStyle = `rgb(${cor.join(',')})`;
      ctx!.beginPath();
      ctx!.arc(ativos[j], ativos[j + 1], 1 + k * 1.4, 0, Math.PI * 2);
      ctx!.fill();
    }
    return energia;
  }

  function quadro(t: number) {
    const energia = desenhar(t);
    if (visivel && (ondas.length || ponteiro.ativo || energia > 0.05)) requestAnimationFrame(quadro);
    else rodando = false;
  }
  function acordar() {
    if (reduzido || rodando || !visivel) return;
    rodando = true;
    requestAnimationFrame(quadro);
  }
  function onda(x: number, y: number, forca = 1) {
    ondas.push({ x, y, t: performance.now(), forca });
    if (ondas.length > 14) ondas.shift();
    acordar();
  }
  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  area.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const p = local(e);
    ponteiro.x = p.x; ponteiro.y = p.y; ponteiro.ativo = true;
    const dx = p.x - ultimaOnda.x, dy = p.y - ultimaOnda.y;
    const agora = performance.now();
    if (dx * dx + dy * dy > 3600 && agora - ultimaOnda.t > 110) {
      ultimaOnda = { x: p.x, y: p.y, t: agora };
      onda(p.x, p.y, 0.7);
    }
    acordar();
  }, { passive: true });
  area.addEventListener('pointerleave', () => { ponteiro.ativo = false; acordar(); });
  area.addEventListener('pointerdown', (e) => { const p = local(e); onda(p.x, p.y, 1.4); }, { passive: true });

  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) acordar(); }).observe(area);
  let rt = 0;
  new ResizeObserver(() => { cancelAnimationFrame(rt); rt = requestAnimationFrame(montar); }).observe(area);

  montar();
  if (!reduzido) setTimeout(() => onda(W / 2, H * 0.45, 1.6), 250);
}
