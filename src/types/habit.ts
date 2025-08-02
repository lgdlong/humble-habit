export interface Habit {
  id: string; // uuid
  user_id: string; // uuid
  name: string;
  created_at?: string;
}
