-- Toy Library schema. Run once in the Supabase SQL editor, then notifications.sql, then functions.sql.

-- Toys ---------------------------------------------------------------
create table public.toys (
  id           bigint generated always as identity primary key,
  name         text not null,
  type         text not null,
  description  text not null default '',
  who_for      text not null default '',
  features     text not null default '',
  lending_days int  not null default 10,
  image_url    text,
  -- available: can be borrowed
  -- processing: someone requested it, waiting for manual approval
  -- reserved: approved and lent out
  status       text not null default 'available'
               check (status in ('available', 'processing', 'reserved')),
  created_at   timestamptz not null default now()
);

-- Users (one row per Supabase auth user) ------------------------------
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- Create a public.users row whenever someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reservations (join table between users and toys) --------------------
create table public.reservations (
  id           bigint generated always as identity primary key,
  user_id      uuid   not null references public.users (id) on delete cascade,
  toy_id       bigint not null references public.toys (id) on delete cascade,
  -- processing: requested; approved: with the user; returned: done
  status       text not null default 'processing'
               check (status in ('processing', 'approved', 'returned')),
  lending_days int  not null,
  requested_at timestamptz not null default now(),
  -- Set this by hand when approving. Overdue = approved and due_date < today.
  due_date     date
);

create index reservations_user_id_idx on public.reservations (user_id);
create index reservations_toy_id_idx on public.reservations (toy_id);

-- Row level security ---------------------------------------------------
-- Reads: toys are public, users/reservations only for their owner.
-- Writes: only the API routes (service role key, which bypasses RLS).
alter table public.toys enable row level security;
alter table public.users enable row level security;
alter table public.reservations enable row level security;

create policy "Toys are readable by everyone"
  on public.toys for select using (true);

create policy "Users can read their own row"
  on public.users for select using (auth.uid() = id);

create policy "Users can read their own reservations"
  on public.reservations for select using (auth.uid() = user_id);
