"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const PIE_COLORS = ["#F59E0B", "#EC4899", "#8B5CF6", "#10B981", "#3B82F6", "#6366F1", "#EF4444", "#14B8A6"];

interface AccountData {
  username: string;
  name: string;
  followers: number;
  following: number;
  posts: number;
  profilePicture: string;
  bio: string;
}

interface MediaItem {
  id: string;
  caption: string;
  media_type: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  permalink: string;
  insights: Record<string, number>;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [insights, setInsights] = useState<Record<string, number>>({});
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [demographics, setDemographics] = useState<Record<string, any[]>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    loadAnalytics();
  }, [user]);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const [insightsRes, mediaRes, demoRes, historyRes] = await Promise.all([
        fetch("/api/instagram/insights").then((r) => r.json()),
        fetch("/api/instagram/media?limit=15").then((r) => r.json()),
        fetch("/api/instagram/demographics").then((r) => r.json()),
        fetch("/api/reports?agent=__analytics_history").then(() =>
          fetch("/api/instagram/history").then((r) => r.json()).catch(() => ({ history: [] }))
        ).catch(() => ({ history: [] })),
      ]);

      if (insightsRes.error) throw new Error(insightsRes.error);
      setAccount(insightsRes.account);
      setInsights(insightsRes.insights);
      setMedia(mediaRes.media || []);
      setDemographics(demoRes.demographics || {});
      setHistory(Array.isArray(historyRes) ? historyRes : historyRes?.history || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const json = await res.json();
      if (json.success) await loadAnalytics();
      else setError(json.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const topByReach = [...media]
    .sort((a, b) => (b.insights.reach || 0) - (a.insights.reach || 0))
    .slice(0, 8);

  const mediaChartData = topByReach.map((m) => ({
    name: (m.caption || "").slice(0, 20) + "...",
    reach: m.insights.reach || 0,
    impressions: m.insights.impressions || 0,
    likes: m.like_count || m.insights.likes || 0,
    saves: m.insights.saved || 0,
  }));

  const demoKey = Object.keys(demographics).find((k) => k.includes("city")) ||
    Object.keys(demographics).find((k) => k.includes("country")) ||
    Object.keys(demographics)[0];
  const demoData = demoKey ? (demographics[demoKey] || []).slice(0, 8) : [];

  const ageKey = Object.keys(demographics).find((k) => k.includes("age"));
  const ageData = ageKey ? (demographics[ageKey] || []) : [];

  const genderKey = Object.keys(demographics).find((k) => k.includes("gender"));
  const genderData = genderKey ? (demographics[genderKey] || []) : [];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <img src="/rcc-crest.webp" alt="RCC" className="w-[60px] h-[60px] rounded-full object-cover shadow-sm" />
              <span className="text-lg font-extrabold bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                ContentAgent
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/" className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition">
                Dashboard
              </Link>
              <Link href="/reports" className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition">
                Reports
              </Link>
              <Link href="/analytics" className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg">
                Analytics
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Instagram Analytics</h2>
            <p className="text-sm text-gray-400 mt-0.5">Real-time insights from Instagram Graph API</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition active:scale-[0.98] shadow-sm disabled:opacity-60"
          >
            <svg className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
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
            {/* Account overview cards */}
            {account && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: "Followers", value: account.followers?.toLocaleString(), color: "#EC4899", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
                  { label: "Following", value: account.following?.toLocaleString(), color: "#8B5CF6", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
                  { label: "Total Posts", value: account.posts?.toLocaleString(), color: "#F59E0B", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                  { label: "Reach", value: (insights.reach || 0).toLocaleString(), color: "#10B981", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
                  { label: "Impressions", value: (insights.impressions || 0).toLocaleString(), color: "#3B82F6", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "14" }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={stat.color} strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Top posts by reach */}
            {mediaChartData.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Top Posts by Reach</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mediaChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                      <Bar dataKey="reach" fill="#10B981" radius={[6, 6, 0, 0]} name="Reach" />
                      <Bar dataKey="impressions" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Impressions" />
                      <Bar dataKey="saves" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Saves" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Demographics row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location / top demographic */}
              {demoData.length > 0 && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Audience - Top Locations</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={demoData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={55} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                        <Bar dataKey="value" fill="#EC4899" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Age or Gender */}
              {(genderData.length > 0 || ageData.length > 0) && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    {genderData.length > 0 ? "Audience - Gender" : "Audience - Age"}
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData.length > 0 ? genderData : ageData}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {(genderData.length > 0 ? genderData : ageData).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
            </div>

            {/* Media detail table */}
            {media.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Recent Posts Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Post</th>
                        <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Type</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Likes</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Comments</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Reach</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Impressions</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase">Saves</th>
                      </tr>
                    </thead>
                    <tbody>
                      {media.map((m, i) => (
                        <tr key={m.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/30" : ""}`}>
                          <td className="py-3 px-2">
                            <a href={m.permalink} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline font-medium">
                              {(m.caption || "No caption").slice(0, 35)}...
                            </a>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.media_type === "VIDEO" ? "bg-pink-50 text-pink-600" :
                              m.media_type === "CAROUSEL_ALBUM" ? "bg-violet-50 text-violet-600" :
                              "bg-amber-50 text-amber-600"
                            }`}>
                              {m.media_type === "CAROUSEL_ALBUM" ? "Carousel" : m.media_type === "VIDEO" ? "Reel" : "Image"}
                            </span>
                          </td>
                          <td className="text-right py-3 px-2 font-semibold">{m.like_count}</td>
                          <td className="text-right py-3 px-2">{m.comments_count}</td>
                          <td className="text-right py-3 px-2 font-semibold text-green-600">{(m.insights.reach || 0).toLocaleString()}</td>
                          <td className="text-right py-3 px-2">{(m.insights.impressions || 0).toLocaleString()}</td>
                          <td className="text-right py-3 px-2 text-violet-600">{(m.insights.saved || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Empty state for demographics */}
            {demoData.length === 0 && genderData.length === 0 && ageData.length === 0 && !loading && (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-400">Demographics data may take time to populate. Hit "Sync Now" to fetch latest data.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
