import { NextResponse } from 'next/server';
import { MATERIAL_BUCKET } from '@/lib/admin/storage';
import { getMaterial, materialUrl } from '@/lib/materials';

// Download de arquivo da biblioteca: confere a permissão e entrega um link temporário (1 minuto)
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const origin = new URL(request.url).origin;
  const found = await getMaterial(slug);
  if (!found) return NextResponse.redirect(`${origin}/materiais`, 303);
  const { material, content, supabase } = found;
  const back = `${origin}${materialUrl(material.slug)}`;
  if (!content?.file_path) return NextResponse.redirect(back, 303);

  const { data } = await supabase.storage
    .from(MATERIAL_BUCKET)
    .createSignedUrl(content.file_path, 60, { download: content.file_name || true });
  if (!data?.signedUrl) return NextResponse.redirect(back, 303);
  await supabase.rpc('track_material', { p_material: material.id, p_kind: 'download' });
  const res = NextResponse.redirect(data.signedUrl, 303);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
