import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Direito de acesso e portabilidade (LGPD art. 18, II e V): cópia dos dados do próprio aluno
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.redirect(new URL('/entrar?next=/configuracoes', request.url));

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('created_at, expires_at, source, courses(title, slug)')
    .eq('user_id', user.id);

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const body = {
    gerado_em: new Date().toISOString(),
    controlador: 'Azevedo Academy (azevedoacademy.com.br)',
    conta: {
      id: user.id,
      email: user.email,
      nome: meta.full_name ?? meta.name ?? null,
      foto: meta.avatar_url ?? meta.picture ?? null,
      email_confirmado_em: user.email_confirmed_at ?? null,
      criada_em: user.created_at,
      ultimo_acesso: user.last_sign_in_at ?? null,
      formas_de_entrar: (user.identities ?? []).map((i) => i.provider)
    },
    matriculas: enrollments ?? []
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="meus-dados-azevedo-academy.json"',
      'Cache-Control': 'no-store'
    }
  });
}
