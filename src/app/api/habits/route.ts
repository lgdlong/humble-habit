import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

// GET /api/habits - get all habits for the logged-in user
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  console.log("[GET] sb-access-token:", accessToken);

  if (!accessToken) {
    console.warn("[GET] No access token found.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);
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
  const accessToken = cookieStore.get("sb-access-token")?.value;
  console.log("[POST] sb-access-token:", accessToken);

  if (!accessToken) {
    console.warn("[POST] No access token found.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);
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

  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: user.id, name })
    .select()
    .single();

  console.log("[POST] insert data:", data);
  if (error) console.error("[POST] insert error:", error);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
