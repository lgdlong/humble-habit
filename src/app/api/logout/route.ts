import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Logout successful");

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Unexpected error during logout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
