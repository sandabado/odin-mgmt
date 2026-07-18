-- Demonstration Artist Studio data. This is intentionally operational but does
-- not create a fake booking, contract, revenue entry, or payout.

insert into public.artists (artist_name, genres, draw_size, home_market, music_links, bio, status)
values (
  'Palo Xanto',
  array['electronic', 'tribal', 'downtempo'],
  60,
  'desert',
  array[]::text[],
  'Demonstration artist record for the Ødin Studio workflow. Electronic, tribal, and downtempo production rooted in the desert.',
  'active'
)
on conflict do nothing;

insert into public.projects (project_code, title, artist_id, status, target_release_date, investment_cents, notes)
select
  'PALO-FIELD-2026',
  'Palo Xanto — Field Signal EP',
  artist.id,
  'in_progress',
  '2026-11-07',
  600000,
  'Demonstration project for the Artist Studio. Replace with the live project brief when ready.'
from public.artists as artist
where artist.artist_name = 'Palo Xanto'
on conflict do nothing;

insert into public.project_timeline (project_id, phase, status, owner_arm, start_date, budget_allocated_cents, budget_spent_cents, notes)
select project.id, 'mixing', 'in_progress', 'engineering', '2026-07-01', 600000, 225000, 'Demo mixing phase for the Studio workflow.'
from public.projects as project
where project.project_code = 'PALO-FIELD-2026'
  and not exists (select 1 from public.project_timeline as timeline where timeline.project_id = project.id and timeline.phase = 'mixing');

insert into public.engineering_sessions (project_id, session_date, engineer_name, hours, cost_cents, notes)
select project.id, '2026-07-12', 'Demo Engineer', 4, 45000, 'Demonstration mix review session.'
from public.projects as project
where project.project_code = 'PALO-FIELD-2026'
  and not exists (select 1 from public.engineering_sessions as session where session.project_id = project.id and session.session_date = '2026-07-12');

insert into public.release_tracks (project_id, title, distribution_platforms)
select project.id, track.title, array['Spotify', 'Apple Music', 'Bandcamp']
from public.projects as project
cross join (values ('Desert Current'), ('Signal Fire'), ('Night Bloom')) as track(title)
where project.project_code = 'PALO-FIELD-2026'
  and not exists (select 1 from public.release_tracks as existing where existing.project_id = project.id and existing.title = track.title);
