import { NextResponse } from "next/server";
import { getMediaWithInsights } from "@/lib/instagram";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "15");

  try {
    const media = await getMediaWithInsights(Math.min(limit, 25));
    return NextResponse.json({ media });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
