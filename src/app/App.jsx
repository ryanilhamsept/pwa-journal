import { useState } from 'react';
import { Home, PenLine, X } from 'lucide-react';
import JournalComposer from '../components/JournalComposer';
import JournalDetail from '../components/JournalDetail';
import JournalList from '../components/JournalList';
import StatCard from '../components/ui/StatCard';
import { useJournals } from '../hooks/useJournals';

export default function App() {
  const { entries, stats, isLoadingSheet, saveEntry, removeEntry } = useJournals();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);

  function handleSave(payload) {
    const saved = saveEntry({ ...payload, editingId: editingEntry?.id });
    if (saved) setEditingEntry(null);
    return saved;
  }

  function handlePopupSave(payload) {
    const saved = saveEntry(payload);
    if (saved) setComposerOpen(false);
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
    setComposerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openComposer() {
    setEditingEntry(null);
    setSelectedEntry(null);
    setComposerOpen(true);
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
          <JournalComposer onSave={handleSave} editingEntry={editingEntry} />
        </section>

        <section className="journal-section" aria-label="Daftar journal">
          <div className="section-heading">
            <h1>Your journal</h1>
            <p>On this day, you felt Comfortable</p>
          </div>
          <JournalList entries={entries} isLoading={isLoadingSheet} onView={setSelectedEntry} />
        </section>
      </section>

      <button
        className="floating-write"
        type="button"
        aria-label="Tulis journal baru"
        onClick={openComposer}
      >
        <PenLine size={28} />
      </button>

      <nav className="bottom-nav" aria-label="Navigasi">
        <a className="active" href="#home" aria-label="Home">
          <Home size={24} fill="currentColor" />
          Home
        </a>
      </nav>

      {composerOpen && (
        <div className="composer-overlay" role="dialog" aria-modal="true" aria-label="Tulis journal baru">
          <button className="composer-backdrop" type="button" aria-label="Tutup popup" onClick={() => setComposerOpen(false)} />
          <section className="composer-sheet">
            <div className="composer-sheet-header">
              <div>
                <p>New journal</p>
                <h2>Write today</h2>
              </div>
              <button className="composer-close" type="button" aria-label="Tutup popup" onClick={() => setComposerOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <JournalComposer onSave={handlePopupSave} />
          </section>
        </div>
      )}

      <JournalDetail
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </main>
  );
}
