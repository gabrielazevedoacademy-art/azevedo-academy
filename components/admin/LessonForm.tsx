'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateLesson } from '@/app/admin/actions';
import { parseYouTubeId, youtubeEmbed, youtubeWatch } from '@/lib/admin/youtube';
import { Icon, notify, Switch } from './ui';

export type LessonInfo = {
  id: string;
  title: string;
  description: string;
  youtube_id: string | null;
  duration_minutes: number | null;
  is_published: boolean;
  is_free_preview: boolean;
  module_id: string;
};

function Save({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn adm-btn-dark" type="submit" disabled={pending || !dirty}>
      {pending ? 'Salvando…' : 'Salvar aula'}
    </button>
  );
}

export default function LessonForm({ lesson, modules }: { lesson: LessonInfo; modules: { id: string; title: string }[] }) {
  const [state, action] = useActionState(updateLesson, undefined);
  const [dirty, setDirty] = useState(false);
  const [video, setVideo] = useState(lesson.youtube_id ? youtubeWatch(lesson.youtube_id) : '');
  const videoId = parseYouTubeId(video);

  useEffect(() => {
    notify(state);
    if (state?.ok) setDirty(false);
  }, [state]);

  // Avisa antes de sair da página com alterações não salvas
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  return (
    <form action={action} className="adm-form adm-lesson-form" onInput={() => setDirty(true)}>
      <input type="hidden" name="id" value={lesson.id} />

      <section className="adm-panel">
        <div className="adm-field">
          <label htmlFor="l-title">Título da aula</label>
          <input id="l-title" name="title" defaultValue={lesson.title} maxLength={160} required />
        </div>

        <div className="adm-field">
          <label htmlFor="l-video">Vídeo do YouTube</label>
          <input
            id="l-video"
            name="video"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            inputMode="url"
            aria-invalid={!!video && !videoId}
            aria-describedby="l-video-hint"
          />
          <span id="l-video-hint" className={`adm-hint${video && !videoId ? ' adm-hint-error' : ''}`}>
            {video && !videoId
              ? 'Esse link não parece ser de um vídeo do YouTube.'
              : 'Cole o link do vídeo. Deixe como "Não listado" no YouTube para só os alunos acharem.'}
          </span>
        </div>

        <div className="adm-video" data-empty={!videoId}>
          {videoId ? (
            <iframe
              src={youtubeEmbed(videoId)}
              title="Prévia do vídeo"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <span>
              {Icon.play}
              A prévia do vídeo aparece aqui
            </span>
          )}
        </div>

        <div className="adm-field">
          <label htmlFor="l-desc">Descrição</label>
          <textarea
            id="l-desc"
            name="description"
            defaultValue={lesson.description}
            rows={7}
            placeholder="O que o aluno vai ver nesta aula, links citados, observações"
          />
        </div>
      </section>

      <section className="adm-panel">
        <h2 className="adm-section-title">Configurações</h2>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="l-module">Módulo</label>
            <select id="l-module" name="module_id" defaultValue={lesson.module_id}>
              {modules.map((m, i) => (
                <option key={m.id} value={m.id}>
                  {`Módulo ${i + 1}: ${m.title}`}
                </option>
              ))}
            </select>
          </div>
          <div className="adm-field">
            <label htmlFor="l-duration">Duração (minutos)</label>
            <input
              id="l-duration"
              name="duration"
              type="number"
              min={0}
              max={1440}
              inputMode="numeric"
              defaultValue={lesson.duration_minutes ?? ''}
              placeholder="Opcional"
            />
          </div>
        </div>
        <div className="adm-switches">
          <Switch name="is_published" defaultChecked={lesson.is_published} label="Publicada para os alunos" />
          <Switch
            name="is_free_preview"
            defaultChecked={lesson.is_free_preview}
            label="Amostra grátis (quem não comprou também assiste)"
          />
        </div>
      </section>

      <div className="adm-savebar" data-dirty={dirty}>
        <span>{dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}</span>
        <Save dirty={dirty} />
      </div>
    </form>
  );
}
