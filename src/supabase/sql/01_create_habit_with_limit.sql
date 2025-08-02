create or replace function create_habit_with_limit(
  p_user_id uuid,
  p_name text,
  p_max_habits integer
)
returns table (id uuid, user_id uuid, name text, created_at timestamp)
language plpgsql
as $$
begin
  -- Check current count
  if (select count(*) from habits where user_id = p_user_id) >= p_max_habits then
    raise exception 'Maximum habits reached';
  end if;

  -- Insert habit
  insert into habits (user_id, name)
    values (p_user_id, p_name)
    returning id, user_id, name, created_at into id, user_id, name, created_at;
  return next;
end;
$$;
