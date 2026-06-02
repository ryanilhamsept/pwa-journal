import { useState } from 'react';
import { Pen, X, Home, Search, List, Calendar, Menu } from 'lucide-react';
import JournalComposer from '../components/JournalComposer';
import JournalDetail from '../components/JournalDetail';
import JournalList from '../components/JournalList';
import StatCard from '../components/ui/StatCard';
import PasscodeLock from '../components/PasscodeLock';
import { useJournals } from '../hooks/useJournals';

export default function App() {
  const { entries, stats, isLoadingSheet, saveEntry, removeEntry } = useJournals();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isUnlocked) {
    return <PasscodeLock onUnlock={() => setIsUnlocked(true)} />;
  }

  function handleSave(payload) {
    return saveEntry(payload);
  }

  function handlePopupSave(payload) {
    const saved = saveEntry({ ...payload, editingId: editingEntry?.id });
    if (saved) closeComposer();
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
    setComposerOpen(true);
  }

  function openComposer() {
    setEditingEntry(null);
    setSelectedEntry(null);
    setComposerOpen(true);
  }

  function closeComposer() {
    setComposerOpen(false);
    setEditingEntry(null);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  return (
    <main className="app-container" aria-label="Ilham Journal">
      <section className="hero-panel">
        <div className="greeting-header">
          <div className="greeting-text">
            <h1>{getGreeting()}, Ryan</h1>
            <p>Let's capture something new today.</p>
          </div>
          <button
            className="circular-write-icon-btn"
            type="button"
            aria-label="Tulis journal baru"
            onClick={openComposer}
          >
            <Pen size={18} />
          </button>
        </div>
      </section>

      <section className="content-panel">
        <section className="stats-card" aria-label="Ringkasan journal">
          <div className="stats-grid">
            <StatCard label="Total journal" value={stats.totalJournal} />
            <StatCard label="Total word" value={stats.totalWords} />
            <StatCard label="Days" value={stats.totalDays} />
          </div>
        </section>

        <section className="journal-section" aria-label="Daftar journal">
          <div className="section-heading">
            <h1>Recently Added</h1>
            <p className="section-meta-count">{entries.length} {entries.length === 1 ? 'Note' : 'Notes'}</p>
          </div>
          <JournalList entries={entries} isLoading={isLoadingSheet} onView={setSelectedEntry} />
        </section>
      </section>

      <nav className="floating-nav-pill">
        <button className="nav-tab active" type="button" aria-label="Home">
          <div className="tab-circle">
            <Home size={20} />
          </div>
        </button>
        <button className="nav-tab" type="button" aria-label="Search">
          <Search size={20} />
        </button>
        <button className="nav-tab" type="button" aria-label="List">
          <List size={20} />
        </button>
        <button className="nav-tab" type="button" aria-label="Calendar">
          <Calendar size={20} />
        </button>
        <button className="nav-tab" type="button" aria-label="Menu">
          <Menu size={20} />
        </button>
      </nav>

      {composerOpen && (
        <JournalComposer
          onSave={handlePopupSave}
          onClose={closeComposer}
          editingEntry={editingEntry}
        />
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
