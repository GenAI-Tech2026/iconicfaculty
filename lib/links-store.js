import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { detectPlatform, categoryForIcon, makeSlug } from "./platform";
import { deletePdfFromStorage } from "./pdf-storage";

const LINKS_TABLE = "iconic_social_links";
const EVENTS_TABLE = "iconic_link_events";
const DATA_FILE = path.join(process.cwd(), "data", "links-store.json");
const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const SEED_LINKS = [
  {
    id: "if-link-1",
    title: "Watch Free Lectures on YouTube",
    url: "https://www.youtube.com/@TheIconicFaculty",
    slug: "youtube-lectures",
    icon: "youtube",
    description: "Complete Intermediate MPC & BiPC video lectures — 100% free",
    category: "Social",
    sort_order: 1,
    is_active: true,
    deleted_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "if-link-2",
    title: "Chat on WhatsApp",
    url: "https://wa.me/917780218068",
    slug: "whatsapp-help",
    icon: "whatsapp",
    description: "Ask doubts or request subject-wise study materials",
    category: "Social",
    sort_order: 2,
    is_active: true,
    deleted_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "if-link-3",
    title: "Follow on Instagram",
    url: "https://www.instagram.com/the_iconic_faculty",
    slug: "instagram",
    icon: "instagram",
    description: "Short revision reels, exam tips & student updates",
    category: "Social",
    sort_order: 3,
    is_active: true,
    deleted_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "if-link-4",
    title: "Visit Iconic Faculty Home",
    url: "https://iconicfaculty.com",
    slug: "website",
    icon: "website",
    description: "Our mission to protect intermediate students from college mafia",
    category: "Resources",
    sort_order: 4,
    is_active: true,
    deleted_at: null,
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

export async function purgeExpiredTrash() {
  const cutoffIso = new Date(Date.now() - TRASH_RETENTION_MS).toISOString();
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: expired, error } = await sb
      .from(LINKS_TABLE)
      .select("id, url, icon")
      .not("deleted_at", "is", null)
      .lt("deleted_at", cutoffIso);

    if (!error && Array.isArray(expired) && expired.length > 0) {
      for (const row of expired) {
        if (row.icon === "pdf") await deletePdfFromStorage(row.url);
        await sb.from(LINKS_TABLE).delete().eq("id", row.id);
      }
    }
    return;
  }

  const store = await readStore();
  const cutoffMs = Date.now() - TRASH_RETENTION_MS;
  const keep = [];
  for (const l of store.links) {
    if (l.deleted_at && new Date(l.deleted_at).getTime() < cutoffMs) {
      if (l.icon === "pdf") await deletePdfFromStorage(l.url);
    } else {
      keep.push(l);
    }
  }
  if (keep.length !== store.links.length) {
    store.links = keep;
    await writeStore(store);
  }
}

export async function getAllLinks() {
  const sb = getSupabaseAdmin();
  if (sb) {
    const withTrash = await sb
      .from(LINKS_TABLE)
      .select("id, title, url, slug, icon, description, category, sort_order, is_active, deleted_at, created_at")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (!withTrash.error && Array.isArray(withTrash.data)) return withTrash.data;

    // Fallback if 0002_iconic_recycle_bin.sql has not been run yet
    const base = await sb
      .from(LINKS_TABLE)
      .select("id, title, url, slug, icon, description, category, sort_order, is_active, created_at")
      .order("sort_order", { ascending: true });
    if (!base.error && Array.isArray(base.data)) return base.data;
  }
  const store = await readStore();
  return store.links
    .filter((l) => !l.deleted_at)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getTrashedLinks() {
  await purgeExpiredTrash();
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from(LINKS_TABLE)
      .select("id, title, url, slug, icon, description, category, sort_order, is_active, deleted_at, created_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });
    if (!error && Array.isArray(data)) return data;
    return [];
  }
  const store = await readStore();
  return store.links
    .filter((l) => !!l.deleted_at)
    .slice()
    .sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
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
  const finalSlug = store.links.some((l) => l.slug === resolvedSlug)
    ? `${resolvedSlug}-${Math.random().toString(36).slice(2, 6)}`
    : resolvedSlug;
  const newLink = {
    id: crypto.randomUUID(),
    title: title.trim(),
    url: url.trim(),
    slug: finalSlug,
    icon,
    description: description?.trim() || null,
    category: resolvedCategory,
    sort_order: maxOrder + 1,
    is_active: true,
    deleted_at: null,
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
    if (error) throw new Error(error.message);
    return data;
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
    if (fetchErr) throw new Error(fetchErr.message);
    if (row) {
      const { error } = await sb
        .from(LINKS_TABLE)
        .update({ is_active: !row.is_active })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return;
    }
  }

  const store = await readStore();
  const item = store.links.find((l) => l.id === id);
  if (!item) return;
  item.is_active = !item.is_active;
  await writeStore(store);
}

/** Soft-delete into 30-day Recycle Bin. */
export async function deleteLinkById(id) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb
      .from(LINKS_TABLE)
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", id);
    if (!error) return;

    // Fallback if 0002_iconic_recycle_bin.sql has not been applied yet
    if (error.message?.includes("deleted_at")) {
      const { error: hardErr } = await sb.from(LINKS_TABLE).delete().eq("id", id);
      if (hardErr) throw new Error(hardErr.message);
      return;
    }
    throw new Error(error.message);
  }

  const store = await readStore();
  const item = store.links.find((l) => l.id === id);
  if (!item) return;
  item.deleted_at = new Date().toISOString();
  item.is_active = false;
  await writeStore(store);
}

export async function restoreLinkById(id) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb
      .from(LINKS_TABLE)
      .update({ deleted_at: null, is_active: true })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = await readStore();
  const item = store.links.find((l) => l.id === id);
  if (!item) return;
  item.deleted_at = null;
  item.is_active = true;
  await writeStore(store);
}

export async function permanentDeleteLinkById(id) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: row } = await sb
      .from(LINKS_TABLE)
      .select("url, icon")
      .eq("id", id)
      .maybeSingle();
    if (row?.icon === "pdf") {
      await deletePdfFromStorage(row.url);
    }
    const { error } = await sb.from(LINKS_TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = await readStore();
  const row = store.links.find((l) => l.id === id);
  if (row?.icon === "pdf") {
    await deletePdfFromStorage(row.url);
  }
  store.links = store.links.filter((l) => l.id !== id);
  await writeStore(store);
}

export async function moveLinkById(id, direction) {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data: rows, error } = await sb
      .from(LINKS_TABLE)
      .select("id, sort_order")
      .is("deleted_at", null)
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
  const sorted = store.links
    .filter((l) => !l.deleted_at)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const idx = sorted.findIndex((l) => l.id === id);
  if (idx === -1) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) return;

  const tempOrder = sorted[idx].sort_order;
  sorted[idx].sort_order = sorted[swapIdx].sort_order;
  sorted[swapIdx].sort_order = tempOrder;
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
