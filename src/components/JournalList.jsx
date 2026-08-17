import { ArrowUpRight } from 'lucide-react';
import { getPreview } from '../utils/date';

function LoadingCard() {
  return (
    <div className="journal-loading" aria-label="Loading journal dari Supabase">
      <div className="loading-spinner" />
      <div>
        <strong>Loading journal</strong>
        <p>Syncing from Supabase...</p>
      </div>
    </div>
  );
}

function getTimeAgo(dateString) {
  try {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

function getMoodTag(mood) {
  const mapping = {
    '😊': { label: 'Comfortable', bg: '#e6f2ff', color: '#007aff' },
    '😁': { label: 'Excited', bg: '#e8fcf0', color: '#34c759' },
    '😌': { label: 'Peaceful', bg: '#f3ebff', color: '#af52de' },
    '🥲': { label: 'Emotional', bg: '#fff5e5', color: '#ff9500' },
    '😐': { label: 'Neutral', bg: '#f2f2f7', color: '#8e8e93' },
    '😔': { label: 'Pensive', bg: '#ffe5e9', color: '#ff2d55' },
  };
  return mapping[mood] || { label: 'Journal', bg: '#e6f2ff', color: '#007aff' };
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
      {entries.map((entry) => {
        const tag = getMoodTag(entry.mood);
        return (
          <article
            className="journal-card"
            key={entry.id}
            onClick={() => onView(entry)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-top-row">
              <span className="card-mood-tag" style={{ backgroundColor: tag.bg, color: tag.color }}>
                {tag.label}
              </span>
              <button
                className="card-arrow-btn"
                type="button"
                aria-label="Lihat detail"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(entry);
                }}
              >
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="card-content-block">
              <h3 className="journal-title">{entry.title || getPreview(entry.body, 22)}</h3>
              <p className="journal-text">{entry.body}</p>
            </div>

            <div className="card-footer-row">
              <span className="card-time-ago">{getTimeAgo(entry.createdAt)}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
