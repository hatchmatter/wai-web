create policy "Allow Insert for Authenticated Users Only" on public.calls for
insert
  to authenticated with check (true);
