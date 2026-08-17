import { createClient } from '@supabase/supabase-js';

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!WEBHOOK_URL || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing WEBHOOK_URL, VITE_SUPABASE_URL, or VITE_SUPABASE_ANON_KEY.');
  console.error('Run with: node --env-file=.env.local scripts/migrate-to-supabase.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchSheetEntries() {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'list' }),
  });

  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok || result.ok === false) {
    throw new Error(result.error || 'Failed to fetch entries from Google Sheet');
  }

  return result.entries || result.data || [];
}

async function main() {
  const entries = await fetchSheetEntries();
  console.log(`Fetched ${entries.length} entries from Google Sheet.`);

  const rows = entries
    .filter((entry) => (entry.body || '').trim())
    .map((entry) => ({
      title: entry.title || '',
      body: entry.body,
      mood: entry.mood || '😊',
      created_at: entry.createdAt || new Date().toISOString(),
      updated_at: entry.updatedAt || entry.createdAt || new Date().toISOString(),
    }));

  if (rows.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  const { data, error } = await supabase.from('journals').insert(rows).select();

  if (error) {
    throw new Error(error.message);
  }

  console.log(`Migrated ${data.length} entries to Supabase.`);
}

main().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
