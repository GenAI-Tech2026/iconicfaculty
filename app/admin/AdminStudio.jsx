"use client";

import React from "react";
import Link from "next/link";
import {
  createLink,
  updateLink,
  toggleLink,
  deleteLink,
  restoreLink,
  permanentDeleteLink,
  moveLink,
} from "./actions";
import { PlatformIcon } from "../../components/PlatformIcon";
import { detectPlatform, platformLabel, platformColor, categoryForIcon } from "../../lib/platform";

const CATEGORIES = ["Social", "Resources", "Booking", "Content", "Other"];

function pdfFileNameFromUrl(url) {
  try {
    const clean = String(url || "").split("?")[0];
    const last = decodeURIComponent(clean.split("/").pop() || "document.pdf");
    return last.replace(/^\d+-/, "") || "document.pdf";
  } catch {
    return "document.pdf";
  }
}

function LinkCard({ link, isFirst, isLast, clickCount }) {
  const [editing, setEditing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [editUrl, setEditUrl] = React.useState(link.url);

  React.useEffect(() => {
    setEditUrl(link.url);
  }, [link.url]);

  const detected = detectPlatform(editUrl);

  const copyShort = () => {
    const shortUrl = `${window.location.origin}/l/${link.slug}`;
    navigator.clipboard?.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`if-st-card ${link.is_active ? "" : "is-off"}`}>
      <div className="if-st-card__row">
        <span className="if-st-dot" style={{ background: platformColor(link.icon) }}>
          <PlatformIcon icon={link.icon} size={18} url={link.url} />
        </span>

        <div className="if-st-card__info">
          <div className="if-st-card__top">
            <span className="if-st-card__title">{link.title}</span>
            <span className="if-st-pill">{link.category || "Other"}</span>
            <span className={`if-st-status ${link.is_active ? "is-live" : "is-hidden"}`}>
              {link.is_active ? "Live" : "Hidden"}
            </span>
          </div>
          <div className="if-st-card__url">
            {link.icon === "pdf" ? `PDF File: ${pdfFileNameFromUrl(link.url)}` : link.url}
          </div>
          <div className="if-st-card__meta">
            <button type="button" className="if-st-slug" onClick={copyShort} title="Copy short link">
              /l/{link.slug} {copied ? "✓ Copied" : "⎘"}
            </button>
            <span>•</span>
            <span>{clickCount} clicks</span>
          </div>
          {link.description && <p className="if-st-card__desc">{link.description}</p>}
        </div>

        <div className="if-st-actions">
          <form action={toggleLink}>
            <input type="hidden" name="id" value={link.id} />
            <button type="submit" className="if-st-btn" title={link.is_active ? "Hide link" : "Show link"}>
              {link.is_active ? "Hide" : "Show"}
            </button>
          </form>

          {!isFirst && (
            <form action={moveLink}>
              <input type="hidden" name="id" value={link.id} />
              <input type="hidden" name="direction" value="up" />
              <button type="submit" className="if-st-btn" title="Move up" aria-label={`Move ${link.title} up`}>↑</button>
            </form>
          )}
          {!isLast && (
            <form action={moveLink}>
              <input type="hidden" name="id" value={link.id} />
              <input type="hidden" name="direction" value="down" />
              <button type="submit" className="if-st-btn" title="Move down" aria-label={`Move ${link.title} down`}>↓</button>
            </form>
          )}

          <button
            type="button"
            className={`if-st-btn ${editing ? "is-active" : ""}`}
            onClick={() => setEditing((v) => !v)}
          >
            Edit
          </button>

          <form
            action={deleteLink}
            onSubmit={(e) => {
              if (!confirm(`Move "${link.title}" to Recycle Bin? (Kept for 30 days)`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={link.id} />
            <button
              type="submit"
              className="if-st-btn is-danger"
              title="Move to Recycle Bin"
              aria-label={`Move ${link.title} to Recycle Bin`}
            >
              ✕
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <form
          action={async (fd) => {
            await updateLink(fd);
            setEditing(false);
          }}
          className="if-st-edit"
        >
          <input type="hidden" name="id" value={link.id} />
          <div className="if-st-grid2">
            <label>
              <span>Title</span>
              <input name="title" defaultValue={link.title} required />
            </label>
            <label>
              <span>Category</span>
              <select name="category" defaultValue={link.category || "Other"}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="if-st-grid2">
            {link.icon === "pdf" ? (
              <label>
                <span>Replace PDF File (current: {pdfFileNameFromUrl(link.url)})</span>
                <input type="hidden" name="url" value={link.url} />
                <input type="file" name="pdfFile" accept="application/pdf,.pdf" />
              </label>
            ) : (
              <label>
                <span>Destination URL</span>
                <input
                  name="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  required
                />
              </label>
            )}
            <label>
              <span>Short slug (/l/...)</span>
              <input name="slug" defaultValue={link.slug} />
            </label>
          </div>
          <label>
            <span>Description (optional)</span>
            <input name="description" defaultValue={link.description || ""} />
          </label>
          <div className="if-st-edit__foot">
            <span className="if-st-detected">
              <span className="if-st-detected__dot" style={{ background: platformColor(detected) }}>
                <PlatformIcon icon={detected} size={12} url={editUrl} />
              </span>
              Detected: <strong>{platformLabel(detected)}</strong>
            </span>
            <div className="if-st-edit__btns">
              <button type="button" className="if-st-btn" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="if-st-primary">Save changes</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function AdminStudio({ links, trashedLinks = [], events, adminName }) {
  const [view, setView] = React.useState("links");
  // Box 1: Normal Link form state
  const [newTitle, setNewTitle] = React.useState("");
  const [newUrl, setNewUrl] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");
  const [newCat, setNewCat] = React.useState("");
  const [linkAdding, setLinkAdding] = React.useState(false);
  const [linkError, setLinkError] = React.useState(null);
  const linkFormRef = React.useRef(null);

  // Box 2: PDF Upload form state
  const [pdfTitle, setPdfTitle] = React.useState("");
  const [pdfDesc, setPdfDesc] = React.useState("");
  const [pdfSlug, setPdfSlug] = React.useState("");
  const [pdfCat, setPdfCat] = React.useState("Resources");
  const [pdfName, setPdfName] = React.useState("");
  const [pdfUploading, setPdfUploading] = React.useState(false);
  const [pdfError, setPdfError] = React.useState(null);
  const pdfFormRef = React.useRef(null);

  const detectedIcon = detectPlatform(newUrl);
  const autoCat = newCat || categoryForIcon(detectedIcon);

  const views = events.filter((e) => e.t === "v").length;
  const clicks = events.filter((e) => e.t === "c").length;
  const ctr = views > 0 ? Math.round((clicks / views) * 100) : 0;
  const activeLinks = links.filter((l) => l.is_active);

  const clicksByLink = React.useMemo(() => {
    const map = {};
    for (const e of events) {
      if (e.t === "c" && e.l) map[e.l] = (map[e.l] || 0) + 1;
    }
    return map;
  }, [events]);

  const sources = React.useMemo(() => {
    const map = {};
    for (const e of events) {
      const k = e.s || "Direct";
      map[k] = (map[k] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [events]);

  const devices = React.useMemo(() => {
    const map = {};
    for (const e of events) {
      const k = e.d || "desktop";
      map[k] = (map[k] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [events]);

  return (
    <div className="if-adm">
      {/* Top Bar */}
      <header className="if-adm__top">
        <div>
          <span className="if-adm__eyebrow">Iconic Faculty • Admin</span>
          <h1 className="if-adm__title">Link Studio</h1>
          <p className="if-adm__sub">
            Manage your Linktree-style public page. Changes appear live on{" "}
            <Link href="/links">/links</Link>.
          </p>
        </div>
        <div className="if-adm__top-actions">
          {adminName && <span className="if-st-pill">{adminName}</span>}
          <Link href="/" className="if-st-btn">← Home</Link>
          <Link href="/links" target="_blank" className="if-st-primary">
            View Public Linktree ↗
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="if-st-btn">Sign out</button>
          </form>
        </div>
      </header>

      {/* Tabs */}
      <div className="if-adm__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === "links"}
          className={`if-adm__tab ${view === "links" ? "is-on" : ""}`}
          onClick={() => setView("links")}
        >
          Links ({links.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "analytics"}
          className={`if-adm__tab ${view === "analytics" ? "is-on" : ""}`}
          onClick={() => setView("analytics")}
        >
          Analytics
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "trash"}
          className={`if-adm__tab ${view === "trash" ? "is-on" : ""}`}
          onClick={() => setView("trash")}
        >
          Recycle Bin ({trashedLinks.length})
        </button>
      </div>

      {view === "links" ? (
        <div className="if-adm__split">
          {/* Left: Separate Boxes for Links and PDFs */}
          <div className="if-adm__editor">
            {/* Box 1: Normal Links */}
            <form
              ref={linkFormRef}
              onSubmit={async (e) => {
                e.preventDefault();
                if (linkAdding) return;
                setLinkError(null);
                setLinkAdding(true);
                try {
                  await createLink(new FormData(e.currentTarget));
                  setNewTitle("");
                  setNewUrl("");
                  setNewDesc("");
                  setNewSlug("");
                  setNewCat("");
                  linkFormRef.current?.reset();
                } catch (ex) {
                  setLinkError(ex instanceof Error ? ex.message : "Failed to add link.");
                } finally {
                  setLinkAdding(false);
                }
              }}
              className="if-st-add"
            >
              <div className="if-st-add__head">
                <h2>+ Add Link</h2>
                {newUrl && (
                  <span className="if-st-detected">
                    <span className="if-st-detected__dot" style={{ background: platformColor(detectedIcon) }}>
                      <PlatformIcon icon={detectedIcon} size={12} url={newUrl} />
                    </span>
                    {platformLabel(detectedIcon)} • {autoCat}
                  </span>
                )}
              </div>
              {linkError && (
                <p style={{ color: "#ff9da5", fontSize: 13, margin: 0 }}>{linkError}</p>
              )}

              <div className="if-st-grid2">
                <label>
                  <span>Title *</span>
                  <input
                    name="title"
                    placeholder="e.g. Watch Free Physics Lectures"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Category</span>
                  <select
                    name="category"
                    value={autoCat}
                    onChange={(e) => setNewCat(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="if-st-grid2">
                <label>
                  <span>Destination URL *</span>
                  <input
                    name="url"
                    placeholder="https://youtube.com/@iconicfaculty"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Custom Slug (optional)</span>
                  <input
                    name="slug"
                    autoComplete="off"
                    placeholder="physics-lectures"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                  />
                </label>
              </div>

              <label>
                <span>Short Description (optional)</span>
                <input
                  name="description"
                  placeholder="Subtitle shown under the link button"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </label>

              <div className="if-st-add__foot">
                <button type="submit" disabled={linkAdding} className="if-st-primary">
                  {linkAdding ? "Adding…" : "Add Link"}
                </button>
              </div>
            </form>

            {/* Box 2: PDF Uploads */}
            <form
              ref={pdfFormRef}
              onSubmit={async (e) => {
                e.preventDefault();
                if (pdfUploading) return;
                setPdfError(null);
                setPdfUploading(true);
                try {
                  await createLink(new FormData(e.currentTarget));
                  setPdfTitle("");
                  setPdfDesc("");
                  setPdfSlug("");
                  setPdfCat("Resources");
                  setPdfName("");
                  pdfFormRef.current?.reset();
                } catch (ex) {
                  setPdfError(ex instanceof Error ? ex.message : "PDF upload failed.");
                } finally {
                  setPdfUploading(false);
                }
              }}
              className="if-st-add if-st-add--pdf"
            >
              <div className="if-st-add__head">
                <h2>+ Upload PDF</h2>
                <span className="if-st-detected">
                  <span className="if-st-detected__dot" style={{ background: platformColor("pdf") }}>
                    <PlatformIcon icon="pdf" size={12} />
                  </span>
                  {pdfName ? pdfName : "Direct PDF file"}
                </span>
              </div>
              {pdfError && (
                <p style={{ color: "#ff9da5", fontSize: 13, margin: 0 }}>{pdfError}</p>
              )}

              <div className="if-st-grid2">
                <label>
                  <span>PDF Title *</span>
                  <input
                    name="title"
                    placeholder="e.g. IPE Physics Formula Sheet"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Category</span>
                  <select
                    name="category"
                    value={pdfCat}
                    onChange={(e) => setPdfCat(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="if-st-grid2">
                <label>
                  <span>PDF File *</span>
                  <input
                    type="file"
                    name="pdfFile"
                    accept="application/pdf,.pdf"
                    required
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setPdfName(f.name);
                        if (!pdfTitle) {
                          setPdfTitle(f.name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").trim());
                        }
                      } else {
                        setPdfName("");
                      }
                    }}
                  />
                </label>
                <label>
                  <span>Custom Slug (optional)</span>
                  <input
                    name="slug"
                    autoComplete="off"
                    placeholder="physics-formula-pdf"
                    value={pdfSlug}
                    onChange={(e) => setPdfSlug(e.target.value)}
                  />
                </label>
              </div>

              <label>
                <span>Short Description (optional)</span>
                <input
                  name="description"
                  placeholder="e.g. Chapter-wise PDF notes for 2nd year"
                  value={pdfDesc}
                  onChange={(e) => setPdfDesc(e.target.value)}
                />
              </label>

              <div className="if-st-add__foot">
                <button type="submit" disabled={pdfUploading} className="if-st-primary">
                  {pdfUploading ? "Publishing…" : "Publish PDF"}
                </button>
              </div>
            </form>

            {/* Managed Lists: Links Box + PDFs Box */}
            <div className="if-st-group">
              <div className="if-st-group__head">Links ({links.filter((l) => l.icon !== "pdf").length})</div>
              <div className="if-st-list">
                {links
                  .filter((l) => l.icon !== "pdf")
                  .map((l, i, arr) => (
                    <LinkCard
                      key={l.id}
                      link={l}
                      isFirst={i === 0}
                      isLast={i === arr.length - 1}
                      clickCount={clicksByLink[l.id] || 0}
                    />
                  ))}
              </div>
            </div>

            <div className="if-st-group">
              <div className="if-st-group__head">PDFs ({links.filter((l) => l.icon === "pdf").length})</div>
              <div className="if-st-list">
                {links.filter((l) => l.icon === "pdf").length === 0 ? (
                  <p className="if-an__empty">No PDFs uploaded yet. Use the Upload PDF box above.</p>
                ) : (
                  links
                    .filter((l) => l.icon === "pdf")
                    .map((l, i, arr) => (
                      <LinkCard
                        key={l.id}
                        link={l}
                        isFirst={i === 0}
                        isLast={i === arr.length - 1}
                        clickCount={clicksByLink[l.id] || 0}
                      />
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Linktree Phone Preview */}
          <aside className="if-adm__preview">
            <div className="if-phone">
              <div className="if-phone__notch" />
              <div className="if-phone__screen">
                <div className="if-phone__avatar">IF</div>
                <div className="if-phone__name">Iconic Faculty</div>
                <div className="if-phone__bio">Free Education for Intermediate Students</div>

                <div className="if-phone__links">
                  {newTitle && newUrl && (
                    <div className="if-phone__card is-draft">
                      <span className="if-phone__icon" style={{ background: platformColor(detectedIcon) }}>
                        <PlatformIcon icon={detectedIcon} size={15} url={newUrl} />
                      </span>
                      <span className="if-phone__text">
                        <strong>{newTitle}</strong>
                        {newDesc && <small>{newDesc}</small>}
                      </span>
                    </div>
                  )}

                  {activeLinks
                    .filter((l) => l.icon !== "pdf")
                    .map((l) => (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="if-phone__card"
                      >
                        <span className="if-phone__icon" style={{ background: platformColor(l.icon) }}>
                          <PlatformIcon icon={l.icon} size={15} url={l.url} />
                        </span>
                        <span className="if-phone__text">
                          <strong>{l.title}</strong>
                          {l.description && <small>{l.description}</small>}
                        </span>
                      </a>
                    ))}

                  {(pdfTitle || activeLinks.some((l) => l.icon === "pdf")) && (
                    <div className="if-phone__sec">PDFs &amp; Study Material</div>
                  )}

                  {pdfTitle && pdfName && (
                    <div className="if-phone__card is-draft">
                      <span className="if-phone__icon" style={{ background: platformColor("pdf") }}>
                        <PlatformIcon icon="pdf" size={15} />
                      </span>
                      <span className="if-phone__text">
                        <strong>{pdfTitle}</strong>
                        {pdfDesc && <small>{pdfDesc}</small>}
                      </span>
                    </div>
                  )}

                  {activeLinks
                    .filter((l) => l.icon === "pdf")
                    .map((l) => (
                      <a
                        key={l.id}
                        href={l.slug ? `/pdfs/${l.slug}.pdf` : l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="if-phone__card"
                      >
                        <span className="if-phone__icon" style={{ background: platformColor(l.icon) }}>
                          <PlatformIcon icon={l.icon} size={15} url={l.url} />
                        </span>
                        <span className="if-phone__text">
                          <strong>{l.title}</strong>
                          {l.description && <small>{l.description}</small>}
                        </span>
                      </a>
                    ))}
                </div>
              </div>
            </div>
            <p className="if-adm__preview-hint">Live Linktree Preview</p>
          </aside>
        </div>
      ) : view === "analytics" ? (
        <div className="if-an">
          <div className="if-an__kpis">
            <div className="if-an__kpi">
              <span>Page Views</span>
              <strong>{views}</strong>
            </div>
            <div className="if-an__kpi">
              <span>Link Clicks</span>
              <strong>{clicks}</strong>
            </div>
            <div className="if-an__kpi">
              <span>CTR</span>
              <strong>{ctr}%</strong>
            </div>
            <div className="if-an__kpi">
              <span>Active Links</span>
              <strong>{activeLinks.length}</strong>
            </div>
          </div>

          <div className="if-an__grid">
            <div className="if-an__panel">
              <h3>Top Links</h3>
              {links.length === 0 ? (
                <p className="if-an__empty">No links yet.</p>
              ) : (
                links
                  .slice()
                  .sort((a, b) => (clicksByLink[b.id] || 0) - (clicksByLink[a.id] || 0))
                  .map((l) => {
                    const c = clicksByLink[l.id] || 0;
                    const pct = clicks > 0 ? Math.round((c / clicks) * 100) : 0;
                    return (
                      <div key={l.id} className="if-an__row">
                        <div className="if-an__row-head">
                          <span>{l.title}</span>
                          <strong>{c} ({pct}%)</strong>
                        </div>
                        <div className="if-an__bar"><div style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="if-an__panel">
              <h3>Traffic Sources</h3>
              {sources.length === 0 ? (
                <p className="if-an__empty">No traffic recorded yet. Open /links to test.</p>
              ) : (
                sources.map(([name, count]) => (
                  <div key={name} className="if-an__row-head">
                    <span>{name}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              )}

              <h3 style={{ marginTop: 22 }}>Devices</h3>
              {devices.length === 0 ? (
                <p className="if-an__empty">No device data yet.</p>
              ) : (
                devices.map(([name, count]) => (
                  <div key={name} className="if-an__row-head">
                    <span style={{ textTransform: "capitalize" }}>{name}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="if-an__panel">
          <div className="if-st-add__head" style={{ marginBottom: 14 }}>
            <h3>Recycle Bin (30-day retention)</h3>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              Items are permanently deleted after 30 days.
            </span>
          </div>
          {trashedLinks.length === 0 ? (
            <p className="if-an__empty">Recycle Bin is empty.</p>
          ) : (
            <div className="if-st-list">
              {trashedLinks.map((item) => {
                const deletedMs = item.deleted_at ? new Date(item.deleted_at).getTime() : Date.now();
                const daysLeft = Math.max(
                  0,
                  Math.ceil((deletedMs + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)),
                );
                return (
                  <div key={item.id} className="if-st-card is-off">
                    <div className="if-st-card__row">
                      <span className="if-st-dot" style={{ background: platformColor(item.icon) }}>
                        <PlatformIcon icon={item.icon} size={18} url={item.url} />
                      </span>
                      <div className="if-st-card__info">
                        <div className="if-st-card__top">
                          <span className="if-st-card__title">{item.title}</span>
                          <span className="if-st-pill">{item.icon === "pdf" ? "PDF" : item.category || "Link"}</span>
                          <span className="if-st-status is-hidden">Deletes in {daysLeft}d</span>
                        </div>
                        <div className="if-st-card__url">
                          {item.icon === "pdf" ? `PDF File: ${pdfFileNameFromUrl(item.url)}` : item.url}
                        </div>
                      </div>
                      <div className="if-st-actions">
                        <form action={restoreLink}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="if-st-btn">Restore</button>
                        </form>
                        <form
                          action={permanentDeleteLink}
                          onSubmit={(e) => {
                            if (!confirm(`Permanently delete "${item.title}"? This cannot be undone.`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="if-st-btn is-danger">Delete Forever</button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        .if-adm {
          max-width: 1180px;
          margin: 0 auto;
          padding: 36px 20px 80px;
        }
        .if-adm__top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          margin-bottom: 24px;
        }
        .if-adm__eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--accent);
        }
        .if-adm__title {
          font-size: 34px;
          margin: 4px 0;
        }
        .if-adm__sub {
          color: var(--text-muted);
          font-size: 14.5px;
        }
        .if-adm__sub a {
          color: var(--accent);
          text-decoration: underline;
        }
        .if-adm__top-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .if-adm__tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 24px;
        }
        .if-adm__tab {
          background: none;
          border: 0;
          color: var(--text-muted);
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          padding: 10px 16px;
          cursor: pointer;
          position: relative;
        }
        .if-adm__tab.is-on {
          color: #fff;
        }
        .if-adm__tab.is-on::after {
          content: "";
          position: absolute;
          left: 8px;
          right: 8px;
          bottom: -1px;
          height: 2px;
          background: var(--accent);
        }
        .if-adm__split {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 940px) {
          .if-adm__split {
            grid-template-columns: 1fr;
          }
        }
        .if-st-add, .if-st-card, .if-an__kpi, .if-an__panel {
          background: rgba(24, 4, 4, 0.72);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          backdrop-filter: blur(12px);
        }
        .if-st-add {
          padding: 20px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .if-st-add__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .if-st-add__head h2 {
          font-size: 20px;
        }
        .if-st-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 600px) {
          .if-st-grid2 { grid-template-columns: 1fr; }
        }
        .if-st-add label, .if-st-edit label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-muted);
        }
        .if-st-add input, .if-st-add select, .if-st-edit input, .if-st-edit select {
          background: rgba(10, 0, 0, 0.7);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 10px 12px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          outline: none;
        }
        .if-st-add input:focus, .if-st-edit input:focus {
          border-color: var(--accent);
        }
        .if-st-add__foot {
          display: flex;
          justify-content: flex-end;
        }
        .if-st-primary {
          background: var(--accent);
          color: #fff;
          border: 0;
          border-radius: 10px;
          padding: 10px 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .if-st-primary:hover {
          background: #d32f3c;
        }
        .if-st-btn {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-main);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 6px 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
        }
        .if-st-btn:hover {
          border-color: rgba(255, 255, 255, 0.25);
        }
        .if-st-btn.is-active {
          border-color: var(--accent);
          color: var(--accent);
        }
        .if-st-btn.is-danger:hover {
          background: rgba(230, 57, 70, 0.2);
          border-color: var(--accent);
        }
        .if-st-group {
          margin-top: 22px;
        }
        .if-st-group__head {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 10px;
        }
        .if-phone__sec {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: var(--accent);
          margin-top: 8px;
        }
        .if-st-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .if-st-card {
          padding: 16px;
        }
        .if-st-card.is-off {
          opacity: 0.6;
        }
        .if-st-card__row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }
        .if-st-dot {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .if-st-card__info {
          flex: 1;
          min-width: 200px;
        }
        .if-st-card__top {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .if-st-card__title {
          font-weight: 600;
          font-size: 15px;
          color: #fff;
        }
        .if-st-pill {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
        }
        .if-st-status {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .if-st-status.is-live {
          background: rgba(16, 185, 129, 0.16);
          color: #34d399;
        }
        .if-st-status.is-hidden {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
        }
        .if-st-card__url {
          font-size: 12.5px;
          color: var(--text-muted);
          word-break: break-all;
          margin-top: 2px;
        }
        .if-st-card__meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .if-st-slug {
          background: rgba(230, 57, 70, 0.12);
          border: 1px solid rgba(230, 57, 70, 0.3);
          color: #ff8a93;
          border-radius: 6px;
          padding: 2px 7px;
          font-size: 11.5px;
          cursor: pointer;
        }
        .if-st-card__desc {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-top: 6px;
        }
        .if-st-actions {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
        }
        .if-st-edit {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .if-st-edit__foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .if-st-edit__btns {
          display: flex;
          gap: 8px;
        }
        .if-st-detected {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .if-st-detected__dot {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        /* Phone Preview */
        .if-adm__preview {
          position: sticky;
          top: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .if-phone {
          width: 310px;
          border-radius: 36px;
          border: 6px solid rgba(255, 255, 255, 0.14);
          background: linear-gradient(180deg, #160202 0%, #0a0000 100%);
          padding: 14px 14px 22px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 36px rgba(230, 57, 70, 0.14);
        }
        .if-phone__notch {
          width: 90px;
          height: 6px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.15);
          margin: 0 auto 16px;
        }
        .if-phone__screen {
          max-height: 540px;
          overflow-y: auto;
          text-align: center;
        }
        .if-phone__avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          margin: 0 auto 8px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 18px;
        }
        .if-phone__name {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
        }
        .if-phone__bio {
          font-size: 11.5px;
          color: var(--text-muted);
          margin: 4px 0 16px;
        }
        .if-phone__links {
          display: flex;
          flex-direction: column;
          gap: 9px;
          text-align: left;
        }
        .if-phone__card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: #fff;
          text-decoration: none;
        }
        .if-phone__card.is-draft {
          border-style: dashed;
          border-color: var(--accent);
        }
        .if-phone__icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .if-phone__text {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .if-phone__text strong {
          font-size: 12.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .if-phone__text small {
          font-size: 10.5px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .if-adm__preview-hint {
          margin-top: 10px;
          font-size: 12px;
          color: var(--text-muted);
        }
        /* Analytics */
        .if-an__kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        @media (max-width: 720px) {
          .if-an__kpis { grid-template-columns: repeat(2, 1fr); }
        }
        .if-an__kpi {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .if-an__kpi span {
          font-size: 12.5px;
          color: var(--text-muted);
        }
        .if-an__kpi strong {
          font-size: 28px;
          font-family: 'Playfair Display', serif;
        }
        .if-an__grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 18px;
        }
        @media (max-width: 800px) {
          .if-an__grid { grid-template-columns: 1fr; }
        }
        .if-an__panel {
          padding: 20px;
        }
        .if-an__panel h3 {
          font-size: 18px;
          margin-bottom: 14px;
        }
        .if-an__row {
          margin-bottom: 12px;
        }
        .if-an__row-head {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
          margin-bottom: 5px;
        }
        .if-an__bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          overflow: hidden;
        }
        .if-an__bar > div {
          height: 100%;
          background: var(--accent);
        }
        .if-an__empty {
          font-size: 13.5px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
