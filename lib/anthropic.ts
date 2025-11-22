import Anthropic from "@anthropic-ai/sdk";

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

export async function callClaude(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt?: string
): Promise<string> {
  const client = getAnthropicClient();
  
  if (!client) {
    // Return mock response if API key is missing
    return `Mock response: ${messages[messages.length - 1]?.content || "No message"}`;
  }

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages as any,
    });

    return response.content[0].type === "text" 
      ? response.content[0].text 
      : "No text content in response";
  } catch (error) {
    console.error("Anthropic API error:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

