import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("content_agent_analytics")
      .select("*")
      .eq("metric_type", "account")
      .order("fetched_at", { ascending: true })
      .limit(90);

    if (error) throw new Error(error.message);

    const history = (data || []).map((row: any) => ({
      date: new Date(row.fetched_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      followers: row.data?.followers || 0,
      posts: row.data?.posts || 0,
    }));

    return NextResponse.json({ history });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
