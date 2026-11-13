'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/*
  Arrastar para reordenar (mouse e toque).
  - Mouse: clique e arraste o item.
  - Celular: segure o item por um instante e arraste.
  Os outros itens deslizam para abrir espaço; ao soltar, a nova ordem é salva.
  Os filhos diretos do container precisam ter data-sort-id.
*/

type Drag = {
  id: string;
  startY: number;
  touch: boolean;
  started: boolean;
  timer: number;
};

export function useSortable<T>({
  items,
  getId,
  onChange,
  onCommit
}: {
  items: T[];
  getId: (item: T) => string;
  onChange: (items: T[]) => void;
  onCommit: (items: T[]) => void;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const drag = useRef<Drag | null>(null);
  const latest = useRef({ items, getId, onChange, onCommit });
  latest.current = { items, getId, onChange, onCommit };
  const before = useRef<Map<string, number> | null>(null);

  const children = () =>
    Array.from(containerRef.current?.children ?? []).filter((el): el is HTMLElement =>
      Boolean((el as HTMLElement).dataset?.sortId)
    );

  // Animação dos itens que trocaram de lugar
  useLayoutEffect(() => {
    const prev = before.current;
    before.current = null;
    if (!prev) return;
    for (const el of children()) {
      const top = prev.get(el.dataset.sortId!);
      if (top === undefined) continue;
      const dy = top - el.getBoundingClientRect().top;
      if (Math.abs(dy) > 1)
        el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], {
          duration: 220,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
        });
    }
  }, [items]);

  const moveTo = useCallback((clientY: number) => {
    const d = drag.current;
    if (!d) return;
    const { items: list, getId: id, onChange: change } = latest.current;
    const els = children();
    const from = list.findIndex((t) => id(t) === d.id);
    if (from < 0) return;
    // Posição nova = quantos outros itens têm o meio acima do ponteiro
    let to = 0;
    for (const el of els) {
      if (el.dataset.sortId === d.id) continue;
      const r = el.getBoundingClientRect();
      if (clientY > r.top + r.height / 2) to++;
    }
    if (to === from) return;
    before.current = new Map(els.map((el) => [el.dataset.sortId!, el.getBoundingClientRect().top]));
    const next = list.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    change(next);
  }, []);

  const handle = useCallback(
    (id: string) => ({
      onDragStart: (e: React.DragEvent) => e.preventDefault(),
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (e.button !== 0 || drag.current) return;
        if ((e.target as HTMLElement).closest('button, input, textarea, select, [data-no-drag]')) return;
        e.stopPropagation(); // item dentro de outro item (aula dentro de módulo)
        const touch = e.pointerType !== 'mouse';
        const d: Drag = { id, startY: e.clientY, touch, started: false, timer: 0 };
        drag.current = d;

        const preventScroll = (ev: TouchEvent) => ev.cancelable && ev.preventDefault();
        const preventMenu = (ev: Event) => ev.preventDefault();

        const begin = () => {
          d.started = true;
          setDragging(id);
          document.body.classList.add('is-sorting');
          document.addEventListener('touchmove', preventScroll, { passive: false });
          document.addEventListener('contextmenu', preventMenu);
          if (touch) navigator.vibrate?.(12);
        };

        const onMove = (ev: PointerEvent) => {
          const dy = Math.abs(ev.clientY - d.startY);
          if (!d.started) {
            if (touch) {
              if (dy > 8) finish(); // mexeu antes de segurar: é rolagem
            } else if (dy > 6) begin();
            return;
          }
          ev.preventDefault();
          moveTo(ev.clientY);
          // Rola a página perto das bordas
          if (ev.clientY < 90) window.scrollBy(0, -14);
          else if (ev.clientY > window.innerHeight - 90) window.scrollBy(0, 14);
        };

        const finish = () => {
          window.clearTimeout(d.timer);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', finish);
          window.removeEventListener('pointercancel', finish);
          document.removeEventListener('touchmove', preventScroll);
          document.removeEventListener('contextmenu', preventMenu);
          drag.current = null;
          if (!d.started) return;
          setDragging(null);
          document.body.classList.remove('is-sorting');
          // Soltar em cima de um link não deve abrir o link
          const stop = (ev: Event) => {
            ev.preventDefault();
            ev.stopPropagation();
          };
          window.addEventListener('click', stop, true);
          window.setTimeout(() => window.removeEventListener('click', stop, true), 0);
          latest.current.onCommit(latest.current.items);
        };

        if (touch) d.timer = window.setTimeout(begin, 300);
        window.addEventListener('pointermove', onMove, { passive: false });
        window.addEventListener('pointerup', finish);
        window.addEventListener('pointercancel', finish);
      }
    }),
    [moveTo]
  );

  return { containerRef, dragging, handle };
}
