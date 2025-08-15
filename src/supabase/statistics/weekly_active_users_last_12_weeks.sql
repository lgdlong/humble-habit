-- Thống kê số người dùng hoạt động mỗi tuần trong 12 tuần gần nhất
SELECT
  DATE_TRUNC('week', habit_records.created_at) AS activity_week,
  COUNT(DISTINCT habit_records.user_id) AS total_active_users
FROM public.habit_records
WHERE habit_records.created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', habit_records.created_at)
ORDER BY activity_week;
