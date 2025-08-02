import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  getAuthenticatedUser,
} from "@/lib/supabase-server";

// GET /api/habit-records - get all habit records for the logged-in user
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get habit records from 'habit_records' table
  const { data, error } = await supabase
    .from("habit_records")
    .select(`*, habits!inner(name)`)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/habit-records - create a new habit record for the logged-in user
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { habit_id, date, status } = body;
  const { data, error } = await supabase
    .from("habit_records")
    .upsert({
      user_id: user.id,
      habit_id,
      date,
      status,
      updated_at: new Date().toISOString(),
    })
    .select(`*, habits!inner(name)`)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
