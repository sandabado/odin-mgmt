-- Campaign connection wiring: make campaigns the shared PR and promotion spine.
-- This migration intentionally builds on the existing `stage`, `event_date`,
-- `revenue_ledger`, and `press_coverage` field names used by the Odin schema.

alter table public.campaigns
  add column if not exists deal_id uuid references public.deals(id) on delete set null,
  add column if not exists release_schedule_id uuid references public.release_schedule(id) on delete set null,
  add column if not exists swap_deal_id uuid references public.swap_deals(id) on delete set null,
  add column if not exists press_deadline date;

alter table public.promo_materials
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

-- social_posts did not exist in the current schema. It is the canonical place
-- for campaign-linked social scheduling, rather than a JSON field on campaigns.
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  platform text not null check (platform in ('instagram', 'facebook', 'tiktok', 'youtube', 'x', 'threads', 'linkedin', 'other')),
  body text not null,
  media_url text,
  scheduled_for timestamptz,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.press_coverage
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null,
  add column if not exists campaign_pitch_id uuid references public.campaign_pitches(id) on delete set null;

alter table public.revenue_ledger
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

create index if not exists campaigns_deal_idx on public.campaigns(deal_id) where deal_id is not null;
create index if not exists campaigns_release_schedule_idx on public.campaigns(release_schedule_id) where release_schedule_id is not null;
create index if not exists campaigns_swap_deal_idx on public.campaigns(swap_deal_id) where swap_deal_id is not null;
create index if not exists promo_materials_campaign_idx on public.promo_materials(campaign_id) where campaign_id is not null;
create index if not exists social_posts_campaign_schedule_idx on public.social_posts(campaign_id, scheduled_for desc) where campaign_id is not null;
create index if not exists press_coverage_campaign_idx on public.press_coverage(campaign_id, published_on desc) where campaign_id is not null;
create index if not exists revenue_ledger_campaign_idx on public.revenue_ledger(campaign_id, received_on desc) where campaign_id is not null;
create unique index if not exists campaigns_one_show_promotion_per_deal_idx on public.campaigns(deal_id) where deal_id is not null and campaign_type = 'show_promotion';
create unique index if not exists campaigns_one_release_pr_per_release_idx on public.campaigns(release_schedule_id) where release_schedule_id is not null and campaign_type = 'release_pr';
create unique index if not exists press_coverage_one_per_campaign_pitch_idx on public.press_coverage(campaign_pitch_id) where campaign_pitch_id is not null;

alter table public.social_posts enable row level security;
create policy "social posts: operations team manages" on public.social_posts
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "social posts: artists read own" on public.social_posts
  for select to authenticated using (
    exists (select 1 from public.artists where artists.id = social_posts.artist_id and artists.profile_id = auth.uid())
  );
grant select, insert, update, delete on public.social_posts to authenticated;
drop trigger if exists social_posts_updated_at on public.social_posts;
create trigger social_posts_updated_at before update on public.social_posts for each row execute function public.set_updated_at();

-- Resolve the active project for artist-scoped events. Campaigns currently keep
-- project_id non-null, so a confirmed deal with no project is surfaced as an
-- admin prompt instead of blocking the deal update.
create or replace function public.campaign_project_for_artist(target_artist_id uuid)
returns uuid
language sql
stable
set search_path = public
as $$
  select id
  from public.projects
  where artist_id = target_artist_id
  order by
    case status when 'in_progress' then 0 when 'planned' then 1 when 'paused' then 2 else 3 end,
    target_release_date nulls last,
    created_at desc
  limit 1;
$$;

create or replace function public.create_campaign_for_confirmed_deal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project_id uuid;
  artist_name text;
  venue_name text;
begin
  if new.stage <> 'confirmed' or (tg_op = 'UPDATE' and old.stage = 'confirmed') then
    return new;
  end if;

  if new.artist_id is null then
    return new;
  end if;

  select public.campaign_project_for_artist(new.artist_id), artist.artist_name, venue.venue_name
  into target_project_id, artist_name, venue_name
  from public.artists artist
  left join public.venues venue on venue.id = new.venue_id
  where artist.id = new.artist_id;

  if target_project_id is null then
    return new;
  end if;

  insert into public.campaigns (
    project_id, artist_id, deal_id, campaign_type, title, status, start_date, end_date, notes
  ) values (
    target_project_id,
    new.artist_id,
    new.id,
    'show_promotion',
    coalesce(artist_name, 'Artist') || ' at ' || coalesce(venue_name, 'Venue') || ' — ' || coalesce(to_char(new.event_date, 'Mon FMDD, YYYY'), 'Date pending'),
    'planning',
    current_date,
    new.event_date,
    'Created automatically when this deal was confirmed.'
  ) on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists campaigns_for_confirmed_deal on public.deals;
create trigger campaigns_for_confirmed_deal
  after insert or update of stage on public.deals
  for each row execute function public.create_campaign_for_confirmed_deal();

create or replace function public.create_campaign_for_scheduled_release()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'scheduled' or (tg_op = 'UPDATE' and old.status = 'scheduled') then
    return new;
  end if;

  insert into public.campaigns (
    project_id, artist_id, release_schedule_id, campaign_type, title, status, start_date, end_date, press_deadline, notes
  ) values (
    new.project_id,
    new.artist_id,
    new.id,
    'release_pr',
    new.title || ' — Press Push',
    'planning',
    current_date,
    new.release_date + 14,
    new.release_date - 10,
    'Created automatically when this release was scheduled.'
  ) on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists campaigns_for_scheduled_release on public.release_schedule;
create trigger campaigns_for_scheduled_release
  after insert or update of status on public.release_schedule
  for each row execute function public.create_campaign_for_scheduled_release();

create or replace function public.recalculate_campaign_metrics(target_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.campaigns campaign
  set
    pitches_sent = (select count(*) from public.campaign_pitches where campaign_id = target_campaign_id),
    responses_received = (select count(*) from public.campaign_pitches where campaign_id = target_campaign_id and response_status in ('positive', 'negative', 'coverage_secured')),
    coverage_secured = (select count(*) from public.press_coverage where campaign_id = target_campaign_id),
    estimated_reach = coalesce((select sum(estimated_reach) from public.press_coverage where campaign_id = target_campaign_id), 0)
  where campaign.id = target_campaign_id;
end;
$$;

create or replace function public.link_pitch_coverage_and_warmth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  campaign_row public.campaigns%rowtype;
  warmth_delta integer := 0;
  is_new_response boolean := false;
begin
  select * into campaign_row from public.campaigns where id = new.campaign_id;

  if tg_op = 'INSERT' then
    warmth_delta := warmth_delta + 15;
  end if;

  is_new_response := new.response_status in ('positive', 'negative', 'coverage_secured')
    and (tg_op = 'INSERT' or old.response_status is distinct from new.response_status);
  if is_new_response then
    warmth_delta := warmth_delta + 15;
  end if;

  if new.response_status = 'coverage_secured'
    and (tg_op = 'INSERT' or old.response_status is distinct from 'coverage_secured') then
    insert into public.press_coverage (
      campaign_id, campaign_pitch_id, artist_id, project_id, outlet, published_on, estimated_reach, notes
    ) values (
      new.campaign_id,
      new.id,
      campaign_row.artist_id,
      campaign_row.project_id,
      coalesce(new.outlet_name, 'Outlet pending'),
      current_date,
      0,
      'Created automatically from a campaign pitch marked coverage secured.'
    ) on conflict (campaign_pitch_id) where campaign_pitch_id is not null do nothing;
    warmth_delta := warmth_delta + 25;
  end if;

  if new.contact_id is not null and warmth_delta > 0 then
    update public.contacts
    set
      last_contact_date = greatest(coalesce(last_contact_date, date '1900-01-01'), coalesce(new.pitch_date, current_date)),
      warmth_score = least(100, warmth_score + warmth_delta)
    where id = new.contact_id;
  end if;

  perform public.recalculate_campaign_metrics(new.campaign_id);
  return new;
end;
$$;

create or replace function public.recalculate_campaign_metrics_from_pitch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_campaign_id uuid;
begin
  target_campaign_id := case when tg_op = 'DELETE' then old.campaign_id else new.campaign_id end;
  perform public.recalculate_campaign_metrics(target_campaign_id);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.recalculate_campaign_metrics_from_coverage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_campaign_id uuid;
begin
  target_campaign_id := case when tg_op = 'DELETE' then old.campaign_id else new.campaign_id end;
  if target_campaign_id is not null then
    perform public.recalculate_campaign_metrics(target_campaign_id);
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists campaign_pitch_coverage_and_warmth on public.campaign_pitches;
create trigger campaign_pitch_coverage_and_warmth
  after insert or update of response_status, contact_id, outlet_name, pitch_date on public.campaign_pitches
  for each row execute function public.link_pitch_coverage_and_warmth();

drop trigger if exists campaign_pitches_recalculate_metrics on public.campaign_pitches;
create trigger campaign_pitches_recalculate_metrics
  after delete on public.campaign_pitches
  for each row execute function public.recalculate_campaign_metrics_from_pitch();

drop trigger if exists campaign_coverage_recalculate_metrics on public.press_coverage;
create trigger campaign_coverage_recalculate_metrics
  after insert or update or delete on public.press_coverage
  for each row execute function public.recalculate_campaign_metrics_from_coverage();

-- Link show assets to the active campaign without overwriting an explicit admin choice.
create or replace function public.link_promo_material_to_campaign()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.campaign_id is null and new.deal_id is not null then
    select id into new.campaign_id
    from public.campaigns
    where deal_id = new.deal_id and status = 'active'
    order by start_date desc nulls last, created_at desc
    limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists promo_materials_link_campaign on public.promo_materials;
create trigger promo_materials_link_campaign
  before insert or update of deal_id, campaign_id on public.promo_materials
  for each row execute function public.link_promo_material_to_campaign();

-- Record only the incremental campaign spend. Expense entries are visible to
-- Treasury but skip Feed First payout generation (see the function below).
create or replace function public.record_campaign_spend()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  spend_delta bigint;
begin
  spend_delta := new.spent_cents - case when tg_op = 'INSERT' then 0 else old.spent_cents end;
  if spend_delta > 0 then
    insert into public.revenue_ledger (project_id, artist_id, campaign_id, arm, revenue_type, amount_cents, received_on, source_reference, notes)
    values (
      new.project_id,
      new.artist_id,
      new.id,
      'pr',
      'expense',
      spend_delta,
      current_date,
      new.title,
      'Campaign budget spend recorded automatically.'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists campaigns_record_spend on public.campaigns;
create trigger campaigns_record_spend
  after insert or update of spent_cents on public.campaigns
  for each row execute function public.record_campaign_spend();

create or replace function public.feed_first_split()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  artist_amount integer;
  guild_amount integer;
  infra_amount integer;
  founder_amount integer;
  artist_label text;
begin
  if new.revenue_type = 'expense' then
    return new;
  end if;

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

-- Backfill relational links for the known Debut Album Press Push without
-- fabricating pitches, coverage, or spend. Live metrics are trigger-derived.
update public.campaigns campaign
set release_schedule_id = release.id,
    press_deadline = release.release_date - 10
from public.release_schedule release
where campaign.title = 'Debut Album Press Push'
  and campaign.artist_id = release.artist_id
  and release.title = 'Sandābādo — Debut Album'
  and campaign.release_schedule_id is null;

-- Disco is stored as a link only. Odin never proxies or attempts to integrate
-- with Disco's private API; the artist and sync partner remain in control.
alter table public.artists add column if not exists disco_link text;
alter table public.release_schedule add column if not exists disco_link text;
alter table public.contacts add column if not exists disco_link text;

-- Artists can update their own catalog URL without receiving broad write
-- access to their artist record. Operations retains its existing full access.
create or replace function public.set_my_artist_disco_link(target_link text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_link is not null and target_link !~ '^https?://' then
    raise exception 'Disco URL must start with http:// or https://';
  end if;
  update public.artists
  set disco_link = nullif(trim(target_link), '')
  where profile_id = auth.uid();
  if not found then raise exception 'Artist record not found'; end if;
end;
$$;
grant execute on function public.set_my_artist_disco_link(text) to authenticated;

-- Tax-ready expense tracking. The current Odin schema has no organizations or
-- engineering_team table, so expenses link to the existing project, artist,
-- deal, campaign, session, and contact records instead.
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_category text not null check (expense_category in (
    'studio_rental', 'engineering_services', 'mixing_mastering', 'session_musician', 'equipment_purchase', 'equipment_rental',
    'software_subscription', 'streaming_distribution', 'marketing_advertising', 'pr_services', 'photography_video', 'merch_production',
    'travel_lodging', 'meals_per_diem', 'legal_accounting', 'insurance', 'office_supplies', 'education_training', 'contractor_payment',
    'royalty_payment', 'sync_submission', 'festival_submission', 'other'
  )),
  arm text not null check (arm in ('engineering', 'records', 'pr', 'management', 'central')),
  project_id uuid references public.projects(id) on delete set null,
  artist_id uuid references public.artists(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  session_id uuid references public.engineering_sessions(id) on delete set null,
  vendor_name text not null,
  vendor_type text check (vendor_type in ('engineer_producer', 'studio', 'contractor', 'platform_saas', 'agency', 'manufacturer', 'venue', 'individual', 'other')),
  contact_id uuid references public.contacts(id) on delete set null,
  amount_cents bigint not null check (amount_cents >= 0),
  tax_cents bigint not null default 0 check (tax_cents >= 0),
  total_cents bigint generated always as (amount_cents + tax_cents) stored,
  currency text not null default 'USD' check (currency = 'USD'),
  expense_date date not null default current_date,
  due_date date,
  paid_date date,
  payment_method text check (payment_method in ('cash', 'check', 'ach_transfer', 'wire_transfer', 'credit_card', 'debit_card', 'venmo', 'paypal', 'stripe', 'zelle', 'other')),
  receipt_url text,
  invoice_number text,
  invoice_url text,
  tax_deductible boolean not null default true,
  tax_category text,
  form_1099_required boolean not null default false,
  -- Never store a raw EIN or SSN in Odin. Store only a reference to the
  -- accounting system / encrypted vault after the QBO integration exists.
  vendor_tax_reference text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'disputed', 'rejected')),
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  is_reimbursement boolean not null default false,
  reimbursed_to text,
  description text,
  internal_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expense_approvals (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  approver_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('approved', 'rejected', 'disputed', 'paid')),
  reason text,
  previous_status text,
  new_status text,
  created_at timestamptz not null default now()
);

create index if not exists expenses_date_idx on public.expenses(expense_date desc);
create index if not exists expenses_status_arm_idx on public.expenses(status, arm);
create index if not exists expenses_project_idx on public.expenses(project_id) where project_id is not null;
create index if not exists expenses_vendor_idx on public.expenses(vendor_name);
create index if not exists expense_approvals_expense_idx on public.expense_approvals(expense_id, created_at desc);

alter table public.expenses enable row level security;
alter table public.expense_approvals enable row level security;
create policy "expenses: operations team manages" on public.expenses for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "expense approvals: operations team views" on public.expense_approvals for select to authenticated using (public.is_operations_team());
create policy "expense approvals: operations team records" on public.expense_approvals for insert to authenticated with check (public.is_operations_team());
grant select, insert, update, delete on public.expenses, public.expense_approvals to authenticated;
drop trigger if exists expenses_updated_at on public.expenses;
create trigger expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();

create or replace function public.audit_expense_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status and new.status in ('approved', 'rejected', 'disputed', 'paid') then
    insert into public.expense_approvals (expense_id, approver_id, action, previous_status, new_status)
    values (new.id, auth.uid(), new.status, old.status, new.status);
  end if;
  return new;
end;
$$;
drop trigger if exists expenses_audit_approval on public.expenses;
create trigger expenses_audit_approval after update of status on public.expenses for each row execute function public.audit_expense_approval();

create or replace function public.refresh_project_expense_spend()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project_id uuid;
begin
  target_project_id := case when tg_op = 'DELETE' then old.project_id else new.project_id end;
  if target_project_id is not null then
    update public.project_timeline timeline
    set budget_spent_cents = coalesce((
      select sum(total_cents) from public.expenses
      where project_id = target_project_id and status in ('approved', 'paid')
    ), 0)
    where timeline.project_id = target_project_id;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
drop trigger if exists expenses_refresh_project_spend on public.expenses;
create trigger expenses_refresh_project_spend after insert or update or delete on public.expenses for each row execute function public.refresh_project_expense_spend();

-- Known project seed: intentionally uses real internal project facts only;
-- it does not create a receipt, invoice, vendor tax ID, or invented payment.
insert into public.expenses (project_id, artist_id, campaign_id, expense_category, arm, vendor_name, vendor_type, amount_cents, tax_cents, expense_date, tax_deductible, tax_category, form_1099_required, status, description)
select project.id, artist.id, campaign.id, item.expense_category, item.arm, item.vendor_name, item.vendor_type, item.amount_cents, item.tax_cents, item.expense_date, item.tax_deductible, item.tax_category, item.form_1099_required, item.status, item.description
from public.projects project
join public.artists artist on artist.id = project.artist_id
left join public.campaigns campaign on campaign.project_id = project.id and campaign.title = 'Debut Album Press Push'
cross join (values
  ('studio_rental', 'engineering', 'Whole Body Studios', 'studio', 45000::bigint, 0::bigint, '2026-07-01'::date, true, 'studio_rental', false, 'paid', 'Initial tracking block.'),
  ('engineering_services', 'engineering', 'Engineering session', 'engineer_producer', 30000::bigint, 0::bigint, '2026-07-08'::date, true, 'contractor', true, 'approved', 'Tracking and session preparation.'),
  ('pr_services', 'pr', 'Debut Album Press Push', 'agency', 80000::bigint, 0::bigint, '2026-07-15'::date, true, 'marketing', false, 'approved', 'Campaign allocation recorded from the existing campaign budget.'),
  ('photography_video', 'pr', 'Release photography', 'contractor', 25000::bigint, 0::bigint, '2026-07-20'::date, true, 'marketing', true, 'pending', 'Cover and press photography.'),
  ('streaming_distribution', 'records', 'Distribution delivery', 'platform_saas', 2999::bigint, 0::bigint, '2026-08-01'::date, true, 'software', false, 'pending', 'Release distribution setup.')
) as item(expense_category, arm, vendor_name, vendor_type, amount_cents, tax_cents, expense_date, tax_deductible, tax_category, form_1099_required, status, description)
where project.project_code = 'SAN-DEBUT-2026'
and not exists (select 1 from public.expenses existing where existing.project_id = project.id and existing.vendor_name = item.vendor_name and existing.expense_date = item.expense_date);
