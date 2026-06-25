# Setup Environment

Configure all environment variables, API keys, and MCP connections for the agent dashboard. Guides you through extracting keys from each service and setting them up.

**Usage:** `/setup-env` (interactive — walks you through each service)

Parse any arguments: `$ARGUMENTS`

---

## Step-by-Step Setup

### 1. Supabase

Check if Supabase MCP is connected by listing projects:
- Use `mcp__Supabase__list_projects` to verify connection
- If connected, use `mcp__Supabase__get_project_url` and `mcp__Supabase__get_publishable_keys` to extract:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

If NOT connected, tell the user:
1. Go to Claude Code environment settings
2. Add Supabase MCP server
3. Authenticate with their Supabase account

### 2. Anthropic API Key

The API key cannot be extracted programmatically. Ask the user:

> Please provide your Anthropic API key from [console.anthropic.com/api-keys](https://console.anthropic.com/api-keys).
> Create a new key named "content-agent" if you don't have one.

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Cost estimate:** ~$2-5/month using claude-haiku-4-5-20251001 at $0.001/agent run.

### 3. Apify

Ask the user for their Apify API token:

> Get your Apify token from [console.apify.com/account/integrations](https://console.apify.com/account/integrations)

```env
APIFY_API_TOKEN=apify_api_...
```

**Free tier:** $5/month compute, enough for weekly scrapes of ~10 handles.

### 4. Instagram Configuration

Ask the user for:
- Their Instagram handle (no @)
- 3-8 competitor handles (comma-separated)

```env
INSTAGRAM_HANDLE=your_handle
COMPETITOR_HANDLES=comp1,comp2,comp3,comp4
```

### 5. Cron Secret

Generate a random secret for the cron endpoint:

```bash
openssl rand -hex 32
```

```env
CRON_SECRET=[generated-hex-string]
```

### 6. App URL

If deployed on Vercel, get the URL:
- Use `mcp__Vercel__list_projects` and `mcp__Vercel__get_project` to find the production URL
- Or ask the user for their Vercel deployment URL

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

For local development:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Optional: Review Sources

```env
# Google Maps place URL or search query
GOOGLE_MAPS_URL=https://www.google.com/maps/place/...
GOOGLE_BUSINESS_NAME=Your Business Name City

# Trustpilot (hardcoded in reviews.ts but can be env var)
# Default: https://www.trustpilot.com/review/yourdomain.com
```

### 8. Optional: Telegram Notifications

```env
TELEGRAM_BOT_TOKEN=bot_token_from_botfather
TELEGRAM_CHAT_ID=your_chat_id
```

---

## Write the .env File

After collecting all values, create `.env` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI
ANTHROPIC_API_KEY=

# Scraping
APIFY_API_TOKEN=
INSTAGRAM_HANDLE=
COMPETITOR_HANDLES=

# App
CRON_SECRET=
NEXT_PUBLIC_APP_URL=

# Reviews (optional)
GOOGLE_MAPS_URL=
GOOGLE_BUSINESS_NAME=

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Make sure `.env` is in `.gitignore`.

---

## Set Vercel Environment Variables

If Vercel MCP is connected, remind the user to set these same variables in:
**Vercel Dashboard → Project → Settings → Environment Variables**

All variables should be set for Production, Preview, and Development environments.

---

## Verify Setup

After all variables are set, verify each connection:

1. **Supabase:** `mcp__Supabase__execute_sql` — run `SELECT 1`
2. **Anthropic:** Check the health endpoint returns `anthropic: { status: "ok" }`
3. **Apify:** Health endpoint checks token validity automatically
4. **App URL:** Ensure webhook callbacks will reach the correct URL

Run the dev server and hit `/api/health` to confirm all systems green.
