import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY in .env");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function askClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  const block = response.content[0];
  if (block.type === "text") return block.text;
  return "";
}
