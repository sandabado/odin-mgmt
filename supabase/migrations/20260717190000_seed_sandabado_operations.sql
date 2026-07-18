-- Confirmed initial Odin operating records. This migration is idempotent so a
-- reset or restored environment never creates duplicate venues or artists.

alter table public.artists
  add column website text,
  add column instagram text;

alter table public.venues
  add column guarantee_min_cents integer check (guarantee_min_cents is null or guarantee_min_cents >= 0);

-- A relationship can be intentionally incomplete during early outreach.
alter table public.contacts alter column email drop not null;

create unique index artists_name_identity_idx on public.artists(lower(artist_name));
create unique index venues_name_identity_idx on public.venues(lower(venue_name));
create unique index contacts_name_company_identity_idx on public.contacts(lower(name), coalesce(lower(company), ''));

insert into public.artists (artist_name, genres, draw_size, home_market, website, instagram, music_links, bio, status)
values (
  'Sandābādo',
  array['soulful-blues', 'blues-rock', 'desert-rock'],
  40,
  'desert',
  'https://sandabado.com',
  'https://instagram.com/sandabadomusic',
  array['https://sandabado.com', 'https://instagram.com/sandabadomusic'],
  'Soulful Blues Rock from Joshua Tree. Whole Body Records. Official selection, 2025 Yucca Valley Film Festival. "Legends whispered that Sandabado was once a mortal bird, a simple creature of the skies, until it dared to challenge the storm-gods themselves."',
  'active'
)
on conflict do nothing;

insert into public.venues (venue_name, city_state, region, capacity, email, status, network_role, guarantee_min_cents, guarantee_range_cents, notes, relationship_notes)
values
  ('Pappy & Harriet''s Pioneertown Palace', 'Pioneertown, CA', 'desert', 350, 'bookings@pappyandharriets.com', 'active', 'host', 100000, 500000, 'Legendary desert venue. High priority. Outdoor stage.', 'Legendary desert venue. High priority. Outdoor stage.'),
  ('The Red Dog Saloon', 'Morongo Valley, CA', 'desert', 120, 'info@reddogsaloon.com', 'active', 'showcase', 50000, 200000, 'Home base showcase venue. September 26 launch event.', 'Home base showcase venue. September 26 launch event.'),
  ('The Casbah', 'San Diego, CA', 'san_diego', 200, 'bookings@casbahmusic.com', 'active', 'exchange', 50000, 150000, 'Key SD venue for swap network. Indie-friendly.', 'Key SD venue for swap network. Indie-friendly.'),
  ('The Echo', 'Los Angeles, CA', 'los_angeles', 350, 'info@attheecho.com', 'prospect', 'target', 100000, 300000, 'Major LA target. Books Tue/Wed nights.', 'Major LA target. Books Tue/Wed nights.'),
  ('Echoplex', 'Los Angeles, CA', 'los_angeles', 450, 'info@echoplex.com', 'prospect', 'target', 150000, 400000, 'Sister venue to The Echo. Larger draws.', 'Sister venue to The Echo. Larger draws.')
on conflict do nothing;

insert into public.contacts (name, company, category, email, region, genre_focus, tags, notes)
values
  ('Ben Sokler', null, 'sync_agent', null, 'los_angeles', array['blues-rock', 'soul', 'desert-rock'], array['priority', 'sync-target'], 'Sync agent contact. Priority for Sandābādo placement opportunities. Details TBD.'),
  ('Jesse Gawlik', 'Whole Body Records', 'manager', 'jesse@wholebodyrecords.com', 'desert', array['soulful-blues', 'blues-rock', 'desert-rock'], array['founder', 'super_admin'], 'Founder of Whole Body Records. Oversees all arms. Decision maker.'),
  ('Red Dog Saloon Booker', 'The Red Dog Saloon', 'booker', null, 'desert', array['blues', 'rock', 'indie'], array['active-deal', 'showcase'], 'Booker for Red Dog Saloon. September 26 showcase deal in progress. Real contact details coming soon.')
on conflict do nothing;

insert into public.projects (project_code, title, artist_id, status, target_release_date, investment_cents, notes)
select
  'SAN-DEBUT-2026',
  'Sandābādo — Debut Album',
  artist.id,
  'in_progress',
  '2026-09-26',
  2000000,
  'Debut album. Recording at Whole Body Studios. Official selection for 2025 Yucca Valley Film Festival (live video). Available on Apple, Spotify, Amazon.'
from public.artists as artist
where artist.artist_name = 'Sandābādo'
on conflict do nothing;

insert into public.project_timeline (project_id, phase, status, owner_arm, start_date, budget_allocated_cents, budget_spent_cents, notes)
select project.id, 'recording', 'in_progress', 'engineering', '2026-06-01', 2000000, 850000, 'Current recording phase.'
from public.projects as project
where project.project_code = 'SAN-DEBUT-2026'
  and not exists (select 1 from public.project_timeline as timeline where timeline.project_id = project.id and timeline.phase = 'recording');

insert into public.release_tracks (project_id, title)
select project.id, track.title
from public.projects as project
cross join (values ('Jesus Says To Groove'), ('Great Mystery (333)'), ('Think Say Do'), ('Soul Of Gold')) as track(title)
where project.project_code = 'SAN-DEBUT-2026'
  and not exists (select 1 from public.release_tracks as existing where existing.project_id = project.id and existing.title = track.title);

insert into public.deals (artist_id, venue_id, contact_id, deal_type, stage, event_date, guarantee_cents, notes)
select
  artist.id,
  venue.id,
  contact.id,
  'show_booked',
  'negotiating',
  '2026-09-26',
  150000,
  'Launch showcase. Combined with album reveal. Expected draw: 40–50. Hard deadline event. Dummy data — update when real terms are confirmed. Deposit not collected.'
from public.artists as artist
join public.venues as venue on venue.venue_name = 'The Red Dog Saloon'
left join public.contacts as contact on contact.name = 'Red Dog Saloon Booker' and contact.company = 'The Red Dog Saloon'
where artist.artist_name = 'Sandābādo'
  and not exists (
    select 1 from public.deals as deal
    where deal.artist_id = artist.id and deal.venue_id = venue.id and deal.event_date = '2026-09-26' and deal.deal_type = 'show_booked'
  );
