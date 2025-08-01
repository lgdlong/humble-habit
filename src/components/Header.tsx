"use client";

import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  // Extract email before '@'
  const getEmailPrefix = (email?: string) => {
    if (!email) return "";
    return email.split("@")[0];
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Humble Habit</h1>
        {user && (
          <span className="ml-2 text-sm text-muted-foreground">
            {getEmailPrefix(user.email)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Login/Logout Button */}
        {user ? (
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
