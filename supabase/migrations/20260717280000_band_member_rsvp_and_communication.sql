-- Named RSVPs and event coordination for shared artist logins.
-- Legacy practice attendee arrays stay in place during rollout: this migration
-- is additive so existing production practice data remains recoverable.

create table if not exists public.band_members (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  name text not null,
  role text not null check (role in ('lead_vocalist', 'guitarist', 'bassist', 'drummer', 'keyboardist', 'backup_vocalist', 'percussionist', 'multi_instrumentalist', 'manager', 'other')),
  display_name text,
  email text,
  phone text,
  avatar_url text,
  avatar_color text not null default '#B026FF',
  is_active boolean not null default true,
  joined_date date not null default current_date,
  left_date date,
  rsvp_pin_hash text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.practices add column if not exists created_by_band_member uuid references public.band_members(id) on delete set null;
alter table public.show_run_sheets add column if not exists band_rsvp_required boolean not null default true;
alter table public.show_run_sheets add column if not exists band_rsvp_deadline date;

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('practice', 'show', 'meeting', 'studio_session')),
  practice_id uuid references public.practices(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  meeting_id uuid references public.meetings(id) on delete cascade,
  session_id uuid references public.engineering_sessions(id) on delete cascade,
  band_member_id uuid not null references public.band_members(id) on delete cascade,
  response text not null check (response in ('confirmed', 'declined', 'tentative', 'late')),
  late_arrival_time text,
  decline_reason text,
  note text,
  responded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_rsvps_event_reference_check check (
    (event_type = 'practice' and practice_id is not null and deal_id is null and meeting_id is null and session_id is null) or
    (event_type = 'show' and practice_id is null and deal_id is not null and meeting_id is null and session_id is null) or
    (event_type = 'meeting' and practice_id is null and deal_id is null and meeting_id is not null and session_id is null) or
    (event_type = 'studio_session' and practice_id is null and deal_id is null and meeting_id is null and session_id is not null)
  )
);

create table if not exists public.event_threads (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  event_type text not null check (event_type in ('practice', 'show', 'meeting', 'studio_session', 'general')),
  practice_id uuid references public.practices(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  meeting_id uuid references public.meetings(id) on delete cascade,
  session_id uuid references public.engineering_sessions(id) on delete cascade,
  title text,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint event_threads_event_reference_check check (
    (event_type = 'general' and practice_id is null and deal_id is null and meeting_id is null and session_id is null) or
    (event_type = 'practice' and practice_id is not null and deal_id is null and meeting_id is null and session_id is null) or
    (event_type = 'show' and practice_id is null and deal_id is not null and meeting_id is null and session_id is null) or
    (event_type = 'meeting' and practice_id is null and deal_id is null and meeting_id is not null and session_id is null) or
    (event_type = 'studio_session' and practice_id is null and deal_id is null and meeting_id is null and session_id is not null)
  )
);

create table if not exists public.event_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.event_threads(id) on delete cascade,
  band_member_id uuid references public.band_members(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  author_avatar_color text not null default '#B026FF',
  author_role text check (author_role in ('member', 'admin', 'manager', 'system')),
  body text not null check (char_length(body) <= 4000),
  is_system_message boolean not null default false,
  mentions text[] not null default '{}',
  reactions jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  recipient_profile_id uuid references public.profiles(id) on delete cascade,
  recipient_band_member_id uuid references public.band_members(id) on delete cascade,
  type text not null check (type in ('rsvp_received', 'rsvp_reminder', 'new_message', 'event_created', 'event_updated', 'event_cancelled', 'mention', 'practice_reminder', 'show_reminder', 'meeting_started', 'task_assigned')),
  title text not null,
  body text,
  link_type text,
  link_id uuid,
  is_read boolean not null default false,
  read_at timestamptz,
  email_sent boolean not null default false,
  email_sent_at timestamptz,
  dedup_key text,
  created_at timestamptz not null default now(),
  constraint notifications_one_recipient_check check (num_nonnulls(recipient_profile_id, recipient_band_member_id) = 1)
);

create index if not exists band_members_artist_idx on public.band_members(artist_id, is_active, sort_order);
create index if not exists event_rsvps_event_idx on public.event_rsvps(event_type, practice_id, deal_id, meeting_id, session_id);
create unique index if not exists event_rsvps_one_per_member_event_idx on public.event_rsvps (
  band_member_id, event_type,
  coalesce(practice_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(deal_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(meeting_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(session_id, '00000000-0000-0000-0000-000000000000'::uuid)
);
create unique index if not exists event_threads_one_general_per_artist_idx on public.event_threads(artist_id) where event_type = 'general';
create unique index if not exists event_threads_one_practice_idx on public.event_threads(practice_id) where practice_id is not null;
create unique index if not exists event_threads_one_show_idx on public.event_threads(deal_id) where deal_id is not null;
create unique index if not exists event_threads_one_meeting_idx on public.event_threads(meeting_id) where meeting_id is not null;
create unique index if not exists event_threads_one_session_idx on public.event_threads(session_id) where session_id is not null;
create index if not exists event_messages_thread_created_idx on public.event_messages(thread_id, created_at);
create index if not exists notifications_artist_unread_idx on public.notifications(artist_id, is_read, created_at desc) where is_read = false;
create unique index if not exists notifications_dedup_key_idx on public.notifications(dedup_key) where dedup_key is not null;

alter table public.band_members enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.event_threads enable row level security;
alter table public.event_messages enable row level security;
alter table public.notifications enable row level security;

create policy "band members: artist reads own" on public.band_members for select to authenticated using (
  public.is_operations_team() or exists (select 1 from public.artists where artists.id = band_members.artist_id and artists.profile_id = auth.uid())
);
create policy "band members: artist manages own" on public.band_members for all to authenticated using (
  public.is_operations_team() or exists (select 1 from public.artists where artists.id = band_members.artist_id and artists.profile_id = auth.uid())
) with check (
  public.is_operations_team() or exists (select 1 from public.artists where artists.id = band_members.artist_id and artists.profile_id = auth.uid())
);
create policy "rsvps: artist coordinates own" on public.event_rsvps for all to authenticated using (
  public.is_operations_team() or exists (
    select 1
    from public.band_members member
    join public.artists artist on artist.id = member.artist_id
    where member.id = event_rsvps.band_member_id
      and artist.profile_id = auth.uid()
      and (
        (event_rsvps.event_type = 'practice' and exists (select 1 from public.practices event where event.id = event_rsvps.practice_id and event.artist_id = member.artist_id)) or
        (event_rsvps.event_type = 'show' and exists (select 1 from public.deals event where event.id = event_rsvps.deal_id and event.artist_id = member.artist_id)) or
        (event_rsvps.event_type = 'meeting' and exists (select 1 from public.meetings event where event.id = event_rsvps.meeting_id and event.artist_id = member.artist_id)) or
        (event_rsvps.event_type = 'studio_session' and exists (select 1 from public.engineering_sessions event join public.projects project on project.id = event.project_id where event.id = event_rsvps.session_id and project.artist_id = member.artist_id))
      )
  )
) with check (
  public.is_operations_team() or exists (
    select 1
    from public.band_members member
    join public.artists artist on artist.id = member.artist_id
    where member.id = event_rsvps.band_member_id
      and artist.profile_id = auth.uid()
      and (
        (event_rsvps.event_type = 'practice' and exists (select 1 from public.practices event where event.id = event_rsvps.practice_id and event.artist_id = member.artist_id)) or
        (event_rsvps.event_type = 'show' and exists (select 1 from public.deals event where event.id = event_rsvps.deal_id and event.artist_id = member.artist_id)) or
        (event_rsvps.event_type = 'meeting' and exists (select 1 from public.meetings event where event.id = event_rsvps.meeting_id and event.artist_id = member.artist_id)) or
        (event_rsvps.event_type = 'studio_session' and exists (select 1 from public.engineering_sessions event join public.projects project on project.id = event.project_id where event.id = event_rsvps.session_id and project.artist_id = member.artist_id))
      )
  )
);
create policy "threads: artist coordinates own" on public.event_threads for all to authenticated using (
  public.is_operations_team() or exists (select 1 from public.artists where artists.id = event_threads.artist_id and artists.profile_id = auth.uid())
) with check (
  public.is_operations_team() or exists (select 1 from public.artists where artists.id = event_threads.artist_id and artists.profile_id = auth.uid())
);
create policy "messages: artist coordinates own" on public.event_messages for all to authenticated using (
  exists (select 1 from public.event_threads join public.artists on artists.id = event_threads.artist_id where event_threads.id = event_messages.thread_id and (public.is_operations_team() or artists.profile_id = auth.uid()))
) with check (
  exists (select 1 from public.event_threads join public.artists on artists.id = event_threads.artist_id where event_threads.id = event_messages.thread_id and not event_threads.is_locked and (public.is_operations_team() or artists.profile_id = auth.uid()))
  and (event_messages.band_member_id is null or exists (select 1 from public.band_members member join public.event_threads thread on thread.artist_id = member.artist_id where member.id = event_messages.band_member_id and thread.id = event_messages.thread_id))
);
create policy "notifications: artist reads own" on public.notifications for select to authenticated using (
  public.is_operations_team() or exists (select 1 from public.artists where artists.id = notifications.artist_id and artists.profile_id = auth.uid())
);
create policy "notifications: artist updates own" on public.notifications for update to authenticated using (
  public.is_operations_team() or exists (select 1 from public.artists where artists.id = notifications.artist_id and artists.profile_id = auth.uid())
) with check (
  public.is_operations_team() or exists (select 1 from public.artists where artists.id = notifications.artist_id and artists.profile_id = auth.uid())
);

grant select, insert, update, delete on public.band_members, public.event_rsvps, public.event_threads, public.event_messages, public.notifications to authenticated;
drop trigger if exists band_members_updated_at on public.band_members;
create trigger band_members_updated_at before update on public.band_members for each row execute function public.set_updated_at();
drop trigger if exists event_rsvps_updated_at on public.event_rsvps;
create trigger event_rsvps_updated_at before update on public.event_rsvps for each row execute function public.set_updated_at();
drop trigger if exists event_messages_updated_at on public.event_messages;
create trigger event_messages_updated_at before update on public.event_messages for each row execute function public.set_updated_at();

create or replace function public.ensure_general_band_thread()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.event_threads (artist_id, event_type, title)
  values (new.artist_id, 'general', 'Band chat')
  on conflict do nothing;
  return new;
end;
$$;
drop trigger if exists band_members_ensure_general_thread on public.band_members;
create trigger band_members_ensure_general_thread after insert on public.band_members for each row execute function public.ensure_general_band_thread();

create or replace function public.create_practice_coordination_thread()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_thread_id uuid;
begin
  insert into public.event_threads (artist_id, event_type, practice_id, title)
  values (new.artist_id, 'practice', new.id, new.title)
  on conflict do nothing;
  select id into target_thread_id from public.event_threads where practice_id = new.id;
  insert into public.event_messages (thread_id, author_name, author_role, body, is_system_message)
  values (target_thread_id, 'System', 'system', format('Practice scheduled · %s at %s', new.practice_date, new.start_time), true);
  update public.practices
  set expected_attendees = array(select coalesce(member.display_name, member.name) from public.band_members member where member.artist_id = new.artist_id and member.is_active order by member.sort_order, member.name)
  where id = new.id and cardinality(expected_attendees) = 0;
  insert into public.notifications (artist_id, recipient_band_member_id, type, title, body, link_type, link_id)
  select new.artist_id, member.id, 'event_created', 'Practice scheduled', new.title, 'practice', new.id
  from public.band_members member where member.artist_id = new.artist_id and member.is_active and (new.created_by_band_member is null or member.id <> new.created_by_band_member);
  if new.created_by_band_member is not null then
    insert into public.event_rsvps (event_type, practice_id, band_member_id, response, note)
    values ('practice', new.id, new.created_by_band_member, 'confirmed', 'Scheduled this practice')
    on conflict do nothing;
  end if;
  return new;
end;
$$;
drop trigger if exists practices_create_coordination_thread on public.practices;
create trigger practices_create_coordination_thread after insert on public.practices for each row execute function public.create_practice_coordination_thread();

create or replace function public.create_show_coordination_thread()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_thread_id uuid;
begin
  if new.artist_id is not null and new.stage::text = 'confirmed' and (tg_op = 'INSERT' or (tg_op = 'UPDATE' and old.stage is distinct from new.stage)) then
    insert into public.event_threads (artist_id, event_type, deal_id, title)
    values (new.artist_id, 'show', new.id, 'Confirmed show')
    on conflict do nothing;
    select id into target_thread_id from public.event_threads where deal_id = new.id;
    insert into public.event_messages (thread_id, author_name, author_role, body, is_system_message)
    values (target_thread_id, 'System', 'system', format('Show confirmed · %s', coalesce(new.event_date::text, 'date pending')), true);
    insert into public.notifications (artist_id, recipient_band_member_id, type, title, body, link_type, link_id)
    select new.artist_id, member.id, 'event_created', 'Show confirmed — RSVP required', coalesce(new.event_date::text, 'Date pending'), 'show', new.id
    from public.band_members member where member.artist_id = new.artist_id and member.is_active;
  end if;
  return new;
end;
$$;
drop trigger if exists deals_create_coordination_thread on public.deals;
create trigger deals_create_coordination_thread after insert or update of stage on public.deals for each row execute function public.create_show_coordination_thread();

create or replace function public.create_meeting_coordination_thread()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_thread_id uuid;
begin
  if new.artist_id is null then return new; end if;
  insert into public.event_threads (artist_id, event_type, meeting_id, title)
  values (new.artist_id, 'meeting', new.id, new.title)
  on conflict do nothing;
  select id into target_thread_id from public.event_threads where meeting_id = new.id;
  insert into public.event_messages (thread_id, author_name, author_role, body, is_system_message)
  values (target_thread_id, 'System', 'system', format('Meeting scheduled · %s at %s', new.scheduled_date, new.start_time), true);
  insert into public.notifications (artist_id, recipient_band_member_id, type, title, body, link_type, link_id)
  select new.artist_id, member.id, 'event_created', 'Meeting scheduled', new.title, 'meeting', new.id
  from public.band_members member where member.artist_id = new.artist_id and member.is_active;
  return new;
end;
$$;
drop trigger if exists meetings_create_coordination_thread on public.meetings;
create trigger meetings_create_coordination_thread after insert on public.meetings for each row execute function public.create_meeting_coordination_thread();

create or replace function public.create_session_coordination_thread()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_thread_id uuid; target_artist_id uuid;
begin
  select project.artist_id into target_artist_id from public.projects project where project.id = new.project_id;
  if target_artist_id is null then return new; end if;
  insert into public.event_threads (artist_id, event_type, session_id, title)
  values (target_artist_id, 'studio_session', new.id, 'Studio session')
  on conflict do nothing;
  select id into target_thread_id from public.event_threads where session_id = new.id;
  insert into public.event_messages (thread_id, author_name, author_role, body, is_system_message)
  values (target_thread_id, 'System', 'system', format('Studio session scheduled · %s with %s', new.session_date, new.engineer_name), true);
  insert into public.notifications (artist_id, recipient_band_member_id, type, title, body, link_type, link_id)
  select target_artist_id, member.id, 'event_created', 'Studio session scheduled', coalesce(new.engineer_name, 'Engineer pending'), 'studio_session', new.id
  from public.band_members member where member.artist_id = target_artist_id and member.is_active;
  return new;
end;
$$;
drop trigger if exists sessions_create_coordination_thread on public.engineering_sessions;
create trigger sessions_create_coordination_thread after insert on public.engineering_sessions for each row execute function public.create_session_coordination_thread();

-- Bring existing scheduled records into the new coordination model without
-- manufacturing events, members, RSVPs, or messages that do not exist.
insert into public.event_threads (artist_id, event_type, practice_id, title)
select practice.artist_id, 'practice', practice.id, practice.title
from public.practices practice where practice.status = 'scheduled'
on conflict do nothing;
insert into public.event_threads (artist_id, event_type, meeting_id, title)
select meeting.artist_id, 'meeting', meeting.id, meeting.title
from public.meetings meeting where meeting.artist_id is not null and meeting.status = 'scheduled'
on conflict do nothing;
insert into public.event_threads (artist_id, event_type, session_id, title)
select project.artist_id, 'studio_session', session.id, 'Studio session'
from public.engineering_sessions session join public.projects project on project.id = session.project_id
on conflict do nothing;
insert into public.event_threads (artist_id, event_type, deal_id, title)
select deal.artist_id, 'show', deal.id, 'Confirmed show'
from public.deals deal where deal.artist_id is not null and deal.stage::text = 'confirmed'
on conflict do nothing;
insert into public.event_messages (thread_id, author_name, author_role, body, is_system_message)
select thread.id, 'System', 'system', format('Practice scheduled · %s at %s', practice.practice_date, practice.start_time), true
from public.event_threads thread join public.practices practice on practice.id = thread.practice_id
where not exists (select 1 from public.event_messages message where message.thread_id = thread.id and message.is_system_message and message.body like 'Practice scheduled ·%');
insert into public.event_messages (thread_id, author_name, author_role, body, is_system_message)
select thread.id, 'System', 'system', format('Meeting scheduled · %s at %s', meeting.scheduled_date, meeting.start_time), true
from public.event_threads thread join public.meetings meeting on meeting.id = thread.meeting_id
where not exists (select 1 from public.event_messages message where message.thread_id = thread.id and message.is_system_message and message.body like 'Meeting scheduled ·%');
update public.practices practice
set expected_attendees = array(select coalesce(member.display_name, member.name) from public.band_members member where member.artist_id = practice.artist_id and member.is_active order by member.sort_order, member.name)
where practice.status = 'scheduled' and cardinality(practice.expected_attendees) = 0;

create or replace function public.record_rsvp_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_thread_id uuid; member_name text; member_color text; event_id uuid; event_label text;
begin
  select coalesce(display_name, name), avatar_color into member_name, member_color from public.band_members where id = new.band_member_id;
  event_id := coalesce(new.practice_id, new.deal_id, new.meeting_id, new.session_id);
  event_label := replace(new.response, '_', ' ');
  select id into target_thread_id from public.event_threads where
    (new.practice_id is not null and practice_id = new.practice_id) or
    (new.deal_id is not null and deal_id = new.deal_id) or
    (new.meeting_id is not null and meeting_id = new.meeting_id) or
    (new.session_id is not null and session_id = new.session_id)
  limit 1;
  if target_thread_id is not null then
    insert into public.event_messages (thread_id, band_member_id, author_name, author_avatar_color, author_role, body, is_system_message)
    values (target_thread_id, new.band_member_id, 'System', coalesce(member_color, '#B026FF'), 'system', format('%s is %s%s', coalesce(member_name, 'Band member'), event_label, case when new.late_arrival_time is not null then ' · arriving ' || new.late_arrival_time when new.note is not null then ' · ' || new.note else '' end), true);
  end if;
  insert into public.notifications (artist_id, recipient_band_member_id, type, title, body, link_type, link_id)
  select member.artist_id, member.id, 'rsvp_received', coalesce(member_name, 'Band member') || ' responded', event_label, new.event_type, event_id
  from public.band_members member
  where member.artist_id = (select artist_id from public.band_members where id = new.band_member_id)
    and member.is_active and member.id <> new.band_member_id;
  return new;
end;
$$;
drop trigger if exists event_rsvps_record_activity on public.event_rsvps;
create trigger event_rsvps_record_activity after insert or update of response, late_arrival_time, decline_reason, note on public.event_rsvps for each row execute function public.record_rsvp_activity();

create or replace function public.notify_event_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_artist_id uuid;
begin
  if new.is_system_message then return new; end if;
  select artist_id into target_artist_id from public.event_threads where id = new.thread_id;
  insert into public.notifications (artist_id, recipient_band_member_id, type, title, body, link_type, link_id)
  select target_artist_id, member.id, case when coalesce(array_length(new.mentions, 1), 0) > 0 and coalesce(member.display_name, member.name) = any(new.mentions) then 'mention' else 'new_message' end, 'New message from ' || new.author_name, left(new.body, 180), 'thread', new.thread_id
  from public.band_members member
  where member.artist_id = target_artist_id and member.is_active and (new.band_member_id is null or member.id <> new.band_member_id);
  return new;
end;
$$;
drop trigger if exists event_messages_notify_members on public.event_messages;
create trigger event_messages_notify_members after insert on public.event_messages for each row execute function public.notify_event_message();

-- Realtime subscriptions power the shared-login RSVP, chat, and notification UI.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'event_rsvps') then alter publication supabase_realtime add table public.event_rsvps; end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'event_messages') then alter publication supabase_realtime add table public.event_messages; end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then alter publication supabase_realtime add table public.notifications; end if;
  end if;
end;
$$;

-- Seed only confirmed people; placeholder members are intentionally not fabricated.
insert into public.band_members (artist_id, name, role, display_name, email, avatar_color, sort_order)
select artist.id, seed.name, seed.role, seed.display_name, seed.email, seed.avatar_color, seed.sort_order
from public.artists artist
cross join (values
  ('Jesse Gawlik', 'lead_vocalist', 'Jesse', 'jesse@sandabado.com', '#B026FF', 1),
  ('Palo Xanto', 'guitarist', 'Palo', 'palo@sandabado.com', '#00FFC2', 2)
) as seed(name, role, display_name, email, avatar_color, sort_order)
where artist.artist_name = 'Sandābādo'
and not exists (select 1 from public.band_members member where member.artist_id = artist.id and member.name = seed.name);
