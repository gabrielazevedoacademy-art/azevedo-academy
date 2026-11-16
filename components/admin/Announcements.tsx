'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteAnnouncement, saveAnnouncement, setAnnouncementActive, type AnnouncementInput } from '@/app/admin/novidades/actions';
import AnnouncementModal from '@/components/AnnouncementModal';
import { publicImage } from '@/lib/admin/storage';
import { toLocalInput } from '@/lib/links';
import ImageUpload from './ImageUpload';
import { ConfirmButton, notify, Switch } from './ui';

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  image_path: string | null;
  cta_label: string | null;
  cta_url: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  dismissed?: number;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

function status(r: AnnouncementRow) {
  const now = Date.now();
  if (!r.is_active) return { label: 'Pausado', tone: 'muted' };
  if (now < +new Date(r.starts_at)) return { label: 'Agendado', tone: 'info' };
  if (now >= +new Date(r.ends_at)) return { label: 'Encerrado', tone: 'muted' };
  return { label: 'No ar', tone: 'live' };
}

const empty = (): AnnouncementInput => {
  const start = new Date();
  const end = new Date(Date.now() + 7 * 864e5);
  return { title: '', body: '', imagePath: null, ctaLabel: '', ctaUrl: '', startsAt: toLocalInput(start), endsAt: toLocalInput(end), isActive: true };
};

function Editor({ row, onDone }: { row: AnnouncementRow | null; onDone: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<AnnouncementInput>(() =>
    row
      ? {
          title: row.title,
          body: row.body,
          imagePath: row.image_path,
          ctaLabel: row.cta_label ?? '',
          ctaUrl: row.cta_url ?? '',
          startsAt: toLocalInput(row.starts_at),
          endsAt: toLocalInput(row.ends_at),
          isActive: row.is_active
        }
      : empty()
  );
  const [preview, setPreview] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof AnnouncementInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((v) => ({ ...v, [k]: e.target.value }));

  return (
    <form
      className="adm-panel adm-form adm-ann-editor"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveAnnouncement(row?.id ?? null, f);
          notify(r);
          if (!r?.error) {
            onDone();
            router.refresh();
          }
        });
      }}
    >
      <h2 className="adm-section-title">{row ? 'Editar banner' : 'Novo banner'}</h2>
      <div className="adm-ann-grid">
        <div className="adm-form">
          <div className="adm-field">
            <label htmlFor="ann-t">Título</label>
            <input id="ann-t" value={f.title} onChange={set('title')} maxLength={120} required placeholder="Ex.: Curso novo no ar" />
          </div>
          <div className="adm-field">
            <label htmlFor="ann-b">Texto</label>
            <textarea id="ann-b" value={f.body} onChange={set('body')} maxLength={600} rows={4} placeholder="O que mudou e por que vale a pena conferir." />
          </div>
          <div className="adm-grid-2">
            <div className="adm-field">
              <label htmlFor="ann-cl">Texto do botão (opcional)</label>
              <input id="ann-cl" value={f.ctaLabel} onChange={set('ctaLabel')} maxLength={40} placeholder="Ex.: Ver o curso" />
            </div>
            <div className="adm-field">
              <label htmlFor="ann-cu">Link do botão</label>
              <input id="ann-cu" value={f.ctaUrl} onChange={set('ctaUrl')} placeholder="/meus-cursos ou https://…" />
            </div>
          </div>
          <div className="adm-grid-2">
            <div className="adm-field">
              <label htmlFor="ann-s">Começa a aparecer</label>
              <input id="ann-s" type="datetime-local" value={f.startsAt} onChange={set('startsAt')} required />
            </div>
            <div className="adm-field">
              <label htmlFor="ann-e">Para de aparecer</label>
              <input id="ann-e" type="datetime-local" value={f.endsAt} onChange={set('endsAt')} required />
            </div>
          </div>
          <p className="adm-hint">Horário de Brasília. Cada aluno vê o banner uma vez por visita, até marcar “Não mostrar novamente”.</p>
          <Switch label="Ativo" checked={f.isActive} onChange={(v) => setF((x) => ({ ...x, isActive: v }))} />
        </div>
        <div className="adm-field">
          <span className="adm-field-label">Imagem (opcional)</span>
          <ImageUpload
            path={f.imagePath}
            folder="banners"
            ratio="16 / 9"
            width={1200}
            height={675}
            label="Enviar imagem"
            hint="Formato 16:9. A imagem é ajustada automaticamente."
            onSave={async (path) => {
              setF((x) => ({ ...x, imagePath: path }));
              return { ok: path ? 'Imagem pronta. Salve o banner para publicar.' : 'Imagem removida.' };
            }}
          />
        </div>
      </div>
      <div className="adm-ann-actions">
        <button type="submit" className="adm-btn adm-btn-dark" disabled={pending}>
          {pending ? 'Salvando…' : row ? 'Salvar alterações' : 'Criar banner'}
        </button>
        <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setPreview(true)} disabled={!f.title.trim()}>
          Ver prévia
        </button>
        <button type="button" className="adm-btn adm-btn-quiet" onClick={onDone}>
          Cancelar
        </button>
      </div>
      {preview && (
        <AnnouncementModal
          preview
          a={{ title: f.title, body: f.body, imageUrl: publicImage(f.imagePath), ctaLabel: f.ctaLabel || null, ctaUrl: f.ctaUrl || null }}
          onClose={() => setPreview(false)}
        />
      )}
    </form>
  );
}

export default function Announcements({ rows }: { rows: AnnouncementRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [, start] = useTransition();

  return (
    <section className="adm-ann" aria-labelledby="banners">
      <div className="adm-ann-head">
        <h2 id="banners" className="adm-section-title">
          Banners de novidades
        </h2>
        {editing !== 'new' && (
          <button type="button" className="adm-btn adm-btn-dark" onClick={() => setEditing('new')}>
            Novo banner
          </button>
        )}
      </div>

      {editing === 'new' && <Editor row={null} onDone={() => setEditing(null)} />}

      {rows.length === 0 && editing !== 'new' ? (
        <div className="adm-empty">
          <p>Nenhum banner ainda. Crie um para avisar os alunos de um curso novo ou de uma promoção.</p>
        </div>
      ) : (
        <ul className="adm-ann-list">
          {rows.map((r) =>
            editing === r.id ? (
              <li key={r.id}>
                <Editor row={r} onDone={() => setEditing(null)} />
              </li>
            ) : (
              <li key={r.id} className="adm-panel adm-ann-row">
                {r.image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={publicImage(r.image_path)!} alt="" />
                ) : (
                  <span className="adm-ann-noimg" aria-hidden="true" />
                )}
                <div className="adm-ann-info">
                  <div>
                    <span className="adm-ann-status" data-tone={status(r).tone}>
                      {status(r).label}
                    </span>
                    <strong>{r.title}</strong>
                  </div>
                  <p>
                    De {fmt(r.starts_at)} até {fmt(r.ends_at)}
                    {r.dismissed ? `. ${r.dismissed} ${r.dismissed === 1 ? 'aluno marcou' : 'alunos marcaram'} “Não mostrar novamente”` : ''}
                  </p>
                </div>
                <div className="adm-ann-row-actions">
                  <Switch
                    label={r.is_active ? 'Ativo' : 'Pausado'}
                    checked={r.is_active}
                    onChange={(v) =>
                      start(async () => {
                        notify(await setAnnouncementActive(r.id, v));
                        router.refresh();
                      })
                    }
                  />
                  <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setEditing(r.id)}>
                    Editar
                  </button>
                  <ConfirmButton
                    label="Excluir"
                    className="adm-btn adm-btn-quiet"
                    onConfirm={async () => {
                      const res = await deleteAnnouncement(r.id);
                      router.refresh();
                      return res;
                    }}
                  />
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </section>
  );
}
