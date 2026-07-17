-- Odin Network: industry Rolodex and relationship intelligence.
-- Apply after 20260717140000_phase_one_foundation.sql.

create type public.contact_category as enum (
  'sync_agent', 'marketer', 'publisher', 'distributor', 'lawyer',
  'tour_agent', 'promoter', 'booker', 'venue_manager', 'artist',
  'manager', 'press', 'radio_dj', 'playlist_curator', 'festival_booker'
);

create type public.outreach_campaign_status as enum ('draft', 'scheduled', 'sending', 'sent', 'cancelled');
create type public.outreach_message_status as enum ('pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed');
create type public.network_deal_type as enum ('show_booked', 'sync_placement', 'publishing_deal', 'distribution', 'management', 'legal_service', 'promotion', 'referral', 'collaboration');
create type public.network_deal_outcome as enum ('successful', 'partial', 'failed', 'pending');

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  category public.contact_category not null,
  email text not null,
  phone text,
  website text,
  instagram text,
  twitter text,
  linkedin text,
  location text,
  region text check (region in ('los_angeles', 'san_diego', 'desert', 'nashville', 'new_york', 'london', 'other')),
  genre_focus text[] not null default '{}',
  deal_history jsonb not null default '[]'::jsonb,
  last_contact_date date,
  next_outreach date,
  response_rate numeric check (response_rate is null or (response_rate >= 0 and response_rate <= 1)),
  warmth_score integer not null default 0 check (warmth_score between 0 and 100),
  mutual_connections uuid[] not null default '{}',
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.outreach_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.contact_category not null,
  template_id uuid,
  recipient_ids uuid[] not null default '{}',
  scheduled_at timestamptz,
  sent_at timestamptz,
  status public.outreach_campaign_status not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.outreach_campaigns(id) on delete set null,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  subject text not null,
  body text not null,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  status public.outreach_message_status not null default 'pending',
  open_count integer not null default 0 check (open_count >= 0),
  click_count integer not null default 0 check (click_count >= 0),
  error_message text,
  sendgrid_message_id text unique,
  created_at timestamptz not null default now()
);

create table public.deal_history (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  deal_type public.network_deal_type not null,
  artist_involved uuid references public.artists(id) on delete set null,
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  date date not null,
  outcome public.network_deal_outcome not null,
  commission_paid_cents integer check (commission_paid_cents is null or commission_paid_cents >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create index contacts_category_idx on public.contacts(category);
create index contacts_region_idx on public.contacts(region);
create index contacts_genre_focus_idx on public.contacts using gin(genre_focus);
create index contacts_warmth_idx on public.contacts(warmth_score desc);
create index contacts_next_outreach_idx on public.contacts(next_outreach) where next_outreach is not null;
create index outreach_messages_contact_idx on public.outreach_messages(contact_id);
create index deal_history_contact_idx on public.deal_history(contact_id);
create index deal_history_type_idx on public.deal_history(deal_type);

alter table public.contacts enable row level security;
alter table public.outreach_campaigns enable row level security;
alter table public.outreach_messages enable row level security;
alter table public.deal_history enable row level security;

create policy "contacts: operations team manages contacts" on public.contacts
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "outreach campaigns: operations team manages campaigns" on public.outreach_campaigns
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "outreach messages: operations team manages messages" on public.outreach_messages
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "deal history: operations team manages history" on public.deal_history
  for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());

create trigger contacts_updated_at before update on public.contacts for each row execute function public.set_updated_at();

create or replace function public.calculate_contact_warmth(target_contact_id uuid)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  calculated_warmth integer := 0;
  last_contact date;
  reply_count integer := 0;
  successful_deal_count integer := 0;
begin
  select last_contact_date into last_contact from public.contacts where id = target_contact_id;
  if not found then
    raise exception 'Contact % does not exist', target_contact_id;
  end if;

  select count(*) into reply_count from public.outreach_messages where contact_id = target_contact_id and status = 'replied';
  select count(*) into successful_deal_count from public.deal_history where contact_id = target_contact_id and outcome = 'successful';

  if last_contact is not null then
    calculated_warmth := calculated_warmth + greatest(0, 50 - ((current_date - last_contact) / 2));
  end if;
  calculated_warmth := calculated_warmth + least(reply_count * 15, 45);
  calculated_warmth := calculated_warmth + least(successful_deal_count * 25, 50);
  calculated_warmth := least(calculated_warmth, 100);

  update public.contacts set warmth_score = calculated_warmth where id = target_contact_id;
  return calculated_warmth;
end;
$$;

create or replace function public.schedule_next_outreach(target_contact_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  contact_response_rate numeric;
  days_until integer;
begin
  select response_rate into contact_response_rate from public.contacts where id = target_contact_id;
  if not found then
    raise exception 'Contact % does not exist', target_contact_id;
  end if;

  days_until := case
    when contact_response_rate >= 0.5 then 7
    when contact_response_rate >= 0.2 then 14
    when contact_response_rate >= 0.1 then 30
    else 60
  end;
  update public.contacts set next_outreach = current_date + days_until where id = target_contact_id;
end;
$$;

grant select, insert, update, delete on public.contacts, public.outreach_campaigns, public.outreach_messages, public.deal_history to authenticated;
