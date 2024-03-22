alter table public.settings
  drop column voice,
  add column agent_id text references public.agents(id);