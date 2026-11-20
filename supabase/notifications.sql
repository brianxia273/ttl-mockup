-- Notifications shown to users when a request is approved/rejected.
-- Run after schema.sql and BEFORE functions.sql. Safe to re-run.

create table if not exists public.notifications (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.users (id) on delete cascade,
  kind       text not null check (kind in ('approved', 'rejected')),
  toy_name   text not null,
  due_date   date,
  created_at timestamptz not null default now(),
  seen_at    timestamptz -- null = not dismissed yet
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);

alter table public.notifications enable row level security;

drop policy if exists "Users can read their own notifications" on public.notifications;
create policy "Users can read their own notifications"
  on public.notifications for select using (auth.uid() = user_id);
