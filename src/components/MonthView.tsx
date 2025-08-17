"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHabitStore } from "@/store/useHabitStore";
import { useWeeklyHabitStore } from "@/store/weeklyHabitStore";
import { calculateFailureStreaks, cn } from "@/lib/utils";
import type { WeekdayId } from "@/types/weeklyHabit";

interface MonthViewProps {
  date?: Date;
  onViewChange?: (view: "day" | "month") => void;
  onDateSelect?: (date: Date) => void;
  onSwitchToDay?: () => void;
}

export function MonthView({ onSwitchToDay }: MonthViewProps) {
  const { user } = useAuth();
  const { loadMonthRecords, loadHabits, habitRecords, habits } =
    useHabitStore();
  const { weeklyHabit, fetchWeeklyHabit } = useWeeklyHabitStore();
  const allRecords = useMemo(
    () => Object.values(habitRecords).flat(),
    [habitRecords]
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadHabits(user.id);
      fetchWeeklyHabit();
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      loadMonthRecords(year, month, user.id);
    }
  }, [currentMonth, user, loadMonthRecords, loadHabits, fetchWeeklyHabit]);

  const getHabitColor = (habitId: string) => {
    const colors = [
      "#EF4444", // red
      "#3B82F6", // blue
      "#10B981", // green (reserved for weekly habits)
      "#F59E0B", // amber
      "#8B5CF6", // violet
      "#EC4899", // pink
    ];
    const index = habits.findIndex((h) => h.id === habitId);
    return colors[index % colors.length] || "#6B7280";
  };

  // Helper function to get weekday ID from date
  const getWeekdayId = (date: Date): WeekdayId => {
    const jsGetDay = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    return ((jsGetDay + 6) % 7) + 1 as WeekdayId; // Convert to 1=Mon, ..., 7=Sun
  };

  // Helper function to check if weekly habit is scheduled on a date
  const isWeeklyHabitScheduled = (date: Date): boolean => {
    if (!weeklyHabit) return false;
    const weekdayId = getWeekdayId(date);
    return weeklyHabit.days.includes(weekdayId);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 max-w-md mx-auto pb-20 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Week headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((weekDay) => (
              <div
                key={weekDay}
                className="text-center text-sm font-medium text-muted-foreground p-2"
              >
                {weekDay}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayDate) => {
              const dateString = format(dayDate, "yyyy-MM-dd");
              const dayRecords = habitRecords[dateString] || [];
              const completedRecords = dayRecords.filter(
                (record) => record.status
              );
              const isToday = isSameDay(dayDate, new Date());
              const isCurrentMonth = isSameMonth(dayDate, currentMonth);

              return (
                <div
                  key={dayDate.toString()}
                  className={cn(
                    "relative p-2 text-sm h-12 w-full rounded-md transition-colors",
                    isToday &&
                      "bg-primary text-primary-foreground font-semibold",
                    !isCurrentMonth && "text-muted-foreground opacity-50"
                  )}
                >
                  <span>{format(dayDate, "d")}</span>

                  {/* Habit dots */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {/* Daily habit dots */}
                    {completedRecords.map((record) => {
                      const color = getHabitColor(record.habit_id);
                      return (
                        <div
                          key={record.habit_id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                    {/* Weekly habit dot - show green dot if scheduled today */}
                    {isWeeklyHabitScheduled(dayDate) && (
                      <div
                        key="weekly-habit"
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "#10B981" }} // green for weekly habit
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Day View Button */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={onSwitchToDay}
            className="flex items-center gap-2 mx-auto"
          >
            <Calendar className="h-4 w-4" />
            Back to Today
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 text-center space-y-3">
          <h3 className="text-xl font-medium">Your Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground place-items-center">
            {/* Daily habits stats */}
            {habits.map((habit) => {
              const habitRecordList = allRecords.filter(
                (record) => record.habit_id === habit.id
              );

              const totalCompletions = habitRecordList.filter(
                (record) => record.status
              ).length;

              const { longestFailureStreak } = calculateFailureStreaks(
                habitRecordList,
                habit.id,
                habit.created_at ?? format(new Date(), "yyyy-MM-dd")
              );

              return (
                <div
                  key={habit.id}
                  className="border rounded-xl p-2.5 shadow-sm space-y-1.5 w-4/5 sm:w-full text-left"
                >
                  <div className="flex flex-col items-start gap-1.5 font-normal">
                    <div className="flex flex-row items-center gap-2 w-full">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getHabitColor(habit.id) }}
                      />
                      <strong
                        className="text-xs leading-tight truncate flex-1 min-w-0"
                        title={habit.name}
                        aria-label={habit.name}
                      >
                        {habit.name}
                      </strong>
                    </div>
                    <div className="text-xs space-y-0.5 w-full">
                      <div>
                        Completed:{" "}
                        <strong className="text-green-600">
                          {totalCompletions}
                        </strong>{" "}
                        days
                      </div>
                      <div>
                        Longest failure streak:{" "}
                        <strong className="text-red-400">
                          {longestFailureStreak}
                        </strong>{" "}
                        days
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Weekly habit stats */}
            {weeklyHabit && (
              <div className="border border-green-200 rounded-xl p-2.5 shadow-sm space-y-1.5 w-4/5 sm:w-full text-left bg-green-50/50 dark:bg-green-900/10">
                <div className="flex flex-col items-start gap-1.5 font-normal">
                  <div className="flex flex-row items-center gap-2 w-full">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "#10B981" }}
                    />
                    <strong
                      className="text-xs leading-tight truncate flex-1 min-w-0 text-green-700 dark:text-green-400"
                      title={weeklyHabit.title}
                      aria-label={weeklyHabit.title}
                    >
                      {weeklyHabit.title}
                    </strong>
                  </div>
                  <div className="text-xs space-y-0.5 w-full text-green-600 dark:text-green-400">
                    <div>
                      Scheduled:{" "}
                      <strong>{weeklyHabit.days.length}</strong>{" "}
                      days/week
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Weekly habit
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
