-- Whole Body Engineering: people, project staffing, durable session communication.

create table public.studio_contributors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  roles text[] not null default '{}'
    check (roles <@ array['engineer', 'producer', 'mixer', 'mastering_engineer', 'assistant_engineer']),
  specialties text[] not null default '{}',
  bio text,
  hourly_rate_cents integer check (hourly_rate_cents is null or hourly_rate_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_contributors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  contributor_id uuid not null references public.studio_contributors(id) on delete cascade,
  assignment_role text not null check (assignment_role in ('engineer', 'producer', 'mixer', 'mastering_engineer', 'assistant_engineer')),
  status text not null default 'active' check (status in ('planned', 'active', 'complete', 'paused')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, contributor_id, assignment_role)
);

alter table public.engineering_sessions
  add column title text,
  add column session_status text not null default 'scheduled' check (session_status in ('scheduled', 'in_progress', 'complete', 'cancelled')),
  add column engineer_id uuid references public.studio_contributors(id) on delete set null,
  add column producer_id uuid references public.studio_contributors(id) on delete set null,
  add column scheduled_start timestamptz,
  add column scheduled_end timestamptz;

create table public.session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.engineering_sessions(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_role text not null check (author_role in ('artist', 'engineer', 'producer', 'admin')),
  title text,
  content text not null,
  parent_note_id uuid references public.session_notes(id) on delete cascade,
  thread_position integer not null default 0,
  is_edit boolean not null default false,
  is_important boolean not null default false,
  requires_response boolean not null default false,
  resolved_at timestamptz,
  visible_to_artist boolean not null default true,
  visible_to_engineer boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_attachments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.engineering_sessions(id) on delete cascade,
  note_id uuid references public.session_notes(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes between 0 and 52428800),
  storage_path text not null,
  description text,
  purpose text not null default 'other' check (purpose in ('reference_track', 'demo', 'lyrics', 'chord_chart', 'temp_mix', 'notes_document', 'cover_art', 'other')),
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('session_note', 'session_reply', 'deal', 'campaign', 'system')),
  subject text not null,
  preview text,
  deep_link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index project_contributors_project_idx on public.project_contributors(project_id, status);
create index engineering_sessions_staff_idx on public.engineering_sessions(engineer_id, producer_id, session_date desc);
create index session_notes_session_thread_idx on public.session_notes(session_id, parent_note_id, created_at);
create index session_attachments_session_idx on public.session_attachments(session_id);
create index notifications_recipient_unread_idx on public.notifications(recipient_id, read_at, created_at desc);

create trigger studio_contributors_updated_at before update on public.studio_contributors for each row execute function public.set_updated_at();
create trigger project_contributors_updated_at before update on public.project_contributors for each row execute function public.set_updated_at();
create trigger session_notes_updated_at before update on public.session_notes for each row execute function public.set_updated_at();

alter table public.studio_contributors enable row level security;
alter table public.project_contributors enable row level security;
alter table public.session_notes enable row level security;
alter table public.session_attachments enable row level security;
alter table public.notifications enable row level security;

create policy "studio contributors: operations team manages" on public.studio_contributors for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "project contributors: operations team manages" on public.project_contributors for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "session notes: operations team manages" on public.session_notes for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "session attachments: operations team manages" on public.session_attachments for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "notifications: recipient reads own" on public.notifications for select to authenticated using (recipient_id = auth.uid());
create policy "notifications: recipient updates own" on public.notifications for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

create policy "project contributors: artist reads own" on public.project_contributors for select to authenticated using (exists (select 1 from public.projects join public.artists on artists.id = projects.artist_id where projects.id = project_contributors.project_id and artists.profile_id = auth.uid()));
create policy "session notes: artist reads visible own" on public.session_notes for select to authenticated using (visible_to_artist and deleted_at is null and exists (select 1 from public.engineering_sessions join public.projects on projects.id = engineering_sessions.project_id join public.artists on artists.id = projects.artist_id where engineering_sessions.id = session_notes.session_id and artists.profile_id = auth.uid()));
create policy "session attachments: artist reads own" on public.session_attachments for select to authenticated using (exists (select 1 from public.engineering_sessions join public.projects on projects.id = engineering_sessions.project_id join public.artists on artists.id = projects.artist_id where engineering_sessions.id = session_attachments.session_id and artists.profile_id = auth.uid()));

grant select, insert, update, delete on public.studio_contributors, public.project_contributors, public.session_notes, public.session_attachments, public.notifications to authenticated;
