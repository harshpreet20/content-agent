import { NextResponse } from "next/server";
import { loadData, getMyStats, getCompetitorStats } from "@/lib/data";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Try local file first (dev mode)
  const localData = loadData();
  if (localData) {
    return NextResponse.json({
      scrapedAt: localData.scrapedAt,
      me: getMyStats(localData),
      competitors: getCompetitorStats(localData),
    });
  }

  // Fall back to Supabase (production)
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("content_agent_scrapes")
      .select("*")
      .order("scraped_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "No data found. Run: npm run scrape" }, { status: 404 });
    }

    const scraped = data.data;
    const myHandle = data.my_handle;
    const competitors = data.competitors;
    const profiles = scraped.profiles || scraped;

    const myPosts = profiles[myHandle] || [];
    const totalLikes = myPosts.reduce((s: number, p: any) => s + (p.likes || 0), 0);
    const totalComments = myPosts.reduce((s: number, p: any) => s + (p.comments || 0), 0);
    const totalViews = myPosts.reduce((s: number, p: any) => s + (p.views || 0), 0);
    const avgLikes = myPosts.length ? Math.round(totalLikes / myPosts.length) : 0;
    const avgComments = myPosts.length ? Math.round(totalComments / myPosts.length) : 0;
    const topPost = [...myPosts].sort((a: any, b: any) => b.likes - a.likes)[0] || null;

    const competitorStats = competitors.map((handle: string) => {
      const posts = profiles[handle] || [];
      const tl = posts.reduce((s: number, p: any) => s + (p.likes || 0), 0);
      const al = posts.length ? Math.round(tl / posts.length) : 0;
      const tp = [...posts].sort((a: any, b: any) => b.likes - a.likes)[0] || null;
      return { handle, postCount: posts.length, avgLikes: al, totalLikes: tl, topPost: tp, posts };
    });

    return NextResponse.json({
      scrapedAt: data.scraped_at,
      me: {
        handle: myHandle,
        postCount: myPosts.length,
        totalLikes,
        totalComments,
        totalViews,
        avgLikes,
        avgComments,
        topPost,
        posts: myPosts,
      },
      competitors: competitorStats,
    });
  } catch {
    return NextResponse.json({ error: "No data found. Run: npm run scrape" }, { status: 404 });
  }
}
