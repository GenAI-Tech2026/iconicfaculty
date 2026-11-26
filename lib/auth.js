import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

function supabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const getSessionUser = cache(async () => {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async () => {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    ...data,
    can_manage_links: data.can_manage_links ?? false,
  };
});

export function isLinkManager(profile) {
  return (
    !!profile &&
    (profile.role === "admin" ||
      profile.role === "marketer" ||
      profile.role === "content_admin" ||
      profile.can_manage_links)
  );
}

export async function requireLinkManager() {
  const profile = await getProfile();
  if (!profile) redirect("/signin?next=/admin");
  if (!isLinkManager(profile)) redirect("/signin?error=unauthorized");
  return profile;
}
