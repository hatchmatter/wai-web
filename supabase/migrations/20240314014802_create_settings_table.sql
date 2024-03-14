create table public.settings (
  id uuid not null references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone,
  voice text default 'shimmer' not null,
  assistant_name text default 'Wai' not null,

  primary key (id)
);

alter table public.settings enable row level security;

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on settings
for each row execute
  procedure moddatetime(updated_at);

create policy "Allow Insert for Authenticated Users Only" on public.settings for
insert
  to authenticated with check (true);

create policy "Allow Update for Authenticated Users Only" on public.settings for
update
  to authenticated using (true);

create policy "Allow Select for Authenticated Users Only" on public.settings for
select
  to authenticated using (true);