import { NextResponse } from "next/server";
import { getAccountInsights, getAccountInfo, getMediaWithInsights, getDemographics } from "@/lib/instagram";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  try {
    const supabase = createServerClient();

    const [account, insights, media, demographics] = await Promise.all([
      getAccountInfo(),
      getAccountInsights("day"),
      getMediaWithInsights(15),
      getDemographics(),
    ]);

    const insightMetrics: Record<string, number> = {};
    for (const item of insights) {
      insightMetrics[item.name] = item.total_value?.value ?? item.values?.[0]?.value ?? 0;
    }

    const rows = [
      {
        metric_type: "account",
        data: {
          username: account.username,
          followers: account.followers_count,
          following: account.follows_count,
          posts: account.media_count,
        },
        period: "snapshot",
      },
      {
        metric_type: "insights",
        data: insightMetrics,
        period: "day",
      },
      {
        metric_type: "media",
        data: { posts: media.slice(0, 15) },
        period: "snapshot",
      },
    ];

    if (demographics.length > 0) {
      rows.push({
        metric_type: "demographics",
        data: { raw: demographics },
        period: "lifetime",
      });
    }

    const { error } = await supabase.from("content_agent_analytics").insert(rows);
    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      synced: rows.map((r) => r.metric_type),
      followers: account.followers_count,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
