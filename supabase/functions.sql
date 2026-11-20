-- Transaction functions. Run in the Supabase SQL editor after schema.sql and notifications.sql.
-- Each function runs as ONE transaction: if any step fails, nothing is saved.
-- Safe to re-run (create or replace).

-- Request a toy: mark it processing + create the reservation.
create or replace function public.reserve_toy(p_user_id uuid, p_toy_id bigint, p_lending_days int)
returns table (reservation_id bigint, toy_name text, lending_days int)
language plpgsql
as $$
declare
  v_name text;
  v_days int;
  v_id   bigint;
begin
  update public.toys
     set status = 'processing'
   where id = p_toy_id and status = 'available'
  returning name, coalesce(p_lending_days, toys.lending_days) into v_name, v_days;

  if not found then
    raise exception 'TOY_NOT_AVAILABLE';
  end if;

  insert into public.reservations (user_id, toy_id, lending_days)
  values (p_user_id, p_toy_id, v_days)
  returning id into v_id;

  return query select v_id, v_name, v_days;
end;
$$;

-- Cancel or reject a pending request: delete it + make the toy available.
create or replace function public.cancel_reservation(p_reservation_id bigint)
returns bigint
language plpgsql
as $$
declare
  v_toy_id bigint;
begin
  delete from public.reservations
   where id = p_reservation_id and status = 'processing'
  returning toy_id into v_toy_id;

  if not found then
    raise exception 'RESERVATION_NOT_PENDING';
  end if;

  update public.toys set status = 'available'
   where id = v_toy_id and status = 'processing';

  return v_toy_id;
end;
$$;

-- Approve a pending request: set due date + mark the toy reserved + notify the user.
create or replace function public.approve_reservation(p_reservation_id bigint)
returns date
language plpgsql
as $$
declare
  v_toy_id  bigint;
  v_user_id uuid;
  v_due     date;
begin
  update public.reservations
     set status = 'approved', due_date = current_date + lending_days
   where id = p_reservation_id and status = 'processing'
  returning toy_id, user_id, due_date into v_toy_id, v_user_id, v_due;

  if not found then
    raise exception 'RESERVATION_NOT_PENDING';
  end if;

  update public.toys set status = 'reserved' where id = v_toy_id;

  insert into public.notifications (user_id, kind, toy_name, due_date)
  select v_user_id, 'approved', name, v_due from public.toys where id = v_toy_id;

  return v_due;
end;
$$;

-- Reject a pending request: delete it + make the toy available + notify the user.
create or replace function public.reject_reservation(p_reservation_id bigint)
returns bigint
language plpgsql
as $$
declare
  v_toy_id  bigint;
  v_user_id uuid;
begin
  delete from public.reservations
   where id = p_reservation_id and status = 'processing'
  returning toy_id, user_id into v_toy_id, v_user_id;

  if not found then
    raise exception 'RESERVATION_NOT_PENDING';
  end if;

  update public.toys set status = 'available'
   where id = v_toy_id and status = 'processing';

  insert into public.notifications (user_id, kind, toy_name)
  select v_user_id, 'rejected', name from public.toys where id = v_toy_id;

  return v_toy_id;
end;
$$;

-- Only the server (service role key) may call these, not the public key.
revoke execute on function public.reserve_toy(uuid, bigint, int) from public, anon, authenticated;
revoke execute on function public.cancel_reservation(bigint) from public, anon, authenticated;
revoke execute on function public.approve_reservation(bigint) from public, anon, authenticated;
revoke execute on function public.reject_reservation(bigint) from public, anon, authenticated;
grant execute on function public.reserve_toy(uuid, bigint, int) to service_role;
grant execute on function public.cancel_reservation(bigint) to service_role;
grant execute on function public.approve_reservation(bigint) to service_role;
grant execute on function public.reject_reservation(bigint) to service_role;

-- TODO: build an /admin page with a "Mark returned" button (restricted to ADMIN_EMAILS).
-- Until then, when a toy comes back, run this in the SQL editor (replace 123 with the reservation id):
--
--   begin;
--   update public.toys set status = 'available'
--    where id = (select toy_id from public.reservations where id = 123);
--   update public.reservations set status = 'returned' where id = 123;
--   commit;
