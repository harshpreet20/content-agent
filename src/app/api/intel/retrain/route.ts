import { NextResponse } from "next/server";
import { retrain, getLearnings } from "@/lib/micro-intel";

export async function POST(request: Request) {
  const body = await request.json();
  const { agentName } = body;

  if (!agentName) {
    return NextResponse.json(
      { error: "agentName is required" },
      { status: 400 }
    );
  }

  try {
    await retrain(agentName);
    const learnings = await getLearnings(agentName);
    return NextResponse.json({ success: true, agentName, learnings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
