"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWeeklyHabitStore } from "@/store/weeklyHabitStore";
import { Plus } from "lucide-react";
import type { WeekdayId } from "@/types/weeklyHabit";

interface NewWeeklyHabitModalProps {
  disabled?: boolean;
}

const WEEKDAYS = [
  { id: 1 as WeekdayId, name: "Monday", abbr: "Mon" },
  { id: 2 as WeekdayId, name: "Tuesday", abbr: "Tue" },
  { id: 3 as WeekdayId, name: "Wednesday", abbr: "Wed" },
  { id: 4 as WeekdayId, name: "Thursday", abbr: "Thu" },
  { id: 5 as WeekdayId, name: "Friday", abbr: "Fri" },
  { id: 6 as WeekdayId, name: "Saturday", abbr: "Sat" },
  { id: 7 as WeekdayId, name: "Sunday", abbr: "Sun" },
];

export function NewWeeklyHabitModal({ disabled = false }: NewWeeklyHabitModalProps) {
  const { createWeeklyHabit, loading } = useWeeklyHabitStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState<WeekdayId[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDayToggle = (dayId: WeekdayId) => {
    setSelectedDays(prev => 
      prev.includes(dayId)
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (selectedDays.length === 0) {
      setError("Please select at least one day");
      return;
    }

    setError(null);

    try {
      await createWeeklyHabit({
        title: title.trim(),
        days: selectedDays,
      });
      
      // Reset form and close modal
      setTitle("");
      setSelectedDays([]);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create weekly habit:", error);
      setError(error instanceof Error ? error.message : "Failed to create weekly habit. Please try again.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setSelectedDays([]);
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30" 
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          New Weekly Habit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-700 dark:text-green-400">Create New Weekly Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="weekly-habit-title" className="text-sm font-medium">
              Habit Title
            </label>
            <Input
              id="weekly-habit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Eat vegetables, Call family"
              className="mt-1"
              maxLength={64}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Schedule Days
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {WEEKDAYS.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                    className="border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <label
                    htmlFor={`day-${day.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm pt-1">{error}</div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || selectedDays.length === 0 || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}