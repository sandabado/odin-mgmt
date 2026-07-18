-- Accounts created before the Phase 1 auth trigger need a profile too.
-- The first backfilled account receives the same bootstrap super-admin role.
insert into public.profiles (id, full_name, role)
select
  user_record.id,
  coalesce(user_record.raw_user_meta_data ->> 'full_name', split_part(user_record.email, '@', 1)),
  case
    when not exists (select 1 from public.profiles where role = 'super_admin') then 'super_admin'::public.odin_role
    else 'artist'::public.odin_role
  end
from auth.users as user_record
left join public.profiles as profile on profile.id = user_record.id
where profile.id is null;
