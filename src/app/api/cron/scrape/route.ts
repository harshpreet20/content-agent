import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { createServerClient } from "@/lib/supabase-server";
import { getAccountInfo, getAccountInsights } from "@/lib/instagram";

async function syncInstagramInsights() {
  try {
    const [account, insights] = await Promise.all([
      getAccountInfo(),
      getAccountInsights("day"),
    ]);
    const insightMetrics: Record<string, number> = {};
    for (const item of insights) {
      insightMetrics[item.name] = item.total_value?.value ?? item.values?.[0]?.value ?? 0;
    }
    const supabase = createServerClient();
    await supabase.from("content_agent_analytics").insert([
      { metric_type: "account", data: { username: account.username, followers: account.followers_count, following: account.follows_count, posts: account.media_count }, period: "snapshot" },
      { metric_type: "insights", data: insightMetrics, period: "day" },
    ]);
    return { followers: account.followers_count };
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MY_HANDLE = process.env.INSTAGRAM_HANDLE || "racquetsclubcommunity";
const COMPETITORS = (process.env.COMPETITOR_HANDLES || "")
  .split(",")
  .filter(Boolean);
const ALL_HANDLES = [MY_HANDLE, ...COMPETITORS];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    return NextResponse.json(
      { error: "Missing APIFY_API_TOKEN" },
      { status: 500 }
    );
  }

  const client = new ApifyClient({ token: apifyToken });

  const input = {
    directUrls: ALL_HANDLES.map((h) => `https://www.instagram.com/${h}/`),
    resultsType: "posts",
    resultsLimit: 30,
    searchType: "hashtag",
    searchLimit: 1,
  };

  const run = await client.actor("apify/instagram-scraper").call(input, {
    waitSecs: 300,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  const grouped: Record<string, any[]> = {};
  for (const handle of ALL_HANDLES) {
    grouped[handle] = [];
  }

  for (const item of items) {
    const owner =
      (item as any).ownerUsername ||
      (item as any).owner?.username ||
      (item as any).profileName ||
      "unknown";
    const normalizedOwner = owner.toLowerCase().replace(/^@/, "");

    const matchedHandle = ALL_HANDLES.find(
      (h) => h.toLowerCase() === normalizedOwner
    );

    const post = {
      id: (item as any).id || (item as any).shortCode,
      shortCode: (item as any).shortCode,
      caption: (item as any).caption || "",
      likes: (item as any).likesCount || (item as any).likes || 0,
      comments: (item as any).commentsCount || (item as any).comments || 0,
      views: (item as any).videoViewCount || (item as any).views || 0,
      timestamp: (item as any).timestamp || (item as any).takenAtTimestamp,
      type: (item as any).type || "unknown",
      url:
        (item as any).url ||
        `https://www.instagram.com/p/${(item as any).shortCode}/`,
      hashtags: (item as any).hashtags || [],
      ownerUsername: normalizedOwner,
    };

    if (matchedHandle) {
      grouped[matchedHandle].push(post);
    } else {
      if (!grouped["_other"]) grouped["_other"] = [];
      grouped["_other"].push(post);
    }
  }

  const output = {
    scrapedAt: new Date().toISOString(),
    myHandle: MY_HANDLE,
    competitors: COMPETITORS,
    profiles: grouped,
    totalPosts: items.length,
  };

  const supabase = createServerClient();
  const { error } = await supabase.from("content_agent_scrapes").insert({
    my_handle: MY_HANDLE,
    competitors: COMPETITORS,
    data: output,
  });

  if (error) {
    return NextResponse.json(
      { error: `Supabase save failed: ${error.message}` },
      { status: 500 }
    );
  }

  const igSync = await syncInstagramInsights();

  return NextResponse.json({
    success: true,
    totalPosts: items.length,
    handles: ALL_HANDLES,
    scrapedAt: output.scrapedAt,
    instagram: igSync,
  });
}

export async function POST() {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    return NextResponse.json({ error: "Missing APIFY_API_TOKEN" }, { status: 500 });
  }

  const client = new ApifyClient({ token: apifyToken });

  const input = {
    directUrls: ALL_HANDLES.map((h) => `https://www.instagram.com/${h}/`),
    resultsType: "posts",
    resultsLimit: 30,
    searchType: "hashtag",
    searchLimit: 1,
  };

  const run = await client.actor("apify/instagram-scraper").call(input, {
    waitSecs: 300,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  const grouped: Record<string, any[]> = {};
  for (const handle of ALL_HANDLES) {
    grouped[handle] = [];
  }

  for (const item of items) {
    const owner =
      (item as any).ownerUsername ||
      (item as any).owner?.username ||
      (item as any).profileName ||
      "unknown";
    const normalizedOwner = owner.toLowerCase().replace(/^@/, "");

    const matchedHandle = ALL_HANDLES.find(
      (h) => h.toLowerCase() === normalizedOwner
    );

    const post = {
      id: (item as any).id || (item as any).shortCode,
      shortCode: (item as any).shortCode,
      caption: (item as any).caption || "",
      likes: (item as any).likesCount || (item as any).likes || 0,
      comments: (item as any).commentsCount || (item as any).comments || 0,
      views: (item as any).videoViewCount || (item as any).views || 0,
      timestamp: (item as any).timestamp || (item as any).takenAtTimestamp,
      type: (item as any).type || "unknown",
      url:
        (item as any).url ||
        `https://www.instagram.com/p/${(item as any).shortCode}/`,
      hashtags: (item as any).hashtags || [],
      ownerUsername: normalizedOwner,
    };

    if (matchedHandle) {
      grouped[matchedHandle].push(post);
    } else {
      if (!grouped["_other"]) grouped["_other"] = [];
      grouped["_other"].push(post);
    }
  }

  const output = {
    scrapedAt: new Date().toISOString(),
    myHandle: MY_HANDLE,
    competitors: COMPETITORS,
    profiles: grouped,
    totalPosts: items.length,
  };

  const supabase = createServerClient();
  const { error } = await supabase.from("content_agent_scrapes").insert({
    my_handle: MY_HANDLE,
    competitors: COMPETITORS,
    data: output,
  });

  if (error) {
    return NextResponse.json(
      { error: `Supabase save failed: ${error.message}` },
      { status: 500 }
    );
  }

  const igSyncPost = await syncInstagramInsights();

  return NextResponse.json({
    success: true,
    totalPosts: items.length,
    handles: ALL_HANDLES,
    scrapedAt: output.scrapedAt,
    instagram: igSyncPost,
  });
}
