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
  habitStartDate: string,
): {
  currentFailureStreak: number;
  longestFailureStreak: number;
} {
  const today = startOfDay(new Date());
  const startDate = startOfDay(parseISO(habitStartDate));

  // Tạo map: "YYYY-MM-DD" => status (true = success, false = fail or skipped)
  const statusMap = new Map<string, boolean>();
  for (const r of habitRecords) {
    if (r.habit_id === habitId) {
      statusMap.set(r.date, r.status === true);
    }
  }

  const allDates = eachDayOfInterval({ start: startDate, end: today });

  let currentStreak = 0;
  let longestStreak = 0;

  for (let i = 0; i < allDates.length; i++) {
    const dateStr = format(allDates[i], "yyyy-MM-dd");
    const isFailure = !statusMap.get(dateStr); // false or undefined

    if (isFailure) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Kiểm tra ngày cuối cùng có phải đang trong chuỗi thất bại không
  const lastDateStr = format(today, "yyyy-MM-dd");
  const isLastFailure = !statusMap.get(lastDateStr);

  const currentFailureStreak = isLastFailure ? currentStreak : 0;

  return {
    currentFailureStreak,
    longestFailureStreak: longestStreak,
  };
}
