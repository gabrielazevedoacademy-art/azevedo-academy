import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { needsSecondFactor, verifyUrl } from '@/lib/supabase/mfa';

// Recebe os links de confirmação de cadastro e de recuperação de senha
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const raw = searchParams.get('next') ?? '/';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
  const supabase = await createClient();

  // Depois de entrar, quem tem verificação em duas etapas passa pelo código antes de seguir
  const go = async (target: string) =>
    NextResponse.redirect(`${origin}${(await needsSecondFactor(supabase)) ? verifyUrl(target) : target}`);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return go(next);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'email' | 'recovery' | 'signup' });
    if (!error) return go(type === 'recovery' ? '/nova-senha' : next);
  }
  return NextResponse.redirect(`${origin}/entrar?aviso=link`);
}
