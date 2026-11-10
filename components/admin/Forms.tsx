'use client';

import { useActionState, useState } from 'react';
import { createCourse, grantAccess, updateCourse, updateLesson, type ActionState } from '@/app/admin/actions';
import type { Course, Lesson, Module } from '@/lib/types';
import SubmitButton from '../SubmitButton';

function Feedback({ state }: { state: ActionState }) {
  if (state?.error) return <p className="alert alert-error" role="alert">{state.error}</p>;
  if (state?.success) return <p className="alert alert-success" role="status">{state.success}</p>;
  return null;
}

export function ConfirmSubmit({ message, children, className = 'btn btn-danger btn-sm' }: { message: string; children: React.ReactNode; className?: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}

export function NewCourseForm() {
  const [state, action] = useActionState(createCourse, undefined);
  return (
    <form action={action} className="panel">
      <div className="panel-head"><h2>Novo curso</h2></div>
      <div className="form-grid">
        <div className="field span-2">
          <label className="label" htmlFor="new-title">Nome do curso</label>
          <input className="input" id="new-title" name="title" required placeholder="Ex.: Influencer com IA" />
        </div>
        <label className="checkbox"><input type="checkbox" name="is_free" /> Curso gratuito</label>
      </div>
      <div className="panel-actions">
        <Feedback state={state} />
        <SubmitButton pendingLabel="Criando…">Criar e editar</SubmitButton>
      </div>
    </form>
  );
}

export function CourseForm({ course }: { course: Course }) {
  const [state, action] = useActionState(updateCourse, undefined);
  const [isFree, setIsFree] = useState(course.is_free);
  return (
    <form action={action} className="panel">
      <div className="panel-head"><h2>Informações</h2></div>
      <input type="hidden" name="id" value={course.id} />
      <div className="form-grid">
        <div className="field span-2">
          <label className="label" htmlFor="title">Nome</label>
          <input className="input" id="title" name="title" defaultValue={course.title} required />
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="subtitle">Frase de apresentação</label>
          <input className="input" id="subtitle" name="subtitle" defaultValue={course.subtitle ?? ''} placeholder="Uma linha que resume a promessa do curso" />
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="description">Descrição</label>
          <textarea className="textarea" id="description" name="description" defaultValue={course.description ?? ''} rows={6} />
        </div>
        <div className="field">
          <label className="label" htmlFor="slug">Endereço</label>
          <input className="input" id="slug" name="slug" defaultValue={course.slug} required />
          <span className="hint">azevedoacademy.com.br/cursos/<strong>{course.slug}</strong></span>
        </div>
        <div className="field">
          <label className="label" htmlFor="status">Situação</label>
          <select className="select" id="status" name="status" defaultValue={course.status}>
            <option value="draft">Rascunho (só você vê)</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <label className="checkbox span-2">
          <input type="checkbox" name="is_free" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} /> Curso gratuito (liberado para quem tem conta)
        </label>
        {!isFree && (
          <>
            <div className="field">
              <label className="label" htmlFor="price">Preço (R$)</label>
              <input className="input" id="price" name="price" inputMode="decimal" defaultValue={course.price_cents != null ? (course.price_cents / 100).toFixed(2).replace('.', ',') : ''} placeholder="197,00" />
            </div>
            <div className="field">
              <label className="label" htmlFor="kiwify_product_id">ID do produto na Kiwify</label>
              <input className="input" id="kiwify_product_id" name="kiwify_product_id" defaultValue={course.kiwify_product_id ?? ''} />
              <span className="hint">Usado para liberar o curso automaticamente após a compra.</span>
            </div>
            <div className="field span-2">
              <label className="label" htmlFor="checkout_url">Link do checkout</label>
              <input className="input" id="checkout_url" name="checkout_url" type="url" defaultValue={course.checkout_url ?? ''} placeholder="https://pay.kiwify.com.br/..." />
            </div>
          </>
        )}
        <div className="field">
          <label className="label" htmlFor="position">Ordem no catálogo</label>
          <input className="input" id="position" name="position" type="number" defaultValue={course.position} />
        </div>
      </div>
      <div className="panel-actions" style={{ alignItems: 'center' }}>
        <Feedback state={state} />
        <SubmitButton pendingLabel="Salvando…">Salvar curso</SubmitButton>
      </div>
    </form>
  );
}

export function LessonForm({ lesson, modules, youtubeId, body }: { lesson: Lesson; modules: Module[]; youtubeId: string | null; body: string | null }) {
  const [state, action] = useActionState(updateLesson, undefined);
  const [yt, setYt] = useState(youtubeId ? `https://youtu.be/${youtubeId}` : '');
  const preview = (() => {
    const m = yt.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/) || yt.match(/^([A-Za-z0-9_-]{11})$/);
    return m ? m[1] : null;
  })();

  return (
    <form action={action} className="panel">
      <input type="hidden" name="id" value={lesson.id} />
      <input type="hidden" name="course_id" value={lesson.course_id} />
      <div className="form-grid">
        <div className="field span-2">
          <label className="label" htmlFor="title">Título da aula</label>
          <input className="input" id="title" name="title" defaultValue={lesson.title} required />
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="youtube">Vídeo do YouTube</label>
          <input className="input" id="youtube" name="youtube" value={yt} onChange={(e) => setYt(e.target.value)} placeholder="https://youtu.be/..." />
          <span className="hint">Use vídeos “Não listados” no YouTube para os cursos pagos.</span>
        </div>
        {preview && (
          <div className="span-2 player" style={{ animation: 'none' }}>
            <iframe src={`https://www.youtube-nocookie.com/embed/${preview}?rel=0`} title="Prévia do vídeo" allowFullScreen />
          </div>
        )}
        <div className="field span-2">
          <label className="label" htmlFor="summary">Resumo curto</label>
          <input className="input" id="summary" name="summary" defaultValue={lesson.summary ?? ''} />
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="body">Texto de apoio</label>
          <textarea className="textarea" id="body" name="body" defaultValue={body ?? ''} rows={6} placeholder="Instruções, links e observações que aparecem abaixo do vídeo." />
        </div>
        <div className="field">
          <label className="label" htmlFor="module_id">Módulo</label>
          <select className="select" id="module_id" name="module_id" defaultValue={lesson.module_id}>
            {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="duration">Duração (minutos)</label>
          <input className="input" id="duration" name="duration" type="number" min={0} defaultValue={lesson.duration_minutes ?? ''} />
        </div>
        <label className="checkbox span-2">
          <input type="checkbox" name="is_preview" defaultChecked={lesson.is_preview} /> Aula de prévia (aberta para quem tem conta, mesmo sem comprar)
        </label>
      </div>
      <div className="panel-actions" style={{ alignItems: 'center' }}>
        <Feedback state={state} />
        <SubmitButton pendingLabel="Salvando…">Salvar aula</SubmitButton>
      </div>
    </form>
  );
}

export function GrantForm({ courses }: { courses: Pick<Course, 'id' | 'title'>[] }) {
  const [state, action] = useActionState(grantAccess, undefined);
  return (
    <form action={action} className="panel">
      <div className="panel-head"><h2>Liberar acesso</h2></div>
      <div className="form-grid">
        <div className="field">
          <label className="label" htmlFor="grant-email">E-mail do aluno</label>
          <input className="input" id="grant-email" name="email" type="email" required />
        </div>
        <div className="field">
          <label className="label" htmlFor="grant-course">Curso</label>
          <select className="select" id="grant-course" name="course_id" required defaultValue="">
            <option value="" disabled>Escolha um curso</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>
      <div className="panel-actions" style={{ alignItems: 'center' }}>
        <Feedback state={state} />
        <SubmitButton pendingLabel="Liberando…">Liberar</SubmitButton>
      </div>
    </form>
  );
}
