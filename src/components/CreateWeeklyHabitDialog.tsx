"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeeklyHabitStore } from "@/store/weeklyHabitStore";
import { Plus } from "lucide-react";
import type { WeekdayId } from "@/types/weeklyHabit";

const WEEKDAYS = [
  { id: 1 as WeekdayId, label: "Monday" },
  { id: 2 as WeekdayId, label: "Tuesday" },
  { id: 3 as WeekdayId, label: "Wednesday" },
  { id: 4 as WeekdayId, label: "Thursday" },
  { id: 5 as WeekdayId, label: "Friday" },
  { id: 6 as WeekdayId, label: "Saturday" },
  { id: 7 as WeekdayId, label: "Sunday" },
];

export function CreateWeeklyHabitDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState<WeekdayId[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createWeeklyHabit, weeklyHabit } = useWeeklyHabitStore();

  // Don't show if user already has a weekly habit
  if (weeklyHabit) {
    return null;
  }

  const handleDayToggle = (dayId: WeekdayId, checked: boolean) => {
    if (checked) {
      setSelectedDays([...selectedDays, dayId]);
    } else {
      setSelectedDays(selectedDays.filter(id => id !== dayId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trimmedTitle = title.trim();

    // Client-side validation
    if (!trimmedTitle) {
      setError("Weekly habit title cannot be empty");
      setIsSubmitting(false);
      return;
    }

    if (trimmedTitle.length > 64) {
      setError("Weekly habit title too long (max 64 characters)");
      setIsSubmitting(false);
      return;
    }

    if (selectedDays.length === 0) {
      setError("Please select at least one day");
      setIsSubmitting(false);
      return;
    }

    try {
      await createWeeklyHabit({ title: trimmedTitle, days: selectedDays });
      setOpen(false);
      // Reset form
      setTitle("");
      setSelectedDays([]);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create weekly habit");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset form when opening
      setTitle("");
      setSelectedDays([]);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" />
          New Weekly Habit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Weekly Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter weekly habit title"
              maxLength={64}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium">Schedule</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {WEEKDAYS.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={(checked) =>
                      handleDayToggle(day.id, checked === true)
                    }
                  />
                  <label
                    htmlFor={`day-${day.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Creating..." : "Create Weekly Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}