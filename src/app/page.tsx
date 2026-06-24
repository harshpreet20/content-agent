"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AgentCard from "@/components/AgentCard";
import StatsBar from "@/components/StatsBar";
import CompetitorBar from "@/components/CompetitorBar";
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
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/data")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/rcc-crest.webp" alt="RCC" className="w-[60px] h-[60px] rounded-full object-cover shadow-sm" />
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                ContentAgent
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/" className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg">
                Dashboard
              </Link>
              <Link href="/reports" className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition">
                Reports
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-400 font-medium">
              @racquetsclubcommunity
            </span>
            {!authLoading && (
              user ? (
                <button
                  onClick={signOut}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium transition"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition"
                >
                  Sign in
                </Link>
              )
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user ? user.email?.[0].toUpperCase() : "R"}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-5 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Page title */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Dashboard</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Your content performance at a glance
                {data?.scrapedAt && (
                  <> &middot; Updated {new Date(data.scrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                )}
              </p>
            </div>

            {/* Stats row */}
            <section>
              <StatsBar stats={data?.me || null} />
            </section>

            {/* Competitors */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Competitors</h3>
              </div>
              <CompetitorBar competitors={data?.competitors || []} />
            </section>

            {/* Agents */}
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
