import { NextRequest, NextResponse } from "next/server";
import { callAI, isDemoMode, type AIModel } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { text, fileName, model } = await req.json() as {
      text: string; fileName: string; model: AIModel;
    };

    if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json({
        report: {
          documentName: fileName ?? "Document",
          generatedAt: new Date().toISOString(),
          summary: "Add OPENAI_API_KEY or GEMINI_API_KEY to .env.local to generate a real report from your document.",
          keyPoints: ["API key not configured — add it to .env.local", "Restart the server after adding the key", "Upload your document and regenerate"],
          quiz: [{ question: "How do I enable AI features?", answer: "Add OPENAI_API_KEY or GEMINI_API_KEY to .env.local and restart the dev server." }],
          examTopics: [{ topic: "API Configuration", importance: "high", detail: "Add your API key to enable all AI features." }],
          insights: ["This is a demo report. Add an API key to generate real insights from your document."],
        },
      });
    }

    const prompt = `Analyze this document and return a JSON object (no markdown, pure JSON) with exactly this structure:
{
  "summary": "2-3 paragraph summary of the entire document",
  "keyPoints": ["point 1", "point 2", ...],
  "quiz": [{"question": "...", "answer": "..."}],
  "examTopics": [{"topic": "...", "importance": "high|medium|low", "detail": "1-2 sentences"}],
  "insights": ["insight 1", "insight 2", ...]
}
Rules:
- summary: comprehensive 2-3 paragraphs
- keyPoints: 8-12 most important points
- quiz: 6-8 Q&A pairs testing comprehension
- examTopics: 5-8 topics with importance ratings
- insights: 4-6 deeper analytical observations`;

    const result = await callAI([
      { role: "system", content: prompt },
      { role: "user", content: `Document: "${fileName}"\n\n${text.slice(0, 12000)}` },
    ], model);

    let parsed;
    try {
      const clean = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "AI returned invalid format. Try again." }, { status: 422 });
    }

    return NextResponse.json({
      report: {
        documentName: fileName,
        generatedAt: new Date().toISOString(),
        summary: parsed.summary ?? "",
        keyPoints: parsed.keyPoints ?? [],
        quiz: parsed.quiz ?? [],
        examTopics: parsed.examTopics ?? [],
        insights: parsed.insights ?? [],
      },
    });
  } catch (err) {
    const e = err as Error;
    console.error("Report error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
