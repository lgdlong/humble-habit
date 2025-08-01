import { createClient } from "@supabase/supabase-js";
import type { User, Habit, HabitRecord, Quote } from "../types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Legacy database types (current schema)
export interface HabitEntry {
  id: string;
  user_id: string;
  date: string;
  habit_1_completed: boolean;
  habit_2_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

// Type mappings for the flexible schema
export type Database = {
  public: {
    Tables: {
      habits: {
        Row: Habit;
        Insert: Omit<Habit, "id" | "created_at">;
        Update: Partial<Omit<Habit, "id" | "user_id">>;
      };
      habit_records: {
        Row: HabitRecord;
        Insert: Omit<HabitRecord, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<HabitRecord, "id" | "user_id" | "habit_id">>;
      };
      quotes: {
        Row: Quote;
        Insert: Omit<Quote, "id" | "created_at">;
        Update: Partial<Omit<Quote, "id">>;
      };
    };
  };
};
