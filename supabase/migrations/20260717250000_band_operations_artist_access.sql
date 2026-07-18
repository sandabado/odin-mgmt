-- Artist-side access for the Band Operations Toolkit. Operations retains full
-- control, while an artist can only see or manage records attached to their own field.

create policy "setlists artists manage own" on public.setlists
for all to authenticated
using (exists (select 1 from public.artists where artists.id = setlists.artist_id and artists.profile_id = auth.uid()))
with check (exists (select 1 from public.artists where artists.id = setlists.artist_id and artists.profile_id = auth.uid()));

create policy "setlist items artists manage own" on public.setlist_items
for all to authenticated
using (exists (select 1 from public.setlists join public.artists on artists.id = setlists.artist_id where setlists.id = setlist_items.setlist_id and artists.profile_id = auth.uid()))
with check (exists (select 1 from public.setlists join public.artists on artists.id = setlists.artist_id where setlists.id = setlist_items.setlist_id and artists.profile_id = auth.uid()));

create policy "practices artists manage own" on public.practices
for all to authenticated
using (exists (select 1 from public.artists where artists.id = practices.artist_id and artists.profile_id = auth.uid()))
with check (exists (select 1 from public.artists where artists.id = practices.artist_id and artists.profile_id = auth.uid()));

create policy "stage plots artists manage own" on public.stage_plots
for all to authenticated
using (exists (select 1 from public.artists where artists.id = stage_plots.artist_id and artists.profile_id = auth.uid()))
with check (exists (select 1 from public.artists where artists.id = stage_plots.artist_id and artists.profile_id = auth.uid()));

create policy "gear artists manage own" on public.gear_inventory
for all to authenticated
using (exists (select 1 from public.artists where artists.id = gear_inventory.artist_id and artists.profile_id = auth.uid()))
with check (exists (select 1 from public.artists where artists.id = gear_inventory.artist_id and artists.profile_id = auth.uid()));

create policy "run sheets artists read own" on public.show_run_sheets
for select to authenticated
using (exists (select 1 from public.artists where artists.id = show_run_sheets.artist_id and artists.profile_id = auth.uid()));

create policy "promo artists read own" on public.promo_materials
for select to authenticated
using (exists (select 1 from public.artists where artists.id = promo_materials.artist_id and artists.profile_id = auth.uid()));

create policy "meetings artists read relevant" on public.meetings
for select to authenticated
using (
  exists (select 1 from public.artists where artists.id = meetings.artist_id and artists.profile_id = auth.uid())
  or auth.uid() = any(meetings.attendee_profiles)
);

create policy "meetings artists create own" on public.meetings
for insert to authenticated
with check (exists (select 1 from public.artists where artists.id = meetings.artist_id and artists.profile_id = auth.uid()));

create policy "meetings artists update own" on public.meetings
for update to authenticated
using (exists (select 1 from public.artists where artists.id = meetings.artist_id and artists.profile_id = auth.uid()))
with check (exists (select 1 from public.artists where artists.id = meetings.artist_id and artists.profile_id = auth.uid()));

create policy "meetings artists delete own" on public.meetings
for delete to authenticated
using (exists (select 1 from public.artists where artists.id = meetings.artist_id and artists.profile_id = auth.uid()));
