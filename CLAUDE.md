# Content Agent Dashboard

A team of 6 AI agents that manage content for @racquetsclubcommunity (badminton/racquet sports niche).

## Agents
1. **Ideator** — Scouts trending ideas and classifies each as AI Reel / Real / UGC
2. **Hook & Script** — Writes hooks and scripts for reels/posts
3. **AI Reel Prompt** — Writes detailed AI video production prompts (camera, lighting, VFX, CGI, tool-specific)
4. **Planner** — Plans a daily content calendar
5. **Analyst** — Analyses Instagram stats and performance
6. **DM Manager** — Handles DM templates and engagement

## Competitors
- @wtfpuneet
- @badmintonclubx
- @shuttlify
- @delhibadmintonclub
- @badmintonclubofindia
- @eastdelhisportsclub
- @kanikaaaa108
- @vibewithkanika_

## Architecture
```
Raw Data (Apify scrapes, Trustpilot reviews, past reports, learnings)
    |
Brain Layer (src/lib/brain.ts -- synthesizes strategic context brief, cached 1hr)
    |
Agent Layer (6 agents -- each receives the brain context + learnings)
    |
Output (HTML reports with context-informed decisions)
```

## Stack
- **Frontend:** Next.js dashboard (deployed on Vercel)
- **Data:** Apify Instagram scraper -> Supabase (scrapes)
- **Reviews:** Apify Trustpilot + Google scraper -> Supabase (reviews)
- **Intelligence:** Brain context layer + micro-intel feedback loop
- **Scraping:** Async Apify actor runs (weekly cron + manual refresh)
- **Notifications:** Telegram bot for daily reports
- **Secrets:** All tokens live in `.env` (gitignored)

## API Endpoints
- `/api/health` — System status (database, AI, scraper, data freshness, brain)
- `/api/brain` — GET status / POST to generate brain context
- `/api/scrape-status` — Poll async scrape progress
- `/api/cron/scrape` — Trigger scrape (GET=cron w/ auth, POST=manual)
- `/api/data` — Dashboard data with all competitors

## Commands
```bash
npm install          # install dependencies
npm run dev          # start dashboard locally
npm run scrape       # pull fresh Instagram data
npm run report       # send Telegram report
```

## RCC Commerce Platform (separate scaffold in this repo)

This repo also hosts an early scaffold of a much larger, unrelated project:
a full commerce platform (website + storefront + admin portal, backed by 14
microservices and an event bus) per `docs/PRD.md`. It lives entirely under
`apps/`, `services/`, and `packages/` (npm workspaces declared in the root
`package.json`) and does not touch anything above.

- Everything under `src/`, `dashboard/`, `scripts/` above is the Content
  Agent Dashboard described in this file — unaffected by the commerce scaffold.
- The commerce services are stubs (every route returns `501`); see
  `ARCHITECTURE.md` for what's real vs. scaffold and how to run each piece.
- The store admin pages already in `src/app/{products,orders,customers,categories,discounts,settings}`
  (Supabase-backed) currently serve as the interim Admin Portal — they were
  deliberately left untouched rather than migrated into the new services.
- Read `ARCHITECTURE.md` before adding to either side of this repo so new
  work lands in the right place.
