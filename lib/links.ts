import { safeNext } from './safe-next';

/*
  Link digitado no painel (botão do banner, aviso). Aceita caminho do site ("/meus-cursos")
  ou endereço https. Devolve null para vazio e undefined para link inválido.
*/
export function cleanLink(value: string): string | null | undefined {
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith('/')) {
    const path = safeNext(v, '');
    if (!path) return undefined;
    return path === '/' ? '/#inicio' : path;
  }
  const url = /^https?:\/\//i.test(v) ? v.replace(/^http:/i, 'https:') : `https://${v}`;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname.includes('.') ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

// Data e hora de Brasília (campo datetime-local) <-> ISO
export const fromLocalInput = (v: string) => (v ? new Date(`${v}:00-03:00`) : null);
export function toLocalInput(iso: string | Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value])
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
