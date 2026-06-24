import { NextResponse } from "next/server";
import { loadDataWithFallback, getMyStats, getCompetitorStats } from "@/lib/data";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";
import { getLearnings, buildEnhancedPrompt } from "@/lib/micro-intel";

const BASE_SYSTEM = `You are the ANALYST agent for a badminton/racquet sports Instagram account.
Your job: provide a data-driven performance report.

Output a clean, well-designed HTML report using inline styles. Use this structure:
- A heading for "Performance Analysis Report"
- A "Quick Summary" box at the top with 3-4 key metrics in a grid (likes, comments, engagement rate, views)
- A "Strengths" section with green (#10B981) accented bullet points
- A "Areas to Improve" section with amber (#F59E0B) accented bullet points
- A "Competitor Comparison" section with a simple table showing handle, posts, avg likes — use alternating row colors
- A "Growth Opportunities" section with numbered action items
- Use green (#10B981) as the primary accent, clean white cards with subtle borders
- Use simple inline CSS only (no external stylesheets, no <style> tags)
- Write in friendly, conversational English — explain data insights in plain language
- Be specific with numbers — don't say "good engagement", say "23 likes per post, which is 2x the niche average"`;

export async function POST() {
  const data = await loadDataWithFallback();
  if (!data) return NextResponse.json({ error: "No data. Run: npm run scrape" }, { status: 404 });

  const me = getMyStats(data);
  const competitors = getCompetitorStats(data);
  const learnings = await getLearnings("analyst");
  const system = buildEnhancedPrompt(BASE_SYSTEM, learnings);

  const context = `MY ACCOUNT (@${me.handle}):
- ${me.postCount} posts, ${me.totalLikes} total likes, ${me.totalComments} total comments, ${me.totalViews} total views
- Average: ${me.avgLikes} likes, ${me.avgComments} comments per post
- Top post: "${me.topPost?.caption?.slice(0, 100)}" (${me.topPost?.likes} likes)

COMPETITORS:
${competitors.map((c) => `@${c.handle}: ${c.postCount} posts, avg ${c.avgLikes} likes. Top: "${c.topPost?.caption?.slice(0, 100)}" (${c.topPost?.likes} likes)`).join("\n")}

Analyze my performance and give actionable insights.`;

  try {
    const result = await askClaude(system, context);
    const reportId = await saveReport("analyst", result);
    return NextResponse.json({ agent: "analyst", result, reportId, learningsUsed: learnings.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
