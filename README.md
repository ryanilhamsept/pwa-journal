# Ilham Journal

React/Vite journal app with Supabase sync.

## Local setup

```sh
npm install
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor to create the `journals` table.
3. Copy the Project URL and anon public key from Settings > API into `.env.local`.

Supabase sync is configured in:

```text
src/services/supabaseClient.js
src/services/journals.js
```

### Migrating existing entries from Google Sheets

If you still have the old Apps Script webhook, set `WEBHOOK_URL` in `.env.local` and run:

```sh
node --env-file=.env.local scripts/migrate-to-supabase.mjs
```

## Deploy

Both GitHub Pages and Vercel need `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build time:

- **Vercel**: add them under Project Settings > Environment Variables.
- **GitHub Pages**: add them as repo secrets (Settings > Secrets and variables > Actions) — the workflow already reads `secrets.VITE_SUPABASE_URL` / `secrets.VITE_SUPABASE_ANON_KEY`.
