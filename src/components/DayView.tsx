"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { HabitToggle } from "./HabitToggle";
import { QuoteBox } from "./QuoteBox";
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
  const { loadHabitEntry } = useHabitStore();
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (user) {
      loadHabitEntry(today, user.id);
    }
  }, [user, loadHabitEntry, today]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
        {/* Current Date - largest text */}
        <div className="text-center">
          <h1 className="text-4xl font-bold">{format(today, "EEEE")}</h1>
          <p className="text-xl text-muted-foreground mt-2">
            {format(today, "MMMM d, yyyy")}
          </p>
        </div>

        {/* Check Habits Button */}
        <HabitToggle
          date={today}
          onSave={() => {
            if (user) {
              loadHabitEntry(today, user.id);
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

      {/* Quote at bottom */}
      <QuoteBox />
    </div>
  );
}
