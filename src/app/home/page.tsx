"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { DayView } from "@/components/DayView";
import { MonthView } from "@/components/MonthView";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/app/login/page";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<"day" | "month">("day");
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {currentView === "day" ? (
        <DayView date={selectedDate} onViewChange={setCurrentView} />
      ) : (
        <MonthView
          date={selectedDate}
          onViewChange={setCurrentView}
          onDateSelect={setSelectedDate}
        />
      )}
    </div>
  );
}
