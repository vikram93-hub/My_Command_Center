-- My Command Center: one private JSON workspace per authenticated user.
-- Run this script in Supabase Dashboard -> SQL Editor -> New query.

create table if not exists public.command_center_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.command_center_workspaces enable row level security;

drop policy if exists "Users can read their own workspace" on public.command_center_workspaces;
create policy "Users can read their own workspace"
  on public.command_center_workspaces
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own workspace" on public.command_center_workspaces;
create policy "Users can insert their own workspace"
  on public.command_center_workspaces
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own workspace" on public.command_center_workspaces;
create policy "Users can update their own workspace"
  on public.command_center_workspaces
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_command_center_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists command_center_workspace_updated_at on public.command_center_workspaces;
create trigger command_center_workspace_updated_at
before update on public.command_center_workspaces
for each row execute function public.set_command_center_updated_at();

grant select, insert, update on public.command_center_workspaces to authenticated;
