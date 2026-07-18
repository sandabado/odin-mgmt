-- Complete the non-sensitive show-day record and add the remaining Band
-- Operations seed artifacts. This migration deliberately does not persist a
-- Wi-Fi password or placeholder/public asset URLs.

alter table public.show_run_sheets
  add column if not exists setlist_id uuid references public.setlists(id) on delete set null,
  add column if not exists load_in_contact text,
  add column if not exists green_room text,
  add column if not exists soundcheck_duration_minutes integer check (soundcheck_duration_minutes is null or soundcheck_duration_minutes >= 0),
  add column if not exists soundcheck_notes text,
  add column if not exists slot_position text check (slot_position is null or slot_position in ('opener', 'middle', 'headliner', 'only')),
  add column if not exists other_acts text[] not null default '{}',
  add column if not exists power_availability text,
  add column if not exists artist_share_cents bigint check (artist_share_cents is null or artist_share_cents >= 0);

create index if not exists run_sheets_deal_idx on public.show_run_sheets(deal_id) where deal_id is not null;
create index if not exists run_sheets_setlist_idx on public.show_run_sheets(setlist_id) where setlist_id is not null;

-- The first seed established a working draft. Promote only that draft to the
-- supplied confirmed plan, leaving an already-edited live run sheet untouched.
with target as (
  select artist.id as artist_id, deal.id as deal_id, setlist.id as setlist_id
  from public.artists artist
  join public.deals deal on deal.artist_id = artist.id and deal.event_date = date '2026-09-26'
  left join lateral (
    select id
    from public.setlists
    where artist_id = artist.id and name = 'Red Dog Saloon Showcase'
    order by created_at asc
    limit 1
  ) setlist on true
  where artist.artist_name = 'Sandābādo'
)
update public.show_run_sheets run_sheet
set
  setlist_id = target.setlist_id,
  venue_address = 'Morongo Valley, CA',
  parking_instructions = 'Load in through the back door; park in lot spot 3.',
  load_in_time = time '16:00',
  load_in_contact = 'Mike',
  soundcheck_time = time '17:00',
  soundcheck_duration_minutes = 30,
  soundcheck_notes = 'Bring own cymbals.',
  doors_open_time = time '18:30',
  set_start_time = time '20:00',
  set_duration_minutes = 45,
  set_end_time = time '21:00',
  curfew_time = time '22:00',
  slot_position = 'headliner',
  other_acts = array[]::text[],
  backline_provided = array['Drum kit', 'Bass amp', 'Guitar amp'],
  band_brings = array['Guitars', 'Pedals', 'Cymbals', 'Sticks'],
  stage_dimensions = '20ft x 15ft',
  power_availability = '4x 20A circuits, stage left',
  green_room = 'Yes, upstairs',
  artist_share_cents = 75000,
  payment_method = 'cash',
  payment_contact = 'Mike (venue)',
  hashtag = array['#sandabado', '#reddogsaloon', '#wholebodyrecords'],
  promo_assets_ready = true,
  venue_day_of_contact = 'Mike (venue)',
  manager_day_of_contact = 'Jesse (manager)',
  load_out_instructions = 'Load out through the back alley after 10pm.',
  settlement_notes = 'Cash payment due the night of the show.',
  status = 'confirmed'
from target
where run_sheet.deal_id = target.deal_id
  and run_sheet.status = 'draft';

-- A reset can skip the earlier draft migration; keep this path fully usable.
insert into public.show_run_sheets (
  deal_id, artist_id, setlist_id, venue_address, parking_instructions,
  load_in_time, load_in_contact, soundcheck_time, soundcheck_duration_minutes,
  soundcheck_notes, doors_open_time, set_start_time, set_duration_minutes,
  set_end_time, curfew_time, slot_position, other_acts, backline_provided,
  band_brings, stage_dimensions, power_availability, green_room,
  artist_share_cents, payment_method, payment_contact, hashtag,
  promo_assets_ready, venue_day_of_contact, manager_day_of_contact,
  load_out_instructions, settlement_notes, status
)
select
  target.deal_id, target.artist_id, target.setlist_id, 'Morongo Valley, CA',
  'Load in through the back door; park in lot spot 3.',
  time '16:00', 'Mike', time '17:00', 30, 'Bring own cymbals.',
  time '18:30', time '20:00', 45, time '21:00', time '22:00', 'headliner',
  array[]::text[], array['Drum kit', 'Bass amp', 'Guitar amp'],
  array['Guitars', 'Pedals', 'Cymbals', 'Sticks'], '20ft x 15ft',
  '4x 20A circuits, stage left', 'Yes, upstairs', 75000, 'cash',
  'Mike (venue)', array['#sandabado', '#reddogsaloon', '#wholebodyrecords'],
  true, 'Mike (venue)', 'Jesse (manager)',
  'Load out through the back alley after 10pm.',
  'Cash payment due the night of the show.', 'confirmed'
from (
  select artist.id as artist_id, deal.id as deal_id, setlist.id as setlist_id
  from public.artists artist
  join public.deals deal on deal.artist_id = artist.id and deal.event_date = date '2026-09-26'
  left join lateral (
    select id
    from public.setlists
    where artist_id = artist.id and name = 'Red Dog Saloon Showcase'
    order by created_at asc
    limit 1
  ) setlist on true
  where artist.artist_name = 'Sandābādo'
) target
where not exists (select 1 from public.show_run_sheets existing where existing.deal_id = target.deal_id);

-- The set is now ready for the supplied dress rehearsal and show-day link.
update public.setlists
set
  status = 'finalized',
  target_duration_minutes = 45,
  estimated_duration_minutes = 43,
  transition_notes = 'After track 2, Jesse talks to crowd 30 sec. Tune down half-step before Soul of Gold.'
where name = 'Red Dog Saloon Showcase'
  and status = 'draft'
  and exists (select 1 from public.artists artist where artist.id = setlists.artist_id and artist.artist_name = 'Sandābādo');

insert into public.practices (
  artist_id, title, practice_date, start_time, end_time, location, focus_type,
  setlist_id, songs_to_practice, notes, status
)
select
  artist.id, practice.title, practice.practice_date, practice.start_time,
  practice.end_time, 'Studio', practice.focus_type,
  case when practice.uses_show_setlist then setlist.id else null end,
  practice.songs_to_practice, practice.notes, 'scheduled'
from public.artists artist
left join lateral (
  select id
  from public.setlists
  where artist_id = artist.id and name = 'Red Dog Saloon Showcase'
  order by created_at asc
  limit 1
) setlist on true
cross join (values
  ('Full Set Run-Through', date '2026-09-20', time '19:00', time '21:30', 'pre_show_prep', true, array[]::text[], 'Full dress rehearsal. Time the set. Practice transitions.'),
  ('Songwriting Session', date '2026-07-25', time '18:00', time '21:00', 'songwriting', false, array[]::text[], 'Work on new material for second album'),
  ('Vocal Focus Practice', date '2026-07-24', time '19:00', time '20:30', 'specific_songs', false, array['Soul of Gold', 'Great Mystery (333)'], 'Jesse working on vocal dynamics for softer sections')
) as practice(title, practice_date, start_time, end_time, focus_type, uses_show_setlist, songs_to_practice, notes)
where artist.artist_name = 'Sandābādo'
  and not exists (
    select 1 from public.practices existing
    where existing.artist_id = artist.id
      and existing.title = practice.title
      and existing.practice_date = practice.practice_date
      and existing.start_time = practice.start_time
  );

insert into public.meetings (
  title, meeting_type, scheduled_date, start_time, end_time, format, location,
  attendee_externals, agenda, status, artist_id
)
select
  'Pre-Show Strategy Meeting', 'pre_show_prep', date '2026-09-22',
  time '18:00', time '19:00', 'in_person', 'Whole Body Studios',
  array['Jesse', 'Palo', 'Ben Sokler'],
  array['Finalize setlist', 'Confirm load-in plan', 'Promo status review', 'Merch strategy'],
  'scheduled', artist.id
from public.artists artist
where artist.artist_name = 'Sandābādo'
  and not exists (
    select 1 from public.meetings existing
    where existing.artist_id = artist.id
      and existing.title = 'Pre-Show Strategy Meeting'
      and existing.scheduled_date = date '2026-09-22'
      and existing.start_time = time '18:00'
  );

insert into public.gear_inventory (
  artist_id, item_name, category, brand, model, owner, condition,
  needs_repair, repair_notes, estimated_value_cents
)
select
  artist.id, gear.item_name, gear.category, gear.brand, gear.model,
  gear.owner, gear.condition, gear.needs_repair, gear.repair_notes,
  gear.estimated_value_cents
from public.artists artist
cross join (values
  ('Fender Telecaster Deluxe', 'guitar', 'Fender', 'Telecaster Deluxe', 'Jesse', 'good', false, null::text, 120000::bigint),
  ('Ludwig Classic Maple Kit', 'drums', 'Ludwig', 'Classic Maple Kit', 'Band', 'excellent', false, null::text, 350000::bigint),
  ('Fender Twin Reverb', 'amp', 'Fender', 'Twin Reverb', 'Palo', 'fair', true, 'Needs reverb tank.', 90000::bigint),
  ('Boss DD-7 Delay Pedal', 'pedal', 'Boss', 'DD-7 Delay Pedal', 'Jesse', 'excellent', false, null::text, 15000::bigint),
  ('Shure SM58', 'mic', 'Shure', 'SM58', 'Band', 'good', false, null::text, 10000::bigint)
) as gear(item_name, category, brand, model, owner, condition, needs_repair, repair_notes, estimated_value_cents)
where artist.artist_name = 'Sandābādo'
  and not exists (
    select 1 from public.gear_inventory existing
    where existing.artist_id = artist.id
      and existing.item_name = gear.item_name
      and coalesce(existing.owner, '') = coalesce(gear.owner, '')
  );

insert into public.stage_plots (
  artist_id, name, inputs, stage_layout, member_positions, power_requirements,
  is_active, version
)
select
  artist.id,
  'Sandābādo Standard Stage Plot',
  '[
    {"channel": 1, "instrument": "Kick Drum", "mic": "Beta 91", "stand": "Short boom", "phantom": false},
    {"channel": 2, "instrument": "Snare", "mic": "SM57", "stand": "Straight", "phantom": false},
    {"channel": 3, "instrument": "Hi-Hat", "mic": "SM57", "stand": "Boom", "phantom": false},
    {"channel": 4, "instrument": "Tom 1", "mic": "Sennheiser e604", "stand": "Clip", "phantom": false},
    {"channel": 5, "instrument": "Tom 2", "mic": "Sennheiser e604", "stand": "Clip", "phantom": false},
    {"channel": 6, "instrument": "Floor Tom", "mic": "Sennheiser e604", "stand": "Clip", "phantom": false},
    {"channel": 7, "instrument": "Overhead L", "mic": "KM184", "stand": "Boom", "phantom": true},
    {"channel": 8, "instrument": "Overhead R", "mic": "KM184", "stand": "Boom", "phantom": true},
    {"channel": 9, "instrument": "Bass DI", "mic": "DI Box", "stand": null, "phantom": false},
    {"channel": 10, "instrument": "Guitar 1", "mic": "SM57", "stand": "Straight", "phantom": false},
    {"channel": 11, "instrument": "Lead Vocal", "mic": "Beta 58", "stand": "Boom", "phantom": false}
  ]'::jsonb,
  'Drums center-back, guitar stage right, bass stage left, vocals front center',
  '[
    {"name": "Jesse", "position": "Center-front", "instrument": "Vocals/Guitar"},
    {"name": "Palo", "position": "Stage right", "instrument": "Guitar/Vocals"},
    {"name": "[Bassist]", "position": "Stage left", "instrument": "Bass"}
  ]'::jsonb,
  '4x 20A circuits, stage left',
  true,
  1
from public.artists artist
where artist.artist_name = 'Sandābādo'
  and not exists (
    select 1 from public.stage_plots existing
    where existing.artist_id = artist.id
      and existing.name = 'Sandābādo Standard Stage Plot'
  );

-- Ready reflects the supplied operational status. File, thumbnail, external,
-- and share URLs intentionally remain null until a real private asset exists.
insert into public.promo_materials (
  artist_id, deal_id, material_type, title, platform, dimensions, status
)
select
  artist.id, deal.id, material.material_type, material.title,
  material.platform, material.dimensions, 'ready'
from public.artists artist
join public.deals deal on deal.artist_id = artist.id and deal.event_date = date '2026-09-26'
cross join (values
  ('poster', 'Poster', 'instagram', '1080×1350'),
  ('instagram_post', 'Instagram Post', 'instagram', '1080×1350'),
  ('epk', 'EPK', null::text, 'PDF')
) as material(material_type, title, platform, dimensions)
where artist.artist_name = 'Sandābādo'
  and not exists (
    select 1 from public.promo_materials existing
    where existing.artist_id = artist.id
      and existing.deal_id = deal.id
      and existing.material_type = material.material_type
      and existing.title = material.title
  );
