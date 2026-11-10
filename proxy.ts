import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_KEY, SUPABASE_URL } from './lib/supabase/env';

const PROTECTED = ['/painel', '/admin'];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const path = request.nextUrl.pathname;

  // Se o Supabase devolver o login para outra página (ex.: a Home), encaminha para o callback
  const code = request.nextUrl.searchParams.get('code');
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  if ((code || tokenHash) && path !== '/auth/callback') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  // Renova a sessão a cada requisição; não colocar código entre a criação do cliente e esta chamada.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user && PROTECTED.some((p) => path === p || path.startsWith(p + '/'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Ignora arquivos estáticos e as páginas HTML já prontas
    '/((?!_next/static|_next/image|assets/|favicon|apple-touch-icon|robots.txt|.*\\.(?:html|svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff2?)$).*)'
  ]
};
