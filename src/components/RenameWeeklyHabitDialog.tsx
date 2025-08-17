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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeeklyHabitStore } from "@/store/weeklyHabitStore";
import { Edit2 } from "lucide-react";
import type { WeeklyHabitDTO } from "@/types/weeklyHabit";

interface RenameWeeklyHabitDialogProps {
  weeklyHabit: WeeklyHabitDTO;
}

export function RenameWeeklyHabitDialog({ weeklyHabit }: RenameWeeklyHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(weeklyHabit.title);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateWeeklyHabit } = useWeeklyHabitStore();

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

    try {
      await updateWeeklyHabit({ id: weeklyHabit.id, title: trimmedTitle });
      setOpen(false);
      setTitle(trimmedTitle); // Update local state
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to rename weekly habit");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset form when opening
      setTitle(weeklyHabit.title);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 w-6 p-0"
          title="Rename weekly habit"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Weekly Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter weekly habit title"
              maxLength={64}
              autoFocus
            />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Renaming..." : "Rename"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}