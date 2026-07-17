create type public.odin_role as enum ('super_admin', 'booking_director', 'artist');
create type public.artist_status as enum ('active', 'hold', 'dormant');
create type public.venue_status as enum ('prospect', 'active', 'blocked');
create type public.lead_status as enum ('cold', 'warm', 'hot', 'closed');
create type public.contract_status as enum ('draft', 'signed', 'pending');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.odin_role not null default 'artist',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  artist_name text not null,
  genres text[] not null default '{}',
  draw_size integer not null default 0 check (draw_size >= 0),
  bio text not null default '',
  photo_url text,
  music_links text[] not null default '{}',
  manager_id uuid references public.profiles(id) on delete set null,
  status public.artist_status not null default 'hold',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  venue_name text not null,
  city_state text not null,
  capacity integer not null check (capacity >= 0),
  contact_person text,
  email text not null,
  phone text,
  website text,
  status public.venue_status not null default 'prospect',
  last_contact date,
  notes text,
  guarantee_range_cents integer check (guarantee_range_cents >= 0),
  tech_rider_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  outreach_date date not null default current_date,
  email_sent boolean not null default false,
  opened boolean not null default false,
  replied boolean not null default false,
  score integer not null default 0 check (score between 0 and 100),
  status public.lead_status not null default 'cold',
  follow_up_due date,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  contract_reference text not null unique,
  venue_id uuid not null references public.venues(id) on delete restrict,
  artist_id uuid not null references public.artists(id) on delete restrict,
  event_date date not null,
  guarantee_cents integer not null check (guarantee_cents >= 0),
  deposit_paid_cents integer not null default 0 check (deposit_paid_cents >= 0),
  balance_due_cents integer generated always as (guarantee_cents - deposit_paid_cents) stored,
  status public.contract_status not null default 'draft',
  signed_date date,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_score_idx on public.leads(status, score desc);
create index leads_follow_up_due_idx on public.leads(follow_up_due) where follow_up_due is not null;
create index venues_status_idx on public.venues(status);
create index contracts_event_date_idx on public.contracts(event_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger artists_updated_at before update on public.artists for each row execute function public.set_updated_at();
create trigger venues_updated_at before update on public.venues for each row execute function public.set_updated_at();
create trigger leads_updated_at before update on public.leads for each row execute function public.set_updated_at();
create trigger contracts_updated_at before update on public.contracts for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_count integer;
begin
  select count(*) into profile_count from public.profiles;
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when profile_count = 0 then 'super_admin'::public.odin_role else 'artist'::public.odin_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.current_odin_role()
returns public.odin_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_operations_team()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_odin_role() in ('super_admin', 'booking_director');
$$;

alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.venues enable row level security;
alter table public.leads enable row level security;
alter table public.contracts enable row level security;

create policy "profiles: owner reads own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.current_odin_role() = 'super_admin');
create policy "profiles: owner updates own profile" on public.profiles for update to authenticated using (id = auth.uid() or public.current_odin_role() = 'super_admin') with check ((id = auth.uid() and role = public.current_odin_role()) or public.current_odin_role() = 'super_admin');
create policy "profiles: admin manages profiles" on public.profiles for all to authenticated using (public.current_odin_role() = 'super_admin') with check (public.current_odin_role() = 'super_admin');
create policy "artists: operations team manages artists" on public.artists for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "artists: artists read own record" on public.artists for select to authenticated using (profile_id = auth.uid());
create policy "venues: operations team manages venues" on public.venues for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "leads: operations team manages leads" on public.leads for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "contracts: operations team manages contracts" on public.contracts for all to authenticated using (public.is_operations_team()) with check (public.is_operations_team());
create policy "contracts: artists read own contracts" on public.contracts for select to authenticated using (exists (select 1 from public.artists where public.artists.id = contracts.artist_id and public.artists.profile_id = auth.uid()));

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.artists, public.venues, public.leads, public.contracts to authenticated;
