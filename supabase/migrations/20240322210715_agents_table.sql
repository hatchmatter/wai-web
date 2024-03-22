create table public.agents (
  id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone,
  name text not null,

  primary key (id)
);

alter table public.agents enable row level security;

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on agents
for each row execute
  procedure moddatetime(updated_at);

create policy "Allow Select for Authenticated Users Only" on public.agents for
select
  to authenticated using (true);
