import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/admin";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata ?? {};
          await createAdminClient()
            .from("profiles")
            .upsert(
              {
                id: user.id,
                email: user.email ?? null,
                full_name: meta.full_name ?? meta.name ?? null,
                avatar_url: meta.avatar_url ?? meta.picture ?? null,
              },
              { onConflict: "id", ignoreDuplicates: true },
            );
        }
      } catch {
        // ignore safety-net errors
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_failed`);
}
