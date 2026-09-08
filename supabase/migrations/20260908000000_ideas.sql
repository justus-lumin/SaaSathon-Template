-- A user's ideas are private. The publishable key is intentionally public;
-- grants and RLS, not a hidden frontend, enforce access.
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  created_at timestamptz not null default now()
);
create index ideas_user_created_idx on public.ideas (user_id, created_at desc);
alter table public.ideas enable row level security;
revoke all on public.ideas from anon, authenticated;
grant select, insert, delete on public.ideas to authenticated;
grant update (title, description) on public.ideas to authenticated;
create policy "Read own ideas" on public.ideas for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own ideas" on public.ideas for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own ideas" on public.ideas for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own ideas" on public.ideas for delete to authenticated using ((select auth.uid()) = user_id);
