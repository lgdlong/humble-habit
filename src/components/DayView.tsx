"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { HabitToggle } from "./HabitToggle";
import { useAuth } from "@/hooks/useAuth";
import { useHabitStore } from "@/store/useHabitStore";
import { useEffect, useMemo } from "react";

interface DayViewProps {
  date?: Date;
  onViewChange?: (view: "day" | "month") => void;
  onSwitchToMonth?: () => void;
}

export function DayView({ onSwitchToMonth }: DayViewProps) {
  const { user } = useAuth();
  const { loadHabits, loadHabitRecords } = useHabitStore();
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (user) {
      loadHabits(user.id);
      loadHabitRecords(today, user.id);
    }
  }, [user, loadHabits, loadHabitRecords, today]);

  return (
    <div className="h-full flex flex-col">
      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-6">
        {/* Current Date - largest text */}
        <div className="text-center">
          <h1 className="text-4xl font-bold">{format(today, "EEEE")}</h1>
          <p className="text-3xl text-muted-foreground mt-2">
            {format(today, "d/M/yyyy")}
          </p>
        </div>

        {/* Check Habits Button */}
        <HabitToggle
          date={today}
          onSave={() => {
            if (user) {
              loadHabitRecords(today, user.id);
            }
          }}
        />

        {/* Month View Button */}
        <Button
          variant="outline"
          onClick={onSwitchToMonth}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Month View
        </Button>
      </div>
    </div>
  );
}
