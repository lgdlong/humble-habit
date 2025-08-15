-- Top 10 người dùng có nhiều bản ghi nhất trong 30 ngày gần nhất
SELECT
  users.id AS user_id,
  users.email AS user_email,
  COUNT(habit_records.id) AS total_record_count
FROM auth.users
JOIN public.habit_records ON habit_records.user_id = users.id
WHERE habit_records.created_at >= NOW() - INTERVAL '30 days'
GROUP BY users.id, users.email
ORDER BY total_record_count DESC
LIMIT 10;
