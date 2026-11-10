// Valores públicos do projeto Supabase (a chave "publishable" é feita para ir ao navegador;
// a proteção dos dados é feita pelas regras de acesso do banco). Variáveis de ambiente, se existirem, têm prioridade.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kygnexqmkbjrmzywvcvd.supabase.co';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_M0InRJ6A2MAfrC9IkK3Fjg_hngRGkjC';
