# Database Security Audit

## Security Model

- Tables in `public` have RLS enabled.
- Data API access is granted explicitly per role, matching Supabase's current API security model.
- RBAC is stored in database tables and evaluated through private-schema functions.
- Authorization does not depend on `raw_user_meta_data` or user-editable JWT metadata.
- Service-role access is assumed only for trusted server-side pipeline code.

## RLS Summary

- Public catalog reads are limited to published, non-deleted songs and visible artists/albums/playlists.
- Users can read/update their own profile.
- Playlist owners and collaborators can manage playlist membership.
- Likes, recently played rows, playback events, and notifications are owner-scoped.
- Upload, validation, duplicate, pipeline, audit, and settings tables are admin-only.
- `service_role` receives explicit table grants for server-side pipeline writes.

## Storage Policies

- `songs` and `music-assets` are public-read buckets for playable audio.
- Admins can manage pipeline buckets: `songs`, `music-assets`, `temp-uploads`, `extracted-files`, `logs`, `reports`.
- `user-uploads` is owner-scoped by first path segment matching `auth.uid()`.
- Bucket size and MIME restrictions are configured in SQL and in `scripts/configure-supabase-storage.ts`.

## Risks And Mitigations

- Current admin portal uses environment-based credentials and an HTTP-only signed cookie. The schema adds DB-backed RBAC for future integration with Supabase Auth.
- Uploaded archive extraction is protected in code with traversal checks, executable/script blocking, archive depth limits, and max entry/byte limits.
- Public buckets expose audio URLs. Use private buckets and signed URLs if licensing requires restricted playback.
- `audit_logs` can grow quickly. Retain detailed audit rows for security-relevant operations and archive old rows to storage if needed.

## Operational Checklist

- Rotate `SUPABASE_SERVICE_ROLE_KEY` if it has ever been exposed client-side.
- Set a strong `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- Run database advisors after applying migrations.
- Confirm Data API exposed schemas and table grants in Supabase Dashboard.
- Confirm bucket policies in Storage > Policies.
