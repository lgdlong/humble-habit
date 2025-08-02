// src/constants/supabase.ts

// Lấy projectRef từ URL môi trường
export const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_PROJECT_REF = SUPABASE_PROJECT_URL
  ? SUPABASE_PROJECT_URL.replace(/^https:\/\/(.*?)\..*$/, "$1")
  : "";

// Tên cookie Supabase Auth (tùy phiên bản sẽ khác)
export const SUPABASE_AUTH_COOKIE = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

// Nếu cần thêm key khác (VD: refresh token hoặc storage)
export const SUPABASE_STORAGE_URL = `${SUPABASE_PROJECT_URL}/storage/v1`;
