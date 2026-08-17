import { supabase } from './supabaseClient';

const TABLE = 'journals';

export async function listJournals() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    mood: row.mood,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createJournal(entry) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title: entry.title,
      body: entry.body,
      mood: entry.mood,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return { syncId: data.id };
}

export async function updateJournal(id, entry) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      title: entry.title,
      body: entry.body,
      mood: entry.mood,
      updated_at: entry.updatedAt,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return { syncId: data.id };
}

export async function deleteJournal(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
