"use client";

interface StatProps {
  label: string;
  value: string | number;
  color: string;
}

function Stat({ label, value, color }: StatProps) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      <div className="text-gray-400 text-xs uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

interface StatsBarProps {
  stats: {
    handle: string;
    postCount: number;
    avgLikes: number;
    avgComments: number;
    totalLikes: number;
    totalViews: number;
  } | null;
}

export default function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
      <Stat label="Posts" value={stats.postCount} color="#F59E0B" />
      <Stat label="Avg Likes" value={stats.avgLikes} color="#EC4899" />
      <Stat label="Avg Comments" value={stats.avgComments} color="#8B5CF6" />
      <Stat label="Total Likes" value={stats.totalLikes.toLocaleString()} color="#10B981" />
      <Stat label="Total Views" value={stats.totalViews.toLocaleString()} color="#3B82F6" />
    </div>
  );
}
