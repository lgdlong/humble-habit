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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWeeklyHabitStore } from "@/store/weeklyHabitStore";
import { Trash2 } from "lucide-react";
import type { WeeklyHabitDTO } from "@/types/weeklyHabit";

interface DeleteWeeklyHabitDialogProps {
  weeklyHabit: WeeklyHabitDTO;
}

export function DeleteWeeklyHabitDialog({ weeklyHabit }: DeleteWeeklyHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteWeeklyHabit } = useWeeklyHabitStore();

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      await deleteWeeklyHabit(weeklyHabit.id);
      setOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete weekly habit");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset error state when opening
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          title="Delete weekly habit"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Weekly Habit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>&ldquo;{weeklyHabit.title}&rdquo;</strong>?
          </p>

          <Alert variant="destructive">
            <AlertDescription>
              <strong>Warning:</strong> This will permanently delete all data
              and history related to this weekly habit. This action cannot be undone.
            </AlertDescription>
          </Alert>

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
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Weekly Habit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}