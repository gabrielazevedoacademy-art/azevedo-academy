'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateCourse } from '@/app/admin/actions';
import { notify, Switch } from './ui';

export type CourseInfo = {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_free: boolean;
  status: 'draft' | 'published';
};

function Save({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn adm-btn-dark adm-btn-block" type="submit" disabled={pending || !dirty}>
      {pending ? 'Salvando…' : dirty ? 'Salvar curso' : 'Curso salvo'}
    </button>
  );
}

export default function CourseDetails({ course }: { course: CourseInfo }) {
  const [state, action] = useActionState(updateCourse, undefined);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    notify(state);
    if (state?.ok) setDirty(false);
  }, [state]);

  return (
    <form action={action} className="adm-form" onInput={() => setDirty(true)}>
      <input type="hidden" name="id" value={course.id} />
      <div className="adm-field">
        <label htmlFor="c-title">Nome</label>
        <input id="c-title" name="title" defaultValue={course.title} maxLength={160} required />
      </div>
      <div className="adm-field">
        <label htmlFor="c-slug">Endereço</label>
        <div className="adm-prefix">
          <span>/cursos/</span>
          <input id="c-slug" name="slug" defaultValue={course.slug} maxLength={80} />
        </div>
      </div>
      <div className="adm-field">
        <label htmlFor="c-desc">Descrição</label>
        <textarea id="c-desc" name="description" defaultValue={course.description} rows={4} placeholder="O que o aluno vai aprender" />
      </div>
      <div className="adm-switches">
        <Switch name="published" defaultChecked={course.status === 'published'} label="Publicado para os alunos" />
        <Switch name="is_free" defaultChecked={course.is_free} label="Curso gratuito (sem precisar comprar)" />
      </div>
      <Save dirty={dirty} />
    </form>
  );
}
