"use client";

interface StatProps {
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

function Stat({ label, value, color, bgColor }: StatProps) {
  return (
    <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: bgColor }}>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold mt-1">{label}</div>
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Stat label="Posts" value={stats.postCount} color="#D97706" bgColor="#FFFBEB" />
      <Stat label="Avg Likes" value={stats.avgLikes} color="#DB2777" bgColor="#FDF2F8" />
      <Stat label="Avg Comments" value={stats.avgComments} color="#7C3AED" bgColor="#F5F3FF" />
      <Stat label="Total Likes" value={stats.totalLikes.toLocaleString()} color="#059669" bgColor="#ECFDF5" />
      <Stat label="Total Views" value={stats.totalViews.toLocaleString()} color="#2563EB" bgColor="#EFF6FF" />
    </div>
  );
}
