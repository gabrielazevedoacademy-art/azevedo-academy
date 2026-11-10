import type { Material } from '@/lib/types';
import { Download, File, LinkIcon } from './icons';

export default function MaterialList({ materials }: { materials: Material[] }) {
  if (!materials.length) return null;
  return (
    <ul className="materials">
      {materials.map((m) => {
        const isLink = m.kind === 'link';
        const href = isLink ? m.url! : `/materiais/baixar/${m.id}`;
        return (
          <li key={m.id}>
            <a className="material" href={href} target={isLink ? '_blank' : undefined} rel={isLink ? 'noopener noreferrer' : undefined}>
              <span className="material-icon">{isLink ? <LinkIcon /> : <File />}</span>
              <span className="material-body">
                <strong>{m.title}</strong>
                {m.description && <span>{m.description}</span>}
              </span>
              <Download width={18} height={18} style={{ color: 'var(--subtle)' }} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
