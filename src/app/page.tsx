"use client";

import { useEffect, useState } from "react";
import AgentCard from "@/components/AgentCard";
import StatsBar from "@/components/StatsBar";
import CompetitorBar from "@/components/CompetitorBar";

const AGENTS = [
  {
    name: "Ideator",
    description: "Scouts trending ideas from your niche & competitors",
    icon: "💡",
    color: "#F59E0B",
    endpoint: "/api/agents/ideator",
  },
  {
    name: "Hook & Script",
    description: "Writes scroll-stopping hooks and reel scripts",
    icon: "🎬",
    color: "#EC4899",
    endpoint: "/api/agents/hooks",
  },
  {
    name: "Planner",
    description: "Plans your 7-day content calendar",
    icon: "📅",
    color: "#8B5CF6",
    endpoint: "/api/agents/planner",
  },
  {
    name: "Analyst",
    description: "Deep-dives your stats and competitor performance",
    icon: "📊",
    color: "#10B981",
    endpoint: "/api/agents/analyst",
  },
  {
    name: "DM Manager",
    description: "Crafts DM templates for engagement & outreach",
    icon: "💬",
    color: "#3B82F6",
    endpoint: "/api/agents/dm-manager",
  },
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Content Agent Dashboard
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          @racquetsclubcommunity &mdash; powered by 5 AI agents
        </p>
        {data?.scrapedAt && (
          <p className="text-gray-600 text-sm mt-1">
            Last scraped: {new Date(data.scrapedAt).toLocaleString()}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* My Stats */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Your Stats</h2>
            <StatsBar stats={data?.me || null} />
          </section>

          {/* Competitors */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Competitors</h2>
            <CompetitorBar competitors={data?.competitors || []} />
          </section>

          {/* Agents */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Your Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AGENTS.map((agent) => (
                <AgentCard key={agent.name} {...agent} />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
