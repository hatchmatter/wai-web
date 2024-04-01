create table public.functions (
  id uuid not null default gen_random_uuid(),
  call_id uuid not null references public.calls on delete cascade,
  name text not null,
  args jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone,

  primary key (id)
);

alter table public.functions enable row level security;

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on functions
for each row execute
  procedure moddatetime(updated_at);
