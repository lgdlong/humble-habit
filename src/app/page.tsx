"use client";

import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DayView } from "@/components/DayView";
import { MonthView } from "@/components/MonthView";
import { QuoteBox } from "@/components/QuoteBox";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<"day" | "month">("day");
  const router = useRouter();

  // Handle client-side redirect to login if not authenticated
  // Using useEffect to avoid calling router.push during render phase
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Show loading state while authentication is being checked
  // This prevents flashing content and hydration mismatches
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

  // If user is not authenticated, show nothing while redirecting
  // This prevents any content flash before redirect
  if (!user) {
    return null;
  }

  // Main home page content - only rendered if user is authenticated
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with user info and logout functionality */}
      <Header />

      {/* Main content area - centered between header and quote */}
      <div className="flex-1 flex flex-col justify-center items-center overflow-hidden pb-20">
        <main className="w-full max-w-2xl">
          {/* Conditional rendering of Day or Month view */}
          {view === "day" ? (
            <DayView onSwitchToMonth={() => setView("month")} />
          ) : (
            <MonthView onSwitchToDay={() => setView("day")} />
          )}
        </main>
      </div>

      {/* Fixed quote box at bottom */}
      <QuoteBox />
    </div>
  );
}
