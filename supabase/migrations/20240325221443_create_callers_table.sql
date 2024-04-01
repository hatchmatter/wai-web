create table public.callers (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone,
  name text not null,

  primary key (id)
);

alter table public.callers
  add constraint uniq_callers_for_user unique(user_id, name);

alter table public.callers enable row level security;

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on callers
for each row execute
  procedure moddatetime(updated_at);

create policy "Allow Insert for Authenticated Users Only" on public.callers for
insert
  to authenticated with check (true);

create policy "Allow Update for Authenticated Users Only" on public.callers for
update
  to authenticated using (true);

create policy "Allow Select for Authenticated Users Only" on public.callers for
select
  to authenticated using (true);