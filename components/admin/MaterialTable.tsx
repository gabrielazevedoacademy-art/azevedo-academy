import { deleteMaterial, toggleMaterial } from '@/app/admin/actions';
import type { Material } from '@/lib/types';
import { File, LinkIcon, Trash } from '../icons';
import { ConfirmSubmit } from './Forms';

export default function MaterialTable({ materials, revalidate }: { materials: Material[]; revalidate: string }) {
  if (!materials.length) return <p className="hint">Nenhum material ainda.</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <tbody>
          {materials.map((m) => (
            <tr key={m.id}>
              <td style={{ width: 40 }}><span className="material-icon" style={{ width: 32, height: 32 }}>{m.kind === 'link' ? <LinkIcon /> : <File />}</span></td>
              <td>
                <strong>{m.title}</strong>
                {m.description && <div className="muted" style={{ fontSize: 12 }}>{m.description}</div>}
              </td>
              <td>{m.is_published ? <span className="badge badge-orange">Visível</span> : <span className="badge">Oculto</span>}</td>
              <td>
                <div className="row-actions">
                  <form action={toggleMaterial}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="published" value={m.is_published ? '1' : '0'} />
                    <input type="hidden" name="revalidate" value={revalidate} />
                    <button className="btn btn-ghost btn-sm" type="submit">{m.is_published ? 'Ocultar' : 'Mostrar'}</button>
                  </form>
                  <form action={deleteMaterial}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="revalidate" value={revalidate} />
                    <ConfirmSubmit message={`Excluir "${m.title}"? O arquivo será apagado.`}><Trash width={14} height={14} /></ConfirmSubmit>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
