-- Initial band-facing working artifacts for the September 26 Sandābādo showcase.
insert into public.setlists (artist_id, name, description, deal_id, target_duration_minutes, estimated_duration_minutes, is_template, status, transition_notes, encore)
select artist.id, 'Red Dog Saloon Showcase', 'Working showcase set for the September 26 album reveal.', deal.id, 45, 43, false, 'draft', 'After Great Mystery, Jesse talks to the room briefly. Tune down before Soul Of Gold.', array['Jesus Says To Groove (Reprise)']
from public.artists artist
left join public.deals deal on deal.artist_id = artist.id and deal.event_date = '2026-09-26'
where artist.artist_name = 'Sandābādo'
  and not exists (select 1 from public.setlists existing where existing.artist_id = artist.id and existing.name = 'Red Dog Saloon Showcase');

insert into public.setlist_items (setlist_id, position, song_title, song_key, tempo_bpm, duration_seconds, notes, lead_vocalist, is_opener, is_closer, set_break_before)
select setlist.id, item.position, item.song_title, item.song_key, item.tempo_bpm, item.duration_seconds, item.notes, 'Jesse', item.is_opener, item.is_closer, item.set_break_before
from public.setlists setlist
cross join (values
  (1, 'Jesus Says To Groove', 'Am', 102, 220, 'Start with just drums; guitar riff at 0:15.', true, false, false),
  (2, 'Great Mystery (333)', 'Em', 94, 229, 'Fade directly from track 1; no pause.', false, false, false),
  (3, 'Think Say Do', 'G', 108, 217, 'Take a two-minute reset before this song.', false, false, true),
  (4, 'Soul Of Gold', 'Dm', 86, 257, 'Closer. Extended jam outro.', false, true, false)
) as item(position, song_title, song_key, tempo_bpm, duration_seconds, notes, is_opener, is_closer, set_break_before)
where setlist.name = 'Red Dog Saloon Showcase'
  and not exists (select 1 from public.setlist_items existing where existing.setlist_id = setlist.id and existing.position = item.position);

insert into public.show_run_sheets (deal_id, artist_id, venue_address, load_in_time, soundcheck_time, doors_open_time, set_start_time, set_duration_minutes, set_end_time, curfew_time, backline_provided, band_brings, status, promo_assets_ready, settlement_notes)
select deal.id, artist.id, 'Morongo Valley, CA', '16:00', '17:00', '18:30', '20:00', 45, '21:00', '22:00', array[]::text[], array['Guitars', 'Pedals', 'Cymbals', 'Merch'], 'draft', false, 'Working run sheet. Confirm day-of contacts, load-in, backline, and settlement details with the venue.'
from public.artists artist join public.deals deal on deal.artist_id = artist.id and deal.event_date = '2026-09-26'
where artist.artist_name = 'Sandābādo'
  and not exists (select 1 from public.show_run_sheets existing where existing.deal_id = deal.id);
