-- Danh sách người dùng chưa từng có bản ghi nào
SELECT users.id AS user_id, users.email AS user_email
FROM auth.users
LEFT JOIN public.habit_records ON habit_records.user_id = users.id
WHERE habit_records.user_id IS NULL;
