import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { WeeklyHabitDTO, WeekdayId } from "@/types/weeklyHabit";

// Mock storage for weekly habits (in a real app, this would be in the database)
// This is a temporary solution since the actual database schema isn't set up yet
const mockWeeklyHabits: Record<string, WeeklyHabitDTO> = {};

// Helper function to create Supabase client
async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
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
}

// Helper function to get authenticated user
async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error("Unauthorized");
  }
  
  return user;
}

// GET /api/weekly-habits - get weekly habit for the logged-in user
export async function GET() {
  try {
    const user = await getUser();
    
    // Find weekly habit for this user
    const weeklyHabit = Object.values(mockWeeklyHabits).find(
      (habit) => habit.user_id === user.id
    );
    
    return NextResponse.json({ weeklyHabit: weeklyHabit || null });
  } catch (error) {
    console.error("[GET] weekly-habits error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/weekly-habits - create a new weekly habit
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    const body = await req.json();
    
    const { title, days }: { title: string; days: WeekdayId[] } = body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    
    if (title.length > 64) {
      return NextResponse.json({ error: "Title too long (max 64 characters)" }, { status: 400 });
    }
    
    if (!days || days.length === 0) {
      return NextResponse.json({ error: "At least one day must be selected" }, { status: 400 });
    }
    
    // Check if user already has a weekly habit
    const existingHabit = Object.values(mockWeeklyHabits).find(
      (habit) => habit.user_id === user.id
    );
    
    if (existingHabit) {
      return NextResponse.json({ error: "User already has a weekly habit" }, { status: 400 });
    }
    
    // Create new weekly habit
    const newHabit: WeeklyHabitDTO = {
      id: crypto.randomUUID(),
      user_id: user.id,
      title: title.trim(),
      days: [...new Set(days)], // Remove duplicates
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockWeeklyHabits[newHabit.id] = newHabit;
    
    return NextResponse.json(newHabit);
  } catch (error) {
    console.error("[POST] weekly-habits error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PATCH /api/weekly-habits - update weekly habit (rename/reschedule)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser();
    const body = await req.json();
    
    const { id, title, days }: { id: string; title?: string; days?: WeekdayId[] } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Weekly habit ID is required" }, { status: 400 });
    }
    
    const habit = mockWeeklyHabits[id];
    if (!habit) {
      return NextResponse.json({ error: "Weekly habit not found" }, { status: 404 });
    }
    
    if (habit.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Validate title if provided
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      if (title.length > 64) {
        return NextResponse.json({ error: "Title too long (max 64 characters)" }, { status: 400 });
      }
    }
    
    // Validate days if provided
    if (days !== undefined) {
      if (!days || days.length === 0) {
        return NextResponse.json({ error: "At least one day must be selected" }, { status: 400 });
      }
    }
    
    // Update habit
    const updatedHabit: WeeklyHabitDTO = {
      ...habit,
      title: title !== undefined ? title.trim() : habit.title,
      days: days !== undefined ? [...new Set(days)] : habit.days,
      updated_at: new Date().toISOString(),
    };
    
    mockWeeklyHabits[id] = updatedHabit;
    
    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error("[PATCH] weekly-habits error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// DELETE /api/weekly-habits - delete weekly habit
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Weekly habit ID is required" }, { status: 400 });
    }
    
    const habit = mockWeeklyHabits[id];
    if (!habit) {
      return NextResponse.json({ error: "Weekly habit not found" }, { status: 404 });
    }
    
    if (habit.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Delete the habit
    delete mockWeeklyHabits[id];
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE] weekly-habits error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}