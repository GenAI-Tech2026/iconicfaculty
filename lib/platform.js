export const PLATFORMS = [
  { value: "youtube", label: "YouTube", color: "#FF0000", category: "Social" },
  { value: "instagram", label: "Instagram", color: "#E1306C", category: "Social" },
  { value: "whatsapp", label: "WhatsApp", color: "#25D366", category: "Social" },
  { value: "telegram", label: "Telegram", color: "#0088CC", category: "Social" },
  { value: "twitter", label: "Twitter / X", color: "#111111", category: "Social" },
  { value: "linkedin", label: "LinkedIn", color: "#0A66C2", category: "Social" },
  { value: "facebook", label: "Facebook", color: "#1877F2", category: "Social" },
  { value: "phone", label: "Phone / Call", color: "#10B981", category: "Booking" },
  { value: "email", label: "Email", color: "#EA4335", category: "Resources" },
  { value: "website", label: "Website", color: "#800000", category: "Resources" },
  { value: "link", label: "Other Link", color: "#6B7280", category: "Other" },
];

export function detectPlatform(rawUrl) {
  const u = String(rawUrl || "").trim().toLowerCase();
  if (!u) return "link";
  if (u.startsWith("mailto:")) return "email";
  if (u.startsWith("tel:")) return "phone";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com") || u.includes("ig.me")) return "instagram";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  if (u.includes("t.me") || u.includes("telegram.")) return "telegram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
  if (u.startsWith("http://") || u.startsWith("https://")) return "website";
  return "link";
}

export function platformLabel(icon) {
  return PLATFORMS.find((p) => p.value === icon)?.label ?? "Link";
}

export function platformColor(icon) {
  return PLATFORMS.find((p) => p.value === icon)?.color ?? "#6B7280";
}

export function categoryForIcon(icon) {
  return PLATFORMS.find((p) => p.value === icon)?.category ?? "Other";
}

export function makeSlug(title, customSlug) {
  const base = String(customSlug || title || "link")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (customSlug && base) return base;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "link"}-${suffix}`;
}
