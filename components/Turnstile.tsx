'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/*
  Proteção contra robôs (Cloudflare Turnstile).
  Na maioria das vezes passa sozinha, sem a pessoa precisar clicar em nada.
  O código gerado vai junto com o formulário e o Supabase confere antes de aceitar.
  Cada código vale para uma tentativa só, então o widget recomeça a cada envio.
*/

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// Chave pública do widget (pode aparecer no navegador). A chave secreta fica só no Supabase.
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAF-2rp_hwefsuVND';

let loader: Promise<void> | null = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        loader = null;
        reject(new Error('turnstile'));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}

export default function Turnstile({
  resetKey,
  onToken,
  compact = false,
  waiting = false
}: {
  resetKey?: unknown;
  onToken?: (token: string) => void;
  compact?: boolean;
  waiting?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const retries = useRef(0);
  const [token, setToken] = useState('');
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    let cancelled = false;
    let retryTimer = 0;
    const update = (t: string) => {
      setToken(t);
      onTokenRef.current?.(t);
    };
    // Falhou ou expirou: tenta de novo sozinho algumas vezes antes de pedir para recarregar
    const retry = () => {
      update('');
      if (retries.current >= 3) {
        setFailed(true);
        return;
      }
      retries.current++;
      retryTimer = window.setTimeout(() => {
        if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
      }, 1200);
    };
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          language: 'pt-br',
          theme: 'light',
          size: compact ? 'compact' : 'flexible',
          // Sempre visível: se a Cloudflare pedir um clique, a pessoa vê a caixa
          appearance: 'always',
          'refresh-expired': 'auto',
          'refresh-timeout': 'auto',
          callback: (t: string) => {
            retries.current = 0;
            setFailed(false);
            update(t);
          },
          'expired-callback': () => update(''),
          'timeout-callback': retry,
          'error-callback': () => {
            retry();
            return true;
          }
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [compact]);

  // Depois de cada envio, gera um código novo
  useEffect(() => {
    if (resetKey === undefined || !widget.current || !window.turnstile) return;
    window.turnstile.reset(widget.current);
    setToken('');
    onTokenRef.current?.('');
  }, [resetKey]);

  // Clicou e a verificação está demorando: explica o que fazer
  useEffect(() => {
    if (!waiting) {
      setSlow(false);
      return;
    }
    const t = window.setTimeout(() => setSlow(true), 5000);
    return () => window.clearTimeout(t);
  }, [waiting]);

  return (
    <>
      <div ref={box} className="captcha" />
      <input type="hidden" name="captchaToken" value={token} />
      {failed ? (
        <p className="auth-hint captcha-error" role="alert">
          A verificação de segurança não carregou. Recarregue a página e tente de novo.
        </p>
      ) : (
        slow && (
          <p className="auth-hint" role="status">
            A verificação está demorando um pouco. Se aparecer uma caixa da Cloudflare acima, clique nela; o login
            continua sozinho em seguida.
          </p>
        )
      )}
    </>
  );
}

/*
  Deixa o botão sempre clicável. Se a pessoa enviar antes da verificação terminar,
  o envio espera o código chegar e continua sozinho (sem botão travado).
*/
export function useCaptchaGate() {
  const formRef = useRef<HTMLFormElement>(null);
  const tokenRef = useRef('');
  const [token, setToken] = useState('');
  const [waiting, setWaiting] = useState(false);

  const onToken = useCallback((t: string) => {
    tokenRef.current = t;
    setToken(t);
  }, []);

  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    if (tokenRef.current) return;
    e.preventDefault();
    setWaiting(true);
  }, []);

  // O código chegou depois do clique: envia depois que o campo escondido já tem o valor
  useEffect(() => {
    if (waiting && token) {
      setWaiting(false);
      formRef.current?.requestSubmit();
    }
  }, [waiting, token]);

  return { formRef, onToken, onSubmit, waiting };
}
