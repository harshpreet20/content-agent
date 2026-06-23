"use client";

import { useState } from "react";

interface AgentCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  endpoint: string;
}

export default function AgentCard({ name, description, icon, color, endpoint }: AgentCardProps) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAgent() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setResult(json.result);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] hover:shadow-2xl"
      style={{
        borderColor: color,
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-xl font-bold" style={{ color }}>{name}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      <button
        onClick={runAgent}
        disabled={loading}
        className="w-full mt-3 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
        style={{ backgroundColor: color }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Running...
          </span>
        ) : (
          "Run Agent"
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-3 p-4 bg-black/30 rounded-xl text-sm text-gray-200 max-h-80 overflow-y-auto whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
