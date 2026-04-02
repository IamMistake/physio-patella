insert into storage.buckets (id, name, public)
values
  ('employee-media', 'employee-media', true),
  ('treatment-media', 'treatment-media', true),
  ('documents', 'documents', true),
  ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read employee-media" on storage.objects;
create policy "Public read employee-media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'employee-media');

drop policy if exists "Public read treatment-media" on storage.objects;
create policy "Public read treatment-media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'treatment-media');

drop policy if exists "Public read documents" on storage.objects;
create policy "Public read documents"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'documents');

drop policy if exists "Public read blog-media" on storage.objects;
create policy "Public read blog-media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'blog-media');

drop policy if exists "Service role upload employee-media" on storage.objects;
create policy "Service role upload employee-media"
  on storage.objects
  for insert
  to service_role
  with check (bucket_id = 'employee-media');

drop policy if exists "Service role upload treatment-media" on storage.objects;
create policy "Service role upload treatment-media"
  on storage.objects
  for insert
  to service_role
  with check (bucket_id = 'treatment-media');

drop policy if exists "Service role upload documents" on storage.objects;
create policy "Service role upload documents"
  on storage.objects
  for insert
  to service_role
  with check (bucket_id = 'documents');

drop policy if exists "Service role upload blog-media" on storage.objects;
create policy "Service role upload blog-media"
  on storage.objects
  for insert
  to service_role
  with check (bucket_id = 'blog-media');
