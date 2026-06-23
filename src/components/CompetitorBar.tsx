"use client";

interface Competitor {
  handle: string;
  postCount: number;
  avgLikes: number;
  totalLikes: number;
}

export default function CompetitorBar({ competitors }: { competitors: Competitor[] }) {
  if (!competitors?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {competitors.map((c) => (
        <div key={c.handle} className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            {c.handle[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-white">@{c.handle}</div>
            <div className="text-gray-400 text-xs">{c.postCount} posts &middot; avg {c.avgLikes.toLocaleString()} likes</div>
          </div>
        </div>
      ))}
    </div>
  );
}
