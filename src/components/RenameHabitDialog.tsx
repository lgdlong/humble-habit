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
import { useHabitStore } from "@/store/useHabitStore";
import { Edit2 } from "lucide-react";
import type { Habit } from "@/types";

interface RenameHabitDialogProps {
  habit: Habit;
}

export function RenameHabitDialog({ habit }: RenameHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(habit.name);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { renameHabit } = useHabitStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trimmedName = name.trim();

    // Client-side validation
    if (!trimmedName) {
      setError("Habit name cannot be empty");
      setIsSubmitting(false);
      return;
    }

    if (trimmedName.length > 50) {
      setError("Habit name too long (max 50 characters)");
      setIsSubmitting(false);
      return;
    }

    try {
      await renameHabit(habit.id, trimmedName);
      setOpen(false);
      setName(trimmedName); // Update local state
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to rename habit");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset form when opening
      setName(habit.name);
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
          title="Rename habit"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter habit name"
              maxLength={50}
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