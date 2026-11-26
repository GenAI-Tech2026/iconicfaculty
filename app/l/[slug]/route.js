import { NextResponse } from "next/server";
import { getLinkBySlug, recordEvent } from "../../../lib/links-store";

function deviceFromUA(ua = "") {
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobi))/.test(s)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone/.test(s)) return "mobile";
  return "desktop";
}

export async function GET(req, context) {
  const { slug } = await context.params;
  const link = await getLinkBySlug(slug);
  if (!link) {
    return NextResponse.redirect(new URL("/links", req.url));
  }

  const device = deviceFromUA(req.headers.get("user-agent") || "");
  await recordEvent({ type: "click", link_id: link.id, source: "Shortlink", device });

  const target = link.icon === "pdf" ? new URL(`/pdfs/${link.slug}.pdf`, req.url) : link.url;
  return NextResponse.redirect(target, 307);
}
