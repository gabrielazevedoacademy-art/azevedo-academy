'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 6);

function CodeInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <div className="auth-field">
      <label htmlFor="mfa-code">Código de 6 dígitos</label>
      <input
        id="mfa-code"
        className="mfa-code"
        value={value}
        onChange={(e) => onChange(onlyDigits(e.target.value))}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        placeholder="000000"
        autoFocus={autoFocus}
        required
      />
    </div>
  );
}

function translate(message: string) {
  const m = message.toLowerCase();
  if (m.includes('invalid') || m.includes('expired') || m.includes('code'))
    return 'Código incorreto ou expirado. Confira o código mais recente no app e tente de novo.';
  if (m.includes('rate') || m.includes('too many')) return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
  return 'Não foi possível verificar agora. Tente de novo.';
}

/* Pede o código do app autenticador depois do login */
export function MfaVerify({ next }: { next: string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    setBusy(true);
    setError('');
    const supabase = createClient();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp?.[0];
    if (!factor) {
      window.location.assign(`/seguranca?next=${encodeURIComponent(next)}`);
      return;
    }
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    if (err) {
      setError(translate(err.message));
      setCode('');
      setBusy(false);
      return;
    }
    window.location.assign(next);
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {error && <p className="auth-alert auth-alert-error" role="alert">{error}</p>}
      <CodeInput value={code} onChange={setCode} autoFocus />
      <button className="button button-dark auth-submit" type="submit" disabled={busy || code.length !== 6} aria-busy={busy}>
        <span className="auth-submit-label">{busy ? 'Verificando…' : 'Confirmar'}</span>
      </button>
    </form>
  );
}

type Enroll = { factorId: string; qr: string; secret: string };

/* Ativa (ou desativa) a verificação em duas etapas */
export function MfaSetup({ next, active, factorId }: { next: string; active: boolean; factorId: string | null }) {
  const [enroll, setEnroll] = useState<Enroll | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const started = useRef(false);

  async function start() {
    if (started.current) return;
    started.current = true;
    setBusy(true);
    setError('');
    const supabase = createClient();
    // Limpa tentativas anteriores que não foram concluídas
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) {
      if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error: err } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `Autenticador ${new Date().toLocaleDateString('pt-BR')}`,
      issuer: 'Azevedo Academy'
    });
    setBusy(false);
    started.current = false;
    if (err || !data) {
      setError('Não foi possível iniciar a ativação. Recarregue a página e tente de novo.');
      return;
    }
    setEnroll({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!enroll || code.length !== 6) return;
    setBusy(true);
    setError('');
    const { error: err } = await createClient().auth.mfa.challengeAndVerify({ factorId: enroll.factorId, code });
    setBusy(false);
    if (err) {
      setError(translate(err.message));
      setCode('');
      return;
    }
    setDone(true);
  }

  async function turnOff() {
    if (!factorId) return;
    setBusy(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (err) {
      setError('Para desativar, entre de novo e confirme com o código do app antes.');
      return;
    }
    await supabase.auth.refreshSession();
    window.location.reload();
  }

  useEffect(() => {
    if (done) {
      const t = window.setTimeout(() => window.location.assign(next), 1800);
      return () => window.clearTimeout(t);
    }
  }, [done, next]);

  if (done)
    return (
      <p className="auth-alert auth-alert-success" role="status">
        Verificação em duas etapas ativada. A partir de agora, o app vai pedir o código quando for necessário.
      </p>
    );

  if (active)
    return (
      <div className="auth-form">
        {error && <p className="auth-alert auth-alert-error" role="alert">{error}</p>}
        <p className="mfa-status">
          <span aria-hidden="true" />
          Ativada nesta conta
        </p>
        <p className="account-note">
          Ao entrar, além da senha ou do Google, você digita o código do app autenticador no celular.
        </p>
        {confirmOff ? (
          <>
            <p className="account-note">
              Sem a verificação, sua conta fica protegida só pela senha. Contas de administrador não acessam o painel
              sem ela.
            </p>
            <button className="auth-google account-delete" type="button" disabled={busy} onClick={turnOff}>
              {busy ? 'Desativando…' : 'Desativar mesmo assim'}
            </button>
            <button className="auth-forgot account-cancel" type="button" onClick={() => setConfirmOff(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <button className="auth-google account-logout" type="button" onClick={() => setConfirmOff(true)}>
            Desativar verificação em duas etapas
          </button>
        )}
      </div>
    );

  if (!enroll)
    return (
      <div className="auth-form">
        {error && <p className="auth-alert auth-alert-error" role="alert">{error}</p>}
        <ol className="mfa-steps">
          <li>
            Instale um app autenticador no celular, como <strong>Google Authenticator</strong> ou{' '}
            <strong>Microsoft Authenticator</strong> (grátis).
          </li>
          <li>Clique em ativar e leia o QR code com o app.</li>
          <li>Digite o código de 6 dígitos que aparecer no app.</li>
        </ol>
        <button className="button button-dark auth-submit" type="button" onClick={start} disabled={busy} aria-busy={busy}>
          <span className="auth-submit-label">{busy ? 'Preparando…' : 'Ativar verificação em duas etapas'}</span>
        </button>
      </div>
    );

  return (
    <form className="auth-form" onSubmit={confirm}>
      {error && <p className="auth-alert auth-alert-error" role="alert">{error}</p>}
      <div className="mfa-qr">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={enroll.qr} alt="QR code para o app autenticador" width={200} height={200} />
      </div>
      <p className="account-note">
        No app, toque em <strong>+</strong> e escolha ler QR code. Não consegue ler? Escolha digitar a chave e use:
      </p>
      <code className="mfa-secret">{enroll.secret.replace(/(.{4})/g, '$1 ').trim()}</code>
      <CodeInput value={code} onChange={setCode} />
      <button className="button button-dark auth-submit" type="submit" disabled={busy || code.length !== 6} aria-busy={busy}>
        <span className="auth-submit-label">{busy ? 'Confirmando…' : 'Confirmar e ativar'}</span>
      </button>
    </form>
  );
}
