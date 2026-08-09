-- Whole Body Records public media
--
-- Public derivatives only. Source masters and protected Foundation material
-- must never be placed in this bucket.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'records-public',
  'records-public',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "records public media: anyone reads"
on storage.objects;

create policy "records public media: anyone reads"
on storage.objects
for select
to public
using (bucket_id = 'records-public');

drop policy if exists "records public media: super admin uploads"
on storage.objects;

create policy "records public media: super admin uploads"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'records-public'
  and public.current_odin_role() = 'super_admin'
);

drop policy if exists "records public media: super admin updates"
on storage.objects;

create policy "records public media: super admin updates"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'records-public'
  and public.current_odin_role() = 'super_admin'
)
with check (
  bucket_id = 'records-public'
  and public.current_odin_role() = 'super_admin'
);

drop policy if exists "records public media: super admin deletes"
on storage.objects;

create policy "records public media: super admin deletes"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'records-public'
  and public.current_odin_role() = 'super_admin'
);
