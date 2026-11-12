'use client';

import { useRef, useState, useTransition } from 'react';
import type { Result } from '@/app/admin/actions';
import { IMAGE_BUCKET, publicImage } from '@/lib/admin/storage';
import { createClient } from '@/lib/supabase/client';
import { Icon, notify } from './ui';

/*
  Envio de capa/thumbnail. A imagem é recortada no centro na proporção certa,
  reduzida e convertida para WebP no próprio navegador antes de subir.
*/

async function prepare(file: File, width: number, height: number) {
  const bitmap = await createImageBitmap(file);
  const target = width / height;
  let sw = bitmap.width;
  let sh = bitmap.height;
  if (sw / sh > target) sw = Math.round(sh * target);
  else sh = Math.round(sw / target);
  const sx = Math.round((bitmap.width - sw) / 2);
  const sy = Math.round((bitmap.height - sh) / 2);
  // Não amplia imagens pequenas além do tamanho original
  const scale = Math.min(1, width / sw);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.86));
  if (!blob) throw new Error('convert');
  return blob;
}

export default function ImageUpload({
  path,
  folder,
  ratio,
  width,
  height,
  label,
  hint,
  fallback,
  onSave
}: {
  path: string | null;
  folder: string;
  ratio: string;
  width: number;
  height: number;
  label: string;
  hint: string;
  fallback?: string | null;
  onSave: (path: string | null) => Promise<Result>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [, start] = useTransition();
  const current = preview ?? publicImage(path);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify({ error: 'Escolha um arquivo de imagem (JPG, PNG ou WebP).' });
      return;
    }
    setBusy(true);
    try {
      const blob = await prepare(file, width, height);
      const local = URL.createObjectURL(blob);
      setPreview(local);
      const name = `${folder}/${Date.now()}.webp`;
      const { error } = await createClient().storage.from(IMAGE_BUCKET).upload(name, blob, {
        contentType: 'image/webp',
        cacheControl: '31536000'
      });
      if (error) throw error;
      const r = await onSave(name);
      notify(r);
      if (r?.error) setPreview(null);
    } catch {
      setPreview(null);
      notify({ error: 'Não foi possível enviar a imagem. Tente de novo.' });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="adm-image">
      <div
        className="adm-image-drop"
        style={{ aspectRatio: ratio }}
        data-over={over}
        data-busy={busy}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          upload(e.dataTransfer.files[0]);
        }}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="" />
        ) : fallback ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fallback} alt="" className="is-fallback" />
            <span className="adm-image-tag">Capa do YouTube</span>
          </>
        ) : (
          <span className="adm-image-empty">
            {Icon.image}
            Arraste uma imagem ou clique em enviar
          </span>
        )}
        {busy && <span className="adm-image-busy">Enviando…</span>}
      </div>
      <div className="adm-image-actions">
        <button type="button" className="adm-btn adm-btn-dark" disabled={busy} onClick={() => inputRef.current?.click()}>
          {Icon.upload}
          {current ? 'Trocar imagem' : label}
        </button>
        {path && !busy && (
          <button
            type="button"
            className="adm-btn adm-btn-ghost"
            onClick={() =>
              start(async () => {
                const r = await onSave(null);
                notify(r);
                if (!r?.error) setPreview(null);
              })
            }
          >
            Remover
          </button>
        )}
      </div>
      <p className="adm-hint">{hint}</p>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}
