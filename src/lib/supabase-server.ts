import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function saveReport(agentName: string, result: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("content_agent_reports").insert({
    agent_name: agentName,
    result,
  });
  if (error) console.error("Failed to save report:", error.message);
}
