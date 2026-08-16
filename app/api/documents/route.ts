import { NextRequest, NextResponse } from "next/server";

// Mock data — replace with Supabase queries in production
const mockDocuments = [
  {
    id: "1",
    name: "Q3 product strategy.pdf",
    file_type: "pdf",
    size: 2400000,
    pages: 18,
    status: "ready",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user_id: "user_1",
  },
  {
    id: "2",
    name: "Customer onboarding.docx",
    file_type: "docx",
    size: 540000,
    pages: 7,
    status: "ready",
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    user_id: "user_1",
  },
  {
    id: "3",
    name: "Market research.txt",
    file_type: "txt",
    size: 120000,
    pages: 4,
    status: "processing",
    created_at: new Date("2024-10-24").toISOString(),
    user_id: "user_1",
  },
];

export async function GET(req: NextRequest) {
  try {
    // In production: query Supabase for user's documents
    // const supabase = createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // const { data } = await supabase.from('documents').select('*').eq('user_id', user.id);

    return NextResponse.json({ documents: mockDocuments });
  } catch (error) {
    console.error("Documents fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // In production: delete from Supabase
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
