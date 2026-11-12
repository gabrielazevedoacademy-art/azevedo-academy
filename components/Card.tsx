import type { CatalogItem } from '@/lib/catalog';

export default function Card({ item, ratio }: { item: CatalogItem; ratio: string }) {
  const external = /^https?:\/\//.test(item.href);
  return (
    <a
      className="card"
      href={item.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      <div className="card-media" style={{ '--ratio': ratio } as React.CSSProperties}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" loading="lazy" />
        ) : (
          // Sem capa: a marca da Academy, discreta, no lugar da imagem
          // eslint-disable-next-line @next/next/no-img-element
          <img className="card-fallback" src="/logo.svg" alt="" aria-hidden="true" />
        )}
        {item.badge && <span className="card-badge">{item.badge}</span>}
      </div>
      <h3 className="card-title">{item.title}</h3>
      {item.description && <p className="card-description">{item.description}</p>}
    </a>
  );
}
