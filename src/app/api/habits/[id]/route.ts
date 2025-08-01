import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

// GET /api/habits/[id] - get a single habit for the logged-in user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  console.log("[GET] sb-access-token:", accessToken);

  if (!accessToken) {
    console.warn("[GET] No access token.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);
  if (userError) console.error("[GET] userError:", userError);
  console.log("[GET] user:", user);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  console.log("[GET] params.id:", id);

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
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  console.log("[PATCH] sb-access-token:", accessToken);

  if (!accessToken) {
    console.warn("[PATCH] No access token.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);
  if (userError) console.error("[PATCH] userError:", userError);
  console.log("[PATCH] user:", user);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name } = body;
  console.log("[PATCH] params.id:", id, "body:", body);

  const { data, error } = await supabase
    .from("habits")
    .update({ name })
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
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  console.log("[DELETE] sb-access-token:", accessToken);

  if (!accessToken) {
    console.warn("[DELETE] No access token.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);
  if (userError) console.error("[DELETE] userError:", userError);
  console.log("[DELETE] user:", user);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  console.log("[DELETE] params.id:", id);

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
