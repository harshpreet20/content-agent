import { NextResponse } from "next/server";
import { loadDataWithFallback, getMyStats, getCompetitorStats } from "@/lib/data";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";
import { getLearnings, buildEnhancedPrompt } from "@/lib/micro-intel";

const BASE_SYSTEM = `You are the IDEATOR agent for a badminton/racquet sports Instagram account.
Your job: analyze the account's posts and competitors' top-performing content, then generate 5 fresh content ideas.
Each idea must include: a working title, content format (reel/carousel/story/post), a one-line hook, and why it would work based on the data.
Be specific to badminton/racquet sports. Output as JSON array.`;

export async function POST() {
  const data = await loadDataWithFallback();
  if (!data) return NextResponse.json({ error: "No data. Run: npm run scrape" }, { status: 404 });

  const me = getMyStats(data);
  const competitors = getCompetitorStats(data);
  const learnings = await getLearnings("ideator");
  const system = buildEnhancedPrompt(BASE_SYSTEM, learnings);

  const context = `MY ACCOUNT (@${me.handle}): ${me.postCount} posts, avg ${me.avgLikes} likes.
My top post: "${me.topPost?.caption?.slice(0, 100)}" (${me.topPost?.likes} likes)

COMPETITORS:
${competitors.map((c) => `@${c.handle}: ${c.postCount} posts, avg ${c.avgLikes} likes. Top: "${c.topPost?.caption?.slice(0, 100)}" (${c.topPost?.likes} likes)`).join("\n")}

Generate 5 content ideas that could boost my engagement.`;

  try {
    const result = await askClaude(system, context);
    const reportId = await saveReport("ideator", result);
    return NextResponse.json({ agent: "ideator", result, reportId, learningsUsed: learnings.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
