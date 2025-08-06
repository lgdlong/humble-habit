"use client";

import { useState, useEffect } from "react";
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
import { cn, calculateFailureStreaks } from "@/lib/utils";

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
        <div className="mt-6 text-center space-y-2">
          <h3 className="text-sm font-medium">This Month Progress</h3>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            {habits.map((habit) => {
              const monthlyCompletions = Object.values(habitRecords)
                .flat()
                .filter(
                  (record) =>
                    record.habit_id === habit.id &&
                    record.status &&
                    isSameMonth(new Date(record.date), currentMonth)
                ).length;

              // Calculate failure streaks for this habit
              const allHabitRecords = Object.values(habitRecords).flat();
              const { longestFailureStreak } = calculateFailureStreaks(
                allHabitRecords,
                habit.id
              );

              return (
                <div key={habit.id} className="flex flex-col items-center gap-1 text-center">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getHabitColor(habit.id) }}
                    />
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div>{monthlyCompletions} days completed</div>
                    <div className="text-red-500">
                      Longest failure streak: {longestFailureStreak} days
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
