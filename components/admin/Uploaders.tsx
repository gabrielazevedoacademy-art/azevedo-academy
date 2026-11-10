'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { createMaterial, setCourseCover } from '@/app/admin/actions';
import { createClient } from '@/lib/supabase/client';
import { Plus } from '../icons';

function safeName(name: string) {
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, '') : '';
  const base = (dot > 0 ? name.slice(0, dot) : name).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9-_]+/g, '-').slice(0, 60);
  return `${base || 'arquivo'}${ext}`;
}

export function CoverUploader({ courseId, current }: { courseId: string; current: string | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function onFile(file: File) {
    setBusy(true);
    setError('');
    const supabase = createClient();
    const path = `${courseId}/${Date.now()}-${safeName(file.name)}`;
    const { error: upErr } = await supabase.storage.from('capas').upload(path, file, { cacheControl: '31536000', contentType: file.type });
    if (upErr) {
      setError('Não foi possível enviar a imagem (PNG, JPG, WEBP até 10 MB).');
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from('capas').getPublicUrl(path);
    await setCourseCover(courseId, data.publicUrl);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="panel">
      <div className="panel-head"><h2>Capa</h2></div>
      <div className="course-cover" style={{ borderRadius: 16, border: '1px solid var(--line)' }}>
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="Capa atual" />
        ) : (
          <div className="course-cover-fallback" style={{ fontSize: '1rem', color: 'var(--muted)' }}>Sem capa · proporção 16:9</div>
        )}
      </div>
      <div className="panel-actions">
        {current && (
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={async () => { await setCourseCover(courseId, null); router.refresh(); }}>Remover</button>
        )}
        <label className="btn btn-primary btn-sm" aria-disabled={busy}>
          {busy ? <><span className="spinner" /> Enviando…</> : current ? 'Trocar imagem' : 'Enviar imagem'}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
      </div>
      {error && <p className="alert alert-error" style={{ marginTop: 12 }}>{error}</p>}
    </div>
  );
}

type Scope = { courseId?: string | null; lessonId?: string | null; revalidate: string };

export function MaterialCreator({ scope, title = 'Adicionar material' }: { scope: Scope; title?: string }) {
  const [kind, setKind] = useState<'file' | 'link'>('file');
  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function submit(f: FormData) {
    setMsg({});
    const name = String(f.get('title') || '').trim();
    const description = String(f.get('description') || '');
    let storage_path: string | null = null;

    if (kind === 'file') {
      const file = f.get('file') as File | null;
      if (!file || !file.size) return setMsg({ error: 'Escolha um arquivo.' });
      if (file.size > 100 * 1024 * 1024) return setMsg({ error: 'O arquivo passa de 100 MB.' });
      setUploading(true);
      const supabase = createClient();
      storage_path = `${scope.lessonId ?? scope.courseId ?? 'avulsos'}/${crypto.randomUUID()}-${safeName(file.name)}`;
      const { error } = await supabase.storage.from('materiais').upload(storage_path, file, { contentType: file.type || undefined });
      setUploading(false);
      if (error) return setMsg({ error: 'Falha ao enviar o arquivo. Tente novamente.' });
    }

    start(async () => {
      const res = await createMaterial({
        title: name || (kind === 'file' ? (f.get('file') as File).name : 'Link'),
        description,
        kind,
        url: kind === 'link' ? String(f.get('url') || '') : null,
        storage_path,
        course_id: scope.courseId ?? null,
        lesson_id: scope.lessonId ?? null,
        revalidate: scope.revalidate
      });
      setMsg(res ?? {});
      if (res?.success) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  const busy = uploading || pending;

  return (
    <form ref={formRef} action={submit} className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className={`btn btn-sm ${kind === 'file' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setKind('file')}>Arquivo</button>
          <button type="button" className={`btn btn-sm ${kind === 'link' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setKind('link')}>Link</button>
        </div>
      </div>
      <div className="form-grid">
        {kind === 'file' ? (
          <div className="field span-2">
            <label className="label" htmlFor="m-file">Arquivo (até 100 MB)</label>
            <input className="input" id="m-file" name="file" type="file" required />
          </div>
        ) : (
          <div className="field span-2">
            <label className="label" htmlFor="m-url">Endereço do link</label>
            <input className="input" id="m-url" name="url" type="url" required placeholder="https://..." />
          </div>
        )}
        <div className="field">
          <label className="label" htmlFor="m-title">Nome</label>
          <input className="input" id="m-title" name="title" placeholder={kind === 'file' ? 'Usa o nome do arquivo se vazio' : 'Ex.: Planilha de roteiros'} required={kind === 'link'} />
        </div>
        <div className="field">
          <label className="label" htmlFor="m-desc">Descrição curta</label>
          <input className="input" id="m-desc" name="description" />
        </div>
      </div>
      <div className="panel-actions" style={{ alignItems: 'center' }}>
        {msg.error && <p className="alert alert-error">{msg.error}</p>}
        {msg.success && <p className="alert alert-success">{msg.success}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? <><span className="spinner" /> {uploading ? 'Enviando arquivo…' : 'Salvando…'}</> : <><Plus width={16} height={16} /> Adicionar</>}
        </button>
      </div>
    </form>
  );
}
