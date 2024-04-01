create table public.calls (
  id uuid not null default gen_random_uuid(),
  retell_id text not null,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone,
  ended_at timestamp with time zone,
  current_caller_id uuid references public.callers on delete set null,

  primary key (id)
);

create index retell_id_index on public.calls (retell_id);

alter table public.calls enable row level security;

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on calls
for each row execute
  procedure moddatetime(updated_at);

create policy "Allow Select for Authenticated Users Only" on public.calls for
select
  to authenticated using (true);