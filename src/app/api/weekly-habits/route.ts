import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, getAuthenticatedUser } from "@/lib/supabase-server";
import type { WeekdayId, WeeklyHabitDTO } from "@/types/weeklyHabit";

// GET /api/weekly-habits - get weekly habit for the logged-in user
export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  try {
    // Get weekly habit for user with associated days
    const { data: weeklyHabitData, error: weeklyHabitError } = await supabase
      .from("weekly_habits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (weeklyHabitError && weeklyHabitError.code !== "PGRST116") {
      // PGRST116 is "no rows found" - not an error for our case
      throw weeklyHabitError;
    }

    if (!weeklyHabitData) {
      // No weekly habit found
      return NextResponse.json({ weeklyHabit: null });
    }

    // Get associated days for the weekly habit
    const { data: daysData, error: daysError } = await supabase
      .from("weekly_habit_days")
      .select("day_id")
      .eq("weekly_habit_id", weeklyHabitData.id);

    if (daysError) {
      throw daysError;
    }

    const weeklyHabit: WeeklyHabitDTO = {
      ...weeklyHabitData,
      days: daysData?.map(d => d.day_id as WeekdayId) || [],
    };

    return NextResponse.json({ weeklyHabit });

  } catch (error) {
    console.error("Error fetching weekly habit:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch weekly habit" },
      { status: 500 }
    );
  }
}

// POST /api/weekly-habits - create a new weekly habit for the logged-in user
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();
    const { title, days } = body;

    // Validation
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    if (trimmedTitle.length > 64) {
      return NextResponse.json({ error: "Title too long (max 64 characters)" }, { status: 400 });
    }

    if (!Array.isArray(days) || days.length === 0) {
      return NextResponse.json({ error: "Days array is required and cannot be empty" }, { status: 400 });
    }

    // Validate days array
    const validDays = [1, 2, 3, 4, 5, 6, 7];
    const uniqueDays = [...new Set(days)];
    
    if (uniqueDays.some(day => !validDays.includes(day))) {
      return NextResponse.json({ error: "Invalid day values. Must be 1-7" }, { status: 400 });
    }

    // Check if user already has a weekly habit
    const { data: existingWeeklyHabit, error: existingError } = await supabase
      .from("weekly_habits")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      throw existingError;
    }

    if (existingWeeklyHabit) {
      return NextResponse.json({ error: "User already has a weekly habit" }, { status: 400 });
    }

    // Create weekly habit
    const { data: weeklyHabitData, error: createError } = await supabase
      .from("weekly_habits")
      .insert({
        user_id: user.id,
        title: trimmedTitle,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Insert weekly habit days
    const dayInserts = uniqueDays.map(day => ({
      weekly_habit_id: weeklyHabitData.id,
      day_id: day,
    }));

    const { error: daysError } = await supabase
      .from("weekly_habit_days")
      .insert(dayInserts);

    if (daysError) {
      // Rollback weekly habit if days insertion fails
      await supabase
        .from("weekly_habits")
        .delete()
        .eq("id", weeklyHabitData.id);
      throw daysError;
    }

    const weeklyHabit: WeeklyHabitDTO = {
      ...weeklyHabitData,
      days: uniqueDays as WeekdayId[],
    };

    return NextResponse.json(weeklyHabit);

  } catch (error) {
    console.error("Error creating weekly habit:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create weekly habit" },
      { status: 500 }
    );
  }
}

// PATCH /api/weekly-habits - update weekly habit for the logged-in user
export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();
    const { id, title, days } = body;

    if (!id) {
      return NextResponse.json({ error: "Weekly habit ID is required" }, { status: 400 });
    }

    // Verify ownership
    const { data: existingHabit, error: existingError } = await supabase
      .from("weekly_habits")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (existingError || !existingHabit) {
      return NextResponse.json({ error: "Weekly habit not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    // Validate and update title if provided
    if (title !== undefined) {
      if (typeof title !== "string") {
        return NextResponse.json({ error: "Title must be a string" }, { status: 400 });
      }

      const trimmedTitle = title.trim();
      if (trimmedTitle.length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }

      if (trimmedTitle.length > 64) {
        return NextResponse.json({ error: "Title too long (max 64 characters)" }, { status: 400 });
      }

      updates.title = trimmedTitle;
    }

    // Update weekly habit if title changed
    let updatedHabit = existingHabit;
    if (Object.keys(updates).length > 0) {
      const { data: updateData, error: updateError } = await supabase
        .from("weekly_habits")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      updatedHabit = updateData;
    }

    // Update days if provided
    let finalDays: WeekdayId[] = [];
    if (days !== undefined) {
      if (!Array.isArray(days) || days.length === 0) {
        return NextResponse.json({ error: "Days array is required and cannot be empty" }, { status: 400 });
      }

      // Validate days array
      const validDays = [1, 2, 3, 4, 5, 6, 7];
      const uniqueDays = [...new Set(days)];
      
      if (uniqueDays.some(day => !validDays.includes(day))) {
        return NextResponse.json({ error: "Invalid day values. Must be 1-7" }, { status: 400 });
      }

      // Delete existing days and insert new ones
      const { error: deleteError } = await supabase
        .from("weekly_habit_days")
        .delete()
        .eq("weekly_habit_id", id);

      if (deleteError) {
        throw deleteError;
      }

      // Insert new days
      const dayInserts = uniqueDays.map(day => ({
        weekly_habit_id: id,
        day_id: day,
      }));

      const { error: insertError } = await supabase
        .from("weekly_habit_days")
        .insert(dayInserts);

      if (insertError) {
        throw insertError;
      }

      finalDays = uniqueDays as WeekdayId[];
    } else {
      // Get current days
      const { data: currentDaysData, error: daysError } = await supabase
        .from("weekly_habit_days")
        .select("day_id")
        .eq("weekly_habit_id", id);

      if (daysError) {
        throw daysError;
      }

      finalDays = currentDaysData?.map(d => d.day_id as WeekdayId) || [];
    }

    const weeklyHabit: WeeklyHabitDTO = {
      ...updatedHabit,
      days: finalDays,
    };

    return NextResponse.json(weeklyHabit);

  } catch (error) {
    console.error("Error updating weekly habit:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update weekly habit" },
      { status: 500 }
    );
  }
}

// DELETE /api/weekly-habits - delete weekly habit for the logged-in user
export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Weekly habit ID is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  try {
    // Verify ownership and delete
    const { error: deleteError } = await supabase
      .from("weekly_habits")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting weekly habit:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete weekly habit" },
      { status: 500 }
    );
  }
}