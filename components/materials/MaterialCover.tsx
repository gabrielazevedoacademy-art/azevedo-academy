import { publicImage } from '@/lib/admin/storage';
import { KIND_LABEL, type MaterialCard } from '@/lib/materials';

// Capa do material. Sem imagem enviada, monta uma capa com o título no painel laranja.
export default function MaterialCover({ m, large }: { m: Pick<MaterialCard, 'title' | 'kind' | 'cover_path'>; large?: boolean }) {
  const img = publicImage(m.cover_path);
  return img ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="mt-cover-img" src={img} alt="" loading={large ? 'eager' : 'lazy'} />
  ) : (
    <span className="mt-cover-auto" aria-hidden="true">
      <span className="mt-cover-kind">{KIND_LABEL[m.kind]}</span>
      <span className="mt-cover-title">{m.title}</span>
    </span>
  );
}
