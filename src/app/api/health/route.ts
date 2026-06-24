import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; latency?: number; error?: string }> = {};

  // Check Supabase
  const sbStart = Date.now();
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("content_agent_scrapes").select("id").limit(1);
    checks.database = error
      ? { status: "error", error: error.message, latency: Date.now() - sbStart }
      : { status: "ok", latency: Date.now() - sbStart };
  } catch (e: any) {
    checks.database = { status: "error", error: e.message, latency: Date.now() - sbStart };
  }

  // Check Anthropic API
  const aiStart = Date.now();
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    checks.anthropic = key
      ? { status: "ok", latency: Date.now() - aiStart }
      : { status: "error", error: "Missing ANTHROPIC_API_KEY" };
  } catch {
    checks.anthropic = { status: "error", latency: Date.now() - aiStart };
  }

  // Check Apify
  const apifyStart = Date.now();
  try {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      checks.scraper = { status: "error", error: "Missing APIFY_API_TOKEN" };
    } else {
      const res = await fetch("https://api.apify.com/v2/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      checks.scraper = res.ok
        ? { status: "ok", latency: Date.now() - apifyStart }
        : { status: "error", error: `Apify returned ${res.status}`, latency: Date.now() - apifyStart };
    }
  } catch (e: any) {
    checks.scraper = { status: "error", error: e.message, latency: Date.now() - apifyStart };
  }

  // Check latest scrape freshness
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("content_agent_scrapes")
      .select("scraped_at")
      .order("scraped_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const age = Date.now() - new Date(data.scraped_at).getTime();
      const hours = Math.round(age / (1000 * 60 * 60));
      checks.data_freshness = hours <= 24
        ? { status: "ok", latency: hours }
        : { status: "error", error: `Data is ${hours}h old` };
    } else {
      checks.data_freshness = { status: "error", error: "No scraped data" };
    }
  } catch {
    checks.data_freshness = { status: "error", error: "Could not check" };
  }

  // Check brain context
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("content_agent_analytics")
      .select("fetched_at")
      .eq("metric_type", "brain_context")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const age = Date.now() - new Date(data.fetched_at).getTime();
      checks.brain = age < 2 * 60 * 60 * 1000
        ? { status: "ok" }
        : { status: "error", error: "Stale (>2h)" };
    } else {
      checks.brain = { status: "error", error: "Not generated yet" };
    }
  } catch {
    checks.brain = { status: "error", error: "Could not check" };
  }

  const allOk = Object.values(checks).every((c) => c.status === "ok");

  return NextResponse.json({ healthy: allOk, checks });
}
