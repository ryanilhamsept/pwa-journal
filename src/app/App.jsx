import { useState } from 'react';
import { Home, PenLine } from 'lucide-react';
import JournalComposer from '../components/JournalComposer';
import JournalDetail from '../components/JournalDetail';
import JournalList from '../components/JournalList';
import StatCard from '../components/ui/StatCard';
import { useJournals } from '../hooks/useJournals';

export default function App() {
  const { entries, stats, message, saveEntry, removeEntry } = useJournals();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  function handleSave(payload) {
    const saved = saveEntry({ ...payload, editingId: editingEntry?.id });
    if (saved) setEditingEntry(null);
    return saved;
  }

  function handleDelete(entry) {
    const confirmed = window.confirm('Delete this journal?');
    if (!confirmed) return;
    removeEntry(entry);
    setSelectedEntry(null);
  }

  function handleEdit(entry) {
    setEditingEntry(entry);
    setSelectedEntry(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="phone-shell" aria-label="Ilham Journal">
      <section className="hero-panel">
        <div className="app-header">
          <div className="logo">
            Ilham<span>Journal</span>
          </div>
        </div>
      </section>

      <section className="content-panel">
        <section className="stats-card" aria-label="Ringkasan journal">
          <div className="stats-grid">
            <StatCard label="Total journal" value={stats.totalJournal} />
            <StatCard label="Total word" value={stats.totalWords} />
            <StatCard label="Days" value={stats.totalDays} />
          </div>
          <JournalComposer onSave={handleSave} message={message} editingEntry={editingEntry} />
        </section>

        <section className="journal-section" aria-label="Daftar journal">
          <div className="section-heading">
            <h1>Your journal</h1>
            <p>On this day, you felt Comfortable</p>
          </div>
          <JournalList entries={entries} onView={setSelectedEntry} />
        </section>
      </section>

      <button
        className="floating-write"
        type="button"
        aria-label="Tulis journal baru"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <PenLine size={28} />
      </button>

      <nav className="bottom-nav" aria-label="Navigasi">
        <a className="active" href="#home" aria-label="Home">
          <Home size={24} fill="currentColor" />
          Home
        </a>
      </nav>

      <JournalDetail
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </main>
  );
}
