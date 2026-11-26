import { NextResponse } from "next/server";
import { recordEvent } from "../../../../lib/links-store";

function deviceFromUA(ua = "") {
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobi))/.test(s)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone/.test(s)) return "mobile";
  return "desktop";
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req) {
  try {
    const body = await req.json();
    const type = body?.type === "click" ? "click" : "view";
    const rawId = typeof body?.id === "string" ? body.id.trim() : "";
    const linkId = UUID_RE.test(rawId) ? rawId : null;
    const source = typeof body?.source === "string" ? body.source.slice(0, 60) : "Direct";
    const device = deviceFromUA(req.headers.get("user-agent") || "");

    await recordEvent({ type, link_id: linkId, source, device });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
