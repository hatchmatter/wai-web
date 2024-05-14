alter table public.settings add column prompt_options jsonb not null default '{ "Mythical Characters": true }'::jsonb;
