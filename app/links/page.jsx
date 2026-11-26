import { getActiveLinks } from "../../lib/links-store";
import { LinksBoard } from "./LinksBoard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Iconic Faculty — Links",
  description: "All Iconic Faculty links, lectures, notes & channels in one place.",
};

export default async function LinksPage() {
  const links = await getActiveLinks();
  return <LinksBoard links={links} />;
}
