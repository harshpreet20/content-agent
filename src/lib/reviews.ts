import { ApifyClient } from "apify-client";
import { createServerClient } from "@/lib/supabase-server";

const TRUSTPILOT_URL = "https://www.trustpilot.com/review/racquetsclubcommunity.com";

interface TrustpilotReview {
  reviewer_name: string;
  rating: number;
  title: string;
  review_text: string;
  review_date: string;
  data: Record<string, any>;
}

export async function scrapeTrustpilot(): Promise<{
  reviews: TrustpilotReview[];
  summary: { total: number; avgRating: number; newCount: number };
}> {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) throw new Error("Missing APIFY_API_TOKEN");

  const client = new ApifyClient({ token: apifyToken });

  const run = await client.actor("apify/trustpilot-scraper").call(
    {
      startUrls: [{ url: TRUSTPILOT_URL }],
      maxItems: 50,
    },
    { waitSecs: 120 }
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  const reviews: TrustpilotReview[] = items.map((item: any) => ({
    reviewer_name: item.userName || item.consumer?.displayName || "Anonymous",
    rating: item.rating || item.stars || 0,
    title: item.title || item.heading || "",
    review_text: item.text || item.reviewBody || "",
    review_date: item.date || item.publishedDate || item.createdAt || "",
    data: {
      verified: item.isVerified || false,
      reply: item.reply || null,
      likes: item.likes || 0,
      language: item.language || "en",
    },
  }));

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("content_agent_reviews")
    .select("review_text")
    .eq("source", "trustpilot");

  const existingTexts = new Set((existing || []).map((r: any) => r.review_text));
  const newReviews = reviews.filter((r) => !existingTexts.has(r.review_text));

  if (newReviews.length > 0) {
    await supabase.from("content_agent_reviews").insert(
      newReviews.map((r) => ({
        source: "trustpilot",
        reviewer_name: r.reviewer_name,
        rating: r.rating,
        title: r.title,
        review_text: r.review_text,
        review_date: r.review_date,
        data: r.data,
      }))
    );
  }

  const allRatings = reviews.map((r) => r.rating).filter((r) => r > 0);
  const avgRating = allRatings.length > 0
    ? Math.round((allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10) / 10
    : 0;

  return {
    reviews,
    summary: {
      total: reviews.length,
      avgRating,
      newCount: newReviews.length,
    },
  };
}

export async function getStoredReviews(source?: string) {
  const supabase = createServerClient();
  let query = supabase
    .from("content_agent_reviews")
    .select("*")
    .order("scraped_at", { ascending: false })
    .limit(100);

  if (source) query = query.eq("source", source);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}
