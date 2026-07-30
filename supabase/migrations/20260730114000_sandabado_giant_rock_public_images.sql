-- Register the verified Giant Rock public derivatives with Sandābādo's
-- existing ØDIN artist record. The public mirror trigger refreshes the
-- published artist profile after each insert.

with target_artist as (
  select id
  from public.artists
  where slug = 'sandabado'
  limit 1
),
approved_image (url, alt_text, image_type, sort_order) as (
  values
    (
      'https://umoapqrkcabmdvkmdnqv.supabase.co/storage/v1/object/public/records-public/artists/sandabado/giant-rock/sandabado-giant-rock-monolith-performance.jpg',
      'Sandābādo performing beneath the Giant Rock monolith',
      'landscape',
      10
    ),
    (
      'https://umoapqrkcabmdvkmdnqv.supabase.co/storage/v1/object/public/records-public/artists/sandabado/giant-rock/sandabado-giant-rock-duo-performance.jpg',
      'Sandābādo performing as a duo at Giant Rock',
      'live',
      20
    ),
    (
      'https://umoapqrkcabmdvkmdnqv.supabase.co/storage/v1/object/public/records-public/artists/sandabado/giant-rock/sandabado-giant-rock-solo-night.jpg',
      'Sandābādo performing solo at night at Giant Rock',
      'press',
      30
    )
)
insert into public.artist_images (
  artist_id,
  url,
  alt_text,
  image_type,
  sort_order,
  public_visible
)
select
  target_artist.id,
  approved_image.url,
  approved_image.alt_text,
  approved_image.image_type,
  approved_image.sort_order,
  true
from target_artist
cross join approved_image
where not exists (
  select 1
  from public.artist_images as existing
  where existing.artist_id = target_artist.id
    and existing.url = approved_image.url
);
