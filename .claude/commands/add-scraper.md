# Add Scraper

Add a new data source to the dashboard. Creates the scraping logic, webhook handler, database table, and wires it into the brain context layer.

**Usage:** `/add-scraper [source-name]: [what to scrape] from [platform/url]`

Parse the arguments: `$ARGUMENTS`

If no arguments provided, ask for:
1. Source name (e.g., `youtube`, `twitter`, `reddit`, `tiktok`, `yelp`)
2. What data to collect (e.g., "competitor videos", "subreddit posts", "customer reviews")
3. The URL or search query to scrape

---

## Implementation Steps

### 1. Find the Right Apify Actor

Search [apify.com/store](https://apify.com/store) for actors that scrape the target platform.

Common actors:
| Platform | Actor | Input Format |
|----------|-------|-------------|
| YouTube | `bernardo/youtube-scraper` | `{ searchKeywords: [...] }` |
| Twitter/X | `apidojo/twitter-scraper` | `{ searchTerms: [...] }` |
| TikTok | `clockworks/tiktok-scraper` | `{ hashtags: [...] }` |
| Reddit | `trudax/reddit-scraper` | `{ startUrls: [...] }` |
| Yelp | `apify/yelp-scraper` | `{ startUrls: [...] }` |
| LinkedIn | `anchor/linkedin-scraper` | `{ searchTerms: [...] }` |
| Google Trends | `emastra/google-trends-scraper` | `{ searchTerms: [...] }` |

### 2. Create the Database Table

Use `mcp__Supabase__apply_migration`:

```sql
CREATE TABLE [source]_scrapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT '[source_name]',
  query TEXT,           -- search term or handle scraped
  data JSONB NOT NULL,  -- raw scraped data
  item_count INTEGER DEFAULT 0,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_[source]_scrapes_at ON [source]_scrapes (scraped_at DESC);
```

### 3. Create the Scraping Library

Create `src/lib/[source]-scraper.ts`:

```typescript
import { ApifyClient } from "apify-client";
import { createServerClient } from "@/lib/supabase-server";

const ACTOR_ID = "actor/name-here";

export async function start[Source]Scrape() {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) throw new Error("Missing APIFY_API_TOKEN");

  const client = new ApifyClient({ token: apifyToken });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const run = await client.actor(ACTOR_ID).start(
    {
      // Actor-specific input
      startUrls: [{ url: "TARGET_URL" }],
      maxItems: 50,
    },
    {
      webhooks: [{
        eventTypes: ["ACTOR.RUN.SUCCEEDED"],
        requestUrl: `${baseUrl}/api/[source]-webhook`,
      }],
    }
  );

  // Track the run
  const supabase = createServerClient();
  await supabase.from("scrape_runs").upsert(
    {
      id: "[source]_latest",
      run_id: run.id,
      dataset_id: run.defaultDatasetId,
      status: "RUNNING",
      started_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  return { runId: run.id };
}

export async function collect[Source]Results(runId: string) {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) throw new Error("Missing APIFY_API_TOKEN");

  const client = new ApifyClient({ token: apifyToken });
  const run = await client.run(runId).get();
  if (!run || run.status !== "SUCCEEDED") return { collected: 0 };

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  // Transform items into your schema
  const transformed = items.map((item: any) => ({
    // Map Apify output fields to your schema
    title: item.title || "",
    content: item.text || item.description || "",
    engagement: item.likes || item.views || 0,
    url: item.url || "",
    timestamp: item.date || item.publishedAt || "",
  }));

  // Save to database
  const supabase = createServerClient();
  await supabase.from("[source]_scrapes").insert({
    source: "[source_name]",
    data: { items: transformed, scrapedAt: new Date().toISOString() },
    item_count: transformed.length,
  });

  return { collected: transformed.length };
}

// Synchronous scrape (waits for completion)
export async function scrape[Source]Sync() {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) throw new Error("Missing APIFY_API_TOKEN");

  const client = new ApifyClient({ token: apifyToken });

  const run = await client.actor(ACTOR_ID).call(
    { /* input */ },
    { waitSecs: 120 }
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  // ... same transform + save logic
}
```

### 4. Create the Webhook Handler

Create `src/app/api/[source]-webhook/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { collect[Source]Results } from "@/lib/[source]-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const runId = body?.resource?.id || body?.eventData?.actorRunId;

    if (!runId) {
      return NextResponse.json({ error: "No run ID" }, { status: 400 });
    }

    const result = await collect[Source]Results(runId);

    // Auto-regenerate brain with new data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    fetch(`${baseUrl}/api/brain`, { method: "POST" }).catch(() => {});

    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

### 5. Wire into the Cron Job

Add to `src/app/api/cron/scrape/route.ts`:

```typescript
import { start[Source]Scrape } from "@/lib/[source]-scraper";

// Inside the startScrape() function, add:
let [source]Run = null;
try {
  [source]Run = await start[Source]Scrape();
} catch {
  // non-critical
}
```

### 6. Wire into the Brain Layer

Update `src/lib/brain.ts` to include the new data source:

```typescript
// Add a function to summarize the new data
async function get[Source]Summary(): Promise<string> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("[source]_scrapes")
      .select("data")
      .order("scraped_at", { ascending: false })
      .limit(1)
      .single();

    if (!data) return "No [source] data available yet.";

    const items = (data.data as any)?.items || [];
    // Summarize the data for the brain
    return items.slice(0, 5)
      .map((i: any) => `"${i.title?.slice(0, 80)}" - ${i.engagement} engagement`)
      .join("\n");
  } catch {
    return "[Source] data unavailable.";
  }
}

// Add to the dataPayload in buildBrainContext():
// === [SOURCE] DATA ===
// ${await get[Source]Summary()}
```

### 7. Add Health Check (Optional)

In `src/app/api/health/route.ts`, add a freshness check:

```typescript
// Check [source] data freshness
try {
  const { data } = await supabase
    .from("[source]_scrapes")
    .select("scraped_at")
    .order("scraped_at", { ascending: false })
    .limit(1)
    .single();
  // ... age check logic
} catch { }
```

### 8. Add to StatusBar (Optional)

In `src/components/StatusBar.tsx`, add to `SERVICE_META`:

```typescript
[source]: { label: "Source Name", icon: "EMOJI" },
```

---

## Testing

1. Test the Apify actor manually in the Apify console first
2. Check that the webhook URL is accessible from the internet
3. Run the scraper via the cron endpoint or a manual trigger
4. Verify data appears in the Supabase table
5. Check the brain includes the new data source
6. Verify agents reference the new data in their outputs
