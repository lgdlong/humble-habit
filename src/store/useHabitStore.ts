"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Habit, HabitRecord } from "@/types";
import { format } from "date-fns";

interface HabitState {
  habits: Habit[];
  habitRecords: Record<string, HabitRecord[]>; // date -> habit records for that date
  currentDate: Date;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentDate: (date: Date) => void;
  loadHabits: (userId: string) => Promise<void>;
  createHabit: (userId: string, name: string) => Promise<void>;
  updateHabit: (
    habitId: string,
    updates: Partial<Pick<Habit, "name">>
  ) => Promise<void>;
  renameHabit: (habitId: string, name: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  loadHabitRecords: (date: Date, userId: string) => Promise<void>;
  updateHabitRecord: (
    userId: string,
    habitId: string,
    date: Date,
    status: boolean
  ) => Promise<void>;
  loadMonthRecords: (
    year: number,
    month: number,
    userId: string
  ) => Promise<void>;
}

export const useHabitStore = create<HabitState>()((set) => ({
  habits: [],
  habitRecords: {},
  currentDate: new Date(),
  isLoading: false,
  error: null,

  setCurrentDate: (date: Date) => {
    set({ currentDate: date });
  },

  loadHabits: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      set({ habits: data || [], isLoading: false });
    } catch (error) {
      console.error("Error loading habits:", error);
      set({ error: "Failed to load habits", isLoading: false });
    }
  },

  createHabit: async (userId: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("habits")
        .insert({ user_id: userId, name })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        habits: [...state.habits, data],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error creating habit:", error);
      set({ error: "Failed to create habit", isLoading: false });
    }
  },

  updateHabit: async (
    habitId: string,
    updates: Partial<Pick<Habit, "name">>
  ) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", habitId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === habitId ? data : habit
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating habit:", error);
      set({ error: "Failed to update habit", isLoading: false });
    }
  },

  renameHabit: async (habitId: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/habits/${habitId}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to rename habit");
      }

      const data = await response.json();

      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === habitId ? data : habit
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error renaming habit:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to rename habit";
      set({ error: errorMessage, isLoading: false });
      throw error; // Re-throw to allow UI components to handle the error
    }
  },

  deleteHabit: async (habitId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.filter((habit) => habit.id !== habitId),
        // Also remove related habit records
        habitRecords: Object.entries(state.habitRecords).reduce(
          (acc, [date, records]) => {
            const filtered = records.filter(
              (record) => record.habit_id !== habitId
            );
            if (filtered.length > 0) {
              acc[date] = filtered;
            }
            return acc;
          },
          {} as Record<string, HabitRecord[]>
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error deleting habit:", error);
      set({ error: "Failed to delete habit", isLoading: false });
    }
  },

  loadHabitRecords: async (date: Date, userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const dateString = format(date, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("habit_records")
        .select(
          `
          *,
          habits!inner(name)
        `
        )
        .eq("user_id", userId)
        .eq("date", dateString);

      if (error) throw error;

      set((state) => ({
        habitRecords: {
          ...state.habitRecords,
          [dateString]: data || [],
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading habit records:", error);
      set({ error: "Failed to load habit records", isLoading: false });
    }
  },

  updateHabitRecord: async (
    userId: string,
    habitId: string,
    date: Date,
    status: boolean
  ) => {
    // Set loading state and clear previous error
    set({ isLoading: true, error: null });

    try {
      const dateString = format(date, "yyyy-MM-dd");

      // Perform upsert to either insert or update the record for this user/habit/date
      // Use onConflict to ensure upsert works on (user_id, habit_id, date) as unique constraint
      const { data, error } = await supabase
        .from("habit_records")
        .upsert(
          {
            user_id: userId,
            habit_id: habitId,
            date: dateString,
            status,
            updated_at: new Date().toISOString(),
          },
          // Ensures that upsert uses (user_id, habit_id, date) as the unique key.
          // If a record already exists with this combination, Supabase will update it.
          // If not, Supabase will insert a new record.
          // This avoids duplicate entries and makes sure only one record exists per user/habit/date.
          {
            onConflict: "user_id,habit_id,date",
          }
        )
        .select(
          `
        *,
        habits!inner(name)
      `
        )
        .single();

      // If there was an error during upsert, throw to catch below
      if (error) throw error;

      // Update Zustand store with the new/updated record
      set((state) => {
        // Get existing records for the date (or empty array)
        const existingRecords = state.habitRecords[dateString] || [];

        // If record exists, update it; if not, add the new record
        const updatedRecords = existingRecords.some(
          (record) => record.habit_id === habitId
        )
          ? existingRecords.map((record) =>
              record.habit_id === habitId ? data : record
            )
          : [...existingRecords, data];

        return {
          habitRecords: {
            ...state.habitRecords,
            [dateString]: updatedRecords,
          },
          isLoading: false,
        };
      });
    } catch (error) {
      // Log any error to console and set error message in store
      console.error("Error updating habit record:", error);
      set({ error: "Failed to update habit record", isLoading: false });
    }
  },

  loadMonthRecords: async (year: number, month: number, userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const startDate = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
      const endDate = format(new Date(year, month, 0), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("habit_records")
        .select(
          `
          *,
          habits!inner(name)
        `
        )
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate);

      if (error) throw error;

      const recordsMap: Record<string, HabitRecord[]> = {};
      data?.forEach((record) => {
        if (!recordsMap[record.date]) {
          recordsMap[record.date] = [];
        }
        recordsMap[record.date].push(record);
      });

      set((state) => ({
        habitRecords: {
          ...state.habitRecords,
          ...recordsMap,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading month records:", error);
      set({ error: "Failed to load month records", isLoading: false });
    }
  },
}));
