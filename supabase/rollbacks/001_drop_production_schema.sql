begin;

drop policy if exists storage_public_audio_read on storage.objects;
drop policy if exists storage_admin_manage_pipeline_buckets on storage.objects;
drop policy if exists storage_user_uploads_own on storage.objects;

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.notifications cascade;
drop table if exists public.activity_logs cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.pipeline_errors cascade;
drop table if exists public.pipeline_runs cascade;
drop table if exists public.cloud_uploads cascade;
drop table if exists public.duplicate_reports cascade;
drop table if exists public.validation_reports cascade;
drop table if exists public.extraction_reports cascade;
drop table if exists public.upload_queue_items cascade;
drop table if exists public.playback_events cascade;
drop table if exists public.recently_played cascade;
drop table if exists public.likes cascade;
drop table if exists public.playlist_songs cascade;
drop table if exists public.playlist_collaborators cascade;
drop table if exists public.playlists cascade;
drop table if exists public.music_assets cascade;
drop table if exists public.song_genres cascade;
drop table if exists public.song_artists cascade;
drop table if exists public.songs cascade;
drop table if exists public.storage_files cascade;
drop table if exists public.upload_batches cascade;
drop table if exists public.genres cascade;
drop table if exists public.albums cascade;
drop table if exists public.artists cascade;
drop table if exists public.admin_sessions cascade;
drop table if exists public.admin_accounts cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.role_permissions cascade;
drop table if exists public.permissions cascade;
drop table if exists public.roles cascade;
drop table if exists public.system_settings cascade;
drop table if exists public.users cascade;

drop function if exists public.search_catalog(text, integer);
drop function if exists public.record_playback_event(uuid, text, integer, text, text, jsonb);
drop schema if exists app_private cascade;

drop type if exists public.storage_file_kind cascade;
drop type if exists public.upload_status cascade;
drop type if exists public.asset_status cascade;
drop type if exists public.song_status cascade;
drop type if exists public.playlist_visibility cascade;
drop type if exists public.app_role cascade;

delete from storage.buckets
where id in ('songs', 'music-assets', 'extracted-files', 'temp-uploads', 'user-uploads', 'logs', 'reports');

commit;
