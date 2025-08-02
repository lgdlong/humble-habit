import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/habits - get all habits for the logged-in user
export async function GET() {
  const cookieStore = await cookies();

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
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[GET] user:", user);
  if (userError) console.error("[GET] userError:", userError);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id);

  console.log("[GET] habits data:", data);
  if (error) console.error("[GET] habits error:", error);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/habits - create a new habit for the logged-in user
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();

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
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[POST] user:", user);
  if (userError) console.error("[POST] userError:", userError);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log("[POST] request body:", body);

  const { name } = body;

  // Check current habit count for user
  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", user.id);

  if (habitsError) {
    console.error("[POST] habitsError:", habitsError);
    return NextResponse.json({ error: habitsError.message }, { status: 500 });
  }

  if (habits && habits.length >= 2) {
    return NextResponse.json(
      { error: "Maximum 2 habits allowed." },
      { status: 400 }
    );
  }

  // Use a transaction to prevent race conditions
  // the `create_habit_with_limit` function should be defined in your Supabase SQL
  // the sql plain text in supabase/sql/01_create_habit_with_limit.sql
  const { data, error } = await supabase.rpc("create_habit_with_limit", {
    p_user_id: user.id,
    p_name: name,
    p_max_habits: 2,
  });

  console.log("[POST] insert data:", data);
  if (error) console.error("[POST] insert error:", error);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
