import { NextResponse } from "next/server";
import { getAccountInsights, getAccountInfo } from "@/lib/instagram";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [account, dailyInsights] = await Promise.all([
      getAccountInfo(),
      getAccountInsights("day"),
    ]);

    const metrics: Record<string, number> = {};
    for (const item of dailyInsights) {
      const val = item.total_value?.value ?? item.values?.[0]?.value ?? 0;
      metrics[item.name] = val;
    }

    return NextResponse.json({
      account: {
        username: account.username,
        name: account.name,
        followers: account.followers_count,
        following: account.follows_count,
        posts: account.media_count,
        profilePicture: account.profile_picture_url,
        bio: account.biography,
      },
      insights: metrics,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
