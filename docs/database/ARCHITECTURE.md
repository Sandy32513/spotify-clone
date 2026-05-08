# Supabase Database Architecture

## Domain

The database supports a Spotify-style music app plus a production asset intake system:

- Listener-facing catalog and playlist experience.
- Supabase Auth-backed user profiles.
- Admin upload portal for local files, folders, archives, validation, duplicate detection, and Supabase Storage uploads.
- Operational reporting, audit logs, and upload reliability tracking.

## Migration Files

- `supabase/migrations/001_initial_schema.sql`: canonical production schema.
- `supabase/rollbacks/001_drop_production_schema.sql`: destructive rollback for development/reset only.
- `supabase/seed.sql`: development catalog seed.
- `supabase/queries/optimized_queries.sql`: query patterns and SQL templates.

## Supabase Features Used

- Auth: `public.users` extends `auth.users`.
- Storage: bucket rows and `storage.objects` policies.
- Realtime: upload and playlist tables are added to `supabase_realtime`.
- RLS: all public app tables are protected.
- Postgres extensions: `pgcrypto`, `citext`, `pg_trgm`, `btree_gin`.

## Admin Model

The current app uses environment-based admin login for the upload portal. The database adds:

- `roles`, `permissions`, `user_roles`, `role_permissions`
- `admin_accounts`
- `admin_sessions`

This lets the app later migrate admin login to Supabase Auth without changing the asset tables.

## Upload Pipeline Persistence

The upload pipeline should write:

1. `upload_batches`
2. `upload_queue_items`
3. `storage_files`
4. `extraction_reports`
5. `validation_reports`
6. `duplicate_reports`
7. `music_assets`
8. `cloud_uploads`
9. `audit_logs`

The current pipeline already writes to Storage and `music_assets`; the schema is ready for progressively persisting the richer lifecycle.

## Applying The Schema

Preferred:

```bash
supabase db push
npm run supabase:storage
```

Manual fallback:

1. Open Supabase SQL Editor.
2. Paste `supabase/migrations/001_initial_schema.sql`.
3. Run it.
4. Run `npm run supabase:storage` locally to ensure buckets are configured through the Storage API.

This environment currently has a service role key but no Supabase CLI, no MCP auth, and no direct Postgres connection string, so live DDL must be applied through SQL Editor or CLI once installed/authenticated.
