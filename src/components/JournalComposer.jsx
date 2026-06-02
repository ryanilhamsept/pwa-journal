import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';

const MOODS = ['😊', '😁', '😌', '🥲', '😐', '😔'];

export default function JournalComposer({ onSave, editingEntry, onClose }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('😊');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!editingEntry) {
      setTitle('');
      setBody('');
      setMood('😊');
      return;
    }
    setTitle(editingEntry.title || '');
    setBody(editingEntry.body || '');
    setMood(editingEntry.mood || '😊');
  }, [editingEntry]);

  function submit(event) {
    if (event) event.preventDefault();
    const saved = onSave({ title, body, mood });
    if (!saved) return;
    setTitle('');
    setBody('');
    setMood('😊');
  }

  // If onClose is provided, render the premium full-screen slate editor
  if (onClose) {
    return (
      <div className="document-composer-overlay" role="dialog" aria-modal="true">
        <header className="document-composer-header">
          <button
            className="circular-back-button"
            type="button"
            aria-label="Tutup editor"
            onClick={onClose}
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="composer-header-right">
            <button
              className="yellow-check-button"
              type="button"
              aria-label="Simpan catatan"
              onClick={submit}
            >
              <Check size={26} strokeWidth={3} />
            </button>
          </div>
        </header>

        <main className="document-composer-body">
          <div className="document-mood-selector">
            <span className="mood-label">How are you feeling?</span>
            <div className="mood-row">
              {MOODS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`mood-btn ${item === mood ? 'active' : ''}`}
                  onClick={() => setMood(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="document-content-area">
            <input
              type="text"
              value={title}
              placeholder="A Quiet Pause"
              className="document-title-input"
              aria-label="Judul jurnal"
              onChange={(event) => setTitle(event.target.value)}
            />
            <textarea
              value={body}
              placeholder="I didn't expect today to feel like this..."
              className="document-body-textarea"
              aria-label="Tulis cerita catatan"
              onChange={(event) => setBody(event.target.value)}
            />
          </div>
        </main>
      </div>
    );
  }

  // Otherwise, render the classic inline composer bar inside stats card
  return (
    <form className="mood-composer" onSubmit={submit}>
      <div className="mood-picker">
        <button
          type="button"
          className="mood-icon"
          aria-label="Pilih mood"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {mood}
        </button>
        {open && (
          <div className="mood-options">
            {MOODS.map((item) => (
              <button
                key={item}
                type="button"
                className={item === mood ? 'active' : ''}
                onClick={() => {
                  setMood(item);
                  setOpen(false);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="composer-inputs">
        <input
          type="text"
          value={title}
          placeholder="Judul catatan..."
          className="composer-title-input"
          aria-label="Judul catatan"
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          rows="1"
          value={body}
          placeholder={editingEntry ? 'Edit your journal' : 'How are you feeling today?'}
          aria-label="Tulis catatan"
          onChange={(event) => setBody(event.target.value)}
        />
      </div>

      <button type="submit" className="save-button" aria-label="Simpan catatan">
        <ChevronRight size={30} strokeWidth={4} />
      </button>
    </form>
  );
}
