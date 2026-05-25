import { useEffect, useMemo, useState } from 'react';
import { createJournal, deleteJournal, updateJournal } from '../services/googleSheets';
import { getDayKey } from '../utils/date';

const STORAGE_KEY = 'ilham-journal.entries';

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function normalizeEntry(entry) {
  const now = new Date().toISOString();
  return {
    id: entry.id || crypto.randomUUID(),
    body: entry.body || '',
    mood: entry.mood || '😊',
    syncId: entry.syncId || null,
    syncStatus: entry.syncStatus || 'local',
    createdAt: entry.createdAt || now,
    updatedAt: entry.updatedAt || entry.createdAt || now,
  };
}

export function useJournals() {
  const [entries, setEntries] = useState(() =>
    loadEntries()
      .map(normalizeEntry)
      .filter((entry) => entry.body.trim())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const stats = useMemo(() => {
    const totalWords = entries.reduce(
      (sum, entry) => sum + entry.body.trim().split(/\s+/).filter(Boolean).length,
      0,
    );
    const totalDays = new Set(entries.map((entry) => getDayKey(entry.createdAt))).size;

    return {
      totalJournal: entries.length,
      totalWords,
      totalDays,
    };
  }, [entries]);

  async function syncCreate(entry) {
    try {
      const result = await createJournal(entry);
      setEntries((current) =>
        current.map((item) =>
          item.id === entry.id
            ? {
                ...item,
                syncId: result.syncId,
                syncStatus: result.skipped ? 'local' : 'synced',
              }
            : item,
        ),
      );
      setMessage(result.skipped ? 'Saved locally' : 'Saved to Sheet');
    } catch {
      setEntries((current) =>
        current.map((item) => (item.id === entry.id ? { ...item, syncStatus: 'failed' } : item)),
      );
      setMessage('Saved locally. Sheet sync failed.');
    }
  }

  async function syncUpdate(entry) {
    if (!entry.syncId) {
      syncCreate(entry);
      return;
    }

    try {
      const result = await updateJournal(entry.syncId, entry);
      setEntries((current) =>
        current.map((item) =>
          item.id === entry.id
            ? {
                ...item,
                syncId: result.syncId,
                syncStatus: result.skipped ? 'local' : 'synced',
              }
            : item,
        ),
      );
      setMessage(result.skipped ? 'Updated locally' : 'Updated in Sheet');
    } catch {
      setEntries((current) =>
        current.map((item) => (item.id === entry.id ? { ...item, syncStatus: 'failed' } : item)),
      );
      setMessage('Updated locally. Sheet sync failed.');
    }
  }

  function saveEntry({ body, mood, editingId }) {
    const trimmed = body.trim();
    if (!trimmed) {
      setMessage('Write something first');
      return null;
    }

    const now = new Date().toISOString();

    if (editingId) {
      let updatedEntry = null;
      setEntries((current) =>
        current.map((entry) => {
          if (entry.id !== editingId) return entry;
          updatedEntry = {
            ...entry,
            body: trimmed,
            mood,
            updatedAt: now,
            syncStatus: 'pending',
          };
          return updatedEntry;
        }),
      );
      setTimeout(() => syncUpdate(updatedEntry), 0);
      setMessage('Updating journal...');
      return updatedEntry;
    }

    const entry = normalizeEntry({
      id: crypto.randomUUID(),
      body: trimmed,
      mood,
      syncStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    });
    setEntries((current) => [entry, ...current]);
    setTimeout(() => syncCreate(entry), 0);
    setMessage('Saving to Sheet...');
    return entry;
  }

  async function removeEntry(entry) {
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    setMessage('Journal deleted');

    if (!entry.syncId) return;

    try {
      await deleteJournal(entry.syncId);
    } catch {
      setMessage('Deleted locally. Sheet delete failed.');
    }
  }

  function retryUnsynced() {
    for (const entry of entries.filter((item) => item.syncStatus !== 'synced')) {
      if (entry.syncId) syncUpdate(entry);
      else syncCreate(entry);
    }
  }

  useEffect(() => {
    retryUnsynced();
  }, []);

  return {
    entries,
    stats,
    message,
    setMessage,
    saveEntry,
    removeEntry,
    retryUnsynced,
  };
}
