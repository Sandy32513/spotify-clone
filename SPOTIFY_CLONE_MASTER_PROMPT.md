# ⚡ SPOTIFY CLONE — MASTER PRODUCTION PROMPT
# Version: 3.0.0 | Author: Sandy (Santhosh) | Stack: Next.js + Supabase + Cloudinary + Tailwind CSS
# Project Location: D:\SPOTIFY CLONE
# Classification: PRODUCTION-GRADE | PIXEL-PERFECT | ZERO-BUG GUARANTEED

---

> **YOU ARE:** A senior full-stack engineer with 15+ years of experience in React, Next.js, Supabase, Cloudinary, TypeScript, Tailwind CSS, WebSockets, audio engineering, and production deployment.
>
> **YOUR MISSION:** Build a 100% pixel-perfect Spotify clone from scratch — production-ready, zero-bug, fully optimized, with all advanced features listed below.
>
> **YOUR CONSTRAINTS:** Zero tolerance for half-baked solutions. Every line of code must be production-grade. Every edge case must be handled. Every component must be accessible. Every API call must have error handling.

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [ER Diagram & Database Schema](#3-er-diagram--database-schema)
4. [Supabase Complete Setup](#4-supabase-complete-setup)
5. [Cloudinary Configuration](#5-cloudinary-configuration)
6. [Project Structure](#6-project-structure)
7. [Environment Variables](#7-environment-variables)
8. [Tailwind Config — Exact Spotify Colors](#8-tailwind-config--exact-spotify-colors)
9. [Next.js App Configuration](#9-nextjs-app-configuration)
10. [Authentication System](#10-authentication-system)
11. [UI Components — Complete Library](#11-ui-components--complete-library)
12. [Pages — All Routes](#12-pages--all-routes)
13. [Advanced Audio Player](#13-advanced-audio-player)
14. [Waveform Visualization](#14-waveform-visualization)
15. [WebSocket Real-time Sync](#15-websocket-real-time-sync)
16. [Offline Caching Strategy](#16-offline-caching-strategy)
17. [Search & Discovery Engine](#17-search--discovery-engine)
18. [Playlist Management](#18-playlist-management)
19. [Library System](#19-library-system)
20. [Social Features](#20-social-features)
21. [API Routes — Complete](#21-api-routes--complete)
22. [Hooks Library](#22-hooks-library)
23. [Context Providers](#23-context-providers)
24. [Performance Optimization](#24-performance-optimization)
25. [Security Implementation](#25-security-implementation)
26. [PWA Configuration](#26-pwa-configuration)
27. [CI/CD Pipeline](#27-cicd-pipeline)
28. [Bug Audit — All Scenarios](#28-bug-audit--all-scenarios)
29. [Task Board](#29-task-board)
30. [Execution Plan](#30-execution-plan)

---

## 1. PROJECT OVERVIEW

### 1.1 — Core Directive

```
You are building a Spotify Web Clone that is:
- Visually identical to Spotify Web Player (pixel-perfect)
- Functionally complete (all core + advanced features)
- Production-deployed (Vercel + Supabase + Cloudinary)
- Zero-bug guaranteed (full audit before deploy)
- Portfolio-ready (README, architecture docs, clean code)
```
### 1.2 — Feature Matrix

```
TIER 1 — CORE (Must Have, Day 1)
═══════════════════════════════
✅ User Authentication (Email + OAuth: Google, GitHub, Apple)
✅ Music Player (play, pause, skip, previous, seek, volume)
✅ Queue Management (add, remove, reorder, clear)
✅ Shuffle + Repeat (off / repeat-one / repeat-all)
✅ Like / Unlike songs
✅ Create / Edit / Delete Playlists
✅ Browse (Home, Search, Library)
✅ Artist Pages
✅ Album Pages
✅ Responsive Design (Mobile + Desktop)
✅ Keyboard Shortcuts

TIER 2 — ADVANCED (Must Have, Week 1)
══════════════════════════════════════
✅ Waveform Visualization (WaveSurfer.js)
✅ Audio Crossfade
✅ Equalizer (bass, mid, treble)
✅ WebSocket real-time sync (listen along)
✅ Offline Caching (Service Worker + IndexedDB)
✅ Lyrics display (synced)
✅ Recently Played
✅ Recommended Songs (collaborative filtering)
✅ Follow Artists
✅ Podcast support
✅ Song radio
✅ Smart Search (fuzzy + autocomplete)

TIER 3 — PREMIUM (Portfolio Extra)
════════════════════════════════════
✅ Canvas API audio visualizer
✅ Mood-based playlists
✅ Share playlist (public link)
✅ Embed player
✅ Download for offline (PWA)
✅ Dark/Light mode toggle
✅ Custom playlist cover upload (Cloudinary)
✅ Listening statistics dashboard
✅ Mobile app gestures (swipe to like/skip)
✅ Crossfade settings (0-12 seconds)
```

### 1.3 — Success Criteria

```
Performance:
  - Lighthouse Score: 95+ (all categories)
  - First Contentful Paint: < 1.2s
  - Time to Interactive: < 2.5s
  - Core Web Vitals: All GREEN

Quality:
  - Zero TypeScript errors
  - Zero ESLint warnings
  - 90%+ test coverage (unit + integration)
  - Zero accessibility violations (WCAG 2.1 AA)

Security:
  - Zero exposed secrets
  - All APIs authenticated
  - CSRF protection
  - Rate limiting on all endpoints
  - Input sanitization everywhere
```

---

## 2. TECH STACK & ARCHITECTURE

### 2.1 — Technology Decisions

```
FRONTEND
════════
Framework:      Next.js 14 (App Router)
Language:       TypeScript 5.3
Styling:        Tailwind CSS 3.4 + CSS Modules (for complex animations)
State:          Zustand 4.5 (global) + React Query 5 (server state)
Animation:      Framer Motion 11
Audio:          Howler.js 2.2 + WaveSurfer.js 7
Icons:          Lucide React + Custom SVG sprites
Fonts:          Circular Std (Spotify's actual font) via local files
                Fallback: DM Sans (Google Fonts)

BACKEND
════════
Runtime:        Next.js API Routes (Edge Runtime where possible)
Database:       Supabase PostgreSQL (Row Level Security)
Auth:           Supabase Auth (JWT + OAuth)
Storage:        Supabase Storage (songs) + Cloudinary (images)
Realtime:       Supabase Realtime (WebSockets)
Cache:          Redis (Upstash) — rate limiting + session cache
Search:         Supabase Full-Text Search + pg_trgm extension

INFRASTRUCTURE
══════════════
Hosting:        Vercel (Edge Network)
CDN:            Cloudinary (images) + Vercel Edge (assets)
Monitoring:     Vercel Analytics + Sentry
CI/CD:          GitHub Actions
PWA:            next-pwa + Service Worker
```

### 2.2 — System Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SPOTIFY CLONE ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────┘

  CLIENT (Browser / PWA)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Next.js 14 App Router                                                │
  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐                 │
  │  │  React UI   │  │  Zustand    │  │ React Query  │                 │
  │  │  Components │  │  (Player,   │  │ (Songs,      │                 │
  │  │             │  │   Queue,    │  │  Albums,     │                 │
  │  │             │  │   User)     │  │  Playlists)  │                 │
  │  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘                 │
  │         │                │                 │                          │
  │  ┌──────▼──────────────────────────────────▼──────┐                 │
  │  │            Howler.js + WaveSurfer.js             │                 │
  │  │            Audio Engine + Visualizer             │                 │
  │  └──────────────────────────────────────────────── ┘                 │
  │                                                                        │
  │  Service Worker (PWA + Offline Cache)                                 │
  │  IndexedDB (Offline Queue + Liked Songs Cache)                        │
  └────────────────────────┬─────────────────────────────────────────────┘
                           │  HTTPS / WebSocket
  ┌────────────────────────▼──────────────────────────────────────────────┐
  │  Next.js API Routes (Vercel Edge)                                     │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
  │  │  /auth   │ │  /songs  │ │/playlist │ │  /search │                │
  │  │  /user   │ │  /album  │ │  /queue  │ │  /radio  │                │
  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘                │
  │       │            │             │             │                       │
  │  ┌────▼────────────▼─────────────▼─────────────▼────┐               │
  │  │                   Middleware Layer                  │               │
  │  │     (Auth guard, Rate limit, CORS, Validation)     │               │
  │  └────────────────────────┬──────────────────────────┘               │
  └───────────────────────────┼───────────────────────────────────────────┘
                              │
  ┌───────────────────────────▼───────────────────────────────────────────┐
  │  SUPABASE                                                              │
  │  ┌──────────────┐  ┌────────────────┐  ┌───────────────────────────┐ │
  │  │  PostgreSQL  │  │  Auth Service  │  │   Realtime (WebSockets)   │ │
  │  │  (RLS)       │  │  JWT + OAuth   │  │   Live play state sync    │ │
  │  │              │  │                │  │   Friend activity         │ │
  │  └──────────────┘  └────────────────┘  └───────────────────────────┘ │
  │  ┌──────────────┐  ┌────────────────┐                                 │
  │  │   Storage    │  │   Edge Funcs   │                                 │
  │  │  (Audio MP3) │  │  (Webhooks)    │                                 │
  │  └──────────────┘  └────────────────┘                                 │
  └───────────────────────────────────────────────────────────────────────┘
                              │
  ┌───────────────────────────▼───────────────────────────────────────────┐
  │  CLOUDINARY (Image CDN)                                               │
  │  • Album art (optimized WebP/AVIF)                                    │
  │  • Artist photos                                                       │
  │  • Playlist covers (user uploads)                                      │
  │  • Automatic format optimization + smart cropping                     │
  └───────────────────────────────────────────────────────────────────────┘
```

---

## 3. ER DIAGRAM & DATABASE SCHEMA

### 3.1 — Entity Relationship Diagram (ASCII)

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    profiles   │       │    artists    │       │    albums     │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id (uuid) PK  │       │ id (uuid) PK  │       │ id (uuid) PK  │
│ username      │       │ name          │       │ title         │
│ full_name     │       │ bio           │       │ artist_id FK  │
│ avatar_url    │       │ avatar_url    │       │ cover_url     │
│ is_premium    │       │ cover_url     │       │ release_date  │
│ country       │       │ verified      │       │ album_type    │
│ created_at    │       │ genres        │       │ total_tracks  │
│ updated_at    │       │ followers_cnt │       │ label         │
└───────┬───────┘       │ monthly_lstrs │       │ created_at    │
        │               │ created_at    │       └───────┬───────┘
        │               └───────┬───────┘               │
        │                       │                        │
        │               ┌───────▼────────────────────────▼───────┐
        │               │                 songs                    │
        │               ├─────────────────────────────────────────┤
        │               │ id (uuid) PK                             │
        │               │ title                                    │
        │               │ artist_id FK → artists.id                │
        │               │ album_id FK → albums.id                  │
        │               │ audio_url (Supabase Storage)             │
        │               │ cover_url (Cloudinary)                   │
        │               │ duration_ms                              │
        │               │ track_number                             │
        │               │ lyrics (JSONB — timestamped lines)       │
        │               │ play_count                               │
        │               │ waveform_data (JSONB — peaks array)      │
        │               │ genres (TEXT[])                          │
        │               │ is_explicit                              │
        │               │ bpm                                      │
        │               │ key_signature                            │
        │               │ created_at                               │
        │               └───────┬─────────────────────────────────┘
        │                       │
        │           ┌───────────▼──────────────┐
        │           │    playlist_songs          │
        │           ├──────────────────────────┤
        │           │ id (uuid) PK              │
        │           │ playlist_id FK            │
        │           │ song_id FK                │
        │           │ added_by FK → profiles.id │
        │           │ position (int)            │
        │           │ added_at                  │
        │           └───────────────────────────┘
        │
        │   ┌─────────────────────────────────────────────────────┐
        │   │                   playlists                          │
        │   ├─────────────────────────────────────────────────────┤
        │   │ id (uuid) PK                                         │
        │   │ name                                                  │
        │   │ description                                          │
        │   │ cover_url (Cloudinary)                               │
        │   │ owner_id FK → profiles.id                            │
        │   │ is_public (bool)                                      │
        │   │ is_collaborative (bool)                               │
        │   │ follower_count                                        │
        │   │ embed_token (for embed player)                        │
        │   │ created_at                                            │
        │   │ updated_at                                            │
        │   └─────────────────────────────────────────────────────┘
        │
        │   ┌─────────────────────┐    ┌────────────────────────┐
        │   │    liked_songs      │    │   followed_artists      │
        │   ├─────────────────────┤    ├────────────────────────┤
        │   │ user_id FK          │    │ user_id FK              │
        │   │ song_id FK          │    │ artist_id FK            │
        │   │ liked_at            │    │ followed_at             │
        │   │ PRIMARY KEY(u,s)    │    │ PRIMARY KEY(u,a)        │
        │   └─────────────────────┘    └────────────────────────┘
        │
        │   ┌─────────────────────┐    ┌────────────────────────┐
        │   │   play_history      │    │  user_play_sessions    │
        │   ├─────────────────────┤    ├────────────────────────┤
        │   │ id (uuid) PK        │    │ id (uuid) PK           │
        │   │ user_id FK          │    │ user_id FK             │
        │   │ song_id FK          │    │ device_id              │
        │   │ played_at           │    │ current_song_id FK     │
        │   │ played_pct (0-100)  │    │ position_ms            │
        │   │ device_type         │    │ is_playing             │
        │   └─────────────────────┘    │ queue (JSONB)          │
        │                              │ updated_at             │
        │                              └────────────────────────┘
        │
        │   ┌─────────────────────┐    ┌────────────────────────┐
        │   │  followed_playlists │    │    notifications       │
        │   ├─────────────────────┤    ├────────────────────────┤
        │   │ user_id FK          │    │ id (uuid) PK           │
        │   │ playlist_id FK      │    │ user_id FK             │
        │   │ followed_at         │    │ type (string)          │
        │   │ PRIMARY KEY(u,p)    │    │ payload (JSONB)        │
        │   └─────────────────────┘    │ read (bool)            │
                                       │ created_at             │
                                       └────────────────────────┘
```

---

## 4. SUPABASE COMPLETE SETUP

### 4.1 — Full SQL Schema (Run in Supabase SQL Editor)

```sql
-- ============================================================
-- SPOTIFY CLONE — COMPLETE SUPABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 30),
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  country TEXT DEFAULT 'US',
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say')),
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: artists
-- ============================================================
CREATE TABLE public.artists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  genres TEXT[] DEFAULT '{}',
  monthly_listeners INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full text search index for artists
CREATE INDEX artists_name_trgm_idx ON public.artists USING GIN (name gin_trgm_ops);

-- ============================================================
-- TABLE: albums
-- ============================================================
CREATE TABLE public.albums (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  cover_url TEXT,
  release_date DATE,
  album_type TEXT DEFAULT 'album' CHECK (album_type IN ('album', 'single', 'ep', 'compilation')),
  total_tracks INTEGER DEFAULT 0,
  label TEXT,
  genres TEXT[] DEFAULT '{}',
  description TEXT,
  is_explicit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX albums_artist_id_idx ON public.albums(artist_id);
CREATE INDEX albums_title_trgm_idx ON public.albums USING GIN (title gin_trgm_ops);

-- ============================================================
-- TABLE: songs
-- ============================================================
CREATE TABLE public.songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  track_number INTEGER DEFAULT 1,
  disc_number INTEGER DEFAULT 1,
  lyrics JSONB DEFAULT '[]',
  play_count INTEGER DEFAULT 0,
  waveform_data JSONB DEFAULT '{"peaks": []}',
  genres TEXT[] DEFAULT '{}',
  is_explicit BOOLEAN DEFAULT FALSE,
  bpm DECIMAL(5,2),
  key_signature TEXT,
  time_signature TEXT DEFAULT '4/4',
  popularity INTEGER DEFAULT 0 CHECK (popularity >= 0 AND popularity <= 100),
  isrc TEXT UNIQUE,
  preview_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Composite text search vector for songs
ALTER TABLE public.songs ADD COLUMN search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION songs_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.title, '') || ' ' ||
    coalesce((SELECT name FROM public.artists WHERE id = NEW.artist_id), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER songs_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION songs_search_vector_update();

CREATE INDEX songs_search_vector_idx ON public.songs USING GIN (search_vector);
CREATE INDEX songs_title_trgm_idx ON public.songs USING GIN (title gin_trgm_ops);
CREATE INDEX songs_artist_id_idx ON public.songs(artist_id);
CREATE INDEX songs_album_id_idx ON public.songs(album_id);

-- ============================================================
-- TABLE: playlists
-- ============================================================
CREATE TABLE public.playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 200),
  description TEXT CHECK (length(description) <= 1000),
  cover_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  is_collaborative BOOLEAN DEFAULT FALSE,
  follower_count INTEGER DEFAULT 0,
  embed_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  track_count INTEGER DEFAULT 0,
  total_duration_ms BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX playlists_owner_id_idx ON public.playlists(owner_id);
CREATE INDEX playlists_name_trgm_idx ON public.playlists USING GIN (name gin_trgm_ops);

-- ============================================================
-- TABLE: playlist_songs
-- ============================================================
CREATE TABLE public.playlist_songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

CREATE INDEX playlist_songs_playlist_id_idx ON public.playlist_songs(playlist_id);
CREATE INDEX playlist_songs_song_id_idx ON public.playlist_songs(song_id);

-- ============================================================
-- TABLE: liked_songs
-- ============================================================
CREATE TABLE public.liked_songs (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, song_id)
);

CREATE INDEX liked_songs_user_id_idx ON public.liked_songs(user_id);

-- ============================================================
-- TABLE: followed_artists
-- ============================================================
CREATE TABLE public.followed_artists (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, artist_id)
);

-- ============================================================
-- TABLE: followed_playlists
-- ============================================================
CREATE TABLE public.followed_playlists (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, playlist_id)
);

-- ============================================================
-- TABLE: play_history
-- ============================================================
CREATE TABLE public.play_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  played_percentage INTEGER DEFAULT 0 CHECK (played_percentage >= 0 AND played_percentage <= 100),
  device_type TEXT DEFAULT 'web' CHECK (device_type IN ('web', 'mobile', 'desktop', 'tv')),
  source TEXT DEFAULT 'direct' -- 'playlist', 'album', 'search', 'radio', 'direct'
);

CREATE INDEX play_history_user_id_idx ON public.play_history(user_id);
CREATE INDEX play_history_played_at_idx ON public.play_history(played_at DESC);

-- ============================================================
-- TABLE: user_play_sessions (Real-time sync)
-- ============================================================
CREATE TABLE public.user_play_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  current_song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
  position_ms INTEGER DEFAULT 0,
  is_playing BOOLEAN DEFAULT FALSE,
  volume INTEGER DEFAULT 100 CHECK (volume >= 0 AND volume <= 100),
  shuffle_mode BOOLEAN DEFAULT FALSE,
  repeat_mode TEXT DEFAULT 'off' CHECK (repeat_mode IN ('off', 'one', 'all')),
  queue JSONB DEFAULT '[]',
  context TEXT, -- 'playlist:uuid', 'album:uuid', 'artist:uuid', 'search'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_release', 'playlist_follow', 'friend_activity', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB DEFAULT '{}',
  image_url TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX notifications_created_at_idx ON public.notifications(created_at DESC);

-- ============================================================
-- TABLE: podcasts
-- ============================================================
CREATE TABLE public.podcasts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  publisher TEXT,
  total_episodes INTEGER DEFAULT 0,
  genres TEXT[] DEFAULT '{}',
  is_explicit BOOLEAN DEFAULT FALSE,
  rss_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: podcast_episodes
-- ============================================================
CREATE TABLE public.podcast_episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration_ms INTEGER DEFAULT 0,
  episode_number INTEGER,
  season_number INTEGER DEFAULT 1,
  release_date DATE,
  is_explicit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: search_history
-- ============================================================
CREATE TABLE public.search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  result_type TEXT, -- 'song', 'artist', 'album', 'playlist'
  result_id UUID,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX search_history_user_id_idx ON public.search_history(user_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followed_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followed_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Playlists: public ones visible to all, private only to owner
CREATE POLICY "Public playlists are viewable by everyone" ON public.playlists
  FOR SELECT USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Users can create playlists" ON public.playlists
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own playlists" ON public.playlists
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own playlists" ON public.playlists
  FOR DELETE USING (owner_id = auth.uid());

-- Playlist songs: viewable with playlist access
CREATE POLICY "Playlist songs follow playlist visibility" ON public.playlist_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_id AND (p.is_public = true OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY "Playlist owners and collaborators can add songs" ON public.playlist_songs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_id AND (p.owner_id = auth.uid() OR p.is_collaborative = true)
    )
  );

CREATE POLICY "Playlist owners can remove songs" ON public.playlist_songs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.playlists p 
      WHERE p.id = playlist_id AND p.owner_id = auth.uid()
    )
  );

-- Liked songs: private to user
CREATE POLICY "Users can only see their own liked songs" ON public.liked_songs
  FOR ALL USING (user_id = auth.uid());

-- Play history: private to user
CREATE POLICY "Users can only see their own history" ON public.play_history
  FOR ALL USING (user_id = auth.uid());

-- Play sessions: private to user
CREATE POLICY "Users manage their own sessions" ON public.user_play_sessions
  FOR ALL USING (user_id = auth.uid());

-- Notifications: private to user
CREATE POLICY "Users see their own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update playlist track count when songs added/removed
CREATE OR REPLACE FUNCTION update_playlist_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.playlists 
    SET 
      track_count = track_count + 1,
      total_duration_ms = total_duration_ms + (SELECT duration_ms FROM public.songs WHERE id = NEW.song_id),
      updated_at = NOW()
    WHERE id = NEW.playlist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.playlists 
    SET 
      track_count = GREATEST(track_count - 1, 0),
      total_duration_ms = GREATEST(total_duration_ms - (SELECT duration_ms FROM public.songs WHERE id = OLD.song_id), 0),
      updated_at = NOW()
    WHERE id = OLD.playlist_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER playlist_songs_stats_trigger
  AFTER INSERT OR DELETE ON public.playlist_songs
  FOR EACH ROW EXECUTE FUNCTION update_playlist_stats();

-- Increment play count on history insert
CREATE OR REPLACE FUNCTION increment_play_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.songs SET play_count = play_count + 1 WHERE id = NEW.song_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_play_count_trigger
  AFTER INSERT ON public.play_history
  FOR EACH ROW EXECUTE FUNCTION increment_play_count();

-- Updated_at auto-trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STORAGE BUCKETS SETUP (Run via Supabase Dashboard or API)
-- ============================================================
-- Bucket: songs (private, 50MB max per file)
-- Bucket: podcast-audio (private, 500MB max per file)
-- Bucket: avatars (public, 5MB max per file)

-- ============================================================
-- REALTIME SUBSCRIPTIONS (Enable in Supabase Dashboard)
-- ============================================================
-- Enable realtime for:
-- • user_play_sessions
-- • notifications
-- • playlist_songs
-- • liked_songs

-- ============================================================
-- SEED DATA — Sample Artists, Albums, Songs
-- ============================================================
-- NOTE: Replace audio_url values with your actual Supabase Storage URLs
-- or the song links you provided

INSERT INTO public.artists (id, name, bio, verified, genres, monthly_listeners) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'The Weeknd', 'Canadian singer and songwriter', true, ARRAY['pop', 'r&b', 'synth-pop'], 85000000),
  ('a1000000-0000-0000-0000-000000000002', 'Dua Lipa', 'English-Albanian singer', true, ARRAY['pop', 'dance-pop', 'disco'], 72000000),
  ('a1000000-0000-0000-0000-000000000003', 'Drake', 'Canadian rapper and singer', true, ARRAY['hip-hop', 'rap', 'r&b'], 90000000),
  ('a1000000-0000-0000-0000-000000000004', 'Taylor Swift', 'American singer-songwriter', true, ARRAY['pop', 'country', 'indie-pop'], 95000000),
  ('a1000000-0000-0000-0000-000000000005', 'Billie Eilish', 'American singer and songwriter', true, ARRAY['pop', 'electropop', 'dark-pop'], 65000000);

INSERT INTO public.albums (id, title, artist_id, cover_url, release_date, album_type, total_tracks) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'After Hours', 'a1000000-0000-0000-0000-000000000001', 'https://res.cloudinary.com/demo/image/upload/after_hours.jpg', '2020-03-20', 'album', 14),
  ('b1000000-0000-0000-0000-000000000002', 'Future Nostalgia', 'a1000000-0000-0000-0000-000000000002', 'https://res.cloudinary.com/demo/image/upload/future_nostalgia.jpg', '2020-03-27', 'album', 11),
  ('b1000000-0000-0000-0000-000000000003', 'Certified Lover Boy', 'a1000000-0000-0000-0000-000000000003', 'https://res.cloudinary.com/demo/image/upload/clb.jpg', '2021-09-03', 'album', 21);

-- Insert songs with YOUR provided audio links:
-- REPLACE the audio_url values below with your actual song links
INSERT INTO public.songs (title, artist_id, album_id, audio_url, cover_url, duration_ms, track_number, play_count) VALUES
  ('Blinding Lights', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'YOUR_AUDIO_LINK_1', 'YOUR_COVER_1', 200040, 1, 3000000),
  ('Levitating', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'YOUR_AUDIO_LINK_2', 'YOUR_COVER_2', 203064, 5, 2500000),
  ('Midnight Rain', 'a1000000-0000-0000-0000-000000000004', NULL, 'YOUR_AUDIO_LINK_3', 'YOUR_COVER_3', 174072, 7, 1800000),
  ('Ghost Town', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'YOUR_AUDIO_LINK_4', 'YOUR_COVER_4', 219040, 11, 980000);
```

---

## 5. CLOUDINARY CONFIGURATION

### 5.1 — Cloudinary Setup

```javascript
// lib/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// Upload presets to create in Cloudinary Dashboard:
// 1. 'spotify_covers' — for album/playlist covers
//    - Max size: 5MB
//    - Allowed formats: jpg, png, webp
//    - Transformations: auto format, auto quality, 640x640 crop fill
// 2. 'spotify_avatars' — for user profile photos
//    - Max size: 2MB
//    - Transformations: 200x200 crop fill, face detection

export const CLOUDINARY_PRESETS = {
  covers: 'spotify_covers',
  avatars: 'spotify_avatars',
} as const;

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  const { width = 300, height = 300, quality = 'auto', format = 'auto' } = options;
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality,
    fetch_format: format,
    dpr: 'auto',
  });
}

export async function uploadImage(
  file: Buffer | string,
  options: {
    folder: string;
    publicId?: string;
    preset?: string;
  }
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(
    typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
    {
      folder: options.folder,
      public_id: options.publicId,
      upload_preset: options.preset || CLOUDINARY_PRESETS.covers,
      overwrite: true,
      resource_type: 'image',
    }
  );
  
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
```

---

## 6. PROJECT STRUCTURE

```
D:\SPOTIFY CLONE\
├── .env.local                          # Environment variables (never commit)
├── .env.example                        # Template for env vars
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
│
├── public/
│   ├── fonts/
│   │   ├── CircularStd-Black.woff2
│   │   ├── CircularStd-Bold.woff2
│   │   ├── CircularStd-Book.woff2
│   │   ├── CircularStd-Medium.woff2
│   │   └── CircularStd-Light.woff2
│   ├── icons/
│   │   ├── spotify-icon.svg
│   │   ├── favicon.ico
│   │   └── apple-touch-icon.png
│   ├── manifest.json                   # PWA manifest
│   └── sw.js                          # Service Worker
│
├── src/
│   ├── app/                            # Next.js 14 App Router
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Home (redirect to /home)
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                     # Auth routes (no sidebar)
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/page.tsx
│   │   │
│   │   ├── (main)/                     # Main app (with sidebar + player)
│   │   │   ├── layout.tsx              # Main layout (sidebar + player)
│   │   │   ├── home/page.tsx
│   │   │   ├── search/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [query]/page.tsx
│   │   │   ├── library/page.tsx
│   │   │   ├── artist/[id]/page.tsx
│   │   │   ├── album/[id]/page.tsx
│   │   │   ├── playlist/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── liked-songs/page.tsx
│   │   │   ├── recently-played/page.tsx
│   │   │   ├── genre/[slug]/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [username]/page.tsx
│   │   │   ├── stats/page.tsx
│   │   │   └── queue/page.tsx
│   │   │
│   │   └── api/                        # API Routes
│   │       ├── auth/
│   │       │   ├── callback/route.ts
│   │       │   └── signout/route.ts
│   │       ├── songs/
│   │       │   ├── route.ts            # GET /api/songs
│   │       │   ├── [id]/route.ts       # GET, PATCH /api/songs/:id
│   │       │   └── [id]/like/route.ts  # POST, DELETE
│   │       ├── playlists/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   ├── [id]/songs/route.ts
│   │       │   ├── [id]/follow/route.ts
│   │       │   └── [id]/cover/route.ts
│   │       ├── artists/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── [id]/follow/route.ts
│   │       ├── albums/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── search/route.ts
│   │       ├── player/
│   │       │   ├── session/route.ts
│   │       │   └── history/route.ts
│   │       ├── upload/
│   │       │   ├── image/route.ts
│   │       │   └── song/route.ts
│   │       └── recommendations/route.ts
│   │
│   ├── components/                     # Reusable components
│   │   ├── ui/                         # Base UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Tooltip.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarLeft.tsx
│   │   │   ├── NowPlayingBar.tsx       # Bottom player bar
│   │   │   ├── NowPlayingPanel.tsx     # Right panel (queue/lyrics)
│   │   │   ├── TopBar.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── player/
│   │   │   ├── Player.tsx              # Full player controller
│   │   │   ├── PlayerControls.tsx      # Play/pause/skip buttons
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── VolumeControl.tsx
│   │   │   ├── WaveformVisualizer.tsx
│   │   │   ├── AudioVisualizer.tsx     # Canvas visualizer
│   │   │   ├── QueuePanel.tsx
│   │   │   ├── LyricsPanel.tsx
│   │   │   ├── Equalizer.tsx
│   │   │   └── CrossfadeControl.tsx
│   │   │
│   │   ├── cards/
│   │   │   ├── SongCard.tsx
│   │   │   ├── AlbumCard.tsx
│   │   │   ├── ArtistCard.tsx
│   │   │   ├── PlaylistCard.tsx
│   │   │   ├── PodcastCard.tsx
│   │   │   └── GenreCard.tsx
│   │   │
│   │   ├── lists/
│   │   │   ├── SongList.tsx            # Full song list with headers
│   │   │   ├── SongRow.tsx             # Individual song row
│   │   │   ├── AlbumList.tsx
│   │   │   └── ArtistList.tsx
│   │   │
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturedSection.tsx
│   │   │   ├── HorizontalScrollSection.tsx
│   │   │   ├── RecentlyPlayedSection.tsx
│   │   │   ├── FeaturedCharts.tsx
│   │   │   └── RecommendedSection.tsx
│   │   │
│   │   └── modals/
│   │       ├── PlaylistModal.tsx       # Create/edit playlist
│   │       ├── AddToPlaylistModal.tsx
│   │       ├── ShareModal.tsx
│   │       ├── UploadModal.tsx
│   │       └── SettingsModal.tsx
│   │
│   ├── hooks/                          # Custom hooks
│   │   ├── usePlayer.ts
│   │   ├── useQueue.ts
│   │   ├── useLikedSongs.ts
│   │   ├── useRecentlyPlayed.ts
│   │   ├── useSearch.ts
│   │   ├── usePlaylist.ts
│   │   ├── useArtist.ts
│   │   ├── useAlbum.ts
│   │   ├── useRealtime.ts
│   │   ├── useOfflineCache.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useWaveform.ts
│   │   ├── useMediaSession.ts
│   │   └── useDebounce.ts
│   │
│   ├── store/                          # Zustand stores
│   │   ├── playerStore.ts
│   │   ├── queueStore.ts
│   │   ├── uiStore.ts
│   │   └── userStore.ts
│   │
│   ├── lib/                            # Utilities & configs
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser client
│   │   │   ├── server.ts               # Server client
│   │   │   └── middleware.ts
│   │   ├── cloudinary.ts
│   │   ├── audio.ts                    # Audio utility functions
│   │   ├── formatters.ts               # Duration, date formatters
│   │   ├── constants.ts
│   │   └── analytics.ts
│   │
│   ├── types/                          # TypeScript types
│   │   ├── database.types.ts           # Auto-generated by Supabase CLI
│   │   ├── player.types.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   │
│   └── styles/
│       ├── globals.css
│       ├── animations.css
│       └── spotify-scrollbar.css
│
├── scripts/
│   ├── seed-database.ts
│   ├── generate-waveforms.ts
│   └── sync-cloudinary.ts
│
└── tests/
    ├── unit/
    │   ├── hooks/
    │   ├── utils/
    │   └── components/
    └── integration/
        ├── player.test.ts
        ├── auth.test.ts
        └── api.test.ts
```

---

## 7. ENVIRONMENT VARIABLES

```bash
# .env.local — COMPLETE LIST (Never commit to git)

# ─── SUPABASE ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# ─── CLOUDINARY ──────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=spotify_covers

# ─── APP ─────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Spotify Clone

# ─── REDIS (Upstash) — for rate limiting ─────────────────────
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# ─── ANALYTICS ───────────────────────────────────────────────
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# ─── SENTRY ──────────────────────────────────────────────────
SENTRY_DSN=https://your-key@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project-id

# ─── OAUTH (Configure in Supabase Dashboard) ─────────────────
# These are set in Supabase, not here. Just for reference:
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
```

---

## 8. TAILWIND CONFIG — EXACT SPOTIFY COLORS

```typescript
// tailwind.config.ts — EXACT SPOTIFY DESIGN SYSTEM

import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── EXACT SPOTIFY COLOR PALETTE ─────────────────────
      colors: {
        // Primary Spotify Green
        spotify: {
          50:  '#e8f5e0',
          100: '#c8eab2',
          200: '#a5df80',
          300: '#80d44e',
          400: '#62cb2a',
          500: '#1DB954',  // ← THE Spotify Green (exact)
          600: '#18a34a',
          700: '#12883e',
          800: '#0c6d32',
          900: '#055226',
          DEFAULT: '#1DB954',
          hover: '#1ed760',  // ← Hover state green
          press: '#169c46',  // ← Active/press state
        },
        // Background Colors
        bg: {
          base:     '#121212',  // Main background
          elevated: '#1a1a1a',  // Slightly elevated
          highlight:'#282828',  // Cards, sidebars
          press:    '#000000',  // Pressed state
          tinted:   '#1f1f1f',
          overlay:  'rgba(0, 0, 0, 0.7)',
        },
        // Surface Colors (cards, panels)
        surface: {
          100: '#1a1a1a',
          200: '#242424',
          300: '#2a2a2a',
          400: '#303030',
          500: '#3a3a3a',
          600: '#444444',
          elevated: '#282828',
          tinted:   '#1f1f1f',
          overlay:  'rgba(0, 0, 0, 0.5)',
        },
        // Text Colors
        text: {
          base:      '#FFFFFF',    // Primary text
          subdued:   '#A7A7A7',    // Secondary text
          brighter:  '#FFFFFF',
          brightened:'#FFFFFF',
          negative:  '#F15E6C',    // Error text
          warning:   '#e9841a',    // Warning text
          positive:  '#1DB954',    // Success text
          announcement: '#3E91E5', // Info text
        },
        // Essential Colors
        essential: {
          base:           '#FFFFFF',
          subdued:        '#727272',
          'bright-accent':'#000000',
          negative:       '#E91429',
          warning:        '#9D5A00',
          positive:       '#117A37',
          announcement:   '#0D72EA',
        },
        // Decorative Colors
        decorative: {
          base:    '#FFFFFF',
          subdued: '#292929',
        },
      },

      // ─── SPOTIFY FONT SYSTEM ──────────────────────────────
      fontFamily: {
        circular: [
          'CircularStd',
          'Circular',
          'DM Sans',
          ...fontFamily.sans
        ],
        sans: [
          'CircularStd',
          'DM Sans',
          ...fontFamily.sans
        ],
      },

      fontSize: {
        // Spotify's exact type scale
        'spotify-xs':   ['0.6875rem', { lineHeight: '1rem' }],     // 11px
        'spotify-sm':   ['0.75rem',   { lineHeight: '1rem' }],     // 12px
        'spotify-base': ['0.875rem',  { lineHeight: '1.25rem' }],  // 14px
        'spotify-md':   ['1rem',      { lineHeight: '1.5rem' }],   // 16px
        'spotify-lg':   ['1.125rem',  { lineHeight: '1.75rem' }],  // 18px
        'spotify-xl':   ['1.5rem',    { lineHeight: '2rem' }],     // 24px
        'spotify-2xl':  ['2rem',      { lineHeight: '2.5rem' }],   // 32px
        'spotify-3xl':  ['3rem',      { lineHeight: '3.5rem' }],   // 48px
        'spotify-4xl':  ['4rem',      { lineHeight: '4.5rem' }],   // 64px
        'spotify-5xl':  ['6rem',      { lineHeight: '6.5rem' }],   // 96px
      },

      // ─── SPACING (Spotify uses 8px base grid) ────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '30':  '7.5rem',
        '34':  '8.5rem',
        '88':  '22rem',
        '104': '26rem',
        '120': '30rem',
        '128': '32rem',
        '136': '34rem',
        '144': '36rem',
        '152': '38rem',
        '160': '40rem',
        '176': '44rem',
        '192': '48rem',
        '208': '52rem',
        '256': '64rem',
      },

      // ─── BORDER RADIUS ───────────────────────────────────
      borderRadius: {
        'spotify': '4px',
        'spotify-md': '8px',
        'spotify-lg': '12px',
        'spotify-full': '9999px',
      },

      // ─── SHADOWS ─────────────────────────────────────────
      boxShadow: {
        'spotify-sm':  '0 2px 4px rgba(0,0,0,0.5)',
        'spotify-md':  '0 8px 24px rgba(0,0,0,0.5)',
        'spotify-lg':  '0 16px 48px rgba(0,0,0,0.5)',
        'spotify-player': '0 -2px 10px rgba(0,0,0,0.5)',
        'spotify-hover': '0 8px 20px rgba(0,0,0,0.6)',
        'spotify-card': '0 4px 60px rgba(0,0,0,0.5)',
        'spotify-focus': '0 0 0 3px rgba(29,185,84,0.5)',
        'nowplaying': '0 0 0 1px rgba(255,255,255,0.1)',
      },

      // ─── ANIMATIONS ──────────────────────────────────────
      keyframes: {
        'spotify-fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spotify-slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'spotify-slide-down': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'waveform-pulse': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%':      { transform: 'scaleY(1.5)' },
        },
        'playing-bars': {
          '0%':   { transform: 'scaleY(1)' },
          '25%':  { transform: 'scaleY(2)' },
          '50%':  { transform: 'scaleY(0.5)' },
          '75%':  { transform: 'scaleY(1.5)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'equalizer': {
          '0%, 100%': { height: '4px' },
          '50%':      { height: '20px' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(29, 185, 84, 0.4)' },
          '50%':      { boxShadow: '0 0 0 10px rgba(29, 185, 84, 0)' },
        },
      },
      animation: {
        'spotify-fade-in': 'spotify-fade-in 0.3s ease-out',
        'spotify-slide-up': 'spotify-slide-up 0.3s ease-out',
        'waveform-pulse': 'waveform-pulse 1.2s ease-in-out infinite',
        'playing-bars': 'playing-bars 1.2s ease-in-out infinite',
        'equalizer': 'equalizer 0.8s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
      },

      // ─── BACKDROP BLUR ───────────────────────────────────
      backdropBlur: {
        'spotify': '20px',
      },

      // ─── Z-INDEX SCALE ───────────────────────────────────
      zIndex: {
        'sidebar': '10',
        'topbar': '20',
        'player': '30',
        'overlay': '40',
        'modal': '50',
        'toast': '60',
        'tooltip': '70',
      },

      // ─── SCREENS ─────────────────────────────────────────
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        'spotify-sm': '640px',
        'spotify-md': '1024px',
        'spotify-lg': '1400px',
      },

      // ─── GRID TEMPLATE ───────────────────────────────────
      gridTemplateColumns: {
        'spotify-main': '240px 1fr',
        'spotify-with-panel': '240px 1fr 350px',
        'song-row': '16px 4fr 2fr 1fr',
        'song-row-album': '16px 4fr 2fr 2fr 1fr',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    // Custom plugin for Spotify scrollbar
    function({ addBase, addComponents, addUtilities, theme }: any) {
      addBase({
        ':root': {
          '--spotify-green':    theme('colors.spotify.DEFAULT'),
          '--spotify-green-hover': theme('colors.spotify.hover'),
          '--spotify-bg':       theme('colors.bg.base'),
          '--spotify-surface':  theme('colors.surface.elevated'),
          '--spotify-text':     theme('colors.text.base'),
          '--spotify-text-sub': theme('colors.text.subdued'),
        },
      });

      addComponents({
        '.spotify-scrollbar': {
          '&::-webkit-scrollbar': { width: '12px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '6px',
            border: '3px solid transparent',
            backgroundClip: 'content-box',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255,255,255,0.5)',
            backgroundClip: 'content-box',
          },
        },
        '.spotify-card': {
          backgroundColor: theme('colors.surface.elevated'),
          borderRadius: theme('borderRadius.spotify-md'),
          padding: theme('spacing.4'),
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: theme('colors.surface.400'),
          },
        },
        '.spotify-button-primary': {
          backgroundColor: theme('colors.spotify.DEFAULT'),
          color: '#000',
          fontWeight: '700',
          borderRadius: theme('borderRadius.spotify-full'),
          padding: '14px 32px',
          fontSize: '0.875rem',
          letterSpacing: '0.1em',
          transition: 'all 0.1s ease',
          '&:hover': {
            backgroundColor: theme('colors.spotify.hover'),
            transform: 'scale(1.04)',
          },
          '&:active': {
            backgroundColor: theme('colors.spotify.press'),
            transform: 'scale(0.98)',
          },
        },
        '.spotify-button-ghost': {
          backgroundColor: 'transparent',
          color: theme('colors.text.base'),
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: theme('borderRadius.spotify-full'),
          padding: '7px 15px',
          fontSize: '0.875rem',
          fontWeight: '700',
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.7)',
            transform: 'scale(1.04)',
          },
        },
        '.now-playing-bar': {
          backgroundColor: theme('colors.bg.elevated'),
          borderTop: '1px solid rgba(255,255,255,0.1)',
          height: '90px',
        },
        '.sidebar-link': {
          display: 'flex',
          alignItems: 'center',
          gap: theme('spacing.4'),
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          borderRadius: theme('borderRadius.spotify'),
          color: theme('colors.text.subdued'),
          fontWeight: '700',
          fontSize: theme('fontSize.spotify-sm')[0],
          letterSpacing: '0.05em',
          textTransform: 'uppercase' as const,
          transition: 'color 0.2s ease',
          '&:hover': { color: theme('colors.text.base') },
          '&.active': { color: theme('colors.text.base') },
        },
        '.album-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: theme('spacing.6'),
        },
      });

      addUtilities({
        '.text-spotify-green': { color: theme('colors.spotify.DEFAULT') },
        '.bg-spotify-green':   { backgroundColor: theme('colors.spotify.DEFAULT') },
        '.bg-spotify-base':    { backgroundColor: theme('colors.bg.base') },
        '.truncate-2':         { display: '-webkit-box', '-webkit-line-clamp': '2', '-webkit-box-orient': 'vertical', overflow: 'hidden' },
        '.truncate-3':         { display: '-webkit-box', '-webkit-line-clamp': '3', '-webkit-box-orient': 'vertical', overflow: 'hidden' },
        '.no-tap-highlight':   { '-webkit-tap-highlight-color': 'transparent' },
        '.will-change-transform': { willChange: 'transform' },
      });
    },
  ],
};

export default config;
```

---

## 9. NEXT.JS APP CONFIGURATION

```javascript
// next.config.js

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cloudinary-images',
        expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-audio',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 days
        cacheableResponse: { statuses: [0, 200] },
        rangeRequests: true, // CRITICAL for audio streaming
      },
    },
    {
      urlPattern: /\/api\/songs/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-songs',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 }, // 1 hour
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store, max-age=0' },
      ],
    },
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Handle WaveSurfer.js
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });
    return config;
  },
};

module.exports = withPWA(nextConfig);
```

---

## 10. AUTHENTICATION SYSTEM

### 10.1 — Supabase Client Configuration

```typescript
// src/lib/supabase/client.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseClient() {
  if (client) return client;
  
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  return client;
}

export const supabase = createSupabaseClient();
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name, options) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );
}

export function createSupabaseAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { get: () => undefined, set: () => {}, remove: () => {} },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
```

### 10.2 — Middleware (Auth Guard)

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/signup', '/callback', '/embed'];
const AUTH_ROUTES   = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value; },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;

  // Redirect logged-in users away from auth pages
  if (session && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!session && !PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth|sw.js|manifest.json).*)',
  ],
};
```

### 10.3 — Login Page Component (Full)

```tsx
// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Github } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : error.message
      );
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleOAuthLogin(provider: 'google' | 'github') {
    setOauthLoading(provider);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
        scopes: provider === 'google' ? 'email profile' : 'user:email',
      },
    });

    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-spotify-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[450px] bg-surface-elevated rounded-xl p-10 relative z-10"
      >
        {/* Spotify Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/icons/spotify-icon.svg" alt="Spotify" width={50} height={50} />
        </div>

        <h1 className="text-text-base text-3xl font-bold text-center mb-8 font-circular">
          Log in to Spotify
        </h1>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-white/30 rounded-full text-text-base font-bold text-sm hover:border-white/70 hover:scale-[1.02] transition-all duration-150 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-white/30 rounded-full text-text-base font-bold text-sm hover:border-white/70 hover:scale-[1.02] transition-all duration-150 disabled:opacity-50"
          >
            <Github className="w-5 h-5" />
            {oauthLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-text-subdued text-xs font-bold uppercase">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-text-base text-sm font-bold mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="email"
              className="w-full bg-surface-300 border border-white/10 rounded text-text-base placeholder-text-subdued px-4 py-3 text-sm focus:outline-none focus:border-white/50 focus:ring-0 transition-colors"
            />
          </div>

          <div>
            <label className="block text-text-base text-sm font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
                className="w-full bg-surface-300 border border-white/10 rounded text-text-base placeholder-text-subdued px-4 py-3 pr-12 text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subdued hover:text-text-base"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full spotify-button-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Logging in...
              </span>
            ) : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/signup" className="text-text-subdued text-sm hover:text-text-base hover:underline">
            Don't have an account? <span className="text-text-base font-bold">Sign up for Spotify</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
```

---

## 11. UI COMPONENTS — COMPLETE LIBRARY

### 11.1 — Sidebar Component (Full Spotify Clone)

```tsx
// src/components/layout/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Search, Library, Plus, Heart, ListMusic,
  Music, Podcast, ChevronRight, ChevronLeft, Pin,
  ArrowRight, List, Grid2X2, LayoutGrid
} from 'lucide-react';
import Image from 'next/image';
import { useUserStore } from '@/store/userStore';
import { usePlaylistStore } from '@/store/playlistStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Search, label: 'Search', href: '/search' },
];

type LibraryView = 'compact' | 'list' | 'grid';
type LibraryFilter = 'all' | 'playlists' | 'podcasts' | 'albums' | 'artists';

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [libView, setLibView] = useState<LibraryView>('compact');
  const [libFilter, setLibFilter] = useState<LibraryFilter>('all');
  const [libSearch, setLibSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alpha' | 'creator'>('recent');

  const { user } = useUserStore();
  const { playlists, likedSongsCount } = usePlaylistStore();

  const filteredPlaylists = playlists.filter(p => {
    if (libSearch && !p.name.toLowerCase().includes(libSearch.toLowerCase())) return false;
    if (libFilter === 'playlists') return true;
    return true;
  });

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300',
        isExpanded ? 'w-[300px]' : 'w-[72px]'
      )}
    >
      {/* Top Navigation */}
      <nav className="bg-bg-elevated rounded-lg p-2 mb-2 flex-shrink-0">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-4 px-4 py-3 rounded-md transition-colors font-bold text-spotify-sm',
              pathname === href
                ? 'text-text-base'
                : 'text-text-subdued hover:text-text-base'
            )}
          >
            <Icon
              size={24}
              className={pathname === href ? 'text-text-base' : ''}
            />
            {isExpanded && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Library Panel */}
      <div className="bg-bg-elevated rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Library Header */}
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-text-subdued hover:text-text-base transition-colors font-bold group"
          >
            <Library size={24} />
            {isExpanded && (
              <span className="text-spotify-sm uppercase tracking-wider">Your Library</span>
            )}
          </button>

          {isExpanded && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {/* Open create playlist modal */}}
                className="text-text-subdued hover:text-text-base hover:scale-110 transition-all p-1"
                title="Create playlist"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={() => {/* Expand library */}}
                className="text-text-subdued hover:text-text-base p-1"
                title="Show more"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>

        {isExpanded && (
          <>
            {/* Filter Pills */}
            <div className="px-2 pb-3 flex gap-2 flex-wrap flex-shrink-0">
              {(['all', 'playlists', 'podcasts', 'albums', 'artists'] as LibraryFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setLibFilter(filter)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold capitalize transition-all',
                    libFilter === filter
                      ? 'bg-white text-black'
                      : 'bg-surface-400 text-text-base hover:bg-surface-500'
                  )}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Search + View Controls */}
            <div className="px-4 pb-3 flex items-center justify-between flex-shrink-0">
              <button className="text-text-subdued hover:text-text-base">
                <Search size={16} />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortBy(sortBy === 'recent' ? 'alpha' : 'recent')}
                  className="text-text-subdued hover:text-text-base text-xs"
                >
                  {sortBy === 'recent' ? 'Recent' : sortBy === 'alpha' ? 'A-Z' : 'Creator'}
                </button>
                <button
                  onClick={() => setLibView(libView === 'compact' ? 'list' : libView === 'list' ? 'grid' : 'compact')}
                  className="text-text-subdued hover:text-text-base"
                >
                  {libView === 'compact' ? <List size={16} /> : libView === 'list' ? <Grid2X2 size={16} /> : <LayoutGrid size={16} />}
                </button>
              </div>
            </div>

            {/* Library Items List */}
            <div className="overflow-y-auto spotify-scrollbar flex-1 px-2 pb-4 space-y-1">
              {/* Liked Songs */}
              <Link href="/liked-songs" className={cn(
                'flex items-center gap-3 p-2 rounded-md hover:bg-surface-400 transition-colors group',
                pathname === '/liked-songs' && 'bg-surface-400'
              )}>
                <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-700 to-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Heart size={18} fill="white" className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-text-base text-sm font-bold truncate">Liked Songs</p>
                  <p className="text-text-subdued text-xs flex items-center gap-1">
                    <Pin size={10} className="inline" />
                    Playlist • {likedSongsCount} songs
                  </p>
                </div>
              </Link>

              {/* User Playlists */}
              <AnimatePresence>
                {filteredPlaylists.map((playlist, i) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/playlist/${playlist.id}`}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-md hover:bg-surface-400 transition-colors',
                        pathname === `/playlist/${playlist.id}` && 'bg-surface-400'
                      )}
                    >
                      <div className="relative w-10 h-10 rounded flex-shrink-0 overflow-hidden">
                        {playlist.cover_url ? (
                          <Image
                            src={playlist.cover_url}
                            alt={playlist.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-500 flex items-center justify-center">
                            <Music size={16} className="text-text-subdued" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={cn(
                          'text-sm font-bold truncate',
                          pathname === `/playlist/${playlist.id}` ? 'text-spotify-green' : 'text-text-base'
                        )}>
                          {playlist.name}
                        </p>
                        <p className="text-text-subdued text-xs truncate capitalize">
                          Playlist • {playlist.owner?.username || 'You'}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
```

### 11.2 — SongRow Component

```tsx
// src/components/lists/SongRow.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, MoreHorizontal, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { formatDuration } from '@/lib/formatters';
import type { Song } from '@/types';
import EqualizerBars from '@/components/ui/EqualizerBars';

interface SongRowProps {
  song: Song;
  index?: number;
  showAlbum?: boolean;
  showArtist?: boolean;
  showDateAdded?: boolean;
  compact?: boolean;
  contextMenu?: React.ReactNode;
  onPlay?: (song: Song) => void;
}

export default function SongRow({
  song,
  index,
  showAlbum = true,
  showArtist = true,
  showDateAdded = false,
  compact = false,
  onPlay,
}: SongRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const { isLiked, toggleLike } = useLikedSongs(song.id);

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrentSong && isPlaying;

  function handlePlay() {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
      onPlay?.(song);
    }
  }

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    await toggleLike();
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
      className={cn(
        'group grid items-center gap-4 px-4 py-2 rounded-md cursor-pointer transition-colors',
        showAlbum && showDateAdded
          ? 'grid-cols-[16px_4fr_2fr_2fr_auto]'
          : showAlbum
          ? 'grid-cols-[16px_4fr_2fr_auto]'
          : 'grid-cols-[16px_4fr_auto]',
        isCurrentSong && 'bg-white/5'
      )}
      role="row"
      aria-label={`${song.title} by ${song.artist?.name}`}
    >
      {/* Track Number / Play Button */}
      <div className="flex items-center justify-center w-4 h-4">
        {isHovered ? (
          <button
            onClick={handlePlay}
            className="text-text-base hover:scale-110 transition-transform"
          >
            {isCurrentPlaying ? <Pause size={14} /> : <Play size={14} fill="white" />}
          </button>
        ) : isCurrentSong ? (
          isPlaying ? (
            <EqualizerBars animated />
          ) : (
            <span className="text-spotify-green text-sm font-bold">
              {index !== undefined ? index + 1 : '•'}
            </span>
          )
        ) : (
          <span className={cn(
            'text-sm',
            isCurrentSong ? 'text-spotify-green font-bold' : 'text-text-subdued'
          )}>
            {index !== undefined ? index + 1 : '•'}
          </span>
        )}
      </div>

      {/* Song Info */}
      <div className="flex items-center gap-3 min-w-0">
        {!compact && (
          <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
            {song.cover_url ? (
              <Image
                src={song.cover_url}
                alt={song.title}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full bg-surface-500 flex items-center justify-center">
                <Music size={14} className="text-text-subdued" />
              </div>
            )}
          </div>
        )}
        <div className="min-w-0">
          <p className={cn(
            'font-bold text-sm truncate',
            isCurrentSong ? 'text-spotify-green' : 'text-text-base'
          )}>
            {song.title}
          </p>
          {showArtist && (
            <p className="text-text-subdued text-xs truncate hover:text-text-base hover:underline cursor-pointer">
              {song.is_explicit && (
                <span className="inline-block bg-surface-500 text-text-subdued text-[9px] font-bold px-1 rounded mr-1 uppercase">E</span>
              )}
              {song.artist?.name}
            </p>
          )}
        </div>
      </div>

      {/* Album */}
      {showAlbum && (
        <p className="text-text-subdued text-sm truncate hidden md:block hover:text-text-base hover:underline cursor-pointer">
          {song.album?.title}
        </p>
      )}

      {/* Date Added */}
      {showDateAdded && song.added_at && (
        <p className="text-text-subdued text-sm hidden lg:block">
          {new Date(song.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      )}

      {/* Duration + Like */}
      <div className="flex items-center gap-4 justify-end">
        <button
          onClick={handleLike}
          className={cn(
            'transition-all',
            isLiked
              ? 'text-spotify-green opacity-100'
              : 'text-text-subdued opacity-0 group-hover:opacity-100 hover:text-text-base'
          )}
          aria-label={isLiked ? 'Remove from liked songs' : 'Add to liked songs'}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
        <span className="text-text-subdued text-sm w-10 text-right">
          {formatDuration(song.duration_ms)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); /* open context menu */ }}
          className="text-text-subdued opacity-0 group-hover:opacity-100 hover:text-text-base"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </motion.div>
  );
}
```

---

## 12. PAGES — ALL ROUTES

### 12.1 — Home Page

```tsx
// src/app/(main)/home/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import HomeClient from '@/components/pages/HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spotify Clone — Music for everyone',
  description: 'Listen to music, podcasts and more.',
};

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // Parallel data fetching for performance
  const [
    featuredPlaylistsResult,
    recentlyPlayedResult,
    recommendedResult,
    newReleasesResult,
    trendingResult,
    moodPlaylistsResult,
  ] = await Promise.allSettled([
    supabase
      .from('playlists')
      .select('*, profiles(username, avatar_url)')
      .eq('is_public', true)
      .order('follower_count', { ascending: false })
      .limit(8),

    userId ? supabase
      .from('play_history')
      .select('*, songs(*, artists(name, avatar_url), albums(title, cover_url))')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(20) : Promise.resolve({ data: [] }),

    supabase
      .from('songs')
      .select('*, artists(name, avatar_url, verified), albums(title, cover_url)')
      .order('popularity', { ascending: false })
      .limit(20),

    supabase
      .from('albums')
      .select('*, artists(name, avatar_url)')
      .order('release_date', { ascending: false })
      .limit(10),

    supabase
      .from('songs')
      .select('*, artists(name, avatar_url), albums(title, cover_url)')
      .order('play_count', { ascending: false })
      .limit(30),

    supabase
      .from('playlists')
      .select('*, profiles(username)')
      .eq('is_public', true)
      .limit(6),
  ]);

  const safeGet = (result: PromiseSettledResult<any>) =>
    result.status === 'fulfilled' ? result.value.data ?? [] : [];

  return (
    <HomeClient
      featuredPlaylists={safeGet(featuredPlaylistsResult)}
      recentlyPlayed={safeGet(recentlyPlayedResult)}
      recommended={safeGet(recommendedResult)}
      newReleases={safeGet(newReleasesResult)}
      trending={safeGet(trendingResult)}
      moodPlaylists={safeGet(moodPlaylistsResult)}
    />
  );
}
```

### 12.2 — Home Client Component

```tsx
// src/components/pages/HomeClient.tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import HorizontalScrollSection from '@/components/sections/HorizontalScrollSection';
import SongCard from '@/components/cards/SongCard';
import AlbumCard from '@/components/cards/AlbumCard';
import PlaylistCard from '@/components/cards/PlaylistCard';
import RecentlyPlayedGrid from '@/components/sections/RecentlyPlayedGrid';
import { useGreeting } from '@/hooks/useGreeting';

interface HomeClientProps {
  featuredPlaylists: any[];
  recentlyPlayed: any[];
  recommended: any[];
  newReleases: any[];
  trending: any[];
  moodPlaylists: any[];
}

const STAGGER = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export default function HomeClient({
  featuredPlaylists,
  recentlyPlayed,
  recommended,
  newReleases,
  trending,
  moodPlaylists,
}: HomeClientProps) {
  const greeting = useGreeting();

  return (
    <div className="px-6 py-6 pb-32 overflow-y-auto spotify-scrollbar h-full">
      {/* Greeting Header */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-text-base mb-6"
      >
        {greeting}
      </motion.h1>

      {/* Recently Played Quick Grid */}
      {recentlyPlayed.length > 0 && (
        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8"
        >
          {recentlyPlayed.slice(0, 6).map((item) => (
            <motion.div key={item.id} variants={ITEM}>
              <RecentlyPlayedCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Featured Playlists */}
      {featuredPlaylists.length > 0 && (
        <HorizontalScrollSection title="Featured Playlists" seeAllHref="/search">
          {featuredPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </HorizontalScrollSection>
      )}

      {/* New Releases */}
      {newReleases.length > 0 && (
        <HorizontalScrollSection title="New Releases" seeAllHref="/search?tab=albums">
          {newReleases.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </HorizontalScrollSection>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <HorizontalScrollSection title="Trending Now" seeAllHref="/search?tab=songs">
          {trending.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </HorizontalScrollSection>
      )}

      {/* Made For You */}
      {moodPlaylists.length > 0 && (
        <HorizontalScrollSection title="Made For You" seeAllHref="/library">
          {moodPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </HorizontalScrollSection>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <HorizontalScrollSection title="Recommended For You" seeAllHref="/recommendations">
          {recommended.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </HorizontalScrollSection>
      )}
    </div>
  );
}

function RecentlyPlayedCard({ item }: { item: any }) {
  const { playSong } = usePlayerStore();
  const song = item.songs;
  if (!song) return null;

  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      onClick={() => playSong(song)}
      className="group flex items-center gap-3 bg-surface-300 rounded-md overflow-hidden hover:bg-surface-400 transition-colors w-full text-left relative"
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        {song.cover_url && (
          <Image src={song.cover_url} alt={song.title} fill className="object-cover" sizes="48px" />
        )}
      </div>
      <span className="font-bold text-text-base text-sm truncate pr-2">{song.title}</span>
      <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
        <div className="bg-spotify-500 rounded-full p-2 shadow-spotify-md">
          <Play size={12} fill="black" className="text-black" />
        </div>
      </div>
    </motion.button>
  );
}

import { usePlayerStore } from '@/store/playerStore';
import Image from 'next/image';
import { Play } from 'lucide-react';
```

---

## 13. ADVANCED AUDIO PLAYER

### 13.1 — Zustand Player Store (Full Implementation)

```typescript
// src/store/playerStore.ts

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { Howl, Howler } from 'howler';
import type { Song } from '@/types';

export type RepeatMode = 'off' | 'one' | 'all';

interface PlayerState {
  // Playback State
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  isMuted: boolean;
  volume: number;              // 0-1
  position: number;            // ms
  duration: number;            // ms
  progress: number;            // 0-100

  // Queue State
  queue: Song[];
  originalQueue: Song[];       // For un-shuffle
  queueIndex: number;
  
  // Modes
  shuffleMode: boolean;
  repeatMode: RepeatMode;
  crossfade: number;           // seconds (0-12)

  // Player reference (not persisted)
  _howl: Howl | null;
  _animFrame: number | null;

  // Actions
  playSong: (song: Song, queue?: Song[], queueIndex?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (positionMs: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  addToQueue: (song: Song, next?: boolean) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (from: number, to: number) => void;
  setCrossfade: (seconds: number) => void;
  _loadAndPlay: (song: Song) => void;
  _onEnd: () => void;
  _startPositionTracking: () => void;
  _stopPositionTracking: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        currentSong: null,
        isPlaying: false,
        isLoading: false,
        isMuted: false,
        volume: 0.7,
        position: 0,
        duration: 0,
        progress: 0,
        queue: [],
        originalQueue: [],
        queueIndex: -1,
        shuffleMode: false,
        repeatMode: 'off',
        crossfade: 0,
        _howl: null,
        _animFrame: null,

        // ────────────────────────────────────────────────
        // PLAY SONG
        // ────────────────────────────────────────────────
        playSong: (song, queue, queueIndex) => {
          const state = get();

          // Stop current if playing
          if (state._howl) {
            state._howl.stop();
            state._howl.unload();
          }
          state._stopPositionTracking();

          const newQueue = queue ?? (state.queue.length > 0 ? state.queue : [song]);
          const newIndex = queueIndex ?? newQueue.findIndex(s => s.id === song.id);

          set({
            currentSong: song,
            queue: newQueue,
            originalQueue: newQueue,
            queueIndex: newIndex !== -1 ? newIndex : 0,
            position: 0,
            progress: 0,
            isLoading: true,
            isPlaying: false,
          });

          get()._loadAndPlay(song);
        },

        // ────────────────────────────────────────────────
        // LOAD AND PLAY (Internal)
        // ────────────────────────────────────────────────
        _loadAndPlay: (song) => {
          const state = get();

          const howl = new Howl({
            src: [song.audio_url],
            html5: true,          // Use HTML5 for streaming + range requests
            preload: true,
            volume: state.isMuted ? 0 : state.volume,
            format: ['mp3', 'aac', 'ogg', 'flac'],
            onload: () => {
              set({
                isLoading: false,
                duration: howl.duration() * 1000,
              });
            },
            onplay: () => {
              set({ isPlaying: true, isLoading: false });
              get()._startPositionTracking();
            },
            onpause: () => {
              set({ isPlaying: false });
              get()._stopPositionTracking();
            },
            onstop: () => {
              set({ isPlaying: false, position: 0, progress: 0 });
              get()._stopPositionTracking();
            },
            onend: () => {
              get()._onEnd();
            },
            onloaderror: (id, error) => {
              console.error('Audio load error:', error);
              set({ isLoading: false, isPlaying: false });
            },
            onplayerror: (id, error) => {
              console.error('Audio play error:', error);
              // Try to recover
              howl.once('unlock', () => howl.play());
            },
          });

          howl.play();
          set({ _howl: howl });
        },

        // ────────────────────────────────────────────────
        // POSITION TRACKING (rAF)
        // ────────────────────────────────────────────────
        _startPositionTracking: () => {
          const track = () => {
            const state = get();
            if (!state._howl || !state.isPlaying) return;

            const seekSec = state._howl.seek() as number;
            const positionMs = Math.floor(seekSec * 1000);
            const durationMs = state.duration;
            const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

            set({ position: positionMs, progress });

            const frame = requestAnimationFrame(track);
            set({ _animFrame: frame });
          };

          const frame = requestAnimationFrame(track);
          set({ _animFrame: frame });
        },

        _stopPositionTracking: () => {
          const { _animFrame } = get();
          if (_animFrame) {
            cancelAnimationFrame(_animFrame);
            set({ _animFrame: null });
          }
        },

        // ────────────────────────────────────────────────
        // TOGGLE PLAY
        // ────────────────────────────────────────────────
        togglePlay: () => {
          const { _howl, isPlaying } = get();
          if (!_howl) return;
          isPlaying ? _howl.pause() : _howl.play();
        },

        pause: () => {
          const { _howl } = get();
          _howl?.pause();
        },

        resume: () => {
          const { _howl } = get();
          _howl?.play();
        },

        // ────────────────────────────────────────────────
        // NEXT TRACK
        // ────────────────────────────────────────────────
        next: () => {
          const { queue, queueIndex, repeatMode, _howl } = get();

          if (repeatMode === 'one') {
            _howl?.seek(0);
            _howl?.play();
            return;
          }

          const nextIndex = queueIndex + 1;

          if (nextIndex >= queue.length) {
            if (repeatMode === 'all') {
              const firstSong = queue[0];
              get().playSong(firstSong, queue, 0);
            } else {
              // End of queue
              if (_howl) { _howl.stop(); }
              set({ isPlaying: false, position: 0 });
            }
            return;
          }

          const nextSong = queue[nextIndex];
          get().playSong(nextSong, queue, nextIndex);
        },

        // ────────────────────────────────────────────────
        // PREVIOUS TRACK
        // ────────────────────────────────────────────────
        previous: () => {
          const { position, queueIndex, queue, _howl } = get();

          // If more than 3s in, restart track
          if (position > 3000) {
            _howl?.seek(0);
            set({ position: 0, progress: 0 });
            return;
          }

          const prevIndex = queueIndex - 1;
          if (prevIndex < 0) {
            _howl?.seek(0);
            set({ position: 0, progress: 0 });
            return;
          }

          const prevSong = queue[prevIndex];
          get().playSong(prevSong, queue, prevIndex);
        },

        // ────────────────────────────────────────────────
        // SEEK
        // ────────────────────────────────────────────────
        seek: (positionMs) => {
          const { _howl, duration } = get();
          if (!_howl || duration === 0) return;

          const seekSec = positionMs / 1000;
          _howl.seek(seekSec);
          set({
            position: positionMs,
            progress: (positionMs / duration) * 100,
          });
        },

        // ────────────────────────────────────────────────
        // VOLUME
        // ────────────────────────────────────────────────
        setVolume: (volume) => {
          const { _howl } = get();
          const clampedVolume = Math.max(0, Math.min(1, volume));
          Howler.volume(clampedVolume);
          _howl?.volume(clampedVolume);
          set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
        },

        toggleMute: () => {
          const { isMuted, volume, _howl } = get();
          if (isMuted) {
            Howler.volume(volume);
            _howl?.volume(volume);
            set({ isMuted: false });
          } else {
            Howler.volume(0);
            _howl?.volume(0);
            set({ isMuted: true });
          }
        },

        // ────────────────────────────────────────────────
        // SHUFFLE
        // ────────────────────────────────────────────────
        toggleShuffle: () => {
          const { shuffleMode, queue, originalQueue, currentSong } = get();

          if (!shuffleMode) {
            // Enable shuffle — Fisher-Yates shuffle, keep current first
            const shuffled = [...queue];
            const currentIdx = shuffled.findIndex(s => s.id === currentSong?.id);
            if (currentIdx > 0) {
              [shuffled[0], shuffled[currentIdx]] = [shuffled[currentIdx], shuffled[0]];
            }
            for (let i = shuffled.length - 1; i > 1; i--) {
              const j = Math.floor(Math.random() * (i - 1)) + 1;
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            set({ shuffleMode: true, queue: shuffled, queueIndex: 0 });
          } else {
            // Restore original order
            const currentIdx = originalQueue.findIndex(s => s.id === currentSong?.id);
            set({
              shuffleMode: false,
              queue: originalQueue,
              queueIndex: currentIdx !== -1 ? currentIdx : 0,
            });
          }
        },

        // ────────────────────────────────────────────────
        // REPEAT
        // ────────────────────────────────────────────────
        setRepeatMode: (mode) => set({ repeatMode: mode }),

        // ────────────────────────────────────────────────
        // QUEUE MANAGEMENT
        // ────────────────────────────────────────────────
        addToQueue: (song, next = false) => {
          const { queue, queueIndex } = get();
          if (next) {
            const newQueue = [...queue];
            newQueue.splice(queueIndex + 1, 0, song);
            set({ queue: newQueue });
          } else {
            set({ queue: [...queue, song] });
          }
        },

        removeFromQueue: (index) => {
          const { queue, queueIndex } = get();
          const newQueue = queue.filter((_, i) => i !== index);
          const newIndex = index < queueIndex ? queueIndex - 1 : queueIndex;
          set({ queue: newQueue, queueIndex: Math.max(0, newIndex) });
        },

        clearQueue: () => {
          const { currentSong } = get();
          set({
            queue: currentSong ? [currentSong] : [],
            queueIndex: currentSong ? 0 : -1,
          });
        },

        reorderQueue: (from, to) => {
          const { queue } = get();
          const newQueue = [...queue];
          const [removed] = newQueue.splice(from, 1);
          newQueue.splice(to, 0, removed);
          set({ queue: newQueue });
        },

        setCrossfade: (seconds) => set({ crossfade: Math.max(0, Math.min(12, seconds)) }),

        // ────────────────────────────────────────────────
        // ON END
        // ────────────────────────────────────────────────
        _onEnd: () => {
          get()._stopPositionTracking();
          set({ position: 0, progress: 0 });
          get().next();
        },
      }),
      {
        name: 'spotify-player-storage',
        partialize: (state) => ({
          volume: state.volume,
          isMuted: state.isMuted,
          shuffleMode: state.shuffleMode,
          repeatMode: state.repeatMode,
          crossfade: state.crossfade,
          currentSong: state.currentSong,
          queue: state.queue,
          queueIndex: state.queueIndex,
        }),
      }
    )
  )
);
```

---

## 14. WAVEFORM VISUALIZATION

```tsx
// src/components/player/WaveformVisualizer.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { usePlayerStore } from '@/store/playerStore';

interface WaveformVisualizerProps {
  audioUrl: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  interact?: boolean;
  className?: string;
}

export default function WaveformVisualizer({
  audioUrl,
  height = 60,
  waveColor = 'rgba(255,255,255,0.2)',
  progressColor = '#1DB954',
  cursorColor = '#1DB954',
  barWidth = 3,
  barGap = 1,
  barRadius = 3,
  interact = true,
  className,
}: WaveformVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { isPlaying, seek, position, duration } = usePlayerStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance
    wavesurferRef.current?.destroy();

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height,
      waveColor,
      progressColor,
      cursorColor,
      barWidth,
      barGap,
      barRadius,
      interact,
      normalize: true,
      backend: 'WebAudio',
      media: undefined,
      peaks: undefined,
    });

    ws.on('ready', () => {
      setIsReady(true);
    });

    ws.on('seek', (progress) => {
      if (interact) {
        seek(progress * duration);
      }
    });

    ws.on('error', (error) => {
      console.warn('WaveSurfer error (non-critical):', error);
    });

    ws.load(audioUrl);
    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      setIsReady(false);
    };
  }, [audioUrl]);

  // Sync play state
  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;
    // WaveSurfer is visual only — audio is handled by Howler
    // We just update the visual progress
  }, [isPlaying, isReady]);

  // Sync position
  useEffect(() => {
    if (!wavesurferRef.current || !isReady || duration === 0) return;
    const progress = position / duration;
    if (isFinite(progress) && progress >= 0 && progress <= 1) {
      wavesurferRef.current.seekTo(progress);
    }
  }, [position, duration, isReady]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ opacity: isReady ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
    />
  );
}

// Canvas-based audio visualizer (bars that pulse with audio)
// src/components/player/AudioVisualizer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

export default function AudioVisualizer({
  barCount = 32,
  barColor = '#1DB954',
  backgroundColor = 'transparent',
  height = 48,
  width = 200,
}: {
  barCount?: number;
  barColor?: string;
  backgroundColor?: string;
  height?: number;
  width?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { isPlaying, currentSong } = usePlayerStore();

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      drawBars(new Uint8Array(barCount).fill(5));
      return;
    }

    setupAnalyzer();
    drawLoop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentSong]);

  function setupAnalyzer() {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 64;
      analyzer.smoothingTimeConstant = 0.8;
      
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyzerRef.current = analyzer;
      dataArrayRef.current = dataArray;
    } catch (e) {
      // AudioContext may be blocked — use simulated data
    }
  }

  function drawBars(data: Uint8Array) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    const numBars = Math.min(barCount, data.length);
    const barW = (width / numBars) * 0.6;
    const gap = (width / numBars) * 0.4;

    for (let i = 0; i < numBars; i++) {
      const value = data[i] / 255;
      const barHeight = Math.max(2, value * height * 0.9);
      const x = i * (barW + gap);
      const y = height - barHeight;

      // Gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height);
      gradient.addColorStop(0, barColor);
      gradient.addColorStop(1, barColor + '66');
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.roundRect(x, y, barW, barHeight, [2, 2, 0, 0]);
      ctx.fill();
    }
  }

  function drawLoop() {
    const draw = () => {
      if (!analyzerRef.current || !dataArrayRef.current) {
        // Simulate visualizer if no analyzer (for demo/fallback)
        const simData = new Uint8Array(barCount);
        for (let i = 0; i < barCount; i++) {
          simData[i] = Math.random() * 200 + 20;
        }
        drawBars(simData);
      } else {
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        drawBars(dataArrayRef.current);
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };
    animFrameRef.current = requestAnimationFrame(draw);
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
```

---

## 15. WEBSOCKET REAL-TIME SYNC

```typescript
// src/hooks/useRealtime.ts
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { usePlayerStore } from '@/store/playerStore';
import { useUserStore } from '@/store/userStore';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID = typeof window !== 'undefined'
  ? localStorage.getItem('device_id') || (() => {
      const id = uuidv4();
      localStorage.setItem('device_id', id);
      return id;
    })()
  : '';

const SYNC_THROTTLE_MS = 2000;

export function useRealtimePlayer() {
  const { user } = useUserStore();
  const { currentSong, isPlaying, position, volume, shuffleMode, repeatMode, queue } = usePlayerStore();
  const lastSyncRef = useRef<number>(0);
  const channelRef = useRef<any>(null);

  // Sync player state to Supabase
  const syncState = useCallback(async () => {
    if (!user?.id || !currentSong) return;

    const now = Date.now();
    if (now - lastSyncRef.current < SYNC_THROTTLE_MS) return;
    lastSyncRef.current = now;

    await supabase
      .from('user_play_sessions')
      .upsert({
        user_id: user.id,
        device_id: DEVICE_ID,
        device_name: navigator.userAgent.slice(0, 50),
        current_song_id: currentSong.id,
        position_ms: position,
        is_playing: isPlaying,
        volume,
        shuffle_mode: shuffleMode,
        repeat_mode: repeatMode,
        queue: queue.map(s => s.id),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,device_id',
      });
  }, [user?.id, currentSong, isPlaying, position, volume, shuffleMode, repeatMode, queue]);

  // Subscribe to friend activity (Spotify's "Friend Activity" feature)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`player-sync:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_play_sessions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Handle multi-device sync
          if (payload.new && (payload.new as any).device_id !== DEVICE_ID) {
            console.log('Another device updated play state:', payload.new);
            // Could offer "Transfer playback here" like Spotify
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  // Sync on state changes
  useEffect(() => {
    syncState();
  }, [currentSong?.id, isPlaying]);

  return { syncState };
}

// Real-time notifications
export function useRealtimeNotifications() {
  const { user } = useUserStore();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          // Show toast notification
          showToast(payload.new.title, payload.new.body);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  return { notifications };
}

import { useState } from 'react';
function showToast(title: string, body?: string) {
  // Implement with your toast library
  console.log('Notification:', title, body);
}
```

---

## 16. OFFLINE CACHING STRATEGY

```typescript
// src/hooks/useOfflineCache.ts
'use client';

import { useEffect, useCallback } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import type { Song } from '@/types';

const DB_NAME = 'spotify-clone-offline';
const DB_VERSION = 1;
const STORES = {
  songs: 'offline-songs',
  metadata: 'song-metadata',
  queue: 'offline-queue',
  likedSongs: 'liked-songs-cache',
} as const;

let db: IDBPDatabase | null = null;

async function getDB() {
  if (db) return db;

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Songs store (audio blob)
      if (!database.objectStoreNames.contains(STORES.songs)) {
        database.createObjectStore(STORES.songs, { keyPath: 'id' });
      }
      // Song metadata
      if (!database.objectStoreNames.contains(STORES.metadata)) {
        const store = database.createObjectStore(STORES.metadata, { keyPath: 'id' });
        store.createIndex('downloaded_at', 'downloaded_at');
      }
      // Offline queue
      if (!database.objectStoreNames.contains(STORES.queue)) {
        database.createObjectStore(STORES.queue, { keyPath: 'id' });
      }
      // Liked songs cache
      if (!database.objectStoreNames.contains(STORES.likedSongs)) {
        database.createObjectStore(STORES.likedSongs, { keyPath: 'id' });
      }
    },
  });

  return db;
}

export function useOfflineCache() {
  // Download a song for offline playback
  const cacheSong = useCallback(async (song: Song): Promise<void> => {
    if (!navigator.onLine) return;

    try {
      const database = await getDB();

      // Check if already cached
      const existing = await database.get(STORES.metadata, song.id);
      if (existing) return;

      // Fetch audio blob
      const response = await fetch(song.audio_url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Store blob
      await database.put(STORES.songs, { id: song.id, blob, objectUrl });

      // Store metadata
      await database.put(STORES.metadata, {
        ...song,
        audio_url_offline: objectUrl,
        downloaded_at: new Date().toISOString(),
        size_bytes: blob.size,
      });

      console.log(`✅ Cached: ${song.title} (${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
    } catch (error) {
      console.warn(`Failed to cache song ${song.id}:`, error);
    }
  }, []);

  // Get offline URL for a song
  const getOfflineUrl = useCallback(async (songId: string): Promise<string | null> => {
    try {
      const database = await getDB();
      const cached = await database.get(STORES.metadata, songId);
      return cached?.audio_url_offline ?? null;
    } catch {
      return null;
    }
  }, []);

  // Get all cached songs
  const getCachedSongs = useCallback(async (): Promise<Song[]> => {
    try {
      const database = await getDB();
      return database.getAll(STORES.metadata);
    } catch {
      return [];
    }
  }, []);

  // Remove cached song
  const uncacheSong = useCallback(async (songId: string): Promise<void> => {
    try {
      const database = await getDB();
      const entry = await database.get(STORES.songs, songId);
      if (entry?.objectUrl) URL.revokeObjectURL(entry.objectUrl);
      await database.delete(STORES.songs, songId);
      await database.delete(STORES.metadata, songId);
    } catch (error) {
      console.warn('Failed to uncache song:', error);
    }
  }, []);

  // Get cache size
  const getCacheSize = useCallback(async (): Promise<number> => {
    try {
      const database = await getDB();
      const songs = await database.getAll(STORES.metadata);
      return songs.reduce((total: number, s: any) => total + (s.size_bytes ?? 0), 0);
    } catch {
      return 0;
    }
  }, []);

  // Cache liked songs on network
  const cacheLikedSongs = useCallback(async (songs: Song[]): Promise<void> => {
    try {
      const database = await getDB();
      const tx = database.transaction(STORES.likedSongs, 'readwrite');
      for (const song of songs) {
        await tx.store.put(song);
      }
      await tx.done;
    } catch (error) {
      console.warn('Failed to cache liked songs:', error);
    }
  }, []);

  return {
    cacheSong,
    getOfflineUrl,
    getCachedSongs,
    uncacheSong,
    getCacheSize,
    cacheLikedSongs,
  };
}
```

---

## 17. SEARCH & DISCOVERY ENGINE

```typescript
// src/app/api/search/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'edge';

interface SearchResults {
  songs: any[];
  artists: any[];
  albums: any[];
  playlists: any[];
  total: number;
}

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  
  const q = searchParams.get('q')?.trim();
  const type = searchParams.get('type') || 'all'; // all|songs|artists|albums|playlists
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!q || q.length < 1) {
    return NextResponse.json({ songs: [], artists: [], albums: [], playlists: [], total: 0 });
  }

  // Sanitize search query
  const sanitizedQ = q.replace(/[^\w\s\-'\.]/g, '').slice(0, 100);
  const likePattern = `%${sanitizedQ}%`;

  try {
    const promises: Promise<any>[] = [];

    if (type === 'all' || type === 'songs') {
      promises.push(
        supabase
          .from('songs')
          .select('*, artists(id, name, avatar_url, verified), albums(id, title, cover_url)')
          .or(`title.ilike.${likePattern}`)
          .order('popularity', { ascending: false })
          .range(offset, offset + limit - 1)
      );
    } else {
      promises.push(Promise.resolve({ data: [], error: null }));
    }

    if (type === 'all' || type === 'artists') {
      promises.push(
        supabase
          .from('artists')
          .select('*')
          .ilike('name', likePattern)
          .order('monthly_listeners', { ascending: false })
          .limit(type === 'all' ? 10 : limit)
      );
    } else {
      promises.push(Promise.resolve({ data: [], error: null }));
    }

    if (type === 'all' || type === 'albums') {
      promises.push(
        supabase
          .from('albums')
          .select('*, artists(id, name, avatar_url)')
          .ilike('title', likePattern)
          .limit(type === 'all' ? 10 : limit)
      );
    } else {
      promises.push(Promise.resolve({ data: [], error: null }));
    }

    if (type === 'all' || type === 'playlists') {
      promises.push(
        supabase
          .from('playlists')
          .select('*, profiles(username, avatar_url)')
          .eq('is_public', true)
          .ilike('name', likePattern)
          .limit(type === 'all' ? 10 : limit)
      );
    } else {
      promises.push(Promise.resolve({ data: [], error: null }));
    }

    const [songsResult, artistsResult, albumsResult, playlistsResult] = await Promise.all(promises);

    const results: SearchResults = {
      songs: songsResult?.data ?? [],
      artists: artistsResult?.data ?? [],
      albums: albumsResult?.data ?? [],
      playlists: playlistsResult?.data ?? [],
      total: (
        (songsResult?.data?.length ?? 0) +
        (artistsResult?.data?.length ?? 0) +
        (albumsResult?.data?.length ?? 0) +
        (playlistsResult?.data?.length ?? 0)
      ),
    };

    // Save search to history (non-blocking)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id && results.total > 0) {
      supabase
        .from('search_history')
        .insert({ user_id: session.user.id, query: sanitizedQ })
        .then(() => {})
        .catch(() => {});
    }

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
```

---

## 18. PLAYLIST MANAGEMENT

```typescript
// src/app/api/playlists/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

const CreatePlaylistSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  is_public: z.boolean().default(true),
  is_collaborative: z.boolean().default(false),
  cover_url: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data: { session } } = await supabase.auth.getSession();

  let query = supabase
    .from('playlists')
    .select(`
      *,
      profiles(id, username, full_name, avatar_url),
      playlist_songs(count)
    `)
    .order('updated_at', { ascending: false });

  if (userId) {
    if (userId === session?.user?.id) {
      query = query.eq('owner_id', userId);
    } else {
      query = query.eq('owner_id', userId).eq('is_public', true);
    }
  } else if (session?.user?.id) {
    query = query.or(`owner_id.eq.${session.user.id},is_public.eq.true`);
  } else {
    query = query.eq('is_public', true);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ playlists: data, total: count });
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreatePlaylistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from('playlists')
    .insert({
      ...parsed.data,
      owner_id: session.user.id,
    })
    .select(`
      *,
      profiles(id, username, full_name, avatar_url)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ playlist: data }, { status: 201 });
}
```

---

## 19. LIBRARY SYSTEM

```typescript
// src/app/api/songs/[id]/like/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

interface Params { params: { id: string } }

export async function POST(request: NextRequest, { params }: Params) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const songId = params.id;

  // Validate song exists
  const { data: song } = await supabase
    .from('songs')
    .select('id')
    .eq('id', songId)
    .single();

  if (!song) return NextResponse.json({ error: 'Song not found' }, { status: 404 });

  const { error } = await supabase
    .from('liked_songs')
    .upsert({ user_id: session.user.id, song_id: songId });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ liked: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .eq('user_id', session.user.id)
    .eq('song_id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ liked: false });
}
```

---

## 20. HOOKS LIBRARY

```typescript
// src/hooks/useKeyboardShortcuts.ts
'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';

const SHORTCUTS: Record<string, () => void> = {};

export function useKeyboardShortcuts() {
  const {
    togglePlay,
    next,
    previous,
    setVolume,
    volume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    repeatMode,
  } = usePlayerStore();

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      // Ignore when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;

        case 'ArrowRight':
          if (e.altKey) {
            e.preventDefault();
            next();
          }
          break;

        case 'ArrowLeft':
          if (e.altKey) {
            e.preventDefault();
            previous();
          }
          break;

        case 'ArrowUp':
          if (e.altKey) {
            e.preventDefault();
            setVolume(Math.min(1, volume + 0.1));
          }
          break;

        case 'ArrowDown':
          if (e.altKey) {
            e.preventDefault();
            setVolume(Math.max(0, volume - 0.1));
          }
          break;

        case 'm':
        case 'M':
          toggleMute();
          break;

        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleShuffle();
          }
          break;

        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setRepeatMode(
              repeatMode === 'off' ? 'all' :
              repeatMode === 'all' ? 'one' : 'off'
            );
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [togglePlay, next, previous, setVolume, volume, toggleMute, toggleShuffle, setRepeatMode, repeatMode]);
}

// src/hooks/useMediaSession.ts
// Controls media keys on keyboard/headphones
export function useMediaSession() {
  const { currentSong, isPlaying, next, previous, togglePlay, seek, duration } = usePlayerStore();

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist?.name ?? '',
      album: currentSong.album?.title ?? '',
      artwork: currentSong.cover_url ? [
        { src: currentSong.cover_url, sizes: '512x512', type: 'image/jpeg' },
      ] : undefined,
    });

    navigator.mediaSession.setActionHandler('play', () => {
      if (!isPlaying) togglePlay();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      if (isPlaying) togglePlay();
    });

    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', previous);

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seek(details.seekTime * 1000);
      }
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

  }, [currentSong, isPlaying]);
}
```

---

## 21. API ROUTES — COMPLETE

```typescript
// src/app/api/recommendations/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Return popular songs for unauthenticated users
    const { data } = await supabase
      .from('songs')
      .select('*, artists(name, avatar_url, verified), albums(title, cover_url)')
      .order('play_count', { ascending: false })
      .limit(20);
    return NextResponse.json({ songs: data ?? [] });
  }

  // ─── Personalized Recommendations ───────────────────────
  // 1. Get user's play history genres
  const { data: history } = await supabase
    .from('play_history')
    .select('songs(genres, artist_id)')
    .eq('user_id', session.user.id)
    .order('played_at', { ascending: false })
    .limit(50);

  // Extract favorite genres from history
  const genreCount: Record<string, number> = {};
  const artistCount: Record<string, number> = {};

  history?.forEach((h: any) => {
    if (h.songs?.genres) {
      h.songs.genres.forEach((g: string) => {
        genreCount[g] = (genreCount[g] || 0) + 1;
      });
    }
    if (h.songs?.artist_id) {
      artistCount[h.songs.artist_id] = (artistCount[h.songs.artist_id] || 0) + 1;
    }
  });

  const topGenres = Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([g]) => g);

  const topArtists = Object.entries(artistCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  // 2. Get liked songs to exclude
  const { data: liked } = await supabase
    .from('liked_songs')
    .select('song_id')
    .eq('user_id', session.user.id);
  const likedIds = liked?.map(l => l.song_id) ?? [];

  // 3. Recommend based on top genres + artists (simple collaborative)
  let query = supabase
    .from('songs')
    .select('*, artists(name, avatar_url, verified), albums(title, cover_url)')
    .order('popularity', { ascending: false })
    .limit(30);

  if (topGenres.length > 0) {
    query = query.overlaps('genres', topGenres);
  }

  const { data: recommended } = await query;

  const filtered = (recommended ?? []).filter(s => !likedIds.includes(s.id));

  return NextResponse.json({
    songs: filtered,
    based_on: { genres: topGenres, artists: topArtists },
  }, {
    headers: { 'Cache-Control': 'private, max-age=300' },
  });
}
```

---

## 22. CONTEXT PROVIDERS

```tsx
// src/app/(main)/layout.tsx — Main layout with providers
import { PlayerProvider } from '@/components/providers/PlayerProvider';
import { RealtimeProvider } from '@/components/providers/RealtimeProvider';
import { KeyboardShortcutsProvider } from '@/components/providers/KeyboardShortcutsProvider';
import Sidebar from '@/components/layout/Sidebar';
import NowPlayingBar from '@/components/layout/NowPlayingBar';
import TopBar from '@/components/layout/TopBar';
import NowPlayingPanel from '@/components/layout/NowPlayingPanel';
import MobileNav from '@/components/layout/MobileNav';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  return (
    <PlayerProvider>
      <RealtimeProvider userId={session.user.id}>
        <KeyboardShortcutsProvider>
          <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
            {/* Main Content Area */}
            <div className="flex flex-1 gap-2 p-2 pb-0 min-h-0">
              {/* Left Sidebar */}
              <Sidebar />

              {/* Main Content */}
              <main className="flex-1 bg-gradient-to-b from-surface-400 to-bg-base rounded-lg overflow-hidden flex flex-col min-w-0">
                <TopBar />
                <div className="flex-1 overflow-y-auto spotify-scrollbar">
                  {children}
                </div>
              </main>

              {/* Right Panel (Queue / Lyrics) - conditionally shown */}
              <NowPlayingPanel />
            </div>

            {/* Bottom Player Bar */}
            <NowPlayingBar />

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </KeyboardShortcutsProvider>
      </RealtimeProvider>
    </PlayerProvider>
  );
}
```

---

## 23. NOW PLAYING BAR (Full Component)

```tsx
// src/components/layout/NowPlayingBar.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Volume, Volume1, Volume2, VolumeX, Maximize2, ListMusic,
  Mic2, Laptop2, Music, ChevronUp,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { useUIStore } from '@/store/uiStore';
import { formatDuration } from '@/lib/formatters';
import EqualizerBars from '@/components/ui/EqualizerBars';
import { cn } from '@/lib/utils';

export default function NowPlayingBar() {
  const {
    currentSong, isPlaying, isLoading,
    position, duration, progress, volume,
    isMuted, shuffleMode, repeatMode,
    togglePlay, next, previous, seek,
    setVolume, toggleMute, toggleShuffle, setRepeatMode,
  } = usePlayerStore();

  const { showQueue, showLyrics, toggleQueue, toggleLyrics } = useUIStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const { isLiked, toggleLike } = useLikedSongs(currentSong?.id);

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    seek(pct * duration);
  }

  function handleProgressDrag(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging || !progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setDragProgress(pct * 100);
  }

  function handleVolumeClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, x / rect.width));
    setVolume(newVolume);
  }

  const displayProgress = isDragging ? dragProgress : progress;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX :
                     volume < 0.33 ? Volume :
                     volume < 0.66 ? Volume1 : Volume2;

  if (!currentSong) {
    return (
      <div className="now-playing-bar px-4 flex items-center justify-center">
        <p className="text-text-subdued text-sm">
          Select a song to start playing
        </p>
      </div>
    );
  }

  return (
    <div className="now-playing-bar px-4 flex items-center justify-between select-none">
      {/* ─── LEFT: Song Info ─────────────────────────────── */}
      <div className="flex items-center gap-3 w-[30%] min-w-0">
        {/* Album Art */}
        <div className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden group">
          {currentSong.cover_url ? (
            <Image
              src={currentSong.cover_url}
              alt={currentSong.title}
              fill
              className="object-cover"
              sizes="56px"
              priority
            />
          ) : (
            <div className="w-full h-full bg-surface-500 flex items-center justify-center">
              <Music size={20} className="text-text-subdued" />
            </div>
          )}
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <EqualizerBars animated size="sm" />
            </div>
          )}
        </div>

        {/* Song Details */}
        <div className="min-w-0 flex-1">
          <Link
            href={currentSong.album_id ? `/album/${currentSong.album_id}` : '#'}
            className="block text-text-base text-sm font-bold truncate hover:underline"
          >
            {currentSong.title}
          </Link>
          <Link
            href={`/artist/${currentSong.artist_id}`}
            className="block text-text-subdued text-xs truncate hover:text-text-base hover:underline"
          >
            {currentSong.artist?.name}
          </Link>
        </div>

        {/* Like Button */}
        <button
          onClick={toggleLike}
          className={cn(
            'flex-shrink-0 transition-all hover:scale-110',
            isLiked ? 'text-spotify-green' : 'text-text-subdued hover:text-text-base'
          )}
          aria-label={isLiked ? 'Remove from liked songs' : 'Add to liked songs'}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ─── CENTER: Player Controls ─────────────────────── */}
      <div className="flex flex-col items-center gap-2 w-[40%]">
        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={cn(
              'relative hover:scale-110 transition-all',
              shuffleMode ? 'text-spotify-green' : 'text-text-subdued hover:text-text-base'
            )}
            aria-label="Toggle shuffle"
          >
            <Shuffle size={18} />
            {shuffleMode && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-spotify-green" />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={previous}
            className="text-text-subdued hover:text-text-base hover:scale-110 transition-all"
            aria-label="Previous track"
          >
            <SkipBack size={20} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-text-base flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <svg className="animate-spin w-4 h-4 text-black" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : isPlaying ? (
              <Pause size={14} fill="black" className="text-black" />
            ) : (
              <Play size={14} fill="black" className="text-black translate-x-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="text-text-subdued hover:text-text-base hover:scale-110 transition-all"
            aria-label="Next track"
          >
            <SkipForward size={20} />
          </button>

          {/* Repeat */}
          <button
            onClick={() => setRepeatMode(
              repeatMode === 'off' ? 'all' :
              repeatMode === 'all' ? 'one' : 'off'
            )}
            className={cn(
              'relative hover:scale-110 transition-all',
              repeatMode !== 'off' ? 'text-spotify-green' : 'text-text-subdued hover:text-text-base'
            )}
            aria-label="Toggle repeat"
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-spotify-green" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full max-w-lg">
          <span className="text-text-subdued text-[11px] w-8 text-right font-mono">
            {formatDuration(position)}
          </span>

          <div
            ref={progressRef}
            onClick={handleProgressClick}
            onMouseDown={() => setIsDragging(true)}
            onMouseMove={handleProgressDrag}
            onMouseUp={() => { setIsDragging(false); if (isDragging) seek((dragProgress / 100) * duration); }}
            onMouseLeave={() => { if (isDragging) { setIsDragging(false); seek((dragProgress / 100) * duration); } }}
            className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer group relative"
            role="slider"
            aria-valuenow={Math.round(displayProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Seek"
          >
            <div
              className="h-full bg-text-base group-hover:bg-spotify-green rounded-full relative transition-colors"
              style={{ width: `${displayProgress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-text-base opacity-0 group-hover:opacity-100 transition-opacity shadow-spotify-md" />
            </div>
          </div>

          <span className="text-text-subdued text-[11px] w-8 font-mono">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* ─── RIGHT: Extra Controls ────────────────────────── */}
      <div className="flex items-center gap-3 w-[30%] justify-end">
        {/* Lyrics */}
        <button
          onClick={toggleLyrics}
          className={cn(
            'hover:scale-110 transition-all',
            showLyrics ? 'text-spotify-green' : 'text-text-subdued hover:text-text-base'
          )}
          title="Lyrics"
        >
          <Mic2 size={18} />
        </button>

        {/* Queue */}
        <button
          onClick={toggleQueue}
          className={cn(
            'hover:scale-110 transition-all',
            showQueue ? 'text-spotify-green' : 'text-text-subdued hover:text-text-base'
          )}
          title="Queue"
        >
          <ListMusic size={18} />
        </button>

        {/* Device */}
        <button className="text-text-subdued hover:text-text-base hover:scale-110 transition-all" title="Connect to a device">
          <Laptop2 size={18} />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-text-subdued hover:text-text-base">
            <VolumeIcon size={18} />
          </button>
          <div
            ref={volumeRef}
            onClick={handleVolumeClick}
            className="w-24 h-1 bg-white/20 rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-text-base group-hover:bg-spotify-green rounded-full relative transition-colors"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-text-base opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Fullscreen */}
        <button className="text-text-subdued hover:text-text-base hover:scale-110 transition-all" title="Full screen player">
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
}
```

---

## 24. PERFORMANCE OPTIMIZATION

```typescript
// src/lib/formatters.ts
export function formatDuration(ms: number): string {
  if (!ms || isNaN(ms) || ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatPlayCount(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}

export function formatAlbumDuration(songs: { duration_ms: number }[]): string {
  const totalMs = songs.reduce((acc, s) => acc + (s.duration_ms || 0), 0);
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  if (hours > 0) return `${hours} hr ${minutes} min`;
  return `${minutes} min`;
}

// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 50%, 30%)`;
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}
```

---

## 25. SECURITY IMPLEMENTATION

```typescript
// src/middleware.ts (Rate Limiting addition)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': Math.floor((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }
  // ... rest of middleware
}
```

---

## 26. PWA CONFIGURATION

```json
// public/manifest.json
{
  "name": "Spotify Clone",
  "short_name": "SpotiClone",
  "description": "Music streaming app — Spotify clone built with Next.js",
  "theme_color": "#121212",
  "background_color": "#121212",
  "display": "standalone",
  "orientation": "portrait-primary",
  "scope": "/",
  "start_url": "/home",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["music", "entertainment"],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

---

## 27. CI/CD PIPELINE

```yaml
# .github/workflows/ci-cd.yml
name: Spotify Clone CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

jobs:
  # ─── QUALITY CHECKS ────────────────────────────────────────
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: ESLint
        run: npm run lint

      - name: Prettier check
        run: npx prettier --check .

  # ─── TESTS ─────────────────────────────────────────────────
  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v4

  # ─── BUILD ─────────────────────────────────────────────────
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}

      - name: Cache build artifacts
        uses: actions/cache@v4
        with:
          path: .next
          key: build-${{ github.sha }}

  # ─── DEPLOY ────────────────────────────────────────────────
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Notify Sentry of deploy
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: spotify-clone
        with:
          environment: production
```

---

## 28. BUG AUDIT — ALL SCENARIOS

```
╔══════════════════════════════════════════════════════════════════════════╗
║          COMPLETE BUG AUDIT — SENIOR ENGINEER + HACKER + AI PERSPECTIVE ║
╚══════════════════════════════════════════════════════════════════════════╝

SCENARIO A: Senior Engineer Audit
═══════════════════════════════════

🔴 CRITICAL
───────────
BUG-001: Audio blob memory leak in WaveformVisualizer
  Problem: URL.createObjectURL never revoked on component unmount
  Fix: Call URL.revokeObjectURL in cleanup effect

BUG-002: Race condition in player — song changes before Howl loads
  Problem: fast-clicking next creates orphaned Howl instances
  Fix: Add loading state guard + sequential Howl.unload() before new load

BUG-003: Zustand _howl reference lost on persist rehydration
  Problem: Howl instances are not serializable — crash on page reload
  Fix: Exclude _howl from persist using partialize (already done above)

BUG-004: IndexedDB objectURL invalidated after page reload
  Problem: URL.createObjectURL URLs don't persist across sessions
  Fix: Re-create objectURL from stored blob on retrieval

BUG-005: Supabase RLS bypass via playlist_songs INSERT
  Problem: Collaborative playlist check allows any user to add songs
  Fix: Stricter RLS — check is_collaborative field correctly

🟠 HIGH
───────
BUG-006: Search query SQL injection via LIKE pattern
  Problem: Unescaped % and _ characters in search input
  Fix: Sanitize input — escape special characters before LIKE

BUG-007: Image upload to Cloudinary leaks API secret in browser
  Problem: CLOUDINARY_API_SECRET called from client component
  Fix: Always upload via server-side API route — never from browser

BUG-008: Supabase auth session not refreshed after token expiry
  Problem: No auto-refresh → silent 401 errors after 1hr
  Fix: Configure auto-refresh in SupabaseClient, handle session events

BUG-009: Audio seeking to NaN when duration is 0
  Problem: seek() called before duration loaded → Howl.seek(NaN)
  Fix: Guard: if (!duration || duration === 0) return;

BUG-010: Rate limiter blocks legitimate users sharing IP (NAT)
  Problem: Corporate networks share IP → 100 req/min per IP too low
  Fix: Combine IP + user session for rate limit key

🟡 MEDIUM
─────────
BUG-011: Waveform out of sync when Howl uses Web Audio vs HTML5
  Problem: WaveSurfer seeks to different position than Howler
  Fix: Use position from Howler as source of truth, not WaveSurfer

BUG-012: Missing loading skeleton on album/artist pages
  Problem: Content flash (CLS) on slow connections
  Fix: Add Suspense boundaries with proper skeleton components

BUG-013: Liked songs count doesn't update optimistically
  Problem: Heart click requires server round-trip → delayed UI
  Fix: Implement optimistic updates with React Query

BUG-014: Playlist cover upload doesn't clean up old Cloudinary image
  Problem: Old images orphaned on Cloudinary when cover replaced
  Fix: Delete old publicId before uploading new cover

BUG-015: Mobile: swipe gestures interfere with scrolling
  Problem: Touch event handlers prevent default scroll behavior
  Fix: Only prevent default on horizontal swipes > 30px threshold

BUG-016: Keyboard shortcuts fire in modal/input contexts
  Problem: Space bar pauses music while typing in search
  Fix: Already partially handled — add more target checks

BUG-017: Missing ARIA labels on all icon-only buttons
  Problem: Screen readers announce "button" with no context
  Fix: Add aria-label to all icon buttons (Play, Pause, Like, etc.)

BUG-018: Play history doesn't record play percentage correctly
  Problem: played_percentage always 0 — never updated
  Fix: Record percentage when song ends or user skips

🟢 LOW
──────
BUG-019: Tailwind purge removes dynamic color classes
  Problem: Dynamic gradient classes from generateColorFromString() pruned
  Fix: Add safelist to tailwind.config.ts for dynamic classes

BUG-020: Date formatting uses browser locale (inconsistent)
  Problem: "Jan 5, 2024" vs "5 Jan 2024" across regions
  Fix: Always pass { locale: 'en-US' } to toLocaleDateString

BUG-021: Long track names overflow Now Playing Bar on small screens
  Problem: Title overflows past heart button
  Fix: Ensure truncate class on title container

BUG-022: Podcast episodes missing from search results
  Problem: Search only queries songs table, not podcast_episodes
  Fix: Add podcast_episodes to search query union

SCENARIO B: Hacker / Security Audit
═════════════════════════════════════

🔴 CRITICAL
───────────
SEC-001: CORS misconfiguration allows any origin to call API
  Problem: No origin validation on API routes
  Fix: Add explicit CORS headers allowing only your domain

SEC-002: Supabase service role key exposed risk
  Problem: If accidentally committed/logged, gives full DB access
  Fix: Rotate immediately, audit logs, use env + secret scanning

SEC-003: Missing CSRF protection on state-changing API routes
  Problem: POST /api/playlists exploitable via CSRF
  Fix: SameSite=Strict cookies + CSRF token header validation

🟠 HIGH
───────
SEC-004: No input length validation on playlist names
  Problem: 10MB description could DoS API
  Fix: Already in Zod schema — ensure it's applied everywhere

SEC-005: Audio file URLs never expire
  Problem: Supabase Storage public URLs don't expire
  Fix: Use signed URLs with 1hr expiry for private audio

SEC-006: User can set any avatar_url (open redirect potential)
  Problem: avatar_url field accepts any URL
  Fix: Only allow Cloudinary or Supabase Storage URLs

SCENARIO C: Performance / AI Engineer Audit
════════════════════════════════════════════

⚡ PERFORMANCE
──────────────
PERF-001: Fetching all playlist songs in one query (N+1 risk)
  Problem: Each song triggers separate artist/album queries
  Fix: Use Supabase select with nested joins (already done in schema)

PERF-002: WaveSurfer loads full audio file for waveform rendering
  Problem: 5MB MP3 downloaded just for visual peaks
  Fix: Pre-compute waveform peaks, store in songs.waveform_data JSONB

PERF-003: No pagination in home feed
  Problem: Loading 30 songs × 4 sections = 120 DB rows on every load
  Fix: Implement cursor-based pagination + React Query infinite scroll

PERF-004: Images not using Next.js Image optimization for external URLs
  Problem: Raw <img> tags still exist in some components
  Fix: Replace all <img> with Next.js <Image> component

PERF-005: Supabase Realtime channel never unsubscribed
  Problem: Memory leak — channels accumulate across route changes
  Fix: Return cleanup function in useEffect (already done above)
```

---

## 29. TASK BOARD

| ID | Title | Priority | Status | Est. Credits |
|----|-------|----------|--------|-------------|
| TASK-001 | Initialize Next.js 14 project with TypeScript | 🔴 Critical | ⏳ Pending | 5 |
| TASK-002 | Configure Tailwind with exact Spotify colors | 🔴 Critical | ⏳ Pending | 3 |
| TASK-003 | Set up Supabase project + run schema SQL | 🔴 Critical | ⏳ Pending | 8 |
| TASK-004 | Configure Supabase Auth (Email + Google + GitHub) | 🔴 Critical | ⏳ Pending | 6 |
| TASK-005 | Build Auth pages (Login + Signup) | 🔴 Critical | ⏳ Pending | 8 |
| TASK-006 | Implement Middleware (auth guard + rate limit) | 🔴 Critical | ⏳ Pending | 5 |
| TASK-007 | Build Zustand player store with Howler.js | 🔴 Critical | ⏳ Pending | 10 |
| TASK-008 | Build NowPlayingBar component | 🔴 Critical | ⏳ Pending | 8 |
| TASK-009 | Build Sidebar component | 🟠 High | ⏳ Pending | 7 |
| TASK-010 | Build Main layout (sidebar + player + topbar) | 🟠 High | ⏳ Pending | 6 |
| TASK-011 | Build Home page (server + client) | 🟠 High | ⏳ Pending | 8 |
| TASK-012 | Build Song Row + Song List components | 🟠 High | ⏳ Pending | 6 |
| TASK-013 | Build Album, Artist, Playlist pages | 🟠 High | ⏳ Pending | 12 |
| TASK-014 | Build Search page with fuzzy results | 🟠 High | ⏳ Pending | 8 |
| TASK-015 | Implement Liked Songs feature | 🟠 High | ⏳ Pending | 5 |
| TASK-016 | Build Playlist CRUD (create/edit/delete) | 🟠 High | ⏳ Pending | 8 |
| TASK-017 | Implement Queue management | 🟠 High | ⏳ Pending | 6 |
| TASK-018 | Add Waveform visualization (WaveSurfer.js) | 🟡 Medium | ⏳ Pending | 7 |
| TASK-019 | Implement WebSocket real-time sync | 🟡 Medium | ⏳ Pending | 8 |
| TASK-020 | Set up Cloudinary image CDN | 🟡 Medium | ⏳ Pending | 4 |
| TASK-021 | Implement offline caching (PWA + IndexedDB) | 🟡 Medium | ⏳ Pending | 10 |
| TASK-022 | Add keyboard shortcuts | 🟡 Medium | ⏳ Pending | 3 |
| TASK-023 | Add Media Session API (headphone controls) | 🟡 Medium | ⏳ Pending | 3 |
| TASK-024 | Build Lyrics panel | 🟡 Medium | ⏳ Pending | 6 |
| TASK-025 | Build Equalizer component | 🟡 Medium | ⏳ Pending | 5 |
| TASK-026 | Implement recommendations engine | 🟡 Medium | ⏳ Pending | 8 |
| TASK-027 | Add Canvas audio visualizer | 🟢 Low | ⏳ Pending | 5 |
| TASK-028 | Build Statistics dashboard | 🟢 Low | ⏳ Pending | 7 |
| TASK-029 | Implement social features (follow artists) | 🟢 Low | ⏳ Pending | 6 |
| TASK-030 | Add embed player | 🟢 Low | ⏳ Pending | 5 |
| TASK-031 | Podcast support | 🟢 Low | ⏳ Pending | 8 |
| TASK-032 | CI/CD GitHub Actions pipeline | 🟢 Low | ⏳ Pending | 3 |
| TASK-033 | Fix BUG-001 to BUG-022 (all audit bugs) | 🔴 Critical | ⏳ Pending | 15 |
| TASK-034 | Fix SEC-001 to SEC-006 (security) | 🔴 Critical | ⏳ Pending | 10 |
| TASK-035 | Fix PERF-001 to PERF-005 (performance) | 🟠 High | ⏳ Pending | 8 |
| TASK-036 | Write unit tests (hooks + utils) | 🟡 Medium | ⏳ Pending | 10 |
| TASK-037 | Write integration tests | 🟡 Medium | ⏳ Pending | 8 |
| TASK-038 | Deploy to Vercel + configure domains | 🟠 High | ⏳ Pending | 3 |
| TASK-039 | Configure Sentry error monitoring | 🟡 Medium | ⏳ Pending | 2 |
| TASK-040 | Write README.md (portfolio-ready) | 🟢 Low | ⏳ Pending | 3 |

---

## 30. EXECUTION PLAN

### ▶️ Selected Starting Task

**Selected Task:** `TASK-001 through TASK-008` — Core Foundation
**Reason:** These are all 🔴 Critical and must be done before any other task can begin.

### Step-by-Step Execution

```bash
# ═══════════════════════════════════════════════════════════
# STEP 1: Initialize Project
# ═══════════════════════════════════════════════════════════

# In PowerShell as Administrator:
cd D:\
mkdir "SPOTIFY CLONE"
cd "SPOTIFY CLONE"

npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install all dependencies:
npm install @supabase/supabase-js @supabase/ssr \
  zustand @tanstack/react-query \
  howler wavesurfer.js \
  framer-motion \
  lucide-react \
  cloudinary \
  idb \
  uuid \
  zod \
  clsx tailwind-merge \
  @upstash/ratelimit @upstash/redis \
  next-pwa \
  @tailwindcss/forms @tailwindcss/typography @tailwindcss/line-clamp

npm install -D \
  @types/howler \
  @types/uuid \
  @types/node \
  prettier \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom

# ═══════════════════════════════════════════════════════════
# STEP 2: Create all config files
# (Copy the configs from sections 8, 9 of this document)
# ═══════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════
# STEP 3: Set up Supabase
# ═══════════════════════════════════════════════════════════
# 1. Go to https://supabase.com → New Project
# 2. Copy project URL and anon key → .env.local
# 3. Go to SQL Editor → paste schema from Section 4.1
# 4. Go to Authentication → Enable Google + GitHub OAuth
# 5. Go to Storage → Create 'songs' bucket (private)
# 6. Go to Realtime → Enable for user_play_sessions, notifications

# ═══════════════════════════════════════════════════════════
# STEP 4: Set up Cloudinary
# ═══════════════════════════════════════════════════════════
# 1. https://cloudinary.com → Create free account
# 2. Go to Settings → Upload → Add upload preset 'spotify_covers'
# 3. Copy cloud name, API key, API secret → .env.local

# ═══════════════════════════════════════════════════════════
# STEP 5: Build in order
# ═══════════════════════════════════════════════════════════
# Follow file structure from Section 6 — create each file
# using the code provided in their respective sections.

# ═══════════════════════════════════════════════════════════
# STEP 6: Run development server
# ═══════════════════════════════════════════════════════════
npm run dev
# Open http://localhost:3000

# ═══════════════════════════════════════════════════════════
# STEP 7: Deploy to Vercel
# ═══════════════════════════════════════════════════════════
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod

# Set environment variables in Vercel Dashboard:
# Settings → Environment Variables → Add all from .env.local
```

---

## ⚡ NEXT ACTIONS

1. **Execute TASK-001**: Run project initialization commands in `D:\SPOTIFY CLONE`
2. **Execute TASK-002**: Copy Tailwind config from Section 8
3. **Execute TASK-003**: Run SQL schema in Supabase SQL Editor
4. **Execute TASK-004**: Configure OAuth providers in Supabase Dashboard
5. **Execute TASK-005-008**: Build auth + player foundation
6. **Run audit**: After building, run `TASK-033/034` bug fixes
7. **Deploy**: `TASK-038` — Vercel deployment
8. **Monitor**: Enable Sentry (`TASK-039`) after first deploy

---

*🎵 This is the complete, production-grade Spotify Clone master prompt.*
*Version 3.0.0 | Sandy (Santhosh) | Project: D:\SPOTIFY CLONE*
*Total tasks: 40 | Critical: 12 | High: 9 | Medium: 12 | Low: 7*