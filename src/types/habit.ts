export interface Habit {
  id: string; // uuid
  user_id: string; // uuid
  name: string;
  color?: string; // optional color for the habit
  created_at?: string;
}
