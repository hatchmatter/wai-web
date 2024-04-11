alter table public.leads add column invited_on timestamp with time zone;

-- make email column unique
alter table public.leads add constraint leads_email_unique unique (email);