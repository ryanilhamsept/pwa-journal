import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const MOODS = ['😊', '😁', '😌', '🥲', '😐', '😔'];

export default function JournalComposer({ onSave, message, editingEntry }) {
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('😊');
  const [open, setOpen] = useState(false);

  function submit(event) {
    event.preventDefault();
    const saved = onSave({ body, mood });
    if (!saved) return;
    setBody('');
    setMood('😊');
  }

  if (editingEntry && body !== editingEntry.body) {
    setBody(editingEntry.body);
    setMood(editingEntry.mood);
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

      <label>
        <span>{editingEntry ? 'Edit your journal' : 'How are you feeling today?'}</span>
        <textarea
          rows="1"
          value={body}
          placeholder="I'm very happy"
          aria-label="Tulis catatan"
          onChange={(event) => setBody(event.target.value)}
        />
      </label>

      <button type="submit" className="save-button" aria-label="Simpan catatan">
        <ChevronRight size={30} strokeWidth={4} />
      </button>

      {message && <p className="status">{message}</p>}
    </form>
  );
}
