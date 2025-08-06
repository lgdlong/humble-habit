export interface HabitRecord {
  id: string; // uuid
  user_id: string; // uuid
  habit_id: string; // uuid
  date: string; // YYYY-MM-DD
  status: boolean; // completed or not
  created_at?: string;
  updated_at?: string;
}
