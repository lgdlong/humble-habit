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
import { useHabitStore } from "@/store/useHabitStore";
import { Trash2 } from "lucide-react";
import type { Habit } from "@/types";

interface DeleteHabitDialogProps {
  habit: Habit;
}

export function DeleteHabitDialog({ habit }: DeleteHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteHabit } = useHabitStore();

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      await deleteHabit(habit.id);
      setOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete habit");
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
          title="Delete habit"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Habit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>&ldquo;{habit.name}&rdquo;</strong>?
          </p>
          
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Warning:</strong> This will permanently delete all data and history related to this habit. This action cannot be undone.
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
              {isDeleting ? "Deleting..." : "Delete Habit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}