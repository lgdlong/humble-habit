-- Danh sách người dùng không có bản ghi nào trong 30 ngày gần nhất
SELECT users.id AS user_id, users.email AS user_email
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1
  FROM public.habit_records
  WHERE habit_records.user_id = users.id
    AND habit_records.created_at >= NOW() - INTERVAL '30 days'
);
