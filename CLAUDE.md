# Content Agent Dashboard

A team of 5 AI agents that manage content for @racquetsclubcommunity (badminton/racquet sports niche).

## Agents
1. **Ideator** — Scouts trending ideas from competitors and niche
2. **Hook & Script** — Writes hooks and scripts for reels/posts
3. **Planner** — Plans a daily content calendar
4. **Analyst** — Analyses Instagram stats and performance
5. **DM Manager** — Handles DM templates and engagement

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
Agent Layer (5 agents -- each receives the brain context + learnings)
    |
Output (HTML reports with context-informed decisions)
```

## Stack
- **Frontend:** Next.js dashboard (deployed on Vercel)
- **Data:** Apify Instagram scraper -> Supabase (content_agent_scrapes)
- **Reviews:** Apify Trustpilot scraper -> Supabase (content_agent_reviews)
- **Intelligence:** Brain context layer + micro-intel feedback loop
- **Scraping:** Async Apify actor runs (twice daily cron + manual refresh)
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
