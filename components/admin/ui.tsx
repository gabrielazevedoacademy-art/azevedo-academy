'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { Result } from '@/app/admin/actions';

/* Avisos rápidos no canto da tela (salvo, erro) */
const EVENT = 'adm-toast';

export function notify(result: Result | void) {
  if (!result || (!result.ok && !result.error)) return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: result }));
}

export function Toaster() {
  const [toast, setToast] = useState<{ text: string; error: boolean; key: number } | null>(null);
  useEffect(() => {
    let timer = 0;
    const on = (e: Event) => {
      const r = (e as CustomEvent<Result>).detail;
      if (!r) return;
      setToast({ text: (r.error || r.ok)!, error: !!r.error, key: Date.now() });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setToast(null), r.error ? 6000 : 2600);
    };
    window.addEventListener(EVENT, on);
    return () => {
      window.removeEventListener(EVENT, on);
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <div className="adm-toaster" role="status" aria-live="polite">
      {toast && (
        <p key={toast.key} className="adm-toast" data-error={toast.error}>
          {toast.text}
        </p>
      )}
    </div>
  );
}

/* Chave liga/desliga */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  name,
  defaultChecked
}: {
  checked?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
  disabled?: boolean;
  name?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="adm-switch">
      <input
        type="checkbox"
        role="switch"
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="adm-switch-track" aria-hidden="true" />
      <span className="adm-switch-label">{label}</span>
    </label>
  );
}

/* Exclusão em dois cliques, sem janela do navegador */
export function ConfirmButton({
  label,
  ariaLabel,
  confirmLabel = 'Clique de novo para confirmar',
  onConfirm,
  className = 'adm-btn adm-btn-danger'
}: {
  label: React.ReactNode;
  ariaLabel?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<Result | void>;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      className={className}
      data-armed={armed}
      disabled={pending}
      aria-label={armed ? undefined : ariaLabel}
      onClick={() => {
        if (!armed) {
          setArmed(true);
          timer.current = window.setTimeout(() => setArmed(false), 4000);
          return;
        }
        window.clearTimeout(timer.current);
        setArmed(false);
        start(async () => notify(await onConfirm()));
      }}
    >
      {pending ? 'Excluindo…' : armed ? confirmLabel : label}
    </button>
  );
}

/* Campo de texto curto que cria algo (módulo, aula, curso) */
export function QuickAdd({
  placeholder,
  button,
  onAdd,
  autoFocus,
  onCancel
}: {
  placeholder: string;
  button: string;
  onAdd: (value: string) => Promise<Result | void>;
  autoFocus?: boolean;
  onCancel?: () => void;
}) {
  const [value, setValue] = useState('');
  const [pending, start] = useTransition();
  return (
    <form
      className="adm-quickadd"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        start(async () => {
          const r = await onAdd(value);
          notify(r);
          if (!r?.error) setValue('');
        });
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={160}
        autoFocus={autoFocus}
        onKeyDown={(e) => e.key === 'Escape' && onCancel?.()}
      />
      <button className="adm-btn adm-btn-dark" type="submit" disabled={pending || !value.trim()}>
        {pending ? 'Criando…' : button}
      </button>
      {onCancel && (
        <button className="adm-btn adm-btn-ghost" type="button" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
}

export const Icon = {
  grip: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" />
    </svg>
  ),
  up: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>,
  down: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>,
  chevron: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>,
  plus: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>,
  pencil: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>,
  trash: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>,
  play: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>,
  file: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4" /></svg>,
  link: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>,
  upload: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></svg>,
  image: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-9 8" /></svg>,
  external: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v6H4V6h6" /></svg>
};
