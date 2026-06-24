const GRAPH_API = "https://graph.facebook.com/v21.0";

function getCredentials() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igId = process.env.INSTAGRAM_BUSINESS_ID;
  if (!token || !igId) throw new Error("Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ID");
  return { token, igId };
}

async function graphGet(path: string, params: Record<string, string> = {}) {
  const { token } = getCredentials();
  const url = new URL(`${GRAPH_API}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Graph API error: ${res.status}`);
  }
  return res.json();
}

export async function getAccountInsights(period: "day" | "week" | "days_28" = "day") {
  const { igId } = getCredentials();
  const metrics = "impressions,reach,profile_views,accounts_engaged,follows_and_unfollows";
  const data = await graphGet(`/${igId}/insights`, {
    metric: metrics,
    period,
    metric_type: "total_value",
  });
  return data.data || [];
}

export async function getAccountInfo() {
  const { igId } = getCredentials();
  return graphGet(`/${igId}`, {
    fields: "username,name,followers_count,follows_count,media_count,profile_picture_url,biography",
  });
}

export async function getMediaInsights(mediaId: string) {
  return graphGet(`/${mediaId}/insights`, {
    metric: "impressions,reach,likes,comments,shares,saved,plays",
  });
}

export async function getRecentMedia(limit = 25) {
  const { igId } = getCredentials();
  const data = await graphGet(`/${igId}/media`, {
    fields: "id,caption,media_type,timestamp,like_count,comments_count,permalink,thumbnail_url,media_url",
    limit: limit.toString(),
  });
  return data.data || [];
}

export async function getMediaWithInsights(limit = 15) {
  const media = await getRecentMedia(limit);
  const enriched = [];
  for (const m of media) {
    try {
      const insights = await getMediaInsights(m.id);
      const metrics: Record<string, number> = {};
      for (const item of insights.data || []) {
        metrics[item.name] = item.values?.[0]?.value || 0;
      }
      enriched.push({ ...m, insights: metrics });
    } catch {
      enriched.push({ ...m, insights: {} });
    }
  }
  return enriched;
}

export async function getDemographics() {
  const { igId } = getCredentials();
  const metrics = "engaged_audience_demographics,reached_audience_demographics";
  try {
    const data = await graphGet(`/${igId}/insights`, {
      metric: metrics,
      period: "lifetime",
      metric_type: "total_value",
      timeframe: "last_90_days",
    });
    return data.data || [];
  } catch {
    return [];
  }
}
