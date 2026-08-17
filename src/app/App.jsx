import { useEffect, useState } from 'react';
import { LogOut, Pen } from 'lucide-react';
import JournalComposer from '../components/JournalComposer';
import JournalDetail from '../components/JournalDetail';
import JournalList from '../components/JournalList';
import StatCard from '../components/ui/StatCard';
import Login from '../components/Login';
import { useJournals } from '../hooks/useJournals';
import { supabase } from '../services/supabaseClient';

export default function App() {
  const { entries, stats, isLoadingRemote, saveEntry, removeEntry } = useJournals();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0a051b] text-white">
        <p className="text-base font-semibold">Checking session...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
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
          <div className="header-actions">
            <button
              className="circular-write-icon-btn"
              type="button"
              aria-label="Tulis journal baru"
              onClick={openComposer}
            >
              <Pen size={18} />
            </button>
            <button
              className="circular-write-icon-btn"
              type="button"
              aria-label="Keluar"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="content-panel">
        <section className="journal-section" aria-label="Daftar journal">
          <div className="section-heading">
            <h1>Recently Added</h1>
          </div>

          <section className="stats-card" aria-label="Ringkasan journal">
            <div className="stats-grid">
              <StatCard label="Total journal" value={stats.totalJournal} />
              <StatCard label="Total word" value={stats.totalWords} />
              <StatCard label="Days" value={stats.totalDays} />
            </div>
          </section>

          <JournalList entries={entries} isLoading={isLoadingRemote} onView={setSelectedEntry} />
        </section>
      </section>

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
