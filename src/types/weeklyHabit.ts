export type WeekdayId = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Mon ... 7=Sun

export interface WeeklyHabitDTO {
  id: string;
  user_id: string;
  title: string;
  days: WeekdayId[]; // from weekly_habit_days
  created_at: string;
  updated_at: string;
}

export interface WeeklyHabitRecord {
  id: string;
  user_id: string;
  weekly_habit_id: string;
  date: string; // YYYY-MM-DD format
  status: boolean;
  created_at: string;
  updated_at: string;
}