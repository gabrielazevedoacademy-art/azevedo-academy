'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { COMPLETE_AT, countWatched, createBitmap, decodeBitmap, encodeBitmap, mark } from '@/lib/progress';

/*
  Player do YouTube que acompanha o que foi realmente assistido.
  A cada segundo de reprodução, marca o trecho visto. Pular partes não conta.
  Com 95% do vídeo assistido, a aula vira "concluída" e isso fica salvo na conta.
*/

type YTPlayer = {
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer; PlayerState: Record<string, number> };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytLoader: Promise<void> | null = null;
function loadYouTube() {
  if (window.YT?.Player) return Promise.resolve();
  if (!ytLoader) {
    ytLoader = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      document.head.appendChild(s);
    });
  }
  return ytLoader;
}

export type SavedProgress = { watched: string; durationSeconds: number | null; completed: boolean } | null;

export default function VideoPlayer({
  userId,
  lessonId,
  youtubeId,
  saved,
  onProgress,
  onComplete
}: {
  userId: string;
  lessonId: string;
  youtubeId: string;
  saved: SavedProgress;
  onProgress: (ratio: number) => void;
  onComplete: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef({ onProgress, onComplete });
  cb.current = { onProgress, onComplete };

  useEffect(() => {
    let player: YTPlayer | null = null;
    let bits: Uint8Array | null = null;
    let duration = 0;
    let last: number | null = null;
    let dirty = false;
    let completed = Boolean(saved?.completed);
    const doneBefore = completed; // aula já concluída antes: nada mais a salvar
    let saving = false;
    let disposed = false;
    const supabase = createClient();

    async function save(complete = false) {
      if (doneBefore || !bits || !duration || saving || (!dirty && !complete)) return;
      saving = true;
      dirty = false;
      const row: Record<string, unknown> = {
        user_id: userId,
        lesson_id: lessonId,
        watched: encodeBitmap(bits),
        watched_seconds: countWatched(bits, duration),
        duration_seconds: duration
      };
      if (complete) row.completed_at = new Date().toISOString();
      const { error } = await supabase.from('lesson_progress').upsert(row, { onConflict: 'user_id,lesson_id' });
      if (error) dirty = true;
      saving = false;
    }

    function tick() {
      if (!player || !bits || !duration || player.getPlayerState() !== 1) {
        last = null;
        return;
      }
      const t = Math.floor(player.getCurrentTime());
      // Reprodução contínua (inclusive acelerada) marca o trecho; um salto marca só o ponto novo
      if (last !== null && t > last && t - last <= 3) for (let s = last + 1; s <= t; s++) mark(bits, s);
      else mark(bits, t);
      last = t;
      dirty = true;
      const ratio = countWatched(bits, duration) / duration;
      cb.current.onProgress(ratio);
      if (!completed && ratio >= COMPLETE_AT) {
        completed = true;
        save(true).then(() => cb.current.onComplete());
      }
    }

    const interval = window.setInterval(tick, 1000);
    const autosave = window.setInterval(() => save(), 10000);
    const onHide = () => save();
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onHide);

    loadYouTube().then(() => {
      if (disposed || !box.current || !window.YT) return;
      player = new window.YT.Player(box.current, {
        videoId: youtubeId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3 },
        events: {
          onReady: () => {
            duration = Math.floor(player?.getDuration() || 0);
            if (!duration) return;
            bits =
              saved && saved.durationSeconds === duration ? decodeBitmap(saved.watched, duration) : createBitmap(duration);
            cb.current.onProgress(countWatched(bits, duration) / duration);
          },
          onStateChange: (e: { data: number }) => {
            // pausou ou terminou: salva na hora
            if (e.data === 2 || e.data === 0) {
              tick();
              save();
            }
          }
        }
      });
    });

    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.clearInterval(autosave);
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onHide);
      save();
      player?.destroy();
    };
    // Um player por aula
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, youtubeId]);

  return (
    <div className="course-video">
      <div ref={box} />
    </div>
  );
}
