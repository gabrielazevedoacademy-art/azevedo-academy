import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_KEY, SUPABASE_URL } from './lib/supabase/env';

// Mantém a sessão de login renovada a cada visita.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
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
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets/|cursos/|ferramentas/|sobre/|influencer-com-ia|favicon|apple-touch-icon|logo|.*\\.(?:html|svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff2?)$).*)'
  ]
};
