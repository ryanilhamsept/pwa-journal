import { useCallback, useEffect, useMemo, useState } from 'react';
import { createJournal, deleteJournal, listJournals, updateJournal } from '../services/journals';
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
  const syncId = entry.syncId || entry.id || null;

  return {
    id: entry.id || crypto.randomUUID(),
    title: entry.title || '',
    body: entry.body || '',
    mood: entry.mood || '😊',
    syncId,
    syncStatus: entry.syncStatus || (syncId ? 'synced' : 'local'),
    createdAt: entry.createdAt || now,
    updatedAt: entry.updatedAt || entry.createdAt || now,
  };
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function mergeRemoteSnapshot(localEntries, remoteEntries) {
  const remoteItems = remoteEntries
    .map((entry) =>
      normalizeEntry({
        ...entry,
        syncId: entry.id,
        syncStatus: 'synced',
      }),
    )
    .filter((entry) => entry.body.trim());

  const localMap = new Map();
  for (const entry of localEntries) {
    localMap.set(entry.syncId || entry.id, entry);
  }

  const merged = new Map();

  for (const entry of remoteItems) {
    const key = entry.syncId || entry.id;
    const local = localMap.get(key);
    
    // Preserve local title if the remote entry has an empty/missing title
    if (local && local.title && !entry.title) {
      entry.title = local.title;
    }
    
    merged.set(key, entry);
  }

  const localOnlyItems = localEntries
    .map(normalizeEntry)
    .filter((entry) => entry.body.trim() && entry.syncStatus !== 'synced');

  for (const entry of localOnlyItems) {
    const key = entry.syncId || entry.id;
    if (!merged.has(key)) merged.set(key, entry);
  }

  return sortEntries(Array.from(merged.values()));
}

export function useJournals() {
  const [entries, setEntries] = useState(() =>
    sortEntries(loadEntries().map(normalizeEntry).filter((entry) => entry.body.trim())),
  );
  const [isLoadingRemote, setIsLoadingRemote] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const refreshFromRemote = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setIsLoadingRemote(true);

    try {
      const remoteEntries = await listJournals();
      setEntries((current) => mergeRemoteSnapshot(current, remoteEntries));
    } catch {
      // App tetap bisa dipakai offline/lokal kalau endpoint Supabase belum bisa diakses.
    } finally {
      if (showLoading) setIsLoadingRemote(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFromRemote() {
      setIsLoadingRemote(true);

      try {
        const remoteEntries = await listJournals();
        if (cancelled) return;
        setEntries((current) => mergeRemoteSnapshot(current, remoteEntries));
      } catch {
        // App tetap bisa dipakai offline/lokal kalau endpoint Supabase belum bisa diakses.
      } finally {
        if (!cancelled) setIsLoadingRemote(false);
      }
    }

    loadFromRemote();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') {
        refreshFromRemote();
      }
    }

    window.addEventListener('focus', refreshFromRemote);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.removeEventListener('focus', refreshFromRemote);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshFromRemote]);

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
    } catch {
      setEntries((current) =>
        current.map((item) => (item.id === entry.id ? { ...item, syncStatus: 'failed' } : item)),
      );
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
    } catch {
      setEntries((current) =>
        current.map((item) => (item.id === entry.id ? { ...item, syncStatus: 'failed' } : item)),
      );
    }
  }

  function saveEntry({ title, body, mood, editingId }) {
    const trimmedBody = body.trim();
    const trimmedTitle = (title || '').trim();
    if (!trimmedBody) return null;

    const now = new Date().toISOString();

    if (editingId) {
      let updatedEntry = null;
      setEntries((current) =>
        current.map((entry) => {
          if (entry.id !== editingId) return entry;
          updatedEntry = {
            ...entry,
            title: trimmedTitle,
            body: trimmedBody,
            mood,
            updatedAt: now,
            syncStatus: 'pending',
          };
          return updatedEntry;
        }),
      );
      setTimeout(() => syncUpdate(updatedEntry), 0);
      return updatedEntry;
    }

    const entry = normalizeEntry({
      id: crypto.randomUUID(),
      title: trimmedTitle,
      body: trimmedBody,
      mood,
      syncStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    });
    setEntries((current) => [entry, ...current]);
    setTimeout(() => syncCreate(entry), 0);
    return entry;
  }

  async function removeEntry(entry) {
    setEntries((current) => current.filter((item) => item.id !== entry.id));

    if (!entry.syncId) return;

    try {
      await deleteJournal(entry.syncId);
    } catch {
      // Kalau delete ke Supabase gagal, data lokal tetap sudah bersih.
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
    isLoadingRemote,
    refreshFromRemote,
    saveEntry,
    removeEntry,
    retryUnsynced,
  };
}
