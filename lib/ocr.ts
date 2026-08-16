"use client";

export interface OCRProgress {
  stage: "loading" | "rendering" | "ocr" | "done";
  page: number;
  totalPages: number;
  percent: number;
  message: string;
}

export type ProgressCallback = (progress: OCRProgress) => void;

/** Extract text from a PDF — tries native text first page-by-page, falls back to OCR */
export async function extractPDFWithOCR(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({ stage: "loading", page: 0, totalPages: 0, percent: 3, message: "Loading PDF…" });

  const arrayBuffer = await file.arrayBuffer();

  // Dynamically import pdfjs
  const pdfjs = await import("pdfjs-dist");

  // Use local worker (copied to /public)
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  let pdf: Awaited<ReturnType<typeof pdfjs.getDocument>["promise"]>;
  try {
    pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  } catch (err) {
    throw new Error(`Failed to open PDF: ${err instanceof Error ? err.message : String(err)}`);
  }

  const totalPages = pdf.numPages;
  onProgress?.({
    stage: "rendering", page: 0, totalPages, percent: 8,
    message: `Found ${totalPages} page${totalPages !== 1 ? "s" : ""}…`,
  });

  // Check if page 1 has native text (quick probe)
  const firstPage = await pdf.getPage(1);
  const firstContent = await firstPage.getTextContent();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstText = firstContent.items.map((i: any) => i.str ?? "").join("").trim();
  const isDigitalPDF = firstText.length > 30;

  const pageTexts: string[] = [];

  if (isDigitalPDF) {
    // Fast path: extract native text from all pages
    for (let n = 1; n <= totalPages; n++) {
      const pct = Math.round(8 + (n / totalPages) * 88);
      onProgress?.({ stage: "rendering", page: n, totalPages, percent: pct, message: `Reading page ${n} of ${totalPages}…` });
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = content.items.map((i: any) => i.str ?? "").join(" ").trim();
      pageTexts.push(text);
    }
  } else {
    // Scanned PDF — render each page to canvas then OCR
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng", 1, { logger: () => {} });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    for (let n = 1; n <= totalPages; n++) {
      const pct = Math.round(8 + ((n - 1) / totalPages) * 88);
      onProgress?.({ stage: "ocr", page: n, totalPages, percent: pct, message: `Scanning page ${n} of ${totalPages}…` });

      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale: 2.0 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx, viewport } as any).promise;

      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => b ? res(b) : rej(new Error("Canvas empty")), "image/png")
      );
      const { data } = await worker.recognize(blob);
      pageTexts.push(data.text.trim());
    }

    await worker.terminate();
    canvas.remove();
  }

  const fullText = pageTexts.join("\n\n--- Page Break ---\n\n").trim();
  onProgress?.({ stage: "done", page: totalPages, totalPages, percent: 100, message: `Done — ${fullText.length.toLocaleString()} characters` });
  return fullText;
}

/** OCR a single image file */
export async function extractImageWithOCR(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({ stage: "loading", page: 1, totalPages: 1, percent: 10, message: "Loading image…" });
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, { logger: () => {} });
  onProgress?.({ stage: "ocr", page: 1, totalPages: 1, percent: 40, message: "Running OCR…" });
  const { data } = await worker.recognize(file);
  await worker.terminate();
  const text = data.text.trim();
  onProgress?.({ stage: "done", page: 1, totalPages: 1, percent: 100, message: `Done — ${text.length} characters` });
  return text;
}
