"use client";

import { create } from "zustand";
import type { WeeklyHabitDTO, WeekdayId, CreateWeeklyHabitRequest, UpdateWeeklyHabitRequest } from "@/types/weeklyHabit";

interface WeeklyHabitState {
  weeklyHabit: WeeklyHabitDTO | null;
  loading: boolean;
  error?: string;
  
  // Actions
  fetchWeeklyHabit: () => Promise<void>;
  createWeeklyHabit: (input: CreateWeeklyHabitRequest) => Promise<void>;
  updateWeeklyHabit: (input: UpdateWeeklyHabitRequest) => Promise<void>;
  deleteWeeklyHabit: (id: string) => Promise<void>;
  isScheduledToday: (todayId: WeekdayId) => boolean;
  isScheduledOnDate: (date: Date) => boolean;
}

export const useWeeklyHabitStore = create<WeeklyHabitState>((set, get) => ({
  weeklyHabit: null,
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

      set({ weeklyHabit: null, loading: false });
    } catch (error) {
      console.error("Error deleting weekly habit:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to delete weekly habit", 
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
}));