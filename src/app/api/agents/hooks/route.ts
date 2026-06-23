import { NextResponse } from "next/server";
import { loadData, getMyStats, getCompetitorStats } from "@/lib/data";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";
import { getLearnings, buildEnhancedPrompt } from "@/lib/micro-intel";

const BASE_SYSTEM = `You are the HOOK & SCRIPT agent for a badminton/racquet sports Instagram account.
Your job: write 3 reel scripts with attention-grabbing hooks.
Each script must include: a hook (first 3 seconds), a body (15-30 seconds of value), and a CTA.
Base them on what's working for competitors. Output as JSON array with fields: hook, body, cta, estimatedLength.`;

export async function POST() {
  const data = loadData();
  if (!data) return NextResponse.json({ error: "No data" }, { status: 404 });

  const me = getMyStats(data);
  const competitors = getCompetitorStats(data);
  const learnings = await getLearnings("hooks");
  const system = buildEnhancedPrompt(BASE_SYSTEM, learnings);

  const topCompetitorPosts = competitors
    .flatMap((c) => c.posts.slice(0, 5))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10);

  const context = `MY ACCOUNT (@${me.handle}): avg ${me.avgLikes} likes per post.

TOP COMPETITOR POSTS (by likes):
${topCompetitorPosts.map((p) => `"${p.caption?.slice(0, 150)}" — ${p.likes} likes (@${p.ownerUsername})`).join("\n")}

Write 3 reel scripts with hooks that would work for my badminton community account.`;

  try {
    const result = await askClaude(system, context);
    const reportId = await saveReport("hooks", result);
    return NextResponse.json({ agent: "hooks", result, reportId, learningsUsed: learnings.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
