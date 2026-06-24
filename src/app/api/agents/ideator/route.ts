import { NextResponse } from "next/server";
import { loadDataWithFallback, getMyStats, getCompetitorStats } from "@/lib/data";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";
import { getLearnings, buildEnhancedPrompt } from "@/lib/micro-intel";
import { buildBrainContext, injectBrainContext } from "@/lib/brain";

const BASE_SYSTEM = `You are the IDEATOR agent for a badminton/racquet sports Instagram account.
Your job: analyze the account's posts and competitors' top-performing content, then generate 5 fresh content ideas.

Output a clean, well-designed HTML report using inline styles. Use this structure:
- A heading for "Content Ideas Report"
- For each idea, a styled card with: numbered title, format badge (Reel/Carousel/Story/Post), a one-line hook in italics, and a "Why it works" paragraph
- Use warm colors (#F59E0B amber, #EC4899 pink) for accents, clean white cards with subtle borders, and readable fonts
- Use simple inline CSS only (no external stylesheets, no style tags)
- Write in friendly, conversational English, no jargon, no JSON
- Keep each idea concise (2-3 sentences for "why it works")

CRITICAL FORMAT RULES:
- Output ONLY raw HTML. No markdown, no code fences, no backticks, no text before or after the HTML.
- Never use em dashes or en dashes. Use " - " (space hyphen space) instead.
- Your entire response must start with < and end with >. Nothing else.`;

export async function POST() {
  const data = await loadDataWithFallback();
  if (!data) return NextResponse.json({ error: "No data. Run: npm run scrape" }, { status: 404 });

  const me = getMyStats(data);
  const competitors = getCompetitorStats(data);
  const [learnings, brain] = await Promise.all([
    getLearnings("ideator"),
    buildBrainContext(),
  ]);
  const system = injectBrainContext(buildEnhancedPrompt(BASE_SYSTEM, learnings), brain);

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
