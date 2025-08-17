-- Weekly Habits Schema Extension
-- Add weekly habits functionality to the existing Humble Habit database

-- Create days_of_week lookup table
CREATE TABLE IF NOT EXISTS days_of_week (
  id INTEGER PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  abbreviation CHAR(3) NOT NULL
);

-- Insert weekdays (1=Monday, 2=Tuesday, ... 7=Sunday)
INSERT INTO days_of_week (id, name, abbreviation) VALUES
  (1, 'Monday', 'Mon'),
  (2, 'Tuesday', 'Tue'),
  (3, 'Wednesday', 'Wed'),
  (4, 'Thursday', 'Thu'),
  (5, 'Friday', 'Fri'),
  (6, 'Saturday', 'Sat'),
  (7, 'Sunday', 'Sun')
ON CONFLICT (id) DO NOTHING;

-- Create weekly_habits table
CREATE TABLE IF NOT EXISTS weekly_habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create weekly_habit_days junction table
CREATE TABLE IF NOT EXISTS weekly_habit_days (
  weekly_habit_id UUID NOT NULL REFERENCES weekly_habits(id) ON DELETE CASCADE,
  day_id INTEGER NOT NULL REFERENCES days_of_week(id) ON DELETE CASCADE,
  PRIMARY KEY (weekly_habit_id, day_id)
);

-- Create weekly_habit_records table for tracking completion
CREATE TABLE IF NOT EXISTS weekly_habit_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_habit_id UUID NOT NULL REFERENCES weekly_habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure one record per weekly habit per date
  UNIQUE(weekly_habit_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_habits_user_id ON weekly_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_habit_days_weekly_habit_id ON weekly_habit_days(weekly_habit_id);
CREATE INDEX IF NOT EXISTS idx_weekly_habit_days_day_id ON weekly_habit_days(day_id);
CREATE INDEX IF NOT EXISTS idx_weekly_habit_records_user_id ON weekly_habit_records(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_habit_records_weekly_habit_id ON weekly_habit_records(weekly_habit_id);
CREATE INDEX IF NOT EXISTS idx_weekly_habit_records_date ON weekly_habit_records(date);
CREATE INDEX IF NOT EXISTS idx_weekly_habit_records_user_date ON weekly_habit_records(user_id, date);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_weekly_habit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_weekly_habits_updated_at
  BEFORE UPDATE ON weekly_habits
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_habit_updated_at();

CREATE TRIGGER update_weekly_habit_records_updated_at
  BEFORE UPDATE ON weekly_habit_records
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_habit_updated_at();

-- NOTE: No RLS policies as mentioned in the issue - rely on frontend filtering by user_id