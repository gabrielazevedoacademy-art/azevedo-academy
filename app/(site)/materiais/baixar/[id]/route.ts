import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Gera um link temporário de download; as regras do banco decidem quem pode baixar.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.redirect(new URL(`/entrar?next=/materiais`, request.url));

  const { data: material } = await supabase.from('materials').select('kind, url, storage_path, title').eq('id', id).maybeSingle();
  if (!material) return NextResponse.redirect(new URL('/materiais', request.url));
  if (material.kind === 'link' && material.url) return NextResponse.redirect(material.url);

  const { data } = await supabase.storage.from('materiais').createSignedUrl(material.storage_path!, 60, { download: true });
  if (!data?.signedUrl) return NextResponse.redirect(new URL('/materiais', request.url));
  return NextResponse.redirect(data.signedUrl);
}
