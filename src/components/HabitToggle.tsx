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
import { format } from "date-fns";

interface HabitToggleProps {
  date: Date;
  onSave?: () => void;
}

export function HabitToggle({ date, onSave }: HabitToggleProps) {
  const { user } = useAuth();
  const { habitEntries, updateHabitEntry, isLoading } = useHabitStore();
  const [open, setOpen] = useState(false);

  const dateString = format(date, "yyyy-MM-dd");
  const entry = habitEntries[dateString];

  const [habit1, setHabit1] = useState(entry?.habit_1_completed || false);
  const [habit2, setHabit2] = useState(entry?.habit_2_completed || false);

  const handleSave = async () => {
    if (!user) return;

    await updateHabitEntry(date, user.id, habit1, habit2);
    setOpen(false);
    onSave?.();
  };

  // Reset local state when entry changes
  useEffect(() => {
    setHabit1(entry?.habit_1_completed || false);
    setHabit2(entry?.habit_2_completed || false);
  }, [entry]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="relative flex items-center gap-2 px-6 py-3 text-lg"
          variant="outline"
        >
          Check Habits
          {/* Habit tags display */}
          <div className="flex gap-1 ml-2">
            {entry?.habit_1_completed && (
              <div className="w-3 h-3 rounded-full bg-red-300" />
            )}
            {entry?.habit_2_completed && (
              <div className="w-3 h-3 rounded-full bg-blue-300" />
            )}
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Track Your Habits</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Habit 1 */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="habit1"
              checked={habit1}
              onCheckedChange={(checked: boolean) => setHabit1(checked)}
              className="data-[state=checked]:bg-red-300 data-[state=checked]:border-red-300"
            />
            <label
              htmlFor="habit1"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Habit 1 (Red)
            </label>
          </div>

          {/* Habit 2 */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="habit2"
              checked={habit2}
              onCheckedChange={(checked: boolean) => setHabit2(checked)}
              className="data-[state=checked]:bg-blue-300 data-[state=checked]:border-blue-300"
            />
            <label
              htmlFor="habit2"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Habit 2 (Blue)
            </label>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
