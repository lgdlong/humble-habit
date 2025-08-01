-- Humble Habbit Database Schema
-- Run this SQL in your Supabase SQL editor to set up the database

-- Create habit_entries table
CREATE TABLE IF NOT EXISTS habit_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  habit_1_completed BOOLEAN DEFAULT FALSE,
  habit_2_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure one entry per user per date
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_entries_user_id ON habit_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(date);
CREATE INDEX IF NOT EXISTS idx_habit_entries_user_date ON habit_entries(user_id, date);

-- Row Level Security (RLS)
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own habit entries
CREATE POLICY "Users can view own habit entries" ON habit_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own habit entries
CREATE POLICY "Users can insert own habit entries" ON habit_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own habit entries
CREATE POLICY "Users can update own habit entries" ON habit_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own habit entries
CREATE POLICY "Users can delete own habit entries" ON habit_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_habit_entries_updated_at
  BEFORE UPDATE ON habit_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
