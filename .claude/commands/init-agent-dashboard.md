# Init Agent Dashboard

> **By Harshpreet Singh Bhasin | Hotbot Studios**
> Part of the Hotbot Agent Toolkit

Scaffold a complete AI-powered content agent dashboard from scratch. This creates the full project structure, database schema, all utilities, and deploys.

**Usage:** `/init-agent-dashboard [niche] for @[handle] vs @comp1,@comp2,@comp3`

Parse the arguments: `$ARGUMENTS`

If no arguments provided, ask for:
1. The niche/industry (e.g., "badminton", "fitness coaching", "coffee shop")
2. The Instagram handle to manage
3. 3-8 competitor handles to track

---

## Step 1: Initialize the Project

```bash
npx create-next-app@14 . --typescript --tailwind --app --src-dir --no-import-alias
npm install @supabase/supabase-js @anthropic-ai/sdk apify-client recharts
```

Set up `tsconfig.json` path alias: `@/*` → `src/*`

## Step 2: Create CLAUDE.md

Write a CLAUDE.md at the project root with:
- Project name, niche, handle, competitors
- Architecture diagram (Raw Data → Brain Layer → Agent Layer → Output)
- Stack summary
- API endpoint list
- npm commands

## Step 3: Create Supabase Tables

Use `mcp__Supabase__apply_migration` to create all tables:

```sql
-- Core tables for any agent dashboard
CREATE TABLE scrapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  my_handle TEXT NOT NULL,
  competitors TEXT[] DEFAULT '{}',
  data JSONB NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scrape_runs (
  id TEXT PRIMARY KEY,
  run_id TEXT,
  dataset_id TEXT,
  status TEXT DEFAULT 'IDLE',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  handles TEXT[] DEFAULT '{}'
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  reviewer_name TEXT DEFAULT 'Anonymous',
  rating INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  review_text TEXT DEFAULT '',
  review_date TEXT DEFAULT '',
  data JSONB DEFAULT '{}',
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  period TEXT DEFAULT 'snapshot',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,
  email TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scrapes_scraped_at ON scrapes (scraped_at DESC);
CREATE INDEX idx_reports_agent_name ON reports (agent_name);
CREATE INDEX idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX idx_feedback_agent_name ON feedback (agent_name);
CREATE INDEX idx_learnings_agent_active ON learnings (agent_name, active);
CREATE INDEX idx_analytics_metric_type ON analytics (metric_type, fetched_at DESC);
CREATE INDEX idx_app_users_email ON app_users (email);
```

## Step 4: Create Library Layer

Create these files in `src/lib/`:

### `supabase.ts` — Client-side Supabase
```typescript
import { createBrowserClient } from "@supabase/ssr";
// OR simpler: import { createClient } from "@supabase/supabase-js";
// Use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### `supabase-server.ts` — Server-side Supabase + saveReport()
```typescript
import { createClient } from "@supabase/supabase-js";
// createServerClient() factory
// saveReport(agentName, result) → saves to reports table, returns reportId
```

### `claude.ts` — Anthropic SDK wrapper
```typescript
import Anthropic from "@anthropic-ai/sdk";
// getClient() — singleton
// askClaude(systemPrompt, userMessage) → string response
// Model: claude-haiku-4-5-20251001, maxTokens: 4096
```

### `data.ts` — Data loading with fallback
```typescript
// loadData() — read from local JSON file (dev mode)
// loadDataWithFallback() — try local, then Supabase
// getMyStats(data) — extract stats for main handle
// getCompetitorStats(data) — extract stats for all competitors
```

### `brain.ts` — Strategic brain context layer
```typescript
// buildBrainContext(force?) — synthesize strategic brief from all data
// injectBrainContext(baseSystem, brain) — merge brain into agent system prompt
// Reads: scrape data, reviews, recent reports, learnings
// Caches in analytics table (1hr cache unless forced)
// Tracks generating status for UI indicator
```

### `micro-intel.ts` — Feedback learning loop
```typescript
// getLearnings(agentName) → top 10 active learnings
// buildEnhancedPrompt(baseSystem, agentName) → system prompt + learnings
// saveFeedback(reportId, agentName, rating) → save + auto-retrain at 5
// retrain(agentName) → extract patterns from rated outputs → new learnings
```

## Step 5: Create the 6 Default Agents

Create API routes at `src/app/api/agents/[name]/route.ts` for each:

Each agent route follows the same pattern:
1. Load data via `loadDataWithFallback()`
2. Get brain context via `buildBrainContext()`
3. Build enhanced prompt via `buildEnhancedPrompt(SYSTEM_PROMPT, agentName)`
4. Inject brain context via `injectBrainContext(enhancedPrompt, brain)`
5. Call `askClaude(finalPrompt, dataPayload)`
6. Save report via `saveReport(agentName, result)`
7. Return `{ agent, result, reportId, learningsUsed }`

**Agents to create:**
1. `ideator` — 5 content ideas classified as AI Reel / Real / UGC
2. `hooks` — 3 reel scripts with attention-grabbing hooks
3. `reel-prompt` — AI video production prompts (social/cinematic presets)
4. `planner` — 7-day content calendar
5. `analyst` — Performance analysis vs competitors
6. `dm-manager` — 5 DM engagement templates

**CRITICAL:** All agent outputs must be HTML only. No markdown, no code fences. The system prompts must explicitly say: "Output ONLY valid HTML. No markdown. No code fences. No JSON."

Customize each agent's system prompt for the user's specific niche.

## Step 6: Build the Frontend

### Components:
- `Nav.tsx` — Top nav with logo, page links, user avatar
- `AuthProvider.tsx` — Supabase auth context + role/status checking
- `AgentCard.tsx` — Run button, HTML output display, feedback thumbs, timer
- `StatusBar.tsx` — 5 system health lights (database, AI, scraper, data, brain)
- `StatsBar.tsx` — Key metrics cards (posts, likes, comments, views, engagement)
- `CompetitorBar.tsx` — Competitor grid with stats

### Pages:
- `/` — Dashboard with StatsBar + CompetitorBar + 6 AgentCards
- `/login` — Email/password auth with pending/approved/rejected states
- `/reports` — Report history with filter, expand, download
- `/analytics` — Recharts: top posts bar, content type pie, competitor comparison
- `/reviews` — Trustpilot + Google reviews with rating distribution
- `/admin` — User approval management

### Design tokens:
- Background: `#FAFAFA`
- Cards: white, `border-gray-100`, `rounded-2xl`, `shadow-[0_1px_3px_rgba(0,0,0,0.04)]`
- Brand gradient: `from-amber-500 via-pink-500 to-violet-600`
- Status: emerald (ok), amber (warn), red (error)

## Step 7: Scraping Infrastructure

- `src/app/api/cron/scrape/route.ts` — Start async Apify run with webhook
- `src/app/api/scrape-status/route.ts` — Poll status + collect results
- `src/lib/reviews.ts` — Trustpilot + Google review scraping
- `src/app/api/review-webhook/route.ts` — Collect async review results
- `vercel.json` — Weekly cron schedule

## Step 8: Health & Monitoring

Create `src/app/api/health/route.ts` checking:
1. Database connectivity + latency
2. Anthropic API key present
3. Apify token valid (ping user endpoint)
4. Data freshness (last scrape age)
5. Brain context status (generated after last scrape = green, generating = orange, failed = red)

## Step 9: Deploy

1. Create `vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/scrape", "schedule": "0 6 * * 1" }] }
```
2. Commit and push all code
3. Use Vercel MCP to verify deployment
4. Set `NEXT_PUBLIC_APP_URL` to the live URL

## Step 10: Verify

Run the dev server and test:
- Login flow works
- All 6 agents produce HTML output
- Health endpoint returns all green
- Data loads from Supabase
- Feedback buttons save ratings

Done! The full agent dashboard is ready.
