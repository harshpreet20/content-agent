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
