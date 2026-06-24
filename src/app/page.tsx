"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AgentCard from "@/components/AgentCard";
import StatsBar from "@/components/StatsBar";
import CompetitorBar from "@/components/CompetitorBar";
import StatusBar from "@/components/StatusBar";
import Nav from "@/components/Nav";
import { useAuth } from "@/components/AuthProvider";

const AGENTS = [
  {
    name: "Ideator",
    description: "Scout trending ideas from your niche & competitors",
    icon: "\u{1F4A1}",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    endpoint: "/api/agents/ideator",
  },
  {
    name: "Hook & Script",
    description: "Write scroll-stopping hooks and reel scripts",
    icon: "\u{1F3AC}",
    color: "#EC4899",
    bgColor: "#FDF2F8",
    endpoint: "/api/agents/hooks",
  },
  {
    name: "Planner",
    description: "Plan your 7-day content calendar",
    icon: "\u{1F4C5}",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    endpoint: "/api/agents/planner",
  },
  {
    name: "Analyst",
    description: "Deep-dive your stats and performance metrics",
    icon: "\u{1F4CA}",
    color: "#10B981",
    bgColor: "#ECFDF5",
    endpoint: "/api/agents/analyst",
  },
  {
    name: "DM Manager",
    description: "Craft DM templates for engagement & outreach",
    icon: "\u{1F4AC}",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    endpoint: "/api/agents/dm-manager",
  },
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState<string | null>(null);
  const { user, status, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user && status && status !== "approved") router.push("/login");
  }, [user, authLoading, status, router]);

  function loadDashboardData() {
    return fetch("/api/data")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!user || status !== "approved") return;
    loadDashboardData();
  }, [user, status]);

  async function handleRefresh() {
    setRefreshing(true);
    setScrapeMsg("Starting scrape...");
    try {
      const res = await fetch("/api/cron/scrape", { method: "POST" });
      const json = await res.json();
      if (json.error) {
        setScrapeMsg(`Error: ${json.error}`);
        setRefreshing(false);
        return;
      }
      setScrapeMsg("Scraping 9 profiles — this takes 2-4 min...");
      pollScrapeStatus();
    } catch (e: any) {
      setScrapeMsg(`Error: ${e.message}`);
      setRefreshing(false);
    }
  }

  async function pollScrapeStatus() {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 10_000));
      try {
        const res = await fetch("/api/scrape-status");
        const json = await res.json();
        if (json.status === "SUCCEEDED") {
          setScrapeMsg("Scrape complete!");
          await loadDashboardData();
          setTimeout(() => setScrapeMsg(null), 3000);
          setRefreshing(false);
          return;
        }
        if (json.status === "FAILED" || json.status === "ERROR") {
          setScrapeMsg(`Scrape failed: ${json.message || "Unknown error"}`);
          setRefreshing(false);
          return;
        }
        setScrapeMsg(`Scraping in progress... (${Math.round((i + 1) * 10 / 60)}m elapsed)`);
      } catch {
        // network blip, keep polling
      }
    }
    setScrapeMsg("Scrape is taking longer than expected. Check back later.");
    setRefreshing(false);
  }

  if (authLoading || !user || status !== "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Nav active="/" />

      <main className="max-w-6xl mx-auto px-5 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Dashboard</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Your content performance at a glance
                  {data?.scrapedAt && (
                    <> &middot; Updated {new Date(data.scrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</>
                  )}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition active:scale-[0.98] shadow-sm disabled:opacity-60"
              >
                <svg
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? "Scraping..." : "Refresh Data"}
              </button>
            </div>

            {scrapeMsg && (
              <div className={`p-3 rounded-xl text-sm font-medium ${
                scrapeMsg.startsWith("Error") || scrapeMsg.startsWith("Scrape failed")
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : scrapeMsg === "Scrape complete!"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}>
                {refreshing && !scrapeMsg.startsWith("Error") && (
                  <span className="inline-block w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                )}
                {scrapeMsg}
              </div>
            )}

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">System Status</h3>
              </div>
              <StatusBar />
            </section>

            <section>
              <StatsBar stats={data?.me || null} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Competitors</h3>
              </div>
              <CompetitorBar competitors={data?.competitors || []} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">AI Agents</h3>
                <Link
                  href="/reports"
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition"
                >
                  View history &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {AGENTS.map((agent) => (
                  <AgentCard key={agent.name} {...agent} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
