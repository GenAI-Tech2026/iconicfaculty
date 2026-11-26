import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { detectPlatform, categoryForIcon, makeSlug } from "./platform";

const LINKS_TABLE = "iconic_social_links";
const EVENTS_TABLE = "iconic_link_events";
const DATA_FILE = path.join(process.cwd(), "data", "links-store.json");

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const SEED_LINKS = [
  {
    id: "if-link-1",
    title: "Watch Free Lectures on YouTube",
    url: "https://www.youtube.com/@iconicfaculty",
    slug: "youtube-lectures",
    icon: "youtube",
    description: "Complete Intermediate MPC & BiPC video lectures — 100% free",
    category: "Social",
    sort_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "if-link-2",
    title: "Join Student Telegram Channel",
    url: "https://t.me/iconicfaculty",
    slug: "telegram-notes",
    icon: "telegram",
    description: "Free PDF notes, formula sheets & daily practice problems",
    category: "Social",
    sort_order: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "if-link-3",
    title: "Chat on WhatsApp",
    url: "https://wa.me/919000000000",
    slug: "whatsapp-help",
    icon: "whatsapp",
    description: "Ask doubts or request subject-wise study materials",
    category: "Social",
    sort_order: 3,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "if-link-4",
    title: "Follow on Instagram",
    url: "https://www.instagram.com/iconicfaculty",
    slug: "instagram",
    icon: "instagram",
    description: "Short revision reels, exam tips & student updates",
    category: "Social",
    sort_order: 4,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "if-link-5",
    title: "Visit Iconic Faculty Home",
    url: "https://iconicfaculty.in",
    slug: "website",
    icon: "website",
    description: "Our mission to protect intermediate students from college mafia",
    category: "Resources",
    sort_order: 5,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

async function writeStore(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function readStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      links: Array.isArray(parsed.links) ? parsed.links : SEED_LINKS,
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    const initial = { links: SEED_LINKS, events: [] };
    await writeStore(initial);
    return initial;
  }
}

export async function getAllLinks() {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from(LINKS_TABLE)
      .select("id, title, url, slug, icon, description, category, sort_order, is_active, created_at")
      .order("sort_order", { ascending: true });
    if (!error && Array.isArray(data)) return data;
  }
  const store = await readStore();
  return store.links.slice().sort((a, b) => a.sort_order - b.sort_order);
}

export async function getActiveLinks() {
  const links = await getAllLinks();
  return links.filter((l) => l.is_active);
}

export async function getLinkBySlug(slug) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from(LINKS_TABLE)
      .select("id, title, url, slug, icon, description, category, sort_order, is_active, created_at")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!error) return data ?? null;
  }
  const links = await getAllLinks();
  return links.find((l) => l.slug === slug && l.is_active) ?? null;
}

export async function getEvents() {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from(EVENTS_TABLE)
      .select("type, link_id, occurred_at, source, device")
      .order("occurred_at", { ascending: false })
      .limit(5000);
    if (!error && Array.isArray(data)) {
      return data.map((r) => ({
        t: r.type === "click" ? "c" : "v",
        l: r.link_id,
        at: r.occurred_at,
        s: r.source || "Direct",
        d: r.device || "desktop",
      }));
    }
  }
  const store = await readStore();
  return store.events;
}

export async function addLink({ title, url, description, slug, category }) {
  const icon = detectPlatform(url);
  const resolvedCategory = category?.trim() || categoryForIcon(icon);
  const resolvedSlug = makeSlug(title, slug);

  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: maxRows } = await sb
      .from(LINKS_TABLE)
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const maxOrder = maxRows?.[0]?.sort_order ?? 0;

    const { data, error } = await sb
      .from(LINKS_TABLE)
      .insert({
        title: title.trim(),
        url: url.trim(),
        slug: resolvedSlug,
        icon,
        description: description?.trim() || null,
        category: resolvedCategory,
        sort_order: maxOrder + 1,
        is_active: true,
      })
      .select()
      .single();
    if (!error && data) return data;
    if (error?.code === "23505") {
      const uniqueSlug = `${resolvedSlug}-${Math.random().toString(36).slice(2, 6)}`;
      const retry = await sb
        .from(LINKS_TABLE)
        .insert({
          title: title.trim(),
          url: url.trim(),
          slug: uniqueSlug,
          icon,
          description: description?.trim() || null,
          category: resolvedCategory,
          sort_order: maxOrder + 1,
          is_active: true,
        })
        .select()
        .single();
      if (!retry.error && retry.data) return retry.data;
    }
    if (error) throw new Error(error.message);
  }

  const store = await readStore();
  const maxOrder = store.links.reduce((m, l) => Math.max(m, l.sort_order), 0);
  const newLink = {
    id: crypto.randomUUID(),
    title: title.trim(),
    url: url.trim(),
    slug: resolvedSlug,
    icon,
    description: description?.trim() || null,
    category: resolvedCategory,
    sort_order: maxOrder + 1,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  store.links.push(newLink);
  await writeStore(store);
  return newLink;
}

export async function updateLinkById(id, { title, url, description, slug, category }) {
  const icon = detectPlatform(url);
  const resolvedCategory = category?.trim() || categoryForIcon(icon);

  const sb = getSupabaseAdmin();
  if (sb) {
    const patch = {
      title: title.trim(),
      url: url.trim(),
      icon,
      description: description?.trim() || null,
      category: resolvedCategory,
    };
    if (slug?.trim()) patch.slug = makeSlug(title, slug);

    const { data, error } = await sb
      .from(LINKS_TABLE)
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (!error && data) return data;
  }

  const store = await readStore();
  const idx = store.links.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  store.links[idx] = {
    ...store.links[idx],
    title: title.trim(),
    url: url.trim(),
    slug: slug?.trim() ? makeSlug(title, slug) : store.links[idx].slug,
    icon,
    description: description?.trim() || null,
    category: resolvedCategory,
  };
  await writeStore(store);
  return store.links[idx];
}

export async function toggleLinkById(id) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: row, error: fetchErr } = await sb
      .from(LINKS_TABLE)
      .select("is_active")
      .eq("id", id)
      .maybeSingle();
    if (!fetchErr && row) {
      const { error } = await sb
        .from(LINKS_TABLE)
        .update({ is_active: !row.is_active })
        .eq("id", id);
      if (!error) return;
    }
  }

  const store = await readStore();
  const item = store.links.find((l) => l.id === id);
  if (!item) return;
  item.is_active = !item.is_active;
  await writeStore(store);
}

export async function deleteLinkById(id) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from(LINKS_TABLE).delete().eq("id", id);
    if (!error) return;
  }

  const store = await readStore();
  store.links = store.links.filter((l) => l.id !== id);
  await writeStore(store);
}

export async function moveLinkById(id, direction) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: rows, error } = await sb
      .from(LINKS_TABLE)
      .select("id, sort_order")
      .order("sort_order", { ascending: true });
    if (!error && Array.isArray(rows)) {
      const idx = rows.findIndex((r) => r.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (idx !== -1 && swapIdx >= 0 && swapIdx < rows.length) {
        const a = rows[idx];
        const b = rows[swapIdx];
        await Promise.all([
          sb.from(LINKS_TABLE).update({ sort_order: b.sort_order }).eq("id", a.id),
          sb.from(LINKS_TABLE).update({ sort_order: a.sort_order }).eq("id", b.id),
        ]);
      }
      return;
    }
  }

  const store = await readStore();
  const sorted = store.links.slice().sort((a, b) => a.sort_order - b.sort_order);
  const idx = sorted.findIndex((l) => l.id === id);
  if (idx === -1) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) return;

  const tempOrder = sorted[idx].sort_order;
  sorted[idx].sort_order = sorted[swapIdx].sort_order;
  sorted[swapIdx].sort_order = tempOrder;
  store.links = sorted;
  await writeStore(store);
}

export async function recordEvent({ type, link_id = null, source = "Direct", device = "desktop" }) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from(EVENTS_TABLE).insert({
      type: type === "click" ? "click" : "view",
      link_id: link_id || null,
      source: source || "Direct",
      device: device || "desktop",
    });
    if (!error) return;
  }

  const store = await readStore();
  store.events.unshift({
    t: type === "click" ? "c" : "v",
    l: link_id,
    at: new Date().toISOString(),
    s: source || "Direct",
    d: device || "desktop",
  });
  if (store.events.length > 5000) {
    store.events = store.events.slice(0, 5000);
  }
  await writeStore(store);
}
