export type AIModel = "gpt-4o-mini" | "gpt-4o" | "gemini-1.5-flash" | "gemini-1.5-pro";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  model: AIModel;
}

function getProvider(model: AIModel): "openai" | "gemini" {
  return model.startsWith("gemini") ? "gemini" : "openai";
}

async function callOpenAI(
  messages: AIMessage[],
  model: AIModel,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI error: ${err?.error?.message ?? res.statusText}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? "";
}

async function callGemini(
  messages: AIMessage[],
  model: AIModel,
  apiKey: string
): Promise<string> {
  // Convert OpenAI-style messages to Gemini format
  const systemMsg = messages.find((m) => m.role === "system")?.content ?? "";
  const conversationMsgs = messages.filter((m) => m.role !== "system");

  const contents = conversationMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const geminiModel = model === "gemini-1.5-pro" ? "gemini-1.5-pro" : "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = { contents };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini error: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function callAI(
  messages: AIMessage[],
  model: AIModel
): Promise<AIResponse> {
  const provider = getProvider(model);

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API key not configured.");
    const content = await callOpenAI(messages, model, apiKey);
    return { content, model };
  } else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key not configured.");
    const content = await callGemini(messages, model, apiKey);
    return { content, model };
  }
}

// Demo fallback when no API keys are set
export function isDemoMode(): boolean {
  const openai = process.env.OPENAI_API_KEY;
  const gemini = process.env.GEMINI_API_KEY;
  return (!openai || openai.trim() === "") && (!gemini || gemini.trim() === "");
}

export function hasOpenAI(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!(key && key.trim() !== "");
}

export function hasGemini(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!(key && key.trim() !== "");
}
