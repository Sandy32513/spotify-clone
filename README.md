# Spotify Clone - Production-Grade Web Application

A fully-featured Spotify clone built with Next.js 14, TypeScript, TailwindCSS, Supabase, and Howler.js. This project implements a pixel-perfect Spotify UI with real-time synchronization, offline caching, and advanced audio visualization.

## Features

### Core Functionality
- **Music Player**: Play/pause, seek, volume control, shuffle, repeat (off/all/one)
- **Queue System**: Add/remove songs, reorder, skip next/previous
- **Waveform Visualization**: Real-time animated audio waveform
- **Library Management**: Create, edit, delete playlists; add/remove songs
- **Search**: Find songs, albums, artists, playlists across entire library
- **Liked Songs**: Dedicated playlist for favorite tracks
- **Recently Played**: Track listening history

### Technical Features
- **Real-time Sync**: WebSocket-based playback state sync across tabs/devices
- **Offline Mode**: Service worker caches audio and images via IndexedDB
- **Authentication**: Supabase Auth with session persistence
- **Responsive Design**: Works seamlessly on all screen sizes
- **Performance**: Optimized bundle size, lazy loading, efficient re-renders
- **Type Safety**: Full TypeScript coverage with strict mode

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS v4 |
| **State Management** | Zustand, React Query |
| **Audio** | Howler.js, Web Audio API |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Realtime** | WebSockets (ws) |
| **Media Storage** | Cloudinary |
| ** DevOps** | GitHub Actions, ESLint, Jest |

## Database Schema

```
users
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── avatar_url (TEXT)
└── created_at (TIMESTAMP)

songs
├── id (UUID, PK)
├── title (TEXT)
├── artist (TEXT)
├── artist_id (UUID → artists.id)
├── album_id (UUID → albums.id)
├── url (TEXT)
├── thumbnail (TEXT)
├── duration (INTEGER)
└── created_at (TIMESTAMP)

playlists
├── id (UUID, PK)
├── user_id (UUID → users.id)
├── name (TEXT)
├── description (TEXT)
├── thumbnail (TEXT)
├── is_public (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

playlist_songs
├── id (UUID, PK)
├── playlist_id (UUID → playlists.id)
├── song_id (UUID → songs.id)
├── position (INTEGER)
└── added_at (TIMESTAMP)

recently_played
├── id (UUID, PK)
├── user_id (UUID → users.id)
├── song_id (UUID → songs.id)
└── played_at (TIMESTAMP)

likes
├── id (UUID, PK)
├── user_id (UUID → users.id)
├── song_id (UUID → songs.id)
└── liked_at (TIMESTAMP)

artists
├── id (UUID, PK)
├── name (TEXT)
├── image_url (TEXT)
├── bio (TEXT)
└── followers_count (INTEGER)

albums
├── id (UUID, PK)
├── title (TEXT)
├── artist_id (UUID → artists.id)
├── artist (TEXT)
├── thumbnail (TEXT)
├── release_year (INTEGER)
└── created_at (TIMESTAMP)
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Cloudinary account

### Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd spotify-clone
npm install
```

2. **Set up environment variables**
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Set up Supabase**
```bash
# Navigate to Supabase SQL Editor
# Run the migration: supabase/migrations/001_initial_schema.sql
```

4. **Set up Cloudinary**
- Create an upload preset named "spotify" with unsigned upload enabled
- Note your cloud name, API key, and API secret

5. **Run the development server**
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=...)

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy to Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway link
railway up
```

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js App   │────▶│  Supabase    │────▶│ PostgreSQL   │
│   (React)       │     │   Auth       │     │   Database   │
└────────┬────────┘     └──────────────┘     └──────────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│ Cloudinary      │
│ Media Storage   │
└─────────────────┘
         │
         │ WebSocket
         ▼
┌─────────────────┐
│  WebSocket      │
│  Server         │
│  (ws)           │
└─────────────────┘
```

## Security

### Implemented Protections
- Row Level Security (RLS) on all tables
- JWT-based authentication with refresh tokens
- CSRF protection on state-changing operations
- Input validation on all API endpoints
- Rate limiting on auth routes
- XSS protection via sanitization

### Known Security Considerations
- Service role key must NEVER be exposed client-side
- CORS configured for specific origins only
- Service worker scoped to app origins only

## Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Code Splitting** | Dynamic imports for heavy components |
| **Image Optimization** | Next.js Image component with WebP |
| **Caching** | Service worker + IndexedDB for offline |
| **Bundle Size** | Tree-shaking, dependency optimization |
| **Audio Streaming** | Howler.js with HTML5 audio fallback |
| **State Hydration** | Zustand with selective persistence |

## Development

### Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run Jest tests
```

### Project Structure
```
src/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes
│   ├── auth/        # Authentication pages
│   ├── playlist/    # Playlist detail
│   ├── album/       # Album detail
│   └── library/     # Library page
├── components/       # React components
│   ├── Layout.tsx   # Main layout wrapper
│   ├── Sidebar.tsx  # Navigation sidebar
│   ├── Player.tsx   # Audio player
│   ├── SongCard.tsx # Song list item
│   └── ...
├── lib/             # Utilities & configurations
│   └── supabase/    # Supabase clients
├── store/           # Zustand stores
│   ├── playerStore.ts
│   ├── uiStore.ts
│   └── authStore.ts
├── hooks/           # Custom React hooks
├── types/           # TypeScript definitions
├── utils/           # Helper functions
└── public/          # Static assets
```

## Bug Report & Audit System

This project includes a comprehensive bug detection and fix system. Audit findings are generated in:

- `AUDIT_REPORT.md` - Security, performance, and quality issues
- `BUGS.md` - Detailed bug classifications

Run audit:
```bash
npm run audit
```

## API Reference

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/songs` | GET | List all songs |
| `/api/songs` | POST | Create song (admin) |
| `/api/playlists` | GET | List playlists |
| `/api/playlists` | POST | Create playlist |
| `/api/playlists/[id]` | GET | Get playlist with songs |
| `/api/playlists/[id]` | PATCH | Update playlist |
| `/api/playlists/[id]` | DELETE | Delete playlist |
| `/api/playlists/[playlistId]/songs` | POST | Add song to playlist |
| `/api/playlists/[playlistId]/songs` | DELETE | Remove song from playlist |
| `/api/auth/logout` | POST | Sign out |
| `/api/ws` | GET | Get WebSocket URL |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | C → S | Join a room |
| `play` | C → S | Start playback |
| `pause` | C → S | Pause playback |
| `seek` | C → S | Seek to position |
| `track_change` | C → S | Change current track |
| `queue_update` | C → S | Update queue |
| `play` | S → C | Playback started (sync) |
| `pause` | S → C | Playback paused (sync) |
| `seek` | S → C | Seek position (sync) |

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## Known Issues

- iOS Safari requires user interaction before audio playback
- MediaSession API not fully supported in all browsers
- WebSocket auto-reconnect has 3-second delay (configurable)

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Lyrics display (Musixmatch API)
- [ ] Podcast support
- [ ] Social features (follow users, share playlists)
- [ ] AI recommendations
- [ ] Social login (Google, Apple, Spotify)
- [ ] Chromecast support
- [ ] Desktop app (Electron)

## License

MIT License - See [LICENSE](LICENSE) for details.

## Credits

Built by [Your Name] - Inspired by Spotify's design language.

---

**Note**: This is a demo project. All audio files are placeholders. Replace with actual audio URLs from Cloudinary or similar CDN.
