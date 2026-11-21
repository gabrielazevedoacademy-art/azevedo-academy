'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const track = (id: string, kind: 'copy' | 'open') => {
  createClient().rpc('track_material', { p_material: id, p_kind: kind }).then(() => {});
};

export function CopyPrompt({ id, text }: { id: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-prompt">
      <div className="mt-prompt-head">
        <span>Prompt</span>
        <button
          type="button"
          className="button button-dark mt-copy"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
            } catch {
              // Navegadores sem acesso à área de transferência: seleciona o texto para copiar à mão
              const range = document.createRange();
              const el = document.getElementById(`prompt-${id}`);
              if (el) {
                range.selectNodeContents(el);
                window.getSelection()?.removeAllRanges();
                window.getSelection()?.addRange(range);
              }
            }
            setCopied(true);
            track(id, 'copy');
            window.setTimeout(() => setCopied(false), 2500);
          }}
        >
          {copied ? 'Copiado' : 'Copiar prompt'}
        </button>
      </div>
      <pre id={`prompt-${id}`}>{text}</pre>
      <p className="mt-sr" role="status">
        {copied ? 'Prompt copiado para a área de transferência.' : ''}
      </p>
    </div>
  );
}

export function OpenLink({ id, url }: { id: string; url: string }) {
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {}
  return (
    <div className="mt-action">
      <a className="button button-dark" href={url} target="_blank" rel="noopener noreferrer" onClick={() => track(id, 'open')}>
        Abrir link
      </a>
      <span>Abre em {host}</span>
    </div>
  );
}
