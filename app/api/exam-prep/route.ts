import { NextRequest, NextResponse } from "next/server";
import { callAI, isDemoMode, type AIModel } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { text, model } = await req.json() as { text: string; model: AIModel };

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json({
        flashcards: [
          { front: "What is the main topic of this document?", back: "The document covers key concepts that will be important for your exam. Upload a real document to get specific flashcards." },
          { front: "What are the key terms to remember?", back: "Add your API key and upload your document to generate real flashcards based on your specific content." },
        ],
        topics: [
          { topic: "Document Content", importance: "high", summary: "Add your OpenAI or Gemini API key in .env.local to generate real topics from your document." },
        ],
        qa: [
          { q: "How do I get real exam prep?", a: "Add OPENAI_API_KEY or GEMINI_API_KEY to your .env.local file, restart the server, then upload your document." },
        ],
      });
    }

    const result = await callAI([
      {
        role: "system",
        content: `You are an expert study assistant. Analyze the provided document and return a JSON object with exactly this structure (no markdown, pure JSON):
{
  "flashcards": [{"front": "question or term", "back": "answer or definition"}],
  "topics": [{"topic": "topic name", "importance": "high|medium|low", "summary": "1-2 sentence summary"}],
  "qa": [{"q": "likely exam question", "a": "thorough answer"}]
}
Generate:
- 8-12 flashcards covering key concepts, definitions, dates, formulas
- 5-8 key topics with importance ratings
- 4-6 likely exam Q&As with detailed answers
Base everything strictly on the document content provided.`,
      },
      {
        role: "user",
        content: `Create exam preparation material from this document:\n\n${text.slice(0, 8000)}`,
      },
    ], model);

    let parsed;
    try {
      const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid format. Try again or use a different model." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      flashcards: parsed.flashcards ?? [],
      topics: parsed.topics ?? [],
      qa: parsed.qa ?? [],
    });
  } catch (error) {
    const err = error as Error;
    console.error("Exam prep error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
