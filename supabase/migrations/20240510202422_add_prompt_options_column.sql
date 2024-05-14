<<<<<<< HEAD
alter table public.settings add column prompt_options jsonb not null default '{ "Mythical Characters": true }'::jsonb;
=======
alter table public.settings add column prompt_options jsonb not null default '{ "Mythical Characters": true }'::jsonb;
>>>>>>> b31ab7e (fix: adjusted to work with only having the one prompt option)
