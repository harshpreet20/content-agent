"use client";

interface Competitor {
  handle: string;
  postCount: number;
  avgLikes: number;
  totalLikes: number;
}

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
];

export default function CompetitorBar({ competitors }: { competitors: Competitor[] }) {
  if (!competitors?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {competitors.map((c, i) => (
        <div
          key={c.handle}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div
            className={`w-11 h-11 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}
          >
            {c.handle[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">@{c.handle}</div>
            <div className="text-gray-400 text-sm">
              {c.postCount} posts &middot; {c.avgLikes.toLocaleString()} avg likes
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
