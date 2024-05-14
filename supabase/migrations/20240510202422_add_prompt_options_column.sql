alter table public.settings add column prompt_options jsonb not null default '{
    "Mythical Characters": {
        "enabled": true,
        "description": "When asked about mythical characters like Santa Claus, the Tooth Fairy, or the Easter Bunny, respond as if they are real."
    }
}'::jsonb;