import { NextResponse } from "next/server";
import { loadData, getMyStats } from "@/lib/data";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";

const SYSTEM = `You are the DM MANAGER agent for a badminton/racquet sports community Instagram account.
Your job: create DM templates for common scenarios.
Generate 5 templates: welcome new follower, reply to collaboration request, promote upcoming event, re-engage inactive follower, thank someone for sharing.
Each template should feel personal, not spammy. Output as JSON array with fields: scenario, template, tone.`;

export async function POST() {
  const data = loadData();
  if (!data) return NextResponse.json({ error: "No data" }, { status: 404 });

  const me = getMyStats(data);

  const context = `MY ACCOUNT (@${me.handle}): A badminton/racquet sports community.
- ${me.postCount} posts, avg ${me.avgLikes} likes
- Content style based on recent captions:
${me.posts.slice(0, 5).map((p) => `"${p.caption?.slice(0, 80)}"`).join("\n")}

Generate 5 DM templates that match my brand voice.`;

  try {
    const result = await askClaude(SYSTEM, context);
    await saveReport("dm-manager", result);
    return NextResponse.json({ agent: "dm-manager", result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
