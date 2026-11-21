'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { deleteMaterial, saveMaterial, setMaterialCover, setMaterialFile, type MaterialInput } from '@/app/admin/materiais/actions';
import { formatBytes, MATERIAL_BUCKET, MATERIAL_MAX_BYTES } from '@/lib/admin/storage';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from './ImageUpload';
import { ConfirmButton, Icon, notify, Switch } from './ui';

type Material = MaterialInput & {
  id: string;
  coverPath: string | null;
  fileName: string | null;
  fileSize: number | null;
  filePath: string | null;
};

const KINDS = [
  { value: 'prompt', label: 'Prompt', hint: 'Texto que a pessoa copia com um clique' },
  { value: 'file', label: 'Arquivo', hint: 'PDF, planilha, imagem ou outro arquivo para baixar' },
  { value: 'link', label: 'Link', hint: 'Endereço externo, como a página do curso na Kiwify' }
] as const;

const safeName = (n: string) =>
  n
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w.-]+/g, '-')
    .slice(-80);

export default function MaterialEditor({
  material,
  categories,
  stats
}: {
  material: Material;
  categories: string[];
  stats: { copies: number; downloads: number; opens: number; people: number } | null;
}) {
  const router = useRouter();
  const [f, setF] = useState<MaterialInput>({
    title: material.title,
    slug: material.slug,
    summary: material.summary,
    description: material.description,
    kind: material.kind,
    category: material.category,
    prompt: material.prompt,
    url: material.url,
    requiresLogin: material.requiresLogin,
    published: material.published
  });
  const [dirty, setDirty] = useState(false);
  const [file, setFile] = useState({ name: material.fileName, size: material.fileSize, has: Boolean(material.filePath) });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof MaterialInput>(k: K, v: MaterialInput[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    setDirty(true);
  };

  async function upload(chosen: File | undefined) {
    if (!chosen) return;
    if (chosen.size > MATERIAL_MAX_BYTES) return notify({ error: 'O arquivo passa de 50 MB. Envie um menor ou use um link.' });
    setUploading(true);
    const path = `biblioteca/${material.id}/${Date.now()}-${safeName(chosen.name)}`;
    const { error } = await createClient().storage.from(MATERIAL_BUCKET).upload(path, chosen, {
      contentType: chosen.type || 'application/octet-stream'
    });
    if (error) notify({ error: 'Não foi possível enviar o arquivo. Tente de novo.' });
    else {
      const r = await setMaterialFile(material.id, { path, name: chosen.name, size: chosen.size });
      notify(r);
      if (!r?.error) setFile({ name: chosen.name, size: chosen.size, has: true });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    router.refresh();
  }

  const uses = stats ? stats.copies + stats.downloads + stats.opens : 0;

  return (
    <form
      className="adm-mat-editor"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveMaterial(material.id, f);
          notify(r);
          if (!r?.error) {
            setDirty(false);
            router.refresh();
          }
        });
      }}
    >
      <header className="adm-head">
        <div>
          <h1>{f.title || 'Material sem título'}</h1>
          <p>
            {f.published ? 'Publicado' : 'Rascunho'}, {f.requiresLogin ? 'só para quem tem conta' : 'aberto para todos'}
            {uses > 0 && `. Usado ${uses} ${uses === 1 ? 'vez' : 'vezes'} por ${stats!.people || 'visitantes'}${stats!.people ? (stats!.people === 1 ? ' pessoa logada' : ' pessoas logadas') : ''}`}
          </p>
        </div>
        <div className="adm-ann-actions">
          {material.published && (
            <a className="adm-btn adm-btn-ghost" href={`/materiais/${material.slug}`} target="_blank" rel="noopener noreferrer">
              Ver no site
            </a>
          )}
          <button type="submit" className="adm-btn adm-btn-dark" disabled={pending || !dirty}>
            {pending ? 'Salvando…' : dirty ? 'Salvar material' : 'Material salvo'}
          </button>
        </div>
      </header>

      <div className="adm-mat-grid">
        <div className="adm-panel adm-form">
          <div className="adm-field">
            <label htmlFor="m-title">Título</label>
            <input id="m-title" value={f.title} onChange={(e) => set('title', e.target.value)} maxLength={120} required />
          </div>
          <div className="adm-field">
            <label htmlFor="m-slug">Endereço</label>
            <div className="adm-prefix">
              <span>/materiais/</span>
              <input id="m-slug" value={f.slug} onChange={(e) => set('slug', e.target.value)} maxLength={80} />
            </div>
          </div>
          <div className="adm-grid-2">
            <div className="adm-field">
              <label htmlFor="m-sum">Resumo do card</label>
              <input id="m-sum" value={f.summary} onChange={(e) => set('summary', e.target.value)} maxLength={200} placeholder="Uma frase sobre o que a pessoa leva" />
            </div>
            <div className="adm-field">
              <label htmlFor="m-cat">Categoria</label>
              <input id="m-cat" list="m-cats" value={f.category} onChange={(e) => set('category', e.target.value)} maxLength={40} placeholder="Ex.: Imagens, Vídeos, YouTube" />
              <datalist id="m-cats">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="adm-field">
            <label htmlFor="m-desc">Descrição (opcional)</label>
            <textarea id="m-desc" value={f.description} onChange={(e) => set('description', e.target.value)} rows={4} maxLength={4000} placeholder="Como usar, dicas e exemplos" />
          </div>

          <fieldset className="adm-field adm-kind">
            <legend>Tipo de material</legend>
            <div className="adm-kind-options">
              {KINDS.map((k) => (
                <label key={k.value} data-on={f.kind === k.value}>
                  <input type="radio" name="kind" value={k.value} checked={f.kind === k.value} onChange={() => set('kind', k.value)} />
                  <strong>{k.label}</strong>
                  <span>{k.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {f.kind === 'prompt' && (
            <div className="adm-field">
              <label htmlFor="m-prompt">Prompt</label>
              <textarea id="m-prompt" className="adm-mono" value={f.prompt} onChange={(e) => set('prompt', e.target.value)} rows={10} maxLength={20000} placeholder="Cole aqui o prompt completo" />
            </div>
          )}
          {f.kind === 'link' && (
            <div className="adm-field">
              <label htmlFor="m-url">Link</label>
              <input id="m-url" value={f.url} onChange={(e) => set('url', e.target.value)} inputMode="url" placeholder="https://…" />
            </div>
          )}
          {f.kind === 'file' && (
            <div className="adm-field">
              <span className="adm-field-label">Arquivo</span>
              <div className="adm-mat-file">
                {file.has ? (
                  <span>
                    <strong>{file.name}</strong>
                    {file.size ? `, ${formatBytes(file.size)}` : ''}
                  </span>
                ) : (
                  <span className="adm-muted">Nenhum arquivo enviado. Até 50 MB.</span>
                )}
                <button type="button" className="adm-btn adm-btn-dark" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {Icon.upload}
                  {uploading ? 'Enviando…' : file.has ? 'Trocar arquivo' : 'Enviar arquivo'}
                </button>
                <input ref={fileRef} type="file" hidden onChange={(e) => upload(e.target.files?.[0])} />
              </div>
            </div>
          )}

          <div className="adm-switches">
            <Switch label="Só para quem tem conta (pede login)" checked={f.requiresLogin} onChange={(v) => set('requiresLogin', v)} />
            <Switch label="Publicado no site" checked={f.published} onChange={(v) => set('published', v)} />
          </div>
          <p className="adm-hint">
            Itens com login mostram capa, título e resumo para todos, mas o conteúdo só aparece depois de entrar na conta.
          </p>
        </div>

        <aside className="adm-mat-side">
          <div className="adm-panel">
            <h2 className="adm-section-title">Capa</h2>
            <ImageUpload
              path={material.coverPath}
              folder={`materiais/${material.id}`}
              ratio="4 / 5"
              width={960}
              height={1200}
              label="Enviar capa"
              hint="Formato vertical 4:5, como os cards da página inicial. Sem capa, o site monta uma com o título."
              onSave={(path) => setMaterialCover(material.id, path)}
            />
          </div>
          {stats && (
            <div className="adm-panel adm-mat-stats">
              <h2 className="adm-section-title">Uso</h2>
              <dl>
                <div>
                  <dt>Cópias</dt>
                  <dd>{stats.copies}</dd>
                </div>
                <div>
                  <dt>Downloads</dt>
                  <dd>{stats.downloads}</dd>
                </div>
                <div>
                  <dt>Links abertos</dt>
                  <dd>{stats.opens}</dd>
                </div>
              </dl>
            </div>
          )}
          <div className="adm-panel adm-panel-danger">
            <ConfirmButton
              label="Excluir material"
              className="adm-btn adm-btn-quiet"
              onConfirm={async () => (await deleteMaterial(material.id)) ?? { ok: 'Material excluído.' }}
            />
          </div>
        </aside>
      </div>
    </form>
  );
}
