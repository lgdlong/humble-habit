-- Thống kê số người dùng hoạt động mỗi ngày trong 30 ngày gần nhất
SELECT
  DATE(habit_records.created_at) AS activity_date,
  COUNT(DISTINCT habit_records.user_id) AS total_active_users
FROM public.habit_records
WHERE habit_records.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(habit_records.created_at)
ORDER BY activity_date;