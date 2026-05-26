import { formatDateTime, getPreview } from '../utils/date';

function LoadingCard() {
  return (
    <div className="journal-loading" aria-label="Loading journal dari Sheet">
      <div className="loading-spinner" />
      <div>
        <strong>Loading journal</strong>
        <p>Syncing from Google Sheet...</p>
      </div>
    </div>
  );
}

export default function JournalList({ entries, isLoading, onView }) {
  if (isLoading && !entries.length) {
    return (
      <div className="entries-list">
        <LoadingCard />
        <div className="journal-card skeleton-card" aria-hidden="true">
          <div className="skeleton-row">
            <span className="skeleton-circle" />
            <span className="skeleton-line long" />
          </div>
          <span className="skeleton-line medium" />
          <span className="skeleton-line short" />
        </div>
      </div>
    );
  }

  if (!entries.length) {
    return <div className="empty-state">Your saved journal will appear here</div>;
  }

  return (
    <div className="entries-list">
      {isLoading && <LoadingCard />}
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
