create table public.callers_calls (
  caller_id uuid not null references public.callers on delete cascade,
  call_id uuid not null references public.calls on delete cascade,

  primary key (caller_id, call_id)
);

alter table public.callers_calls enable row level security;

create policy "Allow Select for Authenticated Users Only" on public.callers_calls for
select
  to authenticated using (true);