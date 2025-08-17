import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/lib/supabase-server";

// GET /api/weekly-habit-records - get weekly habit records for the logged-in user
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("weekly_habit_records")
      .select(`
        *,
        weekly_habits!inner(title)
      `)
      .eq("user_id", user.id)
      .eq("date", dateParam);

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error("Error fetching weekly habit records:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch weekly habit records" },
      { status: 500 }
    );
  }
}

// POST /api/weekly-habit-records - create/update a weekly habit record for the logged-in user  
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();
    const { weekly_habit_id, date, status } = body;

    // Validation
    if (!weekly_habit_id) {
      return NextResponse.json({ error: "Weekly habit ID is required" }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    if (typeof status !== "boolean") {
      return NextResponse.json({ error: "Status must be a boolean" }, { status: 400 });
    }

    // Verify that the weekly habit belongs to the user
    const { data: weeklyHabit, error: habitError } = await supabase
      .from("weekly_habits")
      .select("id")
      .eq("id", weekly_habit_id)
      .eq("user_id", user.id)
      .single();

    if (habitError || !weeklyHabit) {
      return NextResponse.json({ error: "Weekly habit not found" }, { status: 404 });
    }

    // Upsert the weekly habit record
    const { data, error } = await supabase
      .from("weekly_habit_records")
      .upsert({
        user_id: user.id,
        weekly_habit_id,
        date,
        status,
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        weekly_habits!inner(title)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error creating/updating weekly habit record:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update weekly habit record" },
      { status: 500 }
    );
  }
}