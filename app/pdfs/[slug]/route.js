import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLinkBySlug } from "../../../lib/links-store";

const LOCAL_PDF_DIR = path.join(process.cwd(), "data", "pdfs");

export async function GET(_req, context) {
  const { slug: rawSlug } = await context.params;
  const slug = decodeURIComponent(rawSlug || "").replace(/\.pdf$/i, "");
  if (!slug) return new NextResponse("Not found", { status: 404 });

  const link = await getLinkBySlug(slug);
  if (!link || link.icon !== "pdf") {
    return new NextResponse("Not found", { status: 404 });
  }

  const downloadName = `${slug}.pdf`;

  try {
    if (link.url.startsWith("/api/pdfs/")) {
      const localName = path.basename(decodeURIComponent(link.url.replace("/api/pdfs/", "")));
      const data = await fs.readFile(path.join(LOCAL_PDF_DIR, localName));
      return new NextResponse(data, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${downloadName}"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const upstream = await fetch(link.url);
    if (!upstream.ok) {
      return new NextResponse("PDF not available", { status: 404 });
    }
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${downloadName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("PDF not available", { status: 404 });
  }
}
