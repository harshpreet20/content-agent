# Add Agent

Add a new AI agent to the dashboard. Creates the API route, system prompt, agent card integration, and wires it into the brain + feedback loop.

**Usage:** `/add-agent [agent-name]: [purpose description]`

Parse the arguments: `$ARGUMENTS`

If no arguments provided, ask for:
1. Agent name (kebab-case, e.g., `hashtag-researcher`, `trend-spotter`, `caption-writer`)
2. What the agent should do (1-2 sentences)

---

## Implementation Steps

### 1. Create the API Route

Create `src/app/api/agents/[agent-name]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { loadDataWithFallback, getMyStats, getCompetitorStats } from "@/lib/data";
import { buildBrainContext, injectBrainContext } from "@/lib/brain";
import { buildEnhancedPrompt } from "@/lib/micro-intel";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AGENT_NAME = "AGENT_NAME_HERE";

const SYSTEM_PROMPT = `You are the [ROLE] agent for an Instagram content account.

Your job: [DETAILED DESCRIPTION OF WHAT THIS AGENT DOES]

Rules:
- Output ONLY valid HTML. No markdown. No code fences. No JSON.
- Use clean, inline-styled HTML that renders well in a dashboard card.
- Be specific with numbers and examples.
- Keep output concise but actionable.
- [ADD NICHE-SPECIFIC RULES]

Output format:
[DESCRIBE THE EXACT HTML STRUCTURE EXPECTED]`;

export async function POST(request: Request) {
  try {
    // Optional: parse request body for config
    // const body = await request.json().catch(() => ({}));

    const data = await loadDataWithFallback();
    if (!data) {
      return NextResponse.json({ error: "No data available. Run a scrape first." }, { status: 400 });
    }

    const brain = await buildBrainContext();
    const enhanced = await buildEnhancedPrompt(SYSTEM_PROMPT, AGENT_NAME);
    const finalPrompt = injectBrainContext(enhanced, brain);

    const me = getMyStats(data);
    const competitors = getCompetitorStats(data);

    const dataPayload = `=== MY ACCOUNT (@${me.handle}) ===
Posts: ${me.postCount} | Avg Likes: ${me.avgLikes} | Avg Comments: ${me.avgComments}
Engagement Rate: ${me.engagementRate}%

Recent posts:
${me.posts.sort((a, b) => b.likes - a.likes).slice(0, 10)
  .map(p => `[${p.type}] "${p.caption?.slice(0, 80)}" - ${p.likes} likes`)
  .join("\n")}

=== COMPETITORS ===
${competitors.map(c => `@${c.handle}: ${c.postCount} posts, avg ${c.avgLikes} likes`).join("\n")}`;

    const result = await askClaude(finalPrompt, dataPayload);
    const { reportId, learningsUsed } = await saveReport(AGENT_NAME, result);

    return NextResponse.json({ agent: AGENT_NAME, result, reportId, learningsUsed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

### 2. Register in the Dashboard

Open the main dashboard page (`src/app/page.tsx`) and add the new agent to the agents array:

```typescript
{
  id: "AGENT_NAME_HERE",
  name: "Display Name",
  description: "What this agent does in one line",
  icon: "EMOJI",  // e.g., "🔍", "✍️", "📊"
  endpoint: "/api/agents/AGENT_NAME_HERE",
}
```

### 3. Add to Nav (if it gets its own page)

If the agent needs a dedicated page, add a nav link in `src/components/Nav.tsx`.

### 4. Customize the System Prompt

The system prompt is the most important part. Write it with:
- **Role definition:** "You are the [X] agent for..."
- **Specific task:** Exactly what to produce
- **Output format:** HTML structure (cards, tables, lists, etc.)
- **Rules:** No markdown, be specific, use numbers
- **Niche context:** Domain-specific knowledge and terminology

### 5. Test

1. Run `npm run dev`
2. Click the new agent card on the dashboard
3. Verify it returns formatted HTML
4. Test the feedback buttons
5. After 5 ratings, verify retrain triggers

### 6. Create Sponsor Variant (Optional)

If this agent should also work in sponsor activation mode, create:
`src/app/api/sponsor/agents/[agent-name]/route.ts`

Same pattern but:
- Accept `{ sponsorHandle }` in request body
- Load sponsor scrape data from `sponsor_scrapes` table
- Inject sponsor context into the data payload
- Modify system prompt to produce co-branded output

---

## Common Agent Patterns

### Research/Analysis Agent
```
"Analyze [data source] and produce a structured report with:
1. Key findings (with specific numbers)
2. Patterns and trends
3. Actionable recommendations
Format: HTML cards with headers, data callouts, and bullet points."
```

### Creative/Content Agent
```
"Generate [N] [content type]. Each must include:
1. [Required element 1]
2. [Required element 2]
3. [Required element 3]
Format: HTML cards, each in its own <div> with a border."
```

### Strategy/Planning Agent
```
"Create a [timeframe] plan for [objective]. Include:
1. Daily/weekly breakdown
2. Specific actions and timing
3. Expected outcomes
Format: HTML table or calendar grid."
```

### Outreach/Communication Agent
```
"Write [N] [message type] templates for [scenario]. Each needs:
1. Subject/opening line
2. Body with personalization slots [NAME], [TOPIC]
3. Call to action
Format: HTML message cards with copy-friendly formatting."
```
