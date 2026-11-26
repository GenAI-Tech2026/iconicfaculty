import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const LOCAL_PDF_DIR = path.join(process.cwd(), "data", "pdfs");

export async function GET(_req, context) {
  try {
    const { filename } = await context.params;
    const safeName = path.basename(decodeURIComponent(filename || "")).replace(/"/g, "");
    if (!safeName || !safeName.toLowerCase().endsWith(".pdf")) {
      return new NextResponse("Not found", { status: 404 });
    }

    const filePath = path.join(LOCAL_PDF_DIR, safeName);
    const data = await fs.readFile(filePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
