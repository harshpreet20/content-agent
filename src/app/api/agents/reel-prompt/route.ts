import { NextResponse } from "next/server";
import { loadDataWithFallback, getMyStats, getCompetitorStats } from "@/lib/data";
import { askClaude } from "@/lib/claude";
import { saveReport } from "@/lib/supabase-server";
import { getLearnings, buildEnhancedPrompt } from "@/lib/micro-intel";
import { buildBrainContext, injectBrainContext } from "@/lib/brain";

const BASE_SYSTEM = `You are the AI REEL PROMPT agent for a badminton/racquet sports Instagram account.

Your job: Take reel concepts and write DETAILED AI production prompts ready to paste into AI video/image generation tools. Focus exclusively on crafting the best possible prompts for AI-generated content.

For each reel concept, write a COMPLETE production prompt covering ALL of these specs:
- VISUAL STYLE: Photorealistic / 3D Render / Motion Graphics / Anime / Cinematic / Flat Vector
- CAMERA: Shot type (wide/close-up/drone/tracking), movement (pan/dolly/orbit/static), angle (low/high/eye-level)
- LIGHTING: Key light direction, color temperature, mood (golden hour/studio/neon/dramatic shadows)
- SCENE: Environment, background elements, atmosphere, depth of field
- CHARACTERS: Description if any (appearance, clothing, pose, expression, motion)
- ANIMATION: Movement sequences, transitions, timing, speed (slow-mo/timelapse/normal)
- VFX: Particle effects, glows, trails, text overlays, color grading, lens effects
- CGI ELEMENTS: 3D objects, shuttlecocks in flight, court renders, equipment close-ups
- COLOR PALETTE: Primary and accent colors, mood board reference
- SOUND DESIGN NOTES: Suggested music style, SFX cues
- TOOL RECOMMENDATION: Which AI tool to use (Runway Gen-3, Kling 1.5, Pika, Midjourney + video, Sora, etc.) and why
- THE ACTUAL PROMPT: A ready-to-paste prompt for the recommended tool, optimized for that tool's syntax

Generate 4-5 AI reel production prompts. Each should be a completely different visual concept for badminton/racquet sports content. Think cinematic, eye-catching, scroll-stopping visuals that would stand out on Instagram.

Output a clean HTML report with inline styles:
- A heading "AI Reel Production Prompts"
- For each reel, a detailed production card with all specs above laid out clearly
- Include a "Copy-Paste Prompt" section at the bottom of each card in a monospace styled box
- Use orange (#F97316) and violet (#8B5CF6) accents
- Clean white cards with subtle borders and shadows

CRITICAL FORMAT RULES:
- Output ONLY raw HTML. No markdown, no code fences, no backticks.
- Never use em dashes or en dashes. Use " - " instead.
- Your entire response must start with < and end with >.`;

export async function POST() {
  const data = await loadDataWithFallback();
  if (!data) return NextResponse.json({ error: "No data. Run: npm run scrape" }, { status: 404 });

  const me = getMyStats(data);
  const competitors = getCompetitorStats(data);
  const [learnings, brain] = await Promise.all([
    getLearnings("reel-prompt"),
    buildBrainContext(),
  ]);
  const system = injectBrainContext(buildEnhancedPrompt(BASE_SYSTEM, learnings), brain);

  const topCompetitorPosts = competitors
    .flatMap((c) => c.posts.slice(0, 5))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10);

  const context = `MY ACCOUNT (@${me.handle}): avg ${me.avgLikes} likes, ${me.avgComments} comments per post.
Engagement rate: ${me.engagementRate}%

TOP COMPETITOR POSTS (by likes):
${topCompetitorPosts.map((p) => `"${p.caption?.slice(0, 150)}" - ${p.likes} likes (@${p.ownerUsername}) [${p.type}]`).join("\n")}

MY RECENT POSTS:
${me.posts
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 5)
  .map((p) => `[${p.type}] "${p.caption?.slice(0, 100)}" - ${p.likes} likes`)
  .join("\n")}

Generate 4-5 visually distinct AI reel concepts for my badminton community account. For each one, write a complete production prompt with all visual specs, ready to paste into AI video tools.`;

  try {
    const result = await askClaude(system, context);
    const reportId = await saveReport("reel-prompt", result);
    return NextResponse.json({ agent: "reel-prompt", result, reportId, learningsUsed: learnings.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
