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
  const [runTime, setRunTime] = useState<number | null>(null);

  async function runAgent() {
    setLoading(true);
    setError(null);
    setResult(null);
    setRunTime(null);
    const start = Date.now();
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const json = await res.json();
      setRunTime(Math.round((Date.now() - start) / 1000));
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex flex-col">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm"
            style={{ backgroundColor: bgColor }}
          >
            {icon}
          </div>
          {result && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full" style={{ color, backgroundColor: bgColor }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              Done{runTime ? ` ${runTime}s` : ""}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-gray-900 leading-tight">{name}</h3>
        <p className="text-gray-400 text-sm mt-0.5 leading-snug">{description}</p>
      </div>

      {/* Output area */}
      {(error || result) && (
        <div className="px-5 pb-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs leading-relaxed">
              {error}
            </div>
          )}
          {result && (
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap font-mono">
              {result}
            </div>
          )}
        </div>
      )}

      {/* Action */}
      <div className="p-5 pt-0 mt-auto">
        <button
          onClick={runAgent}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 active:scale-[0.98]"
          style={{
            backgroundColor: loading ? bgColor : color,
            color: loading ? color : "#fff",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Thinking...
            </span>
          ) : result ? (
            "Run Again"
          ) : (
            "Run Agent"
          )}
        </button>
      </div>
    </div>
  );
}
