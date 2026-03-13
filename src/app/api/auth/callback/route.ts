import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawRedirect = searchParams.get("redirect") || "/chat";
  // Ensure redirect is a relative path to prevent open redirect
  const redirect = rawRedirect.startsWith("/") ? rawRedirect : "/chat";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure profile exists
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Use upsert to avoid race condition with auth trigger
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email || "",
            display_name:
              user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // Auth code exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
