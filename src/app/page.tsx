"use client";

import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DayView } from "@/components/DayView";
import { MonthView } from "@/components/MonthView";
import { useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<"day" | "month">("day");

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto"></div>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        {view === "day" ? (
          <DayView onSwitchToMonth={() => setView("month")} />
        ) : (
          <MonthView onSwitchToDay={() => setView("day")} />
        )}
      </main>
    </div>
  );
}
