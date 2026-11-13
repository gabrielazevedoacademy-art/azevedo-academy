'use client';

import { useEffect, useState, useTransition } from 'react';
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
import { useSortable } from './sortable';
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

  // Sempre que o servidor devolver dados novos, eles passam a valer
  useEffect(() => setModules(initial), [initial]);

  const saveModuleOrder = (list: ModuleItem[]) =>
    start(async () => {
      const r = await reorderModules(courseId, list.map((m) => m.id));
      notify(r?.error ? r : { ok: 'Ordem dos módulos salva.' });
    });

  const saveLessonOrder = (moduleId: string, list: LessonItem[]) =>
    start(async () => {
      const r = await reorderLessons(moduleId, list.map((l) => l.id));
      notify(r?.error ? r : { ok: 'Ordem das aulas salva.' });
    });

  const sortModules = useSortable({
    items: modules,
    getId: (m) => m.id,
    onChange: setModules,
    onCommit: saveModuleOrder
  });

  const setLessons = (moduleId: string, lessons: LessonItem[]) =>
    setModules((list) => list.map((m) => (m.id === moduleId ? { ...m, lessons } : m)));

  function shiftModule(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= modules.length) return;
    const next = move(modules, index, to);
    setModules(next);
    saveModuleOrder(next);
  }

  function togglePublished(moduleId: string, lessonId: string, value: boolean) {
    setModules((list) =>
      list.map((m) =>
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

      {modules.length > 1 && (
        <p className="adm-hint adm-sort-hint">
          Arraste módulos e aulas para mudar a ordem. No celular, segure o item por um instante antes de arrastar.
        </p>
      )}

      <ol className="adm-modules" ref={(el) => void (sortModules.containerRef.current = el)}>
        {modules.map((mod, mi) => {
          const isCollapsed = collapsed[mod.id];
          return (
            <li
              key={mod.id}
              data-sort-id={mod.id}
              className="adm-module"
              data-dragging={sortModules.dragging === mod.id}
              data-hidden={!mod.is_published}
            >
              <ModuleHead
                mod={mod}
                index={mi}
                total={modules.length}
                collapsed={!!isCollapsed}
                dragProps={sortModules.handle(mod.id)}
                onToggle={() => setCollapsed({ ...collapsed, [mod.id]: !isCollapsed })}
                onShift={(dir) => shiftModule(mi, dir)}
                onChange={(patch) => setModules((list) => list.map((m) => (m.id === mod.id ? { ...m, ...patch } : m)))}
              />

              {!isCollapsed && (
                <div className="adm-module-body">
                  <LessonList
                    moduleId={mod.id}
                    lessons={mod.lessons}
                    onChange={(lessons) => setLessons(mod.id, lessons)}
                    onCommit={(lessons) => saveLessonOrder(mod.id, lessons)}
                    onToggle={(lessonId, value) => togglePublished(mod.id, lessonId, value)}
                  />

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

function LessonList({
  moduleId,
  lessons,
  onChange,
  onCommit,
  onToggle
}: {
  moduleId: string;
  lessons: LessonItem[];
  onChange: (lessons: LessonItem[]) => void;
  onCommit: (lessons: LessonItem[]) => void;
  onToggle: (lessonId: string, value: boolean) => void;
}) {
  const sort = useSortable({ items: lessons, getId: (l) => l.id, onChange, onCommit });

  function shift(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= lessons.length) return;
    const next = move(lessons, index, to);
    onChange(next);
    onCommit(next);
  }

  if (!lessons.length) return null;

  return (
    <ol className="adm-lessons" data-module={moduleId} ref={(el) => void (sort.containerRef.current = el)}>
      {lessons.map((lesson, li) => {
        const thumb = publicImage(lesson.thumbnail_path) ?? (lesson.youtube_id ? youtubeThumb(lesson.youtube_id) : null);
        return (
          <li
            key={lesson.id}
            data-sort-id={lesson.id}
            className="adm-lesson adm-sortable"
            data-dragging={sort.dragging === lesson.id}
            data-hidden={!lesson.is_published}
            {...sort.handle(lesson.id)}
          >
            <span className="adm-grip" aria-hidden="true">
              {Icon.grip}
            </span>
            <a className="adm-lesson-link" href={`/admin/aulas/${lesson.id}`} draggable={false}>
              <span className="adm-lesson-thumb">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" loading="lazy" draggable={false} />
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
                onClick={() => onToggle(lesson.id, !lesson.is_published)}
              >
                {lesson.is_published ? 'Publicada' : 'Rascunho'}
              </button>
              <span className="adm-shift">
                <button type="button" aria-label={`Subir a aula ${lesson.title}`} disabled={li === 0} onClick={() => shift(li, -1)}>
                  {Icon.up}
                </button>
                <button
                  type="button"
                  aria-label={`Descer a aula ${lesson.title}`}
                  disabled={li === lessons.length - 1}
                  onClick={() => shift(li, 1)}
                >
                  {Icon.down}
                </button>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ModuleHead({
  mod,
  index,
  total,
  collapsed,
  dragProps,
  onToggle,
  onShift,
  onChange
}: {
  mod: ModuleItem;
  index: number;
  total: number;
  collapsed: boolean;
  dragProps: ReturnType<ReturnType<typeof useSortable>['handle']>;
  onToggle: () => void;
  onShift: (dir: -1 | 1) => void;
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
    <div className="adm-module-head adm-sortable" {...(editing ? {} : dragProps)}>
      <span className="adm-grip" aria-hidden="true">
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
        <div className="adm-module-title" role="button" tabIndex={0} aria-expanded={!collapsed} onClick={onToggle}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}>
          <svg className="adm-caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          <span className="adm-module-index">Módulo {index + 1}</span>
          <strong>{mod.title}</strong>
          <span className="adm-module-count">{plural(mod.lessons.length, 'aula', 'aulas')}</span>
        </div>
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
