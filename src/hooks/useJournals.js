import { useCallback, useEffect, useMemo, useState } from 'react';
import { createJournal, deleteJournal, listJournals, updateJournal } from '../services/googleSheets';
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

function mergeSheetSnapshot(localEntries, sheetEntries) {
  const sheetItems = sheetEntries
    .map((entry) =>
      normalizeEntry({
        ...entry,
        syncId: entry.id,
        syncStatus: 'synced',
      }),
    )
    .filter((entry) => entry.body.trim());

  const localOnlyItems = localEntries
    .map(normalizeEntry)
    .filter((entry) => entry.body.trim() && entry.syncStatus !== 'synced');

  const merged = new Map();

  for (const entry of sheetItems) {
    merged.set(entry.syncId || entry.id, entry);
  }

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
  const [isLoadingSheet, setIsLoadingSheet] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const refreshFromSheet = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setIsLoadingSheet(true);

    try {
      const sheetEntries = await listJournals();
      setEntries((current) => mergeSheetSnapshot(current, sheetEntries));
    } catch {
      // App tetap bisa dipakai offline/lokal kalau endpoint Sheet belum bisa diakses.
    } finally {
      if (showLoading) setIsLoadingSheet(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFromSheet() {
      setIsLoadingSheet(true);

      try {
        const sheetEntries = await listJournals();
        if (cancelled) return;
        setEntries((current) => mergeSheetSnapshot(current, sheetEntries));
      } catch {
        // App tetap bisa dipakai offline/lokal kalau endpoint Sheet belum bisa diakses.
      } finally {
        if (!cancelled) setIsLoadingSheet(false);
      }
    }

    loadFromSheet();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') {
        refreshFromSheet();
      }
    }

    window.addEventListener('focus', refreshFromSheet);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.removeEventListener('focus', refreshFromSheet);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshFromSheet]);

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

  function saveEntry({ body, mood, editingId }) {
    const trimmed = body.trim();
    if (!trimmed) return null;

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
    return entry;
  }

  async function removeEntry(entry) {
    setEntries((current) => current.filter((item) => item.id !== entry.id));

    if (!entry.syncId) return;

    try {
      await deleteJournal(entry.syncId);
    } catch {
      // Kalau delete ke Sheet gagal, data lokal tetap sudah bersih.
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
    isLoadingSheet,
    refreshFromSheet,
    saveEntry,
    removeEntry,
    retryUnsynced,
  };
}
