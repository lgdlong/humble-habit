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
import { CreateHabitDialog } from "./CreateHabitDialog";
import { RenameHabitDialog } from "./RenameHabitDialog";
import { format } from "date-fns";

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
  const [open, setOpen] = useState(false);

  const dateString = format(date, "yyyy-MM-dd");
  const dayRecords = habitRecords[dateString] || [];

  // Load habits and records when component mounts or user/date changes
  useEffect(() => {
    if (user) {
      loadHabits(user.id);
      loadHabitRecords(date, user.id);
    }
  }, [user, date, loadHabits, loadHabitRecords]);

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
          {habits.length === 0 ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No habits created yet. Create your first habit to get started!
              </p>
              <CreateHabitDialog />
            </div>
          ) : (
            habits.map((habit) => {
              const isCompleted: boolean = getHabitStatus(habit.id);
              const habitColor = getHabitColor(habit.id);
              return (
                <div key={habit.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={habit.id}
                    checked={isCompleted}
                    onCheckedChange={(checked) =>
                      handleHabitToggle(habit.id, Boolean(checked))
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
                  <RenameHabitDialog habit={habit} />
                </div>
              );
            })
          )}

          {/* Chỉ hiển thị dialog tạo thói quen mới khi user chưa đủ 2 thói quen. */}
          {/* Nếu đã có 2 thói quen, không cho phép tạo thêm (theo giới hạn app Humble Habbit). */}
          {habits.length < 2 && (
            <div className="pt-4 border-t">
              <CreateHabitDialog />
            </div>
          )}
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
