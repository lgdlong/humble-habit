import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  getAuthenticatedUser,
} from "@/lib/supabase-server";

// GET /api/habit-records/[id] - get a single habit record for the logged-in user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("habit_records")
    .select(
      `
      *,
      habits!inner(name)
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH /api/habit-records/[id] - update a habit record
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
  const { status } = body;

  if (typeof status !== "boolean") {
    return NextResponse.json(
      { error: "Status must be a boolean value" },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("habit_records")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(
      `
      *,
      habits!inner(name)
    `,
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/habit-records/[id] - delete a habit record
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("habit_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
