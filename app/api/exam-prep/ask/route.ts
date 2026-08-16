import { NextRequest, NextResponse } from "next/server";
import { callAI, isDemoMode, type AIModel } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { question, context, model } = await req.json() as {
      question: string;
      context: string;
      model: AIModel;
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json({
        answer: "To get real answers based on your document, add your OPENAI_API_KEY or GEMINI_API_KEY to .env.local and restart the server.",
      });
    }

    const result = await callAI([
      {
        role: "system",
        content: `You are a helpful study assistant. Answer the student's question based ONLY on the document context provided. 
Be clear, concise, and educational. If the answer is not in the document, say so.`,
      },
      {
        role: "user",
        content: `Document:\n${context.slice(0, 6000)}\n\nQuestion: ${question}`,
      },
    ], model);

    return NextResponse.json({ answer: result.content });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
