'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createCourse } from '@/app/admin/actions';
import { Icon } from './ui';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn adm-btn-dark" type="submit" disabled={pending}>
      {pending ? 'Criando…' : 'Criar curso'}
    </button>
  );
}

export default function NewCourse() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(createCourse, undefined);

  if (!open)
    return (
      <button className="adm-btn adm-btn-dark" type="button" onClick={() => setOpen(true)}>
        {Icon.plus}
        Novo curso
      </button>
    );

  return (
    <form action={action} className="adm-quickadd adm-newcourse">
      <input name="title" placeholder="Nome do curso" aria-label="Nome do curso" maxLength={160} required autoFocus
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)} />
      <Submit />
      <button className="adm-btn adm-btn-ghost" type="button" onClick={() => setOpen(false)}>
        Cancelar
      </button>
      {state?.error && <p className="adm-inline-error" role="alert">{state.error}</p>}
    </form>
  );
}
