import { NextRequest, NextResponse } from "next/server";
import { callAI, isDemoMode, type AIModel } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { text, model, length } = await req.json() as {
      text: string;
      model: AIModel;
      length: "brief" | "detailed" | "bullet";
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 700));
      return NextResponse.json({
        summary: `## Demo Mode

**Your document was received** (${text.length.toLocaleString()} characters).

### To get a real AI summary:
1. Add \`OPENAI_API_KEY\` or \`GEMINI_API_KEY\` to your \`.env.local\` file
2. Restart the dev server with \`npm run dev\`
3. Upload your document and click Generate Summary again

Your document text has been extracted successfully and is ready to be summarized once you add an API key.`,
      });
    }

    const lengthPrompts: Record<string, string> = {
      brief: "Write a concise 2-3 sentence summary capturing the most important points.",
      detailed: "Write a detailed structured summary with sections for: Main Topic, Key Points, Important Details, and Conclusions. Use markdown formatting with ## headers and bullet points.",
      bullet: "Extract all key points as a bulleted list organized by topic. Use ## for main categories and - for bullet points. Be comprehensive.",
    };

    const result = await callAI([
      {
        role: "system",
        content: `You are a professional document analyst. ${lengthPrompts[length] ?? lengthPrompts.detailed}
Format your response with clear markdown: use ## for main headers, ### for sub-headers, **bold** for key terms, and - for bullet points.`,
      },
      {
        role: "user",
        content: `Summarize this document:\n\n${text.slice(0, 10000)}`,
      },
    ], model);

    return NextResponse.json({ summary: result.content });
  } catch (error) {
    const err = error as Error;
    console.error("Summarize error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
