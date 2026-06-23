"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AGENT_META: Record<string, { icon: string; color: string; label: string }> = {
  ideator: { icon: "💡", color: "#D97706", label: "Ideator" },
  hooks: { icon: "🎬", color: "#DB2777", label: "Hook & Script" },
  planner: { icon: "📅", color: "#7C3AED", label: "Planner" },
  analyst: { icon: "📊", color: "#059669", label: "Analyst" },
  "dm-manager": { icon: "💬", color: "#2563EB", label: "DM Manager" },
};

interface Report {
  id: string;
  agent_name: string;
  result: string;
  created_at: string;
}

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const params = filter === "all" ? "" : `?agent=${filter}`;
    fetch(`/api/reports${params}`)
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-black bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
              Content Agent
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 font-semibold">Reports</span>
          </div>
          <Link
            href="/"
            className="text-sm text-violet-600 font-semibold hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === "all"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Reports
          </button>
          {Object.entries(AGENT_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                filter === key
                  ? "text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
              style={filter === key ? { backgroundColor: meta.color } : {}}
            >
              <span>{meta.icon}</span>
              {meta.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-400">
              Run an agent from the{" "}
              <Link href="/" className="text-violet-600 hover:underline">dashboard</Link>{" "}
              to generate your first report.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const meta = AGENT_META[report.agent_name] || { icon: "🤖", color: "#6B7280", label: report.agent_name };
              const isExpanded = expandedId === report.id;

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: meta.color + "15" }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{meta.label}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(report.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="mt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-5 max-h-[500px] overflow-y-auto">
                        {report.result}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
