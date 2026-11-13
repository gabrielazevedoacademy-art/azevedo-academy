// Registro de quais segundos do vídeo a pessoa assistiu (1 bit por segundo).
// Pular para o fim não conta: só vale o que passou na tela.

export const COMPLETE_AT = 0.95; // 95% do vídeo assistido = aula concluída

export function createBitmap(duration: number) {
  return new Uint8Array(Math.ceil(Math.max(1, duration) / 8));
}

export function decodeBitmap(b64: string, duration: number) {
  const bits = createBitmap(duration);
  if (!b64) return bits;
  try {
    const raw = atob(b64);
    for (let i = 0; i < Math.min(raw.length, bits.length); i++) bits[i] = raw.charCodeAt(i);
  } catch {
    // dado antigo inválido: começa do zero
  }
  return bits;
}

export function encodeBitmap(bits: Uint8Array) {
  let s = '';
  for (let i = 0; i < bits.length; i++) s += String.fromCharCode(bits[i]);
  return btoa(s);
}

export function mark(bits: Uint8Array, second: number) {
  if (second < 0 || second >= bits.length * 8) return;
  bits[second >> 3] |= 1 << (second & 7);
}

export function countWatched(bits: Uint8Array, duration: number) {
  let n = 0;
  for (let s = 0; s < duration; s++) if (bits[s >> 3] & (1 << (s & 7))) n++;
  return n;
}
