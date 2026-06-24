"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";

interface Review {
  id: string;
  source: string;
  reviewer_name: string;
  rating: number;
  title: string;
  review_text: string;
  review_date: string;
  data: Record<string, any>;
  scraped_at: string;
}

function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <span className={size}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= rating ? "#F59E0B" : "#E5E7EB" }}>
          {"★"}
        </span>
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { user, status, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user && status && status !== "approved") router.push("/login");
  }, [user, authLoading, status, router]);

  async function loadReviews() {
    setLoading(true);
    try {
      const src = sourceFilter !== "all" ? `?source=${sourceFilter}` : "";
      const res = await fetch(`/api/reviews${src}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setReviews(json.reviews || []);
      setSummary(json.summary || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user || status !== "approved") return;
    loadReviews();
  }, [user, status, sourceFilter]);

  async function handleScrape(source: string) {
    setScraping(source);
    setError(null);
    try {
      const res = await fetch(`/api/reviews?source=${source}`, { method: "POST" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await loadReviews();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setScraping(null);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const positive = reviews.filter((r) => r.rating >= 4).length;
  const neutral = reviews.filter((r) => r.rating === 3).length;
  const negative = reviews.filter((r) => r.rating <= 2).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Nav active="/reviews" />

      <main className="max-w-5xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Reviews</h2>
            <p className="text-sm text-gray-400 mt-0.5">Trustpilot &amp; Google reviews for Racquets Club Community</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScrape("trustpilot")}
              disabled={!!scraping}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition active:scale-[0.98] shadow-sm disabled:opacity-60"
            >
              <svg className={`w-3.5 h-3.5 ${scraping === "trustpilot" ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {scraping === "trustpilot" ? "Scraping..." : "Trustpilot"}
            </button>
            <button
              onClick={() => handleScrape("google")}
              disabled={!!scraping}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition active:scale-[0.98] shadow-sm disabled:opacity-60"
            >
              <svg className={`w-3.5 h-3.5 ${scraping === "google" ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {scraping === "google" ? "Scraping..." : "Google"}
            </button>
          </div>
        </div>

        {/* Source filter tabs */}
        <div className="flex items-center gap-1 mb-6">
          {[
            { key: "all", label: "All Sources" },
            { key: "trustpilot", label: "Trustpilot" },
            { key: "google", label: "Google" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSourceFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                sourceFilter === tab.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Average Rating</div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">{summary.avgRating}</span>
                    <Stars rating={Math.round(summary.avgRating)} size="text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Total Reviews</div>
                  <div className="text-3xl font-extrabold text-gray-900">{summary.total}</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Positive</div>
                  <div className="text-3xl font-extrabold text-green-600">{positive}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">4-5 stars</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Needs Attention</div>
                  <div className="text-3xl font-extrabold text-red-500">{negative}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">1-2 stars</div>
                </div>
              </div>
            )}

            {/* Rating distribution */}
            {summary?.distribution && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Rating Distribution</h3>
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = summary.distribution[star] || 0;
                    const pct = summary.total > 0 ? (count / summary.total) * 100 : 0;
                    const barColor = star >= 4 ? "#10B981" : star === 3 ? "#F59E0B" : "#EF4444";
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-500 w-6 text-right">{star}</span>
                        <span className="text-amber-400">{"★"}</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                        </div>
                        <span className="text-xs font-medium text-gray-400 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review cards */}
            {reviews.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">{"⭐"}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
                <p className="text-sm text-gray-400">Click the Trustpilot or Google button to fetch your latest reviews.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Reviews</h3>
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">{review.reviewer_name}</span>
                          {review.data?.verified && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full">Verified</span>
                          )}
                        </div>
                        <Stars rating={review.rating} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">
                          {review.review_date ? new Date(review.review_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          review.source === "google"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {review.source === "google" ? "Google" : "Trustpilot"}
                        </span>
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{review.title}</h4>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
                    {(() => {
                      const raw = review.data?.reply || review.data?.response;
                      const text = typeof raw === "string" ? raw : raw?.text;
                      return text?.trim() ? (
                        <div className="mt-3 pl-4 border-l-2 border-amber-200 bg-amber-50/50 rounded-r-lg p-3">
                          <span className="text-[10px] font-bold text-amber-700 uppercase">Business Reply</span>
                          <p className="text-xs text-gray-600 mt-1">{text}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
