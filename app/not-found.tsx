import type { Metadata } from 'next';
import ErrorScreen from '@/components/ErrorScreen';

export const metadata: Metadata = { title: 'Página não encontrada | Azevedo Academy', robots: { index: false } };

export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="Esta página não existe"
      text="O link pode estar errado ou a página mudou de lugar. Os cursos continuam no mesmo endereço de sempre."
    >
      <a className="button button-dark" href="/#cursos">
        Ver os cursos
      </a>
      <a className="error-link" href="/">
        Ir para a página inicial
      </a>
    </ErrorScreen>
  );
}
