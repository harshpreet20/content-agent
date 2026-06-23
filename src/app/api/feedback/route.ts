import { NextResponse } from "next/server";
import { saveFeedback } from "@/lib/micro-intel";

export async function POST(request: Request) {
  const body = await request.json();
  const { reportId, agentName, rating } = body;

  if (!reportId || !agentName || ![1, -1].includes(rating)) {
    return NextResponse.json(
      { error: "reportId, agentName, and rating (1 or -1) are required" },
      { status: 400 }
    );
  }

  try {
    await saveFeedback(reportId, agentName, rating);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
