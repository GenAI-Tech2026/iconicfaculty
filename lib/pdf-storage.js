import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "iconic-pdfs";
const LOCAL_PDF_DIR = path.join(process.cwd(), "data", "pdfs");

function sanitizePdfName(name) {
  const base = String(name || "document.pdf")
    .replace(/\.pdf$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${Date.now()}-${base || "document"}.pdf`;
}

export async function uploadPdf(file) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isPdfMagic = buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  const isPdfExt = String(file.name || "").toLowerCase().endsWith(".pdf");
  if (!isPdfMagic && !isPdfExt) {
    throw new Error("Only valid PDF files are allowed.");
  }

  const fileName = sanitizePdfName(file.name);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const sb = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: buckets } = await sb.storage.listBuckets();
      if (!buckets?.some((b) => b.name === BUCKET)) {
        await sb.storage.createBucket(BUCKET, { public: true });
      }

      const { error } = await sb.storage.from(BUCKET).upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

      if (!error) {
        const { data } = sb.storage.from(BUCKET).getPublicUrl(fileName);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch {
      // Fall through to local PDF storage
    }
  }

  await fs.mkdir(LOCAL_PDF_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_PDF_DIR, fileName), buffer);
  return `/api/pdfs/${encodeURIComponent(fileName)}`;
}

export async function deletePdfFromStorage(pdfUrl) {
  if (!pdfUrl) return;

  if (pdfUrl.startsWith("/api/pdfs/")) {
    try {
      const localName = path.basename(decodeURIComponent(pdfUrl.replace("/api/pdfs/", "")));
      if (localName) await fs.unlink(path.join(LOCAL_PDF_DIR, localName));
    } catch {
      // ignore missing local file
    }
    return;
  }

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = pdfUrl.indexOf(marker);
  if (idx === -1) return;

  const objectName = decodeURIComponent(pdfUrl.slice(idx + marker.length).split("?")[0]);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !objectName) return;

  try {
    const sb = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await sb.storage.from(BUCKET).remove([objectName]);
  } catch {
    // best-effort storage cleanup
  }
}
