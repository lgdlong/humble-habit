import { createClient } from "@supabase/supabase-js";
import type { Habit, HabitRecord, Quote } from "../types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
