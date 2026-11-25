"use client";

import React from "react";
import Link from "next/link";
import { PlatformIcon } from "../../components/PlatformIcon";
import { platformColor } from "../../lib/platform";

function detectSource() {
  if (typeof document === "undefined") return "Direct";
  const ref = document.referrer;
  if (!ref) return "Direct";
  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (typeof location !== "undefined" && host === location.hostname) return "Direct";
    if (/instagram\.com|ig\.me/.test(host)) return "Instagram";
    if (/youtube\.com|youtu\.be/.test(host)) return "YouTube";
    if (/whatsapp\.com|wa\.me/.test(host)) return "WhatsApp";
    if (/t\.me|telegram/.test(host)) return "Telegram";
    if (/google\./.test(host)) return "Google";
    return host.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

function sendEvent(payload) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/links/event", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/links/event", {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    // ignore
  }
}

export function LinksBoard({ links }) {
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState("All");
  const sourceRef = React.useRef("Direct");

  React.useEffect(() => {
    sourceRef.current = detectSource();
    sendEvent({ type: "view", source: sourceRef.current });
  }, []);

  const categories = React.useMemo(() => {
    return Array.from(new Set(links.map((l) => l.category || "Other")));
  }, [links]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return links.filter((l) => {
      if (activeCat !== "All" && (l.category || "Other") !== activeCat) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        (l.description || "").toLowerCase().includes(q)
      );
    });
  }, [links, query, activeCat]);

  return (
    <main className="if-lp">
      <div className="if-lp__wrap">
        {/* Brand Header */}
        <header className="if-lp__header">
          <div className="if-lp__avatar">
            <span>IF</span>
          </div>
          <span className="if-lp__eyebrow">Official Links</span>
          <h1 className="if-lp__title">
            Iconic <span className="highlight">Faculty</span>
          </h1>
          <p className="if-lp__lead">
            Free, honest education resources for Intermediate students. Lectures, notes &amp; direct mentorship channels.
          </p>
        </header>

        {/* Search + Category Chips */}
        <div className="if-lp__controls">
          <div className="if-lp__search">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3 3" />
            </svg>
            <input
              type="search"
              placeholder="Search links..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search links"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                ×
              </button>
            )}
          </div>

          {categories.length > 1 && (
            <div className="if-lp__chips" role="tablist">
              <button
                type="button"
                className={`if-lp__chip ${activeCat === "All" ? "is-on" : ""}`}
                onClick={() => setActiveCat("All")}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`if-lp__chip ${activeCat === c ? "is-on" : ""}`}
                  onClick={() => setActiveCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Linktree Stack */}
        {filtered.length === 0 ? (
          <div className="if-lp__empty">No matching links found.</div>
        ) : (
          <div className="if-lp__list">
            {filtered.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="if-lp__card"
                onClick={() =>
                  sendEvent({ type: "click", id: link.id, source: sourceRef.current })
                }
              >
                <span
                  className="if-lp__icon"
                  style={{ background: platformColor(link.icon) }}
                >
                  <PlatformIcon icon={link.icon} size={22} url={link.url} />
                </span>
                <span className="if-lp__meta">
                  <span className="if-lp__card-title">{link.title}</span>
                  {link.description && (
                    <span className="if-lp__card-desc">{link.description}</span>
                  )}
                </span>
                <span className="if-lp__arrow" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 12L12 4M6 4h6v6" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        )}

        <footer className="if-lp__footer">
          <Link href="/">← Back to Iconic Faculty</Link>
          <span>•</span>
          <Link href="/admin">Manage Links</Link>
        </footer>
      </div>

      <style>{`
        .if-lp {
          min-height: 100vh;
          padding: 48px 18px 72px;
          display: flex;
          justify-content: center;
        }
        .if-lp__wrap {
          width: 100%;
          max-width: 600px;
        }
        .if-lp__header {
          text-align: center;
          margin-bottom: 28px;
        }
        .if-lp__avatar {
          width: 76px;
          height: 76px;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px rgba(230, 57, 70, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #fff;
        }
        .if-lp__eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 6px;
        }
        .if-lp__title {
          font-size: 36px;
          margin-bottom: 10px;
          color: var(--text-main);
        }
        .if-lp__lead {
          font-size: 15px;
          color: var(--text-muted);
          max-width: 460px;
          margin: 0 auto;
        }
        .if-lp__controls {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .if-lp__search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(20, 0, 0, 0.65);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 11px 14px;
          color: var(--text-muted);
          backdrop-filter: blur(12px);
        }
        .if-lp__search:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.16);
        }
        .if-lp__search input {
          flex: 1;
          background: transparent;
          border: 0;
          outline: none;
          color: var(--text-main);
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
        }
        .if-lp__search button {
          background: none;
          border: 0;
          color: var(--text-muted);
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
        }
        .if-lp__chips {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }
        .if-lp__chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          border-radius: 999px;
          padding: 6px 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .if-lp__chip:hover {
          color: #fff;
          border-color: rgba(230, 57, 70, 0.45);
        }
        .if-lp__chip.is-on {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
          box-shadow: 0 4px 16px rgba(230, 57, 70, 0.35);
        }
        .if-lp__list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .if-lp__card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px 18px;
          background: rgba(24, 4, 4, 0.72);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          text-decoration: none;
          color: var(--text-main);
          backdrop-filter: blur(12px);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .if-lp__card:hover {
          transform: translateY(-2px);
          border-color: rgba(230, 57, 70, 0.55);
          box-shadow: 0 10px 28px rgba(230, 57, 70, 0.18);
        }
        .if-lp__icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .if-lp__meta {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .if-lp__card-title {
          font-weight: 600;
          font-size: 15.5px;
          color: #fff;
        }
        .if-lp__card-desc {
          font-size: 13px;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .if-lp__arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .if-lp__card:hover .if-lp__arrow {
          color: var(--accent);
          transform: translate(2px, -2px);
        }
        .if-lp__empty {
          text-align: center;
          padding: 40px 16px;
          color: var(--text-muted);
          border: 1px dashed var(--glass-border);
          border-radius: 16px;
        }
        .if-lp__footer {
          margin-top: 34px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .if-lp__footer a {
          color: var(--text-muted);
          text-decoration: none;
        }
        .if-lp__footer a:hover {
          color: var(--accent);
        }
      `}</style>
    </main>
  );
}
