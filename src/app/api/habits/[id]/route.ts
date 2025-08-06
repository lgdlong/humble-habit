// src/app/api/habits/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  getAuthenticatedUser,
} from "@/lib/supabase-server";

// GET /api/habits/[id] - get a single habit for the logged-in user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  console.log("[GET] params.id:", id);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("[GET] habits error:", error);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  console.log("[GET] habits data:", data);
  return NextResponse.json(data);
}

// PATCH /api/habits/[id] - update a habit
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name } = body;

  // Validate name
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid habit name" }, { status: 400 });
  }

  // Trim and validate length
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return NextResponse.json({ error: "Invalid habit name" }, { status: 400 });
  }

  if (trimmedName.length > 50) {
    return NextResponse.json(
      { error: "Habit name too long (max 50 characters)" },
      { status: 400 },
    );
  }

  console.log("[PATCH] params.id:", id, "body:", body);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("habits")
    .update({ name: trimmedName })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[PATCH] update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[PATCH] update data:", data);
  return NextResponse.json(data);
}

// DELETE /api/habits/[id] - delete a habit
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  console.log("[DELETE] params.id:", id);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[DELETE] delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[DELETE] delete success for id:", id);
  return NextResponse.json({ success: true });
}
