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
import { calculateFailureStreaks, cn } from "@/lib/utils";

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
  const allRecords = useMemo(
    () => Object.values(habitRecords).flat(),
    [habitRecords]
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadHabits(user.id);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      loadMonthRecords(year, month, user.id);
    }
  }, [currentMonth, user, loadMonthRecords, loadHabits]);

  const getHabitColor = (habitId: string) => {
    const colors = [
      "#EF4444",
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#8B5CF6",
      "#EC4899",
    ];
    const index = habits.findIndex((h) => h.id === habitId);
    return colors[index % colors.length] || "#6B7280";
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
                  {completedRecords.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
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
                    </div>
                  )}
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
                      <strong className="text-xs leading-tight truncate">
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
          </div>
        </div>
      </div>
    </div>
  );
}
