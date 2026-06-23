import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function saveReport(agentName: string, result: string): Promise<string | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("content_agent_reports")
    .insert({ agent_name: agentName, result })
    .select("id")
    .single();
  if (error) {
    console.error("Failed to save report:", error.message);
    return null;
  }
  return data?.id || null;
}
