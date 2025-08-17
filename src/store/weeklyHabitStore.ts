"use client";

import { create } from "zustand";
import type { WeeklyHabitDTO, WeekdayId, CreateWeeklyHabitRequest, UpdateWeeklyHabitRequest, WeeklyHabitRecord } from "@/types/weeklyHabit";
import { format } from "date-fns";

interface WeeklyHabitState {
  weeklyHabit: WeeklyHabitDTO | null;
  weeklyHabitRecords: Record<string, WeeklyHabitRecord[]>; // date -> weekly habit records for that date
  loading: boolean;
  error?: string;
  
  // Actions
  fetchWeeklyHabit: () => Promise<void>;
  createWeeklyHabit: (input: CreateWeeklyHabitRequest) => Promise<void>;
  updateWeeklyHabit: (input: UpdateWeeklyHabitRequest) => Promise<void>;
  deleteWeeklyHabit: (id: string) => Promise<void>;
  loadWeeklyHabitRecords: (date: Date) => Promise<void>;
  updateWeeklyHabitRecord: (userId: string, weeklyHabitId: string, date: Date, status: boolean) => Promise<void>;
  isScheduledToday: (todayId: WeekdayId) => boolean;
  isScheduledOnDate: (date: Date) => boolean;
  getWeeklyHabitStatus: (date: Date) => boolean;
}

export const useWeeklyHabitStore = create<WeeklyHabitState>((set, get) => ({
  weeklyHabit: null,
  weeklyHabitRecords: {},
  loading: false,
  error: undefined,

  fetchWeeklyHabit: async () => {
    set({ loading: true, error: undefined });
    
    try {
      const response = await fetch("/api/weekly-habits", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch weekly habit: ${response.statusText}`);
      }

      const data = await response.json();
      set({ weeklyHabit: data.weeklyHabit, loading: false });
    } catch (error) {
      console.error("Error fetching weekly habit:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch weekly habit", 
        loading: false 
      });
    }
  },

  createWeeklyHabit: async (input: CreateWeeklyHabitRequest) => {
    set({ loading: true, error: undefined });

    try {
      const response = await fetch("/api/weekly-habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create weekly habit: ${response.statusText}`);
      }

      const weeklyHabit = await response.json();
      set({ weeklyHabit, loading: false });
    } catch (error) {
      console.error("Error creating weekly habit:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to create weekly habit", 
        loading: false 
      });
      throw error; // Re-throw to allow UI components to handle the error
    }
  },

  updateWeeklyHabit: async (input: UpdateWeeklyHabitRequest) => {
    set({ loading: true, error: undefined });

    try {
      const response = await fetch("/api/weekly-habits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update weekly habit: ${response.statusText}`);
      }

      const weeklyHabit = await response.json();
      set({ weeklyHabit, loading: false });
    } catch (error) {
      console.error("Error updating weekly habit:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to update weekly habit", 
        loading: false 
      });
      throw error;
    }
  },

  deleteWeeklyHabit: async (id: string) => {
    set({ loading: true, error: undefined });

    try {
      const response = await fetch(`/api/weekly-habits?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete weekly habit: ${response.statusText}`);
      }

      // Clear weekly habit and its records from state
      set({ 
        weeklyHabit: null, 
        weeklyHabitRecords: {},
        loading: false 
      });
    } catch (error) {
      console.error("Error deleting weekly habit:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to delete weekly habit", 
        loading: false 
      });
      throw error;
    }
  },

  loadWeeklyHabitRecords: async (date: Date) => {
    set({ loading: true, error: undefined });

    try {
      const dateString = format(date, "yyyy-MM-dd");
      
      const response = await fetch(`/api/weekly-habit-records?date=${dateString}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load weekly habit records: ${response.statusText}`);
      }

      const data = await response.json();

      set((state) => ({
        weeklyHabitRecords: {
          ...state.weeklyHabitRecords,
          [dateString]: data || [],
        },
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading weekly habit records:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to load weekly habit records", 
        loading: false 
      });
    }
  },

  updateWeeklyHabitRecord: async (userId: string, weeklyHabitId: string, date: Date, status: boolean) => {
    set({ loading: true, error: undefined });

    try {
      const dateString = format(date, "yyyy-MM-dd");

      const response = await fetch("/api/weekly-habit-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          weekly_habit_id: weeklyHabitId,
          date: dateString,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update weekly habit record: ${response.statusText}`);
      }

      const data = await response.json();

      // Update the records in state
      set((state) => {
        const existingRecords = state.weeklyHabitRecords[dateString] || [];
        const updatedRecords = existingRecords.some(
          (record) => record.weekly_habit_id === weeklyHabitId,
        )
          ? existingRecords.map((record) =>
              record.weekly_habit_id === weeklyHabitId ? data : record,
            )
          : [...existingRecords, data];

        return {
          weeklyHabitRecords: {
            ...state.weeklyHabitRecords,
            [dateString]: updatedRecords,
          },
          loading: false,
        };
      });
    } catch (error) {
      console.error("Error updating weekly habit record:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to update weekly habit record", 
        loading: false 
      });
      throw error;
    }
  },

  isScheduledToday: (todayId: WeekdayId) => {
    const { weeklyHabit } = get();
    return !!(weeklyHabit && weeklyHabit.days?.includes(todayId));
  },

  isScheduledOnDate: (date: Date) => {
    const { weeklyHabit } = get();
    if (!weeklyHabit) return false;
    
    // Convert JS getDay() (0=Sun, 1=Mon, ..., 6=Sat) to ISO weekday (1=Mon, ..., 7=Sun)
    const jsGetDay = date.getDay();
    const weekdayId: WeekdayId = ((jsGetDay + 6) % 7) + 1 as WeekdayId;
    
    return weeklyHabit.days?.includes(weekdayId) || false;
  },

  getWeeklyHabitStatus: (date: Date) => {
    const { weeklyHabitRecords } = get();
    const dateString = format(date, "yyyy-MM-dd");
    const dayRecords = weeklyHabitRecords[dateString] || [];
    const record = dayRecords.find((r) => r.weekly_habit_id);
    return record?.status || false;
  },
}));