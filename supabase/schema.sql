-- Run this in Supabase Dashboard > SQL Editor

create table if not exists journals (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text not null,
  mood text not null default '😊',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table journals enable row level security;

-- Login is now real Supabase Auth (see src/components/Login.jsx), so access is
-- restricted to signed-in users instead of anyone holding the anon key.
drop policy if exists "Allow anon read" on journals;
drop policy if exists "Allow anon insert" on journals;
drop policy if exists "Allow anon update" on journals;
drop policy if exists "Allow anon delete" on journals;

create policy "Allow authenticated read" on journals for select using (auth.role() = 'authenticated');
create policy "Allow authenticated insert" on journals for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated update" on journals for update using (auth.role() = 'authenticated');
create policy "Allow authenticated delete" on journals for delete using (auth.role() = 'authenticated');

-- This project's Supabase Auth is shared with the Money Tracker app, so an
-- account created there (or here) works in both. Username/password login
-- maps to a dummy email (see Login.jsx) and stores a bookkeeping record
-- here; Supabase Auth itself owns the real password hash. `if not exists`
-- keeps this a no-op if Money Tracker already created the table.
create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  password text not null,
  created_at timestamptz not null default now()
);

alter table users enable row level security;

create policy "Allow user insert own row" on users for insert with check (auth.uid() = id);
create policy "Allow user read own row" on users for select using (auth.uid() = id);
