ALTER TABLE habit_records
DROP CONSTRAINT habit_records_habit_id_fkey,
ADD CONSTRAINT habit_records_habit_id_fkey
  FOREIGN KEY (habit_id) REFERENCES habits(id)
  ON DELETE CASCADE;
