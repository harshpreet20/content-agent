# STATUS — Build Progress Dashboard

Show the current state of the build operation. Reads the task board, checks file system, and reports what's done vs remaining.

**Usage:** `/status`

Arguments (ignored): `$ARGUMENTS`

---

## What You Do

You are the **COO** doing a stand-up check. Survey the project state and report concisely.

## Checks to Run

### 1. File System Audit
Count what exists:
```
src/lib/*.ts          → Utility files
src/app/api/**/*.ts   → API routes
src/components/*.tsx   → Components
src/app/*/page.tsx    → Pages
```

### 2. Build Health
```bash
npx tsc --noEmit 2>&1 | tail -5
```

### 3. Task Board
Use TaskList to show all tasks and their status (pending/in_progress/completed).

### 4. Git Status
```bash
git status --short
git log --oneline -5
```

## Output Format

```
BUILD STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFRASTRUCTURE
  [✓/✗] Supabase tables ([N] tables)
  [✓/✗] Env vars configured
  [✓/✗] Package deps installed

LIBRARIES ([N]/[total])
  [✓/✗] supabase.ts
  [✓/✗] claude.ts
  [✓/✗] data.ts
  [✓/✗] brain.ts
  [✓/✗] micro-intel.ts
  [✓/✗] reviews.ts

AGENTS ([N]/[total])
  [✓/✗] ideator
  [✓/✗] hooks
  [✓/✗] reel-prompt
  [✓/✗] planner
  [✓/✗] analyst
  [✓/✗] dm-manager

PAGES ([N]/[total])
  [✓/✗] Dashboard
  [✓/✗] Login
  [✓/✗] Reports
  [✓/✗] Analytics
  [✓/✗] Reviews
  [✓/✗] Admin

OPS
  [✓/✗] Health endpoint
  [✓/✗] Cron config
  [✓/✗] Auth flow

BUILD HEALTH: [CLEAN / N errors]
GIT: [N uncommitted files, N commits ahead]

PROGRESS: [N]% complete
NEXT: [what to do next]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Adapt the checklist to match the actual BRF if one was produced earlier in the conversation. If no BRF exists, use the defaults above.
