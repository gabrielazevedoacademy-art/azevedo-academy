import type { CatalogItem } from '@/lib/catalog';

export default function Card({ item, ratio }: { item: CatalogItem; ratio: string }) {
  const content = (
    <>
      <div className="card-media" style={{ '--ratio': ratio } as React.CSSProperties}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.hideCaption ? `${item.title}${item.comingSoon ? ' (em breve)' : ''}` : ''}
            loading="lazy"
            width={1200}
            height={1500}
          />
        ) : (
          // Sem capa: a marca da Academy, discreta, no lugar da imagem
          // eslint-disable-next-line @next/next/no-img-element
          <img className="card-fallback" src="/logo.svg" alt="" aria-hidden="true" />
        )}
        {item.badge && <span className="card-badge">{item.badge}</span>}
        {item.comingSoon && (
          <span className="card-ribbon" aria-hidden="true">
            Em breve
          </span>
        )}
      </div>
      {!item.hideCaption && (
        <>
          <h3 className="card-title">{item.title}</h3>
          {item.description && <p className="card-description">{item.description}</p>}
        </>
      )}
    </>
  );

  const className = item.comingSoon ? 'card is-soon' : 'card';

  if (!item.href) return <div className={className}>{content}</div>;

  const external = /^https?:\/\//.test(item.href);
  return (
    <a
      className={className}
      href={item.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={item.hideCaption ? item.title : undefined}
    >
      {content}
    </a>
  );
}
