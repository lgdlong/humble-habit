"use client";

import { create } from "zustand";
import type { WeeklyHabitDTO, WeekdayId } from "@/types/weeklyHabit";

type WeeklyHabitState = {
  weeklyHabit: WeeklyHabitDTO | null;
  loading: boolean;
  error?: string;
  
  // Actions
  fetchWeeklyHabit: () => Promise<void>;
  createWeeklyHabit: (input: { title: string; days: WeekdayId[] }) => Promise<void>;
  updateWeeklyHabit: (input: { id: string; title?: string; days?: WeekdayId[] }) => Promise<void>;
  deleteWeeklyHabit: (id: string) => Promise<void>;
  isScheduledToday: (todayId: WeekdayId) => boolean;
};

export const useWeeklyHabitStore = create<WeeklyHabitState>((set, get) => ({
  weeklyHabit: null,
  loading: false,
  
  fetchWeeklyHabit: async () => {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/weekly-habits");
      if (!response.ok) {
        throw new Error("Failed to fetch weekly habit");
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

  createWeeklyHabit: async (input) => {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/weekly-habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create weekly habit");
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

  updateWeeklyHabit: async (input) => {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/weekly-habits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update weekly habit");
      }
      
      const weeklyHabit = await response.json();
      set({ weeklyHabit, loading: false });
    } catch (error) {
      console.error("Error updating weekly habit:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to update weekly habit",
        loading: false 
      });
      throw error; // Re-throw to allow UI components to handle the error
    }
  },

  deleteWeeklyHabit: async (id) => {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch(`/api/weekly-habits?id=${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete weekly habit");
      }
      
      set({ weeklyHabit: null, loading: false });
    } catch (error) {
      console.error("Error deleting weekly habit:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to delete weekly habit",
        loading: false 
      });
      throw error; // Re-throw to allow UI components to handle the error
    }
  },

  isScheduledToday: (todayId: WeekdayId) => {
    const { weeklyHabit } = get();
    return !!(weeklyHabit && weeklyHabit.days?.includes(todayId));
  },
}));