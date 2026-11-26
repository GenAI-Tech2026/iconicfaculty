# Iconic Faculty (`iconicfaculty`) — Complete Design & Technical Documentation

> **Domain:** `https://iconicfaculty.com`  
> **Tagline:** *"Education is a right, not a business."*  
> **Primary Purpose:** Free educational resource platform for Intermediate (MPC & BiPC) students in Telangana and Andhra Pradesh, featuring a dark crimson glassmorphic landing page, 60fps interactive particle hero, Telangana/Hyderabad dot-matrix map, public Link & PDF Hub (`/links`), and protected Admin Studio (`/admin`).

---

## 1. Brand Identity, Logos & Official Channels

### Logos & Visual Assets
| Asset | Path / Component | Details & Usage |
| :--- | :--- | :--- |
| **Favicon** | `public/iconicfaculty.ico` | Referenced in `app/layout.jsx` (`metadata.icons.icon`). |
| **Animated Background Texture** | `public/hero_bg.png` | Fixed full-viewport layer (`.animated-bg`, `opacity: 0.3`, `z-index: -3`, `background-size: cover`). |
| **IF Monogram Badge** | `app/links/LinksBoard.jsx` | Circular `IF` badge on `/links` wrapped in `<Link href="/">` so clicking navigates back to the home page. |

### Official Channels & Contact
- **YouTube:** `https://www.youtube.com/@TheIconicFaculty`
- **Instagram:** `https://www.instagram.com/the_iconic_faculty`
- **WhatsApp:** `https://wa.me/917780218068`
- **Email:** `contact@iconicfaculty.com`

---

## 2. Typography & Font System

Configured in `app/layout.jsx` via `next/font/google` (`display: "swap"`):

| Role | Google Font | Weights | CSS Variable | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Body & UI** | `Outfit` | `300, 400, 600, 800, 900` | `--font-outfit` | `body` (`line-height: 1.6`), pill navbar links (`font-weight: 700`, `0.8rem`, `letter-spacing: 2px`), buttons, bento labels, particle canvas font (`900`) |
| **Display Headings** | `Playfair Display` | `600, 700, 800` | `--font-playfair` | `h1`, `h2`, `h3` (`line-height: 1.2`), editorial section titles, bento main headline |

### Text Highlight Effect (`.highlight`)
- Uses `color: var(--accent)` (`#E63946`) with an angled `::after` underline (`height: 8px`, `bottom: 5px`, `background: rgba(230, 57, 70, 0.3)`, `transform: skew(-15deg)`).

---

## 3. Color Palette, Accents & Design Tokens

Defined in `:root` inside `app/globals.css`:

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--primary` | `#800000` | Deep maroon brand primary |
| `--primary-light` | `#A52A2A` | Lighter maroon highlight |
| `--primary-dark` | `#4A0000` | Deep maroon shadow tone |
| `--accent` | `#E63946` | Crimson red CTA, active pill, text highlights |
| `--bg-dark` | `#0A0000` | Root dark background |
| `--bg-card` | `rgba(20, 0, 0, 0.4)` | Translucent dark crimson card surface |
| `--text-main` | `#F0E6E6` | Primary warm off-white ink |
| `--text-muted` | `#B3A3A3` | Muted metadata & secondary text |
| `--glass-border` | `rgba(255, 255, 255, 0.1)` | Glassmorphic border |
| `--glass-glow` | `rgba(230, 57, 70, 0.2)` | Crimson glow accent |

- **Atmospheric Layers & Chrome**
  - **Radial Overlay (`.background-overlay`)**: Fixed viewport layer (`z-index: -2`) with two radial gradients (`rgba(128, 0, 0, 0.15)` at `20% 30%`, `rgba(230, 57, 70, 0.1)` at `80% 70%`).
  - **Floating Pill Navbar (`.pill-navbar`)**: Fixed `top: 2rem`, centered (`left: 50%; transform: translateX(-50%)`), `background: rgba(20, 20, 20, 0.8)`, `backdrop-filter: blur(10px)`, `border-radius: 50px`, `box-shadow: 0 10px 30px rgba(0,0,0,0.5)`. Active link tracks scroll position via `IntersectionObserver` (`#about`, `#featured-videos`, `#resources`) and resets to `home` when `window.scrollY < 260`.
  - **Responsive Breakpoints (`app/globals.css`)**:
    - `<= 1200px`: `.dotted-text` scales to `14vw`.
    - `<= 992px`: `.hero-headline` shrinks to `2rem`; `.about-grid` collapses to `1fr`.
    - `<= 768px`: `.pill-navbar` switches to `width: 95%`, `max-width: 400px` with horizontal scroll; `.hero-headline` shrinks to `1.5rem`; `.glass-panel` padding drops to `1.5rem`; `.privacy-container` padding drops to `2rem 1.5rem` with `border-radius: 16px` and `2.2rem` title.
  - **Privacy Policy Page (`app/privacy-policy/page.jsx`)**: `.privacy-container` (`max-width: 900px`, `rgba(18, 12, 12, 0.75)`, `backdrop-filter: blur(16px)`, `border-radius: 24px`), `.privacy-alert-box` (`border-left: 4px solid var(--accent)`), `.privacy-contact-grid` (`repeat(auto-fit, minmax(240px, 1fr))`).

---

## 4. Landing Page Sections (`app/page.jsx`)

1. **Hero (`.hero-new`)**:
   - Screen-reader `<h1>`: *"Iconic Faculty — Free Education for Intermediate Students"*.
   - Full-bleed `ParticleText` rendering `"ICONIC\nFACULTY"`.
   - Subheadline: *"Education is a right, not a business."* + pulsing CTA button `"Join the Revolution"` → YouTube.
2. **About Section (`#about`)**:
   - *"The Truth About College Mafias"* — 2-column grid with narrative + glassmorphic stats panel (`.glass-panel`): **`15`** Years of Experience, **`0`** Rupees Cost, **`∞`** Commitment.
3. **Talks / Featured Videos (`#featured-videos`)**:
   - Horizontal scrolling `.videos-track` of **11** EAMCET & exam strategy YouTube cards (`HlE4Xq4rw_4`, `IhCK9pAgDns`, `8Kckm53RoAk`, `rL-DxQMjxi8`, `8CTfA0DaQYs`, `QMaKeMfOdFE`, `tTovvCcVLG8`, `8xPZ4F8FLTE`, `JhQY1_2H8_k`, `-BxEi28GXxQ`, `1p1xUWuVijU`) using `maxresdefault.jpg` with `hqdefault.jpg` fallback.
4. **Resources Section (`#resources`)**:
   - *"Free Study Resources"* + CTA `"Open Links & Free PDFs →"` linking to `/links`.
5. **Bento Footer (`.bento-footer`)**:
   - **Left (`bento-main`)**: Label `TEACHING`, *"Let's make education free."*, `mailto:contact@iconicfaculty.com`.
   - **Center (`bento-location`)**: Label `CURRENTLY`, *"based out of Hyderabad"*, `<PixelIndiaMap />`.
   - **Right Stack (`bento-col`)**: `LEARN` card (`Watch on YouTube →`) + `PAGES` card (`Home`, `About`, `Talks`, `Resources & PDFs`, `Privacy Policy`).
   - **Bottom Bar**: `FIND ME` (`INSTAGRAM / YOUTUBE / WHATSAPP / PRIVACY POLICY`) + `© 2026 ICONIC FACULTY. ALL RIGHTS RESERVED.`

---

## 5. Interactive Components & Platform Color Map

### `ParticleText.jsx` (`components/ParticleText.jsx`)
- Renders `"ICONIC\nFACULTY"` onto an offscreen canvas (`willReadFrequently: true`, `font: 900 ${baseFontSize}px`, `baseFontSize = Math.min(canvas.width / 5.5, 240)`).
- Samples alpha pixels to spawn physics particles with cursor repulsion (`radius: 110`, `radiusSq: 12100`).
- **Performance optimizations:** Capped DPR, pauses `requestAnimationFrame` when off-screen via `IntersectionObserver`, and respects `prefers-reduced-motion` by falling back to clean static text.

### `PixelIndiaMap.jsx` (`components/PixelIndiaMap.jsx`)
- SVG (`viewBox="0 0 400 370"`) dot-matrix map generated via `useMemo` + ray-casting `isInside(x, y, poly)` on a `step = 2.35`, `scale = 4`, `dotRadius = 2.8` grid.
- Traces **Telangana** (`TELANGANA_POLY`, 60 vertices) and **Hyderabad** (`HYDERABAD_POLY`, 39 vertices).
- Clears a label strip (`x: 41.5–79`, `y: 54–59.5`) for the pulsing beacon + `HYDERABAD, TELANGANA` label, and applies `<filter id="red-glow">` (`feGaussianBlur stdDeviation="3"`) to `#ff3838` Hyderabad dots.

### Platform Auto-Detection & Color Map (`lib/platform.js`, `components/PlatformIcon.jsx`)
| Platform (`icon`) | Label | Hex Color | Category |
| :--- | :--- | :--- | :--- |
| `youtube` | YouTube | `#FF0000` | Social |
| `instagram` | Instagram | `#E1306C` | Social |
| `whatsapp` | WhatsApp | `#25D366` | Social |
| `telegram` | Telegram | `#0088CC` | Social |
| `twitter` | Twitter / X | `#111111` | Social |
| `linkedin` | LinkedIn | `#0A66C2` | Social |
| `facebook` | Facebook | `#1877F2` | Social |
| `phone` | Phone / Call | `#10B981` | Booking |
| `email` | Email | `#EA4335` | Resources |
| `pdf` | PDF Document | `#DC2626` | Resources |
| `website` | Website | `#800000` | Resources |
| `link` | Other Link | `#6B7280` | Other |

---

## 6. Complete Route, Backend & Database Architecture

### Routes & Page Specs
- **`/`** (`app/page.jsx`): Public landing page.
- **`/links`** (`app/links/page.jsx`, `LinksBoard.jsx`):
  - Brand header with clickable `IF` monogram `<Link href="/">` badge, `"OFFICIAL LINK HUB"` eyebrow, `"Iconic Faculty"` `<h1>` (clean accent text), and subtitle.
  - Live search input (`Search links & PDFs...`), category filter chips (`All`, `Social`, `Booking`, `Resources`, `Other`), and tracked external/PDF cards (`<a href="/l/<slug>">`) firing `POST /api/links/event` (`type: "view"` on load, `type: "click"` on click).
- **`/admin`** (`app/admin/page.jsx`, `AdminStudio.jsx`):
  - Protected by Google OAuth allowlist (`lib/auth.js`).
  - **Tabs:** `Links` (Add Link form + Upload PDF form, per-link Move Up/Down, Toggle Live/Hidden, Inline Edit, Delete to Recycle Bin, per-link Analytics toggle), `Analytics` (Total Views, Total Clicks, Top Sources, Device Split `desktop`/`mobile`/`tablet`), and **Recycle Bin** (30-day countdown per item, **Restore**, **Delete Forever**).
- **`/signin`** (`app/signin/page.jsx`, `SignInCard.jsx`), **`/auth/callback`**, **`/auth/signout`**: Google OAuth flow (`next` validated as relative path).
- **`/privacy-policy`** (`app/privacy-policy/page.jsx`): Privacy Policy page.

### API & Shortlink Contracts
- **`GET /l/[slug]`** (`app/l/[slug]/route.js`):
  - Looks up active, non-deleted link by `slug`; redirects to `/links` if missing.
  - Logs `{ type: "click", link_id, source: "Shortlink", device }` via `recordEvent`.
  - Redirects `307` to `/pdfs/<slug>.pdf` (if `icon === "pdf"`) or `link.url`.
- **`GET /pdfs/[slug]`** (`app/pdfs/[slug]/route.js`):
  - Looks up active `icon === "pdf"` link by `slug` (strips `.pdf` suffix); returns `404` if missing.
  - Reads local `data/pdfs/<file>` or fetches upstream `link.url`; returns `200` with `Content-Type: application/pdf`, `Content-Disposition: inline; filename="<slug>.pdf"`, `Cache-Control: public, max-age=3600`.
- **`POST /api/links/event`** (`app/api/links/event/route.js`):
  - Request JSON: `{ type: "view" | "click", id?: string (UUID), source?: string (max 60 chars) }`.
  - Parses `device` (`desktop` | `mobile` | `tablet`) from `User-Agent`, calls `recordEvent`, returns `200 { ok: true }` (or `400 { ok: false }`).
- **`GET /api/pdfs/[filename]`** (`app/api/pdfs/[filename]/route.js`):
  - Validates `.pdf` extension with `path.basename`; reads from `data/pdfs/`; returns `200` with `Content-Type: application/pdf`, `Content-Disposition: inline; filename="<safeName>"`, `Cache-Control: public, max-age=31536000, immutable`.

### Supabase Schema (`supabase/migrations/`)
Shared Supabase project (`xoqflwfvgpdrzraqicja`) with isolated Iconic Faculty tables & bucket:
- **`0001_iconic_links.sql`**:
  - `public.iconic_social_links`: `id` (`uuid` PK), `title`, `url`, `slug` (`unique`), `icon`, `description`, `category`, `sort_order`, `is_active`, `created_at`, `updated_at` (with `iconic_touch_updated_at()` trigger + RLS `iconic_social_links_public_select` for `is_active = true`).
  - `public.iconic_link_events`: `id` (`uuid` PK), `type` (`'view' | 'click'`), `link_id` (FK → `iconic_social_links` `on delete set null`), `occurred_at`, `source`, `device` (RLS enabled).
  - Seeds 4 default rows (`youtube-lectures`, `whatsapp-help`, `instagram`, `website`).
- **`0002_iconic_recycle_bin.sql`**:
  - Adds `deleted_at timestamptz` and index `iconic_social_links_deleted_idx` to `public.iconic_social_links`.
- **Storage Bucket:** `iconic-pdfs` (public bucket; local fallback `data/pdfs/`).

### Server Actions, Security & Fallback (`lib/links-store.js`, `lib/pdf-storage.js`, `app/admin/actions.js`)
- **PDF Security (`lib/pdf-storage.js`)**: Checks `%PDF-` magic bytes + `.pdf` extension, sanitizes filenames (`Date.now()-<slug>.pdf`), and cleans up old PDFs from storage on replace or permanent delete.
- **30-Day Recycle Bin (`lib/links-store.js`)**: `purgeExpiredTrash()` removes items with `deleted_at` older than 30 days (and deletes their PDFs); `deleteLinkById()` soft-deletes (`is_active: false`, `deleted_at: now`); `restoreLinkById()` clears `deleted_at`; `permanentDeleteLinkById()` hard-deletes row + PDF.
- **JSON Seed Fallback (`data/links-store.json`)**: Used when Supabase env vars are not configured; enforces unique slug checks and throws on Supabase write errors.

---

## 7. Environment Variables & Commands
- **`.env` keys:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, plus admin email allowlist (`ADMIN_EMAILS` / `lib/auth.js`).
- **Commands:** `npm run dev` | `npm run lint` | `npm run build`
