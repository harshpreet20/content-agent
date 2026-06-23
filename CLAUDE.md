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

## Stack
- **Frontend:** Next.js dashboard (deployed on Vercel)
- **Data:** Apify Instagram scraper → dashboard/data.json
- **Notifications:** Telegram bot for daily reports
- **Secrets:** All tokens live in `.env` (gitignored)

## Commands
```bash
npm install          # install dependencies
npm run dev          # start dashboard locally
npm run scrape       # pull fresh Instagram data
npm run report       # send Telegram report
```
