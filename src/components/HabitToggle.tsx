"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useHabitStore } from "@/store/useHabitStore";
import { useWeeklyHabitStore } from "@/store/weeklyHabitStore";
import { CreateHabitDialog } from "./CreateHabitDialog";
import { RenameHabitDialog } from "./RenameHabitDialog";
import { DeleteHabitDialog } from "./DeleteHabitDialog";
import { CreateWeeklyHabitDialog } from "./CreateWeeklyHabitDialog";
import { RenameWeeklyHabitDialog } from "./RenameWeeklyHabitDialog";
import { DeleteWeeklyHabitDialog } from "./DeleteWeeklyHabitDialog";
import { format } from "date-fns";
import type { WeekdayId } from "@/types/weeklyHabit";

interface HabitToggleProps {
  date: Date;
  onSave?: () => void;
}

export function HabitToggle({ date, onSave }: HabitToggleProps) {
  const { user } = useAuth();
  const {
    habits,
    habitRecords,
    loadHabits,
    loadHabitRecords,
    updateHabitRecord,
    isLoading,
  } = useHabitStore();
  const { weeklyHabit, fetchWeeklyHabit, isScheduledToday } = useWeeklyHabitStore();
  const [open, setOpen] = useState(false);

  const dateString = format(date, "yyyy-MM-dd");
  const dayRecords = habitRecords[dateString] || [];

  // Helper function to convert JS Date to weekday ID (1=Mon, 7=Sun)
  const getWeekdayId = (date: Date): WeekdayId => {
    const jsDay = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    return (((jsDay + 6) % 7) + 1) as WeekdayId; // Convert to 1=Mon, 7=Sun
  };

  const todayWeekdayId = getWeekdayId(date);
  const isWeeklyHabitScheduledToday = weeklyHabit ? isScheduledToday(todayWeekdayId) : false;

  // Load habits and records when component mounts or user/date changes
  useEffect(() => {
    if (user) {
      loadHabits(user.id);
      loadHabitRecords(date, user.id);
      fetchWeeklyHabit();
    }
  }, [user, date, loadHabits, loadHabitRecords, fetchWeeklyHabit]);

  const handleHabitToggle = async (habitId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      await updateHabitRecord(user.id, habitId, date, currentStatus);
      onSave?.();
    } catch (error) {
      console.error("Failed to update habit record:", error);
      // Optionally show user notification
    }
  };

  const getHabitStatus = (habitId: string) => {
    const record = dayRecords.find((r) => r.habit_id === habitId);
    return record?.status || false;
  };

  const getCompletedHabits = () => {
    return dayRecords.filter((record) => record.status);
  };

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="relative flex items-center gap-2 px-6 py-3 text-lg"
          variant="outline"
        >
          Check Habits
          {/* Habit completion indicators */}
          <div className="flex gap-1 ml-2">
            {getCompletedHabits().map((record) => {
              const color = getHabitColor(record.habit_id);
              return (
                <div
                  key={record.habit_id}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                />
              );
            })}
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Track Your Habits</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {habits.length === 0 && !weeklyHabit ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No habits created yet. Create your first habit to get started!
              </p>
              <CreateHabitDialog />
            </div>
          ) : (
            <>
              {/* Daily Habits */}
              {habits.map((habit) => {
                const isCompleted: boolean = getHabitStatus(habit.id);
                const habitColor = getHabitColor(habit.id);
                return (
                  <div key={habit.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={habit.id}
                      checked={isCompleted}
                      onCheckedChange={(checked) =>
                        handleHabitToggle(habit.id, checked === true)
                      }
                      style={{
                        borderColor: habitColor,
                        backgroundColor: isCompleted ? habitColor : "transparent",
                      }}
                    />
                    <label
                      htmlFor={habit.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 flex-1"
                    >
                      {habit.name}
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: habitColor }}
                      />
                    </label>
                    <div className="flex items-center gap-1">
                      <RenameHabitDialog habit={habit} />
                      <DeleteHabitDialog habit={habit} />
                    </div>
                  </div>
                );
              })}

              {/* Weekly Habit */}
              {weeklyHabit && (
                <div className="flex items-center space-x-3">
                  {isWeeklyHabitScheduledToday ? (
                    <Checkbox
                      id={`weekly-${weeklyHabit.id}`}
                      checked={false} // TODO: Implement weekly habit record tracking
                      onCheckedChange={() => {
                        // TODO: Implement weekly habit record toggle
                        console.log("Weekly habit toggle not implemented yet");
                      }}
                      style={{
                        borderColor: "#10B981", // Green color for weekly habit
                        backgroundColor: false ? "#10B981" : "transparent",
                      }}
                    />
                  ) : (
                    <div className="w-4 h-4" /> // Placeholder to maintain spacing
                  )}
                  <label
                    htmlFor={`weekly-${weeklyHabit.id}`}
                    className={`text-sm font-medium leading-none flex items-center gap-2 flex-1 ${
                      !isWeeklyHabitScheduledToday ? "opacity-60" : ""
                    }`}
                  >
                    {weeklyHabit.title}
                    {!isWeeklyHabitScheduledToday && (
                      <span className="text-xs text-muted-foreground">
                        (not scheduled today)
                      </span>
                    )}
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: "#10B981" }} // Green for weekly habit
                    />
                  </label>
                  <div className="flex items-center gap-1">
                    <RenameWeeklyHabitDialog weeklyHabit={weeklyHabit} />
                    <DeleteWeeklyHabitDialog weeklyHabit={weeklyHabit} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Create new habits section */}
          <div className="pt-4 border-t space-y-3">
            {/* Daily habit creation */}
            {habits.length < 2 && <CreateHabitDialog />}
            
            {/* Weekly habit creation */}
            {!weeklyHabit && <CreateWeeklyHabitDialog />}
          </div>
        </div>

        <Button
          onClick={() => setOpen(false)}
          disabled={isLoading}
          className="w-full"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
