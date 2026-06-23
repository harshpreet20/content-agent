"use client";

interface Competitor {
  handle: string;
  postCount: number;
  avgLikes: number;
  totalLikes: number;
}

const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-teal-500 to-cyan-600",
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function CompetitorBar({ competitors }: { competitors: Competitor[] }) {
  if (!competitors?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {competitors.map((c, i) => (
        <div
          key={c.handle}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow flex items-center gap-4"
        >
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
            {c.handle[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 text-sm truncate">@{c.handle}</div>
            <div className="text-gray-400 text-xs mt-0.5">{c.postCount} posts</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-gray-900">{formatNumber(c.avgLikes)}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">avg likes</div>
          </div>
        </div>
      ))}
    </div>
  );
}
