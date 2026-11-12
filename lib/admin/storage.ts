import { SUPABASE_URL } from '@/lib/supabase/env';

// Capas de cursos e thumbnails de aulas ficam no bucket público "capas".
// Materiais complementares ficam no bucket privado "materiais", em <id da aula>/<arquivo>.
export const IMAGE_BUCKET = 'capas';
export const MATERIAL_BUCKET = 'materiais';
export const MATERIAL_MAX_BYTES = 50 * 1024 * 1024;

export function publicImage(path: string | null | undefined) {
  return path ? `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}` : null;
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0).replace('.', ',')} MB`;
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
