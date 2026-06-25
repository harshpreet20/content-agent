# Content Agent Dashboard — Complete Setup Guide

**Author:** Harshpreet Singh Bhasin
**Company:** Hotbot Studios | hotbotstudios.com
**License:** Proprietary — Hotbot Studios

> Build a team of 6 AI agents that manage Instagram content for any niche, powered by Claude AI, Supabase, Apify scrapers, and deployed on Vercel — all built through Claude Code on the web.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [GitHub Repository Setup](#2-github-repository-setup)
3. [Supabase Setup](#3-supabase-setup)
4. [Apify Setup](#4-apify-setup)
5. [Anthropic API Key](#5-anthropic-api-key)
6. [Vercel Setup](#6-vercel-setup)
7. [Connect MCP Servers in Claude Code](#7-connect-mcp-servers-in-claude-code)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [The Prompt — Give This to Claude](#9-the-prompt--give-this-to-claude)
10. [Post-Build Checklist](#10-post-build-checklist)
11. [Customizing for Your Niche](#11-customizing-for-your-niche)

---

## 1. Prerequisites

You need accounts on:

| Service | Free Tier? | Purpose |
|---------|-----------|---------|
| [GitHub](https://github.com) | Yes | Code repository |
| [Supabase](https://supabase.com) | Yes (2 projects) | PostgreSQL database + auth |
| [Vercel](https://vercel.com) | Yes | Hosting + cron jobs |
| [Apify](https://apify.com) | Yes ($5/mo free) | Instagram + review scraping |
| [Anthropic Console](https://console.anthropic.com) | Pay-as-you-go | Claude AI API |
| [Claude Code](https://claude.ai/code) | Pro/Team/Enterprise plan | The builder |

---

## 2. GitHub Repository Setup

### Step 1: Create the repository

1. Go to [github.com/new](https://github.com/new)
2. Name it something like `content-agent` or `my-content-dashboard`
3. Set it to **Private**
4. Check **"Add a README file"**
5. Add `.gitignore` → select **Node**
6. Click **Create repository**

### Step 2: Note your repo details

```
Owner: your-github-username
Repo:  content-agent
URL:   https://github.com/your-github-username/content-agent
```

You'll connect this to Claude Code via the GitHub MCP server later.

---

## 3. Supabase Setup

### Step 1: Create a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose your organization
4. Set:
   - **Name:** `Content Agent` (or your preference)
   - **Database Password:** Generate a strong one (save it!)
   - **Region:** Pick the closest to your audience
5. Click **Create new project** — wait ~2 minutes

### Step 2: Get your keys

Once the project is ready:

1. Go to **Settings → API**
2. Copy these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Create the database tables

Go to **SQL Editor** in Supabase and run this migration:

```sql
-- Scraped Instagram data
CREATE TABLE scrapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  my_handle TEXT NOT NULL,
  competitors TEXT[] DEFAULT '{}',
  data JSONB NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track async Apify scrape runs
CREATE TABLE scrape_runs (
  id TEXT PRIMARY KEY,
  run_id TEXT,
  dataset_id TEXT,
  status TEXT DEFAULT 'IDLE',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  handles TEXT[] DEFAULT '{}'
);

-- Agent output reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback on agent outputs (+1 / -1)
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accumulated learnings from feedback (micro-intel)
CREATE TABLE learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  learning TEXT NOT NULL,
  source TEXT DEFAULT 'retrain',
  score FLOAT DEFAULT 1.0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trustpilot and Google reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('trustpilot', 'google')),
  reviewer_name TEXT DEFAULT 'Anonymous',
  rating INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  review_text TEXT DEFAULT '',
  review_date TEXT DEFAULT '',
  data JSONB DEFAULT '{}',
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brain context cache and analytics
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  period TEXT DEFAULT 'snapshot',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- User management (approval-based access)
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsor activation scrapes
CREATE TABLE sponsor_scrapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_handle TEXT NOT NULL,
  data JSONB NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_scrapes_scraped_at ON scrapes (scraped_at DESC);
CREATE INDEX idx_reports_agent_name ON reports (agent_name);
CREATE INDEX idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX idx_feedback_agent_name ON feedback (agent_name);
CREATE INDEX idx_learnings_agent_active ON learnings (agent_name, active);
CREATE INDEX idx_reviews_source ON reviews (source);
CREATE INDEX idx_analytics_metric_type ON analytics (metric_type, fetched_at DESC);
CREATE INDEX idx_app_users_email ON app_users (email);
CREATE INDEX idx_app_users_auth_id ON app_users (auth_user_id);
```

### Step 4: Enable Auth

1. Go to **Authentication → Settings**
2. Under **Email Auth**, ensure **Enable Email Signup** is ON
3. (Optional) Disable **Confirm email** for faster testing

### Step 5: Create the first admin user

After the app is built and deployed, sign up via the login page. Then in Supabase SQL Editor:

```sql
UPDATE app_users SET role = 'admin', status = 'approved' WHERE email = 'your@email.com';
```

---

## 4. Apify Setup

### Step 1: Create account

1. Go to [apify.com](https://apify.com) and sign up
2. You get $5/month free compute — enough for weekly scrapes

### Step 2: Get your API token

1. Go to **Settings → Integrations** (or [console.apify.com/account/integrations](https://console.apify.com/account/integrations))
2. Copy your **Personal API Token**

```env
APIFY_API_TOKEN=apify_api_XXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Verify the actors exist

The app uses these Apify actors (no setup needed — they're public):

| Actor | Purpose | Actor ID |
|-------|---------|----------|
| Instagram Scraper | Scrape IG profiles & posts | `apify/instagram-scraper` |
| Trustpilot Scraper | Scrape Trustpilot reviews | `apify/trustpilot-scraper` |
| Google Maps Reviews | Scrape Google Business reviews | `compass/google-maps-reviews-scraper` |

You can test them manually in the Apify Console to verify they work with your URLs.

### Step 4: Note your business URLs

For review scraping, you'll need:

```env
# Your Trustpilot business page (if you have one)
# Format: https://www.trustpilot.com/review/yourdomain.com
TRUSTPILOT_URL=https://www.trustpilot.com/review/yourbusiness.com

# Your Google Maps place URL (open Google Maps → search your business → copy URL)
# Or leave blank and set GOOGLE_BUSINESS_NAME instead
GOOGLE_MAPS_URL=https://www.google.com/maps/place/Your+Business/...
GOOGLE_BUSINESS_NAME=Your Business Name City
```

---

## 5. Anthropic API Key

### Step 1: Get your API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **API Keys** in the sidebar
3. Click **Create Key**
4. Name it `content-agent`
5. Copy the key immediately (you won't see it again)

```env
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 2: Add credits

1. Go to **Settings → Billing**
2. Add a payment method and load credits ($5-10 is plenty to start)
3. The app uses `claude-haiku-4-5-20251001` (~$0.001 per agent run)

**Estimated costs:**
- Running all 6 agents once: ~$0.01
- Weekly cron + brain generation: ~$0.005
- Monthly total (moderate use): ~$2-5

---

## 6. Vercel Setup

### Step 1: Connect your GitHub repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `content-agent` repo
4. Framework: **Next.js** (auto-detected)
5. **Don't deploy yet** — add environment variables first

### Step 2: Add environment variables

In the Vercel project settings → **Environment Variables**, add all of these:

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
ANTHROPIC_API_KEY               = sk-ant-api03-...
APIFY_API_TOKEN                 = apify_api_...
INSTAGRAM_HANDLE                = your_instagram_handle
COMPETITOR_HANDLES              = competitor1,competitor2,competitor3
CRON_SECRET                     = any-random-secret-string-here
NEXT_PUBLIC_APP_URL             = https://your-app.vercel.app
GOOGLE_BUSINESS_NAME            = Your Business Name
```

### Step 3: Generate a CRON_SECRET

```bash
# Run this in your terminal to generate a random secret:
openssl rand -hex 32
```

Use the output as your `CRON_SECRET`.

### Step 4: Note your deployment URL

After the first deploy, your app URL will be something like:
```
https://content-agent-xxx.vercel.app
```

Set this as `NEXT_PUBLIC_APP_URL` in Vercel env vars (needed for Apify webhooks).

---

## 7. Connect MCP Servers in Claude Code

This is the key step — connecting all services as MCP servers so Claude can interact with them directly while building.

### Open Claude Code on the Web

1. Go to [claude.ai/code](https://claude.ai/code)
2. Create a new session
3. Connect your GitHub repository (`content-agent`)

### Connect Supabase MCP

When creating the Claude Code environment (or in session settings):

1. Click **"Add MCP Server"** or find it in environment settings
2. Select **Supabase** from the available integrations
3. Authenticate with your Supabase account
4. Select your **Content Agent** project

This gives Claude direct access to:
- `mcp__Supabase__execute_sql` — Run queries
- `mcp__Supabase__apply_migration` — Create/alter tables
- `mcp__Supabase__list_tables` — View schema
- `mcp__Supabase__get_logs` — Debug issues
- `mcp__Supabase__get_project_url` — Get connection details

### Connect Vercel MCP

1. Click **"Add MCP Server"**
2. Select **Vercel**
3. Authenticate with your Vercel account
4. Select your team/project

This gives Claude access to:
- `mcp__Vercel__deploy_to_vercel` — Trigger deployments
- `mcp__Vercel__get_deployment_build_logs` — Debug build failures
- `mcp__Vercel__get_runtime_logs` — Debug runtime errors
- `mcp__Vercel__list_deployments` — Check deployment status
- `mcp__Vercel__get_project` — Read project config

### Connect GitHub MCP

1. Click **"Add MCP Server"**
2. Select **GitHub**
3. Authenticate and grant access to your `content-agent` repo

This gives Claude access to:
- `mcp__github__create_pull_request` — Create PRs
- `mcp__github__push_files` — Push code changes
- `mcp__github__list_commits` — View history
- `mcp__github__create_or_update_file` — Edit files directly

### Set Environment Variables in Claude Code

In your Claude Code session environment configuration, add these env vars so the app can run locally during development:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-api03-...
APIFY_API_TOKEN=apify_api_...
INSTAGRAM_HANDLE=your_handle
COMPETITOR_HANDLES=comp1,comp2,comp3
CRON_SECRET=your-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 8. Environment Variables Reference

| Variable | Required | Where to Get It | Description |
|----------|----------|-----------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → Settings → API | Public anon key (safe for client) |
| `ANTHROPIC_API_KEY` | Yes | console.anthropic.com → API Keys | Claude AI API key |
| `APIFY_API_TOKEN` | Yes | apify.com → Settings → Integrations | Apify scraper authentication |
| `INSTAGRAM_HANDLE` | Yes | Your IG handle | Your Instagram username (no @) |
| `COMPETITOR_HANDLES` | Yes | Comma-separated | Competitor IG handles to track |
| `CRON_SECRET` | Yes | Self-generated (`openssl rand -hex 32`) | Auth for cron endpoint |
| `NEXT_PUBLIC_APP_URL` | Yes | Your Vercel deployment URL | Used for Apify webhook callbacks |
| `GOOGLE_MAPS_URL` | No | Google Maps → Your business → Copy URL | For Google review scraping |
| `GOOGLE_BUSINESS_NAME` | No | Your business name | Fallback search query for Google reviews |
| `TELEGRAM_BOT_TOKEN` | No | @BotFather on Telegram | For daily Telegram reports |
| `TELEGRAM_CHAT_ID` | No | Telegram API | Chat to send reports to |

---

## 9. The Prompt — Give This to Claude

Copy everything below and paste it into your Claude Code session. This is the master prompt that builds the entire app.

---

### CLAUDE.md (Create this first)

```markdown
# Content Agent Dashboard

A team of 6 AI agents that manage content for @YOUR_HANDLE (YOUR_NICHE niche).

## Agents
1. **Ideator** — Scouts trending ideas and classifies each as AI Reel / Real / UGC
2. **Hook & Script** — Writes hooks and scripts for reels/posts
3. **AI Reel Prompt** — Writes detailed AI video production prompts (camera, lighting, VFX, CGI, tool-specific)
4. **Planner** — Plans a daily content calendar
5. **Analyst** — Analyses Instagram stats and performance
6. **DM Manager** — Handles DM templates and engagement

## Competitors
- @competitor1
- @competitor2
- @competitor3
(add your actual competitors)

## Architecture
\```
Raw Data (Apify scrapes, Trustpilot reviews, past reports, learnings)
    |
Brain Layer (src/lib/brain.ts -- synthesizes strategic context brief, cached 1hr)
    |
Agent Layer (6 agents -- each receives the brain context + learnings)
    |
Output (HTML reports with context-informed decisions)
\```

## Stack
- **Frontend:** Next.js dashboard (deployed on Vercel)
- **Data:** Apify Instagram scraper -> Supabase (scrapes)
- **Reviews:** Apify Trustpilot + Google scraper -> Supabase (reviews)
- **Intelligence:** Brain context layer + micro-intel feedback loop
- **Scraping:** Async Apify actor runs (weekly cron + manual refresh)
- **Secrets:** All tokens live in `.env` (gitignored)

## Commands
\```bash
npm install          # install dependencies
npm run dev          # start dashboard locally
npm run scrape       # pull fresh Instagram data
\```
```

---

### The Build Prompt

```
Build a Content Agent Dashboard — a Next.js app with 6 AI agents that manage Instagram content for @YOUR_HANDLE in the YOUR_NICHE niche.

## What to Build

### Core Architecture
1. **Next.js 14 app** with App Router, Tailwind CSS, TypeScript
2. **Supabase** for database (PostgreSQL) and authentication
3. **Apify** for Instagram scraping (async with webhooks)
4. **Anthropic Claude** (claude-haiku-4-5-20251001) for AI agents
5. **Vercel** for deployment with weekly cron job

### Database
Use the Supabase MCP to create these tables (run the migration via mcp__Supabase__apply_migration):
- `scrapes` — Stores scraped Instagram data (JSONB)
- `scrape_runs` — Tracks async Apify run status
- `reports` — Agent output history
- `feedback` — User ratings on outputs (+1/-1)
- `learnings` — Extracted patterns from rated outputs
- `reviews` — Trustpilot + Google reviews
- `analytics` — Brain context cache
- `app_users` — User management with approval flow
- `sponsor_scrapes` — Sponsor activation data

### Pages (7 total)
1. **Dashboard** (`/`) — Stats bar, competitor grid, 6 agent cards
2. **Login** (`/login`) — Email/password auth with pending/approved/rejected states
3. **Sponsor** (`/sponsor`) — Input sponsor handle, scrape their data, run 6 sponsor-specific agents
4. **Reports** (`/reports`) — Full history, filter by agent, expand/collapse, download HTML
5. **Analytics** (`/analytics`) — Charts: top posts bar chart, content type pie, competitor comparison
6. **Reviews** (`/reviews`) — Trustpilot + Google reviews with ratings distribution
7. **Admin** (`/admin`) — Approve/reject users, promote to admin

### The 6 AI Agents
Each agent receives a brain context (strategic brief synthesized from all data) + accumulated learnings from past feedback.

1. **Ideator** — Generate 5 trending content ideas. Classify each as AI Reel, Real Reel, or UGC. Include estimated engagement potential. Format: HTML cards.

2. **Hook & Script** — Write 3 complete reel scripts. Each needs: a punchy first-line hook (pattern interrupt), full script with timestamps, on-screen text suggestions, and a CTA. Format: HTML with sections.

3. **AI Reel Prompt** — Write 4-5 detailed AI video generation prompts. Include: camera angle, lighting setup, subject action, environment details, color grading, VFX/CGI elements, and which AI tool to use (Runway, Kling, Sora, Pika). Support "social" (quick) and "cinematic" (production-quality) presets. Format: HTML prompt cards.

4. **Planner** — Create a 7-day content calendar. Each day: content type, topic, best posting time, format (reel/carousel/story), caption idea, and hashtag set. Format: HTML calendar grid.

5. **Analyst** — Analyze performance vs competitors. Cover: engagement rate trends, best-performing content types, posting frequency analysis, growth opportunities, and specific competitor tactics to adopt. Format: HTML report with data callouts.

6. **DM Manager** — Write 5 DM templates: welcome new follower, re-engage inactive, collaboration outreach, community event promotion, and custom (based on recent content themes). Format: HTML message cards.

### Brain Layer
Create a "brain" that synthesizes ALL available data into a strategic brief:
- My account stats vs competitor stats
- Review sentiment (Trustpilot + Google)
- Recent agent report insights
- Accumulated learnings from feedback
- Ask Claude to produce a ~600 word strategic brief covering: current position, competitive landscape, content patterns, audience sentiment, strategic priorities, opportunities

Cache the brain context in the `analytics` table. Auto-regenerate after each successful scrape.

### Micro-Intel Feedback Loop
- Each agent output gets thumbs up/down buttons
- Store feedback in `feedback` table
- After 5 ratings for any agent, auto-trigger "retrain"
- Retrain: feed Claude the rated outputs → extract 3-5 one-sentence rules → save to `learnings` table
- Inject top 10 learnings into each agent's system prompt

### Instagram Scraping Flow
- Use Apify `apify/instagram-scraper` actor
- Scrape main handle + all competitor handles (30 posts each)
- Start async run with webhook callback to `/api/scrape-status`
- On completion: parse results, group by handle, save to `scrapes` table
- Also trigger review scrapes (Trustpilot + Google) alongside

### Authentication & Authorization
- Supabase Auth (email/password)
- New signups start as "pending" in `app_users`
- Admin must approve before access is granted
- Role-based: "user" sees dashboard, "admin" also sees admin panel

### Cron Job
- `vercel.json` with cron: every Monday 6 AM UTC
- Endpoint: `GET /api/cron/scrape` (protected by `CRON_SECRET` bearer token)
- Triggers Instagram scrape + review scrapes + brain regeneration

### UI Design
- Clean, minimal, Instagram-like aesthetic
- White backgrounds, subtle borders, rounded corners (rounded-xl, rounded-2xl)
- Gradient text for branding (amber → pink → violet)
- Status lights: green (ok), amber (warning), red (error)
- Mobile-responsive
- No external UI libraries — Tailwind only
- Use Recharts for analytics charts

### Key Technical Details
- All agent outputs must be HTML (no markdown, no code fences)
- Use `claude-haiku-4-5-20251001` model for all AI calls with 4096 max tokens
- Sanitize HTML before rendering with dangerouslySetInnerHTML
- Agent API routes return: `{ agent, result (HTML), reportId, learningsUsed }`
- Data loading: try local JSON first, fall back to Supabase
- Apify webhooks fire to your Vercel URL when scrapes complete

### Sponsor Activation Feature
- User inputs a sponsor's Instagram handle
- App scrapes their profile (30 posts)
- 6 modified agents run with sponsor context injected
- Ideas become co-branded, scripts mention the sponsor, production prompts include sponsor products

### Environment Variables Needed
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, APIFY_API_TOKEN, INSTAGRAM_HANDLE, COMPETITOR_HANDLES, CRON_SECRET, NEXT_PUBLIC_APP_URL, GOOGLE_MAPS_URL (optional), GOOGLE_BUSINESS_NAME (optional)

## Implementation Order
1. Initialize Next.js project with TypeScript + Tailwind
2. Set up Supabase tables (use Supabase MCP)
3. Create lib/ utilities: supabase clients, claude wrapper, data loader
4. Build the brain layer
5. Build the 6 agent API routes
6. Build the dashboard page with agent cards
7. Add auth flow (login page + AuthProvider)
8. Build remaining pages (reports, analytics, reviews, admin, sponsor)
9. Add scraping infrastructure (cron, webhooks, status polling)
10. Add feedback + micro-intel system
11. Add sponsor activation feature
12. Configure vercel.json for cron
13. Deploy to Vercel (use Vercel MCP)

Start building now. Use the Supabase MCP to create tables, and run `npm run dev` to test as you go. Commit frequently.
```

---

## 10. Post-Build Checklist

After Claude finishes building:

### Verify locally
- [ ] `npm run dev` starts without errors
- [ ] Login page loads at `/login`
- [ ] Sign up works (check Supabase Auth → Users)
- [ ] Approve your user in SQL: `UPDATE app_users SET role='admin', status='approved' WHERE email='you@email.com'`
- [ ] Dashboard loads with empty state
- [ ] Each agent runs and returns HTML output
- [ ] Health endpoint (`/api/health`) shows all green

### First data load
- [ ] Click "Refresh Data" or trigger scrape manually
- [ ] Check Supabase `scrape_runs` table for status
- [ ] Wait ~5-10 min for Apify to complete
- [ ] Dashboard should populate with stats + competitor data

### Deploy
- [ ] Push to GitHub
- [ ] Vercel auto-deploys from your repo
- [ ] Check build logs in Vercel
- [ ] Set `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
- [ ] Test the live deployment

### Verify cron
- [ ] Check `vercel.json` has the cron schedule
- [ ] Test manually: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/scrape`

---

## 11. Customizing for Your Niche

This template works for ANY Instagram content niche. Just change:

| What to Change | Where |
|----------------|-------|
| Your handle | `INSTAGRAM_HANDLE` env var |
| Competitors | `COMPETITOR_HANDLES` env var |
| Niche/brand name | CLAUDE.md + agent system prompts |
| Logo | `public/` folder — replace `rcc-crest.webp` |
| App name | Nav component + login page title |
| Review URLs | `GOOGLE_MAPS_URL`, `GOOGLE_BUSINESS_NAME`, Trustpilot URL in `src/lib/reviews.ts` |
| Cron schedule | `vercel.json` — change the cron expression |
| Agent personas | System prompts in each `src/app/api/agents/*/route.ts` |
| Color theme | Tailwind classes throughout components |

### Example niches this works for:
- Fitness coaching accounts
- Food/restaurant pages
- Travel influencers
- Real estate brands
- E-commerce product pages
- Personal brands
- Local business communities
- Sports clubs / gyms

---

## Quick Reference: MCP Server Capabilities

### Supabase MCP
```
mcp__Supabase__execute_sql        — Run any SQL query
mcp__Supabase__apply_migration    — Create/alter tables safely
mcp__Supabase__list_tables        — View current schema
mcp__Supabase__list_projects      — Find project IDs
mcp__Supabase__get_project_url    — Get connection URLs
mcp__Supabase__get_logs           — Debug server-side issues
mcp__Supabase__get_advisors       — Performance recommendations
```

### Vercel MCP
```
mcp__Vercel__deploy_to_vercel          — Trigger deployment
mcp__Vercel__list_deployments          — Check deploy status
mcp__Vercel__get_deployment_build_logs — Debug build failures
mcp__Vercel__get_runtime_logs          — Debug runtime errors
mcp__Vercel__get_project               — Read project settings
mcp__Vercel__list_projects             — Find project IDs
```

### GitHub MCP
```
mcp__github__create_pull_request        — Create PRs
mcp__github__push_files                 — Push code
mcp__github__list_commits               — View history
mcp__github__create_or_update_file      — Edit files
mcp__github__create_branch              — Branch management
mcp__github__list_issues                — Issue tracking
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing ANTHROPIC_API_KEY" | Add the key to Vercel env vars AND redeploy |
| Brain light stays orange | Click "Refresh" in status bar, or POST to `/api/brain` |
| Scrape returns 0 posts | Check Apify token is valid; Instagram may rate-limit |
| Reviews not collecting | Webhook URL must match `NEXT_PUBLIC_APP_URL`; check Apify run logs |
| Auth not working | Ensure Supabase Auth is enabled; check `app_users` table |
| Cron not firing | Verify `vercel.json` exists with correct format; check Vercel dashboard → Cron Jobs |
| Build fails on Vercel | Check `get_deployment_build_logs` via Vercel MCP |
| Agent returns empty | Check Claude API has credits; check `ANTHROPIC_API_KEY` |

---

---

**Built by Harshpreet Singh Bhasin | Hotbot Studios**
hotbotstudios.com | harshpreet@hotbotstudios.com

*Powered by the Hotbot Agent Toolkit. Total build time: ~2-4 hours with Claude doing the heavy lifting.*
