// src/constants/supabase.ts

// Get projectRef from environment URL
export const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_PROJECT_REF = SUPABASE_PROJECT_URL
  ? SUPABASE_PROJECT_URL.replace(/^https:\/\/(.*?)\..*$/, "$1")
  : "";

// Supabase Auth cookie name (may vary by version)
export const SUPABASE_AUTH_COOKIE = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

// If you need to add another key (e.g., refresh token or storage)
export const SUPABASE_STORAGE_URL = `${SUPABASE_PROJECT_URL}/storage/v1`;
