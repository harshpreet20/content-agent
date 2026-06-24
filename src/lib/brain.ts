import { loadDataWithFallback, getMyStats, getCompetitorStats } from "./data";
import { createServerClient } from "./supabase-server";
import { askClaude } from "./claude";

interface BrainContext {
  brief: string;
  rawStats: {
    myHandle: string;
    postCount: number;
    avgLikes: number;
    avgComments: number;
    totalViews: number;
    engagementRate: number;
    topPostCaption: string;
    topPostLikes: number;
  };
  competitors: Array<{
    handle: string;
    postCount: number;
    avgLikes: number;
    topPostCaption: string;
  }>;
  generatedAt: string;
}

const BRAIN_SYSTEM = `You are the STRATEGIC BRAIN for a badminton/racquet sports Instagram account (@racquetsclubcommunity).
Your job: synthesize all available data into a concise strategic context brief that other AI agents will use to make better decisions.

Analyze the data and produce a structured brief covering:

1. CURRENT POSITION - Where does the account stand? Strengths, weaknesses in plain language with specific numbers.
2. COMPETITIVE LANDSCAPE - How do we compare to competitors? Who's winning and why? What content formats/topics work for them?
3. CONTENT PATTERNS - What types of our content perform best? What topics get engagement? What falls flat?
4. AUDIENCE SENTIMENT - Based on reviews and engagement, what does the audience care about?
5. STRATEGIC PRIORITIES - The top 3 things to focus on right now, based on all the data.
6. OPPORTUNITIES - Gaps competitors aren't covering, trending formats to try, untapped topics.

Rules:
- Be specific with numbers. "23 avg likes vs competitor average of 45" not "below average".
- Be honest about weaknesses. Don't sugarcoat.
- Keep it under 600 words. Every sentence should be actionable intelligence.
- Write in plain text, no HTML, no markdown formatting. Just clear paragraphs with section headers.
- This brief will be injected into other AI agent prompts, so write it as context they can act on.`;

export async function buildBrainContext(): Promise<BrainContext | null> {
  const cached = await getCachedBrief();
  if (cached) return cached;

  const data = await loadDataWithFallback();
  if (!data) return null;

  const me = getMyStats(data);
  const competitors = getCompetitorStats(data);

  const reviewsSummary = await getReviewsSummary();
  const recentReportInsights = await getRecentReportInsights();
  const allLearnings = await getAllLearnings();

  const dataPayload = `=== MY ACCOUNT (@${me.handle}) ===
Posts: ${me.postCount}
Total Likes: ${me.totalLikes} | Total Comments: ${me.totalComments} | Total Views: ${me.totalViews}
Average: ${me.avgLikes} likes, ${me.avgComments} comments per post
Engagement Rate: ${me.engagementRate}%
Top Post: "${me.topPost?.caption?.slice(0, 150)}" (${me.topPost?.likes} likes, ${me.topPost?.comments} comments)

Recent posts by performance:
${me.posts
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 10)
  .map((p) => `[${p.type}] "${p.caption?.slice(0, 80)}" - ${p.likes} likes, ${p.comments} comments, ${p.views} views`)
  .join("\n")}

Content type distribution:
${getTypeDistribution(me.posts)}

=== COMPETITORS ===
${competitors.map((c) => {
  const topPosts = c.posts.sort((a, b) => b.likes - a.likes).slice(0, 3);
  return `@${c.handle}: ${c.postCount} posts, avg ${c.avgLikes} likes
  Top posts: ${topPosts.map((p) => `"${p.caption?.slice(0, 80)}" (${p.likes} likes)`).join(" | ")}`;
}).join("\n")}

=== REVIEWS (Trustpilot) ===
${reviewsSummary}

=== RECENT AGENT INSIGHTS ===
${recentReportInsights}

=== ACCUMULATED LEARNINGS ===
${allLearnings}`;

  try {
    const brief = await askClaude(BRAIN_SYSTEM, dataPayload);

    const context: BrainContext = {
      brief,
      rawStats: {
        myHandle: me.handle,
        postCount: me.postCount,
        avgLikes: me.avgLikes,
        avgComments: me.avgComments,
        totalViews: me.totalViews,
        engagementRate: me.engagementRate ?? 0,
        topPostCaption: me.topPost?.caption?.slice(0, 150) || "",
        topPostLikes: me.topPost?.likes || 0,
      },
      competitors: competitors.map((c) => ({
        handle: c.handle,
        postCount: c.postCount,
        avgLikes: c.avgLikes,
        topPostCaption: c.topPost?.caption?.slice(0, 100) || "",
      })),
      generatedAt: new Date().toISOString(),
    };

    await cacheBrief(context);
    return context;
  } catch {
    return null;
  }
}

export function injectBrainContext(
  baseSystem: string,
  brain: BrainContext | null
): string {
  if (!brain) return baseSystem;

  return `${baseSystem}

=== STRATEGIC CONTEXT (from the Brain Layer - use this to inform your output) ===
${brain.brief}
=== END STRATEGIC CONTEXT ===`;
}

function getTypeDistribution(posts: any[]): string {
  const counts: Record<string, number> = {};
  for (const p of posts) {
    const t = p.type || "unknown";
    counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `${type}: ${count} posts (${Math.round((count / posts.length) * 100)}%)`)
    .join(", ");
}

async function getReviewsSummary(): Promise<string> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("content_agent_reviews")
      .select("rating, title, review_text")
      .order("scraped_at", { ascending: false })
      .limit(10);

    if (!data || data.length === 0) return "No reviews available yet.";

    const ratings = data.map((r) => r.rating).filter((r) => r > 0);
    const avg = ratings.length > 0
      ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)
      : "N/A";

    const snippets = data
      .slice(0, 5)
      .map((r) => `[${r.rating}/5] "${(r.title || r.review_text || "").slice(0, 80)}"`)
      .join("\n");

    return `${data.length} reviews, avg rating: ${avg}/5\nRecent:\n${snippets}`;
  } catch {
    return "Reviews unavailable.";
  }
}

async function getRecentReportInsights(): Promise<string> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("content_agent_reports")
      .select("agent_name, result, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!data || data.length === 0) return "No previous agent reports.";

    return data
      .map((r) => {
        const text = (r.result || "").replace(/<[^>]*>/g, "").slice(0, 200);
        return `[${r.agent_name}] ${text}`;
      })
      .join("\n");
  } catch {
    return "Previous reports unavailable.";
  }
}

async function getAllLearnings(): Promise<string> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("content_agent_learnings")
      .select("agent_name, learning")
      .eq("active", true)
      .order("score", { ascending: false })
      .limit(20);

    if (!data || data.length === 0) return "No accumulated learnings yet.";

    return data
      .map((l) => `[${l.agent_name}] ${l.learning}`)
      .join("\n");
  } catch {
    return "Learnings unavailable.";
  }
}

async function getCachedBrief(): Promise<BrainContext | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("content_agent_analytics")
      .select("data, fetched_at")
      .eq("metric_type", "brain_context")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (!data) return null;

    const age = Date.now() - new Date(data.fetched_at).getTime();
    const ONE_HOUR = 60 * 60 * 1000;
    if (age > ONE_HOUR) return null;

    return data.data as BrainContext;
  } catch {
    return null;
  }
}

async function cacheBrief(context: BrainContext): Promise<void> {
  try {
    const supabase = createServerClient();
    await supabase.from("content_agent_analytics").insert({
      metric_type: "brain_context",
      data: context,
      period: "snapshot",
    });
  } catch {
    // non-critical
  }
}
