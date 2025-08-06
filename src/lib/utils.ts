import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HabitRecord } from "@/types";
import { eachDayOfInterval, format, parseISO, startOfDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateFailureStreaks(
  habitRecords: HabitRecord[],
  habitId: string,
  habitStartDate: string
): {
  currentFailureStreak: number;
  longestFailureStreak: number;
} {
  const today = startOfDay(new Date());
  const startDate = startOfDay(parseISO(habitStartDate));

  // Map: "YYYY-MM-DD" => status (true = success, false = fail/skipped)
  const statusMap = new Map<string, boolean>();
  for (const r of habitRecords) {
    if (r.habit_id === habitId) {
      statusMap.set(r.date, r.status === true);
    }
  }

  const allDates = eachDayOfInterval({ start: startDate, end: today });

  let tempStreak = 0;
  let longestFailureStreak = 0;

  for (let i = 0; i < allDates.length; i++) {
    const dateStr = format(allDates[i], "yyyy-MM-dd");
    const isFailure = !statusMap.get(dateStr); // false or undefined

    if (isFailure) {
      tempStreak++;
      longestFailureStreak = Math.max(longestFailureStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Tính currentFailureStreak bằng cách lùi từ hôm nay về trước
  let currentFailureStreak = 0;
  for (let i = allDates.length - 1; i >= 0; i--) {
    const dateStr = format(allDates[i], "yyyy-MM-dd");
    const isFailure = !statusMap.get(dateStr);
    if (isFailure) {
      currentFailureStreak++;
    } else {
      break;
    }
  }

  return {
    currentFailureStreak,
    longestFailureStreak,
  };
}
