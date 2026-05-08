# Quick Start Guide - Spotify Clone

Get up and running in 10 minutes! 🚀

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- npm or yarn
- Git
- A Supabase account (free tier works)
- A Cloudinary account (free tier works)

---

## Step 1: Clone & Install (2 min)

```bash
# Clone repository
git clone <your-repo-url>
cd spotify-clone

# Install dependencies
npm install
```

---

## Step 2: Environment Setup (2 min)

```bash
# Copy environment template
cp .env.local.example .env.local
```

**Fill in the values:**

### Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) → Create project
2. Go to **Settings** → **API**
3. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key - **keep secret!**)

### Get Cloudinary Credentials

1. Go to [cloudinary.com](https://cloudinary.com) → Create account
2. Go to **Dashboard** → **Account Details**
3. Copy:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

**Your `.env.local` should look like:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret

# WebSocket (can use defaults for local)
WS_SERVER_URL=ws://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## Step 3: Database Setup (2 min)

### Option A: Automatic (with Supabase CLI)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations
supabase db push
```

### Option B: Manual (SQL Editor)

1. Go to your Supabase project → **SQL Editor**
2. Click **New Query**
3. Open file: `supabase/migrations/001_initial_schema.sql`
4. Copy all contents
5. Paste into SQL Editor and click **Run**
6. Wait for completion (should see "Success. No rows returned")

---

Run Storage setup after the database migration:

```bash
npm run supabase:storage
```

## Step 4: Seed Sample Data (1 min)

Add demo songs so you can test the player:

```bash
npm run seed
```

This will insert:
- 5 artists (The Weeknd, Ariana Grande, Ed Sheeran, Taylor Swift, Drake)
- 5 albums
- 10 sample songs (with free MP3 URLs from SoundHelix)

---

## Step 5: Start WebSocket Server (1 min)

Open a **new terminal window** (keep the dev server separate):

```bash
npm run ws
```

You should see: `WebSocket server listening on port 3001`

---

## Step 6: Run Development Server (1 min)

In your main terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 7: Create Your First Account (1 min)

1. Click **Sign up** on the login page
2. Enter email and password (min 6 chars)
3. Click **Sign Up**
4. Check your email for confirmation link (Supabase sends it)
5. Click the link → you'll be redirected and logged in!

---

## 🎉 You're Ready!

The app should now show:

- **Sidebar** with navigation (Home, Search, Library)
- **Main area** with 10 sample songs
- **Player bar** at the bottom

**Try it:**
1. Click any song → starts playing
2. Click play/pause in player bar
3. Adjust volume slider
4. Click "Queue" to see upcoming songs
5. Add to queue with the + button (when implemented)
6. Search for "The Weeknd" or "Ed Sheeran"

---

## Troubleshooting

### 🔴 Login/Signup not working?
- Check Supabase credentials in `.env.local`
- Ensure Supabase Auth is enabled (Settings → Auth → Providers)
- Check browser console for errors

### 🔴 Songs not playing?
- Ensure MP3 URLs are accessible (sample ones work)
- Check browser audio isn't muted
- Check WebSocket server is running (port 3001)

### 🔴 Blank page?
- Run `npm run build` to check for build errors
- Check Next.js version compatibility

### 🔴 Database errors?
- Double-check migration was applied
- Ensure RLS policies are in place
- Verify table names match (songs, artists, albums)

### 🔴 Stuck? Get Help
- Open an issue on GitHub
- Check `AUDIT_REPORT.md` for known issues
- Review browser console for errors

---

## What's Next?

### 1. Customize UI Theme
Edit `app/globals.css` and `tailwind.config.ts` to change Spotify colors.

### 2. Add Your Own Music
Use Cloudinary dashboard to upload MP3s → copy URLs → add to database via:
```bash
# Direct SQL insert or
POST /api/songs with JSON body
```

### 3. Deploy to Vercel (Production)
```bash
# Push to GitHub first
git add .
git commit -m "Initial commit"
git push

# Then deploy via Vercel CLI
npm i -g vercel
vercel --prod
```

Don't forget to set environment variables in Vercel dashboard!

### 4. Enable Realtime Sync
The WebSocket server is already running locally. For production:
- Deploy to Railway/Render
- Update `NEXT_PUBLIC_WS_URL` in environment
- Done! 🚀

---

## Useful Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run ws               # Start WebSocket server
npm run seed             # Add sample data

# Code Quality
npm run lint             # Check code style
npm run typecheck        # TypeScript validation
npm test                 # Run tests
npm run audit            # Bug audit

# Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:setup         # Run migrations (macOS/Linux)
npm run db:setup:bash    # Run migrations (Windows bash)
```

---

## Project Structure Overview

```
spotify-clone/
├── app/                    # Next.js pages & API routes
│   ├── (auth)/            # Login/signup
│   ├── api/               # Backend API
│   ├── playlist/[id]/    # Dynamic playlist
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                  # Utilities
│   └── supabase/         # Supabase clients
├── store/                # Zustand stores
├── hooks/                # Custom hooks
├── types/                # TypeScript definitions
├── supabase/
│   └── migrations/       # Database schema
├── public/               # Static files
├── scripts/              # Setup scripts
├── docs/                 # Documentation
└── *.config.*           # Config files
```

---

## Features Checklist

✅ **Music Player**
- [x] Play/pause
- [x] Seek
- [x] Volume control
- [x] Shuffle mode
- [x] Repeat (off/all/one)
- [x] Waveform visualization

✅ **Library**
- [x] All songs list
- [x] Playlists (create/edit/delete)
- [x] Add/remove songs
- [x] Liked songs
- [x] Artist/album views

✅ **Search**
- [x] Search songs
- [x] Search albums
- [x] Search artists
- [x] Search playlists

✅ **Auth**
- [x] Sign up
- [x] Login
- [x] Session persistence
- [x] Protected routes

✅ **Realtime**
- [x] WebSocket server
- [x] Multi-tab sync
- [x] Live queue updates

✅ **Offline**
- [x] Service worker
- [x] Image caching
- [ ] Audio caching (WIP)

---

## Need Help?

📖 **Documentation**: See `/docs` folder
🐛 **Report Bug**: Create GitHub issue
💡 **Feature Request**: Create GitHub issue
📧 **Contact**: Your email here

---

**Happy listening! 🎧**
