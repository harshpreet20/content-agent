import { NextResponse } from "next/server";
import { loadData, getMyStats, getCompetitorStats } from "@/lib/data";

export async function GET() {
  const data = loadData();
  if (!data) {
    return NextResponse.json({ error: "No data found. Run: npm run scrape" }, { status: 404 });
  }
  return NextResponse.json({
    scrapedAt: data.scrapedAt,
    me: getMyStats(data),
    competitors: getCompetitorStats(data),
  });
}
