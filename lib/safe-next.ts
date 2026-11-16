/*
  Endereço de retorno depois do login. Só aceita caminhos deste site.
  Bloqueia truques como "//site.com", "/\site.com" e tabs/quebras de linha,
  que o navegador transforma em endereço de outro domínio.
*/
const BASE = 'http://azevedo.invalid';

export function safeNext(value: unknown, fallback = '/'): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback;
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
