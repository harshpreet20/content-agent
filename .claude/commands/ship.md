# SHIP — Final Deploy Sequence

> **By Harshpreet Singh Bhasin | Hotbot Studios**
> Part of the Hotbot Agent Toolkit

Run the final deployment pipeline: type-check, build, test, commit, push, verify deployment.

**Usage:** `/ship [optional commit message]`

Input: `$ARGUMENTS`

---

## You are the VP of Operations running the release train.

Execute this checklist in order. Stop at the first failure and fix it before continuing.

### Pre-flight Checks

```bash
# 1. Type check
npx tsc --noEmit

# 2. Build check
npm run build

# 3. Health check (if dev server running)
curl -s http://localhost:3000/api/health 2>/dev/null | head -5
```

### Git Operations

```bash
# 4. Stage all changes
git add -A

# 5. Review what's being committed
git status
git diff --cached --stat

# 6. Commit with descriptive message
git commit -m "[message from args or auto-generated]"

# 7. Push to remote
git push -u origin [current-branch]
```

### Post-Deploy Verification

Use Vercel MCP tools:
1. `mcp__Vercel__list_deployments` — Check deployment started
2. Wait for deployment to complete (check status)
3. `mcp__Vercel__get_deployment_build_logs` — If failed, read logs and fix
4. `mcp__Vercel__web_fetch_vercel_url` — Hit `/api/health` on production

### Report

```
SHIP REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build:      [PASS/FAIL]
Tests:      [PASS/FAIL/NONE]
Commit:     [hash] [message]
Push:       [branch] → [remote]
Deploy:     [status] [url]
Health:     [all green / issues]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If all pass: "Shipped. Live at [URL]."
If any fail: "Blocked at [step]. Fix: [what to do]."
