-- Odin Artist Studio: one operational surface across engineering, records,
-- PR, management, contracts, and the Feed First treasury.

-- Guard first-admin bootstrap against concurrent sign-ups. Advisory locks live
-- for the surrounding auth transaction, so only one user can ever claim it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_super_admin boolean;
begin
  perform pg_advisory_xact_lock(hashtext('odin:first-super-admin'));
  select exists (select 1 from public.profiles where role = 'super_admin') into has_super_admin;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when has_super_admin then 'artist'::public.odin_role else 'super_admin'::public.odin_role end
  );
  return new;
end;
$$;

alter table public.artists
  add column home_market text not null default 'desert'
    check (home_market in ('los_angeles', 'san_diego', 'desert', 'nashville', 'new_york', 'london', 'other'));

alter table public.venues
  add column region text check (region in ('los_angeles', 'san_diego', 'desert', 'nashville', 'new_york', 'london', 'other')),
  add column network_role text,
  add column relationship_notes text;

create type public.studio_deal_stage as enum ('negotiating', 'agreed', 'lost', 'completed');
create type public.swap_deal_status as enum ('proposed', 'confirmed', 'completed', 'cancelled');
create type public.payout_share as enum ('artist', 'guild', 'infra', 'founder', 'other');

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  deal_type public.network_deal_type not null,
  stage public.studio_deal_stage not null default 'negotiating',
  event_date date,
  guarantee_cents integer check (guarantee_cents is null or guarantee_cents >= 0),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.swap_deals (
  id uuid primary key default gen_random_uuid(),
  odin_artist_id uuid not null references public.artists(id) on delete cascade,
  partner_artist_name text not null,
  origin_market text not null,
  partner_market text not null,
  status public.swap_deal_status not null default 'proposed',
  approved_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.engineering_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  session_date date not null,
  engineer_name text not null,
  hours numeric(6, 2) not null check (hours > 0 and hours <= 24),
  cost_cents integer not null default 0 check (cost_cents >= 0),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.release_tracks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  isrc text unique,
  distribution_platforms text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publishing_splits (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.release_tracks(id) on delete cascade,
  contributor_name text not null,
  contributor_role text not null,
  share_basis_points integer not null check (share_basis_points >= 0 and share_basis_points <= 10000),
  created_at timestamptz not null default now()
);

create table public.press_coverage (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  outlet text not null,
  article_url text,
  published_on date,
  estimated_reach integer check (estimated_reach is null or estimated_reach >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table public.playlist_adds (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  platform text not null,
  playlist_name text not null,
  added_on date,
  created_at timestamptz not null default now()
);

create table public.sync_placements (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  partner_name text not null,
  placement_name text not null,
  status public.studio_deal_stage not null default 'negotiating',
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  placed_on date,
  created_at timestamptz not null default now()
);

create table public.brand_partnerships (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  brand_name text not null,
  status public.studio_deal_stage not null default 'negotiating',
  value_cents integer check (value_cents is null or value_cents >= 0),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.revenue_ledger
  add column artist_id uuid references public.artists(id) on delete set null,
  add column deal_id uuid references public.deals(id) on delete set null;

alter table public.payouts
  add column revenue_ledger_id uuid references public.revenue_ledger(id) on delete cascade,
  add column artist_id uuid references public.artists(id) on delete set null,
  add column share public.payout_share not null default 'other';

create index deals_artist_stage_idx on public.deals(artist_id, stage);
create index swap_deals_status_idx on public.swap_deals(status);
create index engineering_sessions_project_date_idx on public.engineering_sessions(project_id, session_date desc);
create index release_tracks_project_idx on public.release_tracks(project_id);
create index publishing_splits_track_idx on public.publishing_splits(track_id);
create index press_coverage_artist_idx on public.press_coverage(artist_id, published_on desc);
create index playlist_adds_artist_idx on public.playlist_adds(artist_id, added_on desc);
create index sync_placements_artist_idx on public.sync_placements(artist_id, placed_on desc);
create index revenue_ledger_artist_idx on public.revenue_ledger(artist_id, received_on desc);
create index payouts_artist_idx on public.payouts(artist_id, status);

create trigger deals_updated_at before update on public.deals for each row execute function public.set_updated_at();
create trigger swap_deals_updated_at before update on public.swap_deals for each row execute function public.set_updated_at();
create trigger release_tracks_updated_at before update on public.release_tracks for each row execute function public.set_updated_at();

create or replace function public.feed_first_split()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  artist_label text;
  artist_amount integer;
  guild_amount integer;
  infra_amount integer;
  founder_amount integer;
begin
  artist_amount := floor(new.amount_cents * 0.50);
  guild_amount := floor(new.amount_cents * 0.25);
  infra_amount := floor(new.amount_cents * 0.15);
  founder_amount := new.amount_cents - artist_amount - guild_amount - infra_amount;

  select artist_name into artist_label from public.artists where id = new.artist_id;
  insert into public.payouts (project_id, revenue_ledger_id, artist_id, recipient_name, amount_cents, share)
  values
    (new.project_id, new.id, new.artist_id, coalesce(artist_label, 'Artist reserve'), artist_amount, 'artist'),
    (new.project_id, new.id, null, 'Whole Body Guild', guild_amount, 'guild'),
    (new.project_id, new.id, null, 'Whole Body Infrastructure', infra_amount, 'infra'),
    (new.project_id, new.id, null, 'Founder reserve', founder_amount, 'founder');
  return new;
end;
$$;

create trigger revenue_ledger_feed_first_split
  after insert on public.revenue_ledger
  for each row execute function public.feed_first_split();

alter table public.deals enable row level security;
alter table public.swap_deals enable row level security;
alter table public.engineering_sessions enable row level security;
alter table public.release_tracks enable row level security;
alter table public.publishing_splits enable row level security;
alter table public.press_coverage enable row level security;
alter table public.playlist_adds enable row level security;
alter table public.sync_placements enable row level security;
alter table public.brand_partnerships enable row level security;

create policy "deals: operations team manages deals" on public.deals for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "swap deals: operations team manages swaps" on public.swap_deals for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "engineering sessions: operations team manages" on public.engineering_sessions for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "release tracks: operations team manages" on public.release_tracks for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "publishing splits: operations team manages" on public.publishing_splits for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "press coverage: operations team manages" on public.press_coverage for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "playlist adds: operations team manages" on public.playlist_adds for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "sync placements: operations team manages" on public.sync_placements for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "brand partnerships: operations team manages" on public.brand_partnerships for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());

create policy "projects: artists read own projects" on public.projects for select to authenticated using (
  exists (select 1 from public.artists where artists.id = projects.artist_id and artists.profile_id = auth.uid())
);
create policy "project timeline: artists read own" on public.project_timeline for select to authenticated using (
  exists (select 1 from public.projects join public.artists on artists.id = projects.artist_id where projects.id = project_timeline.project_id and artists.profile_id = auth.uid())
);
create policy "engineering sessions: artists read own" on public.engineering_sessions for select to authenticated using (
  exists (select 1 from public.projects join public.artists on artists.id = projects.artist_id where projects.id = engineering_sessions.project_id and artists.profile_id = auth.uid())
);
create policy "release tracks: artists read own" on public.release_tracks for select to authenticated using (
  exists (select 1 from public.projects join public.artists on artists.id = projects.artist_id where projects.id = release_tracks.project_id and artists.profile_id = auth.uid())
);
create policy "publishing splits: artists read own" on public.publishing_splits for select to authenticated using (
  exists (select 1 from public.release_tracks join public.projects on projects.id = release_tracks.project_id join public.artists on artists.id = projects.artist_id where release_tracks.id = publishing_splits.track_id and artists.profile_id = auth.uid())
);
create policy "press coverage: artists read own" on public.press_coverage for select to authenticated using (
  exists (select 1 from public.artists where artists.id = press_coverage.artist_id and artists.profile_id = auth.uid())
);
create policy "playlist adds: artists read own" on public.playlist_adds for select to authenticated using (
  exists (select 1 from public.artists where artists.id = playlist_adds.artist_id and artists.profile_id = auth.uid())
);
create policy "sync placements: artists read own" on public.sync_placements for select to authenticated using (
  exists (select 1 from public.artists where artists.id = sync_placements.artist_id and artists.profile_id = auth.uid())
);
create policy "brand partnerships: artists read own" on public.brand_partnerships for select to authenticated using (
  exists (select 1 from public.artists where artists.id = brand_partnerships.artist_id and artists.profile_id = auth.uid())
);
create policy "revenue ledger: artists read own" on public.revenue_ledger for select to authenticated using (
  exists (select 1 from public.artists where artists.id = revenue_ledger.artist_id and artists.profile_id = auth.uid())
);
create policy "payouts: artists read their own share" on public.payouts for select to authenticated using (
  artist_id is not null and share = 'artist' and exists (select 1 from public.artists where artists.id = payouts.artist_id and artists.profile_id = auth.uid())
);

grant select, insert, update, delete on public.deals, public.swap_deals, public.engineering_sessions, public.release_tracks, public.publishing_splits, public.press_coverage, public.playlist_adds, public.sync_placements, public.brand_partnerships to authenticated;
