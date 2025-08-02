"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important: include cookies
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || "Login failed" } };
      }

      // Refresh the session after successful login
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      return { error: null };
    } catch (error) {
      console.error("Login error:", error);
      return { error: { message: "Login failed" } };
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include", // Important: include cookies
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: { message: data.error || "Logout failed" } };
      }

      // Clear the user state
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error("Logout error:", error);
      return { error: { message: "Logout failed" } };
    }
  };

  return {
    user,
    loading,
    login,
    signUp,
    signOut,
  };
}
