# 🚀 DEPLOYMENT GUIDE - Spotify Clone

**Complete step-by-step deployment instructions for production**  
**Target Platforms:** Vercel (frontend), Supabase (database + auth + storage), Cloudinary (CDN), Railway/Render (WebSocket)  
**Estimated Time:** 45 minutes  
**Difficulty:** Intermediate

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Prerequisites

- [ ] GitHub account (for repository)
- [ ] Vercel account (free tier OK)
- [ ] Supabase account (free tier OK for start)
- [ ] Cloudinary account (free tier OK)
- [ ] Domain name (optional, Vercel provides free subdomain)
- [ ] Node.js 18+ installed locally
- [ ] Git installed locally
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Vercel CLI installed (`npm install -g vercel`)

### ✅ Code Readiness

- [x] All TypeScript type checks pass (`npm run typecheck`)
- [x] ESLint passes (`npm run lint`)
- [x] Build succeeds (`npm run build`)
- [x] All security fixes applied (Phase 1 complete)
- [ ] Environment variables documented
- [ ] Database migrations tested locally
- [ ] WebSocket server tested locally

---

## 🗄️ STEP 1: SET UP SUPABASE

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → Sign in / Sign up
2. Click **"New Project"**
3. Configure:
   - **Project name:** `spotify-clone-prod` (or your name)
   - **Database Password:** Generate strong password (save in password manager)
   - **Region:** Choose closest to users (e.g., `US East (N. Virginia)`)
   - **Plan:** Free (or Pro if need >500MB DB)
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### 1.2 Get Supabase Credentials

In your project dashboard:

1. Go to **Settings** → **API**
2. Copy these values:
   ```
   Project URL: https://xxx.supabase.co
   anon/public API key: eyJhbGciOiJIUzI1NiIsInR5cCI6...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6...
   JWT Secret: your-jwt-secret-from-env
   ```

   **⚠️ service_role key is LIKE A PASSWORD - NEVER expose to client!**

3. Also note your **Project ID** (e.g., `jqskftkwrsfpbmhqhxto`)

### 1.3 Apply Database Migration

**Option A: Using Supabase CLI (Recommended)**

```bash
# Login to Supabase
supabase login

# Link local project to remote
supabase link --project-ref xxx  # Your project ID

# Push migrations
supabase db push
```

**Option B: Using SQL Editor (Manual)**

1. In Supabase Dashboard → SQL Editor
2. Click **"New Query"**
3. Open file `supabase/migrations/001_initial_schema.sql`
4. Copy entire contents
5. Paste into SQL Editor
6. Click **"Run"** (may take 30-60 seconds)
7. Verify success message

### 1.4 Create Storage Buckets

**Run the bucket configuration script:**

```bash
# This uses your service role key to create/update buckets
npm run supabase:storage
```

**Or manually via SQL:**

```sql
-- These are already created by the migration (lines 854-865)
-- But verify they exist in Storage → Buckets:
--   songs (public, 25MB, audio/*)
--   music-assets (public, 25MB, audio/*)
--   temp-uploads (private, 25MB)
--   extracted-files (private, 25MB)
--   user-uploads (private, 25MB)
--   logs (private, 10MB)
--   reports (private, 10MB)
```

### 1.5 Configure Storage Policies (Optional)

By default, `songs` and `music-assets` are public-read. For private buckets:

```sql
-- Example: Make songs bucket private (if you want signed URLs)
UPDATE storage.buckets
SET public = false
WHERE id = 'songs';
```

**But for this app, public is fine** (audio is meant to be streamable).

---

## 🖼️ STEP 2: SET UP CLOUDINARY

### 2.1 Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up
2. Free tier gives: 25GB storage, 25GB bandwidth/month
3. Verify email

### 2.1 Get Cloudinary Credentials

1. In Cloudinary Dashboard → **Settings** → **Account**
2. Find:
   ```
   Cloud Name: dd7spu5to
   API Key: 394771761789367
   API Secret: MtWStlp8u_vAp4ShZFMu5QWB2bs
   ```

3. Also go to **Settings** → **Upload** → **Upload presets**
   - Create preset named `spotify` (or use existing `spotify_clone_preset`)
   - Set **Signing Mode**: Unsigned (for browser uploads)
   - Enable **"Unsigned"** checkbox
   - Save

---

## 🌐 STEP 3: DEPLOY FRONTEND TO VERCEL

### 3.1 Push Code to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - Spotify Clone"

# Create new GitHub repository
# Go to github.com → New repository → "spotify-clone"

# Push
git remote add origin https://github.com/yourusername/spotify-clone.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy to Vercel

**Option A: One-Click Deploy (Easiest)**

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Import Project"**
3. Select your `spotify-clone` repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `.` (root)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

5. **Environment Variables:** Click **"Environment Variables"** and add ALL:

   | Key | Value | Type |
   |-----|-------|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Plain |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Plain |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | **Secret** |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dd7spu5to` | Plain |
   | `CLOUDINARY_API_KEY` | `394771761789367` | Plain |
   | `CLOUDINARY_API_SECRET` | `MtWStlp8u_vAp4...` | **Secret** |
   | `ADMIN_USERNAME` | `your_admin_username` | **Secret** |
   | `ADMIN_PASSWORD` | `your_strong_password` | **Secret** |
   | `ADMIN_SESSION_SECRET` | `random-32-char-string` | **Secret** |
   | `NEXT_PUBLIC_WS_URL` | `wss://your-ws-server.com` | Plain |
   | `NEXT_PUBLIC_SUPABASE_JWT_SECRET` | (optional - WS uses service key) | Plain |
   | `CORS_ALLOWED_ORIGINS` | `https://yourdomain.com` | Plain |

   **Mark service role and admin secrets as "Secret" in Vercel** (hidden from team members).

6. Click **"Deploy"**

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (interactive)
vercel

# Answer prompts:
# - Set up and deploy? Yes
# - Link to existing project? No (create new)
# - Project name: spotify-clone
# - Directory: ./
# - Want to modify settings? No (we'll add env vars in dashboard)

# After deploy, add env vars in Vercel dashboard
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... repeat for all 12 env vars
```

### 3.3 Verify Deployment

After Vercel builds (2-3 minutes):

1. Visit `https://spotify-clone.vercel.app`
2. Should see Spotify Clone login page
3. Test with Supabase Auth credentials:
   - Sign up new account
   - Log in
   - Browse catalog (placeholder songs may not exist yet - see seed step)

---

## 🔌 STEP 4: DEPLOY WEBSOCKET SERVER

WebSocket server needs to run separately (Next.js API routes can't do WebSocket upgrades).

### Option A: Railway (Easiest - Free Tier)

1. Create `railway.json` in project root:

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npx tsx websocket-server.ts",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. Install Railway CLI:
```bash
npm install -g @railway/cli
```

3. Login and deploy:
```bash
railway login
railway link  # Create new project or link existing
railway up    # Deploys and gives you a URL like wss://spotify-ws.up.railway.app
```

4. Copy your WebSocket URL (e.g., `wss://spotify-ws.up.railway.app`)

### Option B: Render (Also Free)

1. Create new **Web Service** on [render.com](https://render.com)
2. Connect GitHub repo
3. Settings:
   - **Name:** `spotify-ws`
   - **Root Directory:** `.`
   - **Build Command:** `npm install`
   - **Start Command:** `npx tsx websocket-server.ts`
   - **Plan:** Free (but sleeps after 15min inactivity)
4. Add **Environment Variables** (same as Vercel but only WS-relevant):
   ```
   NEXT_PUBLIC_SUPABASE_JWT_SECRET= (if using)
   SUPABASE_SERVICE_ROLE_KEY= (optional, WS doesn't need it)
   ```
5. Deploy → gets `wss://your-service.onrender.com`

### Option C: DigitalOcean Droplet ($5/mo)

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone https://github.com/yourusername/spotify-clone.git
cd spotify-clone

# Install deps
npm install --production

# Set up PM2 process manager
npm install -g pm2
pm2 start websocket-server.ts --name spotify-ws --interpreter tsx
pm2 save
pm2 startup  # Follow instructions

# Configure firewall
ufw allow 3001
```

**Update Vercel env var:**
```
NEXT_PUBLIC_WS_URL=wss://your-droplet-ip:3001
```

---

## 🧪 STEP 5: DATABASE SEEDING (Optional)

To populate with sample data for development:

```bash
# Run seed script locally (requires SUPABASE_SERVICE_ROLE_KEY)
npm run seed
```

**Or manually via Supabase Studio:**

1. Go to Supabase Dashboard → Table Editor
2. Insert rows into:
   - `artists` (e.g., "The Beatles", "Taylor Swift")
   - `albums` (link to artists)
   - `songs` (link to albums, add Cloudinary URLs for audio)
   - `genres` (optional)

**Quick seed with sample SQL:**
```sql
-- Insert sample artist
INSERT INTO artists (id, name, image_url, followers_count)
VALUES (
  gen_random_uuid(),
  'Sample Artist',
  'https://example.com/image.jpg',
  1000
);

-- Insert sample album
INSERT INTO albums (id, title, artist_id, artist, thumbnail)
SELECT 
  gen_random_uuid(),
  'Greatest Hits',
  a.id,
  a.name,
  'https://example.com/album.jpg'
FROM artists a WHERE a.name = 'Sample Artist';

-- Insert sample song
INSERT INTO songs (id, title, artist, artist_id, album_id, url, thumbnail, duration, status)
SELECT
  gen_random_uuid(),
  'Sample Song',
  a.name,
  a.id,
  al.id,
  'https://res.cloudinary.com/yourcloud/audio/upload/sample.mp3',
  'https://example.com/sample.jpg',
  225,
  'published'
FROM artists a, albums al
WHERE a.name = 'Sample Artist' AND al.title = 'Greatest Hits';
```

---

## 🔐 STEP 6: PRODUCTION HARDENING

### 6.1 Security Checklist

- [x] **Service role key** is marked Secret in Vercel (not visible to all team members)
- [x] **Admin credentials** changed from defaults
- [x] **Admin session secret** is 32+ random chars (generate with: `openssl rand -hex 32`)
- [x] **CORS_ALLOWED_ORIGINS** set to your domain only
- [ ] **HTTPS enforced** (Vercel does this automatically)
- [ ] **HSTS header** enabled (add to next.config.js)
- [x] **Rate limiting** enabled on admin endpoints
- [ ] **Sentry** error monitoring added (optional)
- [ ] **SSL/TLS** certificate valid (Vercel auto-renews)

### 6.2 Environment Variables Rotation

If any secrets were ever committed to git history:

1. **Supabase:** Settings → API → **Rotate service_role key**
2. **Cloudinary:** Dashboard → API Keys → **Regenerate API Secret**
3. Update all environment in **Vercel dashboard** with new values
4. Redeploy

### 6.3 Database Index Optimization

After loading 10K+ songs, run:

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Reindex if fragmentation high
REINDEX INDEX CONCURRENTLY songs_title_trgm_idx;
```

### 6.4 Enable Vercel Analytics

1. In Vercel dashboard → Analytics
2. Enable **Web Analytics**
3. Add tracking code to `layout.tsx` (if not auto-injected)

---

## 🏥 STEP 7: POST-DEPLOYMENT VALIDATION

### 7.1 Smoke Tests

Run these checks after deployment:

```bash
# 1. Homepage loads
curl -I https://yourdomain.com
# Expected: 200, X-Frame-Options: DENY, Content-Security-Policy present

# 2. API responds
curl https://yourdomain.com/api/songs
# Expected: 200, JSON array (may be empty if no songs seeded)

# 3. Auth endpoints work
curl -X POST https://yourdomain.com/api/auth/logout -c cookies.txt
# Expected: 200 { success: true }

# 4. Admin login (with new credentials)
curl -X POST https://yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_user","password":"your_pass"}' \
  -c admin_cookies.txt
# Expected: 200 { authenticated: true }

# 5. WebSocket server reachable
curl https://yourdomain.com/api/ws
# Expected: 200 { "wsUrl": "https://...", "status": "ok" }

# 6. Static assets served with caching
curl -I https://yourdomain.com/_next/static/chunks/main.js
# Expected: 200, Cache-Control: public, max-age=31536000
```

### 7.2 User Acceptance Testing

**Test as real user:**
1. Visit site → see login page
2. Sign up new account (use email)
3. Log in → redirected to home
4. Browse catalog (empty or seeded)
5. Click song → plays in player
6. Open second tab → login same account
7. Play song in tab 1 → tab 2 syncs playback
8. Create playlist → add songs
9. Log out → can't access protected routes

**Admin tests:**
1. Visit `/admin/music` → redirects to login
2. Login with admin creds → sees upload portal
3. Upload small MP3 (<10MB) → processes successfully
4. Check `recently_played` updates after playing
5. Logout → session cleared

### 7.3 Performance Audits

**Run Lighthouse locally:**
```bash
# Install Chrome DevTools or use Chrome DevTools
# Open DevTools → Lighthouse → Generate report

# Target scores:
Performance: >90
Accessibility: >90
Best Practices: >90
SEO: >90
```

**Google PageSpeed Insights:**
```
https://pagespeed.web.dev/analysis/https://yourdomain.com?form_factor=desktop
```

**If scores low:**
- Optimize images (use WebP, smaller sizes)
- Reduce JavaScript bundle size
- Enable more aggressive caching

---

## 🚨 STEP 8: MONITORING & ALERTING

### 8.1 Vercel Error Monitoring

1. Vercel dashboard → **Monitoring** → **Errors**
2. Enable **Error Tracking**
3. Set up **Alert** for >5 errors/minute

### 8.2 Supabase Logs

1. Supabase Dashboard → **Logs** → **PostgreSQL logs**
2. Filter:
   - `ERROR` level
   - Slow queries (>100ms)
3. Set up **email alerts** for:
   - Connection errors
   - High error rate
   - Storage near limit

### 8.3 WebSocket Server Logs

**If using Railway/Render:**
- Logs stream in dashboard
- Set up email alerts for crash/restart

**If using self-hosted (DO droplet):**
```bash
# Use PM2 logs
pm2 logs spotify-ws --lines 100

# Set up log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

**Recommended: Ship logs to Papertrail or Loggly:**
```bash
# Install Papertrail
npm install -g @papertrail/remote_syslog2

# Configure to forward PM2 logs
remote_syslog2 -f ~/.pm2/logs/*.log -H your-host.papertrail.com:12345
```

---

## 📊 STEP 9: COST MONITORING

### Free Tier Limits

| Service | Free Tier | Your Usage | Cost at Scale |
|---------|-----------|------------|---------------|
| **Vercel** | 100GB bandwidth, 100 build hours/month | 1-10GB, <100h | $20/mo Pro for >100GB |
| **Supabase** | 500MB DB, 1GB storage, 10K auth/month | 100-500MB | $25/mo Pro (8GB DB) |
| **Cloudinary** | 25GB bandwidth, 25GB storage | 5-20GB | ~$0.023/GB excess |
| **Railway** | $5 free credit/month | ~$5-10 for WS | $5/mo always-on |
| **Render** | Free (750 hrs/month = 1 instance) | ~$0 | N/A (free) |

**First year cost estimate (10K users, 100K songs):**
- Vercel Pro: $240/yr (if need team/analytics)
- Supabase Pro: $300/yr (8GB DB, more storage)
- Cloudinary: ~$50-100/yr (excess bandwidth)
- Railway/Render: ~$60/yr (always-on WS)
- **Total: ~$650-900/year**

---

## 🔄 STEP 10: CI/CD PIPELINE (Optional but Recommended)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          scope: ${{ secrets.ORG_ID }}
```

**Setup:**
1. In GitHub → Settings → Secrets → Actions
2. Add:
   - `VERCEL_TOKEN` (from `vercel tokens create`)
   - `ORG_ID` (from Vercel dashboard URL)
   - `PROJECT_ID` (from Vercel dashboard URL)

---

## 🚨 SCALING & MAINTENANCE

### Expected Scaling Timeline

| Users | DB Size | Bandwidth | Action Needed |
|-------|---------|-----------|--------------|
| 0-1K | <100MB | <10GB/mo | Free tier sufficient |
| 1K-10K | 100MB-1GB | 10-100GB/mo | Upgrade Supabase Pro |
| 10K-100K | 1-10GB | 100GB-1TB/mo | Add read replicas, Redis cache |
| 100K+ | 10GB+ | 1TB+/mo | Multi-region, sharding, search service |

### Database Backups

**Supabase auto-backups:**
- Daily backups retained 7 days (free tier)
- Point-in-time recovery (PITR) available on Pro

**Manual backup:**
```bash
supabase db dump --db-url your-db-url > backup.sql
```

### CDN Cache Purging

**Cloudinary:**
```bash
# Invalidate specific assets
cloudinary api delete_all_resources_by_prefix "sample_"

# Or via API
curl -X POST https://api.cloudinary.com/v1_1/cloud_name/delete_resources_by_prefix \
  -d "prefix=sample_"
```

**Vercel:**
```bash
# Purge cache for specific path
vercel inspect yourdomain.com/api/songs --cache
# Or use Vercel dashboard → Deployments → Purge cache
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| 401 on `/api/songs` | Supabase anon key wrong | Check `.env.local` / Vercel env vars |
| Audio won't play | Cloudinary URL broken | Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` correct |
| WS won't connect | WS server down | Check Railway/Render logs |
| Admin upload fails | `SUPABASE_SERVICE_ROLE_KEY` missing | Add to Vercel env vars |
| CORS errors | `CORS_ALLOWED_ORIGINS` not set | Add your domain |
| Images 404 | Wrong Cloudinary cloud name | Verify credentials |
| Build fails | TypeScript errors | Run `npm run typecheck` locally first |

### Debugging

**Enable Supabase logging:**
```sql
-- In SQL Editor, see real-time queries
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

**Check service role key:**
```bash
# In Vercel dashboard, verify SUPABASE_SERVICE_ROLE_KEY is set
# NOT prefixed with NEXT_PUBLIC_
```

**WebSocket connection test:**
```javascript
// Browser console
const ws = new WebSocket('wss://your-ws-server.com');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error:', e);
```

### Getting Help

- **Supabase Support:** [support.supabase.com](https://support.supabase.com)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **GitHub Issues:** Open issue in this repo

---

## 🎉 POST-DEPLOY CELEBRATION

 You've deployed a full-stack Spotify clone!  

**What you now have running:**
- CDN-edge frontend (Vercel)
- Global audio delivery (Cloudinary)
- Production PostgreSQL (Supabase)
- Real-time sync (WebSocket on Railway/Render)
- Admin upload pipeline working
- Mobile-responsive PWA

**Share it:**
```
https://your-app.vercel.app
```

**Next steps:**
1. Add your own music to Cloudinary
2. Seed the database with tracks
3. Invite friends to test
4. Set up custom domain
5. Submit to Product Hunt! 🚀

---

## 📚 APPENDIX: QUICK REFERENCE

### Essential Commands

```bash
# Local development
npm run dev              # Start Next.js + API routes
npx tsx websocket-server.ts  # Start WS server (Terminal 2)

# Database
supabase db push         # Apply migrations
supabase db dump > backup.sql  # Backup

# Deployment
git push origin main     # Trigger Vercel deploy
vercel --prod           # Manual deploy
railway up              # Deploy WS

# Monitoring
vercel logs             # View recent logs
supabase logs view      # DB logs
pm2 logs spotify-ws     # WS logs (if self-hosted)
```

### Environment Variables Quick Copy

```bash
# .env.local (local dev)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_here
SUPABASE_SERVICE_ROLE_KEY=service_key_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password_here
ADMIN_SESSION_SECRET=$(openssl rand -hex 32)
NEXT_PUBLIC_WS_URL=ws://localhost:3001
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Vercel Production (same keys, WS_URL changes)
NEXT_PUBLIC_WS_URL=wss://your-ws-server.up.railway.app
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### Rollback Plan

**If deployment breaks:**
1. Vercel: **Deployments** → Select previous deployment → **Promote to Production**
2. Database: `supabase db restore` from backup
3. WebSocket: `railway rollback` or redeploy previous commit

---

**Document Version:** 2.0  
**Deployments Tested:** 0 (this is a template)  
**Last Updated:** 2026-05-08  
**Maintainer:** Kilo AI Systems

---

## ✅ DEPLOYMENT COMPLETE

**Congratulations!** Your Spotify Clone is now live.  

**Final steps:**
- [ ] Upload some music via admin portal
- [ ] Test playback on desktop + mobile
- [ ] Set up monitoring alerts
- [ ] Share the app with users

**Need help?** Refer to:
- `SECURITY_REPORT.md` for security questions
- `ARCHITECTURE_DIAGRAM.md` for system understanding
- `MUSIC_PIPELINE.md` for upload troubleshooting
