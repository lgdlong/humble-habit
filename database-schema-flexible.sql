-- Updated Humble Habit Database Schema (Flexible Design)
-- This matches your TypeScript types structure

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7), -- hex color code like #FF5733
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create habit_records table
CREATE TABLE IF NOT EXISTS habit_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure one record per habit per date
  UNIQUE(habit_id, date)
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_records_user_id ON habit_records(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_records_habit_id ON habit_records(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_records_date ON habit_records(date);
CREATE INDEX IF NOT EXISTS idx_habit_records_user_date ON habit_records(user_id, date);

-- Row Level Security (RLS)
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_records ENABLE ROW LEVEL SECURITY;

-- Habits policies
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Habit records policies
CREATE POLICY "Users can view own habit records" ON habit_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit records" ON habit_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit records" ON habit_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit records" ON habit_records
  FOR DELETE USING (auth.uid() = user_id);

-- Quotes policies (public read access)
CREATE POLICY "Anyone can view quotes" ON quotes
  FOR SELECT USING (true);

-- Admin-only access for quotes modification
CREATE POLICY "Only admins can modify quotes" ON quotes
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
  ));

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for habit_records
CREATE TRIGGER update_habit_records_updated_at
  BEFORE UPDATE ON habit_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
