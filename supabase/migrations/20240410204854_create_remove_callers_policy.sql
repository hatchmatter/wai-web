create policy "Allow Delete for Authenticated Users Only" on public.callers for
delete
  to authenticated using (true);