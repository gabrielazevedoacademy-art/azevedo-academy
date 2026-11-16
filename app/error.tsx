'use client';

import { useEffect } from 'react';
import ErrorScreen from '@/components/ErrorScreen';

// Quando algo falha ao carregar uma página, o aluno vê esta tela em vez de uma página em branco
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      title="Algo não carregou"
      text="Tivemos um problema ao abrir esta página. Tente de novo; se continuar, volte em alguns minutos."
    >
      <button className="button button-dark" type="button" onClick={reset}>
        Tentar de novo
      </button>
      <a className="error-link" href="/">
        Ir para a página inicial
      </a>
    </ErrorScreen>
  );
}
