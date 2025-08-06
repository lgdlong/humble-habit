import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { HabitRecord } from "@/types"
import { parseISO, isAfter, startOfDay } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate the longest failure streak for a habit based on its records
 * @param habitRecords Array of habit records for a specific habit
 * @param habitId The ID of the habit to calculate streak for
 * @returns Object containing current failure streak and longest failure streak
 */
export function calculateFailureStreaks(
  habitRecords: HabitRecord[],
  habitId: string
): { currentFailureStreak: number; longestFailureStreak: number } {
  // Filter records for this specific habit and sort by date (newest first)
  const habitSpecificRecords = habitRecords
    .filter((record) => record.habit_id === habitId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (habitSpecificRecords.length === 0) {
    return { currentFailureStreak: 0, longestFailureStreak: 0 };
  }

  const today = startOfDay(new Date());

  // Calculate current failure streak (from most recent date backward)
  let currentFailureStreak = 0;
  for (const record of habitSpecificRecords) {
    const recordDate = parseISO(record.date);
    
    // Only count records up to today (not future dates)
    if (isAfter(recordDate, today)) {
      continue;
    }

    if (record.status === false) {
      currentFailureStreak++;
    } else {
      // Hit a success, stop counting current streak
      break;
    }
  }

  // Calculate longest failure streak by scanning all records chronologically
  const recordsByDate = habitSpecificRecords
    .filter(record => !isAfter(parseISO(record.date), today))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let longestFailureStreak = 0;
  let tempFailureStreak = 0;

  for (const record of recordsByDate) {
    if (record.status === false) {
      tempFailureStreak++;
      longestFailureStreak = Math.max(longestFailureStreak, tempFailureStreak);
    } else {
      tempFailureStreak = 0;
    }
  }

  return { currentFailureStreak, longestFailureStreak };
}
