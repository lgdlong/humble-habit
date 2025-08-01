"use client";

import { create } from "zustand";
import { supabase, type HabitEntry } from "@/lib/supabase";
import { format } from "date-fns";

interface HabitState {
  habitEntries: Record<string, HabitEntry>;
  currentDate: Date;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentDate: (date: Date) => void;
  loadHabitEntry: (date: Date, userId: string) => Promise<void>;
  updateHabitEntry: (
    date: Date,
    userId: string,
    habit1: boolean,
    habit2: boolean
  ) => Promise<void>;
  loadMonthEntries: (
    year: number,
    month: number,
    userId: string
  ) => Promise<void>;
}

export const useHabitStore = create<HabitState>()((set) => ({
  habitEntries: {},
  currentDate: new Date(),
  isLoading: false,
  error: null,

  setCurrentDate: (date: Date) => {
    set({ currentDate: date });
  },

  loadHabitEntry: async (date: Date, userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const dateString = format(date, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("habit_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateString)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      const entry = data || {
        id: "",
        user_id: userId,
        date: dateString,
        habit_1_completed: false,
        habit_2_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set((state) => ({
        habitEntries: {
          ...state.habitEntries,
          [dateString]: entry,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading habit entry:", error);
      set({ error: "Failed to load habit entry", isLoading: false });
    }
  },

  updateHabitEntry: async (
    date: Date,
    userId: string,
    habit1: boolean,
    habit2: boolean
  ) => {
    set({ isLoading: true, error: null });

    try {
      const dateString = format(date, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("habit_entries")
        .upsert({
          user_id: userId,
          date: dateString,
          habit_1_completed: habit1,
          habit_2_completed: habit2,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        habitEntries: {
          ...state.habitEntries,
          [dateString]: data,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating habit entry:", error);
      set({ error: "Failed to update habit entry", isLoading: false });
    }
  },

  loadMonthEntries: async (year: number, month: number, userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const startDate = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
      const endDate = format(new Date(year, month, 0), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("habit_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate);

      if (error) throw error;

      const entriesMap: Record<string, HabitEntry> = {};
      data?.forEach((entry) => {
        entriesMap[entry.date] = entry;
      });

      set((state) => ({
        habitEntries: {
          ...state.habitEntries,
          ...entriesMap,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading month entries:", error);
      set({ error: "Failed to load month entries", isLoading: false });
    }
  },
}));
