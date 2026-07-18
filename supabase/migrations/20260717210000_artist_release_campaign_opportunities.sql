-- Artist Studio operational intelligence: recording, release, PR, and opportunity flow.

create table public.engineering_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  milestone_type text not null check (milestone_type in ('song_written', 'demo_recorded', 'tracking_started', 'tracking_complete', 'overdubs_added', 'mixing_started', 'mix_approved', 'mastering_started', 'master_delivered', 'isrc_assigned', 'distribution_uploaded', 'release_live')),
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'complete', 'skipped', 'blocked')),
  scheduled_date date,
  completed_date date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.release_schedule (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  release_type text not null check (release_type in ('single', 'ep', 'album', 'video', 'merch_drop')),
  title text not null,
  release_date date not null,
  status text not null default 'planned' check (status in ('planned', 'scheduled', 'distributed', 'live', 'delayed')),
  spotify_url text,
  apple_url text,
  bandcamp_url text,
  youtube_url text,
  isrc_code text,
  upc_code text,
  presave_link text,
  press_deadline date,
  distribution_submitted boolean not null default false,
  distribution_submitted_date date,
  cover_art_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  campaign_type text not null check (campaign_type in ('release_pr', 'show_promotion', 'sync_pitch', 'social_media', 'playlist_pitch', 'radio_push', 'influencer_outreach', 'swap_promotion')),
  title text not null,
  status text not null default 'planning' check (status in ('planning', 'active', 'paused', 'complete', 'cancelled')),
  start_date date,
  end_date date,
  target_outlets text[] not null default '{}',
  target_playlists text[] not null default '{}',
  pitches_sent integer not null default 0 check (pitches_sent >= 0),
  responses_received integer not null default 0 check (responses_received >= 0),
  coverage_secured integer not null default 0 check (coverage_secured >= 0),
  playlist_adds integer not null default 0 check (playlist_adds >= 0),
  estimated_reach bigint not null default 0 check (estimated_reach >= 0),
  budget_cents bigint not null default 0 check (budget_cents >= 0),
  spent_cents bigint not null default 0 check (spent_cents >= 0),
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_pitches (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  outlet_name text,
  pitch_type text check (pitch_type in ('email', 'phone', 'in_person', 'social_dm')),
  pitch_date date not null default current_date,
  response_status text not null default 'pending' check (response_status in ('pending', 'positive', 'negative', 'ghost', 'coverage_secured')),
  response_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  opportunity_type text not null check (opportunity_type in ('show_booking', 'sync_placement', 'festival_submission', 'brand_partnership', 'collaboration', 'press_feature', 'playlist_submission', 'radio_feature', 'swap_deal', 'licensing_deal', 'merch_opportunity')),
  title text not null,
  description text,
  status text not null default 'identified' check (status in ('identified', 'researching', 'pitched', 'in_negotiation', 'verbal_yes', 'contract_sent', 'confirmed', 'declined', 'expired')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  estimated_value_cents bigint check (estimated_value_cents is null or estimated_value_cents >= 0),
  actual_value_cents bigint check (actual_value_cents is null or actual_value_cents >= 0),
  contact_id uuid references public.contacts(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  identified_date date not null default current_date,
  target_date date,
  close_date date,
  probability integer not null default 50 check (probability between 0 and 100),
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index engineering_milestones_project_date_idx on public.engineering_milestones(project_id, scheduled_date);
create index release_schedule_artist_date_idx on public.release_schedule(artist_id, release_date);
create index campaigns_artist_status_idx on public.campaigns(artist_id, status);
create index campaign_pitches_campaign_date_idx on public.campaign_pitches(campaign_id, pitch_date desc);
create index opportunities_artist_priority_idx on public.opportunities(artist_id, priority, target_date);

create trigger engineering_milestones_updated_at before update on public.engineering_milestones for each row execute function public.set_updated_at();
create trigger release_schedule_updated_at before update on public.release_schedule for each row execute function public.set_updated_at();
create trigger campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
create trigger opportunities_updated_at before update on public.opportunities for each row execute function public.set_updated_at();

alter table public.engineering_milestones enable row level security;
alter table public.release_schedule enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_pitches enable row level security;
alter table public.opportunities enable row level security;

create policy "engineering milestones: operations team manages" on public.engineering_milestones for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "release schedule: operations team manages" on public.release_schedule for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "campaigns: operations team manages" on public.campaigns for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "campaign pitches: operations team manages" on public.campaign_pitches for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "opportunities: operations team manages" on public.opportunities for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());

create policy "engineering milestones: artists read own" on public.engineering_milestones for select to authenticated using (exists (select 1 from public.artists where artists.id = engineering_milestones.artist_id and artists.profile_id = auth.uid()));
create policy "release schedule: artists read own" on public.release_schedule for select to authenticated using (exists (select 1 from public.artists where artists.id = release_schedule.artist_id and artists.profile_id = auth.uid()));
create policy "campaigns: artists read own" on public.campaigns for select to authenticated using (exists (select 1 from public.artists where artists.id = campaigns.artist_id and artists.profile_id = auth.uid()));
create policy "opportunities: artists read own" on public.opportunities for select to authenticated using (exists (select 1 from public.artists where artists.id = opportunities.artist_id and artists.profile_id = auth.uid()));

grant select, insert, update, delete on public.engineering_milestones, public.release_schedule, public.campaigns, public.campaign_pitches, public.opportunities to authenticated;

-- Initial linked operating record set for the Sandābādo release.
insert into public.engineering_milestones (project_id, artist_id, milestone_type, title, description, status, scheduled_date, completed_date)
select project.id, artist.id, item.milestone_type, item.title, item.description, item.status, item.scheduled_date, item.completed_date
from public.projects project
join public.artists artist on artist.id = project.artist_id
cross join (values
  ('song_written', 'Song written', 'Jesus Says To Groove', 'complete', '2026-06-15'::date, '2026-06-15'::date),
  ('demo_recorded', 'Demo recorded', 'Rough cut captured in the garage.', 'complete', '2026-06-22'::date, '2026-06-22'::date),
  ('tracking_started', 'Tracking started', 'Whole Body Studios.', 'complete', '2026-07-01'::date, '2026-07-01'::date),
  ('tracking_complete', 'Tracking complete', '3 of 4 songs tracked. Soul Of Gold needs a vocal take.', 'in_progress', '2026-07-28'::date, null::date),
  ('mixing_started', 'Mixing started', 'Prepare final stems and reference notes.', 'pending', '2026-08-05'::date, null::date),
  ('master_delivered', 'Master delivered', 'Final masters ready for delivery.', 'pending', '2026-08-20'::date, null::date),
  ('isrc_assigned', 'ISRC assigned', 'Metadata and identifiers locked.', 'pending', '2026-08-22'::date, null::date),
  ('distribution_uploaded', 'Distribution upload', 'Deliver release to distribution.', 'pending', '2026-09-01'::date, null::date),
  ('release_live', 'Release live', 'Debut album release and Red Dog showcase.', 'pending', '2026-09-26'::date, null::date)
) as item(milestone_type, title, description, status, scheduled_date, completed_date)
where project.project_code = 'SAN-DEBUT-2026'
  and not exists (select 1 from public.engineering_milestones existing where existing.project_id = project.id and existing.milestone_type = item.milestone_type);

insert into public.release_schedule (project_id, artist_id, release_type, title, release_date, status, isrc_code, press_deadline, distribution_submitted, notes)
select project.id, artist.id, item.release_type, item.title, item.release_date, item.status, item.isrc_code, item.press_deadline, item.distribution_submitted, item.notes
from public.projects project
join public.artists artist on artist.id = project.artist_id
cross join (values
  ('single', 'Jesus Says To Groove', '2026-08-08'::date, 'scheduled', 'USWBR2600001', '2026-07-25'::date, false, 'Cover photo needed before press deadline.'),
  ('album', 'Sandābādo — Debut Album', '2026-09-26'::date, 'planned', null::text, '2026-08-26'::date, false, 'Release tied to Red Dog showcase.')
) as item(release_type, title, release_date, status, isrc_code, press_deadline, distribution_submitted, notes)
where project.project_code = 'SAN-DEBUT-2026'
  and not exists (select 1 from public.release_schedule existing where existing.project_id = project.id and existing.title = item.title);

insert into public.campaigns (project_id, artist_id, campaign_type, title, status, start_date, end_date, target_outlets, target_playlists, pitches_sent, responses_received, coverage_secured, estimated_reach, budget_cents, spent_cents, notes)
select project.id, artist.id, item.campaign_type, item.title, item.status, item.start_date, item.end_date, item.target_outlets, item.target_playlists, item.pitches_sent, item.responses_received, item.coverage_secured, item.estimated_reach, item.budget_cents, item.spent_cents, item.notes
from public.projects project
join public.artists artist on artist.id = project.artist_id
cross join (values
  ('release_pr', 'Debut Album Press Push', 'active', '2026-07-15'::date, '2026-09-26'::date, array['Pitchfork', 'Brooklyn Vegan', 'BBC Radio 6'], array['New Music Friday', 'Desert Sounds'], 12, 3, 1, 50000::bigint, 200000::bigint, 80000::bigint, 'Initial release campaign.'),
  ('social_media', 'Album Rollout Social', 'planning', '2026-08-01'::date, '2026-09-26'::date, array[]::text[], array[]::text[], 0, 0, 0, 0::bigint, 0::bigint, 0::bigint, 'Build the reveal sequence once cover art is locked.')
) as item(campaign_type, title, status, start_date, end_date, target_outlets, target_playlists, pitches_sent, responses_received, coverage_secured, estimated_reach, budget_cents, spent_cents, notes)
where project.project_code = 'SAN-DEBUT-2026'
  and not exists (select 1 from public.campaigns existing where existing.project_id = project.id and existing.title = item.title);

insert into public.opportunities (artist_id, opportunity_type, title, description, status, priority, estimated_value_cents, contact_id, venue_id, identified_date, target_date, probability, notes)
select artist.id, item.opportunity_type, item.title, item.description, item.status, item.priority, item.estimated_value_cents, contact.id, venue.id, item.identified_date, item.target_date, item.probability, item.notes
from public.artists artist
cross join (values
  ('show_booking', 'Red Dog Saloon — September 26', 'Launch showcase tied to the debut album reveal.', 'in_negotiation', 'critical', 150000::bigint, '2026-07-10'::date, '2026-09-26'::date, 70, 'Active deal in progress; deposit has not been collected.'),
  ('sync_placement', 'Ben Sokler — TV / film placement', 'Priority sync placement exploration for Sandābādo.', 'researching', 'high', 500000::bigint, '2026-07-16'::date, '2026-12-31'::date, 30, 'Contact details intentionally pending.')
) as item(opportunity_type, title, description, status, priority, estimated_value_cents, identified_date, target_date, probability, notes)
left join public.contacts contact on contact.name = case when item.opportunity_type = 'sync_placement' then 'Ben Sokler' else 'Red Dog Saloon Booker' end
left join public.venues venue on venue.venue_name = case when item.opportunity_type = 'show_booking' then 'The Red Dog Saloon' else null end
where artist.artist_name = 'Sandābādo'
  and not exists (select 1 from public.opportunities existing where existing.artist_id = artist.id and existing.title = item.title);
