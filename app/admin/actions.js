"use server";

import { revalidatePath } from "next/cache";
import { getProfile, isLinkManager } from "../../lib/auth";
import { uploadPdf } from "../../lib/pdf-storage";
import {
  addLink,
  updateLinkById,
  toggleLinkById,
  deleteLinkById,
  moveLinkById,
} from "../../lib/links-store";

async function assertLinkManager() {
  const profile = await getProfile();
  if (!isLinkManager(profile)) {
    throw new Error("Forbidden");
  }
}

export async function createLink(formData) {
  await assertLinkManager();
  let title = String(formData.get("title") ?? "").trim();
  let url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const pdfFile = formData.get("pdfFile");

  if (pdfFile && typeof pdfFile === "object" && pdfFile.size > 0) {
    const uploadedUrl = await uploadPdf(pdfFile);
    if (uploadedUrl) {
      url = uploadedUrl;
      if (!title) {
        title = String(pdfFile.name || "PDF Document")
          .replace(/\.pdf$/i, "")
          .replace(/[-_]+/g, " ")
          .trim();
      }
    }
  }

  if (!title || !url) return;
  await addLink({ title, url, description, slug, category });
  revalidatePath("/admin");
  revalidatePath("/links");
}

export async function updateLink(formData) {
  await assertLinkManager();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  let url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const pdfFile = formData.get("pdfFile");

  if (pdfFile && typeof pdfFile === "object" && pdfFile.size > 0) {
    const uploadedUrl = await uploadPdf(pdfFile);
    if (uploadedUrl) url = uploadedUrl;
  }

  if (!id || !title || !url) return;
  await updateLinkById(id, { title, url, description, slug, category });
  revalidatePath("/admin");
  revalidatePath("/links");
}

export async function toggleLink(formData) {
  await assertLinkManager();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await toggleLinkById(id);
  revalidatePath("/admin");
  revalidatePath("/links");
}

export async function deleteLink(formData) {
  await assertLinkManager();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteLinkById(id);
  revalidatePath("/admin");
  revalidatePath("/links");
}

export async function moveLink(formData) {
  await assertLinkManager();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "up");
  if (!id) return;
  await moveLinkById(id, direction === "down" ? "down" : "up");
  revalidatePath("/admin");
  revalidatePath("/links");
}
