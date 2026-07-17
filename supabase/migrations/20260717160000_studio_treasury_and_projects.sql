-- Whole Body Studios: the shared project spine and central treasury.
-- Apply after the Phase 1 and Odin Network migrations.

create type public.studio_arm as enum ('pr', 'records', 'engineering', 'management');
create type public.studio_project_status as enum ('planned', 'in_progress', 'complete', 'paused');
create type public.project_phase as enum ('recording', 'mixing', 'mastering', 'publishing_setup', 'distribution', 'pr_campaign', 'tour_booking', 'revenue');
create type public.project_phase_status as enum ('planned', 'in_progress', 'complete', 'delayed');
create type public.payout_status as enum ('pending', 'scheduled', 'paid', 'cancelled');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  title text not null,
  artist_id uuid references public.artists(id) on delete set null,
  status public.studio_project_status not null default 'planned',
  target_release_date date,
  investment_cents integer not null default 0 check (investment_cents >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_timeline (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  phase public.project_phase not null,
  status public.project_phase_status not null default 'planned',
  owner_arm public.studio_arm not null,
  start_date date,
  end_date date,
  budget_allocated_cents integer check (budget_allocated_cents is null or budget_allocated_cents >= 0),
  budget_spent_cents integer check (budget_spent_cents is null or budget_spent_cents >= 0),
  milestones jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.revenue_ledger (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  arm public.studio_arm not null,
  revenue_type text not null,
  amount_cents integer not null check (amount_cents >= 0),
  received_on date not null default current_date,
  source_reference text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  recipient_name text not null,
  amount_cents integer not null check (amount_cents >= 0),
  status public.payout_status not null default 'pending',
  due_on date,
  paid_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A shared contact can work across any number of arms or projects.
create table public.contact_engagements (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  arm public.studio_arm not null,
  engagement_type text not null,
  occurred_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index projects_status_idx on public.projects(status);
create index project_timeline_project_idx on public.project_timeline(project_id, owner_arm);
create index revenue_ledger_received_on_idx on public.revenue_ledger(received_on desc);
create index revenue_ledger_project_idx on public.revenue_ledger(project_id);
create index payouts_status_idx on public.payouts(status, due_on);
create index contact_engagements_contact_idx on public.contact_engagements(contact_id, occurred_on desc);

alter table public.projects enable row level security;
alter table public.project_timeline enable row level security;
alter table public.revenue_ledger enable row level security;
alter table public.payouts enable row level security;
alter table public.contact_engagements enable row level security;

create policy "projects: operations team manages projects" on public.projects
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "project timeline: operations team manages timeline" on public.project_timeline
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "revenue ledger: operations team manages revenue" on public.revenue_ledger
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "payouts: operations team manages payouts" on public.payouts
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "contact engagements: operations team manages shared engagements" on public.contact_engagements
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());

create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger project_timeline_updated_at before update on public.project_timeline for each row execute function public.set_updated_at();
create trigger payouts_updated_at before update on public.payouts for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.projects, public.project_timeline, public.revenue_ledger, public.payouts, public.contact_engagements to authenticated;
