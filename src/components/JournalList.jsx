import { formatDateTime, getPreview } from '../utils/date';

export default function JournalList({ entries, onView }) {
  if (!entries.length) {
    return <div className="empty-state">Your saved journal will appear here</div>;
  }

  return (
    <div className="entries-list">
      {entries.map((entry) => (
        <article className="journal-card" key={entry.id}>
          <div className="journal-card-top">
            <div className="journal-mood">{entry.mood}</div>
            <div>
              <div className="journal-title">{getPreview(entry.body)}</div>
              <div className="journal-meta">{formatDateTime(entry.createdAt)}</div>
            </div>
            <div className="journal-tag">{entry.syncStatus === 'synced' ? 'Sheet' : 'Local'}</div>
          </div>
          <p className="journal-text">{entry.body}</p>
          <button className="view-detail" type="button" onClick={() => onView(entry)}>
            View detail
          </button>
        </article>
      ))}
    </div>
  );
}
