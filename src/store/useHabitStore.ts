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
    set({ isLoading: true, error: null });

    try {
      const dateString = format(date, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("habit_records")
        .upsert({
          user_id: userId,
          habit_id: habitId,
          date: dateString,
          status,
          updated_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          habits!inner(name)
        `
        )
        .single();

      if (error) throw error;

      set((state) => {
        const existingRecords = state.habitRecords[dateString] || [];
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
