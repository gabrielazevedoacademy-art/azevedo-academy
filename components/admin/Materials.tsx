'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { addMaterialFile, addMaterialLink, deleteMaterial, renameMaterial, reorderMaterials } from '@/app/admin/actions';
import { formatBytes, MATERIAL_BUCKET, MATERIAL_MAX_BYTES } from '@/lib/admin/storage';
import { createClient } from '@/lib/supabase/client';
import { ConfirmButton, Icon, notify } from './ui';

export type MaterialItem = {
  id: string;
  title: string;
  kind: 'file' | 'link';
  url: string | null;
  file_size: number | null;
  mime_type: string | null;
  href: string | null;
  ext: string;
};

function safeName(name: string) {
  const clean = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(-90);
  return clean || 'arquivo';
}

export default function Materials({ lessonId, items: initial }: { lessonId: string; items: MaterialItem[] }) {
  const [items, setItems] = useState(initial);
  const [uploads, setUploads] = useState<{ name: string; key: string }[]>([]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [over, setOver] = useState(false);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setItems(initial), [initial]);

  async function sendFiles(list: FileList | File[] | null) {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    const supabase = createClient();
    for (const file of files) {
      if (file.size > MATERIAL_MAX_BYTES) {
        notify({ error: `"${file.name}" passa de 50 MB. Envie um arquivo menor ou adicione como link.` });
        continue;
      }
      const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setUploads((u) => [...u, { name: file.name, key }]);
      const path = `${lessonId}/${key}-${safeName(file.name)}`;
      const { error } = await supabase.storage.from(MATERIAL_BUCKET).upload(path, file, {
        contentType: file.type || 'application/octet-stream'
      });
      if (error) {
        notify({ error: `Não foi possível enviar "${file.name}". Tente de novo.` });
      } else {
        const title = file.name.replace(/\.[^.]+$/, '');
        notify(await addMaterialFile(lessonId, { title, path, size: file.size, mime: file.type }));
      }
      setUploads((u) => u.filter((x) => x.key !== key));
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  function shift(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [it] = next.splice(index, 1);
    next.splice(to, 0, it);
    setItems(next);
    start(async () => {
      const r = await reorderMaterials(lessonId, next.map((m) => m.id));
      if (r?.error) notify(r);
    });
  }

  return (
    <div
      className="adm-materials"
      data-over={over}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
      }}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setOver(false);
        sendFiles(e.dataTransfer.files);
      }}
    >
      {items.length === 0 && uploads.length === 0 ? (
        <p className="adm-materials-empty">
          Nenhum material ainda. Arraste arquivos para cá (PDF, planilhas, imagens, ZIP) ou adicione um link.
        </p>
      ) : (
        <ul className="adm-material-list">
          {items.map((m, i) => (
            <MaterialRow
              key={m.id}
              item={m}
              first={i === 0}
              last={i === items.length - 1}
              onShift={(dir) => shift(i, dir)}
            />
          ))}
          {uploads.map((u) => (
            <li key={u.key} className="adm-material is-uploading">
              <span className="adm-material-icon">{Icon.upload}</span>
              <span className="adm-material-text">
                <strong>{u.name}</strong>
                <span>Enviando…</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {linkOpen ? (
        <LinkForm
          busy={pending}
          onCancel={() => setLinkOpen(false)}
          onSubmit={(title, url) =>
            start(async () => {
              const r = await addMaterialLink(lessonId, title, url);
              notify(r);
              if (!r?.error) setLinkOpen(false);
            })
          }
        />
      ) : (
        <div className="adm-materials-actions">
          <button type="button" className="adm-btn adm-btn-dark" onClick={() => inputRef.current?.click()}>
            {Icon.upload}
            Enviar arquivos
          </button>
          <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setLinkOpen(true)}>
            {Icon.link}
            Adicionar link
          </button>
        </div>
      )}
      <p className="adm-hint">Até 50 MB por arquivo. Só alunos com acesso à aula conseguem baixar.</p>
      <input ref={inputRef} type="file" multiple hidden onChange={(e) => sendFiles(e.target.files)} />
    </div>
  );
}

function MaterialRow({
  item,
  first,
  last,
  onShift
}: {
  item: MaterialItem;
  first: boolean;
  last: boolean;
  onShift: (dir: -1 | 1) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [, start] = useTransition();

  function save() {
    setEditing(false);
    const value = title.trim();
    if (!value || value === item.title) return setTitle(item.title);
    start(async () => notify(await renameMaterial(item.id, value)));
  }

  const meta =
    item.kind === 'link'
      ? (() => {
          try {
            return new URL(item.url!).hostname.replace(/^www\./, '');
          } catch {
            return 'Link';
          }
        })()
      : [item.ext.toUpperCase(), formatBytes(item.file_size)].filter(Boolean).join(', ');

  return (
    <li className="adm-material">
      <span className="adm-material-icon" data-kind={item.kind}>
        {item.kind === 'link' ? Icon.link : <em>{item.ext.slice(0, 4) || Icon.file}</em>}
      </span>
      <span className="adm-material-text">
        {editing ? (
          <input
            value={title}
            autoFocus
            maxLength={160}
            aria-label="Nome do material"
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                save();
              }
              if (e.key === 'Escape') {
                setTitle(item.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <strong>{title}</strong>
        )}
        <span>{meta}</span>
      </span>
      <div className="adm-row-actions">
        {item.href && (
          <a className="adm-icon-btn" href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${item.title}`}>
            {Icon.external}
          </a>
        )}
        <button type="button" className="adm-icon-btn" aria-label={`Renomear ${item.title}`} onClick={() => setEditing(true)}>
          {Icon.pencil}
        </button>
        <span className="adm-shift">
          <button type="button" aria-label={`Subir ${item.title}`} disabled={first} onClick={() => onShift(-1)}>{Icon.up}</button>
          <button type="button" aria-label={`Descer ${item.title}`} disabled={last} onClick={() => onShift(1)}>{Icon.down}</button>
        </span>
        <ConfirmButton
          label={Icon.trash}
          ariaLabel={`Remover ${item.title}`}
          confirmLabel="Remover?"
          className="adm-icon-btn adm-icon-danger"
          onConfirm={() => deleteMaterial(item.id)}
        />
      </div>
    </li>
  );
}

function LinkForm({
  busy,
  onSubmit,
  onCancel
}: {
  busy: boolean;
  onSubmit: (title: string, url: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  return (
    <div className="adm-linkform">
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" aria-label="Link do material"
        inputMode="url" autoFocus />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome (opcional)" aria-label="Nome do link"
        maxLength={160} />
      <div className="adm-materials-actions">
        <button type="button" className="adm-btn adm-btn-dark" disabled={busy || !url.trim()} onClick={() => onSubmit(title, url)}>
          {busy ? 'Adicionando…' : 'Adicionar link'}
        </button>
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
