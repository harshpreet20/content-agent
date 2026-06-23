import { NextResponse } from "next/server";
import { loadData, getMyStats, getCompetitorStats } from "@/lib/data";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";

const SYSTEM = `You are the ANALYST agent for a badminton/racquet sports Instagram account.
Your job: provide a data-driven performance report.
Include: engagement rate analysis, best vs worst performing content, competitor comparison, growth opportunities.
Be specific with numbers. Output as JSON with fields: summary, strengths, weaknesses, opportunities, competitorInsights.`;

export async function POST() {
  const data = loadData();
  if (!data) return NextResponse.json({ error: "No data" }, { status: 404 });

  const me = getMyStats(data);
  const competitors = getCompetitorStats(data);

  const context = `MY ACCOUNT (@${me.handle}):
- ${me.postCount} posts, ${me.totalLikes} total likes, ${me.totalComments} total comments
- Average: ${me.avgLikes} likes, ${me.avgComments} comments per post
- Top post: "${me.topPost?.caption?.slice(0, 100)}" (${me.topPost?.likes} likes)

COMPETITORS:
${competitors.map((c) => `@${c.handle}: ${c.postCount} posts, avg ${c.avgLikes} likes. Top: "${c.topPost?.caption?.slice(0, 100)}" (${c.topPost?.likes} likes)`).join("\n")}

Analyze my performance and give actionable insights.`;

  try {
    const result = await askClaude(SYSTEM, context);
    await saveReport("analyst", result);
    return NextResponse.json({ agent: "analyst", result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
