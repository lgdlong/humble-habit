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
import { NewWeeklyHabitModal } from "./NewWeeklyHabitModal";
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
  const {
    weeklyHabit,
    fetchWeeklyHabit,
    loading: weeklyLoading,
  } = useWeeklyHabitStore();
  const [open, setOpen] = useState(false);

  const dateString = format(date, "yyyy-MM-dd");
  const dayRecords = habitRecords[dateString] || [];

  // Get today's weekday ID (1=Mon, ..., 7=Sun)
  const getWeekdayId = (date: Date): WeekdayId => {
    const jsGetDay = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    return ((jsGetDay + 6) % 7) + 1 as WeekdayId; // Convert to 1=Mon, ..., 7=Sun
  };

  const todayWeekdayId = getWeekdayId(date);
  const isWeeklyHabitScheduledToday = weeklyHabit?.days?.includes(todayWeekdayId) || false;

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
    const completed = dayRecords.filter((record) => record.status);
    
    // Add weekly habit indicator if it's scheduled today and would be completed
    // Note: We'll need to implement weekly habit records tracking later
    // For now, just show the dot if weekly habit is scheduled
    
    return completed;
  };

  const getHabitColor = (habitId: string) => {
    const colors = [
      "#EF4444", // red
      "#3B82F6", // blue
      "#10B981", // green (reserved for weekly habit but not used here)
      "#F59E0B", // amber
      "#8B5CF6", // violet
      "#EC4899", // pink
    ];
    const index = habits.findIndex((h) => h.id === habitId);
    return colors[index % colors.length] || "#6B7280";
  };

  // Calculate total habits to enforce 3-habit limit
  const totalHabits = habits.length + (weeklyHabit ? 1 : 0);
  const canCreateWeeklyHabit = !weeklyHabit && totalHabits < 3;
  const canCreateDailyHabit = habits.length < 2 && totalHabits < 3;

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
            {/* Weekly habit indicator - show green dot if scheduled today */}
            {isWeeklyHabitScheduledToday && (
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: "#10B981", // green for weekly habit
                }}
              />
            )}
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
              <div className="text-sm text-muted-foreground">or</div>
              <NewWeeklyHabitModal disabled={!canCreateWeeklyHabit} />
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

              {/* Weekly Habit - only show if scheduled today */}
              {isWeeklyHabitScheduledToday && weeklyHabit && (
                <div className="flex items-center space-x-3 border-t border-green-200 pt-4">
                  <Checkbox
                    id={`weekly-${weeklyHabit.id}`}
                    checked={false} // TODO: Implement weekly habit records tracking
                    onCheckedChange={(checked) => {
                      // TODO: Implement weekly habit record update
                      console.log("Weekly habit toggle:", checked);
                    }}
                    className="border-green-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <label
                    htmlFor={`weekly-${weeklyHabit.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 flex-1 text-green-700 dark:text-green-400"
                  >
                    {weeklyHabit.title}
                    <div
                      className="w-4 h-4 rounded-full border border-green-300"
                      style={{ backgroundColor: "#10B981" }}
                    />
                  </label>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Weekly
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action buttons for creating new habits */}
          {(habits.length > 0 || weeklyHabit) && (
            <div className="space-y-3 pt-4 border-t">
              {canCreateDailyHabit && (
                <CreateHabitDialog />
              )}
              {canCreateWeeklyHabit && (
                <NewWeeklyHabitModal disabled={!canCreateWeeklyHabit} />
              )}
              {!canCreateDailyHabit && !canCreateWeeklyHabit && (
                <p className="text-sm text-muted-foreground text-center">
                  Maximum habits reached (3 total: 2 daily + 1 weekly)
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={() => setOpen(false)}
          disabled={isLoading || weeklyLoading}
          className="w-full"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
