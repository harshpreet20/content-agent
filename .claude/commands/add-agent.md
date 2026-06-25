# Add Agent — Quick Agent Creator

> **By Harshpreet Singh Bhasin | Hotbot Studios**
> Part of the Hotbot Agent Toolkit

Add a new AI agent to the dashboard in under 2 minutes. Uses the standard agent route pattern.

**Usage:** `/add-agent [agent-name]: [what it does]`

Parse: `$ARGUMENTS`

If no arguments, ask for agent name and purpose (1 sentence).

---

## You are the VP of AI. Your job: create one agent, fast.

### Step 1: Create the Route (< 30 seconds)

Create `src/app/api/agents/{{name}}/route.ts` using this exact pattern:

```typescript
import { NextResponse } from "next/server";
import { loadDataWithFallback, getMyStats, getCompetitorStats } from "@/lib/data";
import { buildBrainContext, injectBrainContext } from "@/lib/brain";
import { buildEnhancedPrompt } from "@/lib/micro-intel";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AGENT_NAME = "{{name}}";
const SYSTEM_PROMPT = `[WRITE A DOMAIN-EXPERT PROMPT HERE]

Rules:
- Output ONLY valid HTML. No markdown. No code fences.
- Use clean inline-styled HTML.
- Be specific with numbers.
- Keep output actionable and concise.`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = await loadDataWithFallback();
    if (!data) return NextResponse.json({ error: "No data. Run a scrape first." }, { status: 400 });

    const brain = await buildBrainContext();
    const enhanced = await buildEnhancedPrompt(SYSTEM_PROMPT, AGENT_NAME);
    const finalPrompt = injectBrainContext(enhanced, brain);

    const me = getMyStats(data);
    const competitors = getCompetitorStats(data);

    const dataPayload = `MY ACCOUNT (@${me.handle}): ${me.postCount}p, avg ${me.avgLikes}L ${me.avgComments}C, ${me.engagementRate}% ER
Top posts:\n${me.posts.sort((a,b) => b.likes-a.likes).slice(0,8).map(p => `[${p.type}] "${p.caption?.slice(0,60)}" ${p.likes}L`).join("\n")}
COMPETITORS:\n${competitors.map(c => `@${c.handle}: ${c.postCount}p avg ${c.avgLikes}L`).join("\n")}`;

    const result = await askClaude(finalPrompt, dataPayload);
    const { reportId, learningsUsed } = await saveReport(AGENT_NAME, result);
    return NextResponse.json({ agent: AGENT_NAME, result, reportId, learningsUsed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

**Only customize:** AGENT_NAME and SYSTEM_PROMPT. Everything else is boilerplate.

### Step 2: Register in Dashboard (< 15 seconds)

Add to the agents array in `src/app/page.tsx`:
```typescript
{ id: "{{name}}", name: "{{Display Name}}", description: "{{1-liner}}", icon: "{{emoji}}", endpoint: "/api/agents/{{name}}" }
```

### Step 3: Verify (< 15 seconds)

```bash
npx tsc --noEmit
```

Done. The agent is live, wired into brain context and the feedback loop automatically.

### System Prompt Templates

**Research:** "Analyze [X] and produce [N] findings with specific data points..."
**Creative:** "Generate [N] [content type], each with [required elements]..."
**Strategy:** "Create a [timeframe] plan covering [objectives]..."
**Outreach:** "Write [N] [message type] templates with personalization slots..."
