import { NextRequest, NextResponse } from "next/server";
import { callAI, isDemoMode, type AIModel, type AIMessage } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, model, documentContext, chatHistory } = body as {
      message: string;
      model?: AIModel;
      documentContext?: string;
      chatHistory?: { role: "user" | "assistant"; content: string }[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const selectedModel: AIModel = model ?? "gpt-4o-mini";

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({
        message: {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: documentContext
            ? `I can see your document (${Math.round(documentContext.length / 1000)}k characters). To get real AI answers, add OPENAI_API_KEY or GEMINI_API_KEY to .env.local and restart the server.`
            : "Add OPENAI_API_KEY or GEMINI_API_KEY to .env.local to enable AI responses. Upload a document using the 📎 button first.",
          sources: [],
        },
      });
    }

    // Build system prompt — include document text if provided
    let systemPrompt = `You are DocuMind, an intelligent AI document assistant.
Answer questions clearly and concisely based on the document provided.
Always cite specific parts of the document when relevant.
If the answer is not in the document, say so clearly.`;

    if (documentContext?.trim()) {
      systemPrompt += `\n\n=== DOCUMENT CONTENT ===\n${documentContext.slice(0, 15000)}\n=== END DOCUMENT ===`;
    }

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      ...(chatHistory ?? []).slice(-10),
      { role: "user", content: message },
    ];

    const result = await callAI(messages, selectedModel);

    return NextResponse.json({
      message: {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: result.content,
        sources: [],
        model: result.model,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Chat error:", err.message);
    const isKeyError = err.message?.includes("API key") || err.message?.includes("not configured");
    return NextResponse.json({
      message: {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: isKeyError
          ? `⚠️ ${err.message}\n\nAdd your API key to .env.local and restart the server.`
          : "Something went wrong. Please try again.",
        sources: [],
      },
    });
  }
}
