import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

// PATCH /api/habits/[id]/rename - rename a habit with validation
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  console.log("[PATCH RENAME] sb-access-token:", accessToken);

  if (!accessToken) {
    console.warn("[PATCH RENAME] No access token.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);
  if (userError) console.error("[PATCH RENAME] userError:", userError);
  console.log("[PATCH RENAME] user:", user);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name } = body;

  console.log("[PATCH RENAME] params.id:", id, "body:", body);

  // Validate name is provided
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Habit name is required" }, { status: 400 });
  }

  // Trim and validate length
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return NextResponse.json({ error: "Habit name cannot be empty" }, { status: 400 });
  }

  if (trimmedName.length > 50) {
    return NextResponse.json(
      { error: "Habit name too long (max 50 characters)" },
      { status: 400 }
    );
  }

  // Check if habit exists and belongs to user
  const { data: existingHabit, error: habitError } = await supabase
    .from("habits")
    .select("id, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (habitError || !existingHabit) {
    console.error("[PATCH RENAME] habit not found:", habitError);
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  // Check if the new name is different from current name
  if (existingHabit.name === trimmedName) {
    return NextResponse.json(existingHabit, { status: 200 });
  }

  // Check for duplicate names with other habits of the same user
  const { data: duplicateHabits, error: duplicateError } = await supabase
    .from("habits")
    .select("id, name")
    .eq("user_id", user.id)
    .neq("id", id) // Exclude the current habit
    .ilike("name", trimmedName); // Case-insensitive comparison

  if (duplicateError) {
    console.error("[PATCH RENAME] duplicateError:", duplicateError);
    return NextResponse.json({ error: duplicateError.message }, { status: 500 });
  }

  if (duplicateHabits && duplicateHabits.length > 0) {
    return NextResponse.json(
      { error: "A habit with this name already exists" },
      { status: 400 }
    );
  }

  // Update the habit name
  const { data, error } = await supabase
    .from("habits")
    .update({ name: trimmedName })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[PATCH RENAME] update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[PATCH RENAME] update data:", data);
  return NextResponse.json(data);
}