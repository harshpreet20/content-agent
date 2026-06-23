import { NextResponse } from "next/server";
import { loadData, getMyStats } from "@/lib/data";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";
import { getLearnings, buildEnhancedPrompt } from "@/lib/micro-intel";

const BASE_SYSTEM = `You are the PLANNER agent for a badminton/racquet sports Instagram account.
Your job: create a 7-day content calendar.
For each day, include: content type (reel/carousel/story/post), topic, best posting time, and a brief description.
Consider posting frequency, variety, and engagement patterns from the data. Output as JSON array with fields: day, type, topic, time, description.`;

export async function POST() {
  const data = loadData();
  if (!data) return NextResponse.json({ error: "No data" }, { status: 404 });

  const me = getMyStats(data);
  const learnings = await getLearnings("planner");
  const system = buildEnhancedPrompt(BASE_SYSTEM, learnings);

  const recentPosts = me.posts
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const context = `MY ACCOUNT (@${me.handle}): ${me.postCount} posts, avg ${me.avgLikes} likes, avg ${me.avgComments} comments.

RECENT POSTS:
${recentPosts.map((p) => `[${p.type}] "${p.caption?.slice(0, 100)}" — ${p.likes} likes, ${p.comments} comments`).join("\n")}

Create a 7-day content calendar starting from tomorrow. Mix formats for maximum reach.`;

  try {
    const result = await askClaude(system, context);
    const reportId = await saveReport("planner", result);
    return NextResponse.json({ agent: "planner", result, reportId, learningsUsed: learnings.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
