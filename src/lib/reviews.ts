import { ApifyClient } from "apify-client";
import { createServerClient } from "@/lib/supabase-server";

const TRUSTPILOT_URL = "https://www.trustpilot.com/review/racquetsclubcommunity.com";
const GOOGLE_MAPS_URL = process.env.GOOGLE_MAPS_URL || "https://share.google/LSBtuEj4pFJqCoBAh";

export async function startReviewScrapes() {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) throw new Error("Missing APIFY_API_TOKEN");

  const client = new ApifyClient({ token: apifyToken });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://content-agent-gamma.vercel.app";
  const webhookUrl = `${baseUrl}/api/review-webhook`;

  const [tpRun, gRun] = await Promise.all([
    client.actor("apify/trustpilot-scraper").start(
      { startUrls: [{ url: TRUSTPILOT_URL }], maxItems: 50 },
      { webhooks: [{ eventTypes: ["ACTOR.RUN.SUCCEEDED"], requestUrl: `${webhookUrl}?source=trustpilot` }] }
    ),
    client.actor("compass/google-maps-reviews-scraper").start(
      { startUrls: [{ url: GOOGLE_MAPS_URL }], maxReviews: 100, reviewsSort: "newest", language: "en" },
      { webhooks: [{ eventTypes: ["ACTOR.RUN.SUCCEEDED"], requestUrl: `${webhookUrl}?source=google` }] }
    ),
  ]);

  return { trustpilotRunId: tpRun.id, googleRunId: gRun.id };
}

export async function collectTrustpilotResults(runId: string) {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) throw new Error("Missing APIFY_API_TOKEN");

  const client = new ApifyClient({ token: apifyToken });
  const run = await client.run(runId).get();
  if (!run || run.status !== "SUCCEEDED") return { collected: 0 };

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return saveTrustpilotReviews(items);
}

export async function collectGoogleResults(runId: string) {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) throw new Error("Missing APIFY_API_TOKEN");

  const client = new ApifyClient({ token: apifyToken });
  const run = await client.run(runId).get();
  if (!run || run.status !== "SUCCEEDED") return { collected: 0 };

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return saveGoogleReviews(items);
}

async function saveTrustpilotReviews(items: any[]) {
  const reviews = items.map((item: any) => ({
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
  const newReviews = reviews.filter((r) => r.review_text && !existingTexts.has(r.review_text));

  if (newReviews.length > 0) {
    await supabase.from("content_agent_reviews").insert(
      newReviews.map((r) => ({ source: "trustpilot" as const, ...r }))
    );
  }

  return { collected: newReviews.length, total: reviews.length };
}

async function saveGoogleReviews(items: any[]) {
  const reviews = items.map((item: any) => ({
    reviewer_name: item.name || item.authorName || item.reviewer?.name || "Anonymous",
    rating: item.stars || item.rating || item.reviewRating || 0,
    title: "",
    review_text: item.text || item.reviewText || item.snippet || "",
    review_date: item.publishedAtDate || item.date || item.time || "",
    data: {
      reviewer_photo: item.reviewerPhotoUrl || item.authorPhoto || null,
      response: item.responseFromOwnerText || item.ownerResponse || null,
      likes: item.likesCount || 0,
      review_url: item.reviewUrl || null,
    },
  }));

  const supabase = createServerClient();
  const { data: existing } = await supabase
    .from("content_agent_reviews")
    .select("review_text")
    .eq("source", "google");

  const existingTexts = new Set((existing || []).map((r: any) => r.review_text));
  const newReviews = reviews.filter((r) => r.review_text && !existingTexts.has(r.review_text));

  if (newReviews.length > 0) {
    await supabase.from("content_agent_reviews").insert(
      newReviews.map((r) => ({ source: "google" as const, ...r }))
    );
  }

  return { collected: newReviews.length, total: reviews.length };
}

interface TrustpilotReview {
  reviewer_name: string;
  rating: number;
  title: string;
  review_text: string;
  review_date: string;
  data: Record<string, any>;
}

interface GoogleReview {
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
    { startUrls: [{ url: TRUSTPILOT_URL }], maxItems: 50 },
    { waitSecs: 120 }
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const result = await saveTrustpilotReviews(items);

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

  const allRatings = reviews.map((r) => r.rating).filter((r) => r > 0);
  const avgRating = allRatings.length > 0
    ? Math.round((allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10) / 10
    : 0;

  return {
    reviews,
    summary: { total: result.total, avgRating, newCount: result.collected },
  };
}

export async function scrapeGoogleReviews(): Promise<{
  reviews: GoogleReview[];
  summary: { total: number; avgRating: number; newCount: number };
}> {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) throw new Error("Missing APIFY_API_TOKEN");

  const client = new ApifyClient({ token: apifyToken });

  const run = await client.actor("compass/google-maps-reviews-scraper").call(
    { startUrls: [{ url: GOOGLE_MAPS_URL }], maxReviews: 100, reviewsSort: "newest", language: "en" },
    { waitSecs: 120 }
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const result = await saveGoogleReviews(items);

  const reviews: GoogleReview[] = items.map((item: any) => ({
    reviewer_name: item.name || item.authorName || item.reviewer?.name || "Anonymous",
    rating: item.stars || item.rating || item.reviewRating || 0,
    title: "",
    review_text: item.text || item.reviewText || item.snippet || "",
    review_date: item.publishedAtDate || item.date || item.time || "",
    data: {
      reviewer_photo: item.reviewerPhotoUrl || item.authorPhoto || null,
      response: item.responseFromOwnerText || item.ownerResponse || null,
      likes: item.likesCount || 0,
      review_url: item.reviewUrl || null,
    },
  }));

  const allRatings = reviews.map((r) => r.rating).filter((r) => r > 0);
  const avgRating = allRatings.length > 0
    ? Math.round((allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10) / 10
    : 0;

  return {
    reviews,
    summary: { total: result.total, avgRating, newCount: result.collected },
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
