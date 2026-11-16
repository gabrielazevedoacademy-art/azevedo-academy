'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { COMPLETE_AT, countWatched, createBitmap, decodeBitmap, encodeBitmap, mark } from '@/lib/progress';

/*
  Player do YouTube que acompanha o que foi realmente assistido.
  A cada segundo de reprodução, marca o trecho visto. Pular partes não conta.
  Com 95% do vídeo assistido, a aula vira "concluída" e isso fica salvo na conta.
  Também guarda o ponto do vídeo, para o aluno continuar de onde parou.
*/

type YTPlayer = {
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
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

export type SavedProgress = {
  watched: string;
  durationSeconds: number | null;
  completed: boolean;
  lastPosition: number;
} | null;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// Retoma só se a pessoa parou depois dos primeiros segundos e antes do fim
const resumeFrom = (saved: SavedProgress) => {
  const pos = saved?.lastPosition ?? 0;
  const end = saved?.durationSeconds ?? 0;
  return pos >= 10 && (!end || pos < end - 15) ? pos : 0;
};

export default function VideoPlayer({
  userId,
  lessonId,
  youtubeId,
  saved,
  onProgress,
  onComplete,
  onEnded
}: {
  userId: string;
  lessonId: string;
  youtubeId: string;
  saved: SavedProgress;
  onProgress: (ratio: number) => void;
  onComplete: () => void;
  onEnded?: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const cb = useRef({ onProgress, onComplete, onEnded });
  cb.current = { onProgress, onComplete, onEnded };
  const [resumedAt, setResumedAt] = useState(() => resumeFrom(saved));

  useEffect(() => {
    let player: YTPlayer | null = null;
    let bits: Uint8Array | null = null;
    let duration = 0;
    let last: number | null = null;
    let dirty = false;
    let position = resumeFrom(saved);
    let positionDirty = false;
    let completed = Boolean(saved?.completed);
    const doneBefore = completed; // aula já concluída antes: nada mais a salvar
    let saving = false;
    let disposed = false;
    const supabase = createClient();

    async function save(complete = false) {
      if (saving || !duration) return;
      // Aula já concluída: só o ponto do vídeo muda. Senão, o trecho assistido também.
      const sendWatched = !doneBefore && bits && (dirty || complete);
      if (!sendWatched && !positionDirty) return;
      saving = true;
      const row: Record<string, unknown> = { user_id: userId, lesson_id: lessonId, last_position: position };
      if (sendWatched && bits) {
        row.watched = encodeBitmap(bits);
        row.watched_seconds = countWatched(bits, duration);
        row.duration_seconds = duration;
        if (complete) row.completed_at = new Date().toISOString();
      }
      dirty = false;
      positionDirty = false;
      const { error } = await supabase.from('lesson_progress').upsert(row, { onConflict: 'user_id,lesson_id' });
      if (error) {
        dirty = Boolean(sendWatched);
        positionDirty = true;
      }
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
      if (t !== position) {
        position = t;
        positionDirty = true;
      }
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
      const start = resumeFrom(saved);
      player = new window.YT.Player(box.current, {
        videoId: youtubeId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, ...(start ? { start } : {}) },
        events: {
          onReady: () => {
            playerRef.current = player;
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
              // Terminou: da próxima vez começa do início
              if (e.data === 0) {
                position = 0;
                positionDirty = true;
              }
              save();
            }
            if (e.data === 1) window.setTimeout(() => setResumedAt(0), 6000);
            if (e.data === 0) cb.current.onEnded?.();
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
      playerRef.current = null;
      player?.destroy();
    };
    // Um player por aula
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, youtubeId]);

  return (
    <div className="course-video">
      <div ref={box} />
      {resumedAt > 0 && (
        <div className="course-resume" role="status">
          Continuando de {clock(resumedAt)}.
          <button
            type="button"
            onClick={() => {
              playerRef.current?.seekTo(0, true);
              setResumedAt(0);
            }}
          >
            Ver do início
          </button>
        </div>
      )}
    </div>
  );
}
