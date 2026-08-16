import { NextRequest, NextResponse } from "next/server";
import { callAI, isDemoMode, type AIModel } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { text, model, numQuestions } = await req.json() as {
      text: string;
      model: AIModel;
      numQuestions: number;
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const count = Math.min(Math.max(numQuestions ?? 5, 1), 20);

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json({
        questions: [
          {
            id: 1,
            question: "This is a demo question — add your API key to generate real questions from your document.",
            options: [
              { label: "A", text: "Add OPENAI_API_KEY to .env.local" },
              { label: "B", text: "Add GEMINI_API_KEY to .env.local" },
              { label: "C", text: "Either A or B works" },
              { label: "D", text: "No key needed" },
            ],
            answer: "C",
            explanation: "Add either OPENAI_API_KEY or GEMINI_API_KEY to your .env.local file, then restart the dev server to generate real questions from your uploaded document.",
          },
        ],
      });
    }

    const result = await callAI([
      {
        role: "system",
        content: `You are an expert quiz generator. Generate exactly ${count} multiple-choice questions from the provided text.
Return ONLY a valid JSON array with no markdown or extra text:
[{"id":1,"question":"...","options":[{"label":"A","text":"..."},{"label":"B","text":"..."},{"label":"C","text":"..."},{"label":"D","text":"..."}],"answer":"A","explanation":"..."}]
Rules:
- Questions must be based strictly on the document content
- Test understanding, not just memorization
- Mix easy, medium, and hard questions
- Explanations must cite specific document content`,
      },
      {
        role: "user",
        content: `Generate ${count} MCQ questions from this document:\n\n${text.slice(0, 8000)}`,
      },
    ], model);

    let questions;
    try {
      const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      // Handle both array and object with questions key
      const parsed = JSON.parse(cleaned);
      questions = Array.isArray(parsed) ? parsed : parsed.questions ?? [];
    } catch {
      return NextResponse.json(
        { error: "AI returned an invalid format. Try again or switch models." },
        { status: 422 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    const err = error as Error;
    console.error("Quiz error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
