import { ChevronLeft } from 'lucide-react';
import { formatDateTime, getPreview } from '../utils/date';

export default function JournalDetail({ entry, onClose, onEdit, onDelete }) {
  if (!entry) return null;

  return (
    <section className="detail-view" aria-label="Detail journal">
      <header className="detail-header">
        <button className="back-button" type="button" aria-label="Kembali" onClick={onClose}>
          <ChevronLeft size={32} strokeWidth={3} />
        </button>
        <div>
          <p>Journal detail</p>
          <h2>{getPreview(entry.body, 42)}</h2>
        </div>
      </header>

      <article className="detail-card">
        <div className="detail-mood">{entry.mood}</div>
        <p className="detail-date">{formatDateTime(entry.createdAt)}</p>
        <p className="detail-body">{entry.body}</p>
        <div className="detail-actions">
          <button className="detail-action edit" type="button" onClick={() => onEdit(entry)}>
            Edit
          </button>
          <button className="detail-action delete" type="button" onClick={() => onDelete(entry)}>
            Delete
          </button>
        </div>
      </article>
    </section>
  );
}
