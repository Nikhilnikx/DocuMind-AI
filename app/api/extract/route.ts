import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // allow up to 60s for large files

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";
    let meta: Record<string, unknown> = {};

    // ── TXT ──────────────────────────────────────────────────────────────────
    if (ext === "txt") {
      text = new TextDecoder("utf-8").decode(bytes);

    // ── DOC / DOCX ───────────────────────────────────────────────────────────
    } else if (ext === "docx" || ext === "doc") {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (err) {
        console.error("DOCX error:", err);
        return NextResponse.json({ error: "Could not read Word document." }, { status: 422 });
      }

    // ── XLS / XLSX ───────────────────────────────────────────────────────────
    } else if (ext === "xlsx" || ext === "xls" || ext === "csv") {
      try {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheets: string[] = [];
        workbook.SheetNames.forEach((name) => {
          const sheet = workbook.Sheets[name];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          sheets.push(`=== Sheet: ${name} ===\n${csv}`);
        });
        text = sheets.join("\n\n");
        meta = { sheets: workbook.SheetNames, type: "spreadsheet" };
      } catch (err) {
        console.error("Excel error:", err);
        return NextResponse.json({ error: "Could not read Excel file." }, { status: 422 });
      }

    // ── PPT / PPTX ───────────────────────────────────────────────────────────
    } else if (ext === "pptx" || ext === "ppt") {
      try {
        const { parseOffice } = await import("officeparser");
        // parseOffice returns OfficeParserAST but resolves to string content
        const result = await parseOffice(buffer);
        text = typeof result === "string" ? result : JSON.stringify(result);
        meta = { type: "presentation" };
      } catch (err) {
        console.error("PPT error:", err);
        return NextResponse.json({ error: "Could not read PowerPoint file." }, { status: 422 });
      }

    // ── PDF (server fallback — client OCR is primary) ─────────────────────────
    } else if (ext === "pdf") {
      try {
        const pdfLib = await import("pdf-parse");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const PDFParse = (pdfLib as any).PDFParse as (b: Buffer) => Promise<{ text: string; numpages: number }>;
        if (typeof PDFParse !== "function") throw new Error("Not a function");
        const data = await PDFParse(buffer);
        text = data.text ?? "";
        meta = { pages: data.numpages };
        if (!text.trim()) {
          return NextResponse.json(
            { error: "PDF has no selectable text — use client OCR.", useOCR: true },
            { status: 422 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "PDF parsing failed — use client OCR.", useOCR: true },
          { status: 422 }
        );
      }

    } else {
      return NextResponse.json(
        { error: `Unsupported format ".${ext}". Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT.` },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "No readable text found in the file." }, { status: 422 });
    }

    return NextResponse.json({
      text: text.slice(0, 120000),
      charCount: text.length,
      fileName: file.name,
      fileType: ext,
      meta,
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json({ error: "Extraction failed." }, { status: 500 });
  }
}
