import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

const MOODS = ['😊', '😁', '😌', '🥲', '😐', '😔'];

export default function JournalComposer({ onSave, editingEntry }) {
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
    event.preventDefault();
    const saved = onSave({ title, body, mood });
    if (!saved) return;
    setTitle('');
    setBody('');
    setMood('😊');
  }

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
