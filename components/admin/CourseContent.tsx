'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  createLesson,
  createModule,
  deleteModule,
  reorderLessons,
  reorderModules,
  setLessonPublished,
  updateModule
} from '@/app/admin/actions';
import { plural, publicImage } from '@/lib/admin/storage';
import { youtubeThumb } from '@/lib/admin/youtube';
import { ConfirmButton, Icon, notify, QuickAdd } from './ui';

export type LessonItem = {
  id: string;
  title: string;
  is_published: boolean;
  is_free_preview: boolean;
  thumbnail_path: string | null;
  youtube_id: string | null;
  duration_minutes: number | null;
  materials: number;
};

export type ModuleItem = { id: string; title: string; is_published: boolean; lessons: LessonItem[] };

type Drag = { kind: 'module'; id: string } | { kind: 'lesson'; id: string; moduleId: string } | null;

function move<T>(list: T[], from: number, to: number) {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function CourseContent({ courseId, modules: initial }: { courseId: string; modules: ModuleItem[] }) {
  const [modules, setModules] = useState(initial);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState<string | null>(null);
  const [addingModule, setAddingModule] = useState(initial.length === 0);
  const [, start] = useTransition();
  const drag = useRef<Drag>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  // Sempre que o servidor devolver dados novos, eles passam a valer
  useEffect(() => setModules(initial), [initial]);

  const saveModuleOrder = (list: ModuleItem[]) =>
    start(async () => {
      const r = await reorderModules(courseId, list.map((m) => m.id));
      if (r?.error) notify(r);
    });

  const saveLessonOrder = (moduleId: string, list: LessonItem[]) =>
    start(async () => {
      const r = await reorderLessons(moduleId, list.map((l) => l.id));
      if (r?.error) notify(r);
    });

  function shiftModule(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= modules.length) return;
    const next = move(modules, index, to);
    setModules(next);
    saveModuleOrder(next);
  }

  function shiftLesson(mi: number, li: number, dir: -1 | 1) {
    const lessons = modules[mi].lessons;
    const to = li + dir;
    if (to < 0 || to >= lessons.length) return;
    const nextLessons = move(lessons, li, to);
    setModules(modules.map((m, i) => (i === mi ? { ...m, lessons: nextLessons } : m)));
    saveLessonOrder(modules[mi].id, nextLessons);
  }

  // Arrastar e soltar (computador): reordena ao passar por cima e salva ao soltar
  function overModule(targetId: string) {
    const d = drag.current;
    if (d?.kind !== 'module' || d.id === targetId) return;
    const from = modules.findIndex((m) => m.id === d.id);
    const to = modules.findIndex((m) => m.id === targetId);
    if (from >= 0 && to >= 0) setModules(move(modules, from, to));
  }

  function overLesson(moduleId: string, targetId: string) {
    const d = drag.current;
    if (d?.kind !== 'lesson' || d.moduleId !== moduleId || d.id === targetId) return;
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        const from = m.lessons.findIndex((l) => l.id === d.id);
        const to = m.lessons.findIndex((l) => l.id === targetId);
        return from >= 0 && to >= 0 ? { ...m, lessons: move(m.lessons, from, to) } : m;
      })
    );
  }

  function endDrag() {
    const d = drag.current;
    drag.current = null;
    setDragging(null);
    if (!d) return;
    if (d.kind === 'module') saveModuleOrder(modules);
    else {
      const m = modules.find((x) => x.id === d.moduleId);
      if (m) saveLessonOrder(m.id, m.lessons);
    }
  }

  function togglePublished(moduleId: string, lessonId: string, value: boolean) {
    setModules(
      modules.map((m) =>
        m.id !== moduleId ? m : { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, is_published: value } : l)) }
      )
    );
    start(async () => notify(await setLessonPublished(lessonId, value)));
  }

  return (
    <div className="adm-content">
      {modules.length === 0 && !addingModule && (
        <div className="adm-empty">
          <p>Este curso ainda não tem módulos. Comece criando o primeiro.</p>
        </div>
      )}

      <ol className="adm-modules">
        {modules.map((mod, mi) => {
          const isCollapsed = collapsed[mod.id];
          return (
            <li
              key={mod.id}
              className="adm-module"
              data-dragging={dragging === mod.id}
              data-hidden={!mod.is_published}
              onDragOver={(e) => {
                if (drag.current?.kind !== 'module') return;
                e.preventDefault();
                overModule(mod.id);
              }}
              onDrop={(e) => e.preventDefault()}
            >
              <ModuleHead
                mod={mod}
                index={mi}
                total={modules.length}
                collapsed={!!isCollapsed}
                onToggle={() => setCollapsed({ ...collapsed, [mod.id]: !isCollapsed })}
                onShift={(dir) => shiftModule(mi, dir)}
                onDragStart={() => {
                  drag.current = { kind: 'module', id: mod.id };
                  setDragging(mod.id);
                }}
                onDragEnd={endDrag}
                onChange={(patch) => setModules(modules.map((m) => (m.id === mod.id ? { ...m, ...patch } : m)))}
              />

              {!isCollapsed && (
                <div className="adm-module-body">
                  {mod.lessons.length > 0 && (
                    <ol className="adm-lessons">
                      {mod.lessons.map((lesson, li) => {
                        const thumb = publicImage(lesson.thumbnail_path) ?? (lesson.youtube_id ? youtubeThumb(lesson.youtube_id) : null);
                        return (
                          <li
                            key={lesson.id}
                            className="adm-lesson"
                            data-dragging={dragging === lesson.id}
                            data-hidden={!lesson.is_published}
                            onDragOver={(e) => {
                              if (drag.current?.kind !== 'lesson') return;
                              e.preventDefault();
                              e.stopPropagation();
                              overLesson(mod.id, lesson.id);
                            }}
                            onDrop={(e) => e.preventDefault()}
                          >
                            <span
                              className="adm-grip"
                              draggable
                              title="Arraste para reordenar"
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', lesson.id);
                                const row = (e.currentTarget as HTMLElement).closest('li');
                                if (row) e.dataTransfer.setDragImage(row, 24, 24);
                                drag.current = { kind: 'lesson', id: lesson.id, moduleId: mod.id };
                                setDragging(lesson.id);
                              }}
                              onDragEnd={endDrag}
                            >
                              {Icon.grip}
                            </span>
                            <a className="adm-lesson-link" href={`/admin/aulas/${lesson.id}`}>
                              <span className="adm-lesson-thumb">
                                {thumb ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={thumb} alt="" loading="lazy" />
                                ) : (
                                  Icon.play
                                )}
                              </span>
                              <span className="adm-lesson-text">
                                <strong>{lesson.title}</strong>
                                <span className="adm-lesson-meta">
                                  {lesson.youtube_id ? <span>Vídeo</span> : <span className="is-missing">Sem vídeo</span>}
                                  {lesson.duration_minutes ? <span>{lesson.duration_minutes} min</span> : null}
                                  {lesson.materials > 0 && <span>{plural(lesson.materials, 'material', 'materiais')}</span>}
                                  {lesson.is_free_preview && <span className="adm-tag adm-tag-free">Amostra grátis</span>}
                                </span>
                              </span>
                            </a>
                            <div className="adm-row-actions">
                              <button
                                type="button"
                                className="adm-status adm-status-button"
                                data-on={lesson.is_published}
                                aria-pressed={lesson.is_published}
                                title={lesson.is_published ? 'Clique para ocultar dos alunos' : 'Clique para publicar'}
                                onClick={() => togglePublished(mod.id, lesson.id, !lesson.is_published)}
                              >
                                {lesson.is_published ? 'Publicada' : 'Rascunho'}
                              </button>
                              <span className="adm-shift">
                                <button type="button" aria-label={`Subir a aula ${lesson.title}`} disabled={li === 0}
                                  onClick={() => shiftLesson(mi, li, -1)}>{Icon.up}</button>
                                <button type="button" aria-label={`Descer a aula ${lesson.title}`} disabled={li === mod.lessons.length - 1}
                                  onClick={() => shiftLesson(mi, li, 1)}>{Icon.down}</button>
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  {adding === mod.id ? (
                    <QuickAdd
                      placeholder="Título da aula"
                      button="Criar aula"
                      autoFocus
                      onAdd={(title) => createLesson(mod.id, title)}
                      onCancel={() => setAdding(null)}
                    />
                  ) : (
                    <button type="button" className="adm-add" onClick={() => setAdding(mod.id)}>
                      {Icon.plus}
                      Adicionar aula
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {addingModule ? (
        <div className="adm-module adm-module-new">
          <QuickAdd
            placeholder="Nome do módulo"
            button="Criar módulo"
            autoFocus={modules.length > 0}
            onAdd={async (title) => {
              const r = await createModule(courseId, title);
              if (!r?.error) setAddingModule(false);
              return r;
            }}
            onCancel={modules.length ? () => setAddingModule(false) : undefined}
          />
        </div>
      ) : (
        <button type="button" className="adm-add adm-add-module" onClick={() => setAddingModule(true)}>
          {Icon.plus}
          Adicionar módulo
        </button>
      )}
    </div>
  );
}

function ModuleHead({
  mod,
  index,
  total,
  collapsed,
  onToggle,
  onShift,
  onDragStart,
  onDragEnd,
  onChange
}: {
  mod: ModuleItem;
  index: number;
  total: number;
  collapsed: boolean;
  onToggle: () => void;
  onShift: (dir: -1 | 1) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onChange: (patch: Partial<ModuleItem>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(mod.title);
  const [, start] = useTransition();

  function save() {
    setEditing(false);
    const value = title.trim();
    if (!value || value === mod.title) {
      setTitle(mod.title);
      return;
    }
    onChange({ title: value });
    start(async () => notify(await updateModule(mod.id, { title: value })));
  }

  return (
    <div className="adm-module-head">
      <span
        className="adm-grip"
        draggable
        title="Arraste para reordenar"
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', mod.id);
          const box = (e.currentTarget as HTMLElement).closest('li');
          if (box) e.dataTransfer.setDragImage(box, 24, 24);
          onDragStart();
        }}
        onDragEnd={onDragEnd}
      >
        {Icon.grip}
      </span>

      {editing ? (
        <input
          className="adm-module-input"
          value={title}
          autoFocus
          maxLength={160}
          aria-label="Nome do módulo"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') {
              setTitle(mod.title);
              setEditing(false);
            }
          }}
        />
      ) : (
        <button type="button" className="adm-module-title" aria-expanded={!collapsed} onClick={onToggle}>
          <svg className="adm-caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          <span className="adm-module-index">Módulo {index + 1}</span>
          <strong>{mod.title}</strong>
          <span className="adm-module-count">{plural(mod.lessons.length, 'aula', 'aulas')}</span>
        </button>
      )}

      <div className="adm-row-actions">
        <button
          type="button"
          className="adm-status adm-status-button"
          data-on={mod.is_published}
          aria-pressed={mod.is_published}
          title={mod.is_published ? 'Clique para ocultar o módulo inteiro' : 'Clique para mostrar o módulo'}
          onClick={() => {
            onChange({ is_published: !mod.is_published });
            start(async () => notify(await updateModule(mod.id, { is_published: !mod.is_published })));
          }}
        >
          {mod.is_published ? 'Visível' : 'Oculto'}
        </button>
        <button type="button" className="adm-icon-btn" aria-label={`Renomear ${mod.title}`} onClick={() => setEditing(true)}>
          {Icon.pencil}
        </button>
        <span className="adm-shift">
          <button type="button" aria-label={`Subir ${mod.title}`} disabled={index === 0} onClick={() => onShift(-1)}>{Icon.up}</button>
          <button type="button" aria-label={`Descer ${mod.title}`} disabled={index === total - 1} onClick={() => onShift(1)}>{Icon.down}</button>
        </span>
        <ConfirmButton
          label="Excluir"
          confirmLabel={mod.lessons.length ? `Excluir com ${plural(mod.lessons.length, 'aula', 'aulas')}?` : 'Confirmar'}
          className="adm-btn adm-btn-quiet"
          onConfirm={() => deleteModule(mod.id)}
        />
      </div>
    </div>
  );
}
