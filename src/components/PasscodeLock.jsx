import { useState, useEffect } from 'react';
import { Lock, Delete, ShieldAlert } from 'lucide-react';

export default function PasscodeLock({ onUnlock }) {
  const [passcode, setPasscode] = useState(() => {
    return localStorage.getItem('journal.passcode') || '123698';
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (input.length === 6) {
      if (input === passcode) {
        // Correct passcode
        onUnlock();
      } else {
        // Incorrect passcode
        setShake(true);
        setError(true);
        // Reset input after a short delay
        const timer = setTimeout(() => {
          setInput('');
          setShake(false);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [input, passcode, onUnlock]);

  const handleKeyPress = (num) => {
    if (input.length < 6 && !shake) {
      setInput((prev) => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    if (input.length > 0 && !shake) {
      setInput((prev) => prev.slice(0, -1));
      setError(false);
    }
  };

  return (
    <section className="passcode-overlay" aria-label="Passcode Lock">
      <div className="passcode-container">
        <div className="passcode-header">
          <div className={`passcode-icon-wrapper ${error ? 'error' : ''}`}>
            {error ? <ShieldAlert size={28} className="icon-error" /> : <Lock size={28} className="icon-lock" />}
          </div>
          <h2>Masukkan Passcode</h2>
          <p className={error ? 'text-error' : ''}>
            {error ? 'Passcode salah, silakan coba lagi' : 'Masukkan 6 digit passcode untuk membuka jurnal'}
          </p>
        </div>

        <div className={`passcode-dots ${shake ? 'shake' : ''}`}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`passcode-dot ${i < input.length ? 'filled' : ''} ${error ? 'error' : ''}`}
            />
          ))}
        </div>

        <div className="passcode-keyboard">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className="key-btn"
              onClick={() => handleKeyPress(num.toString())}
            >
              {num}
            </button>
          ))}
          <div className="key-empty" />
          <button
            type="button"
            className="key-btn"
            onClick={() => handleKeyPress('0')}
          >
            0
          </button>
          <button
            type="button"
            className="key-btn action-btn"
            onClick={handleBackspace}
            aria-label="Delete"
          >
            <Delete size={22} />
          </button>
        </div>


      </div>
    </section>
  );
}
