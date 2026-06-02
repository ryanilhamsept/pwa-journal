import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { formatDateTime } from '../utils/date';

export default function JournalDetail({ entry, onClose, onEdit, onDelete }) {
  if (!entry) return null;

  return (
    <section className="detail-view" aria-label="Detail journal">
      <header className="document-detail-header">
        <button
          className="circular-back-button"
          type="button"
          aria-label="Kembali"
          onClick={onClose}
        >
          <ArrowLeft size={24} />
        </button>

        <div className="detail-header-actions">
          <div className="detail-mood-badge" aria-label={`Mood: ${entry.mood}`}>
            {entry.mood}
          </div>
          
          <button
            className="header-action-btn edit-btn"
            type="button"
            aria-label="Edit catatan"
            onClick={() => onEdit(entry)}
          >
            <Edit size={20} />
          </button>
          
          <button
            className="header-action-btn delete-btn"
            type="button"
            aria-label="Hapus catatan"
            onClick={() => onDelete(entry)}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <main className="document-detail-body">
        <p className="detail-date">{formatDateTime(entry.createdAt)}</p>
        <h1 className="detail-title">{entry.title || 'Catatan Tanpa Judul'}</h1>
        <div className="detail-body-content">
          {entry.body.split('\n').map((paragraph, index) => (
            <p key={index} className="detail-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </main>
    </section>
  );
}
