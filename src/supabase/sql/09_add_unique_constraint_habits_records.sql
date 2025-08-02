-- Add unique constraint to ensure one record per habit per date
ALTER TABLE habit_records
ADD CONSTRAINT unique_habit_per_day
UNIQUE (user_id, habit_id, date);