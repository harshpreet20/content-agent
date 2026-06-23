"use client";

import { useState } from "react";

interface AgentCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  endpoint: string;
}

export default function AgentCard({ name, description, icon, color, bgColor, endpoint }: AgentCardProps) {
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: bgColor }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>

        <button
          onClick={runAgent}
          disabled={loading}
          className="w-full mt-4 py-3 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: color }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Agent thinking...
            </span>
          ) : (
            "Run Agent"
          )}
        </button>
      </div>

      {error && (
        <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="border-t border-gray-100 p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Agent Output
          </div>
          <div className="text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap bg-gray-50 rounded-xl p-4">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
