"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgentCard from "@/components/AgentCard";
import StatsBar from "@/components/StatsBar";
import CompetitorBar from "@/components/CompetitorBar";
import { useAuth } from "@/components/AuthProvider";

const AGENTS = [
  {
    name: "Ideator",
    description: "Scouts trending ideas from your niche",
    icon: "💡",
    color: "#D97706",
    bgColor: "#FFFBEB",
    endpoint: "/api/agents/ideator",
  },
  {
    name: "Hook & Script",
    description: "Writes scroll-stopping hooks & scripts",
    icon: "🎬",
    color: "#DB2777",
    bgColor: "#FDF2F8",
    endpoint: "/api/agents/hooks",
  },
  {
    name: "Planner",
    description: "Plans your 7-day content calendar",
    icon: "📅",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    endpoint: "/api/agents/planner",
  },
  {
    name: "Analyst",
    description: "Deep-dives your stats & performance",
    icon: "📊",
    color: "#059669",
    bgColor: "#ECFDF5",
    endpoint: "/api/agents/analyst",
  },
  {
    name: "DM Manager",
    description: "Crafts DM templates for outreach",
    icon: "💬",
    color: "#2563EB",
    bgColor: "#EFF6FF",
    endpoint: "/api/agents/dm-manager",
  },
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
            Content Agent
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/reports"
              className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition"
            >
              Reports
            </Link>
            <span className="text-sm text-gray-400">@racquetsclubcommunity</span>
            {!authLoading && (
              user ? (
                <button
                  onClick={signOut}
                  className="text-sm text-gray-400 hover:text-gray-600 transition"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-1.5 bg-violet-600 text-white text-sm rounded-lg font-semibold hover:bg-violet-700 transition"
                >
                  Sign In
                </Link>
              )
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {user ? user.email?.[0].toUpperCase() : "R"}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Your Performance</h2>
                {data?.scrapedAt && (
                  <span className="text-xs text-gray-400">
                    Updated {new Date(data.scrapedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <StatsBar stats={data?.me || null} />
            </section>

            {/* Competitors */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Competitors</h2>
              <CompetitorBar competitors={data?.competitors || []} />
            </section>

            {/* Agents */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Your Agents</h2>
                <Link
                  href="/reports"
                  className="text-sm text-violet-600 font-semibold hover:underline"
                >
                  View all reports &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AGENTS.map((agent) => (
                  <AgentCard key={agent.name} {...agent} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
