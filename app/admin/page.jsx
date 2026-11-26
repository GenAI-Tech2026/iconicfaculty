import { requireLinkManager } from "../../lib/auth";
import { getAllLinks, getTrashedLinks, getEvents } from "../../lib/links-store";
import { AdminStudio } from "./AdminStudio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Link Studio — Iconic Faculty Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const profile = await requireLinkManager();
  const [links, trashedLinks, events] = await Promise.all([
    getAllLinks(),
    getTrashedLinks(),
    getEvents(),
  ]);
  return (
    <AdminStudio
      links={links}
      trashedLinks={trashedLinks}
      events={events}
      adminName={profile.full_name || profile.email || "Admin"}
    />
  );
}
