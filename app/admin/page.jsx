import { requireLinkManager } from "../../lib/auth";
import { getAllLinks, getEvents } from "../../lib/links-store";
import { AdminStudio } from "./AdminStudio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Link Studio — Iconic Faculty Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const profile = await requireLinkManager();
  const [links, events] = await Promise.all([getAllLinks(), getEvents()]);
  return (
    <AdminStudio
      links={links}
      events={events}
      adminName={profile.full_name || profile.email || "Admin"}
    />
  );
}
