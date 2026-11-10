import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Recebe o retorno do Google e dos links de e-mail (confirmação e recuperação de senha)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const rawNext = searchParams.get('next') ?? '/painel';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/painel';

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'email' | 'recovery' | 'signup' });
    if (!error) return NextResponse.redirect(`${origin}${type === 'recovery' ? '/nova-senha' : next}`);
  }

  return NextResponse.redirect(`${origin}/entrar?erro=link`);
}
