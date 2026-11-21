'use client';

import { useTransition } from 'react';
import { createMaterial } from '@/app/admin/materiais/actions';
import { Icon, notify } from './ui';

export default function NewMaterial() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="adm-btn adm-btn-dark"
      disabled={pending}
      onClick={() => start(async () => notify(await createMaterial()))}
    >
      {Icon.plus}
      {pending ? 'Criando…' : 'Novo material'}
    </button>
  );
}
